import { db } from "@/drizzle/db";
import { JobListingTable, JobListing } from "@/drizzle/schema";
import { desc, eq } from "drizzle-orm";

export const jobListingsRepository = {
	getByOrganization: async (orgId: string,): Promise<JobListing> => {
		return await db.select().from(JobListingTable).where(eq(JobListingTable.organizationId, orgId)).limit(1).then(res => res[0]);
	}
};