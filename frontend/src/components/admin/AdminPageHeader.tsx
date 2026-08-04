import { PreviewChip } from "@/components/admin/PreviewChip";

export function AdminPageHeader({
  title,
  subtitle,
  actions,
  draft,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  draft?: boolean;
}) {
  return (
    <div className="a-card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border p-4 sm:p-5 backdrop-blur-md">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-lg font-semibold tracking-tight a-text sm:text-xl">
            {title}
          </h1>
          {draft && <PreviewChip />}
        </div>
        {subtitle && (
          <p className="mt-0.5 text-xs sm:text-[13px] a-faint">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
          {actions}
        </div>
      )}
    </div>
  );
}
