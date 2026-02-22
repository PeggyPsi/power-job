import { getUserResume } from "@/features/userResumes/actions/actions";
import { inngest } from "../client";
import { env } from "@/data/env/server";
import { userResumesRepository } from "@/features/userResumes/db/userResumes.repository";

export const createAISummaryOfUploadedResume = inngest.createFunction({
	id: "createAISummaryOfUploadedResume",
	name: "When a user uploads a resume, create an AI summary of the resume and save it to the database",
}, {
	event: "app/resume.uploaded",
}, async ({ event, step }) => {
	const userId = event.data.userId;

	if (!userId) {
		console.log("No user found for event, skipping AI summary generation");
	}

	// Check if the user has a resume in the database.
	const userResume = await step.run("Get user resume", async () => {
		return await getUserResume(userId);
	});

	if (userResume == null) {
		return;
	}

	// Fetch the PDF and extract its plain text so we can pass it to the AI.
	// This avoids relying on the `document` content type in step.ai.infer,
	// which can silently fail depending on the Inngest gateway version.
	// const resumeText = await step.run("Extract text from resume PDF", async () => {
	// 	const fileRes = await fetch(userResume.resumeFileUrl);
	// 	const buffer = await fileRes.arrayBuffer();
	// 	const { text } = await extractText(new Uint8Array(buffer), { mergePages: true });
	// 	return text;
	// });

	// Use AI to create a summary of the resume and save it to the database.
	const result = await step.ai.infer("create-ai-summary", {
		/**
		 * Updated to claude-sonnet-4-5-20250929. Anthropic retired the Claude 3.5 Sonnet models
		 * (including the -latest alias) on October 28, 2025.
		 * The claude-sonnet-4-5 line is the direct successor with better performance.
		 * **/
		model: step.ai.models.anthropic({
			model: "claude-sonnet-4-5-20250929",
			defaultParameters: { max_tokens: 2048 },
			apiKey: env.ANTHROPIC_API_KEY,
		}),
		body: {
			messages: [
				{
					role: "user",
					content: [
						{
							type: "document",
							source: {
								type: "url",
								url: userResume.resumeFileUrl,
								//url: "https://assets.anthropic.com/m/1cd9d098ac3e6467/original/Claude-3-Model-Card-October-Addendum.pdf",
							},
						},
						{
							type: "text",
							text: `Summarize the following resume and extract all key skills, experience, and qualifications. 
							The summary should include all the information that a hiring manager would need to know about 
							the candidate in order to determine if they are a good fit for a job. This summary should be 
							formatted as markdown. Do not return any other text.`,
						},
					],
				},
			],
		},
	});

	// After the AI generates the summary, we save it to the database
	await step.run("Save AI summary to database", async () => {
		const message = result.content[0];
		console.log(message);
		if (message.type !== "text") return;

		await userResumesRepository.updateUserResume(userId, {
			aiSummary: message.text
		});
	});
});
