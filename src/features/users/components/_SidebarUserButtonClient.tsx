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
  ChevronsUpDown,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";

interface ISidebarUserButtonClientProps {
  user: ISidebarUserInfo;
}

interface ISidebarUserInfo {
  email: string;
  name: string;
  imageUrl?: string;
}

export default function SidebarUserButtonClient(
  props: ISidebarUserButtonClientProps
) {
  const { isMobile, setOpenMobile } = useSidebar();
  const { openUserProfile } = useClerk();

  return (
    <DropdownMenu>
      {/* DEV NOTE: When you pass asChild, the component will render 
		its child directly but still inject all the behavior and props into the child itself. */}
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size={"lg"}
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <UserInfo {...props.user} />
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
          <UserInfo {...props.user} />
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            openUserProfile();
            setOpenMobile(false); // so that when in mobile, when profile is opened, sidebar closes
          }}
        >
          <UserIcon className="mr-1" /> Profile
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/user-settings/notifications">
            <SettingsIcon className="mr-1" /> Settings
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
function UserInfo(user: ISidebarUserInfo) {
  // Get the initials from the user's name. For example Peggy Psi => PP
  const nameInitials = user.name
    .split(" ")
    .slice(0, 2)
    .map((str) => str[0])
    .join("");

  return (
    <div className="flex gap-2 items-center overflow-hidden">
      <Avatar className="rounded-lg size-8">
        <AvatarImage src={user.imageUrl} alt="name" />
        <AvatarFallback className="uppercase bg-primary text-primary-foreground">
          {nameInitials}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col flex-1 min-w-0 leading-tight group-data-[state=collapsed]:hidden">
        <span className="truncate text-sm font-semibold">{user.name}</span>
        <span className="truncate text-sm">{user.email}</span>
      </div>
    </div>
  );
}
