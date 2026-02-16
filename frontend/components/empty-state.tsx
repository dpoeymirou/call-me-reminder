import { CalendarOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function EmptyState({
  title = "No reminders yet",
  description = "Create your first reminder and never miss an important moment.",
  showAction = true,
}: {
  title?: string;
  description?: string;
  showAction?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="rounded-full bg-muted p-4 mb-4">
        <CalendarOff className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
        {description}
      </p>
      {showAction && (
        <Button asChild>
          <Link href="/create">Create Reminder</Link>
        </Button>
      )}
    </div>
  );
}
