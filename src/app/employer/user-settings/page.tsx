import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Card, CardContent } from "@/components/ui/card";
import { getOrganizationUserSettings } from "@/features/organizations/actions/actions";
import OrgUserSettingsForm from "@/features/organizations/components/OrgUserSettingsForm";
import { getUserNotificationSettings } from "@/features/users/actions/actions";
import { NotificationsForm } from "@/features/users/components/NotificationsForm";
import {
  getCurrentOrganization,
  getCurrentUser,
} from "@/services/clerk/lib/getCurrentAuth";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default function EmployerUserSettingsPage() {
  return (
    <Suspense>
      <SuspendedComponent />
    </Suspense>
  );
}

async function SuspendedComponent() {
  const { userId } = await getCurrentUser({ allData: false });
  const { orgId } = await getCurrentOrganization();
  if (userId == null || orgId == null) return notFound();

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6 px-4">
      <h1 className="text-2xl font-bold">Notifications Settings</h1>
      <Card>
        <CardContent>
          <Suspense fallback={<LoadingSpinner />}>
            <SuspendedForm userId={userId} organizationId={orgId} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

async function SuspendedForm({
  userId,
  organizationId,
}: {
  userId: string;
  organizationId: string;
}) {
  const orgUserSettings = await getOrganizationUserSettings({
    userId,
    organizationId,
  });

  return <OrgUserSettingsForm settings={orgUserSettings} />;
}
