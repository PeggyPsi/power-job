import { db } from "@/drizzle/db";
import { UserNotificationSettingsTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidateUserNotificationSettings } from "./cache/userNotificationsSettings";

export const userNotificationSettingsRepository = {
	insert: async (settings: typeof UserNotificationSettingsTable.$inferInsert) => {
		await db.insert(UserNotificationSettingsTable)
			.values(settings)
			.onConflictDoNothing(); // In case of anything going wrong, dont change or update anything

		revalidateUserNotificationSettings(settings.userId); // always revalidate cache after CRUD operations
	},
	update: async (userId: string, settings: Partial<Omit<typeof UserNotificationSettingsTable.$inferInsert, "userId">>) => {
		// We do insert just in case notification settings for this user were not properly created during his 
		// creation. With insert and on conflict update we ensure that the settings will be created/updated recordingly 
		await db.insert(UserNotificationSettingsTable)
			.values({ ...settings, userId })
			.onConflictDoUpdate({
				target: UserNotificationSettingsTable.userId,
				set: settings
			});

		revalidateUserNotificationSettings(userId); // always revalidate cache after CRUD operations
	},
	deleteByUserId: async (userId: string) => {
		await db.delete(UserNotificationSettingsTable).where(eq(UserNotificationSettingsTable.userId, userId));

		revalidateUserNotificationSettings(userId); // always revalidate cache after CRUD operations
	},
};