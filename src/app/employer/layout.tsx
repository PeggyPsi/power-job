import { AppSidebar } from "@/components/sidebar/AppSidebar";
import {
  SidebarNavMenuGroup,
  SidebarNavMenuGroupItem,
} from "@/components/sidebar/SidebarNavMenuGroup";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import SidebarOrganizationBtn from "@/features/organizations/components/SidebarOrganizationBtn";
import { ClipboardListIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <LayoutSuspense>{children}</LayoutSuspense>
    </Suspense>
  );
}

async function LayoutSuspense({ children }: { children: React.ReactNode }) {
  const menuItems: Array<SidebarNavMenuGroupItem> = [
    {
      href: "/",
      label: "Power Job",
      icon: <ClipboardListIcon />,
    },
  ];

  return (
    <AppSidebar
      content={
        <>
          <SidebarGroup>
            <SidebarGroupLabel>Job Listings</SidebarGroupLabel>
            <SidebarGroupAction title="Add Job Listing" asChild>
              <Link href={"/employer/job-listings/new"}>
                <PlusIcon /> <span className="sr-only">Add Job Listing</span>
              </Link>
            </SidebarGroupAction>
          </SidebarGroup>
          <SidebarNavMenuGroup className="mt-auto" items={menuItems} />
        </>
      }
      footerButton={<SidebarOrganizationBtn />}
    >
      {children}
    </AppSidebar>
  );
}
