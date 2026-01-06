import { DeletedObjectJSON, OrganizationJSON, OrganizationMembershipJSON, UserJSON } from "@clerk/nextjs/server";
import { EventSchemas, Inngest } from "inngest";

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
	"clerk/user.created": ClerkWebhookData<UserJSON>,
	"clerk/user.updated": ClerkWebhookData<UserJSON>,
	"clerk/user.deleted": ClerkWebhookData<DeletedObjectJSON>

	"clerk/organization.created": ClerkWebhookData<OrganizationJSON>,
	"clerk/organization.updated": ClerkWebhookData<OrganizationJSON>,
	"clerk/organization.deleted": ClerkWebhookData<DeletedObjectJSON>,
}

// Create a client to send and receive events
export const inngest = new Inngest({ id: "power-job", schemas: new EventSchemas().fromRecord<Events>() });