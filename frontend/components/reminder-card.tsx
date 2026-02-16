"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/status-badge";
import { Reminder } from "@/lib/api";
import { useDeleteReminder } from "@/hooks/use-reminders";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import { Phone, Trash2, Clock, Pencil } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

function maskPhone(phone: string) {
  if (phone.length <= 6) return phone;
  return phone.slice(0, 4) + "***" + phone.slice(-4);
}

export function ReminderCard({ reminder }: { reminder: Reminder }) {
  const [open, setOpen] = useState(false);
  const { mutate: deleteReminder, isPending } = useDeleteReminder();

  const scheduledDate = new Date(
    reminder.scheduled_time +
      (reminder.scheduled_time.endsWith("Z") ? "" : "Z"),
  );
  const isUpcoming = scheduledDate > new Date();

  const handleDelete = () => {
    deleteReminder(reminder.id, {
      onSuccess: () => {
        toast.success("Reminder deleted");
        setOpen(false);
      },
      onError: () => {
        toast.error("Failed to delete reminder");
      },
    });
  };

  return (
    <Card className="p-5 transition-all duration-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">{reminder.title}</h3>
            <StatusBadge status={reminder.status} />
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {reminder.message}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {format(scheduledDate, "MMM d, yyyy 'at' h:mm a")}
            </span>

            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {maskPhone(reminder.phone_number)}
            </span>

            {isUpcoming && reminder.status === "scheduled" && (
              <span className="text-blue-600 font-medium">
                {formatDistanceToNow(scheduledDate, {
                  addSuffix: true,
                })}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            asChild
          >
            <Link href={`/edit/${reminder.id}`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Reminder</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete &quot;{reminder.title}&quot;?
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isPending}
                >
                  {isPending ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Card>
  );
}
