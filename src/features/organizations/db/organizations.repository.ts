import { db } from "@/drizzle/db";
import { Organization, OrganizationTable, User, UserTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidateOrganizationCache } from "./cache/organizations";

export const organizationsRepository = {
	insert: async (organization: typeof OrganizationTable.$inferInsert) => {
		await db.insert(OrganizationTable).values(organization)
			// If organization already exists, we do an upsett (update existing record)
			.onConflictDoUpdate({
				target: OrganizationTable.id,
				set: organization
			});
		revalidateOrganizationCache(organization.id); // always revalidate cache after CRUD operations
	},
	update: async (organizationId: string, organization: Partial<typeof OrganizationTable.$inferInsert>) => {
		await db.update(OrganizationTable).set(organization).where(eq(OrganizationTable.id, organizationId));

		revalidateOrganizationCache(organizationId); // always revalidate cache after CRUD operations
	},
	delete: async (organizationId: string) => {
		await db.delete(OrganizationTable).where(eq(OrganizationTable.id, organizationId));

		revalidateOrganizationCache(organizationId); // always revalidate cache after CRUD operations
	},
	getById: async (orgId: string): Promise<Organization> => {
		return await db.select().from(OrganizationTable).where(eq(OrganizationTable.id, orgId)).limit(1).then(res => res[0]);
	}
};