import React, { useState } from 'react';
import { motion } from 'motion/react';
import { NEWS_DATA } from '../data/news';
import { NewsCard } from '../components/NewsCard';
import { CategoryIcon } from '../components/CategoryIcon';
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

const slideUpProps = (index: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.38,
      delay: Math.min(index * 0.04, 0.8),
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
});

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
  const relatedArticles = NEWS_DATA.filter((a) => a.id !== article.id).slice(0, 2);

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

  let elementIndex = 0;

  return (
    <article id="article-page" className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-20 bg-transparent">
      {/* When Locked: Hide the article header and show passcode protection */}
      {isLocked ? (
        <motion.div 
          {...slideUpProps(elementIndex++)}
          className="p-8 sm:p-12 rounded-[28px] bg-transparent border border-amber-500/40 dark:border-amber-500/30 text-center space-y-6"
        >
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
        </motion.div>
      ) : (
        <>
          {/* 1. Header metadata */}
          <motion.div {...slideUpProps(elementIndex++)} className="flex items-center gap-3">
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

          {/* 2. Main Title */}
          <motion.h1 
            {...slideUpProps(elementIndex++)}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-black dark:text-white tracking-tight leading-tight"
          >
            {article.title.replace(/^#\s*/, '')}
          </motion.h1>

          {/* 3. Subtitle (if available) */}
          {article.subtitle && (
            <motion.p 
              {...slideUpProps(elementIndex++)}
              className="text-base sm:text-lg md:text-xl font-bold text-[#E50914] dark:text-[#FF4D8B]"
            >
              {article.subtitle}
            </motion.p>
          )}

          {/* 4. Hero Cover Image */}
          <motion.div 
            {...slideUpProps(elementIndex++)}
            onClick={() => {
              setLightboxImage(article.coverImage);
              setLightboxZoom(1);
            }}
            className="group relative rounded-[24px] sm:rounded-[28px] overflow-hidden bg-transparent border border-[#E5E7EB] dark:border-[#2D2D35] aspect-video sm:aspect-[21/9] shadow-md cursor-default"
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

          {/* 5. Full Article Body Content without separate card background - uses main tab page background */}
          <div 
            style={{ fontSize: `${fontSize}px`, lineHeight: 1.75 }}
            className="bg-transparent border-none shadow-none text-[#374151] dark:text-[#d1d5db] space-y-6 pt-2"
          >
            {/* Article Body Paragraphs with staggered entrance */}
            <div className="space-y-5">
              {article.content.map((paragraph, idx) => {
                const currentPIndex = elementIndex++;

                // Image element (no caption/description) - Displayed Full Size
                if (paragraph.startsWith('<image>')) {
                  const imgUrl = paragraph.replace('<image>', '').trim();
                  return (
                    <motion.figure 
                      key={idx} 
                      {...slideUpProps(currentPIndex)}
                      className="my-6 rounded-[8px] overflow-hidden border border-[#e5e5e5] dark:border-[#383838] bg-transparent shadow-xs group relative cursor-default"
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
                    </motion.figure>
                  );
                }

                // Blockquote (> ...)
                if (paragraph.startsWith('> ')) {
                  const quoteText = paragraph.replace(/^>\s*/, '');
                  return (
                    <motion.blockquote
                      key={idx}
                      {...slideUpProps(currentPIndex)}
                      className="my-5 p-4 sm:p-5 rounded-xl bg-black/5 dark:bg-white/[0.06] border-l-4 border-[#ff2df7] dark:border-[#d946ef] text-sm sm:text-base italic leading-relaxed text-[#1f2937] dark:text-[#E5E7EB]"
                    >
                      {quoteText}
                    </motion.blockquote>
                  );
                }

                // Section headings (e.g. # ..., ## ..., I. MỘT HÀNH TRÌNH..., II. NHỮNG CÁI TÊN...)
                const isMarkdownHeading = /^#+\s/.test(paragraph);
                const isRomanSection = /^[I|V|X]+\.\s/.test(paragraph);
                const isMajorHeading = [
                  'TƯỞNG NHƯ KHÔNG ĐỔI, NHƯNG ĐÃ ĐỔI THAY RẤT NHIỀU',
                  '“CHẮT LỌC VÀ KẾT NỐI GIÁ TRỊ”: TRIẾT LÝ DẪN DẮT CỦA MỘT "CURATOR" QUỐC GIA',
                  'BỘ DNA MỚI: SỰ GIAO THOA GIỮA “NHÀ HIỀN TRIẾT” VÀ “NGƯỜI BÌNH ĐẲNG”',
                  'BẢN LĨNH CỦA MỘT ĐỊNH CHẾ TRUYỀN THÔNG QUỐC GIA'
                ].includes(paragraph);

                if (isMarkdownHeading || isRomanSection || isMajorHeading) {
                  const headingText = paragraph.replace(/^#+\s*/, '');
                  return (
                    <motion.h2 
                      key={idx}
                      {...slideUpProps(currentPIndex)}
                      className="text-lg sm:text-xl md:text-2xl font-bold text-[#111827] dark:text-white pt-8 pb-3 border-b border-[#E5E7EB] dark:border-[#2D2D35] flex items-center gap-3 tracking-tight"
                    >
                      <CategoryIcon className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" />
                      <span>{headingText}</span>
                    </motion.h2>
                  );
                }

                // Quotes (e.g. "Waves - Nhịp sóng lưu dấu thời đại")
                if (paragraph.startsWith('"Waves -')) {
                  return (
                    <motion.div 
                      key={idx}
                      {...slideUpProps(currentPIndex)}
                      className="my-6 p-6 rounded-2xl bg-[#E50914]/5 dark:bg-[#E50914]/10 border-l-4 border-[#E50914] text-center sm:text-left"
                    >
                      <p className="text-base sm:text-lg font-bold text-[#E50914] dark:text-[#FF4D8B] italic whitespace-pre-line">
                        {paragraph}
                      </p>
                    </motion.div>
                  );
                }

                // Congratulations message highlight
                if (paragraph.startsWith('Chúc mừng hành trình mới')) {
                  return (
                    <motion.div 
                      key={idx}
                      {...slideUpProps(currentPIndex)}
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
                    </motion.div>
                  );
                }

                return (
                  <motion.p key={idx} {...slideUpProps(currentPIndex)} className="whitespace-pre-line leading-relaxed text-[#374151] dark:text-[#D1D5DB]">
                    {paragraph}
                  </motion.p>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* 6. Related News */}
      {relatedArticles.length > 0 && (
        <div className="space-y-4 pt-6">
          <motion.h3 {...slideUpProps(elementIndex++)} className="text-xl font-bold font-square text-[#111827] dark:text-white flex items-center gap-2.5">
            <CategoryIcon className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
            <span>Related Articles</span>
          </motion.h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedArticles.map((rel, relIdx) => (
              <motion.div key={rel.id} {...slideUpProps(elementIndex + relIdx)}>
                <NewsCard
                  article={rel}
                  onClick={(a) => navigate(`/news/${a.slug}`)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Full Size Image Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          {/* Top Control Bar */}
          <div 
            className="absolute top-4 right-4 flex items-center gap-2 bg-[#2c2c2c] border border-white/20 rounded-[6px] px-3 py-1.5 shadow-2xl z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxZoom((prev) => Math.min(3, prev + 0.25))}
              className="p-1 rounded-[4px] hover:bg-white/10 text-white transition-colors cursor-default"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold text-white/90 px-1">
              {Math.round(lightboxZoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setLightboxZoom((prev) => Math.max(0.5, prev - 0.25))}
              className="p-1.5 rounded-full hover:bg-white/15 text-white transition-colors cursor-default"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setLightboxZoom(1)}
              className="p-1.5 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-default"
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-white/20 mx-1" />
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="p-1.5 rounded-full hover:bg-red-500/80 text-white transition-colors cursor-default"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Image Container */}
          <div 
            className="max-w-[95vw] max-h-[88vh] overflow-auto flex items-center justify-center p-2 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImage}
              alt="Full size view"
              referrerPolicy="no-referrer"
              style={{ transform: `scale(${lightboxZoom})`, transformOrigin: 'center center' }}
              className="max-w-full max-h-[85vh] object-contain transition-transform duration-200 shadow-2xl rounded-xl"
            />
          </div>
        </div>
      )}
    </article>
  );
};
