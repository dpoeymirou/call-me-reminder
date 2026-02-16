"use client";

import { ReminderForm } from "@/components/reminder-form";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useReminder } from "@/hooks/use-reminders";
import { useParams } from "next/navigation";

export default function EditReminderPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: reminder, isLoading, isError } = useReminder(id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !reminder) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-destructive">Reminder not found.</p>
        <Link href="/" className="text-primary hover:underline">
          Go back home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Edit Reminder</h1>
          <p className="text-muted-foreground">
            Make changes to your scheduled call.
          </p>
        </div>

        <ReminderForm initialData={reminder} />
      </div>
    </div>
  );
}
