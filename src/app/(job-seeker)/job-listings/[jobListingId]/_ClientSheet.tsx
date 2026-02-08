"use client";

import { Sheet } from "@/components/ui/sheet";
import { useSearchParams, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";

export function ClientSheet({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true); // true by default because when we get into the JobListingPage, we want the sheet to be open by default
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (open) return;
        else {
          // If teh sheet is being closed, we want to return to the jobListingPage
          setIsOpen(false);
          router.push(`/?${searchParams.toString()}`);
        }
      }}
      modal
    >
      {children}
    </Sheet>
  );
}
