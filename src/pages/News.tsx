import React, { useState } from 'react';
import { NEWS_DATA } from '../data/news';
import { NewsCard } from '../components/NewsCard';
import { TrendingUp, Lock, RefreshCw, CheckCircle2, Sparkles } from 'lucide-react';
import { DEFAULT_BANNER_PLACEHOLDER } from '../data/heroSlides';
import { SequentialSection } from '../components/SequentialSection';
import { useSettings } from '../hooks/useSettings';
import { motion } from 'motion/react';

const feedSlideUp = {
  hidden: { opacity: 0, y: 22 },
  visible: (index: number) => ({ opacity: 1, y: 0, transition: { duration: 0.42, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] } }),
};

interface NewsProps {
  navigate: (route: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onOpenUpdate?: () => void;
}

export const News: React.FC<NewsProps> = ({ navigate, searchQuery, onSearchChange, onOpenUpdate }) => {
  const { settings } = useSettings();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const distinctCats = Array.from(new Set(NEWS_DATA.map((a) => a.category)));
  const categories = ['All', ...distinctCats];

  const query = (searchQuery || '').trim().toLowerCase();
  const filteredNews = NEWS_DATA.filter((article) => {
    const matchesCat = selectedCategory === 'All' || article.category === selectedCategory;
    const matchesSearch = !query ||
      article.title.toLowerCase().includes(query) ||
      article.excerpt.toLowerCase().includes(query) ||
      article.category.toLowerCase().includes(query);
    return matchesCat && matchesSearch;
  });

  const featured = NEWS_DATA[0];

  return (
    <motion.div initial="hidden" animate="visible" className="space-y-6 sm:space-y-8 pb-16">
      {/* Header */}
      <motion.div variants={feedSlideUp} custom={0} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/10 dark:border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white tracking-tight">
            Feed
          </h1>
          <p className="text-xs sm:text-sm text-black dark:text-[#9CA3AF] mt-1.5 leading-relaxed max-w-4xl">
            Release notes, system updates, changelogs, broadcasting technology, and media culture.
          </p>
        </div>

        {onOpenUpdate && (
          <button
            type="button"
            onClick={onOpenUpdate}
            className="fluent-btn-primary px-4 h-8.5 rounded-[6px] bg-[#0078d4] dark:bg-[#4cc2ff] hover:bg-[#106ebe] dark:hover:bg-[#6bd0ff] active:bg-[#005a9e] dark:active:bg-[#3bb2ef] text-white dark:text-black font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5 stroke-[2]" />
            <span>Check for updates</span>
          </button>
        )}
      </motion.div>

      {/* Merged System Update Status Banner */}
      <motion.div variants={feedSlideUp} custom={1} className="p-4 sm:p-5 rounded-[12px] bg-white dark:bg-[#282c31] border border-black/10 dark:border-white/10 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-semibold text-black dark:text-white">
                Sparkle 26.11 (Build 261019)
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#4cc2ff]/20 text-[#0078d4] dark:text-[#4cc2ff]">
                Latest
              </span>
            </div>
            <p className="text-xs text-black/70 dark:text-[#AAAAAA] mt-0.5">
              Microsoft Fluent Design • Dynamic Sidebar Icons • Collapsible Folder Tree
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const updateArt = NEWS_DATA.find((a) => a.id === 'news-sparkle-update-26-11');
            if (updateArt) navigate(`/news/${updateArt.slug}`);
          }}
          className="px-3.5 h-8 rounded-[6px] bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-xs font-medium text-black dark:text-white transition-colors cursor-pointer shrink-0"
        >
          View changelog
        </button>
      </motion.div>

      {/* Featured Compact Article Header Card */}
      {featured && selectedCategory === 'All' && (
        <motion.div
          variants={feedSlideUp}
          custom={2}
          id="featured-news-card"
          onClick={() => navigate(`/news/${featured.slug}`)}
          className="news-card-featured relative rounded-[24px] sm:rounded-[28px] overflow-hidden bg-white dark:bg-[#38383d] border-none hover:shadow-xl cursor-pointer group shadow-md transition-all"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[200px] md:min-h-[220px]">
            {/* Image */}
            <div className="md:col-span-6 lg:col-span-5 relative h-48 md:h-full overflow-hidden">
              <img
                src={featured.coverImage || DEFAULT_BANNER_PLACEHOLDER}
                alt={featured.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== DEFAULT_BANNER_PLACEHOLDER) {
                    target.src = DEFAULT_BANNER_PLACEHOLDER;
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent via-black/20 to-black/60 md:to-[#38383d] hidden dark:block" />
              
              <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF2020] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                  <TrendingUp className="w-3 h-3" />
                  <span>Featured</span>
                </div>
                {featured.isLocked && (
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                    <Lock className="w-3 h-3" />
                    <span>Password Protected</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="md:col-span-6 lg:col-span-7 p-5 sm:p-6 md:p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#E50914]">
                    {featured.category}
                  </span>
                  <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-medium">
                    {featured.publishedAt}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-black dark:text-white mt-2 group-hover:text-[#E50914] transition-colors leading-snug">
                  {featured.title}
                </h2>
                <p className="text-xs sm:text-sm text-black dark:text-[#9CA3AF] mt-2 leading-relaxed line-clamp-2">
                  {featured.excerpt}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-[#E5E7EB] dark:border-[#2A2A30] flex items-center justify-between text-xs">
                <span className="text-[#6B7280] dark:text-[#8E8E93]">
                  {featured.subtitle}
                </span>
                <span className="text-[#E50914] font-bold shrink-0 ml-2">
                  Read Article →
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Category Pills */}
      <motion.div variants={feedSlideUp} custom={3} id="news-category-tabs" className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat, idx) => (
          <button
            key={cat}
            id={`news-cat-btn-${idx}`}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer select-none ${
              selectedCategory === cat
                ? 'bg-[#E50914] text-white shadow-sm'
                : 'bg-[#F1F3F5] hover:bg-[#E5E7EB] text-[#4B5563] hover:text-[#111827] dark:bg-[#27121d] dark:hover:bg-[#331726] dark:text-[#A1A1AA] dark:hover:text-white border border-[#E5E7EB] dark:border-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Articles Grid */}
      {filteredNews.length === 0 ? (
        <div className="py-16 text-center space-y-3 rounded-2xl bg-[#38383d]/60 border border-white/10 p-6">
          <p className="text-sm font-medium text-[#9CA3AF]">
            No news articles found matching "{query}"
          </p>
          {onSearchChange && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#4cc2ff] text-white dark:text-black hover:bg-[#6bd0ff] transition-colors cursor-pointer"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : filteredNews.length <= 6 || !settings.loadPagesSequentially ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((article, idx) => (
              <motion.div key={article.id} variants={feedSlideUp} custom={4 + idx}>
              <NewsCard
                key={article.id}
              article={article}
              onClick={(a) => navigate(`/news/${a.slug}`)}
              />
              </motion.div>
            ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Initial batch (First 6 articles) */}
          <SequentialSection order={0} enabled={settings.loadPagesSequentially}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNews.slice(0, 6).map((article) => (
                <NewsCard
                  key={article.id}
                  article={article}
                  onClick={(a) => navigate(`/news/${a.slug}`)}
                />
              ))}
            </div>
          </SequentialSection>

          {/* Subsequent articles */}
          <SequentialSection order={1} enabled={settings.loadPagesSequentially}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNews.slice(6).map((article) => (
                <NewsCard
                  key={article.id}
                  article={article}
                  onClick={(a) => navigate(`/news/${a.slug}`)}
                />
              ))}
            </div>
          </SequentialSection>
        </div>
      )}
    </motion.div>
  );
};
