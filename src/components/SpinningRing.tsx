import React from 'react';

interface SpinningRingProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
  color?: string;
  ariaLabel?: string;
}

/**
 * Fluent Windows-style thick spinning progress ring.
 * Features a circular track and an animated arc in #4cc2ff.
 */
export const SpinningRing: React.FC<SpinningRingProps> = ({
  size = 48,
  strokeWidth = 5,
  className = '',
  color = '#4cc2ff',
  ariaLabel = 'Đang tải...'
}) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius; // ~113.1
  // Arc length is approximately 25-30% of the circumference for standard Fluent ProgressRing
  const strokeDasharray = `${circumference * 0.3} ${circumference * 0.7}`;

  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center select-none pointer-events-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 44 44"
        width={size}
        height={size}
        className={`fluent-spinning-ring ${className}`}
        style={{
          width: size,
          height: size,
          animation: 'fluent-progress-spin 1s linear infinite',
          transformOrigin: 'center center',
          display: 'block'
        }}
        aria-hidden="true"
      >
        {/* Thick spinning arc without background */}
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          data-splash-ring={color === '#4cc2ff' ? 'true' : undefined}
          style={{
            stroke: color,
            transformOrigin: '22px 22px'
          }}
        />
      </svg>
    </div>
  );
};
