"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reminderSchema, type ReminderFormData } from "@/lib/schemas";
import { useCreateReminder } from "@/hooks/use-reminders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "UTC", label: "UTC" },
];

export function ReminderForm() {
  const router = useRouter();
  const { mutate: createReminder, isPending } = useCreateReminder();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<ReminderFormData>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      timezone: "America/New_York",
      scheduled_time: (() => {
        const now = new Date();
        now.setHours(now.getHours() + 1);
        now.setMinutes(0);
        return now.toISOString().slice(0, 16);
      })(),
    },
  });

  const scheduledTime = useWatch({ control, name: "scheduled_time" });
  const timezone = useWatch({ control, name: "timezone" });

  const onSubmit = (data: ReminderFormData) => {
    const payload = {
      ...data,
      scheduled_time: `${data.scheduled_time}:00`,
    };
    console.log("Sending data:", data);
    createReminder(payload, {
      onSuccess: () => {
        toast.success("Reminder created successfully!");
        router.push("/");
      },
      onError: (error: unknown) => {
        const message =
          error instanceof Error ? error.message : "Failed to create reminder";
        toast.error(message);
      },
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Meeting reminder"
            {...register("title")}
            disabled={isPending}
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        {/* Message */}
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            placeholder="Don't forget about the team meeting at 3 PM"
            rows={4}
            {...register("message")}
            disabled={isPending}
          />
          {errors.message && (
            <p className="text-sm text-destructive">{errors.message.message}</p>
          )}
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <Label htmlFor="phone_number">Phone Number</Label>
          <Input
            id="phone_number"
            type="tel"
            placeholder="+14155552671"
            {...register("phone_number")}
            disabled={isPending}
          />
          {errors.phone_number && (
            <p className="text-sm text-destructive">
              {errors.phone_number.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Must be in E.164 format (e.g., +14155552671)
          </p>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              disabled={isPending}
              value={scheduledTime ? scheduledTime.split("T")[0] : ""}
              onChange={(e) => {
                const timePart = e.target.value;
                const datePart = scheduledTime?.includes("T")
                  ? scheduledTime.split("T")[0]
                  : new Date().toLocaleDateString("en-CA");
                setValue("scheduled_time", `${datePart}T${timePart}`, {
                  shouldValidate: true,
                });
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              disabled={isPending}
              value={
                scheduledTime?.includes("T") ? scheduledTime.split("T")[1] : ""
              }
              onChange={(e) => {
                const timePart = e.target.value;
                const datePart = scheduledTime?.includes("T")
                  ? scheduledTime.split("T")[0]
                  : new Date().toISOString().split("T")[0];
                setValue("scheduled_time", `${datePart}T${timePart}`, {
                  shouldValidate: true,
                });
              }}
            />
          </div>
        </div>
        {errors.scheduled_time && (
          <p className="text-sm text-destructive">
            {errors.scheduled_time.message}
          </p>
        )}

        {/* Timezone */}
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Select
            value={timezone}
            onValueChange={(value: string) => setValue("timezone", value)}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.timezone && (
            <p className="text-sm text-destructive">
              {errors.timezone.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.push("/")}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Reminder
          </Button>
        </div>
      </form>
    </Card>
  );
}
