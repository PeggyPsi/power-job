// mandatory
// without it we get the error
// You're importing a component that needs "revalidateTag". That only works in a Server Component which is not supported in the pages/ directory.
// because createJobListing ends up being used in a client component eg JobListingForm.tsx
"use server";

import z from "zod";
import { jobListingAiSearchSchema, jobListingsSchema } from "./schemas";
import { getCurrentOrganization, getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";
import { jobListingsRepository } from "../db/jobListings.repository";
import { redirect } from "next/navigation";
import { cacheTag } from "next/cache";
import { getJobListingIdTag, getJobListingsGlobalTag } from "../db/cache/jobListings";
import { db } from "@/drizzle/db";
import { and, eq } from "drizzle-orm";
import { JobListingTable } from "@/drizzle/schema";
import { hasOrgUserPermission } from "@/services/clerk/lib/orgUserPermissions";
import { ClerkConfiguration } from "@/services/clerk/lib/ClerkConfiguration";
import { getNextJobListingStatus } from "../lib/utils";
import { hasReachedMaxFeaturedJobListings, hasReachedMaxPostedJobListings } from "../lib/planFeatureHelpers";
import getMatchingJobListings from "@/services/inngest/ai/getMatchingJobListings";

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

	const updatedJobListing = await jobListingsRepository.update(jobListingId, data);

	redirect(`/employer/job-listings/${updatedJobListing.id}`);
}

export async function toggleJobListingStatus(id: string) {
	// TODO: create an MethodError type
	const error = {
		error: true,
		message: "You dont have permissions to change the job listing status"
	}

	const { orgId } = await getCurrentOrganization();
	const hasPermission = await hasOrgUserPermission(ClerkConfiguration.UserPermissions.JobListings.ChangeStatus);
	if (orgId == null || !hasPermission) return error

	const jobListing = await getJobListing(id, orgId)
	if (jobListing == null) return error;

	const nextStatus = getNextJobListingStatus(jobListing.status);
	const hasMaxed = await hasReachedMaxPostedJobListings();
	if (nextStatus === "published" && hasMaxed) return error;

	await jobListingsRepository.updateStatus(id, {
		status: nextStatus,
		isFeatured: nextStatus === "published" ? false : true,
		postedAt: nextStatus === "published" && jobListing.postedAt === null ? new Date() : null,
	});

	return { error: false }
}

export async function toggleJobListingFeatured(id: string) {
	const error = {
		error: true,
		message:
			"You don't have permission to update this job listing's featured status",
	}
	const { orgId } = await getCurrentOrganization()
	if (orgId == null) return error

	const jobListing = await getJobListing(id, orgId)
	if (jobListing == null) return error

	console.log("toggleJobListingFeatured - jobListing:", jobListing);

	const newFeaturedStatus = !jobListing.isFeatured
	const hasMaxed = await hasReachedMaxFeaturedJobListings();
	console.log("toggleJobListingFeatured - hasMaxed:", hasMaxed);
	if (
		!(await hasOrgUserPermission("org:job_listings:change_status")) ||
		(newFeaturedStatus && hasMaxed)
	) {
		return error
	}

	await jobListingsRepository.updateIsFeatured(id, {
		isFeatured: newFeaturedStatus
	});

	return { error: false }
}

export async function deleteJobListing(id: string) {
	const error = {
		error: true,
		message:
			"You don't have permission to delete this job listing",
	}

	const { orgId } = await getCurrentOrganization()
	if (orgId == null) return error

	const jobListing = await getJobListing(id, orgId)
	if (jobListing == null) return error

	if (!(await hasOrgUserPermission(ClerkConfiguration.UserPermissions.JobListings.Delete)))
		return error;

	await jobListingsRepository.delete(id, orgId);

	return { error: false, redirectTo: "/employer" };
}

export async function getJobListing(id: string, orgId?: string) {
	"use cache"
	cacheTag(getJobListingIdTag(id))

	return db.query.JobListingTable.findFirst({
		where: and(
			eq(JobListingTable.id, id),
			orgId ? eq(JobListingTable.organizationId, orgId) : undefined
		),
	})
}

export async function getPublishedJobListing(id: string) {
	"use cache"
	cacheTag(getJobListingIdTag(id))

	return db.query.JobListingTable.findFirst({
		where: and(
			eq(JobListingTable.id, id),
			eq(JobListingTable.status, "published")
		),
	})
}

export async function getAiJobListingSearchResults(unsafeData: z.infer<typeof jobListingAiSearchSchema>)
	: Promise<{ error: true, message: string } | { error: false, jobIds: string[] }> {
	// We try and make sure that the data are valid before proceeding
	const { success, data } = jobListingAiSearchSchema.safeParse(unsafeData);
	if (!success) {
		return {
			error: true,
			message: "There was and error processing your search query.",
		}
	}

	const { userId } = await getCurrentUser({ allData: false })
	if (userId == null) return {
		error: true,
		message: "You need an account to use AI job search",
	}

	const listings = await getPublicJobListings({ limit: 5 });
	// Max number of jobs that need to be returned that satisfy the qualifications described in teh query
	const matchedListings = await getMatchingJobListings(data.query, listings, { maxNumberOfJobs: 10 })
	if (!matchedListings.length) return {
		error: true,
		message: "No jobs match your search criteria",
	}

	return { error: false, jobIds: matchedListings };
}

async function getPublicJobListings({ limit }: { limit?: number }) {
	"use cache";
	cacheTag(getJobListingsGlobalTag());

	return db.query.JobListingTable.findMany({
		where: eq(JobListingTable.status, "published"),
		// limit: limit
	})
}