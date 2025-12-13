import { AppClerkProvider } from "@/services/clerk/components/ClerkProvider";

/**
 * Wraps all providers used in the app.
 * **/

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return <AppClerkProvider>{children}</AppClerkProvider>;
};
