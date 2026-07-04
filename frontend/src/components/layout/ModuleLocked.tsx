import { Lock } from "lucide-react";

import { Card } from "@/components/ui/Card";

export function ModuleLocked({ feature }: { feature: string }) {
  return (
    <Card className="flex flex-col items-center gap-3 px-6 py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
        <Lock className="h-6 w-6" />
      </span>
      <p className="text-lg font-semibold text-ink-900">{feature} is not on your plan</p>
      <p className="max-w-sm text-sm text-ink-500">
        Upgrade your subscription to unlock {feature.toLowerCase()} and the full AI hiring suite.
      </p>
    </Card>
  );
}
