"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { SignOutButton, useClerk } from "@clerk/nextjs";
import {
  ArrowLeftRightIcon,
  Building2Icon,
  ChevronsUpDown,
  CreditCardIcon,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
  UserRoundCogIcon,
} from "lucide-react";
import Link from "next/link";

interface ISidebarUserButtonClientProps {
  user: ISidebarUserInfo;
  organization: ISidebarOrganizationInfo;
}

interface ISidebarUserInfo {
  email: string;
}

interface ISidebarOrganizationInfo {
  name: string;
  imageUrl?: string;
}

export default function SidebarOrganizationButtonClient(
  props: ISidebarUserButtonClientProps
) {
  const { isMobile, setOpenMobile } = useSidebar();
  const { openOrganizationProfile } = useClerk();

  return (
    <DropdownMenu>
      {/* DEV NOTE: When you pass asChild, the component will render 
		its child directly but still inject all the behavior and props into the child itself. */}
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size={"lg"}
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <OrganizationInfo
            organization={props.organization}
            user={props.user}
          />
          <ChevronsUpDown className="ml-auto group-data-[state=collapsed]:hidden" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        sideOffset={4}
        align="end"
        side={isMobile ? "bottom" : "right"}
        className="min-w-64 max-w-80"
      >
        <DropdownMenuLabel className="font-normal p-1">
          <OrganizationInfo
            organization={props.organization}
            user={props.user}
          />
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            openOrganizationProfile();
            setOpenMobile(false); // so that when in mobile, when profile is opened, sidebar closes
          }}
        >
          <Building2Icon className="mr-1" /> Manage Organization
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/employer/user-settings">
            <UserRoundCogIcon className="mr-1" /> User Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/employer/pricing">
            <CreditCardIcon className="mr-1" /> Change Plan
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/organizations/select">
            <ArrowLeftRightIcon className="mr-1" /> Switch Organization
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <SignOutButton>
          <DropdownMenuItem>
            <LogOutIcon className="mr-1" /> Sign out
          </DropdownMenuItem>
        </SignOutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Render the actual user info in the meun button
function OrganizationInfo({
  organization,
  user,
}: {
  organization: ISidebarOrganizationInfo;
  user: ISidebarUserInfo;
}) {
  // Get the initials from the user's name. For example Peggy Psi => PP
  const nameInitials = organization.name
    .split(" ")
    .slice(0, 2)
    .map((str) => str[0])
    .join("");

  return (
    <div className="flex gap-2 items-center overflow-hidden">
      <Avatar className="rounded-lg size-8">
        <AvatarImage src={organization.imageUrl} alt="name" />
        <AvatarFallback className="uppercase bg-primary text-primary-foreground">
          {nameInitials}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col flex-1 min-w-0 leading-tight group-data-[state=collapsed]:hidden">
        <span className="truncate text-sm font-semibold">
          {organization.name}
        </span>
        <span className="truncate text-sm">{user.email}</span>
      </div>
    </div>
  );
}
