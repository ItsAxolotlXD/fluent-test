import React from 'react';

interface CategoryIconProps {
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  className = 'w-6 h-6 sm:w-7 sm:h-7 shrink-0',
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 align-middle category-icon-svg text-black dark:text-transparent ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* Dark mode: Gradient xanh dương nhạt */}
        <linearGradient
          id="vplay-cat-inverted-triangle-grad"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#93c5fd" />
        </linearGradient>

        {/* Light mode: Gradient xanh dương đậm */}
        <linearGradient
          id="vplay-cat-inverted-triangle-grad-light"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#005a9e" />
          <stop offset="50%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
      </defs>
      {/* Tam giác ngược: ở Light mode là gradient xanh dương đậm, ở Dark mode là gradient xanh dương nhạt */}
      <path
        d="M 2.2 3.6 H 21.8 L 12 21.6 Z"
        className="category-icon-path stroke-[url(#vplay-cat-inverted-triangle-grad-light)] dark:stroke-[url(#vplay-cat-inverted-triangle-grad)]"
        stroke="currentColor"
        strokeWidth="3.6"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};
