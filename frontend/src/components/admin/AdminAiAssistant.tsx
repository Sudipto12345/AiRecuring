"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, X, Zap } from "lucide-react";
import { api, ApiError } from "@/lib/api";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5">
      <div className="flex h-7 w-7 flex-none items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20">
        <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
      </div>
      <div className="rounded-2xl rounded-tl-sm border a-border a-surface px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

export function AdminAiAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hello! I am your Platform Executive Assistant. Ask me about workspaces, revenue, credit usage, or verifications.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function handleSend(textToSend?: string) {
    const text = (textToSend || input).trim();
    if (!text || busy) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setBusy(true);

    try {
      const res = await api<{ reply: string; used_llm: boolean; tokens: number }>(
        "/admin/ai/copilot",
        { method: "POST", body: { message: text } }
      );
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    } catch (err) {
      const msgText = err instanceof ApiError
        ? `Error ${err.status}: ${err.message}`
        : "Connection failed. Please try again.";
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: msgText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Floating Trigger */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-600/20 transition-all duration-300 hover:scale-105 active:scale-95"
          aria-label="Open AI Copilot"
        >
          <Bot className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-3 sm:p-5 pointer-events-none">
          <div className="pointer-events-auto flex h-[540px] w-full max-w-[380px] flex-col overflow-hidden rounded-3xl border a-border a-surface shadow-2xl a-text animate-pop">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b a-border a-surface-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 border a-border text-indigo-500">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-[13px] font-bold a-text leading-tight">Executive Copilot</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] a-faint">AI Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg a-faint a-hover hover:a-text transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Action Chips */}
            <div className="flex gap-1.5 overflow-x-auto px-3.5 py-2 border-b a-border no-scrollbar a-surface-2">
              {["Overview", "Verifications", "Credits", "Revenue"].map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleSend(chip)}
                  disabled={busy}
                  className="flex flex-none items-center gap-1 rounded-lg border a-border a-surface px-2.5 py-1 text-[10px] font-medium a-muted hover:a-accent transition-all disabled:opacity-40"
                >
                  <Zap className="h-2.5 w-2.5 a-accent" />
                  {chip}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3 no-scrollbar">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender === "user" ? "justify-end" : "items-start gap-2.5"}`}>
                  {m.sender === "ai" && (
                    <div className="flex h-7 w-7 flex-none items-center justify-center rounded-xl bg-indigo-500/10 border a-border mt-0.5">
                      <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                    </div>
                  )}
                  <div className="max-w-[82%] space-y-1">
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-[12px] leading-relaxed whitespace-pre-wrap ${
                        m.sender === "user"
                          ? "rounded-br-sm bg-indigo-600 text-white shadow-sm"
                          : "rounded-tl-sm border a-border a-surface-2 a-text"
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="block text-[9px] a-faint px-1">{m.timestamp}</span>
                  </div>
                </div>
              ))}

              {busy && <TypingIndicator />}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex items-center gap-2 border-t a-border px-3 py-2.5 a-surface-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about platform metrics…"
                className="a-input flex-1 px-3 py-2 text-[12px]"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white transition-all hover:bg-indigo-500 disabled:opacity-30"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
