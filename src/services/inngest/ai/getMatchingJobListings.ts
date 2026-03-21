import { env } from "@/data/env/server";
import { experienceLevels, jobListingTypes, locationRequirements, wageIntervals } from "@/drizzle/schema";
import { anthropic, createAgent, gemini } from "@inngest/agent-kit";
import z from "zod";
import { getLastOutputMessage } from "./getLastOutputMessage";

const listingsSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string(),
	wage: z.number().nullable(),
	wageInterval: z.enum(wageIntervals).nullable(),
	stateAbbreviation: z.string().nullable(),
	city: z.string().nullable(),
	experienceLevel: z.enum(experienceLevels),
	type: z.enum(jobListingTypes),
	locationRequirement: z.enum(locationRequirements),
})

export default async function getMatchingJobListings(prompt: string,
	jobListings: z.infer<typeof listingsSchema>[],
	{ maxNumberOfJobs }: { maxNumberOfJobs?: number } = {}
) {
	const NO_JOBS = "NO JOBS";
	const agent = createAgent({
		name: "Job Matching Agent",
		description: "Agent for matching users with job listings",
		system: `You are an expert at matching people with jobs based on their specific experience, and requirements. The provided user prompt will be a description that can include information about themselves as well what they are looking for in a job. ${maxNumberOfJobs
			? `You are to return up to ${maxNumberOfJobs} jobs.`
			: `Return all jobs that match their requirements.`
			} Your entire response must be ONLY a comma-separated list of job ids with no other text, explanation, or punctuation. Do not include any sentences, labels, or commentary — output the raw ids only. If you cannot find any jobs that match the user prompt, output only the text "${NO_JOBS}" with no other text. Here is the JSON array of available job listings: ${JSON.stringify(
				jobListings.map(listing =>
					// Anything that could be null we pass along as undefined so that it is not passed along
					// We're doing it to decrease the number of tokens that are going to be spent by the ai provider
					listingsSchema
						.transform(listing => ({
							...listing,
							wage: listing.wage ?? undefined,
							wageInterval: listing.wageInterval ?? undefined,
							city: listing.city ?? undefined,
							stateAbbreviation: listing.stateAbbreviation ?? undefined,
							locationRequirement: listing.locationRequirement ?? undefined,
						}))
						.parse(listing)
				)
			)}`,
		model: anthropic({
			model: "claude-sonnet-4-5-20250929",
			defaultParameters: { max_tokens: 2048 },
			apiKey: env.ANTHROPIC_API_KEY,
		})
	});

	const result = await agent.run(prompt);
	const lastMessage = getLastOutputMessage(result);
	if (!lastMessage || lastMessage == NO_JOBS) return [];

	// remove all “falsy” values from an array and retyurn all the resulted job listing ids
	return lastMessage.split(",").map(jobId => jobId.trim()).filter(Boolean);
}

// export const getMatchingJobListings = createAgent({
// 	name: "Applicant Ranking Agent",
// 	description: "Agent for ranking job applicants for specific job listings based on their resume and cover letter.",
// 	system: `You are an expert at ranking job applicants for specific jobs based
// 	on their resume and cover letter. You will be provided with a user prompt that includes a user's id,
// 	resume and cover letter as well as the job listing they are applying for in JSON. Your task is to compare
// 	the job listing with the applicant's resume and cover letter and provide a rating for the applicant on how
// 	well they fit that specific job listing. The rating should be a number between 1 and 5, where 5 is the highest
// 	rating indicating a perfect or near perfect match. A rating 3 should be used for applicants that barely meet
// 	the requirements of the job listing, while a rating of 1 should be used for applicants that do not meet the
// 	requirements at all. You should save this user rating in the database and not return any output.`,
// 	// Code that the AI can run to achive what is requested in the system prompt message for example how to save the ranking in the database
// 	// tools: [saveApplicantRatingTool],
// 	model: anthropic({
// 		model: "claude-sonnet-4-5-20250929",
// 		defaultParameters: { max_tokens: 2048 },
// 		apiKey: env.ANTHROPIC_API_KEY,
// 	})
// })