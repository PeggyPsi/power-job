"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ExperienceLevel,
  experienceLevels,
  JobListingType,
  jobListingTypes,
  LocationRequirement,
  locationRequirements,
} from "@/drizzle/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import z from "zod";
import {
  formatExperienceLevel,
  formatJobListingType,
  formatLocationRequirement,
} from "../lib/formatters";
import StateSelectItems from "./StateSelectItems";
import { Button } from "@/components/ui/button";
import LoadingSwap from "@/components/LoadingSwap";
import { useSidebar } from "@/components/ui/sidebar";

const ANY_VALUE = "any";

const joblistingFilterSchema = z.object({
  title: z.string().optional(),
  city: z.string().optional(),
  stateAbbreviation: z.string().or(z.literal(ANY_VALUE)).optional(),
  experienceLevel: z.enum(experienceLevels).or(z.literal(ANY_VALUE)).optional(),
  type: z.enum(jobListingTypes).or(z.literal(ANY_VALUE)).optional(),
  locationRequirement: z
    .enum(locationRequirements)
    .or(z.literal(ANY_VALUE))
    .optional(),
});

export function JobListingFilterForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  const form = useForm({
    resolver: zodResolver(joblistingFilterSchema),
    defaultValues: {
      title: searchParams.get("title") ?? "",
      city: searchParams.get("city") ?? "",
      stateAbbreviation: searchParams.get("stateAbbreviation") ?? ANY_VALUE,
      experienceLevel:
        (searchParams.get("experienceLevel") as ExperienceLevel) ?? ANY_VALUE,
      type: (searchParams.get("type") as JobListingType) ?? ANY_VALUE,
      locationRequirement:
        (searchParams.get("locationRequirement") as LocationRequirement) ??
        ANY_VALUE,
    },
  });

  const onSubmit = (data: z.infer<typeof joblistingFilterSchema>) => {
    const newPrams = new URLSearchParams();

    if (data.city) newPrams.set("city", data.city);
    if (data.title) newPrams.set("title", data.title);
    if (data.stateAbbreviation && data.stateAbbreviation !== ANY_VALUE)
      newPrams.set("stateAbbreviation", data.stateAbbreviation);
    if (data.experienceLevel && data.experienceLevel !== ANY_VALUE)
      newPrams.set("experienceLevel", data.experienceLevel);
    if (data.type && data.type !== ANY_VALUE) newPrams.set("type", data.type);
    if (data.locationRequirement && data.locationRequirement !== ANY_VALUE)
      newPrams.set("locationRequirement", data.locationRequirement);

    router.push(`${pathname}?${newPrams.toString()}`);
    setOpenMobile(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          name="title"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="locationRequirement"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location Requirement</FormLabel>
              <Select
                value={field.value ?? ""}
                onValueChange={(val) => field.onChange(val ?? null)}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={ANY_VALUE}>Any</SelectItem>
                  {locationRequirements.map((locReq) => (
                    <SelectItem key={locReq} value={locReq}>
                      {formatLocationRequirement(locReq)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="city"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="stateAbbreviation"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <Select
                value={field.value ?? ""}
                onValueChange={(val) => field.onChange(val ?? null)}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={ANY_VALUE}>Any</SelectItem>
                  <StateSelectItems />
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="type"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select
                value={field.value ?? ""}
                onValueChange={(val) => field.onChange(val ?? null)}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={ANY_VALUE}>Any</SelectItem>
                  {jobListingTypes.map((locReq) => (
                    <SelectItem key={locReq} value={locReq}>
                      {formatJobListingType(locReq)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="experienceLevel"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Experience Level</FormLabel>
              <Select
                value={field.value ?? ""}
                onValueChange={(val) => field.onChange(val ?? null)}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={ANY_VALUE}>Any</SelectItem>
                  {experienceLevels.map((locReq) => (
                    <SelectItem key={locReq} value={locReq}>
                      {formatExperienceLevel(locReq)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          <LoadingSwap isLoading={form.formState.isSubmitting}>
            Apply Filters
          </LoadingSwap>
        </Button>
      </form>
    </Form>
  );
}
