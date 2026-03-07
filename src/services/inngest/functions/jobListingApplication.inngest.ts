import { getJobListingApplication } from "@/features/jobListingApplications/actions/actions";
import { inngest } from "../client";
import { getUserResume } from "@/features/userResumes/actions/actions";
import { getJobListing } from "@/features/jobListings/actions/actions";
import { applicantRankingAgent } from "../ai/applicantRankingAgent";

export const rankApplicant = inngest.createFunction(
	{ id: "rank-applicant", name: "Rank Applicant" },
	{ event: "app/jobListingApplication.created" },
	async ({ step, event }) => {
		const { userId, jobListingId } = event.data;

		// get job listing application of user
		// Not awaited because we want to run it in parallel and not await for it to complete before moving on to the next step
		const getCoverLetter = step.run("get-cover-letter", async () => {
			const jobListingApplication = await getJobListingApplication({ jobListingId, userId });
			return jobListingApplication?.coverLetter ?? "";
		})

		// Not awaited because we want to run it in parallel and not await for it to complete before moving on to the next ste
		const getResumeSummary = step.run("get-user-resume", async () => {
			const resume = await getUserResume(userId);
			return resume?.aiSummary ?? "";
		})

		const getListing = step.run("get-job-listing", async () => {
			return await getJobListing(jobListingId);
		})

		const [coverLetter, resumeSummary, jobListing] = await Promise.all([
			getCoverLetter,
			getResumeSummary,
			getListing
		]);

		// if non of these are found then there is no need to rank the applicant because we dont have what is needed to be ranked upon
		// cover letter is an optional thing
		if (resumeSummary === null || jobListing === null) return;

		await applicantRankingAgent.run(JSON.stringify({ coverLetter, resumeSummary, jobListing, userId }))
	}
)