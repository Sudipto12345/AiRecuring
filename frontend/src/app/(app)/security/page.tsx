"use client";

import { KeyRound, Lock, ShieldCheck, UserCheck } from "lucide-react";

import { StubModule } from "@/components/admin/StubModule";

export default function SecurityCenterPage() {
  return (
    <div className="p-4 lg:p-6">
      <StubModule
        title="Security Center"
        subtitle="Workspace security posture and controls."
        stats={[
          { label: "MFA enabled", value: "Off", icon: ShieldCheck, tone: "rose" },
          { label: "Active sessions", value: 3, icon: KeyRound, tone: "accent" },
          { label: "API tokens", value: 0, icon: Lock, tone: "amber" },
          { label: "Roles", value: 3, icon: UserCheck, tone: "emerald" },
        ]}
        note="Preview module. MFA, password policy, session controls and device management will be configurable here."
      />
    </div>
  );
}
