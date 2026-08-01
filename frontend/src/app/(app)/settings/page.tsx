"use client";

import { Building2, CreditCard, ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth";
import { PLAN_LABELS } from "@/lib/nav";

export default function SettingsPage() {
  const { session } = useAuth();
  const sub = session?.subscription;

  return (
    <div className="space-y-5 p-4 lg:p-6">
      <PageHeader title="Settings" subtitle="Manage your workspace and subscription." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Organization" />
          <div className="space-y-3 px-5 py-4 text-sm">
            <Row icon={Building2} label="Company" value={session?.company?.name ?? "—"} />
            <Row icon={ShieldCheck} label="Your role" value={session?.user.role.replace("_", " ") ?? "—"} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Subscription" />
          <div className="space-y-3 px-5 py-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-ink-500"><CreditCard className="h-4 w-4" /> Plan</span>
              <Badge variant="brand">{PLAN_LABELS[sub?.plan ?? "free"] ?? sub?.plan}</Badge>
            </div>
            <div>
              <p className="mb-1.5 text-ink-500">Enabled modules</p>
              <div className="flex flex-wrap gap-2">
                {sub?.modules.length ? (
                  sub.modules.map((m) => <Badge key={m} variant="success">{m}</Badge>)
                ) : (
                  <span className="text-ink-400">None</span>
                )}
              </div>
            </div>
            <p className="text-xs text-ink-400">Contact your platform administrator to change plans.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-ink-500"><Icon className="h-4 w-4" /> {label}</span>
      <span className="font-medium capitalize text-ink-900">{value}</span>
    </div>
  );
}
