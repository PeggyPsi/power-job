import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { JobListingItems } from "../../_shared/JobListingItems";
import { IsBreakpoint } from "@/components/IsBreakpoint";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ClientSheet } from "./_ClientSheet";
import { auth } from "@clerk/nextjs/server";
import { cacheTag } from "next/cache";
import { getJobListingIdTag } from "@/features/jobListings/db/cache/jobListings";
import { db } from "@/drizzle/db";
import { and, eq } from "drizzle-orm";
import { JobListingTable } from "@/drizzle/schema";
import { getOrganizationIdTag } from "@/features/organizations/db/cache/organizations";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { convertSearchParamsToString, getInitialsFromWords } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { XIcon } from "lucide-react";
import JobListingBadges from "@/features/jobListings/components/JobListingBadges";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SignUpButton } from "@/services/clerk/components/AuthButtons";

type Props = {
  params: Promise<{ jobListingId: string }>;
  searchParams: Promise<Record<string, string | string[]>>;
};

export default async function JobListingPage({ params, searchParams }: Props) {
  const { jobListingId } = await params;
  return (
    <>
      <ResizablePanelGroup
        autoSave="job-listing-sidebar"
        orientation="horizontal"
      >
        <ResizablePanel
          id="left"
          // order={1}
          defaultSize={60}
          minSize={30}
        >
          <div className="p-4 h-screen overflow-y-auto">
            <JobListingItems params={params} searchParams={searchParams} />
          </div>
        </ResizablePanel>
        <IsBreakpoint
          breakPoint="min-width: 1024px"
          otherwise={
            <ClientSheet>
              <SheetContent hideCloseButton className="p-4">
                {/* sr-only : screen reader only -> so that screen reader users can be informed that this is a job listing details sheet */}
                <SheetHeader className="sr-only">
                  <SheetTitle></SheetTitle>
                </SheetHeader>
                <Suspense fallback={<LoadingSpinner />}>
                  <JobListingDetails
                    params={params}
                    searchParams={searchParams}
                  />
                </Suspense>
              </SheetContent>
            </ClientSheet>
          }
        >
          <ResizableHandle withHandle className="mx-2"></ResizableHandle>
          <ResizablePanel
            id="right"
            // order={2}
            defaultSize={40}
            minSize={30}
          >
            <div className="p-4 h-screen overflow-y-auto">
              <Suspense fallback={<LoadingSpinner />}>
                <JobListingDetails
                  params={params}
                  searchParams={searchParams}
                ></JobListingDetails>
              </Suspense>
            </div>
          </ResizablePanel>
        </IsBreakpoint>
      </ResizablePanelGroup>
    </>
  );
}

async function JobListingDetails({ params, searchParams }: Props) {
  const { jobListingId } = await params;

  const jobListing = await getJobListing(jobListingId);
  if (jobListing == null) return null;

  const nameInitials = getInitialsFromWords(
    jobListing.organization?.name ?? "",
    4,
  );

  return (
    <div className="space-y-6 @container">
      <div className="space-y-4">
        <div className="flex gap-4 items-start">
          <Avatar className="size-14 @max-md:hidden">
            <AvatarImage
              src={jobListing.organization.imageUrl ?? undefined}
              alt={jobListing.organization.name}
            />
            <AvatarFallback className="uppercase bg-primary text-primary-foreground">
              {nameInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight">
              {jobListing.title}
            </h1>
            <div className="text-base text-muted-foreground">
              {jobListing.organization.name}
            </div>
            {jobListing.postedAt != null && (
              <div className="text-sm text-muted-foreground @min-lg:hidden">
                {jobListing.postedAt.toLocaleDateString()}
              </div>
            )}
          </div>
          <div className="ml-auto flex items-center gap-4">
            {jobListing.postedAt != null && (
              <div className="text-sm text-muted-foreground @max-lg:hidden">
                {jobListing.postedAt.toLocaleDateString()}
              </div>
            )}
            <Button size="icon" variant="outline" asChild>
              <Link
                href={`/?${convertSearchParamsToString(await searchParams)}`}
              >
                <span className="sr-only">Close</span>
                <XIcon />
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <JobListingBadges jobListing={jobListing} />
        </div>
        <Suspense fallback={<Button disabled>Apply</Button>}>
          <ApplyButton jobListingId={jobListing.id} />
        </Suspense>
      </div>

      <MarkdownRenderer source={jobListing.description} />
    </div>
  );
}

async function ApplyButton({ jobListingId }: { jobListingId: string }) {
  const { userId } = await auth();
  if (userId == null)
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button>Apply</Button>
        </PopoverTrigger>
        <PopoverContent className="flex flex-col gap-2">
          You need to create an account before applying for a job.
          <SignUpButton />
        </PopoverContent>
      </Popover>
    );

  // TODO: check if user has already applied for this job listing
}

async function getJobListing(jobListingId: string) {
  "use cache";
  cacheTag(getJobListingIdTag(jobListingId));

  // In all cases we want job listings that are published
  const listing = await db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, jobListingId),
      eq(JobListingTable.status, "published"),
    ),
    with: {
      organization: {
        columns: {
          id: true,
          name: true,
          imageUrl: true,
        },
      },
    },
  });

  if (listing != null) {
    cacheTag(getOrganizationIdTag(listing.organization.id));
  }

  return listing;
}
