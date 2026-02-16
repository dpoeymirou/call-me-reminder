"use client";

import { useState } from "react";
import { useReminders } from "@/hooks/use-reminders";
import { ReminderCard } from "@/components/reminder-card";
import { ReminderSkeletonList } from "@/components/reminder-skeleton";
import { EmptyState } from "@/components/empty-state";
import { FilterTabs } from "@/components/filter-tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProtectedRoute from "@/components/protected-route";
import LogoutButton from "@/components/logout-button";
import Link from "next/link";
import { Plus, Search } from "lucide-react";

export default function DashboardPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const {
    data: reminders,
    isLoading,
    isError,
  } = useReminders(filter === "all" ? undefined : filter);

  const filteredReminders = reminders?.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) || r.message.toLowerCase().includes(q)
    );
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Reminders
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Manage your upcoming call reminders.
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button asChild className="flex-1 sm:flex-none cursor-pointer shadow-sm">
                <Link href="/create">
                  <Plus className="mr-2 h-4 w-4" />
                  New Reminder
                </Link>
              </Button>
              <LogoutButton />
            </div>
          </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <FilterTabs active={filter} onChange={setFilter} />
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reminders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Content */}
        {isLoading && <ReminderSkeletonList />}

        {isError && (
          <div className="text-center py-12">
            <p className="text-destructive">
              Failed to load reminders. Please try again.
            </p>
          </div>
        )}

        {!isLoading && !isError && filteredReminders?.length === 0 && (
          <EmptyState
            title={
              search
                ? "No results found"
                : filter !== "all"
                  ? `No ${filter} reminders`
                  : "No reminders yet"
            }
            description={
              search
                ? "Try a different search term."
                : "Create your first reminder and never miss an important moment."
            }
            showAction={!search && filter === "all"}
          />
        )}

        {filteredReminders && filteredReminders.length > 0 && (
          <div className="grid gap-4">
            {filteredReminders.map((reminder) => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))}
          </div>
        )}
      </div>
    </div>
    </ProtectedRoute>
  );
}
