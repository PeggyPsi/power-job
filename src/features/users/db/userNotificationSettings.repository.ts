import { db } from "@/drizzle/db";
import { UserNotificationSettingsTable } from "@/drizzle/schema";
import { revalidateUserNotificationSettings } from "./cache/userNotificationsSettings";
import { eq } from "drizzle-orm";

export const userNotificationSettingsRepository = {
	insert: async (settings: typeof UserNotificationSettingsTable.$inferInsert) => {
		await db.insert(UserNotificationSettingsTable)
			.values(settings)
			.onConflictDoNothing(); // In case of anything going wrong, dont change or update anything

		revalidateUserNotificationSettings(settings.userId); // always revalidate cache after CRUD operations
	},
	deleteByUserId: async (userId: string) => {
		await db.delete(UserNotificationSettingsTable).where(eq(UserNotificationSettingsTable.userId, userId));

		revalidateUserNotificationSettings(userId); // always revalidate cache after CRUD operations
	},
};