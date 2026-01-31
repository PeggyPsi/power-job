import { getGlobalTag, getIdTag, getJobListingTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function getJobListingApplicationsGlobalTag() {
	return getGlobalTag("jobListingApplications");
}

export function getJobListingApplicationJobListingTag(joblistingId: string) {
	return getJobListingTag("jobListingApplications", joblistingId);
}

export function getJobListingApplicationIdTag({ jobListingId, userId }: { jobListingId: string, userId: string }) {
	return getIdTag("jobListingApplications", `${jobListingId}-${userId}`);
}

export function revalidateJobListingCache(id: { jobListingId: string, userId: string }) {
	// Profile: max cache life
	// The recommended value is "max" which provides stale-while-revalidate semantics, or any of the other default or custom profiles defined in cacheLife.
	revalidateTag(getJobListingApplicationsGlobalTag(), "max")
	revalidateTag(getJobListingApplicationJobListingTag(id.jobListingId), "max")
	revalidateTag(getJobListingApplicationIdTag(id), "max")
}