import { JobListing, JobListingStatus } from "@/drizzle/schema";

export function getNextJobListingStatus(currentStatus: JobListingStatus) {
	switch (currentStatus) {
		case "draft":
		case "delisted":
			return "published";
		case "published":
			return "delisted";
		default:
			throw new Error(`Unknown job listing status ${currentStatus satisfies never}`);
	}
}

const JOB_LISTINGS_STATUS_SORT_ORDER: Record<JobListingStatus, number> = {
	published: 0,
	draft: 1,
	delisted: 2
}

export function sortJobListingsByStatus(a: JobListingStatus, b: JobListingStatus) {
	// Check if bigger order number than b, then return it before b.
	return JOB_LISTINGS_STATUS_SORT_ORDER[a] - JOB_LISTINGS_STATUS_SORT_ORDER[b];
}