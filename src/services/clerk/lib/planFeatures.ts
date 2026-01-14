import { auth } from "@clerk/nextjs/server";
import { ClerkConfiguration } from "./ClerkConfiguration";

type PlanFeature =
	| typeof ClerkConfiguration.PlanFeatures.Post1JobListings
	| typeof ClerkConfiguration.PlanFeatures.Post3JobListings
	| typeof ClerkConfiguration.PlanFeatures.Post15JobListings
	| typeof ClerkConfiguration.PlanFeatures.FeaturedOneJobListing
	| typeof ClerkConfiguration.PlanFeatures.FeaturedUnlimitedJobListings

export async function hasPlanFeature(feature: PlanFeature) {
	const { has } = await auth();
	return has({ feature })
}