"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown, Search } from "lucide-react";

import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  width?: string;
}

interface DataGridProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  search?: (row: T) => string;
  searchPlaceholder?: string;
  selectable?: boolean;
  bulkActions?: (selected: T[], clear: () => void) => React.ReactNode;
  onRowClick?: (row: T) => void;
  toolbar?: React.ReactNode;
  storageKey?: string;
  loading?: boolean;
  empty?: string;
}

interface SortState {
  key: string;
  dir: "asc" | "desc";
}

export function DataGrid<T>({
  columns,
  rows,
  rowKey,
  search,
  searchPlaceholder = "Search records…",
  selectable,
  bulkActions,
  onRowClick,
  toolbar,
  storageKey,
  loading,
  empty = "No records matching current criteria.",
}: DataGridProps<T>) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortState | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Restore sort state safely
  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = window.localStorage.getItem(`grid:${storageKey}`);
      if (raw) setSort(JSON.parse(raw).sort ?? null);
    } catch {
      // Ignore storage errors
    }
  }, [storageKey]);

  useEffect(() => {
    if (storageKey) {
      try {
        window.localStorage.setItem(`grid:${storageKey}`, JSON.stringify({ sort }));
      } catch {
        // Ignore storage write errors
      }
    }
  }, [sort, storageKey]);

  const filtered = useMemo(() => {
    let dataset = rows;
    if (query && search) {
      const q = query.toLowerCase().trim();
      dataset = dataset.filter((r) => search(r).toLowerCase().includes(q));
    }
    if (sort) {
      const targetCol = columns.find((c) => c.key === sort.key);
      if (targetCol?.sortValue) {
        dataset = [...dataset].sort((a, b) => {
          const valA = targetCol.sortValue!(a);
          const valB = targetCol.sortValue!(b);
          if (valA < valB) return sort.dir === "asc" ? -1 : 1;
          if (valA > valB) return sort.dir === "asc" ? 1 : -1;
          return 0;
        });
      }
    }
    return dataset;
  }, [rows, query, search, sort, columns]);

  const toggleSort = (key: string) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return null;
    });
  };

  const allSelected = filtered.length > 0 && filtered.every((r) => selected.has(rowKey(r)));
  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(rowKey)));
    }
  };

  const toggleRow = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());
  const selectedRows = filtered.filter((r) => selected.has(rowKey(r)));

  return (
    <div className="a-card overflow-hidden rounded-2xl border a-border shadow-sm transition-all">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b a-border bg-slate-50/50 dark:bg-white/[0.01] p-3.5 backdrop-blur-md">
        {search && (
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 a-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="a-input h-9 w-full pl-9 pr-3 text-xs focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">{toolbar}</div>
      </div>

      {/* Selection Banner */}
      {selectable && selectedRows.length > 0 && (
        <div className="flex items-center gap-3 border-b border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/15 px-4 py-2.5 text-xs">
          <span className="font-semibold text-indigo-700 dark:text-indigo-300">{selectedRows.length} selected</span>
          <div className="flex items-center gap-2">{bulkActions?.(selectedRows, clearSelection)}</div>
          <button onClick={clearSelection} className="ml-auto text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors">
            Clear selection
          </button>
        </div>
      )}

      {/* Table Display */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b a-border bg-slate-100/80 dark:bg-white/[0.03] text-left text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              {selectable && (
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="h-3.5 w-3.5 rounded border-slate-300 dark:border-white/20 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
              )}
              {columns.map((c) => (
                <th
                  key={c.key}
                  style={{ width: c.width }}
                  className={cn(
                    "px-4 py-3 font-semibold text-slate-700 dark:text-slate-200",
                    c.align === "right" && "text-right",
                    c.align === "center" && "text-center",
                  )}
                >
                  {c.sortable !== false && c.sortValue ? (
                    <button
                      onClick={() => toggleSort(c.key)}
                      className={cn(
                        "inline-flex items-center gap-1.5 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400",
                        c.align === "right" && "flex-row-reverse",
                      )}
                    >
                      {c.header}
                      {sort?.key === c.key ? (
                        sort.dir === "asc" ? (
                          <ArrowUp className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                        ) : (
                          <ArrowDown className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3 w-3 opacity-40 hover:opacity-100" />
                      )}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y a-divide">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-12 text-center text-xs font-medium a-faint">
                  <div className="flex justify-center items-center gap-2">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                    Loading dataset…
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-12 text-center text-xs font-medium a-faint">
                  {empty}
                </td>
              </tr>
            ) : (
              filtered.map((row) => {
                const id = rowKey(row);
                const isSelected = selected.has(id);
                return (
                  <tr
                    key={id}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      "group transition-colors duration-150",
                      onRowClick && "cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-white/[0.04]",
                      isSelected ? "bg-indigo-50/80 dark:bg-indigo-500/15" : "even:bg-slate-50/50 dark:even:bg-white/[0.01]"
                    )}
                  >
                    {selectable && (
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(id)}
                          className="h-3.5 w-3.5 rounded border-slate-300 dark:border-white/20 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                    )}
                    {columns.map((c) => (
                      <td
                        key={c.key}
                        style={{ width: c.width }}
                        className={cn(
                          "px-4 py-3 a-text font-medium",
                          c.align === "right" && "text-right",
                          c.align === "center" && "text-center",
                        )}
                      >
                        {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? "—")}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination / Table Footer */}
      <div className="flex items-center justify-between border-t a-border bg-slate-50/60 dark:bg-white/[0.01] px-4 py-2.5 text-[11px] a-faint">
        <span className="font-medium">
          Showing {filtered.length} of {rows.length} total entries
        </span>
        {query && <span className="rounded-md a-accent-soft px-2 py-0.5 font-medium">Filter: "{query}"</span>}
      </div>
    </div>
  );
}
