import { ActionButton } from "@/components/ActionButton";
import { AsyncIf } from "@/components/AsyncIf";
import UpgradePopover from "@/components/UpgradePopover";
import { JobListingStatus } from "@/drizzle/schema";
import { toggleJobListingStatus } from "@/features/jobListings/actions/actions";
import { hasReachedMaxPostedJobListings } from "@/features/jobListings/lib/planFeatureHelpers";
import { getNextJobListingStatus } from "@/features/jobListings/lib/utils";
import { ClerkConfiguration } from "@/services/clerk/lib/ClerkConfiguration";
import { hasOrgUserPermission } from "@/services/clerk/lib/orgUserPermissions";
import { EyeIcon, EyeOffIcon } from "lucide-react";

/** Button to update the status of a job listing */
export default function StatusUpdateButton({
  jobListingId,
  currentStatus,
}: {
  jobListingId: string;
  currentStatus: JobListingStatus;
}) {
  const nextStatus = getNextJobListingStatus(currentStatus);

  const toggleButton = (
    <ActionButton
      action={toggleJobListingStatus.bind(null, jobListingId)}
      variant={"outline"}
      requireAreYouSure={nextStatus === "published"}
      areYouSureDescription="This will immediately show this job listing to all users."
    >
      {statusToggleButtonText(currentStatus)}
    </ActionButton>
  );

  return (
    <AsyncIf
      condition={() =>
        hasOrgUserPermission(
          ClerkConfiguration.UserPermissions.JobListings.ChangeStatus
        )
      }
    >
      {nextStatus === "published" ? (
        <AsyncIf
          condition={async () => {
            // There might be a case where the user has Post{x}JobListings plan feature.
            // Based on x or whether he has a plan feature of this kind, we need to let him or not let him post the jobListing
            const hasMaxed = await hasReachedMaxPostedJobListings();
            return !hasMaxed;
          }}
          otherwise={
            <UpgradePopover
              buttonText={statusToggleButtonText(currentStatus)}
              popoverText={
                "You must upgrade your plan to publish more job listings"
              }
            />
          }
        >
          {toggleButton}
        </AsyncIf>
      ) : (
        toggleButton
      )}
    </AsyncIf>
  );
}

function statusToggleButtonText(status: JobListingStatus) {
  switch (status) {
    case "draft":
    case "delisted":
      return (
        <>
          <EyeIcon className="size-4" /> Publish
        </>
      );
    case "published":
      return (
        <>
          <EyeOffIcon className="size-4" /> Delist
        </>
      );
    default:
      throw new Error(`Unknown job listing status ${status satisfies never}`);
  }
}
