import { Card, CardContent } from "@/components/ui/card";
import JobListingForm from "@/features/jobListings/components/JobListingForm";

export default function NewJobListingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4">
      <h1 className="text-2xl font-bold mb-2">New Job Listing</h1>
      <p className="text-mited-foreground mb-6">
        This does not post the listing yet. It just saves the draft.
      </p>
      <Card>
        <CardContent>
          <JobListingForm></JobListingForm>
        </CardContent>
      </Card>
    </div>
  );
}
