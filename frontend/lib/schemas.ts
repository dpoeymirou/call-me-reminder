import { z } from "zod";
import { isAfter, subMinutes } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

export const reminderSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(200, "Title too long"),

    message: z.string().min(1, "Message is required"),

    phone_number: z
      .string()
      .regex(/^\+[1-9]\d{10,14}$/, "Must be E.164 format (e.g., +14155552671)"),

    scheduled_time: z.string().min(1, "Date and time are required"),

    timezone: z.string().min(1, "Timezone is required"),
  })
  .refine(
    (data) => {
      try {
        const zonedDate = fromZonedTime(data.scheduled_time, data.timezone);

        // Buffer of 5 mins to allow for form submission.
        const now = subMinutes(new Date(), 5);

        return isAfter(zonedDate, now);
      } catch {
        return false;
      }
    },
    {
      message: "Reminder must be in the future for the selected timezone",
      path: ["scheduled_time"],
    },
  );

export type ReminderFormData = z.infer<typeof reminderSchema>;
