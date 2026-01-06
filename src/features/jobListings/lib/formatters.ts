import { WageInterval } from "@/drizzle/schema";

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