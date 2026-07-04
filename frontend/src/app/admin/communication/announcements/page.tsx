"use client";

import { useEffect, useState } from "react";
import { Megaphone, Trash2 } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface Announcement {
  id: string;
  title: string;
  body: string;
  level: string;
  created_at: string;
}
interface SettingsData {
  announcements: Announcement[];
}

const levelTone: Record<string, string> = {
  info: "bg-sky-500/10 text-sky-500",
  warning: "bg-amber-500/10 text-amber-500",
  critical: "bg-rose-500/10 text-rose-500",
};

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [form, setForm] = useState({ title: "", body: "", level: "info" });

  const load = () => api<SettingsData>("/admin/platform/settings").then((d) => setItems(d.announcements)).catch(() => setItems([]));
  useEffect(() => {
    load();
  }, []);

  async function add() {
    if (!form.title || !form.body) return;
    await api("/admin/platform/announcements", { method: "POST", body: form });
    setForm({ title: "", body: "", level: "info" });
    load();
  }

  async function remove(id: string) {
    await api(`/admin/platform/announcements/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader title="Announcements" subtitle="Broadcast messages to all tenants." />

      <div className="a-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Megaphone className="h-5 w-5 a-accent" />
          <h3 className="text-sm font-semibold a-text">New announcement</h3>
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
            <button onClick={add} className="gradient-brand h-10 rounded-lg px-4 text-sm font-medium text-white">Post</button>
          </div>
        </div>
      </div>

      <ul className="space-y-2">
        {items.map((a) => (
          <li key={a.id} className="a-card flex items-center justify-between px-4 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase", levelTone[a.level] ?? levelTone.info)}>{a.level}</span>
                <p className="truncate text-sm font-medium a-text">{a.title}</p>
              </div>
              <p className="truncate text-xs a-faint">{a.body}</p>
            </div>
            <button onClick={() => remove(a.id)} className="a-hover rounded-lg p-1.5 text-rose-500">
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
        {items.length === 0 && <p className="a-card p-8 text-center text-sm a-faint">No announcements yet.</p>}
      </ul>
    </div>
  );
}
