import { db } from "@/drizzle/db";
import { UserTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export const userRepository = {
	insert: async (user: typeof UserTable.$inferInsert) => {
		await db.insert(UserTable).values(user)
			// If user already exists, we do an upsett (update existing record)
			.onConflictDoUpdate({
				target: UserTable.id,
				set: user
			});
	},
	update: async (userId: string, user: Partial<typeof UserTable.$inferInsert>) => {
		await db.update(UserTable).set(user).where(eq(UserTable.id, userId));
	},
	delete: async (userId: string) => {
		await db.delete(UserTable).where(eq(UserTable.id, userId));
	},
};