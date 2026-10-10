import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { KeyRound, Eye, EyeOff } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

interface DeveloperModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivate: () => void;
}

export const DeveloperModeModal: React.FC<DeveloperModeModalProps> = ({
  isOpen,
  onClose,
  onActivate,
}) => {
  const { settings } = useSettings();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input and reset when opened
  useEffect(() => {
    if (isOpen) {
      setCode('');
      setError(null);
      setShowPassword(false);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

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

  const handleActivate = () => {
    const cleanCode = code.trim();
    if (cleanCode.length !== 6) {
      setError('Please enter exactly 6 characters.');
      inputRef.current?.focus();
      return;
    }

    // Activated successfully
    setError(null);
    onActivate();
    onClose();
  };

  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleActivate();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="developer-mode-modal-container"
          className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6 select-none"
        >
          {/* 1. Backdrop / Lớp nền mờ */}
          <motion.div
            id="developer-mode-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50"
          />

          {/* 2. Dialog Modal Box - Fluent Design ContentDialog */}
          <motion.div
            id="developer-mode-modal-dialog"
            initial={{ opacity: 0, scale: 1.10 }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: {
                duration: 0.28,
                ease: [0.16, 1, 0.3, 1],
              },
            }}
            exit={{
              opacity: 0,
              scale: 1.08,
              transition: {
                duration: 0.20,
                ease: [0.16, 1, 0.3, 1],
              },
            }}
            className="fluent-modal-dialog relative z-10 w-full max-w-[460px] bg-white dark:bg-[#202020] rounded-[14px] overflow-hidden shadow-[0_24px_48px_rgba(0,0,0,0.22),0_2px_6px_rgba(0,0,0,0.08)] dark:shadow-[0_24px_48px_rgba(0,0,0,0.7),0_2px_6px_rgba(255,255,255,0.04)] border border-black/[0.08] dark:border-white/[0.08] text-[#111827] dark:text-[#F3F4F6]"
          >
            {/* Header & Body Content Area */}
            <div className="p-6 pb-5">
              <h2
                id="developer-mode-modal-title"
                className="text-[19px] sm:text-[20px] font-semibold text-[#111827] dark:text-[#FFFFFF] tracking-tight leading-snug font-sans"
              >
                Activate Developer Mode
              </h2>

              <p
                id="developer-mode-modal-description"
                className="text-[13.5px] sm:text-[14px] text-[#4b5563] dark:text-[#a1a1aa] leading-relaxed mt-2.5 font-normal"
              >
                Enter the 6-character security code to unlock advanced diagnostic tools and experimental system settings.
              </p>

              {/* 6-character Code Input Field */}
              <div className="mt-4">
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-[#777777] pointer-events-none">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    ref={inputRef}
                    id="input-developer-code"
                    type={showPassword ? 'text' : 'password'}
                    maxLength={6}
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.slice(0, 6));
                      if (error) setError(null);
                    }}
                    onKeyDown={handleKeyDownInput}
                    placeholder="••••••"
                    className="w-full bg-[#F9F9F9] dark:bg-[#2B2B2B] border border-black/[0.12] dark:border-white/[0.12] border-b-2 border-b-[#888888] dark:border-b-[#777777] rounded-[4px] pl-9 pr-10 py-2 text-center text-lg font-mono tracking-[0.3em] text-[#111827] dark:text-[#FFFFFF] placeholder:text-[#888888] focus:outline-none focus:border-b-[#4cc2ff] focus:border-b-2 transition-all"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-[#777777] hover:text-[#111827] dark:hover:text-[#FFFFFF] transition-colors cursor-default p-1"
                    title={showPassword ? 'Hide code' : 'Show code'}
                    aria-label={showPassword ? 'Hide code' : 'Show code'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {error && (
                  <p className="text-xs text-rose-500 mt-2 px-1 font-medium">
                    {error}
                  </p>
                )}
              </div>
            </div>

            {/* Subtle Divider */}
            <div className="h-[1px] w-full bg-[#E5E5E5] dark:bg-[#2F2F2F]" />

            {/* Bottom Actions Footer */}
            <div className="fluent-modal-footer bg-[#F3F3F3] dark:bg-[#1C1C1C] px-6 py-4 flex items-center justify-start gap-3">
              <button
                type="button"
                id="btn-devmode-activate"
                onClick={handleActivate}
                className="fluent-btn-primary px-6 h-9 rounded-[6px] bg-[#4cc2ff] hover:bg-[#6bd0ff] active:bg-[#3bb2ef] text-black font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.1)] transition-colors border border-black/20 flex items-center justify-center cursor-default"
              >
                <span className="text-black font-semibold">Activate</span>
              </button>
              <button
                type="button"
                id="btn-devmode-close"
                onClick={onClose}
                className="fluent-btn-secondary px-6 h-9 rounded-[6px] bg-white dark:bg-[#2C2C2C] hover:bg-[#F9F9F9] dark:hover:bg-[#343434] active:bg-[#EEEEEE] dark:active:bg-[#222222] text-[#111827] dark:text-[#FFFFFF] border border-[#d1d1d1] dark:border-[#3E3E3E] text-[13.5px] font-normal shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors flex items-center justify-center cursor-default"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
