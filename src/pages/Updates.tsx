import React from 'react';
import { RefreshCw, CheckCircle2, Sparkles, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

interface UpdatesProps {
  navigate: (route: string) => void;
  onOpenUpdate?: () => void;
}

export const Updates: React.FC<UpdatesProps> = ({ navigate, onOpenUpdate }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/10 dark:border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white tracking-tight">
            Updates & Release History
          </h1>
          <p className="text-xs sm:text-sm text-black dark:text-[#9CA3AF] mt-1">
            Keep V-One running smoothly with the latest features and security improvements.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenUpdate}
          className="fluent-btn-primary px-5 h-9 rounded-[6px] bg-[#0078d4] dark:bg-[#4cc2ff] hover:bg-[#106ebe] dark:hover:bg-[#6bd0ff] active:bg-[#005a9e] dark:active:bg-[#3bb2ef] text-white dark:text-black font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5 stroke-[2]" />
          <span>Check for updates</span>
        </button>
      </div>

      {/* Current Version Card */}
      <div className="p-5 sm:p-6 rounded-[10px] bg-white dark:bg-[#38383d] border border-[#e5e5e5] dark:border-[#48484e] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-semibold text-black dark:text-white">
                You're up to date
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#4cc2ff]/20 text-[#0078d4] dark:text-[#4cc2ff]">
                Latest
              </span>
            </div>
            <p className="text-xs text-black dark:text-[#AAAAAA] mt-0.5">
              V-One version 26.11 (Build 261014) • Microsoft Fluent Design
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenUpdate}
          className="fluent-btn-secondary px-4 h-8.5 rounded-[6px] bg-white dark:bg-[#2C2C2C] hover:bg-[#F9F9F9] dark:hover:bg-[#343434] active:bg-[#EEEEEE] dark:active:bg-[#222222] text-black dark:text-[#FFFFFF] border border-[#d1d1d1] dark:border-[#3E3E3E] text-xs font-medium cursor-pointer transition-colors shadow-xs"
        >
          Reinstall update
        </button>
      </div>

      {/* Changelog Highlights */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-black dark:text-[#AAAAAA]">
          What's New in Version 26.11
        </h3>

        <div className="space-y-3">
          <div className="p-4 rounded-[10px] bg-white dark:bg-[#38383d] border border-[#e5e5e5] dark:border-[#48484e] shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0078d4] dark:text-[#4cc2ff]">
              <Sparkles className="w-4 h-4" />
              <span>Unified Fluent Dialog Experience</span>
            </div>
            <h4 className="text-sm font-semibold text-black dark:text-white">
              Consistent Layout & Spring Animations
            </h4>
            <p className="text-xs sm:text-sm text-black dark:text-[#AAAAAA] leading-relaxed">
              All modal dialogs across V-One now share the exact same Fluent design tokens, border radii, backdrop blur, scale transition curve, and tactile bottom action bars.
            </p>
          </div>

          <div className="p-4 rounded-[10px] bg-white dark:bg-[#38383d] border border-[#e5e5e5] dark:border-[#48484e] shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0078d4] dark:text-[#4cc2ff]">
              <Clock className="w-4 h-4" />
              <span>Performance Guard Tab Switching</span>
            </div>
            <h4 className="text-sm font-semibold text-black dark:text-white">
              Smooth 3-Second Loading Transition
            </h4>
            <p className="text-xs sm:text-sm text-black dark:text-[#AAAAAA] leading-relaxed">
              Eliminated stutters when switching heavy routes by adding a standardized 3-second Fluent loading state before rendering complex views.
            </p>
          </div>

          <div className="p-4 rounded-[10px] bg-white dark:bg-[#38383d] border border-[#e5e5e5] dark:border-[#48484e] shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0078d4] dark:text-[#4cc2ff]">
              <ShieldCheck className="w-4 h-4" />
              <span>Acrylic Blur & Fluid Motion</span>
            </div>
            <h4 className="text-sm font-semibold text-black dark:text-white">
              Refined Sign-In Flyout & TopBar Polish
            </h4>
            <p className="text-xs sm:text-sm text-black dark:text-[#AAAAAA] leading-relaxed">
              Sign-in flyout now features realistic acrylic backdrop blur, smoother slide-up spring transitions, and a borderless top bar header.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
