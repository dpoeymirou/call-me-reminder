"use client";

import { Button } from "@/components/ui/button";

const filters = [
  { value: "all", label: "All" },
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
];

export function FilterTabs({
  active,
  onChange,
}: {
  active: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex gap-2 justify-between w-full sm:w-auto sm:justify-normal">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={active === filter.value ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(filter.value)}
          className="cursor-pointer"
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}
