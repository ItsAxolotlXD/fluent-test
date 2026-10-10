import React from 'react';
import { SpinningRing } from './SpinningRing';

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
    <SpinningRing
      size={size}
      strokeWidth={Math.max(4, Math.round(size / 10))}
      color="#4cc2ff"
      className={className}
    />
  );
};
