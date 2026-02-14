import { cacheTag } from "next/cache";
import { getUserResumeIdTag } from "../db/cache/userResumes";
import { db } from "@/drizzle/db";
import { and, eq } from "drizzle-orm";
import { UserResumeTable } from "@/drizzle/schema";

export async function getUserResume(userId: string) {
	"use cache";
	cacheTag(getUserResumeIdTag(userId));

	return await db.query.UserResumeTable.findFirst({
		where: and(eq(UserResumeTable.userId, userId)),
	});
}

export async function getUserResumeFileKey(userId: string) {
	// no need for caching in this case because this action does not happen regularly

	const data = await db.query.UserResumeTable.findFirst({
		where: eq(UserResumeTable.userId, userId),
		columns: {
			resumeFileKey: true,
		},
	})

	return data?.resumeFileKey
}