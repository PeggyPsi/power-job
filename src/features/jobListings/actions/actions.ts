// mandatory
// without it we get the error
// You're importing a component that needs "revalidateTag". That only works in a Server Component which is not supported in the pages/ directory.
// because createJobListing ends up being used in a client component eg JobListingForm.tsx
"use server";

import z from "zod";
import { jobListingsSchema } from "./schemas";
import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth";
import { jobListingsRepository } from "../db/jobListings.repository";
import { redirect } from "next/navigation";

export async function createJobListing(unsafeData: z.infer<typeof jobListingsSchema>) {
	// Implementation for creating a job listing
	const { orgId } = await getCurrentOrganization();

	if (orgId == null) {
		return {
			error: true,
			message: "No organization found for the current user."
		}
	}

	// We try and make sure that the data are valid before proceeding
	const { success, data } = jobListingsSchema.safeParse(unsafeData);
	if (!success) {
		return {
			error: true,
			message: "The provided data is invalid.",
		}
	}

	const newJobListing = await jobListingsRepository.create({
		...data,
		organizationId: orgId,
		status: "draft",
	});

	redirect(`/employer/job-listings/${newJobListing.id}`);
}