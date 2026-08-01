"use client";

import { useEffect, useState } from "react";
import { Mail, Send } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatWidget } from "@/components/admin/StatWidget";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";

interface InfoData {
  env: { smtp_configured?: boolean; frontend_origin?: string };
}

export default function SmtpPage() {
  const [d, setD] = useState<InfoData | null>(null);
  useEffect(() => {
    api<InfoData>("/admin/system/info").then(setD).catch(() => setD(null));
  }, []);
  const configured = d?.env.smtp_configured ?? false;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="SMTP"
        subtitle="Outbound email configuration."
        actions={d && <Badge tone={configured ? "green" : "amber"} dot>{configured ? "configured" : "not configured"}</Badge>}
      />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatWidget label="SMTP" value={configured ? "configured" : "off"} icon={Mail} tone={configured ? "emerald" : "amber"} />
        <StatWidget label="Delivery" value={configured ? "live" : "disabled"} icon={Send} />
        <StatWidget label="From domain" value={configured ? "active" : "—"} icon={Mail} />
        <StatWidget label="App origin" value={d?.env.frontend_origin ? "set" : "—"} icon={Mail} tone="sky" />
      </div>
      <div className="a-card p-5">
        <p className="text-sm a-muted">
          {configured
            ? "SMTP is configured. Exam invitations and notification emails are dispatched through your provider."
            : "No SMTP host is configured. Set SMTP_HOST and credentials in the backend environment to enable outbound email. Until then, exam links are generated for manual sharing."}
        </p>
      </div>
    </div>
  );
}
