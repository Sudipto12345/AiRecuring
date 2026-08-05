"use client";

import React from "react";

interface SkeletonTableProps {
  rows?: number;
  cols?: number;
  columns?: number;
  showAvatar?: boolean;
}

export function SkeletonTable({ rows = 5, cols, columns = 4, showAvatar = false }: SkeletonTableProps) {
  const actualCols = cols || columns;
  // Generate slightly random widths for columns to make it look organic
  const getColWidth = (colIdx: number) => {
    if (colIdx === 0 && showAvatar) return "w-[200px]"; // Needs more space if it has an avatar
    
    const widths = ["w-[15%]", "w-[20%]", "w-[25%]", "w-[30%]"];
    return widths[colIdx % widths.length];
  };

  return (
    <div className="w-full overflow-hidden rounded-xl border border-line bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-sm animate-fade-slide-up">
      {/* Header */}
      <div className="flex w-full items-center gap-4 border-b border-line dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/50 px-4 py-3">
        {Array.from({ length: actualCols }).map((_, i) => (
          <div key={`th-${i}`} className={`h-4 skeleton ${getColWidth(i)}`} />
        ))}
      </div>

      {/* Rows */}
      <div className="flex flex-col">
        {Array.from({ length: rows }).map((_, r) => (
          <div 
            key={`tr-${r}`} 
            className="flex w-full items-center gap-4 border-b border-line dark:border-zinc-800 px-4 py-4 last:border-b-0"
          >
            {showAvatar && (
              <div className="flex items-center gap-3 w-[200px] shrink-0">
                <div className="h-10 w-10 shrink-0 rounded-full skeleton" />
                <div className="flex w-full flex-col gap-2">
                  <div className="h-4 w-3/4 skeleton" />
                  <div className="h-3 w-1/2 skeleton opacity-70" />
                </div>
              </div>
            )}
            
            {Array.from({ length: showAvatar ? actualCols - 1 : actualCols }).map((_, c) => {
              // Start offset if avatar is shown
              const idx = showAvatar ? c + 1 : c;
              return (
                <div key={`td-${r}-${c}`} className={`${getColWidth(idx)}`}>
                  <div className="h-4 w-full max-w-[80%] skeleton" />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
