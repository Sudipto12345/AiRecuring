"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import Lottie to prevent SSR issues (lottie-react uses window)
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export function LottiePlayer({ 
  url, 
  className, 
  loop = true,
  autoplay = true
}: { 
  url: string; 
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
}) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (mounted) setData(json);
      })
      .catch((err) => console.error("Lottie fetch error:", err));
      
    return () => { mounted = false; };
  }, [url]);

  if (!data) {
    return <div className={`animate-pulse bg-zinc-100/50 dark:bg-zinc-800/50 rounded-xl ${className}`} />;
  }

  return (
    <Lottie
      animationData={data}
      loop={loop}
      autoplay={autoplay}
      className={className}
    />
  );
}
