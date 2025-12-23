"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface SidebarNavMenuGroupItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  authStatus?: "signedIn" | "signedOut";
}

interface SidebarNavMenuGroupProps {
  items: SidebarNavMenuGroupItem[];
  className?: string;
}

export function SidebarNavMenuGroup(props: SidebarNavMenuGroupProps) {
  const pathname = usePathname();

  return (
    <SidebarGroup className={props.className}>
      <SidebarMenu>
        {props.items.map((item) => {
          const menuItemContent = (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton asChild isActive={pathname === item.href}>
                <Link href={item.href}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );

          if (item.authStatus === "signedOut") {
            return <SignedOut key={item.label}>{menuItemContent}</SignedOut>;
          } else if (item.authStatus === "signedIn") {
            return <SignedIn key={item.label}>{menuItemContent}</SignedIn>;
          } else return menuItemContent;
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
