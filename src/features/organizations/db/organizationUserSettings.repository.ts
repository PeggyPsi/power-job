import { db } from "@/drizzle/db";
import { OrganizationUserSettingsTable } from "@/drizzle/schema";
import { revalidateOrganizationUserSettingsCache } from "./cache/organizationUserSettings";
import { and, eq } from "drizzle-orm";

export const organizationUserSettingsRepository = {
	insert: async (settings: typeof OrganizationUserSettingsTable.$inferInsert) => {
		await db
			.insert(OrganizationUserSettingsTable)
			.values(settings)
			.onConflictDoNothing()

		revalidateOrganizationUserSettingsCache(settings); // always revalidate cache after CRUD operations
	},
	delete: async ({ userId, organizationId }: { userId: string, organizationId: string }) => {
		await db
			.delete(OrganizationUserSettingsTable)
			.where(and(
				eq(OrganizationUserSettingsTable.userId, userId),
				eq(OrganizationUserSettingsTable.organizationId, organizationId)
			))

		revalidateOrganizationUserSettingsCache({ userId, organizationId }); // always revalidate cache after CRUD operations
	},
	update: async (userId: string, organizationId: string, settings: Partial<Omit<typeof OrganizationUserSettingsTable.$inferInsert, "userId" | "organizationId">>) => {
		// We do insert just in case notification settings for this user were not properly created during his 
		// creation. With insert and on conflict update we ensure that the settings will be created/updated recordingly 
		await db.insert(OrganizationUserSettingsTable)
			.values({ ...settings, userId, organizationId })
			.onConflictDoUpdate({
				target: [
					OrganizationUserSettingsTable.userId,
					OrganizationUserSettingsTable.organizationId
				],
				set: settings
			});

		revalidateOrganizationUserSettingsCache({ userId, organizationId }); // always revalidate cache after CRUD operations
	},
};