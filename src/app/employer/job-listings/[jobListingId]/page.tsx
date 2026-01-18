import { ActionButton } from "@/components/ActionButton";
import { AsyncIf } from "@/components/AsyncIf";
import { MarkdownPartial } from "@/components/markdown/MarkdownPartial";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { JobListingStatus } from "@/drizzle/schema";
import {
  getJobListing,
  toggleJobListingFeatured,
  toggleJobListingStatus,
} from "@/features/jobListings/actions/actions";
import JobListingBadges from "@/features/jobListings/components/JobListingBadges";
import {
  hasReachedMaxFeaturedJobListings,
  hasReachedMaxPostedJobListings,
} from "@/features/jobListings/lib/planFeatureHelpers";
import { getNextJobListingStatus } from "@/features/jobListings/lib/utils";
import { ClerkConfiguration } from "@/services/clerk/lib/ClerkConfiguration";
import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth";
import { hasOrgUserPermission } from "@/services/clerk/lib/orgUserPermissions";
import { PopoverTrigger } from "@radix-ui/react-popover";
import {
  EyeIcon,
  EyeOffIcon,
  SquarePen,
  StarIcon,
  StarOffIcon,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReactNode, Suspense } from "react";

interface IProps {
  params: Promise<{ jobListingId: string }>;
}

export default function JobListingPage({ params }: IProps) {
  return (
    <Suspense>
      <SuspendedPage params={params} />
    </Suspense>
  );
}

async function SuspendedPage({ params }: IProps) {
  const { orgId } = await getCurrentOrganization();
  if (!orgId) return null;

  const { jobListingId } = await params;
  const jobListing = await getJobListing(jobListingId, orgId);
  if (!jobListing) return notFound();

  return (
    <div className="space-y-6 max-w-6xl max-auto p-4 @container">
      <div className="flex items-center justify-between gap-4 @max-4xl:flex-col @max-4xl:items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-light">
            {jobListing.title}
          </h1>
          <div className="flex flex-wrap gap-2 mt-2">
            <JobListingBadges jobsListing={jobListing} />
          </div>
        </div>
        <div className="flex items-center gap-2 empty:-mt-4">
          <AsyncIf
            condition={() =>
              hasOrgUserPermission(
                ClerkConfiguration.UserPermissions.JobListings.Update
              )
            }
          >
            <Button asChild variant={"outline"}>
              <Link href={`/employer/job-listings/${jobListingId}/edit`}>
                <SquarePen /> Edit
              </Link>
            </Button>
          </AsyncIf>
          <StatusUpdateButton
            currentStatus={jobListing.status}
            jobListingId={jobListingId}
          />
          {jobListing.status === "published" && (
            <FeaturedToggleButton
              isFeatured={jobListing.isFeatured}
              jobListingId={jobListing.id}
            />
          )}
        </div>
      </div>

      <MarkdownPartial
        mainMarkdown={
          <MarkdownRenderer
            source={jobListing.description}
            className="prose-sm"
          />
        }
        dialogMarkdown={<MarkdownRenderer source={jobListing.description} />}
        dialogTitle={"Decription"}
      />
    </div>
  );
}

/** Button to update the status of a job listing */
function StatusUpdateButton({
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

function FeaturedToggleButton({
  jobListingId,
  isFeatured,
}: {
  jobListingId: string;
  isFeatured: boolean;
}) {
  const toggleButton = (
    <ActionButton
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

function UpgradePopover({
  buttonText,
  popoverText,
}: {
  buttonText: ReactNode;
  popoverText: ReactNode;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={"outline"}>{buttonText}</Button>
      </PopoverTrigger>
      <PopoverContent>
        {popoverText}
        <Button asChild className="mt-2">
          <Link href={"/employer/pricing"}>Upgrade Plan</Link>
        </Button>
      </PopoverContent>
    </Popover>
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
