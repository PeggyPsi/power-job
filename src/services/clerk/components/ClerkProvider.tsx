"use client";

import { useIsDarkMode } from "@/hooks/useIsDarkMode";
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/themes"; // use shadcn compatible theme of clerk

export function AppClerkProvider({ children }: { children: React.ReactNode }) {
  const isDarkMode = useIsDarkMode();

  return (
    <ClerkProvider appearance={isDarkMode ? { theme: [shadcn] } : undefined}>
      {children}
    </ClerkProvider>
  );
}
