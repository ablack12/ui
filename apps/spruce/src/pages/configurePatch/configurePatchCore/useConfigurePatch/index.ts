import { useEffect, useReducer } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { getPatchRoute, slugs } from "constants/routes";
import {
  ConfigurePatchQuery,
  ParameterInput,
  VariantTask,
} from "gql/generated/types";
import { useTabShortcut } from "hooks/useTabShortcut";
import { PatchTab } from "types/patch";
import { convertArrayToObject, mapStringArrayToObject } from "utils/array";
import { parseQueryString } from "utils/queryString";
import { omitTypename } from "utils/string";
import { AliasState, PatchTriggerAlias, VariantTasksState } from "./types";

type ConfigurePatchState = {
  description: string;
  selectedAliases: AliasState;
  selectedBuildVariants: string[];
  selectedBuildVariantTasks: VariantTasksState;
  patchParams: ParameterInput[];
  selectedTab: number;
  disableBuildVariantSelect: boolean;
};

type Action =
  | { type: "setDescription"; description: string }
  | { type: "setSelectedBuildVariants"; buildVariants: string[] }
  | { type: "setPatchParams"; params: ParameterInput[] }
  | { type: "setSelectedBuildVariantTasks"; variantTasks: VariantTasksState }
  | { type: "setSelectedTab"; tabIndex: number }
  | {
      type: "updatePatchData";
      description: string;
      buildVariants: string[];
      params: ParameterInput[];
      variantTasks: VariantTasksState;
      aliases: AliasState;
    }
  | {
      type: "setSelectedAliases";
      aliases: AliasState;
    };

const initialState = ({ selectedTab = 0 }: { selectedTab: number }) => ({
  description: "",
  selectedAliases: {},
  selectedBuildVariants: [],
  selectedBuildVariantTasks: {},
  patchParams: null,
  selectedTab,
  // @ts-expect-error: FIXME. This comment was added by an automated script.
  disableBuildVariantSelect: tabToIndexMap[selectedTab] === PatchTab.Tasks,
});

const reducer = (state: ConfigurePatchState, action: Action) => {
  switch (action.type) {
    case "setDescription":
      return {
        ...state,
        description: action.description,
      };
    case "setSelectedBuildVariants":
      return {
        ...state,
        selectedBuildVariants: action.buildVariants.sort((a, b) =>
          b.localeCompare(a),
        ),
      };
    case "setSelectedBuildVariantTasks":
      return {
        ...state,
        selectedBuildVariantTasks: action.variantTasks,
      };
    case "setSelectedAliases":
      return {
        ...state,
        selectedAliases: action.aliases,
      };
    case "setPatchParams":
      return {
        ...state,
        patchParams: omitTypename(action.params),
      };
    case "setSelectedTab": {
      let tab = indexToTabMap.indexOf(PatchTab.Tasks);
      if (action.tabIndex !== -1 && action.tabIndex < indexToTabMap.length) {
        tab = action.tabIndex;
      }
      return {
        ...state,
        selectedTab: tab,
        disableBuildVariantSelect:
          indexToTabMap[action.tabIndex] !== PatchTab.Tasks,
      };
    }
    case "updatePatchData":
      return {
        ...state,
        description: action.description,
        selectedBuildVariants: action.buildVariants,
        patchParams: omitTypename(action.params),
        selectedBuildVariantTasks: action.variantTasks,
        selectedAliases: action.aliases,
      };

    default:
      throw new Error("Unknown action type");
  }
};

const indexToTabMap = [PatchTab.Tasks, PatchTab.Changes, PatchTab.Parameters];

const tabToIndexMap = {
  [PatchTab.Tasks]: 0,
  [PatchTab.Changes]: 1,
  [PatchTab.Parameters]: 2,
};

interface HookResult extends ConfigurePatchState {
  setDescription: (description: string) => void;
  setPatchParams: (patchParams: ParameterInput[]) => void;
  setSelectedBuildVariants: (variants: string[]) => void;
  setSelectedBuildVariantTasks: (variantTasks: VariantTasksState) => void;
  setSelectedAliases: (aliases: AliasState) => void;
  setSelectedTab: React.Dispatch<React.SetStateAction<number>>;
}

const useConfigurePatch = (patch: ConfigurePatchQuery["patch"]): HookResult => {
  const navigate = useNavigate();
  const location = useLocation();
  // @ts-expect-error: FIXME. This comment was added by an automated script.
  const { [slugs.tab]: tab } = useParams<{ [slugs.tab]: PatchTab | null }>();

  const { id, project } = patch;
  // @ts-expect-error: FIXME. This comment was added by an automated script.
  const { variants } = project;
  const [state, dispatch] = useReducer(
    reducer,
    initialState({
      // @ts-expect-error: FIXME. This comment was added by an automated script.
      selectedTab: tabToIndexMap[tab || PatchTab.Configure],
    }),
  );

  const { selectedTab } = state;

  useEffect(() => {
    const query = parseQueryString(location.search);
    navigate(
      getPatchRoute(id, {
        configure: true,
        tab: indexToTabMap[selectedTab],
        ...query,
      }),
      { replace: true },
    );
  }, [selectedTab]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (patch) {
      dispatch({
        type: "updatePatchData",
        description: patch.description,
        buildVariants: [variants[0]?.name],
        params: patch.parameters,
        variantTasks: initializeTaskState(variants, patch.variantsTasks),
        aliases: initializeAliasState(patch.patchTriggerAliases),
      });
    }
  }, [patch, variants]);

  const setDescription = (description: string) =>
    dispatch({ type: "setDescription", description });
  const setSelectedBuildVariants = (buildVariants: string[]) =>
    dispatch({ type: "setSelectedBuildVariants", buildVariants });
  const setSelectedBuildVariantTasks = (variantTasks: VariantTasksState) =>
    dispatch({
      type: "setSelectedBuildVariantTasks",
      variantTasks,
    });
  const setSelectedAliases = (aliases: AliasState) =>
    dispatch({
      type: "setSelectedAliases",
      aliases,
    });
  const setSelectedTab = (i: number) =>
    dispatch({ type: "setSelectedTab", tabIndex: i });
  const setPatchParams = (params: ParameterInput[]) =>
    dispatch({ type: "setPatchParams", params });

  useTabShortcut({
    currentTab: selectedTab,
    numTabs: indexToTabMap.length,
    setSelectedTab,
  });

  return {
    ...state,
    setDescription,
    setPatchParams,
    setSelectedAliases,
    setSelectedBuildVariants,
    setSelectedBuildVariantTasks,
    // @ts-expect-error: FIXME. This comment was added by an automated script.
    setSelectedTab,
  };
};

// Takes in variant tasks and default selected tasks and returns an object
// With merged variant and default selected tasks auto selected.
const initializeTaskState = (
  // @ts-expect-error: FIXME. This comment was added by an automated script.
  variantTasks: ConfigurePatchQuery["patch"]["project"]["variants"],
  defaultSelectedTasks: VariantTask[],
) => {
  const defaultTasks = convertArrayToObject(defaultSelectedTasks, "name");
  return variantTasks.reduce(
    // @ts-expect-error: FIXME. This comment was added by an automated script.
    (prev, { name: variant, tasks }) => ({
      ...prev,
      [variant]: {
        ...mapStringArrayToObject(tasks, false),
        ...(defaultTasks[variant]
          ? mapStringArrayToObject(defaultTasks[variant].tasks, true)
          : {}),
      },
    }),
    {},
  );
};

const initializeAliasState = (patchTriggerAliases: PatchTriggerAlias[]) =>
  patchTriggerAliases.reduce(
    (prev, { alias }) => ({
      ...prev,
      [alias]: false,
    }),
    {},
  );

export default useConfigurePatch;
