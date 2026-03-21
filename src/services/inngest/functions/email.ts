import { db } from "@/drizzle/db";
import { inngest } from "../client";
import { and, eq, gte } from "drizzle-orm";
import { JobListingApplicationTable, JobListingTable, OrganizationUserSettingsTable, UserNotificationSettingsTable } from "@/drizzle/schema";
import { subDays } from "date-fns";
import { GetEvents } from "inngest";
import getMatchingJobListings from "../ai/getMatchingJobListings";
import { resend } from "@/services/resend/client";
import DailyJobListingEmail from "@/services/resend/components/DailyJobListingEmail";
import { env } from "@/data/env/server";
import DailyApplicationEmail from "@/services/resend/components/DailyApplicationEmail";

export const prepareDailyUserJobListingNotifications = inngest.createFunction(
	{
		id: "prepare-daily-user-job-listing-notifications",
		name: "Prepare Daily User Job Listing Notifications"
	},
	{
		cron: "TZ=Europe/Athens 0 7 * * *", // send at 7am every day
	}, async ({ step, event }) => {
		// select only those users that have set to be sent emails about job listings
		const getUsers = step.run("get-users", async () => {
			return await db.query.UserNotificationSettingsTable.findMany({
				where: eq(UserNotificationSettingsTable.newJobEmailNotifications, true),
				columns: {
					userId: true,
					newJobEmailNotifications: true,
					aiPrompt: true
				},
				with: {
					user: {
						columns: {
							email: true,
							name: true
						}
					}
				}
			})
		})

		// get posted job listings that where posted on the previous day of the triggered cron event
		const getJobListings = step.run("get-recent-job-listings", async () => {
			// event parameter has the timestamp on which the email is going to be sent
			// for example 7am at a particular day. Ideally we want to get the job listings
			// that where posted on the previous day and send those to the users
			return await db.query.JobListingTable.findMany({
				where: and(
					gte(JobListingTable.postedAt, subDays(new Date(event.ts ?? Date.now()), 1)),
					eq(JobListingTable.status, "published")
				),
				columns: {
					// return all the table columns except from the followig
					createdAt: false,
					postedAt: false,
					updatedAt: false,
					status: false,
					organizationId: false
				},
				with: {
					organization: {
						columns: {
							name: true
						}
					}
				}
			})
		})

		// get all data in parlallel
		const [userNotifications, jobListings] = await Promise.all([
			getUsers,
			getJobListings
		])

		if (!jobListings.length || !userNotifications.length) return;

		const events = userNotifications.map(notification => {
			return {
				name: "app/email.daily-user-job-listings",
				data: {
					aiPrompt: notification.aiPrompt ?? undefined,
					jobListings: jobListings.map(listing => {
						return {
							...listing,
							organizationName: listing.organization.name
						}
					})
				},
				user: {
					email: notification.user.email,
					name: notification.user.name
				}
				// Strongly typed return to make sure that we return the correct data for the inngest event
			} as const satisfies GetEvents<typeof inngest>["app/email.daily-user-job-listings"]
		})

		// For each user that needs a mail to be sent send the mails in parallel with appropriate fail checking
		// inngest takes care of that fduring sendEvent
		await step.sendEvent("send-emails", events);
	}
);

export const sendDailyUserJobListingEmail = inngest.createFunction(
	{
		id: "send-daily-user-job-listing-email",
		name: "Send Daily User Job Listing Email",
		// We use AI to do this filtering. We want to make sure that we do  not overload our AI
		// too many requests at once thats why we put a small throttle
		// In 1m period we can send only 10 requests
		throttle: {
			limit: 10,
			period: "1m"
		}
	},
	{
		event: "app/email.daily-user-job-listings"
	},
	async ({ event, step }) => {
		const { jobListings, aiPrompt } = event.data;
		const user = event.user;

		if (!jobListings) return;

		let matchingJobListings: typeof jobListings = [];
		if (!aiPrompt || aiPrompt?.trim() === "") {
			matchingJobListings = jobListings;
		}
		else {
			const matchingIds = await getMatchingJobListings(aiPrompt, jobListings);
			matchingJobListings = jobListings.filter(listing => matchingIds.includes(listing.id))
		}

		// we might not found any matching job listings or no job listings are posted...who knows 
		if (!matchingJobListings.length) return;

		await step.run("send-email", async () => {
			await resend.emails.send({
				from: "Power Job <powerjob@resend.dev>",
				to: user.email,
				subject: "Daily Job Listings",
				react: DailyJobListingEmail({
					jobListings,
					userName: user.name,
					serverUrl: env.SERVER_URL,
				})
			});
		})
	}
)

// We need to inform in a daily email the users of each organization about the recent applications on the published job listings
export const prepareDailyOrganizationUserApplicationNotifications = inngest.createFunction(
	{
		id: "prepare-daily-organization-user-application-notifications",
		name: "Prepare Daily Organization User Application Notifications",
	},
	{ cron: "TZ=Europe/Athens 0 7 * * *" },
	async ({ step, event }) => {
		const getOrgUserSettings = step.run("get-user-settings", async () => {
			return await db.query.OrganizationUserSettingsTable.findMany({
				where: eq(
					OrganizationUserSettingsTable.newApplicationEmailNotifications,
					true
				),
				columns: {
					userId: true,
					organizationId: true,
					newApplicationEmailNotifications: true,
					minimumRating: true,
				},
				with: {
					user: {
						columns: {
							email: true,
							name: true,
						},
					},
				},
			})
		})

		// We need the applied applications
		const getApplications = step.run("get-recent-applications", async () => {
			return await db.query.JobListingApplicationTable.findMany({
				where: and(
					gte(
						JobListingApplicationTable.createdAt,
						subDays(new Date(event.ts ?? Date.now()), 1)
					)
				),
				columns: {
					rating: true,
				},
				with: {
					user: {
						columns: {
							name: true,
						},
					},
					jobListing: {
						columns: {
							id: true,
							title: true,
						},
						with: {
							organization: {
								columns: {
									id: true,
									name: true,
								},
							},
						},
					},
				},
			})
		})

		const [orgUserSettings, applications] = await Promise.all([
			getOrgUserSettings,
			getApplications,
		])

		if (applications.length === 0 || orgUserSettings.length === 0) return

		// Group the settings by the user
		const groupedSettings = Object.groupBy(
			orgUserSettings,
			n => n.userId
		)

		const events = Object.entries(groupedSettings)
			.map(([, settings]) => {
				if (settings == null || settings.length === 0) return null
				const userName = settings[0].user.name
				const userEmail = settings[0].user.email

				// Get the applications that are of interest for the specific user
				const filteredApplications = applications
					.filter(a => {
						return settings.find(
							s =>
								s.organizationId === a.jobListing.organization.id &&
								(s.minimumRating == null ||
									(a.rating ?? 0) >= s.minimumRating)
						)
					})
					.map(a => ({
						organizationId: a.jobListing.organization.id,
						organizationName: a.jobListing.organization.name,
						jobListingId: a.jobListing.id,
						jobListingTitle: a.jobListing.title,
						userName: a.user.name,
						rating: a.rating,
					}))

				if (filteredApplications.length === 0) return null

				return {
					name: "app/email.daily-organization-user-applications",
					user: {
						name: userName,
						email: userEmail,
					},
					data: { applications: filteredApplications },
				} as const satisfies GetEvents<
					typeof inngest
				>["app/email.daily-organization-user-applications"]
			})
			.filter(v => v != null)

		await step.sendEvent("send-emails", events)
	}
);

export const sendDailyOrganizationUserApplicationEmail = inngest.createFunction(
	{
		id: "send-daily-organization-user-application-email",
		name: "Send Daily Organization User Application Email",
		throttle: {
			limit: 1000,
			period: "1m",
		},
	},
	{ event: "app/email.daily-organization-user-applications" },
	async ({ event, step }) => {
		const { applications } = event.data
		const user = event.user
		if (applications.length === 0) return

		await step.run("send-email", async () => {
			await resend.emails.send({
				from: "Power Job <powerjob@resend.dev>",
				to: user.email,
				subject: "Daily Job Listing Applications",
				react: DailyApplicationEmail({
					applications,
					userName: user.name,
				}),
			})
		})
	}
)