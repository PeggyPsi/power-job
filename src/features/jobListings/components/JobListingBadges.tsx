import { Badge } from "@/components/ui/badge";
import { JobListingTable } from "@/drizzle/schema";
import { ComponentProps } from "react";
import {
  formatExperienceLevel,
  formatJobListingLocation,
  formatJobListingStatus,
  formatJobListingType,
  formatLocationRequirement,
  formatWage,
} from "../lib/formatters";
import {
  BanknoteIcon,
  BuildingIcon,
  GraduationCap,
  Hourglass,
  MapPinIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function JobListingBadges(props: {
  jobsListing: Pick<
    typeof JobListingTable.$inferSelect,
    | "wage"
    | "wageInterval"
    | "stateAbbreviation"
    | "city"
    | "isFeatured"
    | "locationRequirement"
    | "experienceLevel"
    | "status"
    | "type"
  >;
  className?: string;
}) {
  const badgeProps = {
    variant: "outline",
    className: props.className,
  } satisfies ComponentProps<typeof Badge>;

  return (
    <>
      <Badge {...badgeProps} variant={"default"}>
        {formatJobListingStatus(props.jobsListing.status)}
      </Badge>
      {props.jobsListing.isFeatured && (
        <Badge
          {...badgeProps}
          className={cn(
            props.className,
            "border-featured bg-featured/50 text-featured-foreground"
          )}
        >
          Featured
        </Badge>
      )}
      {props.jobsListing.wage != null && props.jobsListing.wageInterval && (
        <Badge {...badgeProps}>
          <BanknoteIcon />
          {formatWage(props.jobsListing.wage, props.jobsListing.wageInterval)}
        </Badge>
      )}
      {props.jobsListing.stateAbbreviation && (
        <Badge {...badgeProps}>
          <MapPinIcon />
          {formatJobListingLocation({
            stateAbbreviation: props.jobsListing.stateAbbreviation,
            city: props.jobsListing.city,
          })}
        </Badge>
      )}
      {props.jobsListing.locationRequirement && (
        <Badge {...badgeProps}>
          <BuildingIcon />
          {formatLocationRequirement(props.jobsListing.locationRequirement)}
        </Badge>
      )}
      {props.jobsListing.locationRequirement && (
        <Badge {...badgeProps}>
          <Hourglass />
          {formatJobListingType(props.jobsListing.type)}
        </Badge>
      )}
      {props.jobsListing.experienceLevel && (
        <Badge {...badgeProps}>
          <GraduationCap />
          {formatExperienceLevel(props.jobsListing.experienceLevel)}
        </Badge>
      )}
    </>
  );
}
