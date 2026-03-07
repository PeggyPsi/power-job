import { experienceLevels, /*jobListingStatuses,*/ jobListingTypes, locationRequirements, wageIntervals } from "@/drizzle/schema";
import { Qahiri } from "next/font/google";
import z from "zod";

export const jobListingsSchema = z.object({
	title: z.string().min(1, "Required"),
	description: z.string().min(1, "Required"),
	locationRequirement: z.enum(locationRequirements),
	wage: z.number().int().positive().min(1).nullable(),
	wageInterval: z.enum(wageIntervals).nullable(),
	experienceLevel: z.enum(experienceLevels),
	//status: z.enum(jobListingStatuses),
	type: z.enum(jobListingTypes),
	stateAbbreviation: z.string().transform(val => val.trim() === "" ? null : val).nullable(), // with transform we ensure that empty strings are stored as null in DB
	city: z.string().transform(val => val.trim() === "" ? null : val).nullable(), // with transform we ensure that empty strings are stored as null in DB
}).refine(listing => {
	// if location is remote then we are ok.
	// if location is not remote then city must be provided.
	// if it is not povided, return false to indicate validation failure. 
	return listing.locationRequirement === "remote" || listing.city != null
}, {
	message: "City must be provided for in-office or hybrid job listings",
	path: ["city"]
}).refine(listing => {
	// if location is remote then we are ok.
	// if location is not remote then city must be provided.
	// if it is not povided, return false to indicate validation failure. 
	return listing.locationRequirement === "remote" || listing.stateAbbreviation != null
}, {
	message: "StateAbbreviation must be provided for in-office or hybrid job listings",
	path: ["stateAbbreviation"]
});

export const jobListingAiSearchSchema = z.object({
	query: z.string().min(1, "Required"),
})