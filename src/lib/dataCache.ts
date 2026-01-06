// Custom caching system

type CacheTag = "users" | "organizations" | "jobListings" | "jobListingApplications" | "userResumes" | "userNotificationSettings" | "organizationUserSettings";

export function getGlobalTag(tag: CacheTag) {
	return `global:${tag}` as const;
}

export function getOrganizationTag(tag: CacheTag, orgaizationId: string) {
	return `organization:${orgaizationId}-${tag}` as const;
}

export function getIdTag(tag: CacheTag, id: string) {
	return `id:${id}-${tag}` as const;
}