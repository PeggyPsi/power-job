import { env } from "@/data/env/server"
import { jobListingApplicationsRepository } from "@/features/jobListingApplications/db/jobListingApplications.repository"
import { anthropic, createAgent, createTool } from "@inngest/agent-kit"
import z from "zod"

const saveApplicantRatingTool = createTool({
	name: "save-applicant-rating",
	description: "Saves the applicant's ranking for a specific job listing in the database",
	parameters: z.object({
		jobListingId: z.string(),
		userId: z.string(),
		rating: z.number().int().max(5).min(1),
	}),
	handler: async ({ jobListingId, userId, rating }) => {
		await jobListingApplicationsRepository.update({ jobListingId, userId }, { rating })

		return "Successfully saved applicant ranking score"; // we return a message of success so that the AI can be informed that th operation finished
	}
})

export const applicantRankingAgent = createAgent({
	name: "Applicant Ranking Agent",
	description: "Agent for ranking job applicants for specific job listings based on their resume and cover letter.",
	system: `You are an expert at ranking job applicants for specific jobs based 
	on their resume and cover letter. You will be provided with a user prompt that includes a user's id, 
	resume and cover letter as well as the job listing they are applying for in JSON. Your task is to compare 
	the job listing with the applicant's resume and cover letter and provide a rating for the applicant on how 
	well they fit that specific job listing. The rating should be a number between 1 and 5, where 5 is the highest 
	rating indicating a perfect or near perfect match. A rating 3 should be used for applicants that barely meet 
	the requirements of the job listing, while a rating of 1 should be used for applicants that do not meet the 
	requirements at all. You should save this user rating in the database and not return any output.`,
	// Code that the AI can run to achive what is requested in the system prompt message for example how to save the ranking in the database
	tools: [saveApplicantRatingTool],
	model: anthropic({
		model: "claude-sonnet-4-5-20250929",
		defaultParameters: { max_tokens: 2048 },
		apiKey: env.ANTHROPIC_API_KEY,
	})
})