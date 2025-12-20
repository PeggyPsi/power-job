import { userRepository } from "@/features/users/db/users.repository";
import { auth } from "@clerk/nextjs/server";

//  Methods for current user authentication and data retrieval

export async function getCurrentUser({ allData = false }) {
	const { userId } = await auth();

	return {
		userId,
		user: (allData && userId) ? await userRepository.getById(userId) : undefined
	}
}