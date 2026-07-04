import { Sparkles } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";

export function ComingSoon({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="space-y-5 p-4 lg:p-6">
      <PageHeader title={title} subtitle={subtitle} />
      <Card className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <Sparkles className="h-6 w-6" />
        </span>
        <p className="text-lg font-semibold text-ink-900">{title}</p>
        <p className="max-w-sm text-sm text-ink-500">
          This module is part of your roadmap. The full experience is being wired up.
        </p>
      </Card>
    </div>
  );
}
