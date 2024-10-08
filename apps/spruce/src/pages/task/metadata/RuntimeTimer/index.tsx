import { MetadataItem, MetadataLabel } from "components/MetadataCard";
import { useRunningTime } from "hooks";
import { string } from "utils";

const { msToDuration } = string;

interface RuntimeTimerProps {
  startTime: Date;
}
const RuntimeTimer: React.FC<RuntimeTimerProps> = ({ startTime }) => {
  const parsedStartTime = new Date(startTime);

  const { runningTime } = useRunningTime(parsedStartTime);

  return (
    <MetadataItem data-cy="task-metadata-running-time">
      <MetadataLabel>Running Time:</MetadataLabel> {msToDuration(runningTime)}
    </MetadataItem>
  );
};

export default RuntimeTimer;
