import { db } from "@/drizzle/db";
import { JobListingTable, JobListing } from "@/drizzle/schema";
import { desc, eq } from "drizzle-orm";
import { revalidateJobListingCache } from "./cache/jobListings";

export const jobListingsRepository = {
	getByOrganization: async (orgId: string,): Promise<JobListing> => {
		return await db.select().from(JobListingTable).where(eq(JobListingTable.organizationId, orgId)).limit(1).then(res => res[0]);
	},
	create: async (jobListing: typeof JobListingTable.$inferInsert) => {
		const [newListing] = await db.insert(JobListingTable).values(jobListing).returning({
			id: JobListingTable.id,
			organizationId: JobListingTable.organizationId,
		})
		revalidateJobListingCache({ id: newListing.id, orgId: newListing.organizationId }); // always revalidate cache after CRUD operations

		return newListing;
	},
	getMostRecentByOrganization: async (orgId: string) => {
		return await db.query.JobListingTable.findFirst({
			where: eq(JobListingTable.organizationId, orgId),
			orderBy: desc(JobListingTable.createdAt),
			columns: { id: true },
		});
	}
};