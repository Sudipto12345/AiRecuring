"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { api, ApiError } from "@/lib/api";
import type { Job } from "@/lib/types";

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
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

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
          <Textarea rows={3} value={form.description} onChange={set("description")} />
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
