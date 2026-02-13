import { z } from "zod";

export const reminderSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),

  message: z.string().min(1, "Message is required"),

  phone_number: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, "Must be E.164 format (e.g., +14155552671)"),

  scheduled_time: z
    .string()
    .refine((val) => new Date(val) > new Date(), "Must be in the future"),

  timezone: z.string().min(1, "Timezone is required"),
});

export type ReminderFormData = z.infer<typeof reminderSchema>;
