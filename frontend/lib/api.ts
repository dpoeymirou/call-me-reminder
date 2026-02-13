import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Types
export interface Reminder {
  id: string;
  title: string;
  message: string;
  phone_number: string;
  scheduled_time: string;
  timezone: string;
  status: "scheduled" | "completed" | "failed";
  created_at: string;
  updated_at: string;
}

export interface CreateReminderData {
  title: string;
  message: string;
  phone_number: string;
  scheduled_time: string;
  timezone: string;
}

// API functions
export const remindersApi = {
  list: (status?: string) =>
    api.get<Reminder[]>("/reminders", { params: { status } }),

  get: (id: string) => api.get<Reminder>(`/reminders/${id}`),

  create: (data: CreateReminderData) => api.post<Reminder>("/reminders", data),

  update: (id: string, data: Partial<CreateReminderData>) =>
    api.put<Reminder>(`/reminders/${id}`, data),

  delete: (id: string) => api.delete(`/reminders/${id}`),
};
