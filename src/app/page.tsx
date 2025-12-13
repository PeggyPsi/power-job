import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebarClient } from "./_AppSidebarClient";
import Link from "next/link";
import { LogInIcon } from "lucide-react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import SidebarUserBtn from "@/features/users/components/SidebarUserBtn";

export default function HomePage() {
  return (
    <SidebarProvider className="overflow-y-hidden">
      <AppSidebarClient>
        <Sidebar collapsible="icon" className="overflow-hidden">
          {/* Header */}
          <SidebarHeader className="flex-row">
            <SidebarTrigger />
            <span className="text-xl text-nowrap">Power Job</span>
          </SidebarHeader>
          {/* Main Content */}
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                {/* Sign in */}
                <SignedOut>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/sign-in">
                        <LogInIcon />
                        <span>Sign In</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SignedOut>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          {/* Footer */}
          <SidebarFooter>
            <SidebarMenu>
              <SignedIn>
                <SidebarUserBtn />
              </SignedIn>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1">asdasd</main>
      </AppSidebarClient>
    </SidebarProvider>
  );
}
