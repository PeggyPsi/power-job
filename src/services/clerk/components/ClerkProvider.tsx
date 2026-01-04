"use client";

import { useIsDarkMode } from "@/hooks/useIsDarkMode";
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/themes"; // use shadcn compatible theme of clerk
import { Suspense } from "react";

export function AppClerkProvider({ children }: { children: React.ReactNode }) {
  const isDarkMode = useIsDarkMode();

  return (
    <Suspense>
      <ClerkProvider appearance={isDarkMode ? { theme: [shadcn] } : undefined}>
        {children}
      </ClerkProvider>
    </Suspense>
  );
}
