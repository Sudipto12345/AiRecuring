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
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-semibold a-text">{title}</h1>
          {draft && <PreviewChip />}
        </div>
        {subtitle && <p className="mt-1 text-sm a-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
