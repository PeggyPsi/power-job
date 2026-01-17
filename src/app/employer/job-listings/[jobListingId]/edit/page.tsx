import { Card, CardContent } from "@/components/ui/card";
import { getJobListing } from "@/features/jobListings/actions/actions";
import JobListingForm from "@/features/jobListings/components/JobListingForm";
import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface IPageProps {
  params: Promise<{ jobListingId: string }>;
}

export default function JobListingEdit(props: IPageProps) {
  return (
    <div className="max-w-5xl mx-auto px-4">
      <h1 className="text-2xl font-bold mb-2">Edit Job Listing</h1>
      <p className="text-mited-foreground mb-6">
        This does not post the listing yet. It just saves the draft.
      </p>
      <Card>
        <CardContent>
          <Suspense>
            <SuspendedPage params={props.params} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

async function SuspendedPage({ params }: IPageProps) {
  const { orgId } = await getCurrentOrganization();
  if (!orgId) return null;

  const { jobListingId } = await params;
  const jobListing = await getJobListing(jobListingId, orgId);
  if (!jobListing) return notFound();

  return <JobListingForm jobListing={jobListing} />;
}
