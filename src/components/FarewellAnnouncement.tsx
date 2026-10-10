import React from 'react';
import { Heart } from 'lucide-react';

export const FarewellAnnouncement: React.FC = () => {
  return (
    <section
      id="home-farewell-announcement"
      aria-label="Announcement on discontinuation of VPlay television platform"
      className="fluent-reveal-item setting-card relative w-full rounded-[8px] sm:rounded-[10px] overflow-hidden bg-white dark:bg-[#2b2b2b] border border-[#e5e5e5] dark:border-[#383838] shadow-xs p-5 sm:p-7 md:p-8 select-text transition-colors duration-200"
    >
      <div className="relative z-10 max-w-4xl mx-auto space-y-5 sm:space-y-6">
        {/* Header Tag */}
        <div className="flex items-center justify-between border-b border-[#e5e5e5] dark:border-[#383838] pb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] bg-[#d83b01]/10 text-[#d83b01] dark:bg-[#d83b01]/20 dark:text-[#ff8c00] text-xs font-semibold uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>ACKNOWLEDGEMENT & FAREWELL</span>
          </div>
        </div>

        {/* Main Title */}
        <div className="space-y-1.5">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-[#111827] dark:text-white uppercase leading-snug">
            NOTICE OF DISCONTINUATION: VPLAY TELEVISION PLATFORM
          </h2>
        </div>

        {/* Announcement Body Content */}
        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[#374151] dark:text-[#D1D5DB] font-normal">
          <p>
            After a dedicated journey alongside our audience, VPlay officially concludes its production and development as of <strong className="font-bold text-[#111827] dark:text-white">October 2, 2026</strong>, wrapping up its run from <strong className="font-bold text-[#111827] dark:text-white">March 2026 – October 2, 2026</strong>.
          </p>

          <p>
            This was not an easy decision, but the time has come for VPlay to conclude its chapter.
          </p>

          <p>
            Throughout our operation, VPlay strived to deliver a unique television viewing platform with distinctive content and experiences. However, user engagement remained limited, and the project did not reach its initial milestones.
          </p>

          <p>
            Additionally, our founding and development team has transitioned to new endeavors and responsibilities. Rather than maintaining a project without sufficient time and dedicated focus, we have chosen to pause here.
          </p>

          <p>
            While VPlay may not have been a massive project, for those who built it, it remains an unforgettable chapter born from a passion for Vietnamese television culture.
          </p>

          <div className="farewell-quote p-4 sm:p-5 rounded-2xl bg-black/[0.04] dark:bg-white/5 border-l-4 border-[#E6005A] text-[#111827] dark:text-white font-medium leading-relaxed my-2">
            We extend our sincere gratitude to everyone who ever visited, streamed, supported, or shared feedback with VPlay throughout this journey. Every view and every word of support truly mattered to us.
          </div>
        </div>

        {/* Footer Sign-off */}
        <div className="pt-5 border-t border-black/10 dark:border-white/10 flex flex-col items-start gap-2.5">
          <div className="font-square text-lg sm:text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#FF2020] via-[#FF3366] to-[#E6005A]">
            VPlay - End of an era.
          </div>
          <p className="farewell-footer-note text-xs text-[#6B7280] dark:text-[#9CA3AF] italic leading-relaxed">
            (In the future, this domain may be repurposed or revived under new stewardship. Who knows?)
          </p>
        </div>
      </div>
    </section>
  );
};
