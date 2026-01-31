import { AsyncIf } from "@/components/AsyncIf";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import {
  SidebarNavMenuGroup,
  SidebarNavMenuGroupItem,
} from "@/components/sidebar/SidebarNavMenuGroup";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { db } from "@/drizzle/db";
import {
  JobListingApplicationTable,
  JobListingStatus,
  JobListingTable,
} from "@/drizzle/schema";
import { getJobListingApplicationJobListingTag } from "@/features/jobListingApplications/db/cache/jobListingApplications";
import { JobListingMenuGroup } from "@/features/jobListings/components/JobListingMenuGroup";
import { getJobListingsOrganizationTag } from "@/features/jobListings/db/cache/jobListings";
import { sortJobListingsByStatus } from "@/features/jobListings/lib/utils";
import SidebarOrganizationBtn from "@/features/organizations/components/SidebarOrganizationBtn";
import { ClerkConfiguration } from "@/services/clerk/lib/ClerkConfiguration";
import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth";
import { hasOrgUserPermission } from "@/services/clerk/lib/orgUserPermissions";
import { count, desc, eq } from "drizzle-orm";
import { ClipboardListIcon, PlusIcon } from "lucide-react";
import { cacheTag } from "next/cache";
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

  const { orgId } = await getCurrentOrganization();
  if (!orgId) return null;

  return (
    <AppSidebar
      content={
        <>
          <SidebarGroup>
            <SidebarGroupLabel>Job Listings</SidebarGroupLabel>
            <AsyncIf
              condition={() =>
                hasOrgUserPermission(
                  ClerkConfiguration.UserPermissions.JobListings.Create,
                )
              }
            >
              <SidebarGroupAction title="Add Job Listing" asChild>
                <Link href={"/employer/job-listings/new"}>
                  <PlusIcon /> <span className="sr-only">Add Job Listing</span>
                </Link>
              </SidebarGroupAction>
            </AsyncIf>
            <SidebarGroupContent className="group-data-[state=collapsed]:hidden">
              <Suspense>
                <JobListingMenu orgId={orgId}></JobListingMenu>
              </Suspense>
            </SidebarGroupContent>
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

async function JobListingMenu({ orgId }: { orgId: string }) {
  const jobListings = await getJobListings(orgId);

  // If no joblistings exists then show a button to create a new job listing
  if (
    jobListings.length === 0 &&
    (await hasOrgUserPermission(
      ClerkConfiguration.UserPermissions.JobListings.Create,
    ))
  ) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href={"/employer/job-listings/new"}>
              <PlusIcon />
              <span>Create your first job listing</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return Object.entries(Object.groupBy(jobListings, (j) => j.status))
    .sort(([a], [b]) => {
      return sortJobListingsByStatus(
        a as JobListingStatus,
        b as JobListingStatus,
      );
    })
    .map(([status, jobListings]) => {
      return (
        <JobListingMenuGroup
          key={status}
          status={status as JobListingStatus}
          joblistings={jobListings}
        />
      );
    });
}

async function getJobListings(orgId: string) {
  "use cache";
  cacheTag(getJobListingsOrganizationTag(orgId));

  const data = await db
    .select({
      id: JobListingTable.id,
      title: JobListingTable.title,
      status: JobListingTable.status,
      applicationCount: count(JobListingApplicationTable.userId),
    })
    .from(JobListingTable)
    .where(eq(JobListingTable.organizationId, orgId))
    .leftJoin(
      JobListingApplicationTable,
      eq(JobListingTable.id, JobListingApplicationTable.jobListingId),
    )
    .groupBy(JobListingApplicationTable.jobListingId, JobListingTable.id)
    .orderBy(desc(JobListingTable.createdAt));

  data.forEach((jobListing) => {
    // cache the job listing applications by the job listing id
    cacheTag(getJobListingApplicationJobListingTag(jobListing.id));
  });

  return data;
}
