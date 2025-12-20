import { getGlobalTag, getIdTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function getUserGlobalTag() {
	return getGlobalTag("users");
}

export function getUserIdTag(id: string) {
	return getIdTag("users", id);
}

export function revalidateUserCache(id: string) {
	// Profile: max cache life
	// The recommended value is "max" which provides stale-while-revalidate semantics, or any of the other default or custom profiles defined in cacheLife.
	revalidateTag(getUserGlobalTag(), "max");
	revalidateTag(getUserIdTag(id), "max");
}