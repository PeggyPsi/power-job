"use client";

import { useIsBreakpoint } from "@/hooks/useIsBreakpoint";
import { ReactNode } from "react";

export function IsBreakpoint({
  breakPoint,
  children,
  otherwise,
}: {
  breakPoint: string;
  children: ReactNode;
  otherwise?: ReactNode;
}) {
  const isBreakpoint = useIsBreakpoint(breakPoint);

  return isBreakpoint ? children : otherwise;
  return null;
}
