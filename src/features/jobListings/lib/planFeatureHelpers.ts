import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth";
import { cacheTag } from "next/cache";
import { getJobListingsOrganizationTag } from "../db/cache/jobListings";
import { db } from "@/drizzle/db";
import { JobListingTable } from "@/drizzle/schema";
import { and, count, eq } from "drizzle-orm";
import { hasPlanFeature } from "@/services/clerk/lib/planFeatures";
import { ClerkConfiguration } from "@/services/clerk/lib/ClerkConfiguration";

/** Based on current plan check if the user can post */
export async function hasReachedMaxPostedJobListings() {
	const { orgId } = await getCurrentOrganization();
	if (!orgId) return true; // No organization, so yeah....maxed

	const count = await getPublishedJobListingsCount(orgId);

	// User must have either of the following plans and not exceeded the corresponding allowed job listings posts
	const canPost = await Promise.all(
		[
			hasPlanFeature(ClerkConfiguration.PlanFeatures.Post1JobListings).then(has => has && count < 1),
			hasPlanFeature(ClerkConfiguration.PlanFeatures.Post3JobListings).then(has => has && count < 3),
			hasPlanFeature(ClerkConfiguration.PlanFeatures.Post15JobListings).then(has => has && count < 15)
		]
	)

	return !canPost.some(Boolean);
}

export async function hasReachedMaxFeaturedJobListings() {
	const { orgId } = await getCurrentOrganization()
	if (orgId == null) return true

	const count = await getFeaturedJobListingsCount(orgId)

	const canFeature = await Promise.all([
		hasPlanFeature(ClerkConfiguration.PlanFeatures.FeaturedOneJobListing).then(has => has && count < 1),
		hasPlanFeature(ClerkConfiguration.PlanFeatures.FeaturedUnlimitedJobListings),
	])

	return !canFeature.some(Boolean)
}

async function getPublishedJobListingsCount(orgId: string) {
	"use cache"
	cacheTag(getJobListingsOrganizationTag(orgId))

	const [res] = await db
		.select({ count: count() })
		.from(JobListingTable)
		.where(and(
			eq(JobListingTable.organizationId, orgId),
			eq(JobListingTable.status, "published")
		));
	return res?.count ?? 0
}

async function getFeaturedJobListingsCount(orgId: string) {
	"use cache"
	cacheTag(getJobListingsOrganizationTag(orgId))

	const [res] = await db
		.select({ count: count() })
		.from(JobListingTable)
		.where(
			and(
				eq(JobListingTable.organizationId, orgId),
				eq(JobListingTable.isFeatured, true)
			)
		)
	return res?.count ?? 0
}