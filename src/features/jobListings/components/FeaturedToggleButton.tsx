import { ActionButton } from "@/components/ActionButton";
import { AsyncIf } from "@/components/AsyncIf";
import UpgradePopover from "@/components/UpgradePopover";
import { toggleJobListingFeatured } from "@/features/jobListings/actions/actions";
import { hasReachedMaxFeaturedJobListings } from "@/features/jobListings/lib/planFeatureHelpers";
import { ClerkConfiguration } from "@/services/clerk/lib/ClerkConfiguration";
import { hasOrgUserPermission } from "@/services/clerk/lib/orgUserPermissions";
import { StarIcon, StarOffIcon } from "lucide-react";

export default function FeaturedToggleButton({
  jobListingId,
  isFeatured,
}: {
  jobListingId: string;
  isFeatured: boolean;
}) {
  const toggleButton = (
    <ActionButton
      /* DEV: Server Actions must be passed directly to action
		Wrapping them in another function makes it a client-side function
		Next.js cannot serialize or detect it as a Server Action.
		Bind Keeps the function as a Server Action */
      action={toggleJobListingFeatured.bind(null, jobListingId)}
      variant={"outline"}
      requireAreYouSure={!isFeatured}
      areYouSureDescription="This will immediately feature this job listing."
    >
      {featureToggleButtonText(isFeatured)}
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
      {isFeatured ? (
        toggleButton
      ) : (
        <AsyncIf
          condition={async () => {
            // There might be a case where the user has Featured{x}JobListings plan feature.
            // Based on x or whether he has a plan feature of this kind, we need to let him or not let him feature the jobListing
            const hasMaxed = await hasReachedMaxFeaturedJobListings();
            // TODO: feature / unfeature and re-feature shows dialog because teh cache still sees jobListing as featured
            console.log("FeaturedToggleButton - hasMaxed:", hasMaxed);
            return !hasMaxed;
          }}
          otherwise={
            <UpgradePopover
              buttonText={featureToggleButtonText(isFeatured)}
              popoverText={
                "You must upgrade your plan to feature more job listings"
              }
            />
          }
        >
          {toggleButton}
        </AsyncIf>
      )}
    </AsyncIf>
  );
}

function featureToggleButtonText(isFeatured: boolean) {
  if (isFeatured) {
    return (
      <>
        <StarOffIcon className="size-4" /> UnFeature
      </>
    );
  } else {
    return (
      <>
        <StarIcon className="size-4" /> Feature
      </>
    );
  }
}
