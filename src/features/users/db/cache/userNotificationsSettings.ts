import { getGlobalTag, getIdTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function getUserNotificationSettingsGlobalTag() {
	return getGlobalTag("userNotificationSettings");
}

export function getUserNotificationSettingsIdTag(userId: string) {
	return getIdTag("userNotificationSettings", userId);
}

export function revalidateUserNotificationSettings(userId: string) {
	// Profile: max cache life
	// The recommended value is "max" which provides stale-while-revalidate semantics, or any of the other default or custom profiles defined in cacheLife.
	revalidateTag(getUserNotificationSettingsGlobalTag(), "max");
	revalidateTag(getUserNotificationSettingsIdTag(userId), "max");
}