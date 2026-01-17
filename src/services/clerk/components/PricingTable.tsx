import { PricingTable as ClerkPricingTable } from "@clerk/nextjs";

/** Custom override of clerk's PricingTable component. Configured  for only organizations and implicit redirectUri*/
export function PricingTable() {
  return (
    <ClerkPricingTable
      for={"organization"}
      newSubscriptionRedirectUrl="/employer/pricing"
    />
  );
}
