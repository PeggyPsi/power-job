import { boolean, pgTable, varchar } from "drizzle-orm/pg-core";
import { UserTable } from "./user";
import { createdAt, updatedAt } from "../schemaHelpers";

// many to many relation
export const UserResumeTable = pgTable("user_resumes", {
	userId: varchar().primaryKey().references(() => UserTable.id),
	resumeFileUrl: varchar().notNull(), // the url to where the actual file of the resume is hosted
	resumeFileKey: varchar().notNull(), // unique id that is used for the file in the hosting system
	aiSummary: varchar(), // might be null - it is the summary that the AI is going to produce of the resume
	createdAt,
	updatedAt
})