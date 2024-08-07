import styled from "@emotion/styled";
import Badge from "@leafygreen-ui/badge";
import { palette } from "@leafygreen-ui/palette";
import { useUserPatchesAnalytics, useProjectPatchesAnalytics } from "analytics";
import { GroupedTaskStatusBadge } from "components/GroupedTaskStatusBadge";
import { PatchStatusBadge } from "components/PatchStatusBadge";
import { StyledRouterLink } from "components/styles";
import { unlinkedPRUsers } from "constants/patch";
import {
  getProjectPatchesRoute,
  getVersionRoute,
  getUserPatchesRoute,
} from "constants/routes";
import { mapUmbrellaStatusToQueryParam } from "constants/task";
import { fontSize, size } from "constants/tokens";
import { PatchesPagePatchesFragment } from "gql/generated/types";
import { useDateFormat } from "hooks";
import { PatchStatus } from "types/patch";
import { Unpacked } from "types/utils";
import { isPatchUnconfigured } from "utils/patch";
import { groupStatusesByUmbrellaStatus } from "utils/statuses";
import { DropdownMenu } from "./DropdownMenu";

type PatchType = Unpacked<PatchesPagePatchesFragment["patches"]>;
const { gray } = palette;

interface PatchCardProps {
  pageType: "project" | "user";
  isPatchOnCommitQueue: boolean;
  patch: PatchType;
}

const PatchCard: React.FC<PatchCardProps> = ({
  isPatchOnCommitQueue,
  pageType,
  patch,
}) => {
  const getDateCopy = useDateFormat();
  const userPatchesAnalytics = useUserPatchesAnalytics();
  const projectPatchesAnalytics = useProjectPatchesAnalytics();
  const analytics =
    pageType === "project" ? projectPatchesAnalytics : userPatchesAnalytics;
  const {
    activated,
    alias,
    author,
    authorDisplayName,
    canEnqueueToCommitQueue,
    createTime,
    description,
    hidden,
    id,
    projectIdentifier,
    projectMetadata,
    status,
    versionFull,
  } = patch;
  // @ts-expect-error: FIXME. This comment was added by an automated script.
  const createDate = new Date(createTime);
  const { id: versionId, taskStatusStats } = versionFull || {};
  const { stats } = groupStatusesByUmbrellaStatus(
    taskStatusStats?.counts ?? [],
  );
  // @ts-expect-error: FIXME. This comment was added by an automated script.
  const isUnconfigured = isPatchUnconfigured({ alias, activated });
  let patchProject = null;
  if (pageType === "project") {
    patchProject = unlinkedPRUsers.has(author) ? (
      authorDisplayName
    ) : (
      <StyledRouterLink
        to={getUserPatchesRoute(author)}
        data-cy="user-patches-link"
      >
        <strong>{authorDisplayName}</strong>
      </StyledRouterLink>
    );
  } else {
    patchProject = projectIdentifier ? (
      <StyledRouterLink
        to={getProjectPatchesRoute(projectIdentifier)}
        data-cy="project-patches-link"
      >
        <strong>{projectIdentifier}</strong>
      </StyledRouterLink>
    ) : (
      `${projectMetadata?.owner}/${projectMetadata?.repo}`
    );
  }

  const badges = stats?.map(({ count, statusCounts, umbrellaStatus }) => (
    <GroupedTaskStatusBadge
      status={umbrellaStatus}
      count={count}
      statusCounts={statusCounts}
      // @ts-expect-error: FIXME. This comment was added by an automated script.
      href={getVersionRoute(versionId, {
        statuses: mapUmbrellaStatusToQueryParam[umbrellaStatus],
      })}
      key={`${versionId}_${umbrellaStatus}`}
    />
  ));
  return (
    <CardWrapper data-cy="patch-card">
      <Left>
        <DescriptionLink
          data-cy="patch-card-patch-link"
          to={getVersionRoute(id)}
          onClick={() => analytics.sendEvent({ name: "Clicked patch link" })}
        >
          {description || "no description"}
        </DescriptionLink>
        <TimeAndProject>
          {getDateCopy(createDate)} {pageType === "project" ? "by" : "on"}{" "}
          {patchProject}
        </TimeAndProject>
      </Left>
      <Center>
        <PatchBadgeContainer>
          <PatchStatusBadge
            status={
              isUnconfigured
                ? PatchStatus.Unconfigured
                : versionFull?.status ?? status
            }
          />
        </PatchBadgeContainer>
        <TaskBadgeContainer>{badges}</TaskBadgeContainer>
      </Center>
      <Right>
        {hidden && <Badge data-cy="hidden-badge">Hidden</Badge>}
        <DropdownMenu
          patchId={id}
          canEnqueueToCommitQueue={canEnqueueToCommitQueue}
          isPatchOnCommitQueue={isPatchOnCommitQueue}
          isPatchHidden={hidden}
          patchDescription={description}
          hasVersion={!!versionId}
        />
      </Right>
    </CardWrapper>
  );
};

const TaskBadgeContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  > * {
    margin-right: ${size.s};
  }
  flex-wrap: wrap;
`;

const CardWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${size.s} ${size.xxs};
  border-bottom: 1px solid ${gray.light2};
`;

const Center = styled.div`
  display: flex;
  flex: 1 1 0;
`;

const Left = styled(Center)`
  flex-direction: column;
  padding-right: ${size.m};
`;

const Right = styled.div`
  width: 110px;
  display: flex;
  justify-content: flex-end;
  gap: ${size.xs};
`;

const DescriptionLink = styled(StyledRouterLink)`
  font-size: ${fontSize.l};
  font-weight: 500;
  padding-bottom: ${size.xs};
`;

const PatchBadgeContainer = styled.div`
  margin-right: ${size.m};
  min-width: ${size.xxl};
`;

const TimeAndProject = styled.div`
  color: ${gray.base};
`;

export default PatchCard;
