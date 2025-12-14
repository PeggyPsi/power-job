import { env } from "@/data/env/server";
import { inngest } from "../client";
import { Webhook } from "svix";
import { NonRetriableError } from "inngest";
import { userRepository } from "@/features/users/db/users.repository";
import { userNotificationSettingsRepository } from "@/features/users/db/userNotificationSettings.repository";

// Helper method to verify Clerk webhooks
function verifyWebhook({ raw, headers }: { raw: string, headers: Record<string, string> }) {
	return new Webhook(env.CLERK_WEBHOOK_SECRET).verify(raw, headers);
}

export const clerkCreateUser = inngest.createFunction({
	id: "clerk/create-user",
	name: "Clerk - Create DB User"
},
	{
		event: 'clerk/user.created'
	},
	async ({ event, step }) => {
		// First step is to try andv verify the webhook
		await step.run("verify-webhook", async () => {
			try {
				verifyWebhook(event.data); // sanity check
			} catch (error) {
				throw new NonRetriableError("Invalid webhook fro function clerk/create-user")
			}
		})

		// Create actual user
		const userId = await step.run("create-user", async () => {
			const userData = event.data.data;
			const email = userData.email_addresses?.find(e => e.id === userData.primary_email_address_id);
			if (!email) {
				throw new NonRetriableError("No primary email found for user");
			}

			await userRepository.insert({
				id: userData.id,
				name: `${userData.first_name ?? ""} ${userData.last_name ?? ""}`.trim(),
				email: email.email_address,
				imageUrl: userData.image_url,
				createdAt: new Date(userData.created_at),
				updatedAt: new Date(userData.updated_at)
			});

			return userData.id;
		})

		await step.run("create-user-notification-settings", async () => {
			await userNotificationSettingsRepository.insert({ userId }); // create default notification settings for the newly created user
		});
	}
);

export const clerkUpdateUser = inngest.createFunction({
	id: "clerk/update-user",
	name: "Clerk - Update DB User"
},
	{
		event: 'clerk/user.updated'
	},
	async ({ event, step }) => {
		// First step is to try andv verify the webhook
		await step.run("verify-webhook", async () => {
			try {
				verifyWebhook(event.data); // sanity check
			} catch (error) {
				throw new NonRetriableError("Invalid webhook fro function clerk/update-user")
			}
		})

		// Update user
		await step.run("update-user", async () => {
			const userData = event.data.data;
			const email = userData.email_addresses?.find(e => e.id === userData.primary_email_address_id);
			if (!email) {
				throw new NonRetriableError("No primary email found for user");
			}

			await userRepository.update(userData.id, {
				name: `${userData.first_name ?? ""} ${userData.last_name ?? ""}`.trim(),
				email: email.email_address,
				imageUrl: userData.image_url,
				createdAt: new Date(userData.created_at),
				updatedAt: new Date(userData.updated_at)
			});
		})
	}
);

export const clerkDeleteUser = inngest.createFunction({
	id: "clerk/delete-user",
	name: "Clerk - Delete DB User"
},
	{
		event: 'clerk/user.deleted'
	},
	async ({ event, step }) => {
		// First step is to try andv verify the webhook
		await step.run("verify-webhook", async () => {
			try {
				verifyWebhook(event.data); // sanity check
			} catch (error) {
				throw new NonRetriableError("Invalid webhook fro function clerk/delete-user")
			}
		})

		// Create actual user
		const userId = await step.run("delete-user", async () => {
			const userIdToDelete = event.data.data?.id;
			if (!userIdToDelete) {
				throw new NonRetriableError("No user id found to delete");
			}
			await userRepository.delete(userIdToDelete);
		})
	}
);