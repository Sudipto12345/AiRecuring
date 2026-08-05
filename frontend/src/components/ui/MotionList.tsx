"use client";

import React, { useEffect, useRef, useState } from "react";

interface MotionListProps {
  children: React.ReactNode;
  staggerMs?: number;
  className?: string;
}

export function MotionList({ children, staggerMs = 50, className = "" }: MotionListProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        
        return (
          <div 
            style={{
              opacity: isVisible ? 1 : 0,
              animationDelay: `${index * staggerMs}ms`,
            }}
            className={isVisible ? "animate-fade-slide-up" : ""}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}
