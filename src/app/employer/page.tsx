import { db } from "@/drizzle/db";
import { JobListingTable } from "@/drizzle/schema";
import { getJobListingOrganizationTag } from "@/features/jobListings/db/cache/jobListings";
import { jobListingsRepository } from "@/features/jobListings/db/jobListings.repository";
import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth";
import { desc, eq } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { redirect } from "next/navigation";
import { cache, Suspense } from "react";

export default function EmployerHomePage() {
  return (
    <Suspense>
      <SuspendedContent />
    </Suspense>
  );
}

async function SuspendedContent() {
  const { orgId } = await getCurrentOrganization({ allData: false });
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

  cacheTag(getJobListingOrganizationTag(orgId)); // always get cached data

  return await db.query.JobListingTable.findFirst({
    where: eq(JobListingTable.organizationId, orgId),
    orderBy: desc(JobListingTable.createdAt),
    columns: { id: true },
  });
}
