import React from 'react';
import { SpinningRing } from './SpinningRing';

interface TabLoadingScreenProps {
  className?: string;
}

export const TabLoadingScreen: React.FC<TabLoadingScreenProps> = ({ className = '' }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Đang tải..."
      className={`w-full flex-1 flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[55vh] py-16 sm:py-24 select-none ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {/* Thick spinning ring in #4cc2ff */}
        <SpinningRing size={64} strokeWidth={5.5} color="#4cc2ff" />
      </div>
    </div>
  );
};
