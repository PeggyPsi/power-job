import { pgTable, varchar } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../schemaHelpers";
import { relations } from "drizzle-orm";
import { JobListingApplicationTable } from "./jobListingApplication";
import { OrganizationUserSettingsTable } from "./organizationUserSettings";
import { UserNotificationSettingsTable } from "./userNotificationSettings";
import { UserResumeTable } from "./userResume";

export const UserTable = pgTable("users", {
	id: varchar().primaryKey(),
	name: varchar().notNull(),
	imageUrl: varchar().notNull(),
	email: varchar().notNull().unique(),
	createdAt,
	updatedAt
})

export const UserReferences = relations(
	UserTable,
	({ one, many }) => ({
		notificationSettings: one(UserNotificationSettingsTable),
		resume: one(UserResumeTable),
		organizationSettings: many(OrganizationUserSettingsTable),
		// applications: many(JobListingApplicationTable), // TODO: check if relation is needed
	})
)