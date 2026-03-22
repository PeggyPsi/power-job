"use client";

import { DataTable } from "@/components/dataTable/DataTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  JobListingApplicationTable,
  UserResumeTable,
  UserTable,
} from "@/drizzle/schema";
import { getInitialsFromWords } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { ReactNode } from "react";

// We pass down converLetter and resume Ai Summary as markdowns is because the markdown render that
// we use so far only works on the server and here we have a client component. That's why we have to pass down these
// components pre rendered
type Application = Pick<
  typeof JobListingApplicationTable.$inferSelect,
  "createdAt" | "stage" | "rating" | "jobListingId"
> & {
  converLetterMarkdown: ReactNode | null;
  user: Pick<typeof UserTable.$inferSelect, "id" | "name" | "imageUrl"> & {
    resume:
      | (Pick<typeof UserResumeTable.$inferSelect, "resumeFileUrl"> & {
          markDownSummary: ReactNode | null;
        })
      | null;
  };
};

// how the columns of the data table are going to be rendered and which ones of them are goin to be rendered
function getColumns(
  canUpdateRating: boolean,
  canUpdateStage: boolean,
): ColumnDef<Application>[] {
  return [
    {
      accessorFn: (row) => row.user.name,
      header: "Name", // TODO: add localizxzation
      cell: ({ row }) => {
        const user = row.original.user;

        const nameInitials = getInitialsFromWords(user?.name, 2);

        return (
          <div className="flex items-center gap-2">
            <Avatar className="rounded-full size-6">
              <AvatarImage src={user.imageUrl ?? undefined} alt={user.name} />
              <AvatarFallback className="uppercase bg-primary text-primary-foreground text-xs">
                {nameInitials}
              </AvatarFallback>
            </Avatar>
            <span>{user.name}</span>
          </div>
        );
      },
    },
  ];
}

export function SkeletonApplicationTable() {
  // TODO: implement SkeletonApplicationTable
  return null;
}

export function ApplicationsTable({
  applications,
  canUpdateRating,
  canUpdateStage,
}: {
  applications: Application[];
  canUpdateRating: boolean;
  canUpdateStage: boolean;
}) {
  return (
    <DataTable
      data={applications}
      columns={getColumns(canUpdateRating, canUpdateStage)}
    />
  );
}
