import React, { useState } from 'react';
import { motion } from 'motion/react';

const articleSlideUp = {
  hidden: { opacity: 0, y: 22 },
  visible: (index: number) => ({ opacity: 1, y: 0, transition: { duration: 0.42, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] } }),
};
import { NEWS_DATA } from '../data/news';
import { NewsArticle } from '../types';
import { 
  Calendar, 
  Lock, 
  Unlock, 
  ShieldAlert,
  Award,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X
} from 'lucide-react';

interface ArticleProps {
  slug: string;
  navigate: (route: string) => void;
  fontSize?: number;
}

export const Article: React.FC<ArticleProps> = ({ slug, navigate, fontSize = 16 }) => {
  const [inputPassword, setInputPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [unlockedArticles, setUnlockedArticles] = useState<Record<string, boolean>>(() => {
    try {
      const saved = sessionStorage.getItem('waves_unlocked_articles');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const article = NEWS_DATA.find((a) => a.slug === slug) || NEWS_DATA[0];

  const isLocked = article.isLocked && !unlockedArticles[article.slug];

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPassword.trim() === article.password) {
      const updated = { ...unlockedArticles, [article.slug]: true };
      setUnlockedArticles(updated);
      setPasswordError(false);
      try {
        sessionStorage.setItem('waves_unlocked_articles', JSON.stringify(updated));
      } catch {}
    } else {
      setPasswordError(true);
    }
  };

  return (
    <motion.article initial="hidden" animate="visible" className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-20">
      {/* When Locked: Hide the article header (titles, hero cover, actions) and only show password protection gate */}
      {isLocked ? (
        <div className="p-8 sm:p-12 rounded-[28px] bg-white dark:bg-[#1A1A1E] border border-amber-500/40 dark:border-amber-500/30 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white">
              Password-Protected Article
            </h2>
            <p className="text-xs sm:text-sm text-black dark:text-[#9CA3AF] leading-relaxed">
              This article is protected by a passcode. Please enter the correct passcode to unlock its content.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="max-w-sm mx-auto space-y-3">
            <div className="relative">
              <input
                type="password"
                value={inputPassword}
                onChange={(e) => {
                  setInputPassword(e.target.value);
                  setPasswordError(false);
                }}
                placeholder="Enter passcode..."
                className={`w-full h-8 sm:h-8.5 px-3 rounded-[6px] bg-black/5 dark:bg-[#282c31] border ${
                  passwordError 
                    ? 'border-red-500 focus:border-red-500 ring-2 ring-red-500/20' 
                    : 'border-black/10 dark:border-white/10 focus:border-b-2 focus:border-b-[#005fb8] dark:focus:border-b-[#4cc2ff]'
                } text-xs sm:text-[13px] text-[#111827] dark:text-white placeholder-[#71717a] dark:placeholder-white outline-none transition-all text-center no-fluent-line`}
              />
            </div>

            {passwordError && (
              <p className="text-xs text-red-500 font-semibold flex items-center justify-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Incorrect passcode. Please try again.</span>
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 px-6 rounded-full bg-[#E50914] text-white text-xs sm:text-sm font-bold shadow-md hover:bg-[#CC0812] hover:shadow-red-500/25 active:scale-[0.98] transition-all cursor-default flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock Article</span>
            </button>
          </form>
        </div>
      ) : (
        <>
          {/* Header metadata */}
          <motion.div variants={articleSlideUp} custom={0} className="flex items-center gap-1 text-xs text-black dark:text-[#8E8E93] font-medium">
              <Calendar className="w-3.5 h-3.5" />
              {article.publishedAt}

            <span className="text-xs text-black dark:text-[#8E8E93] flex items-center gap-1 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              {article.publishedAt}
            </span>
            {article.isLocked && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                <Unlock className="w-3.5 h-3.5" />
                <span>Unlocked</span>
              </span>
            )}
          </motion.div>

          {/* Main Title */}
          <motion.h1 variants={articleSlideUp} custom={1} className="text-2xl sm:text-3xl md:text-4xl font-bold text-black dark:text-white tracking-tight leading-tight">
            {article.title}
          </motion.h1>

          {/* Subtitle */}
          {article.subtitle && (
            <p className="text-base sm:text-lg md:text-xl font-bold text-[#E50914] dark:text-[#FF4D8B]">
              {article.subtitle}
            </p>
          )}

          {/* Hero Cover Image */}
          <motion.div variants={articleSlideUp} custom={2} 
            onClick={() => {
              setLightboxImage(article.coverImage);
              setLightboxZoom(1);
            }}
            className="group relative rounded-[24px] sm:rounded-[28px] overflow-hidden bg-black/5 dark:bg-[#38383d] border border-[#E5E7EB] dark:border-[#2D2D35] aspect-video sm:aspect-[21/9] shadow-md cursor-default"
            title="Click to view full size"
          >
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
            />
            <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-[4px] bg-black/75 text-white text-[11px] font-normal flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Full size preview</span>
            </div>
          </motion.div>

          {/* Full Article Body Content */}
          <motion.div variants={articleSlideUp} custom={3}
            style={{ fontSize: `${fontSize}px`, lineHeight: 1.75 }}
            className="p-5 md:p-8 rounded-[8px] bg-white dark:bg-[#38383d] border border-[#e5e5e5] dark:border-[#48484e] shadow-xs text-[#374151] dark:text-[#d1d5db] space-y-6"
          >
            {/* Excerpt Lead */}
            <p 
              style={{ fontSize: `${fontSize * 1.125}px` }}
              className="font-medium text-[#111827] dark:text-white leading-relaxed border-l-3 border-[#4cc2ff] pl-3 bg-black/5 dark:bg-white/5 py-2 rounded-r-[4px]"
            >
              {article.excerpt}
            </p>

            {/* Article Body Paragraphs */}
            <div className="space-y-5">
              {article.content.map((paragraph, idx) => {
                // Image element (no caption/description) - Displayed Full Size
                if (paragraph.startsWith('<image>')) {
                  const imgUrl = paragraph.replace('<image>', '').trim();
                  return (
                    <figure 
                      key={idx} 
                      className="my-6 rounded-[8px] overflow-hidden border border-[#e5e5e5] dark:border-[#383838] bg-neutral-100 dark:bg-[#38383d] shadow-xs group relative cursor-default"
                      onClick={() => {
                        setLightboxImage(imgUrl);
                        setLightboxZoom(1);
                      }}
                      title="Click to view full size image"
                    >
                      <img
                        src={imgUrl}
                        alt="Article full size image"
                        referrerPolicy="no-referrer"
                        className="w-full h-auto block object-contain mx-auto group-hover:opacity-95 transition-opacity"
                        loading="lazy"
                      />
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-[4px] bg-black/80 text-white text-xs font-normal flex items-center gap-1.5 shadow-sm opacity-80 group-hover:opacity-100 transition-opacity">
                        <ZoomIn className="w-3.5 h-3.5 text-[#4cc2ff]" />
                        <span>Full size</span>
                      </div>
                    </figure>
                  );
                }

                // Section headings (e.g. I. MỘT HÀNH TRÌNH..., II. NHỮNG CÁI TÊN...)
                const isRomanSection = /^[I|V|X]+\.\s/.test(paragraph);
                const isH1Heading = [
                  'A brand-new look',
                  'Project Orbit - Milestone 3 begins',
                  'Project Orbit - Milestone 2 completed',
                  'Small Touches',
                  'Bug Fixes',
                  'Wrapping Up'
                ].includes(paragraph);
                const isMajorHeading = [
                  'TƯỞNG NHƯ KHÔNG ĐỔI, NHƯNG ĐÃ ĐỔI THAY RẤT NHIỀU',
                  '“CHẮT LỌC VÀ KẾT NỐI GIÁ TRỊ”: TRIẾT LÝ DẪN DẮT CỦA MỘT "CURATOR" QUỐC GIA',
                  'BỘ DNA MỚI: SỰ GIAO THOA GIỮA “NHÀ HIỀN TRIẾT” VÀ “NGƯỜI BÌNH ĐẲNG”',
                  'BẢN LĨNH CỦA MỘT ĐỊNH CHẾ TRUYỀN THÔNG QUỐC GIA'
                ].includes(paragraph);

                if (isH1Heading) {
                  return (
                    <h1
                      key={idx}
                      className="text-lg sm:text-xl md:text-2xl font-semibold text-[#111827] dark:text-white pt-8 pb-3 border-b border-[#E5E7EB] dark:border-[#2D2D35] tracking-tight"
                    >
                      {paragraph}
                    </h1>
                  );
                }

                if (isRomanSection || isMajorHeading) {
                  return (
                    <h2 
                      key={idx}
                      className="text-lg sm:text-xl md:text-2xl font-bold text-[#111827] dark:text-white pt-8 pb-3 border-b border-[#E5E7EB] dark:border-[#2D2D35] flex items-center gap-3 tracking-tight"
                    >
                      <span className="w-2.5 h-6 bg-gradient-to-b from-[#E50914] to-[#B80710] rounded-full inline-block shrink-0 shadow-sm" />
                      <span>{paragraph}</span>
                    </h2>
                  );
                }

                // Quotes (e.g. "Waves - Nhịp sóng lưu dấu thời đại")
                if (paragraph.startsWith('"Waves -')) {
                  return (
                    <div 
                      key={idx}
                      className="my-6 p-6 rounded-2xl bg-[#E50914]/5 dark:bg-[#E50914]/10 border-l-4 border-[#E50914] text-center sm:text-left"
                    >
                      <p className="text-base sm:text-lg font-bold text-[#E50914] dark:text-[#FF4D8B] italic whitespace-pre-line">
                        {paragraph}
                      </p>
                    </div>
                  );
                }

                // Congratulations message highlight
                if (paragraph.startsWith('Chúc mừng hành trình mới')) {
                  return (
                    <div 
                      key={idx}
                      className="my-8 p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-[#E50914]/15 via-[#E50914]/5 to-transparent border-l-4 border-[#E50914] flex items-center gap-4 shadow-sm"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[#E50914]/20 flex items-center justify-center shrink-0">
                        <Award className="w-6 h-6 text-[#E50914] dark:text-[#FF4D8B]" />
                      </div>
                      <div>
                        <p className="text-lg sm:text-xl font-bold text-[#E50914] dark:text-[#FF4D8B]">
                          {paragraph}
                        </p>
                        <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
                          07.09.1970 - 07.09.2026 • 56th Anniversary of Vietnam Television
                        </p>
                      </div>
                    </div>
                  );
                }

                return (
                  <p key={idx} className="whitespace-pre-line leading-relaxed text-[#374151] dark:text-[#D1D5DB]">
                    {paragraph}
                  </p>
                );
              })}
            </div>

          </motion.div>
        </>
      )}
    </motion.article>
  );
};
