import React from 'react';
interface TriangleLoaderProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

/**
 * Replaced with thick spinning ring (colored #4cc2ff) as requested.
 */
export const TriangleLoader: React.FC<TriangleLoaderProps> = ({
  size = 56,
  className = ''
}) => {
  return (
    <div
      role="status"
      aria-label="Đang tải..."
      className={`inline-flex items-center justify-center select-none pointer-events-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 44 44" width={size} height={size} className="fluent-spinning-ring" aria-hidden="true">
        <defs>
          <linearGradient id="triangle-loader-gradient" x1="8" y1="8" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#4cc2ff" />
            <stop offset="0.5" stopColor="#6bd0ff" />
            <stop offset="1" stopColor="#3bb2ef" />
          </linearGradient>
        </defs>
        <path d="M22 5L39 36H5L22 5Z" fill="none" stroke="url(#triangle-loader-gradient)" strokeWidth={Math.max(4, Math.round(size / 14))} strokeLinejoin="round" />
      </svg>
    </div>
  );
};
