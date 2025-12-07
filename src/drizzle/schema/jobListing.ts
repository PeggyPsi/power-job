import { boolean, index, integer, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { OrganizationTable } from "./organization";
import { relations } from "drizzle-orm";
import { JobListingApplicationTable } from "./jobListingApplication";

// DEVNOTE: `number` on typeof references means "any index of the array".
// So this gives us the type of any item in the array

// Wage Intervals
export const wageIntervals = ["hourly", "yearly"] as const;
export type WageInterval = (typeof wageIntervals)[number];
export const wageIntervalEnum = pgEnum("job_listing_wage_interval", wageIntervals); // enum representation in DB

// Location Requirements
export const locationRequirements = ["in-office", "hybrid", "remote"] as const;
export type LocationRequirement = (typeof locationRequirements)[number];
export const locationRequirementEnum = pgEnum("job_listing_location_requirement", locationRequirements); // enum representation in DB

// Experience Levels
export const experienceLevels = ["junior", "mid-level", "senior"] as const
export type ExperienceLevel = (typeof experienceLevels)[number]
export const experienceLevelEnum = pgEnum("job_listings_experience_level", experienceLevels) // enum representation in DB

// Job Listing Status
export const jobListingStatuses = ["draft", "published", "delisted"] as const
export type JobListingStatus = (typeof jobListingStatuses)[number]
export const jobListingStatusEnum = pgEnum("job_listings_status", jobListingStatuses)

// Job Listing Type
export const jobListingTypes = ["internship", "part-time", "full-time"] as const
export type JobListingType = (typeof jobListingTypes)[number]
export const jobListingTypeEnum = pgEnum("job_listings_type", jobListingTypes)

export const JobListingTable = pgTable("job_listings", {
	id,
	organizationId: varchar().references(() => OrganizationTable.id, { onDelete: "cascade" }).notNull(), // foreign key to organizations table
	// Basic info
	title: varchar().notNull(),
	description: text().notNull(),
	wage: integer(),
	stateAbbreviation: varchar(),
	city: varchar(),
	isFeatured: boolean().notNull().default(false),
	// Enums
	wageInterval: wageIntervalEnum(),
	locationRequirement: locationRequirementEnum().notNull(),
	experienceLevel: experienceLevelEnum().notNull(),
	status: jobListingStatusEnum().notNull().default("draft"), // Be default new listing must be in draft status
	type: jobListingTypeEnum().notNull(),
	// Date related columns
	postedAt: timestamp({ withTimezone: true }),
	createdAt,
	updatedAt,
},
	table => [index().on(table.stateAbbreviation)]
)

export const jobListingReferences = relations(
	JobListingTable,
	({ one, many }) => ({
		// This one references the organization entity and the relation between jobListing and organization
		// This is helpful so that we can easily query listing and their related info later on
		organization: one(OrganizationTable, {
			fields: [JobListingTable.organizationId], // basically it says that the field organizationId
			references: [OrganizationTable.id] // references the id column in OrganizationTable
		}),
		applications: many(JobListingApplicationTable)
	})
)