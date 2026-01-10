import { ExperienceLevel, JobListingType, LocationRequirement, WageInterval } from "@/drizzle/schema";

export function formatWageInterval(interval: WageInterval) {
	switch (interval) {
		case "hourly":
			return "per hour";
		case "yearly":
			return "per year";
		default:
			throw new Error(`Unknown wage interval: ${interval}`);
	}
}

export function formatLocationRequirement(locationRequirement: LocationRequirement) {
	switch (locationRequirement) {
		case "in-office":
			return "In Office";
		case "hybrid":
			return "Hybrid";
		case "remote":
			return "Remote";
		default:
			throw new Error(`Unknown location requirement: ${locationRequirement}`);
	}
}

export function formatJobListingType(jobType: JobListingType) {
	switch (jobType) {
		case "internship":
			return "Internship";
		case "full-time":
			return "Full Time";
		case "part-time":
			return "Part Time";
		default:
			throw new Error(`Unknown job listing type: ${jobType}`);
	}
}

export function formatExperienceLevel(expLvl: ExperienceLevel) {
	switch (expLvl) {
		case "junior":
			return "Junior";
		case "mid-level":
			return "Mid-Level";
		case "senior":
			return "Senior";
		default:
			throw new Error(`Unknown experience level: ${expLvl}`);
	}
}