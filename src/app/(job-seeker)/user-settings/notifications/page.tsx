import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Card, CardContent } from "@/components/ui/card";
import { getUserNotificationSettings } from "@/features/users/actions/actions";
import { NotificationsForm } from "@/features/users/components/NotificationsForm";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default function UserNotificationsPage() {
  return (
    <Suspense>
      <SuspendedComponent />
    </Suspense>
  );
}

async function SuspendedComponent() {
  const { userId } = await getCurrentUser({ allData: false });
  if (userId == null) return notFound();

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6 px-4">
      <h1 className="text-2xl font-bold">Notifications Settings</h1>
      <Card>
        <CardContent>
          <Suspense fallback={<LoadingSpinner />}>
            <SuspendedForm userId={userId} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

async function SuspendedForm({ userId }: { userId: string }) {
  const notificationSettings = await getUserNotificationSettings(userId);

  return <NotificationsForm notificationSettings={notificationSettings} />;
}
