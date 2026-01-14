// mandatory
// without it we get the error
// You're importing a component that needs "revalidateTag". That only works in a Server Component which is not supported in the pages/ directory.
// because createJobListing ends up being used in a client component eg JobListingForm.tsx
"use server";

import z from "zod";
import { jobListingsSchema } from "./schemas";
import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth";
import { jobListingsRepository } from "../db/jobListings.repository";
import { redirect } from "next/navigation";
import { cacheTag } from "next/cache";
import { getJobListingIdTag } from "../db/cache/jobListings";
import { db } from "@/drizzle/db";
import { and, eq } from "drizzle-orm";
import { JobListingTable } from "@/drizzle/schema";
import { hasOrgUserPermission } from "@/services/clerk/lib/orgUserPermissions";
import { ClerkConfiguration } from "@/services/clerk/lib/ClerkConfiguration";

export async function createJobListing(unsafeData: z.infer<typeof jobListingsSchema>) {
	// Implementation for creating a job listing
	const { orgId } = await getCurrentOrganization();
	const hasPermission = await hasOrgUserPermission(ClerkConfiguration.UserPermissions.JobListings.Create);
	if (orgId == null || !hasPermission) {
		return {
			error: true,
			message: "You dont have permissions to create a new job listing"
		}
	}

	// We try and make sure that the data are valid before proceeding
	const { success, data } = jobListingsSchema.safeParse(unsafeData);
	if (!success) {
		return {
			error: true,
			message: "The provided data is invalid.",
		}
	}

	const newJobListing = await jobListingsRepository.create({
		...data,
		organizationId: orgId,
		status: "draft",
	});

	redirect(`/employer/job-listings/${newJobListing.id}`);
}

export async function updateJoblisting(jobListingId: string, unsafeData: z.infer<typeof jobListingsSchema>) {
	// Implementation for creating a job listing
	const { orgId } = await getCurrentOrganization();
	const hasPermission = await hasOrgUserPermission(ClerkConfiguration.UserPermissions.JobListings.Update);
	if (orgId == null || !hasPermission) {
		return {
			error: true,
			message: "You dont have permissions to uddate the job listing"
		}
	}

	// We try and make sure that the data are valid before proceeding
	const { success, data } = jobListingsSchema.safeParse(unsafeData);
	if (!success) {
		return {
			error: true,
			message: "The provided data is invalid.",
		}
	}

	const jobListing = await getJobListing(jobListingId, orgId)
	if (jobListing == null) {
		return {
			error: true,
			message: "There was an error updating your job listing",
		}
	}

	const updatedJobListing = await jobListingsRepository.update(jobListingId, orgId, data);

	redirect(`/employer/job-listings/${updatedJobListing.id}`);
}


async function getJobListing(id: string, orgId: string) {
	"use cache"
	cacheTag(getJobListingIdTag(id))

	return db.query.JobListingTable.findFirst({
		where: and(
			eq(JobListingTable.id, id),
			eq(JobListingTable.organizationId, orgId)
		),
	})
}