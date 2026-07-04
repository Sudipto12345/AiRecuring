"use client";

import { useEffect, useState } from "react";
import { Megaphone, Trash2, Wrench } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface Announcement {
  id: string;
  title: string;
  body: string;
  level: string;
  active: boolean;
  created_at: string;
}
interface SettingsData {
  maintenance_mode: boolean;
  maintenance_message: string;
  feature_flags: Record<string, boolean>;
  announcements: Announcement[];
}

export default function SystemSettingsPage() {
  const [data, setData] = useState<SettingsData | null>(null);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ title: "", body: "", level: "info" });

  const load = () => api<SettingsData>("/admin/platform/settings").then((d) => { setData(d); setMsg(d.maintenance_message); }).catch(() => setData(null));
  useEffect(() => {
    load();
  }, []);

  async function toggleMaintenance() {
    if (!data) return;
    const res = await api<{ maintenance_mode: boolean; maintenance_message: string }>("/admin/platform/maintenance", {
      method: "PATCH",
      body: { maintenance_mode: !data.maintenance_mode, maintenance_message: msg },
    });
    setData({ ...data, maintenance_mode: res.maintenance_mode, maintenance_message: res.maintenance_message });
  }

  async function addAnnouncement() {
    if (!form.title || !form.body) return;
    await api("/admin/platform/announcements", { method: "POST", body: form });
    setForm({ title: "", body: "", level: "info" });
    load();
  }

  async function removeAnnouncement(id: string) {
    await api(`/admin/platform/announcements/${id}`, { method: "DELETE" });
    load();
  }

  async function saveMessage() {
    if (!data || msg === data.maintenance_message) return;
    await api("/admin/platform/maintenance", { method: "PATCH", body: { maintenance_mode: data.maintenance_mode, maintenance_message: msg } });
    setData((d) => (d ? { ...d, maintenance_message: msg } : d));
  }

  const levelTone: Record<string, string> = {
    info: "bg-sky-500/10 text-sky-500",
    warning: "bg-amber-500/10 text-amber-500",
    critical: "bg-rose-500/10 text-rose-500",
  };

  return (
    <div className="space-y-5">
      <AdminPageHeader title="System Settings" subtitle="Maintenance mode and platform announcements." />

      <div className="a-card p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <Wrench className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold a-text">Maintenance mode</p>
            <p className="text-xs a-faint">When enabled, tenants see the maintenance message.</p>
          </div>
          <button
            onClick={toggleMaintenance}
            className={cn("relative h-6 w-11 rounded-full transition-colors", data?.maintenance_mode ? "bg-amber-500" : "a-surface-2")}
          >
            <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all", data?.maintenance_mode ? "left-[22px]" : "left-0.5")} />
          </button>
        </div>
        <textarea
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onBlur={saveMessage}
          rows={2}
          className="a-input mt-3 w-full p-3 text-sm"
          placeholder="Maintenance message…"
        />
      </div>

      <div className="a-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Megaphone className="h-5 w-5 a-accent" />
          <h3 className="text-sm font-semibold a-text">Announcements</h3>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_2fr_auto]">
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Title" className="a-input h-10 px-3 text-sm" />
          <input value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} placeholder="Message" className="a-input h-10 px-3 text-sm" />
          <div className="flex gap-2">
            <select value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))} className="a-input h-10 px-2 text-sm">
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
            <button onClick={addAnnouncement} className="gradient-brand h-10 rounded-lg px-4 text-sm font-medium text-white">Post</button>
          </div>
        </div>

        <ul className="mt-4 space-y-2">
          {data?.announcements.map((a) => (
            <li key={a.id} className="flex items-center justify-between rounded-xl a-surface-2 px-4 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase", levelTone[a.level] ?? levelTone.info)}>{a.level}</span>
                  <p className="truncate text-sm font-medium a-text">{a.title}</p>
                </div>
                <p className="truncate text-xs a-faint">{a.body}</p>
              </div>
              <button onClick={() => removeAnnouncement(a.id)} className="a-hover rounded-lg p-1.5 text-rose-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
          {data && data.announcements.length === 0 && <p className="text-sm a-faint">No announcements posted.</p>}
        </ul>
      </div>
    </div>
  );
}
