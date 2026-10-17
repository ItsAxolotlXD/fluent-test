import React from 'react';
import { motion } from 'motion/react';

export const WatchPreview: React.FC = () => {
  return (
    <div
      id="watch-preview-page"
      className="w-full min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16 select-none"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-2xl mx-auto space-y-3"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] dark:text-white tracking-tight">
          Coming soon
        </h1>
        <p className="text-sm sm:text-base text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed">
          This tab is currently undergoing major construction as the third milestone of Project Orbit, aimed at phasing out the outdated Vplay interface. Stay tuned for updates
        </p>
      </motion.div>
    </div>
  );
};
