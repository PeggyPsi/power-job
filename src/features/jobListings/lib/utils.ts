import { JobListingStatus } from "@/drizzle/schema";

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