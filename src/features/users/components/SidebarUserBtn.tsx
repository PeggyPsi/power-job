import SidebarUserButtonClient from "./_SidebarUserButtonClient";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";
import { SignOutButton } from "@clerk/nextjs";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { LogOutIcon } from "lucide-react";

export default async function SidebarUserBtn() {
  const { user } = await getCurrentUser({ allData: true });

  if (!user) {
    // In case user reaches here without being logged in, we show a simple log out button
    return (
      <SignOutButton>
        <SidebarMenuButton>
          <LogOutIcon />
          <span>Log Out</span>
        </SidebarMenuButton>
      </SignOutButton>
    );
  }

  return (
    <SidebarUserButtonClient
      user={{
        email: user.email,
        name: user.name,
        imageUrl: user.imageUrl || undefined,
      }}
    />
  );
}
