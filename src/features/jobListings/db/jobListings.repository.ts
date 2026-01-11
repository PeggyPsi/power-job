import { db } from "@/drizzle/db";
import { JobListingTable, JobListing } from "@/drizzle/schema";
import { and, desc, eq } from "drizzle-orm";
import { revalidateJobListingCache } from "./cache/jobListings";
import { get } from "http";

export const jobListingsRepository = {
	getByOrganization: async (orgId: string): Promise<JobListing> => {
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
	},
	getById: async (id: string, orgId: string) => {
		return await db.query.JobListingTable.findFirst({
			where: and(
				eq(JobListingTable.id, id),
				eq(JobListingTable.organizationId, orgId)
			)
		});
	},
	update: async (id: string, orgId: string, jobListing: Partial<typeof JobListingTable.$inferInsert>) => {
		const [updatedListing] = await db.update(JobListingTable).set(jobListing).where(eq(JobListingTable.id, id)).returning({
			id: JobListingTable.id,
			orgId: JobListingTable.organizationId,
		})

		revalidateJobListingCache(updatedListing); // always revalidate cache after CRUD operations

		return updatedListing;
	},
	delete: async (id: string, orgId: string) => {
		await db.delete(JobListingTable).where(eq(JobListingTable.id, id));

		revalidateJobListingCache({ id, orgId }); // always revalidate cache after CRUD operations
	}
};