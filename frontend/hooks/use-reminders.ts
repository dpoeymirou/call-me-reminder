import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { remindersApi, CreateReminderData } from "@/lib/api";

export function useReminders(status?: string) {
  return useQuery({
    queryKey: ["reminders", status],
    queryFn: async () => {
      const { data } = await remindersApi.list(status);
      return data;
    },
  });
}

export function useReminder(id: string) {
  return useQuery({
    queryKey: ["reminder", id],
    queryFn: async () => {
      const { data } = await remindersApi.get(id);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateReminderData) => {
      const { data: reminder } = await remindersApi.create(data);
      return reminder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
    },
  });
}

export function useUpdateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateReminderData>;
    }) => {
      const { data: reminder } = await remindersApi.update(id, data);
      return reminder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
    },
  });
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await remindersApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
    },
  });
}
