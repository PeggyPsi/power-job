import z from "zod";

export const newJobListingApplicationsSchema = z.object({
	coverLetter: z.string().transform(val => (val.trim() === "" ? null : val.trim())).nullable()
});