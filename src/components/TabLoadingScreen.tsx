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
      className={`tab-loading-slide-up w-full flex-1 flex flex-col items-center justify-center min-h-[60vh] sm:min-h-[70vh] py-12 select-none my-auto ${className}`}
    >
      <div className="flex items-center justify-center">
        {/* Enlarged elegant spinning ring in #4cc2ff */}
        <SpinningRing size={48} strokeWidth={4} color="#4cc2ff" />
      </div>
    </div>
  );
};
