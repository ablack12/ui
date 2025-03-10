import { useState } from "react";
import styled from "@emotion/styled";
import TextInput from "@leafygreen-ui/text-input";
import { Description } from "@leafygreen-ui/typography";
import { size } from "@evg-ui/lib/constants/tokens";
import { useProjectHealthAnalytics } from "analytics/projectHealth/useProjectHealthAnalytics";
import { DropdownItem } from "components/ButtonDropdown";
import { ConfirmationModal } from "components/ConfirmationModal";
import { useQueryParams } from "hooks/useQueryParam";
import { MainlineCommitQueryParams } from "types/commits";

interface GitCommitSearchProps {
  setMenuOpen: (open: boolean) => void;
}

export const GitCommitSearch: React.FC<GitCommitSearchProps> = ({
  setMenuOpen,
}) => {
  const { sendEvent } = useProjectHealthAnalytics({ page: "Commit chart" });
  const [, setQueryParams] = useQueryParams();

  const [modalOpen, setModalOpen] = useState(false);
  const [commitHash, setCommitHash] = useState("");

  const onCancel = () => {
    setModalOpen(false);
    setMenuOpen(false);
  };

  const onConfirm = () => {
    sendEvent({ name: "Filtered for git commit", commit: commitHash });
    setQueryParams({
      [MainlineCommitQueryParams.Revision]: commitHash,
    });
    onCancel();
  };

  return (
    <>
      <DropdownItem
        data-cy="git-commit-search"
        onClick={() => {
          setModalOpen(true);
          sendEvent({ name: "Viewed git commit search modal" });
        }}
      >
        Search by Git Hash
      </DropdownItem>
      <ConfirmationModal
        cancelButtonProps={{
          onClick: onCancel,
        }}
        confirmButtonProps={{
          children: "Submit",
          // Force user to input at least 7 characters of the hash.
          disabled: commitHash.trim().length < 7,
          onClick: onConfirm,
        }}
        data-cy="git-commit-search-modal"
        open={modalOpen}
        title="Search by Git Commit Hash"
      >
        <StyledDescription>
          Note: This is an experimental feature that works best without any
          filters. Searching for a git hash will clear all applied filters.
        </StyledDescription>
        <TextInput
          label="Git Commit Hash"
          onChange={(e) => setCommitHash(e.target.value.trim())}
          onKeyPress={(e) => e.key === "Enter" && onConfirm()}
          value={commitHash}
        />
      </ConfirmationModal>
    </>
  );
};

const StyledDescription = styled(Description)`
  margin-bottom: ${size.xs};
`;
