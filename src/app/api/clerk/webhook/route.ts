import { verifyWebhook } from "@clerk/backend/webhooks";

export async function POST(request: Request) {
	try {
		const evt = await verifyWebhook(request, {
			signingSecret: process.env.CLERK_WEBHOOK_SECRET,
		});

		// evt is the verified webhook event
		console.log("Clerk event type", evt.type);
		console.log("Clerk event data", evt.data);

		return new Response("OK");
	} catch (err) {
		console.error("Webhook verification failed:", err);
		return new Response("Invalid webhook", { status: 400 });
	}
}