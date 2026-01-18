import { getJobListingsOrganizationTag } from "@/features/jobListings/db/cache/jobListings";
import { jobListingsRepository } from "@/features/jobListings/db/jobListings.repository";
import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth";
import { cacheTag } from "next/cache";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default function EmployerHomePage() {
  return (
    <Suspense>
      <SuspendedContent />
    </Suspense>
  );
}

async function SuspendedContent() {
  const { orgId } = await getCurrentOrganization();
  if (orgId === null || orgId === undefined) return null;

  const jobListing = await getMostRecentByOrganization(orgId);
  if (jobListing === undefined) {
    redirect("/employer/job-listings/new");
  } else {
    redirect(`/employer/job-listings/${jobListing.id}`);
  }
}

async function getMostRecentByOrganization(orgId: string) {
  "use cache";

  cacheTag(getJobListingsOrganizationTag(orgId)); // always get cached data

  return await jobListingsRepository.getMostRecentByOrganization(orgId);
}
