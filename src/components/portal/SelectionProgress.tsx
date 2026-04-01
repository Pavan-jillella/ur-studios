import { Progress } from "@/components/ui/progress";
import { Heart, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectionProgressProps {
  current: number;
  limit: number | null;
  className?: string;
}

export function SelectionProgress({ current, limit, className }: SelectionProgressProps) {
  if (!limit) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
        <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
        <span>{current} selected</span>
      </div>
    );
  }

  const percentage = Math.min((current / limit) * 100, 100);
  const isComplete = current >= limit;
  const isOverLimit = current > limit;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Heart className="w-4 h-4 text-pink-500" />
          )}
          <span className={cn(
            "font-medium",
            isOverLimit && "text-amber-500"
          )}>
            {current} of {limit} selected
          </span>
        </div>
        {isComplete && !isOverLimit && (
          <span className="text-xs text-green-500 font-medium">
            Selection complete!
          </span>
        )}
        {isOverLimit && (
          <span className="text-xs text-amber-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Over limit
          </span>
        )}
      </div>
      <Progress
        value={percentage}
        className={cn(
          "h-2",
          isComplete && !isOverLimit && "[&>div]:bg-green-500",
          isOverLimit && "[&>div]:bg-amber-500"
        )}
      />
      {!isComplete && (
        <p className="text-xs text-muted-foreground">
          Select {limit - current} more photo{limit - current !== 1 ? "s" : ""} to complete your selection
        </p>
      )}
    </div>
  );
}
