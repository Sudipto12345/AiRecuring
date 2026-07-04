export function Logo({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand text-base font-bold text-white shadow-sm">
        Ai
      </span>
      {!collapsed && (
        <div className="leading-tight">
          <p className="text-[15px] font-bold text-ink-900">
            AI<span className="text-gradient-brand">Recruit</span>
          </p>
          <p className="text-[10px] font-medium text-ink-400">Intelligent Hiring</p>
        </div>
      )}
    </div>
  );
}
