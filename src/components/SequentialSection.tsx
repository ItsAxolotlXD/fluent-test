import React, { useState, useEffect, useRef } from 'react';
import { SpinningRing } from './SpinningRing';

interface SequentialSectionProps {
  children: React.ReactNode;
  order: number;
  enabled?: boolean;
  className?: string;
  minHeight?: string | number;
}

export const SequentialSection: React.FC<SequentialSectionProps> = ({
  children,
  order,
  enabled = true,
  className = '',
  minHeight = '120px',
}) => {
  // If order === 0 or sequential loading is disabled, render immediately
  const [isLoaded, setIsLoaded] = useState(() => !enabled || order === 0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || order === 0 || isLoaded) {
      setIsLoaded(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsLoaded(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '220px 0px', // Preload smoothly 220px before entering viewport
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [enabled, order, isLoaded]);

  if (!enabled || isLoaded) {
    return <div className={`sequential-section-loaded ${className}`}>{children}</div>;
  }

  return (
    <div
      ref={containerRef}
      style={{ minHeight }}
      className={`sequential-section-placeholder w-full flex flex-col items-center justify-center py-8 select-none transition-opacity duration-200 ${className}`}
    >
      <div className="flex flex-col items-center justify-center gap-2">
        <SpinningRing size={36} strokeWidth={4} color="#4cc2ff" />
      </div>
    </div>
  );
};
