import { db } from "@/drizzle/db";
import { UserResumeTable } from "@/drizzle/schema";
import { revalidateUserResumesCache } from "./cache/userResumes";
import { eq } from "drizzle-orm";

export const userResumesRepository = {
	upsertUserResume: async (userId: string, data: Omit<typeof UserResumeTable.$inferInsert, "userId">) => {
		await db.insert(UserResumeTable).values({ userId, ...data }).onConflictDoUpdate({
			target: UserResumeTable.userId,
			set: data
		});
		revalidateUserResumesCache(userId); // always revalidate cache after CRUD operations
	},
	updateUserResume: async (userId: string, data: Partial<Omit<typeof UserResumeTable.$inferInsert, "userId">>) => {
		await db.update(UserResumeTable).set(data).where(eq(UserResumeTable.userId, userId));

		revalidateUserResumesCache(userId); // always revalidate cache after CRUD operations
	},
};