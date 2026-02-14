import { getGlobalTag, getIdTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function getUserResumeGlobalTag() {
	return getGlobalTag("userResumes");
}
``
export function getUserResumeIdTag(userId: string) {
	return getIdTag("userResumes", userId);
}

export function revalidateUserResumesCache({ id, orgId }: { id: string, orgId: string }) {
	// Profile: max cache life
	// The recommended value is "max" which provides stale-while-revalidate semantics, or any of the other default or custom profiles defined in cacheLife.
	revalidateTag(getUserResumeGlobalTag(), "max")
	revalidateTag(getUserResumeIdTag(id), "max")
}