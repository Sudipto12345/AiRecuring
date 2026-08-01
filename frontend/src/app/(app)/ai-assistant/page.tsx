"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send, Sparkles } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { api, ApiError } from "@/lib/api";
import type { CopilotAction, CopilotResponse } from "@/lib/types";

interface Msg {
  role: "user" | "assistant";
  text: string;
  pending?: boolean;
}

const PROMPTS: { label: string; action: CopilotAction; prompt: string }[] = [
  { label: "Write a job description", action: "generate_jd", prompt: "Write a job description for a Senior Backend Engineer (Python, FastAPI)." },
  { label: "Summarize resume strengths", action: "summarize_resume", prompt: "What strengths should I look for in a data scientist resume?" },
  { label: "Compare candidates", action: "compare_candidates", prompt: "How do I fairly compare two shortlisted candidates?" },
  { label: "Interview questions", action: "chat", prompt: "Give me 6 structured interview questions for a Product Manager." },
  { label: "Weekly hiring report", action: "generate_report", prompt: "Draft a concise weekly hiring report from my pipeline." },
  { label: "Ask my pipeline", action: "ask_data", prompt: "How many candidates and interviews do I currently have?" },
];

export default function AiAssistantPage() {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", text: "I'm your recruiting copilot. Pick a prompt or ask me anything about hiring, candidates, and your pipeline." },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(text: string, action: CopilotAction = "chat") {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: trimmed }, { role: "assistant", text: "", pending: true }]);
    setBusy(true);
    try {
      const res = await api<CopilotResponse>("/ai/copilot", { method: "POST", body: { message: trimmed, action } });
      setMessages((m) => [...m.slice(0, -1), { role: "assistant", text: res.reply }]);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Something went wrong.";
      setMessages((m) => [...m.slice(0, -1), { role: "assistant", text: `⚠️ ${msg}` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4 lg:p-6">
      <AdminPageHeader
        title="AI Assistant"
        subtitle="Generate JDs, summarize resumes, compare candidates and query your pipeline."
      />

      <div className="flex flex-wrap gap-2">
        {PROMPTS.map((p) => (
          <button
            key={p.label}
            disabled={busy}
            onClick={() => send(p.prompt, p.action)}
            className="a-hover flex items-center gap-1.5 rounded-full border a-border px-3 py-1.5 text-xs a-muted disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5" /> {p.label}
          </button>
        ))}
      </div>

      <div className="a-card flex min-h-0 flex-1 flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex items-start gap-3"}>
              {m.role === "assistant" && (
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl a-accent-soft">
                  <Bot className="h-4 w-4" />
                </span>
              )}
              <div
                className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user" ? "gradient-brand text-white" : "a-surface-2 a-text"
                }`}
              >
                {m.pending ? <Loader2 className="h-4 w-4 animate-spin" /> : m.text}
              </div>
            </div>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 border-t a-border p-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the copilot anything…"
            className="a-input h-11 flex-1 px-3 text-sm"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="gradient-brand flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
