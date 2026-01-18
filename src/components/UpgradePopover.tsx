import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";
import { ReactNode } from "react";

export default function UpgradePopover({
  buttonText,
  popoverText,
}: {
  buttonText: ReactNode;
  popoverText: ReactNode;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={"outline"}>{buttonText}</Button>
      </PopoverTrigger>
      <PopoverContent>
        {popoverText}
        <Button asChild className="mt-2">
          <Link href={"/employer/pricing"}>Upgrade Plan</Link>
        </Button>
      </PopoverContent>
    </Popover>
  );
}
