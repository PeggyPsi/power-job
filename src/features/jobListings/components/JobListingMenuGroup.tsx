"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { JobListingStatus, JobListingTable } from "@/drizzle/schema";
import { useParams } from "next/navigation";
import { formatJobListingStatus } from "../lib/formatters";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";

type JobListingMenuInfoType = Pick<
  typeof JobListingTable.$inferSelect,
  "id" | "title" | "status"
> & {
  applicationCount: number;
};

export function JobListingMenuGroup({
  status,
  joblistings,
}: {
  status: JobListingStatus;
  joblistings: Array<JobListingMenuInfoType>;
}) {
  const { joblistingId } = useParams();

  return (
    <SidebarMenu>
      <Collapsible
        defaultOpen={
          status !== "delisted" ||
          joblistings.some((job) => job.id === joblistingId)
        }
        className="group/collapsible"
      >
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton>
              {formatJobListingStatus(status)}
              {/* When we are in the collapsible group and the state is open then the icon must be slightly rotated*/}
              <ChevronRightIcon className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {joblistings.map((jobListing) => (
                <JobListingMenuItem
                  key={jobListing.id}
                  jobListing={jobListing}
                />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    </SidebarMenu>
  );
}

function JobListingMenuItem({
  jobListing,
}: {
  jobListing: JobListingMenuInfoType;
}) {
  const { jobListingId } = useParams();
  return (
    <SidebarMenuSubItem className="block relative">
      <SidebarMenuSubButton isActive={jobListingId === jobListing.id} asChild>
        <Link href={`/employer/job-listings/${jobListing.id}`}>
          <span className="truncate">{jobListing.title}</span>
        </Link>
      </SidebarMenuSubButton>
      {jobListing.applicationCount > 0 && (
        <div className="absolute top-1 right-2 text-sm text-muted-foreground">
          {jobListing.applicationCount}
        </div>
      )}
    </SidebarMenuSubItem>
  );
}
