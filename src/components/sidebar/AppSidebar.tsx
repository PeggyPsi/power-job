import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebarClient } from "./_AppSidebarClient";
import { SignedIn } from "@clerk/nextjs";

export function AppSidebar({
  content,
  footerButton,
  children,
}: {
  content: React.ReactNode;
  footerButton: React.ReactNode;
  children: React.ReactNode;
}) {
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
          <SidebarContent>{content}</SidebarContent>
          {/* Footer */}
          <SignedIn>
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>{footerButton}</SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </SignedIn>
        </Sidebar>
        <main className="flex-1">{children}</main>
      </AppSidebarClient>
    </SidebarProvider>
  );
}
