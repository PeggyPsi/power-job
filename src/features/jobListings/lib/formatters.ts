import { LocationRequirement, WageInterval } from "@/drizzle/schema";

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