import { db } from "@/drizzle/db";
import { UserResumeTable } from "@/drizzle/schema";
import { revalidateUserResumesCache } from "./cache/userResumes";

export const userResumesRepository = {
	upsertUserResume: async (userId: string, data: Omit<typeof UserResumeTable.$inferInsert, "userId">) => {
		await db.insert(UserResumeTable).values({ userId, ...data }).onConflictDoUpdate({
			target: UserResumeTable.userId,
			set: data
		});
		revalidateUserResumesCache(userId); // always revalidate cache after CRUD operations
	},
};