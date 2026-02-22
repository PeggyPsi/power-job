import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getCurrentUser } from "../clerk/lib/getCurrentAuth";
import { inngest } from "../inngest/client";
import { userResumesRepository } from "@/features/userResumes/db/userResumes.repository";
import { getUserResumeFileKey } from "@/features/userResumes/actions/actions";
import { uploadthing } from "./client";

const f = createUploadthing();

// const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function

// FileRouter for your app, can contain multiple FileRoutes
export const powerJobFileRouter = {
	// Define as many FileRoutes as you like, each with a unique routeSlug
	resumeUploader: f({
		pdf: {
			maxFileSize: "8MB",
			maxFileCount: 1,
		}
	},
		// we want to await the server data before we consider the upload complete, so we set this option to true
		{ awaitServerData: true }
	)
		// Set permissions and file types for this FileRoute
		.middleware(async ({ req }) => {
			// This code runs on your server before upload
			const { userId } = await getCurrentUser({ allData: false });

			// If you throw, the user will not be able to upload
			if (!userId) throw new UploadThingError("Unauthorized");

			// Whatever is returned here is accessible in onUploadComplete as `metadata`
			return { userId };
		})
		.onUploadComplete(async ({ metadata, file }) => {
			const { userId } = metadata;
			const oldResumeFileKey = await getUserResumeFileKey(userId);

			// We use upsert logic to either create or update the existiing resume
			await userResumesRepository.upsertUserResume(userId, {
				resumeFileUrl: file.ufsUrl, // this is the public url in which we can access the uploaded file
				resumeFileKey: file.key
			})

			// Delete old resume from database and storage. Even with upsert the old key will still exist so we need
			// to make sure that we remove it
			if (oldResumeFileKey != null) {
				await uploadthing.deleteFiles(oldResumeFileKey);
			}

			// AI Generation
			await inngest.send({ name: "app/resume.uploaded", data: { userId } });

			// !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
			return { message: "Resume uploaded successfully" };
		}),
} satisfies FileRouter;

export type PowerJobFileRouter = typeof powerJobFileRouter;
