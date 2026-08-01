"use client";

import { Badge } from "@/components/ui/Badge";
import { StubModule } from "@/components/admin/StubModule";

export default function SchedulerPage() {
  return (
    <StubModule
      title="Scheduler"
      subtitle="Cron jobs and scheduled tasks."
      stats={[
        { label: "Active jobs", value: 8 },
        { label: "Ran (24h)", value: 192 },
        { label: "Failed", value: 1 },
        { label: "Next run", value: "4m" },
      ]}
      columns={[
        { key: "job", header: "Job" },
        { key: "schedule", header: "Schedule" },
        { key: "last", header: "Last run" },
        { key: "status", header: "Status" },
      ]}
      rows={[
        { job: "analytics.refresh", schedule: "*/15 * * * *", last: "8m ago", status: <Badge tone="green">ok</Badge> },
        { job: "credits.report", schedule: "0 0 * * *", last: "today 00:00", status: <Badge tone="green">ok</Badge> },
        { job: "backups.nightly", schedule: "0 22 * * *", last: "yesterday", status: <Badge tone="green">ok</Badge> },
      ]}
      note="Scheduled task orchestration runs via Celery beat / cron once workers are enabled."
    />
  );
}
