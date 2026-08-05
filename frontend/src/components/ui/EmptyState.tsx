"use client";

import React, { ReactNode, useEffect, useState } from "react";
// Using a dynamic import for Lottie to avoid SSR issues
import dynamic from "next/dynamic";

const Player = dynamic(() => import("@lottiefiles/react-lottie-player").then(mod => mod.Player), { ssr: false });

export const LOTTIE_URLS = {
  EMPTY_BOX: "https://assets10.lottiefiles.com/packages/lf20_wnqlfojb.json",
  SUCCESS: "https://assets4.lottiefiles.com/packages/lf20_jbrw3hcz.json",
  LOADING: "https://assets9.lottiefiles.com/packages/lf20_p8bfn5of.json",
};

interface EmptyStateProps {
  lottieUrl?: string;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ 
  lottieUrl = LOTTIE_URLS.EMPTY_BOX, 
  title, 
  description, 
  action 
}: EmptyStateProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex w-full flex-col items-center justify-center py-12 px-4 text-center animate-fade-slide-up">
      {mounted && (
        <div className="mb-6 h-48 w-48 opacity-90">
          <Player
            autoplay
            loop
            src={lottieUrl}
            style={{ height: '100%', width: '100%' }}
          />
        </div>
      )}
      
      <h3 className="font-display mb-2 text-xl font-semibold text-ink-900 dark:text-white">
        {title}
      </h3>
      <p className="font-body mb-6 max-w-sm text-sm text-ink-500 dark:text-zinc-400">
        {description}
      </p>
      
      {action && (
        <div className="animate-scale-in" style={{ animationDelay: '200ms' }}>
          {action}
        </div>
      )}
    </div>
  );
}
