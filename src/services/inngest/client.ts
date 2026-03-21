import { JobListingApplicationTable, JobListingTable } from "@/drizzle/schema";
import { DeletedObjectJSON, OrganizationJSON, OrganizationMembershipJSON, UserJSON } from "@clerk/nextjs/server";
import { EventSchemas, Inngest } from "inngest";
// import { AppWebhookData, JobListingApplicationJSON, UserResumeUploadedJSON } from "./webhooks/models";

// The type of data sent by Clerk webhooks
// T corrensponds to the specific Clerk object being sent
type ClerkWebhookData<T> = {
	data: {
		data: T,
		headers: Record<string, string>,
		raw: string
	}
}

type Events = {
	// Clerk webhooks
	"clerk/user.created": ClerkWebhookData<UserJSON>,
	"clerk/user.updated": ClerkWebhookData<UserJSON>,
	"clerk/user.deleted": ClerkWebhookData<DeletedObjectJSON>

	"clerk/organization.created": ClerkWebhookData<OrganizationJSON>,
	"clerk/organization.updated": ClerkWebhookData<OrganizationJSON>,
	"clerk/organization.deleted": ClerkWebhookData<DeletedObjectJSON>,

	"clerk/organizationMembership.created": ClerkWebhookData<OrganizationMembershipJSON>
	"clerk/organizationMembership.deleted": ClerkWebhookData<OrganizationMembershipJSON>

	// Custom app webhooks
	// "app/jobListingApplication.created": AppWebhookData<JobListingApplicationJSON>,
	// "app/resume.uploaded": AppWebhookData<UserResumeUploadedJSON>
	// "app/email.daily-user-job-listings": AppWebhookData<UserResumeUploadedJSON>
	"app/jobListingApplication.created": {
		data: {
			jobListingId: string
			userId: string
		}
	}
	"app/resume.uploaded": {
		user: {
			id: string
		}
	}
	"app/email.daily-user-job-listings": {
		data: {
			aiPrompt?: string
			jobListings: (Omit<
				typeof JobListingTable.$inferSelect,
				"createdAt" | "postedAt" | "updatedAt" | "status" | "organizationId"
			> & { organizationName: string })[]
		}
		user: {
			email: string
			name: string
		}
	},
	"app/email.daily-organization-user-applications": {
		data: {
			applications: (Pick<
				typeof JobListingApplicationTable.$inferSelect,
				"rating"
			> & {
				userName: string
				organizationId: string
				organizationName: string
				jobListingId: string
				jobListingTitle: string
			})[]
		}
		user: {
			email: string
			name: string
		}
	}
}

// Create a client to send and receive events
export const inngest = new Inngest({ id: "power-job", schemas: new EventSchemas().fromRecord<Events>() });