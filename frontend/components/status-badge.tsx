import { Badge } from "@/components/ui/badge";

const statusConfig = {
  scheduled: {
    label: "Scheduled",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  },
  completed: {
    label: "Completed",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  failed: {
    label: "Failed",
    className: "bg-red-100 text-red-800 hover:bg-red-100",
  },
};

export function StatusBadge({
  status,
}: {
  status: "scheduled" | "completed" | "failed";
}) {
  const config = statusConfig[status];

  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  );
}
