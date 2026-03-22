"use server";

import z from "zod";
import { newJobListingApplicationsSchema } from "./schemas";
import { jobListingApplicationsRepository } from "../db/jobListingApplications.repository";
import { getCurrentOrganization, getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";
import { cacheTag } from "next/cache";
import { getJobListingApplicationIdTag, getJobListingApplicationJobListingTag } from "../db/cache/jobListingApplications";
import { db } from "@/drizzle/db";
import { and, eq } from "drizzle-orm";
import { ApplicationStage, applicationStageEnum, applicationStages, JobListingApplicationTable } from "@/drizzle/schema";
import { getUserResume } from "@/features/userResumes/actions/actions";
import { getJobListing, getPublishedJobListing } from "@/features/jobListings/actions/actions";
import { inngest } from "@/services/inngest/client";
import { getUserIdTag } from "@/features/users/db/cache/users";
import { getUserResumeIdTag } from "@/features/userResumes/db/cache/userResumes";
import { hasOrgUserPermission } from "@/services/clerk/lib/orgUserPermissions";
import { ClerkConfiguration } from "@/services/clerk/lib/ClerkConfiguration";

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
	if (userResume == null) {
		return {
			error: true,
			message: "You must have a resume to apply for a job.",
		};
	}

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

	// AI generation
	await inngest.send({
		name: "app/jobListingApplication.created",
		data: {
			jobListingId,
			userId,
		}
	})

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

export async function getJobListingApplications({
	jobListingId
}: {
	jobListingId: string;
}) {
	"use cache";
	cacheTag(getJobListingApplicationJobListingTag(jobListingId));

	const data = await db.query.JobListingApplicationTable.findMany({
		where: eq(JobListingApplicationTable.jobListingId, jobListingId),
		columns: {
			coverLetter: true,
			createdAt: true,
			stage: true,
			rating: true,
			jobListingId: true
		},
		with: {
			user: {
				columns: {
					id: true,
					name: true,
					imageUrl: true
				},
				with: {
					resume: {
						columns: {
							resumeFileUrl: true,
							aiSummary: true
						}
					}
				}
			}
		}
	});

	// cache the user and his resume in case the user has at any point changed anything on hid/her profile 
	// as well as his/her resume
	data.forEach(({ user }) => {
		cacheTag(getUserIdTag(user.id));
		cacheTag(getUserResumeIdTag(user.id))
	});

	return data;
}

export async function updateJobListingApplicationStage({ jobListingId, userId }: { jobListingId: string, userId: string }, unsafeStage: ApplicationStage) {
	const { orgId } = await getCurrentOrganization();
	const hasPermission = await hasOrgUserPermission(ClerkConfiguration.UserPermissions.JobListingApplications.ChangeStage);
	if (orgId == null || !hasPermission) return {
		error: true,
		message: "You dont have permissions to change the stage of the application"
	}

	// We try and make sure that the data are valid before proceeding
	const { success, data: stage } = z.enum(applicationStages).safeParse(unsafeStage);
	if (!success) {
		return {
			error: true,
			message: "The provided data is invalid.",
		}
	}

	const joblisting = await getPublishedJobListing(jobListingId);
	if (!joblisting) return {
		error: true,
		message: "You dont have permissions to change the stage of the application"
	}

	await jobListingApplicationsRepository.update({ jobListingId, userId }, { stage });

	return { error: false }
}

export async function updateJobListingApplicationRating({ jobListingId, userId }: { jobListingId: string, userId: string }, unsafeRating: number | null) {
	const { orgId } = await getCurrentOrganization();
	const hasPermission = await hasOrgUserPermission(ClerkConfiguration.UserPermissions.JobListingApplications.ChangeRating);
	if (orgId == null || !hasPermission) return {
		error: true,
		message: "You dont have permissions to change the rating of the application"
	}

	// We try and make sure that the data are valid before proceeding
	const { success, data: rating } = z.number().min(1).max(5).safeParse(unsafeRating);
	if (!success) {
		return {
			error: true,
			message: "The provided data is invalid.",
		}
	}

	const joblisting = await getPublishedJobListing(jobListingId);
	if (!joblisting) return {
		error: true,
		message: "You dont have permissions to change the rating of the application"
	}

	await jobListingApplicationsRepository.update({ jobListingId, userId }, { rating });

	return { error: false }
}