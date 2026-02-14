import { cacheTag } from "next/cache";
import { getUserResumeIdTag } from "../db/cache/usersResumes";
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