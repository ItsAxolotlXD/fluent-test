import React from 'react';
import { Heart } from 'lucide-react';

export const FarewellAnnouncement: React.FC = () => {
  return (
    <section
      id="home-farewell-announcement"
      aria-label="Announcement: The next chapter is coming - V-One"
      className="fluent-reveal-item setting-card relative w-full rounded-[8px] sm:rounded-[10px] overflow-hidden bg-white dark:bg-[#2b2b2b] border border-[#e5e5e5] dark:border-[#383838] shadow-xs p-5 sm:p-7 md:p-8 select-text transition-colors duration-200"
    >
      <div className="relative z-10 max-w-4xl mx-auto space-y-5 sm:space-y-6">
        {/* Header Tag */}
        <div className="flex items-center justify-between border-b border-[#e5e5e5] dark:border-[#383838] pb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] bg-[#4cc2ff]/10 text-[#0078d4] dark:bg-[#4cc2ff]/20 dark:text-[#4cc2ff] text-xs font-semibold uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>ANNOUNCEMENT • V-ONE</span>
          </div>
        </div>

        {/* Main Title */}
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-[#111827] dark:text-white leading-snug">
            The next chapter is coming...
          </h2>
        </div>

        {/* Announcement Body Content */}
        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[#374151] dark:text-[#D1D5DB] font-normal">
          <p className="text-base sm:text-[17px] font-medium text-[#111827] dark:text-white">
            Kế thừa sự thành công của Vplay, dự án mới V-One chính thức được hình thành.
          </p>

          <p>
            Định hướng tương lai của V-One vẫn đang là một "ẩn số" thú vị - liệu sẽ tiếp tục bứt phá ở mảng Truyền hình hay mở ra một lối đi hoàn toàn mới? Chưa ai đoán trước được điều gì cả.
          </p>

          <div className="farewell-quote p-4 sm:p-5 rounded-xl bg-black/[0.04] dark:bg-white/5 border-l-4 border-[#4cc2ff] text-[#111827] dark:text-white font-medium leading-relaxed my-3">
            <span className="font-bold text-[#0078d4] dark:text-[#4cc2ff]">NOTE:</span> V-One là dự án phát triển độc lập, không liên quan đến Vplay tiền nhiệm cũng như các dự án sắp tới của VNRT.
          </div>
        </div>

        {/* Footer Sign-off */}
        <div className="pt-5 border-t border-black/10 dark:border-white/10 flex flex-col items-start gap-2.5">
          <div className="font-square text-lg sm:text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#0078d4] via-[#4cc2ff] to-[#60cdff]">
            V-One - A New Era Begins.
          </div>
          <p className="farewell-footer-note text-xs text-[#6B7280] dark:text-[#9CA3AF] italic leading-relaxed">
            (Đón chờ những bất ngờ và đổi mới tiếp theo từ hành trình phát triển của V-One.)
          </p>
        </div>
      </div>
    </section>
  );
};
