import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/drizzle/db";
import {
  experienceLevels,
  JobListingTable,
  jobListingTypes,
  locationRequirements,
  OrganizationTable,
} from "@/drizzle/schema";
import {
  cn,
  convertSearchParamsToString,
  getInitialsFromWords,
} from "@/lib/utils";
import { and, desc, eq, ilike, or, SQL } from "drizzle-orm";
import Link from "next/link";
import { Suspense } from "react";
import { differenceInDays } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { connection } from "next/dist/server/request/connection";
import JobListingBadges from "@/features/jobListings/components/JobListingBadges";
import z from "zod";
import { cacheTag } from "next/cache";
import { getJobListingsGlobalTag } from "@/features/jobListings/db/cache/jobListings";
import { getOrganizationIdTag } from "@/features/organizations/db/cache/organizations";

type Props = {
  params?: Promise<{ jobListingId: string }>;
  searchParams: Promise<Record<string, string | string[]>>;
};

const searchParamsSchema = z.object({
  title: z.string().optional().catch(undefined),
  city: z.string().optional().catch(undefined),
  state: z.string().optional().catch(undefined),
  experience: z.enum(experienceLevels).optional().catch(undefined),
  locationRequirement: z.enum(locationRequirements).optional().catch(undefined),
  type: z.enum(jobListingTypes).optional().catch(undefined),
  // jobIds is going to be used during AI integration where AI might need to search for multiple job listings
  // tehre might be passed one or more ids, so handle accordingly (string, or array of strings)
  jobIds: z
    .union([z.string(), z.array(z.string())])
    .transform((v) => (Array.isArray(v) ? v : [v]))
    .optional()
    .catch([]),
});

export function JobListingItems(props: Props) {
  return (
    <Suspense>
      <SuspendedComponent {...props} />
    </Suspense>
  );
}

async function SuspendedComponent({ searchParams, params }: Props) {
  const { success, data } = await searchParamsSchema.safeParseAsync(
    await searchParams,
  );
  const search = success ? data : {}; // if everythign was valid, then use the returned data, else empty search

  const joblistingId = params ? (await params).jobListingId : undefined;
  const joblistings = await getJobListings(await searchParams, joblistingId);

  if (joblistings.length === 0) {
    return (
      <div className="text-muted-foreground p-4">No job listings found</div>
    );
  }

  return (
    <div className="space-y-4">
      {joblistings.map((joblisting) => (
        <Link
          key={joblisting.id}
          href={`/job-listings/${joblisting.id}?${convertSearchParamsToString(search)}`}
          className="block"
        >
          <JobListingsListItem
            jobListing={joblisting}
            organization={joblisting.organization}
          ></JobListingsListItem>
        </Link>
      ))}
    </div>
  );
}

function JobListingsListItem({
  jobListing,
  organization,
}: {
  jobListing: typeof JobListingTable.$inferSelect;
  organization: Pick<
    typeof OrganizationTable.$inferSelect,
    "name" | "imageUrl"
  >;
}) {
  const nameInitials = getInitialsFromWords(organization?.name, 4);

  return (
    <Card
      className={cn(
        "@container",
        jobListing.isFeatured && "border-featured bg-featured/20",
      )}
    >
      <CardHeader>
        <div className="flex gap-4">
          <Avatar className="size-14 @max-sm:hidden">
            <AvatarImage src={organization?.imageUrl ?? undefined} />
            <AvatarFallback className="uppercase bg-primary text-primary-foreground">
              {nameInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <CardTitle className="text-xl">{jobListing.title}</CardTitle>
            <CardDescription className={"text-base"}>
              {organization.name}
            </CardDescription>
            {jobListing.postedAt != null && (
              <div className="text-sm font-medium text-primary @min-md:hidden">
                {/* TODO: create an override of toLocaleDateString to support localization based on user preference */}
                <Suspense
                  fallback={jobListing.postedAt.toLocaleDateString("en-GB")}
                >
                  <DaysSincePosted postedAt={jobListing.postedAt} />
                </Suspense>
              </div>
            )}
          </div>
          {/* Render for smaller screens */}
          {jobListing.postedAt != null && (
            <div className="text-sm font-medium text-primary ml-auto @max-md:hidden">
              <Suspense
                fallback={jobListing.postedAt.toLocaleDateString("en-GB")}
              >
                <DaysSincePosted postedAt={jobListing.postedAt} />
              </Suspense>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <JobListingBadges
          jobListing={jobListing}
          className={jobListing.isFeatured ? "border-primary/35" : undefined}
        />
      </CardContent>
    </Card>
  );
}

// Computes and renders the difference in days between the oposting date and the current date
async function DaysSincePosted({ postedAt }: { postedAt: Date }) {
  await connection(); // We are using dynamic data so we need to await
  const daysSincePosted = differenceInDays(postedAt, new Date());

  if (daysSincePosted === 0) {
    // Job listing was posted in the last 24 hours
    return <Badge>New</Badge>;
  }

  return new Intl.RelativeTimeFormat(undefined, {
    style: "narrow",
    numeric: "always",
  }).format(-daysSincePosted, "days");
}

async function getJobListings(
  searchParams: z.infer<typeof searchParamsSchema>,
  jobListingId: string | undefined,
) {
  "use cache";
  cacheTag(getJobListingsGlobalTag());

  const whereConditions = getWhereConditionsBySearchParams(searchParams);

  // In all cases we want job listings that are published
  const listings = await db.query.JobListingTable.findMany({
    where: or(
      jobListingId
        ? and(
            eq(JobListingTable.id, jobListingId),
            eq(JobListingTable.status, "published"),
          )
        : undefined,
      and(eq(JobListingTable.status, "published"), ...whereConditions),
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
    orderBy: [desc(JobListingTable.isFeatured), desc(JobListingTable.postedAt)],
  });

  listings.forEach((listing) => {
    cacheTag(getOrganizationIdTag(listing.organization.id));
  });

  return listings;
}

function getWhereConditionsBySearchParams(
  searchParams: z.infer<typeof searchParamsSchema>,
) {
  const whereConditions: (SQL | undefined)[] = [];

  if (searchParams.title) {
    whereConditions.push(
      ilike(JobListingTable.title, `%${searchParams.title}%`),
    );
  }

  if (searchParams.locationRequirement) {
    whereConditions.push(
      eq(JobListingTable.locationRequirement, searchParams.locationRequirement),
    );
  }

  if (searchParams.city) {
    whereConditions.push(ilike(JobListingTable.city, `%${searchParams.city}%`));
  }

  if (searchParams.state) {
    whereConditions.push(
      eq(JobListingTable.stateAbbreviation, searchParams.state),
    );
  }

  if (searchParams.experience) {
    whereConditions.push(
      eq(JobListingTable.experienceLevel, searchParams.experience),
    );
  }

  if (searchParams.type) {
    whereConditions.push(eq(JobListingTable.type, searchParams.type));
  }

  if (searchParams.jobIds) {
    console.debug(searchParams.jobIds);
    if (typeof searchParams.jobIds === "string") {
      const jobId = searchParams.jobIds;
      whereConditions.push(eq(JobListingTable.id, jobId));
    } else {
      whereConditions.push(
        or(
          ...searchParams.jobIds.map((jobId) => eq(JobListingTable.id, jobId)),
        ),
      );
    }
  }

  return whereConditions;
}
