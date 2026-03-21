"use server"

import { db } from "@/drizzle/db";
import { UserNotificationSettingsTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { getUserNotificationSettingsIdTag } from "../db/cache/userNotificationsSettings";
import { userNoticationSettingsSchema } from "./schemas";
import z from "zod";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";
import { userNotificationSettingsRepository } from "../db/userNotificationSettings.repository";

export async function getUserNotificationSettings(userId: string) {
	"use cache";
	cacheTag(getUserNotificationSettingsIdTag(userId));

	return db.query.UserNotificationSettingsTable.findFirst({
		where: eq(UserNotificationSettingsTable.userId, userId),
		columns: {
			aiPrompt: true,
			newJobEmailNotifications: true
		}
	});
}

export async function updateUserNotificationSettings(unsafeData: z.infer<typeof userNoticationSettingsSchema>) {
	const { userId } = await getCurrentUser({ allData: false });
	if (!userId)
		return {
			error: true,
			message: "You must be logged in to update your notification settings.",
		};

	// We try and make sure that the data are valid before proceeding
	const { success, data } = userNoticationSettingsSchema.safeParse(unsafeData);
	if (!success) {
		return {
			error: true,
			message: "The provided data is invalid.",
		}
	}

	await userNotificationSettingsRepository.update(userId, data);

	return {
		error: false,
		message: "Successfully updated your notifications settings.",
	};
}