import { boolean, pgTable, varchar } from "drizzle-orm/pg-core";
import { UserTable } from "./user";
import { createdAt, updatedAt } from "../schemaHelpers";
import { relations } from "drizzle-orm";

// many to many relation
export const UserNotificationSettingsTable = pgTable("user_notification_settings", {
	userId: varchar().primaryKey().references(() => UserTable.id),
	newJobEmailNotifications: boolean().notNull().default(false),
	// If newJobEmailNotifications is true, does the user have an AI prompt associated
	// with the notifications or does the user want to be sent notifications on any new job listing that is posted
	aiPrompt: varchar(),
	createdAt,
	updatedAt
})

export const UserNotificationSettingsReferences = relations(
	UserNotificationSettingsTable,
	({ one }) => ({
		user: one(UserTable, {
			fields: [UserNotificationSettingsTable.userId],
			references: [UserTable.id]
		})
	})
)