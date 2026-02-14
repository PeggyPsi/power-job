import { DeletedObjectJSON, OrganizationJSON, UserJSON } from "@clerk/nextjs/server";
import { EventSchemas, Inngest } from "inngest";
import { AppWebhookData, JobListingApplicationJSON, UserResumeUploadedJSON } from "./webhooks/models";

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

	// Custom app webhooks
	"app/jobListingApplication.created": AppWebhookData<JobListingApplicationJSON>,
	"app/resume.uploaded": AppWebhookData<UserResumeUploadedJSON>
}

// Create a client to send and receive events
export const inngest = new Inngest({ id: "power-job", schemas: new EventSchemas().fromRecord<Events>() });