import { integer, pgEnum, pgTable, primaryKey, text, uuid, varchar } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { JobListingTable } from "./jobListing";
import { UserTable } from "./user";
import { relations } from "drizzle-orm";

export const applicationStages = ["denied", "applied", "interested", "interviewed", "hired"] as const;
export type ApplicationStage = (typeof applicationStages)[number];
export const applicationStageEnum = pgEnum("job_listing_application_stage", applicationStages); // enum representation in DB

export const JobListingApplicationTable = pgTable("job_listing_applications", {
	jobListingId: uuid().references(() => JobListingTable.id, { onDelete: "cascade" }).notNull(), // foreign key to job_listings table
	userId: varchar().references(() => UserTable.id, { onDelete: "cascade" }).notNull(), // foreign key to users table
	// Basic info
	coverLetter: text(),
	rating: integer(), // possibly null rating, the applicant has not rated
	stage: applicationStageEnum().notNull().default("applied"),
	// Enums
	createdAt,
	updatedAt,
},
	table => [
		primaryKey({ columns: [table.jobListingId, table.userId] }) // combined primary key on user and job listing
	]
)


export const JobListingApplicationReferences = relations(
	JobListingApplicationTable,
	({ one }) => ({
		jobListing: one(JobListingTable, {
			fields: [JobListingApplicationTable.jobListingId],
			references: [JobListingTable.id]
		}),
		user: one(UserTable, {
			fields: [JobListingApplicationTable.userId],
			references: [UserTable.id]
		}),
	})
)