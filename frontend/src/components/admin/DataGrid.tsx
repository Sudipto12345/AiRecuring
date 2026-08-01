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
  searchPlaceholder = "Search…",
  selectable,
  bulkActions,
  onRowClick,
  toolbar,
  storageKey,
  loading,
  empty = "No records found.",
}: DataGridProps<T>) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortState | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!storageKey) return;
    const raw = window.localStorage.getItem(`grid:${storageKey}`);
    if (raw) {
      try {
        setSort(JSON.parse(raw).sort ?? null);
      } catch {
        /* ignore */
      }
    }
  }, [storageKey]);

  useEffect(() => {
    if (storageKey) window.localStorage.setItem(`grid:${storageKey}`, JSON.stringify({ sort }));
  }, [sort, storageKey]);

  const filtered = useMemo(() => {
    let out = rows;
    if (query && search) {
      const q = query.toLowerCase();
      out = out.filter((r) => search(r).toLowerCase().includes(q));
    }
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      if (col?.sortValue) {
        out = [...out].sort((a, b) => {
          const av = col.sortValue!(a);
          const bv = col.sortValue!(b);
          if (av < bv) return sort.dir === "asc" ? -1 : 1;
          if (av > bv) return sort.dir === "asc" ? 1 : -1;
          return 0;
        });
      }
    }
    return out;
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
    <div className="a-card overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b a-border p-3">
        {search && (
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 a-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="a-input h-9 w-full pl-9 pr-3 text-sm"
            />
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">{toolbar}</div>
      </div>

      {selectable && selectedRows.length > 0 && (
        <div className="flex items-center gap-3 border-b a-border bg-[var(--admin-accent-soft)] px-4 py-2 text-sm">
          <span className="font-medium a-accent">{selectedRows.length} selected</span>
          <div className="flex items-center gap-2">{bulkActions?.(selectedRows, clearSelection)}</div>
          <button onClick={clearSelection} className="ml-auto text-xs a-muted hover:underline">
            Clear
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b a-border text-left text-xs uppercase tracking-wide a-faint">
              {selectable && (
                <th className="w-10 px-4 py-2.5">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-[var(--admin-accent)]" />
                </th>
              )}
              {columns.map((c) => (
                <th
                  key={c.key}
                  style={{ width: c.width }}
                  className={cn(
                    "px-4 py-2.5 font-medium",
                    c.align === "right" && "text-right",
                    c.align === "center" && "text-center",
                  )}
                >
                  {c.sortable !== false && c.sortValue ? (
                    <button
                      onClick={() => toggleSort(c.key)}
                      className={cn(
                        "inline-flex items-center gap-1 hover:a-text",
                        c.align === "right" && "flex-row-reverse",
                      )}
                    >
                      {c.header}
                      {sort?.key === c.key ? (
                        sort.dir === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3 w-3 opacity-40" />
                      )}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-12 text-center a-faint">
                  Loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-12 text-center a-faint">
                  {empty}
                </td>
              </tr>
            ) : (
              filtered.map((row) => {
                const id = rowKey(row);
                return (
                  <tr
                    key={id}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      "border-b a-border/70 last:border-0",
                      onRowClick && "a-hover cursor-pointer",
                      selected.has(id) && "bg-[var(--admin-accent-soft)]",
                    )}
                  >
                    {selectable && (
                      <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selected.has(id)}
                          onChange={() => toggleRow(id)}
                          className="accent-[var(--admin-accent)]"
                        />
                      </td>
                    )}
                    {columns.map((c) => (
                      <td
                        key={c.key}
                        style={{ width: c.width }}
                        className={cn(
                          "px-4 py-2.5 a-text",
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

      <div className="flex items-center justify-between border-t a-border px-4 py-2 text-xs a-faint">
        <span>
          {filtered.length} of {rows.length} rows
        </span>
        {query && <span>Filtered by “{query}”</span>}
      </div>
    </div>
  );
}
