import { getOrganizationIdTag } from "@/features/organizations/db/cache/organizations";
import { organizationsRepository } from "@/features/organizations/db/organizations.repository";
import { getUserIdTag } from "@/features/users/db/cache/users";
import { userRepository } from "@/features/users/db/users.repository";
import { auth } from "@clerk/nextjs/server";
import { cacheTag } from "next/cache";

//  Methods for current user authentication and data retrieval

export async function getCurrentUser({ allData = false }) {
	const { userId } = await auth();

	return {
		userId,
		user: (allData && userId) ? await getUser(userId) : undefined
	}
}

export async function getCurrentOrganization({ allData = false }) {
	const { orgId } = await auth();

	return {
		orgId,
		organization: (allData && orgId) ? await getOrganization(orgId) : undefined
	}
}

async function getUser(userId: string) {
	'use cache';
	cacheTag(getUserIdTag(userId)); // awlays get cached data

	return await userRepository.getById(userId)
}

async function getOrganization(orgId: string) {
	'use cache';
	cacheTag(getOrganizationIdTag(orgId)); // awlays get cached data

	return await organizationsRepository.getById(orgId)
}