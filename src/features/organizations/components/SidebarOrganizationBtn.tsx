import {
  getCurrentOrganization,
  getCurrentUser,
} from "@/services/clerk/lib/getCurrentAuth";
import { SignOutButton } from "@clerk/nextjs";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { LogOutIcon } from "lucide-react";
import SidebarOrganizationButtonClient from "./_SidebarOrganizationButtonClient";

export default async function SidebarOrganizationBtn() {
  const [{ user }, { organization }] = await Promise.all([
    getCurrentUser({ allData: true }),
    getCurrentOrganization(true),
  ]);

  if (!user || !organization) {
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
    <SidebarOrganizationButtonClient
      user={{
        email: user.email,
      }}
      organization={{
        name: organization.name,
        imageUrl: organization.imageUrl || undefined,
      }}
    />
  );
}
