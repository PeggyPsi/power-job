import { ExperienceLevel, JobListingStatus, JobListingType, LocationRequirement, WageInterval } from "@/drizzle/schema";
import { currencyFormatter } from "@/lib/utils";

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

export function formatJobListingStatus(status: JobListingStatus) {
	switch (status) {
		case "draft":
			return "Draft";
		case "published":
			return "Published";
		case "delisted":
			return "Delisted";
		default:
			throw new Error(`Unknown job listing status: ${status}`);
	}
}

export function formatWage(wage: number, wageInterval: WageInterval) {
	switch (wageInterval) {
		case "hourly": {
			return `${currencyFormatter().format(wage)} / hr`
		}
		case "yearly": {
			return `${currencyFormatter().format(wage)}`
		}
		default:
			// DEV: with the `satisfies never` I make sure that in case in the future i add a
			// new wageInterval type enum, the compiler will let me know that it is not handled in this case switch
			// This forces me to update the switch.
			throw new Error(`Unknown wage interval: ${wageInterval satisfies never}`)
	}
}

// Combines state and city into one single string
export function formatJobListingLocation({ stateAbbreviation, city }: {
	stateAbbreviation: string | null,
	city: string | null
}) {
	if (stateAbbreviation === null && city === null) return "None";

	const locationParts = [];
	if (city) locationParts.push(city);
	if (stateAbbreviation) locationParts.push(stateAbbreviation.toUpperCase())

	return locationParts.join(', ');
}