"use server";

import { cacheTag } from "next/cache";
import { getOrganizationUserSettingsIdTag } from "../db/cache/organizationUserSettings";
import { db } from "@/drizzle/db";
import { OrganizationUserSettingsTable, UserNotificationSettingsTable } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import z from "zod";
import { organizationUserSettingsSchema } from "./schemas";
import { getCurrentOrganization, getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";
import { organizationUserSettingsRepository } from "../db/organizationUserSettings.repository";

export async function getOrganizationUserSettings({ userId, organizationId }: { userId: string, organizationId: string }) {
	"use cache";
	cacheTag(getOrganizationUserSettingsIdTag({ userId, organizationId }));

	return db.query.OrganizationUserSettingsTable.findFirst({
		where: and(
			eq(OrganizationUserSettingsTable.userId, userId),
			eq(OrganizationUserSettingsTable.organizationId, organizationId),
		),
		columns: {
			newApplicationEmailNotifications: true,
			minimumRating: true
		}
	});
}

export async function updateOrganizationUserSettings(unsafeData: z.infer<typeof organizationUserSettingsSchema>) {
	const { userId } = await getCurrentUser({ allData: false });
	const { orgId } = await getCurrentOrganization();
	if (!userId || !orgId)
		return {
			error: true,
			message: "You must be logged in to update your notification settings.",
		};

	// We try and make sure that the data are valid before proceeding
	const { success, data } = organizationUserSettingsSchema.safeParse(unsafeData);
	if (!success) {
		return {
			error: true,
			message: "The provided data is invalid.",
		}
	}

	await organizationUserSettingsRepository.update(userId, orgId, data);

	return {
		error: false,
		message: "Successfully updated your organization user settings.",
	};
}