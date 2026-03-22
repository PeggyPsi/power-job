import { ApplicationStage } from "@/drizzle/schema";

const APPLICATION_STAGE_SORT_ORDER: Record<ApplicationStage, number> = {
	applied: 0,
	interested: 1,
	interviewed: 2,
	hired: 3,
	denied: 4
}

export function sortApplicationsByStage(a: ApplicationStage, b: ApplicationStage) {
	// Check if bigger order number than b, then return it before b.
	return APPLICATION_STAGE_SORT_ORDER[a] - APPLICATION_STAGE_SORT_ORDER[b];
}