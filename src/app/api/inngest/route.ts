import { serve } from "inngest/next";
import { inngest } from "@/services/inngest/client";
import { clerkCreateOrganization, clerkCreateUser, clerkDeleteOrganization, clerkDeleteUser, clerkUpdateOrganization, clerkUpdateUser } from "@/services/inngest/functions/clerk.inngest";

// Inngest API route handler. We define the functions that we want to expose via this route
export const { GET, POST, PUT } = serve({
	client: inngest,
	functions: [
		clerkCreateUser,
		clerkUpdateUser,
		clerkDeleteUser,
		clerkCreateOrganization,
		clerkUpdateOrganization,
		clerkDeleteOrganization
	],
});