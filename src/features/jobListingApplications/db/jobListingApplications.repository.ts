import { db } from "@/drizzle/db";
import { JobListingApplicationTable } from "@/drizzle/schema";
import { revalidateJobListingApplicationsCache } from "./cache/jobListingApplications";
import { and, eq } from "drizzle-orm";

export const jobListingApplicationsRepository = {
	create: async (jobListingApplication: typeof JobListingApplicationTable.$inferInsert) => {
		// by default, when we create a new job listing application, we set the stage to "applied". it is declared in the drizzle table schema

		await db
			.insert(JobListingApplicationTable)
			.values(jobListingApplication);

		revalidateJobListingApplicationsCache(jobListingApplication); // always revalidate cache after CRUD operations
	},
	update: async ({ jobListingId, userId }: { jobListingId: string, userId: string }, data: Partial<typeof JobListingApplicationTable.$inferInsert>) => {
		await db
			.update(JobListingApplicationTable)
			.set(data)
			.where(and(
				eq(JobListingApplicationTable.jobListingId, jobListingId),
				eq(JobListingApplicationTable.userId, userId)
			));

		revalidateJobListingApplicationsCache({ jobListingId, userId }); // always revalidate cache after CRUD operations
	},
}