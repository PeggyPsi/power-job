import { getGlobalTag, getIdTag, getOrganizationTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function getJobListingsGlobalTag() {
	return getGlobalTag("jobListings");
}

export function getJobListingOrganizationTag(orgId: string) {
	return getOrganizationTag("jobListings", orgId);
}

export function getJobListingIdTag(id: string) {
	return getIdTag("jobListings", id);
}

export function revalidateJobListingCache({ id, orgId }: { id: string, orgId: string }) {
	// Profile: max cache life
	// The recommended value is "max" which provides stale-while-revalidate semantics, or any of the other default or custom profiles defined in cacheLife.
	revalidateTag(getJobListingsGlobalTag(), "max");
	revalidateTag(getJobListingOrganizationTag(orgId), "max");
	revalidateTag(getJobListingIdTag(id), "max");
}