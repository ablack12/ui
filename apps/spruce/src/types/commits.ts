import { Unpacked } from "@evg-ui/lib/types/utils";
import { MainlineCommitsQuery } from "gql/generated/types";

export enum ProjectFilterOptions {
  BuildVariant = "buildVariants",
  Task = "taskNames",
  Status = "statuses",
  Test = "tests",
  View = "view",
}

export enum ChartToggleQueryParams {
  chartType = "chartType",
  chartOpen = "chartOpen",
}

export enum MainlineCommitQueryParams {
  Requester = "requester",
  SkipOrderNumber = "skipOrderNumber",
  Revision = "revision",
}

export enum ChartTypes {
  Absolute = "absolute",
  Percentage = "percentage",
}

export enum CommitRequesterTypes {
  RepotrackerVersionRequester = "gitter_request",
  TriggerRequester = "trigger_request",
  GitTagRequester = "git_tag_request",
  AdHocRequester = "ad_hoc",
}

// @ts-expect-error: FIXME. This comment was added by an automated script.
export type Commits = MainlineCommitsQuery["mainlineCommits"]["versions"];
export type Commit = Unpacked<Commits>;
export type CommitVersion = Commit["version"];
export type CommitRolledUpVersions = Commit["rolledUpVersions"];
export type BuildVariantDict = {
  [buildVariant: string]: {
    priority: number;
    iconHeight: number;
    badgeHeight: number;
  };
};
