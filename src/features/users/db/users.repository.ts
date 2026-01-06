import { db } from "@/drizzle/db";
import { User, UserTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidateUserCache } from "./cache/users";
import { userNotificationSettingsRepository } from "./userNotificationSettings.repository";

export const userRepository = {
	insert: async (user: typeof UserTable.$inferInsert) => {
		await db.insert(UserTable).values(user)
			// If user already exists, we do an upsett (update existing record)
			.onConflictDoUpdate({
				target: UserTable.id,
				set: user
			});

		revalidateUserCache(user.id); // always revalidate cache after CRUD operations
	},
	update: async (userId: string, user: Partial<typeof UserTable.$inferInsert>) => {
		await db.update(UserTable).set(user).where(eq(UserTable.id, userId));

		revalidateUserCache(userId); // always revalidate cache after CRUD operations
	},
	delete: async (userId: string) => {
		await userNotificationSettingsRepository.deleteByUserId(userId);
		await db.delete(UserTable).where(eq(UserTable.id, userId));

		revalidateUserCache(userId); // always revalidate cache after CRUD operations
	},
	getById: async (userId: string): Promise<User> => {
		return await db.select().from(UserTable).where(eq(UserTable.id, userId)).limit(1).then(res => res[0]);
	}
};