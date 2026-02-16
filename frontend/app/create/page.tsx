import { ReminderForm } from "@/components/reminder-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateReminderPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Create Reminder</h1>
          <p className="text-muted-foreground">
            Set up a phone call reminder for the perfect time.
          </p>
        </div>

        <ReminderForm />
      </div>
    </div>
  );
}
