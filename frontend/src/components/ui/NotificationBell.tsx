"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, CheckCircle2, UserCheck, CreditCard, X, Clock, FileText } from "lucide-react";
import { useAuth } from "@/lib/auth";

export interface NotificationItem {
  id: string;
  event: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning";
}

export function NotificationBell() {
  const { session } = useAuth();
  const companyId = session?.user?.company_id;
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState<NotificationItem | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Connect to WebSocket
  useEffect(() => {
    if (!companyId) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = process.env.NEXT_PUBLIC_WS_HOST || window.location.host;
    const wsUrl = `${protocol}//${host}/api/notifications/ws/${companyId}`;

    let socket: WebSocket | null = null;
    let pingInterval: NodeJS.Timeout | null = null;

    try {
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        pingInterval = setInterval(() => {
          if (socket?.readyState === WebSocket.OPEN) {
            socket.send("ping");
          }
        }, 25000);
      };

      socket.onmessage = (event) => {
        if (event.data === "pong") return;
        try {
          const payload = JSON.parse(event.data);
          const eventType = payload.event || "system.info";
          const data = payload.data || {};

          let title = "Notification";
          let message = "You have a new update.";
          let type: "info" | "success" | "warning" = "info";

          if (eventType === "candidate.updated") {
            title = "Candidate Updated";
            message = data.count
              ? `${data.count} new candidate(s) uploaded & scored.`
              : `Candidate stage changed to ${data.stage || "updated"}.`;
            type = "info";
            // Dispatch global event for candidate page refresh
            window.dispatchEvent(new CustomEvent("candidate.updated", { detail: data }));
          } else if (eventType === "exam.completed") {
            title = "Assessment Completed";
            message = data.candidate_name
              ? `${data.candidate_name} finished ${data.exam_title || "assessment"}.`
              : "A candidate completed an exam module.";
            type = "success";
          } else if (eventType === "billing.invoice_paid") {
            title = "Invoice Paid";
            message = `Payment of ${data.amount || "$ --"} was processed successfully.`;
            type = "success";
          }

          const newItem: NotificationItem = {
            id: Math.random().toString(36).substring(2, 9),
            event: eventType,
            title,
            message,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            read: false,
            type,
          };

          setNotifications((prev) => [newItem, ...prev.slice(0, 49)]);

          // Trigger auto-dismissing toast for 5 seconds
          setToast(newItem);
          setTimeout(() => {
            setToast((current) => (current?.id === newItem.id ? null : current));
          }, 5000);

        } catch (err) {
          console.error("Failed to parse notification payload", err);
        }
      };

      socket.onerror = () => {
        // Fallback silently if WS not connected
      };
    } catch {
      // WS connection failure fallback
    }

    return () => {
      if (pingInterval) clearInterval(pingInterval);
      if (socket) socket.close();
    };
  }, [companyId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getIcon = (type: string, event: string) => {
    if (event === "candidate.updated") return <UserCheck className="h-4 w-4 text-emerald-500" />;
    if (event === "exam.completed") return <CheckCircle2 className="h-4 w-4 text-sky-500" />;
    if (event === "billing.invoice_paid") return <CreditCard className="h-4 w-4 text-amber-500" />;
    return <FileText className="h-4 w-4 text-slate-400" />;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadCount > 0) markAllAsRead();
        }}
        className="a-hover relative flex h-10 w-10 items-center justify-center rounded-xl border a-border a-muted transition-colors"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute right-2 top-2 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
          </span>
        )}
      </button>

      {/* Auto-Dismiss Toast Popup */}
      {toast && !isOpen && (
        <div className="fixed bottom-5 right-5 z-50 flex items-start gap-3 rounded-2xl border a-border a-surface p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-300 max-w-sm">
          <div className="rounded-xl border a-border p-2 bg-emerald-500/10">
            {getIcon(toast.type, toast.event)}
          </div>
          <div className="flex-1 text-xs">
            <p className="font-semibold a-text">{toast.title}</p>
            <p className="mt-0.5 a-faint">{toast.message}</p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="a-muted hover:a-text p-1"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="a-elevated a-shadow-pop absolute right-0 mt-2 w-80 sm:w-96 overflow-hidden rounded-2xl border a-border z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b a-border p-4 bg-slate-900/40">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-emerald-500" />
              <h3 className="text-sm font-semibold a-text">Real-time Activity</h3>
            </div>
            {notifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-medium text-emerald-500 hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y a-border">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="mx-auto h-8 w-8 a-faint mb-2 opacity-40" />
                <p className="text-xs font-medium a-muted">No notifications yet</p>
                <p className="text-[11px] a-faint mt-1">Live workspace activity updates will appear here.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 p-3.5 text-xs transition-colors ${
                    item.read ? "opacity-75" : "bg-emerald-500/5 font-medium"
                  }`}
                >
                  <div className="mt-0.5 rounded-lg border a-border p-1.5 a-surface shrink-0">
                    {getIcon(item.type, item.event)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold a-text truncate">{item.title}</p>
                      <span className="flex items-center gap-1 text-[10px] a-faint shrink-0">
                        <Clock className="h-3 w-3" /> {item.time}
                      </span>
                    </div>
                    <p className="mt-1 a-faint leading-relaxed break-words">{item.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
