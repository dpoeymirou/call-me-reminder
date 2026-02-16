import { Card } from "@/components/ui/card";

export function ReminderSkeleton() {
  return (
    <Card className="p-5">
      <div className="animate-pulse space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 bg-muted rounded" />
          <div className="h-5 w-20 bg-muted rounded-full" />
        </div>
        <div className="h-4 w-full bg-muted rounded" />
        <div className="h-4 w-2/3 bg-muted rounded" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-4 w-28 bg-muted rounded" />
        </div>
      </div>
    </Card>
  );
}

export function ReminderSkeletonList() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <ReminderSkeleton key={i} />
      ))}
    </div>
  );
}
