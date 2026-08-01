"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send, Sparkles, X } from "lucide-react";

import { api, ApiError } from "@/lib/api";
import type { CopilotAction, CopilotResponse } from "@/lib/types";

interface Msg {
  role: "user" | "assistant";
  text: string;
  pending?: boolean;
}

const QUICK: { label: string; action: CopilotAction; prompt: string }[] = [
  { label: "Generate JD", action: "generate_jd", prompt: "Write a job description for a Senior Full Stack Developer." },
  { label: "Summarize Resume", action: "summarize_resume", prompt: "Summarize the key strengths to look for in a backend engineer resume." },
  { label: "Compare Candidates", action: "compare_candidates", prompt: "How should I compare two shortlisted candidates fairly?" },
  { label: "Create Questions", action: "chat", prompt: "Create 5 interview questions for a Product Manager role." },
  { label: "Generate Report", action: "generate_report", prompt: "Draft a hiring status report for this week." },
  { label: "Ask Company Data", action: "ask_data", prompt: "How many candidates are in my pipeline right now?" },
];

export function FloatingCopilot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", text: "Hi! I'm your recruiting copilot. Ask me to write a JD, summarize a resume, compare candidates, or query your pipeline." },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function send(text: string, action: CopilotAction = "chat") {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: trimmed }, { role: "assistant", text: "", pending: true }]);
    setBusy(true);
    try {
      const res = await api<CopilotResponse>("/ai/copilot", {
        method: "POST",
        body: { message: trimmed, action },
      });
      const tag = res.used_llm ? "" : "  ·  offline assist";
      setMessages((m) => {
        const next = m.slice(0, -1);
        return [...next, { role: "assistant", text: res.reply + (tag ? `\n\n_${tag.trim()}_` : "") }];
      });
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Something went wrong.";
      setMessages((m) => {
        const next = m.slice(0, -1);
        return [...next, { role: "assistant", text: `⚠️ ${msg}` }];
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="gradient-brand fixed bottom-20 right-4 z-[55] flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-pop transition-transform hover:scale-105 lg:bottom-6 lg:right-6"
        title="AI Copilot"
      >
        {open ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
      </button>

      {open && (
        <div className="a-elevated a-shadow-pop animate-pop fixed bottom-36 right-4 z-[55] flex h-[32rem] w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border a-border lg:bottom-24 lg:right-6">
          <div className="gradient-brand flex items-center gap-2.5 px-4 py-3 text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15">
              <Bot className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold">AI Copilot</p>
              <p className="text-[11px] text-white/70">Recruiting assistant</p>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto rounded-lg p-1 hover:bg-white/15">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-3">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-[13px] ${
                    m.role === "user" ? "gradient-brand text-white" : "a-surface-2 a-text"
                  }`}
                >
                  {m.pending ? <Loader2 className="h-4 w-4 animate-spin" /> : m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t a-border px-3 pt-2">
            <div className="flex flex-wrap gap-1.5 pb-2">
              {QUICK.map((q) => (
                <button
                  key={q.label}
                  disabled={busy}
                  onClick={() => send(q.prompt, q.action)}
                  className="a-hover rounded-full border a-border px-2.5 py-1 text-[11px] a-muted disabled:opacity-50"
                >
                  {q.label}
                </button>
              ))}
            </div>
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
              placeholder="Ask the copilot…"
              className="a-input h-10 flex-1 px-3 text-sm"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="gradient-brand flex h-10 w-10 items-center justify-center rounded-xl text-white disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
