"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { newJobListingApplicationsSchema } from "../actions/schemas";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import z from "zod";
import { toast } from "sonner";
import { createJobListingApplication } from "../actions/actions";
import { MarkdownEditor } from "@/components/markdown/MarkdownEditor";
import { Button } from "@/components/ui/button";
import LoadingSwap from "@/components/LoadingSwap";

export function NewJobListingApplicationForm({
  jobListingId,
}: {
  jobListingId: string;
}) {
  const form = useForm({
    resolver: zodResolver(newJobListingApplicationsSchema),
    defaultValues: {
      coverLetter: "",
    },
  });

  async function onsubmit(
    data: z.infer<typeof newJobListingApplicationsSchema>,
  ) {
    const res = await createJobListingApplication(jobListingId, data);

    if (res.error) {
      toast.error(res.message || "Failed to create job listing application");
    }

    toast.success(
      res.message || "Job listing application created successfully",
    );
  }

  return (
    <Form {...form}>
      <form
        action=""
        onSubmit={form.handleSubmit(onsubmit)}
        className="space-y-6"
      >
        <FormField
          name="coverLetter"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Letter</FormLabel>
              <FormControl>
                <MarkdownEditor {...field} markdown={field.value ?? ""} />
              </FormControl>
              <FormDescription>Optional</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          disabled={form.formState.isSubmitting}
          type="submit"
          className="w-full"
        >
          <LoadingSwap isLoading={form.formState.isSubmitting}>
            Apply
          </LoadingSwap>
        </Button>
      </form>
    </Form>
  );
}
