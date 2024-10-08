import { useState } from "react";
import { useParams } from "react-router-dom";
import { useProjectHealthAnalytics } from "analytics/projectHealth/useProjectHealthAnalytics";
import { DropdownItem } from "components/ButtonDropdown";
import { NotificationModal } from "components/Notifications";
import { slugs } from "constants/routes";
import { waterfallTriggers } from "constants/triggers";
import { subscriptionMethods } from "types/subscription";

interface AddNotificationProps {
  setMenuOpen: (open: boolean) => void;
}

export const AddNotification: React.FC<AddNotificationProps> = ({
  setMenuOpen,
}) => {
  const { [slugs.projectIdentifier]: projectIdentifier } = useParams();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { sendEvent } = useProjectHealthAnalytics({ page: "Commit chart" });
  return (
    <>
      <DropdownItem
        data-cy="add-notification"
        onClick={() => {
          setIsModalVisible(true);
          sendEvent({ name: "Viewed notification modal" });
        }}
      >
        Add Notification
      </DropdownItem>
      <NotificationModal
        data-cy="waterfall-notification-modal"
        onCancel={() => {
          setIsModalVisible(false);
          setMenuOpen(false);
        }}
        // @ts-expect-error: FIXME. This comment was added by an automated script.
        resourceId={projectIdentifier}
        sendAnalyticsEvent={(subscription) =>
          sendEvent({
            name: "Created notification",
            "subscription.type": subscription.subscriber.type || "",
            "subscription.trigger": subscription.trigger || "",
          })
        }
        subscriptionMethods={subscriptionMethods}
        triggers={waterfallTriggers}
        type="project"
        visible={isModalVisible}
      />
    </>
  );
};
