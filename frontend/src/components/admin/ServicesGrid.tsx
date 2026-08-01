"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

import { PreviewChip } from "@/components/admin/PreviewChip";
import { api } from "@/lib/api";

interface Service {
  key: string;
  label: string;
  ok: boolean;
  kind: string;
  real: boolean;
}

export function ServicesGrid() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    api<{ services: Service[] }>("/admin/system/services").then((d) => setServices(d.services)).catch(() => setServices([]));
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((s) => (
        <div key={s.key} className="a-card flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {s.ok ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> : <XCircle className="h-6 w-6 a-faint" />}
            <div>
              <p className="text-sm font-medium a-text">{s.label}</p>
              <p className="text-xs a-faint">{s.kind}</p>
            </div>
          </div>
          {s.real ? (
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${s.ok ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
              {s.ok ? "online" : "offline"}
            </span>
          ) : (
            <PreviewChip />
          )}
        </div>
      ))}
    </div>
  );
}
