import { AsyncIf } from "@/components/AsyncIf";
import { MarkdownPartial } from "@/components/markdown/MarkdownPartial";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";
import { Button } from "@/components/ui/button";
import JobListingBadges from "@/features/jobListings/components/JobListingBadges";
import { getJobListingIdTag } from "@/features/jobListings/db/cache/jobListings";
import { jobListingsRepository } from "@/features/jobListings/db/jobListings.repository";
import { ClerkConfiguration } from "@/services/clerk/lib/ClerkConfiguration";
import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth";
import { hasOrgUserPermission } from "@/services/clerk/lib/orgUserPermissions";
import { SquarePen } from "lucide-react";
import { cacheTag } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

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

async function getJobListing(jobListingId: string, orgId: string) {
  "use cache";
  cacheTag(getJobListingIdTag(jobListingId));
  return await jobListingsRepository.getById(jobListingId, orgId);
}
