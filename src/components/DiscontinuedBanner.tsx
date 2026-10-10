import React from 'react';
import { AlertCircle } from 'lucide-react';

interface DiscontinuedBannerProps {
  navigate: (route: string) => void;
  className?: string;
}

export const DiscontinuedBanner: React.FC<DiscontinuedBannerProps> = ({
  navigate,
  className = ''
}) => {
  return (
    <div
      role="alert"
      className={`fluent-reveal-item w-full rounded-[6px] bg-[#ffffff] dark:bg-[#2b2b2b] border border-black/10 dark:border-[#3d3d3d] border-l-4 border-l-[#f59e0b] dark:border-l-[#f59e0b] p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-xs transition-colors ${className}`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <AlertCircle className="w-5 h-5 text-[#f59e0b] shrink-0 mt-0.5" />
        <div className="min-w-0">
          <div
            style={{ fontWeight: 600 }}
            className="text-sm sm:text-[15px] font-semibold text-[#111827] dark:text-white leading-tight"
          >
            Vplay is no longer supported
          </div>
          <p
            style={{ fontWeight: 400 }}
            className="text-xs sm:text-[13px] font-normal text-[#4b5563] dark:text-[#a1a1aa] leading-relaxed mt-1"
          >
            Vplay streaming platform officially ceased support on October 2, 2026. This project was intended solely for developers to experiment with a Fluent Design interface based on the legacy Vplay application's codebase, not an effort to revive Vplay, and will receive no further updates. Please visit the homepage for more details.
          </p>
        </div>
      </div>

      <div className="flex items-center shrink-0 sm:self-center pl-8 sm:pl-0">
        <button
          type="button"
          onClick={() => navigate('/')}
          style={{ fontWeight: 400 }}
          className="px-4 py-1.5 rounded-[4px] bg-[#4cc2ff] hover:bg-[#3bb2ef] active:scale-95 text-black font-normal text-xs sm:text-[13px] transition-all cursor-default select-none shadow-xs whitespace-nowrap"
        >
          Learn more
        </button>
      </div>
    </div>
  );
};
