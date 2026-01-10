import { cn } from "@/lib/utils";
import { Loader2Icon } from "lucide-react";

export default function LoadingSwap({
  isLoading,
  children,
  classNames,
}: {
  isLoading: boolean;
  children: React.ReactNode;
  classNames?: string;
}) {
  return (
    <div className="grid grid-cols-1">
      <div
        className={cn(
          "row-start-1 row-end-1 col-start-1 col-end-1",
          isLoading ? "invisible" : "visible",
          classNames
        )}
      >
        {children}
      </div>
      <div
        className={cn(
          "row-start-1 row-end-1 col-start-1 col-end-1",
          isLoading ? "visible" : "invisible"
        )}
      >
        <Loader2Icon className="animate-spin" />
      </div>
    </div>
  );
}
