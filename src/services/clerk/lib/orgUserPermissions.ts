import { auth } from "@clerk/nextjs/server";
import { ClerkConfiguration } from "./ClerkConfiguration";

// Use flag enum for easily checking
type UserPermission =
	| typeof ClerkConfiguration.UserPermissions.JobListings.Create
	| typeof ClerkConfiguration.UserPermissions.JobListings.Delete
	| typeof ClerkConfiguration.UserPermissions.JobListings.Update
	| typeof ClerkConfiguration.UserPermissions.JobListings.ChangeStatus
	| typeof ClerkConfiguration.UserPermissions.JobListingApplications.ChangeRating
	| typeof ClerkConfiguration.UserPermissions.JobListingApplications.ChangeStage

export async function hasOrgUserPermission(permission: UserPermission) {
	const { has } = await auth();
	return has({ permission })
}