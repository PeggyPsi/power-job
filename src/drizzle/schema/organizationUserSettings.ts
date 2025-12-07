import { boolean, integer, pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";
import { UserTable } from "./user";
import { OrganizationTable } from "./organization";
import { createdAt, updatedAt } from "../schemaHelpers";
import { relations } from "drizzle-orm";

// many to many relation
export const OrganizationUserSettingsTable = pgTable("organization_user_settings", {
	userId: varchar().notNull().references(() => UserTable.id),
	organizationId: varchar().notNull().references(() => OrganizationTable.id),
	newApplicationEmailNotifications: boolean().notNull().default(false),
	minimumRating: integer(), // nullable because we might not need to set a minimum rating
	createdAt,
	updatedAt
}, table => [primaryKey({ columns: [table.userId, table.organizationId] })])

export const OrganizationUserSettingsReferences = relations(
	OrganizationUserSettingsTable,
	({ one }) => ({
		user: one(UserTable, {
			fields: [OrganizationUserSettingsTable.userId],
			references: [UserTable.id]
		}),
		organization: one(OrganizationTable, {
			fields: [OrganizationUserSettingsTable.organizationId],
			references: [OrganizationTable.id]
		}),
	})
)