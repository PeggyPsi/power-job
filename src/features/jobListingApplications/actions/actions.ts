"use server";

import z from "zod";
import { newJobListingApplicationsSchema } from "./schemas";
import { jobListingApplicationsRepository } from "../db/jobListingApplications.repository";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";
import { cacheTag } from "next/cache";
import { getJobListingApplicationIdTag } from "../db/cache/jobListingApplications";
import { db } from "@/drizzle/db";
import { and, eq } from "drizzle-orm";
import { JobListingApplicationTable } from "@/drizzle/schema";
import { getUserResume } from "@/features/userResumes/actions/actions";
import { getPublishedJobListing } from "@/features/jobListings/actions/actions";
import { inngest } from "@/services/inngest/client";

export async function createJobListingApplication(jobListingId: string, unsafeData: z.infer<typeof newJobListingApplicationsSchema>) {
	// Check if the user is authenticated
	const { userId } = await getCurrentUser({ allData: false });
	if (!userId)
		return {
			error: true,
			message: "You must be logged in to apply for a job.",
		};

	// We perform several checks before allowing the user to apply for the job listing
	const [publishedJobListing, application, userResume] = await Promise.all([
		await getPublishedJobListing(jobListingId),
		await getJobListingApplication({ jobListingId, userId }),
		await getUserResume(userId)
	]);

	// Check if the job listing exists and is published
	if (publishedJobListing == null) {
		return {
			error: true,
			message: "This job listing is no longer available.",
		};
	}

	// We can also add additional checks here, for example, to verify that the job listing exists and is open for applications, or to check if the user has already applied to this job listing.
	if (application != null) {
		return {
			error: true,
			message: "You have already applied for this job.",
		};
	}

	// Check if the user has a resume before allowing them to apply for the job
	// TODO: to uncomment - this is temporary
	// if (userResume == null) {
	// 	return {
	// 		error: true,
	// 		message: "You must have a resume to apply for a job.",
	// 	};
	// }

	// We try and make sure that the data are valid before proceeding
	const { success, data } = newJobListingApplicationsSchema.safeParse(unsafeData);
	if (!success) {
		return {
			error: true,
			message: "The provided data is invalid.",
		}
	}

	await jobListingApplicationsRepository.create({
		...data,
		jobListingId: jobListingId,
		userId: userId
	});

	// TODO: AI generation
	// await inngest.send({
	// 	name: "app/jobListingApplication.created",
	// 	data: {
	// 		jobListingId,
	// 		userId,
	// 	}
	// })

	return { error: false, message: "Your application has been submitted successfully" };
}

export async function getJobListingApplication({
	jobListingId,
	userId,
}: {
	jobListingId: string;
	userId: string;
}) {
	"use cache";
	cacheTag(getJobListingApplicationIdTag({ jobListingId, userId }));

	return await db.query.JobListingApplicationTable.findFirst({
		where: and(
			eq(JobListingApplicationTable.jobListingId, jobListingId),
			eq(JobListingApplicationTable.userId, userId),
		),
	});
}