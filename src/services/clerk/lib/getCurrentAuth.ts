import { getUserIdTag } from "@/features/users/db/cache/users";
import { userRepository } from "@/features/users/db/users.repository";
import { auth } from "@clerk/nextjs/server";
import { get } from "http";
import { cacheTag } from "next/cache";

//  Methods for current user authentication and data retrieval

export async function getCurrentUser({ allData = false }) {
	const { userId } = await auth();

	return {
		userId,
		user: (allData && userId) ? await getUser(userId) : undefined
	}
}

async function getUser(userId: string) {
	'use cache';
	cacheTag(getUserIdTag(userId)); // awlays get cached data

	return await userRepository.getById(userId)
}