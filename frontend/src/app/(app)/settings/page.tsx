"use client";

import { Building2, CreditCard, ShieldCheck, User, Mail, Save } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth";
import { PLAN_LABELS } from "@/lib/nav";

export default function SettingsPage() {
  const { session } = useAuth();
  const sub = session?.subscription;
  const [orgName, setOrgName] = useState(session?.company?.name ?? "");
  const [contactEmail, setContactEmail] = useState("");

  return (
    <div className="space-y-5 p-4 lg:p-6">
      <PageHeader title="Settings" subtitle="Manage your workspace and subscription." />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="a-card backdrop-blur-xl bg-white/10 dark:bg-black/20 p-5 rounded-2xl border border-white/20 dark:border-white/5 shadow-xl">
          <h3 className="mb-4 text-sm font-semibold a-text flex items-center gap-2"><Building2 className="w-4 h-4" /> Organization Details</h3>
          <div className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-medium text-ink-500 dark:text-zinc-400 mb-1">Company Name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                <input 
                  type="text" 
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-ink-900 dark:text-zinc-100 placeholder-zinc-400 backdrop-blur-sm transition-all" 
                  placeholder="Acme Corp" 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-ink-500 dark:text-zinc-400 mb-1">Support Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                <input 
                  type="email" 
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-ink-900 dark:text-zinc-100 placeholder-zinc-400 backdrop-blur-sm transition-all" 
                  placeholder="support@example.com" 
                />
              </div>
            </div>

            <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]">
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </div>

        <div className="space-y-5">
          <div className="a-card backdrop-blur-xl bg-white/10 dark:bg-black/20 p-5 rounded-2xl border border-white/20 dark:border-white/5 shadow-xl">
            <h3 className="mb-4 text-sm font-semibold a-text flex items-center gap-2"><CreditCard className="w-4 h-4" /> Subscription</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 dark:bg-black/40 border border-zinc-200/50 dark:border-zinc-800/50">
                <span className="flex items-center gap-2 text-ink-700 dark:text-zinc-300 font-medium">Plan</span>
                <Badge variant="brand">{PLAN_LABELS[sub?.plan ?? "free"] ?? sub?.plan}</Badge>
              </div>
              <div className="p-3 rounded-xl bg-white/40 dark:bg-black/40 border border-zinc-200/50 dark:border-zinc-800/50">
                <p className="mb-2 text-ink-700 dark:text-zinc-300 font-medium">Enabled modules</p>
                <div className="flex flex-wrap gap-2">
                  {sub?.modules.length ? (
                    sub.modules.map((m) => <Badge key={m} variant="success">{m}</Badge>)
                  ) : (
                    <span className="text-zinc-500 text-xs">No active modules</span>
                  )}
                </div>
              </div>
              <p className="text-xs text-ink-500 dark:text-zinc-400">Contact your platform administrator to change plans.</p>
            </div>
          </div>
          
          <div className="a-card backdrop-blur-xl bg-white/10 dark:bg-black/20 p-5 rounded-2xl border border-white/20 dark:border-white/5 shadow-xl">
             <h3 className="mb-4 text-sm font-semibold a-text flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Your Profile</h3>
             <div className="p-3 rounded-xl bg-white/40 dark:bg-black/40 border border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink-900 dark:text-zinc-100">{session?.user.name ?? "User"}</p>
                    <p className="text-xs text-ink-500 dark:text-zinc-400 capitalize">{session?.user.role.replace("_", " ") ?? "—"}</p>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
