"use client";

import { useState } from "react";
import { Sparkles, Loader2, Check } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { api, ApiError } from "@/lib/api";
import type { Job } from "@/lib/types";

interface ParsedResult {
  skills: string[];
  experience_min_years: number | null;
  experience_max_years: number | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
}

export function JobFormModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (job: Job) => void;
}) {
  const [form, setForm] = useState({
    title: "",
    department: "Engineering",
    location: "Dhaka, Bangladesh",
    work_mode: "On-site",
    job_type: "Full-time",
    experience_min: 0,
    experience_max: 0,
    salary_min: "",
    salary_max: "",
    skills: "",
    description: "",
    status: "active",
  });
  const [busy, setBusy] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleAutoExtract() {
    if (!form.description.trim()) return;
    setParsing(true);
    setError(null);
    try {
      const res = await api<ParsedResult>("/jobs/parse-description", {
        method: "POST",
        body: { description: form.description },
      });
      setParsedResult(res);

      // Auto fill form fields
      setForm((f) => ({
        ...f,
        skills: res.skills.length > 0 ? res.skills.join(", ") : f.skills,
        experience_min: res.experience_min_years !== null ? res.experience_min_years : f.experience_min,
        experience_max: res.experience_max_years !== null ? res.experience_max_years : f.experience_max,
        salary_min: res.salary_min !== null ? String(res.salary_min) : f.salary_min,
        salary_max: res.salary_max !== null ? String(res.salary_max) : f.salary_max,
      }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to parse job description");
    } finally {
      setParsing(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const job = await api<Job>("/jobs", {
        method: "POST",
        body: {
          ...form,
          experience_min: Number(form.experience_min) || 0,
          experience_max: Number(form.experience_max) || 0,
          salary_min: form.salary_min ? Number(form.salary_min) : null,
          salary_max: form.salary_max ? Number(form.salary_max) : null,
          skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        },
      });
      onCreated(job);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create job");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create New Job" size="max-w-2xl">
      <form onSubmit={submit} className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Job title</Label>
          <Input required value={form.title} onChange={set("title")} placeholder="Senior Full Stack Developer" />
        </div>
        <div>
          <Label>Department</Label>
          <Input value={form.department} onChange={set("department")} />
        </div>
        <div>
          <Label>Location</Label>
          <Input value={form.location} onChange={set("location")} />
        </div>
        <div>
          <Label>Work mode</Label>
          <Select value={form.work_mode} onChange={set("work_mode")}>
            <option>On-site</option>
            <option>Remote</option>
            <option>Hybrid</option>
          </Select>
        </div>
        <div>
          <Label>Job type</Label>
          <Select value={form.job_type} onChange={set("job_type")}>
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
            <option>Internship</option>
          </Select>
        </div>
        <div>
          <Label>Min experience (yrs)</Label>
          <Input type="number" min={0} value={form.experience_min} onChange={set("experience_min")} />
        </div>
        <div>
          <Label>Max experience (yrs)</Label>
          <Input type="number" min={0} value={form.experience_max} onChange={set("experience_max")} />
        </div>
        <div>
          <Label>Salary min</Label>
          <Input type="number" value={form.salary_min} onChange={set("salary_min")} placeholder="80000" />
        </div>
        <div>
          <Label>Salary max</Label>
          <Input type="number" value={form.salary_max} onChange={set("salary_max")} placeholder="120000" />
        </div>
        <div className="col-span-2">
          <Label>Required skills (comma separated)</Label>
          <Input value={form.skills} onChange={set("skills")} placeholder="React, Node.js, TypeScript, AWS" />
        </div>
        <div className="col-span-2">
          <Label>Description</Label>
          <Textarea rows={3} value={form.description} onChange={set("description")} placeholder="Paste job description text here..." />
          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleAutoExtract}
              disabled={parsing || !form.description.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/20 disabled:opacity-50 transition-colors"
            >
              {parsing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              Auto-extract skills & requirements
            </button>
          </div>

          {/* Parsed Chips Preview */}
          {parsedResult && (
            <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-950/5 p-3 text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <Check className="h-4 w-4" /> Parsed Requirements Extracted:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {parsedResult.skills.map((skill) => (
                  <span key={skill} className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 font-medium text-emerald-700 dark:text-emerald-300">
                    {skill}
                  </span>
                ))}
                {parsedResult.experience_min_years !== null && (
                  <span className="rounded-full bg-sky-500/15 border border-sky-500/30 px-2.5 py-0.5 font-medium text-sky-700 dark:text-sky-300">
                    Exp: {parsedResult.experience_min_years}–{parsedResult.experience_max_years} yrs
                  </span>
                )}
                {parsedResult.salary_min !== null && (
                  <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 font-medium text-amber-700 dark:text-amber-300">
                    Salary: ${parsedResult.salary_min}–${parsedResult.salary_max} {parsedResult.currency}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        {error && <p className="col-span-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}
        <div className="col-span-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={busy}>{busy ? "Creating…" : "Create Job"}</Button>
        </div>
      </form>
    </Modal>
  );
}

