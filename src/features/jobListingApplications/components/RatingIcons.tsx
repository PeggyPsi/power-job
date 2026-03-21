import { cn } from "@/lib/utils";
import { StarIcon } from "lucide-react";
import { ReactNode } from "react";

// Show in more understandable and fancy way the rating system
export function RatingIcons({
  rating,
  className,
}: {
  rating: number | null;
  className?: string;
}) {
  if (!rating || rating < 1 || rating > 5) return "Unrated";

  const stars: ReactNode[] = [];
  for (let index = 1; index <= 5; index++) {
    stars.push(
      <StarIcon
        key={index}
        className={cn("size-4", rating >= index && "fill-current", className)}
      ></StarIcon>,
    );
  }

  return (
    <div className="flex gap-1">
      {stars}
      <span className="sr-only">{rating} out of 5</span>
    </div>
  );
}
