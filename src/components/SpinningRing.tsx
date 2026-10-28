import React from 'react';

interface SpinningRingProps {
  size?: number;
  /** The GIF defines its own stroke weight; retained for existing call sites. */
  strokeWidth?: number;
  className?: string;
  ariaLabel?: string;
}

export const SpinningRing: React.FC<SpinningRingProps> = ({
  size = 48,
  className = '',
  ariaLabel = 'Đang tải...'
}) => (
  <div
    role="status"
    aria-label={ariaLabel}
    className={`inline-flex items-center justify-center select-none pointer-events-none ${className}`}
    style={{ width: size, height: size }}
  >
    <div
      aria-hidden="true"
      data-spinning-ring="true"
      className="winui-gif-progress-ring"
    />
  </div>
);
