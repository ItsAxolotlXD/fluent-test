import React from 'react';
import { WINDOWS_LOADING_GIF } from '../constants/assets';
import { useSettings } from '../hooks/useSettings';
import { TriangleLoader } from './TriangleLoader';

interface TabLoadingScreenProps {
  className?: string;
}

export const TabLoadingScreen: React.FC<TabLoadingScreenProps> = ({ className = '' }) => {
  const { settings } = useSettings();

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Đang tải..."
      className={`w-full flex-1 flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[55vh] py-16 sm:py-24 select-none ${className}`}
    >
      {settings.triangleExperiment ? (
        <div className="relative flex flex-col items-center justify-center">
          <TriangleLoader size={88} glow={false} />
        </div>
      ) : (
        <div className="relative flex items-center justify-center">
          {/* Windows Loading GIF - Clean with no glow */}
          <img
            src={WINDOWS_LOADING_GIF}
            alt="Đang tải..."
            className="w-14 h-14 sm:w-16 sm:h-16 object-contain pointer-events-none select-none animate-[spin_5s_linear_infinite]"
          />
        </div>
      )}
    </div>
  );
};
