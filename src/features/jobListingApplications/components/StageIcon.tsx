"use client";
import { ApplicationStage } from "@/drizzle/schema";
import {
  CircleCheckIcon,
  CircleHelpIcon,
  CircleXIcon,
  HandshakeIcon,
  SpeechIcon,
} from "lucide-react";
import { ComponentPropsWithRef } from "react";

export function StageIcon({
  stage,
  ...props
}: { stage: ApplicationStage } & ComponentPropsWithRef<typeof CircleHelpIcon>) {
  switch (stage) {
    case "applied":
      return <CircleHelpIcon {...props} />;
    case "interested":
      return <CircleCheckIcon {...props} />;
    case "denied":
      return <CircleXIcon {...props} />;
    case "interviewed":
      return <SpeechIcon {...props} />;
    case "hired":
      return <HandshakeIcon {...props} />;
    default:
      throw new Error(`Unknown application stage: ${stage satisfies never}`);
  }
}
