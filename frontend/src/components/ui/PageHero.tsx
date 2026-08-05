import React, { ReactNode } from "react";

interface PageHeroProps {
  title: string | ReactNode;
  subtitle: string;
  image?: string;
  gradient?: string;
  badge?: string;
  actions?: ReactNode;
  action?: ReactNode;
  icon?: any;
}

export function PageHero({
  title,
  subtitle,
  image,
  gradient = "var(--gradient-brand)",
  badge,
  actions,
  action,
  icon: Icon,
}: PageHeroProps) {
  const finalActions = actions || action;
  return (
    <div 
      className="relative mb-6 overflow-hidden rounded-2xl border border-line shadow-sm animate-scale-in"
      style={{ background: gradient }}
    >
      {/* Decorative patterns */}
      <div className="absolute inset-0 bg-[url('/patterns/topography.svg')] opacity-10 bg-repeat bg-[length:400px]" />
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl" />
      <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-black opacity-10 blur-3xl" />

      <div className="relative z-10 flex min-h-[160px] flex-col justify-between p-6 sm:p-8 md:flex-row md:items-center">
        <div className="flex-1 max-w-2xl text-white">
          {badge && (
            <span className="mb-3 inline-flex items-center rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide backdrop-blur-md uppercase">
              {badge}
            </span>
          )}
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl text-white mb-2 shadow-sm">
            {title}
          </h1>
          <p className="text-white/80 font-body text-sm sm:text-base leading-relaxed max-w-xl">
            {subtitle}
          </p>
          
          {finalActions && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {finalActions}
            </div>
          )}
        </div>

        {image && (
          <div className="hidden md:block mt-6 md:mt-0 md:ml-8 animate-float">
            <img 
              src={image} 
              alt="Hero graphic" 
              className="max-h-32 w-auto object-contain drop-shadow-xl filter"
            />
          </div>
        )}
      </div>
    </div>
  );
}
