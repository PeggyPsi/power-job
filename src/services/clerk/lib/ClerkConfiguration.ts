export const ClerkConfiguration = {
	// Based on the permissions used in clerk role and plan definition
	UserPermissions: {
		JobListings: {
			Create: 'org:job_listings:create',
			Delete: 'org:job_listings:delete',
			Update: 'org:job_listings:update',
			ChangeStatus: 'org:job_listings:change_status'
		},
		JobListingApplications: {
			ChangeRating: 'org:job_listing_applications:change_rating',
			ChangeStage: 'org:job_listing_applications:change_stage'
		}
	},
	// Based on the features used in the clerk subsiptions plans configuration
	// https://dashboard.clerk.com/apps/app_36naCCur0diuRvigKBeFeIUCKCx/instances/ins_36naCGY2rgeV8sl1Ebse98w9Ef8/features
	PlanFeatures: {
		Post1JobListings: 'post_1_job_listing',
		Post3JobListings: 'post_3_job_listings',
		Post15JobListings: 'post_15_job_listings',
		FeaturedOneJobListing: '1_featured_job_listing',
		FeaturedUnlimitedJobListings: 'unlimited_featured_job_listings'
	}
} as const;
