"use client";

import { useRef, useState, useEffect } from "react";
import { FileText, UploadCloud, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Label, Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { api, ApiError, getToken } from "@/lib/api";
import type { Job, UploadResult } from "@/lib/types";

interface UploadResultT extends UploadResult {}

export function UploadDialog({
  open,
  onClose,
  jobs,
  defaultJobId,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  jobs: Job[];
  defaultJobId?: string;
  onDone: (result: UploadResultT) => void;
}) {
  const [jobId, setJobId] = useState(defaultJobId ?? jobs[0]?.id ?? "");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (busy) {
      setElapsed(0);
      interval = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [busy]);

  function addFiles(list: FileList | null) {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)]);
  }

  async function submit() {
    if (!jobId || files.length === 0) {
      setError("Select a job and at least one CV file.");
      return;
    }
    setBusy(true);
    setError(null);
    const form = new FormData();
    form.append("job_id", jobId);
    files.forEach((f) => form.append("files", f));
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      const res = await fetch(`${base}/candidates/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: form,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new ApiError(res.status, data?.detail || "Upload failed");
      }
      const result = (await res.json()) as UploadResultT;
      setFiles([]);
      onDone(result);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Upload CVs">
      <div className="space-y-4">
        <div>
          <Label>Job position</Label>
          <Select value={jobId} onChange={(e) => setJobId(e.target.value)}>
            <option value="">Select a job…</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </Select>
        </div>

        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            addFiles(e.dataTransfer.files);
          }}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-line bg-slate-50/60 px-6 py-10 text-center hover:border-brand-300 hover:bg-brand-50/40"
        >
          <UploadCloud className="h-8 w-8 text-brand-500" />
          <p className="mt-2 text-sm font-medium text-ink-700">Drop CVs here or click to browse</p>
          <p className="text-xs text-ink-400">PDF, DOCX or TXT — bulk upload supported</p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-emerald-50/70 p-2.5 text-xs text-emerald-800 border border-emerald-200">
              <span className="font-semibold">⚡ Estimated AI Credits required:</span>
              <span className="font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-300">
                {files.length * 1} Credits ({files.length} CV{files.length > 1 ? "s" : ""})
              </span>
            </div>
            <ul className="max-h-40 space-y-1.5 overflow-y-auto">
              {files.map((f, i) => (
                <li key={i} className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm">
                  <FileText className="h-4 w-4 text-ink-400" />
                  <span className="flex-1 truncate text-ink-700">{f.name}</span>
                  <button onClick={() => setFiles((p) => p.filter((_, idx) => idx !== i))} className="text-ink-400 hover:text-rose-500">
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

        {busy && (
          <div className="flex flex-col items-center justify-center space-y-3 py-4">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full border-2 border-brand-400 opacity-20"></div>
              <div className="absolute inset-2 animate-spin rounded-full border-b-2 border-t-2 border-brand-500"></div>
              <FileText className="h-6 w-6 text-brand-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-ink-700">Analyzing CVs using AI...</p>
              <p className="mt-1 text-xs text-ink-400">
                Time elapsed: {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, "0")}
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy}>
            {busy ? "Analyzing…" : `Upload & Rank ${files.length || ""}`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
