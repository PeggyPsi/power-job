import { db } from "@/drizzle/db";
import { Organization, User, UserTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidateOrganizationCache } from "./cache/organizations";

export const organizationsRepository = {
	// insert: async (user: typeof UserTable.$inferInsert) => {
	// 	await db.insert(UserTable).values(user)
	// 		// If user already exists, we do an upsett (update existing record)
	// 		.onConflictDoUpdate({
	// 			target: UserTable.id,
	// 			set: user
	// 		});

	// 	revalidateOrganizationCache(user.id); // always revalidate cache after CRUD operations
	// },
	// update: async (userId: string, user: Partial<typeof UserTable.$inferInsert>) => {
	// 	await db.update(UserTable).set(user).where(eq(UserTable.id, userId));

	// 	revalidateOrganizationCache(userId); // always revalidate cache after CRUD operations
	// },
	// delete: async (userId: string) => {
	// 	await db.delete(UserTable).where(eq(UserTable.id, userId));

	// 	revalidateOrganizationCache(userId); // always revalidate cache after CRUD operations
	// },
	getById: async (orgId: string): Promise<Organization> => {
		return await db.select().from(UserTable).where(eq(UserTable.id, orgId)).limit(1).then(res => res[0]);
	}
};