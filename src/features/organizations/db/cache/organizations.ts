import { getGlobalTag, getIdTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function getOrganizationsGlobalTag() {
	return getGlobalTag("organizations");
}

export function getOrganizationIdTag(id: string) {
	return getIdTag("organizations", id);
}

export function revalidateOrganizationCache(id: string) {
	// Profile: max cache life
	// The recommended value is "max" which provides stale-while-revalidate semantics, or any of the other default or custom profiles defined in cacheLife.
	revalidateTag(getOrganizationsGlobalTag(), "max");
	revalidateTag(getOrganizationIdTag(id), "max");
}