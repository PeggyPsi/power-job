"use client";

import { generateUploadDropzone } from "@uploadthing/react";
import { PowerJobFileRouter } from "../router";
import { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { UploadThingError } from "uploadthing/server";
import { Json } from "@uploadthing/shared";

export const UploadDropzoneComponent =
  generateUploadDropzone<PowerJobFileRouter>();

// Custom wrapper for the upload buttons
export function UploadDropzone({
  className,
  onClientUploadComplete,
  onUploadError,
  ...props
}: ComponentProps<typeof UploadDropzoneComponent>) {
  return (
    <UploadDropzoneComponent
      className={cn(
        "border-dashed border-2 border-muted rounded-lg flex items-center justify-center",
        className,
      )}
      onClientUploadComplete={(res) => {
        res.forEach(({ serverData }) => {
          toast.success(serverData?.message ?? "Upload successful");
        });
        onClientUploadComplete?.(res);
      }}
      onUploadError={(error: UploadThingError<Json>) => {
        toast.error(error?.message ?? "Upload failed");
        onUploadError?.(error);
      }}
      {...props}
    />
  );
}
