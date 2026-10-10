import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { settings } = useSettings();
  const shouldAnimate = !settings.reduceAllMotion && settings.animateModals;

  // Listen for Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="welcome-modal-container"
          className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6 select-none"
        >
          {/* 1. Backdrop / Lớp nền mờ */}
          <motion.div
            id="welcome-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50"
          />

          {/* 2. Dialog Modal Box - Fluent Design ContentDialog */}
          <motion.div
            id="welcome-modal-dialog"
            initial={{ opacity: 0, scale: 1.10 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              transition: {
                duration: 0.28,
                ease: [0.16, 1, 0.3, 1]
              }
            }}
            exit={{ 
              opacity: 0, 
              scale: 1.08,
              transition: {
                duration: 0.20,
                ease: [0.16, 1, 0.3, 1]
              }
            }}
            className="fluent-modal-dialog relative z-10 w-full max-w-[460px] bg-white dark:bg-[#202020] rounded-[14px] overflow-hidden shadow-[0_24px_48px_rgba(0,0,0,0.22),0_2px_6px_rgba(0,0,0,0.08)] dark:shadow-[0_24px_48px_rgba(0,0,0,0.7),0_2px_6px_rgba(255,255,255,0.04)] border border-black/[0.08] dark:border-white/[0.08] text-[#111827] dark:text-[#F3F4F6]"
          >
            {/* Header & Body Content Area */}
            <div className="p-6 pb-5">
              <h2
                id="welcome-modal-title"
                className="text-[19px] sm:text-[20px] font-semibold text-[#111827] dark:text-[#FFFFFF] tracking-tight leading-snug font-sans"
              >
                Software Update Successful
              </h2>

              <p
                id="welcome-modal-description"
                className="text-[13.5px] sm:text-[14px] text-[#4b5563] dark:text-[#a1a1aa] leading-relaxed mt-2.5 font-normal"
              >
                Your V-One experience has been updated with the Microsoft Fluent Design System, featuring seamless navigation, smooth animations, and high-definition live streaming.
              </p>

              {/* Version Specs in Fluent Card */}
              <div className="mt-4 p-3.5 rounded-lg bg-[#F9F9F9] dark:bg-[#2B2B2B] border border-black/[0.06] dark:border-white/[0.08] space-y-2 select-text text-[13px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#666666] dark:text-[#AAAAAA]">Software Version</span>
                  <span className="font-semibold text-[#111827] dark:text-[#FFFFFF]">26.10.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#666666] dark:text-[#AAAAAA]">Release Build</span>
                  <span className="font-semibold text-[#111827] dark:text-[#FFFFFF]">26v1009</span>
                </div>
                <div className="pt-2 mt-1 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
                  <span className="text-[#666666] dark:text-[#AAAAAA]">Design System</span>
                  <span className="font-semibold text-[#4cc2ff]">
                    Microsoft Fluent Design
                  </span>
                </div>
              </div>
            </div>

            {/* Subtle Divider */}
            <div className="h-[1px] w-full bg-[#E5E5E5] dark:bg-[#2F2F2F]" />

            {/* Bottom Actions Footer */}
            <div className="fluent-modal-footer bg-[#F3F3F3] dark:bg-[#1C1C1C] px-6 py-4 flex items-center justify-start sm:justify-start gap-3">
              <button
                type="button"
                id="btn-welcome-close"
                onClick={onClose}
                className="fluent-btn-primary px-6 h-9 rounded-[6px] bg-[#4cc2ff] hover:bg-[#6bd0ff] active:bg-[#3bb2ef] text-black font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.1)] transition-colors border border-black/20 flex items-center justify-center cursor-default"
              >
                <span className="text-black font-semibold">Continue</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="fluent-btn-secondary px-6 h-9 rounded-[6px] bg-white dark:bg-[#2C2C2C] hover:bg-[#F9F9F9] dark:hover:bg-[#343434] active:bg-[#EEEEEE] dark:active:bg-[#222222] text-[#111827] dark:text-[#FFFFFF] border border-[#d1d1d1] dark:border-[#3E3E3E] text-[13.5px] font-normal shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors flex items-center justify-center cursor-default"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
