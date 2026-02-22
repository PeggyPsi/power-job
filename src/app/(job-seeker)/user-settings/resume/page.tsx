import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Suspense } from "react";
import { DropzoneClient } from "./_DropzoneClient";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";
import { getUserResume } from "@/features/userResumes/actions/actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";

export default function UserResumePage() {
  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6 px-4">
      <h1 className="text-2xl font-bold">Upload your resume</h1>
      <Card>
        <CardContent>
          <DropzoneClient />
        </CardContent>
        <Suspense>
          <ResumeDetails />
        </Suspense>
      </Card>
      <Suspense>
        <AISummaryCard />
      </Suspense>
    </div>
  );
}

async function ResumeDetails() {
  const { userId } = await getCurrentUser({ allData: false });
  if (userId === null) return null;

  const userResume = await getUserResume(userId);
  if (!userResume) return null;

  return (
    <CardFooter>
      <Button asChild>
        <Link
          href={userResume.resumeFileUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          View resume
        </Link>
      </Button>
    </CardFooter>
  );
}

async function AISummaryCard() {
  const { userId } = await getCurrentUser({ allData: false });
  if (userId === null) return null;

  const userResume = await getUserResume(userId);
  if (!userResume || !userResume.aiSummary) return null; // make sure that we have a summary to show

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>AI Summary</CardTitle>
        <CardDescription>
          This is an AI generated summary summary of your resume. This is used
          by employers to quickly understand your qualifications and experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <MarkdownRenderer source={userResume.aiSummary}></MarkdownRenderer>
      </CardContent>
    </Card>
  );
}
