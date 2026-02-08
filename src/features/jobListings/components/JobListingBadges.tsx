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
  jobListing: Pick<
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
        {formatJobListingStatus(props.jobListing.status)}
      </Badge>
      {props.jobListing.isFeatured && (
        <Badge
          {...badgeProps}
          className={cn(
            props.className,
            "border-featured bg-featured/50 text-featured-foreground",
          )}
        >
          Featured
        </Badge>
      )}
      {props.jobListing.wage != null && props.jobListing.wageInterval && (
        <Badge {...badgeProps}>
          <BanknoteIcon />
          {formatWage(props.jobListing.wage, props.jobListing.wageInterval)}
        </Badge>
      )}
      {props.jobListing.stateAbbreviation && (
        <Badge {...badgeProps}>
          <MapPinIcon />
          {formatJobListingLocation({
            stateAbbreviation: props.jobListing.stateAbbreviation,
            city: props.jobListing.city,
          })}
        </Badge>
      )}
      {props.jobListing.locationRequirement && (
        <Badge {...badgeProps}>
          <BuildingIcon />
          {formatLocationRequirement(props.jobListing.locationRequirement)}
        </Badge>
      )}
      {props.jobListing.locationRequirement && (
        <Badge {...badgeProps}>
          <Hourglass />
          {formatJobListingType(props.jobListing.type)}
        </Badge>
      )}
      {props.jobListing.experienceLevel && (
        <Badge {...badgeProps}>
          <GraduationCap />
          {formatExperienceLevel(props.jobListing.experienceLevel)}
        </Badge>
      )}
    </>
  );
}
