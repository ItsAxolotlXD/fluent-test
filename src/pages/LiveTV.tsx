import React, { useState, useMemo } from 'react';
import { VideoPlayer } from '../components/VideoPlayer';
import { CategoryIcon } from '../components/CategoryIcon';
import { Channel } from '../types';
import { Tv, Calendar, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SequentialSection } from '../components/SequentialSection';
import { useSettings } from '../hooks/useSettings';
import { EpgScheduleWidget } from '../components/EpgScheduleWidget';

interface LiveTVProps {
  currentChannel: Channel;
  onSelectChannel: (channel: Channel) => void;
  channels: Channel[];
  onOpenCustomStreamModal: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  navigate?: (route: string) => void;
}

export const LiveTV: React.FC<LiveTVProps> = ({
  currentChannel,
  onSelectChannel,
  channels,
  onOpenCustomStreamModal,
  searchQuery,
  onSearchChange,
  navigate = () => {}
}) => {
  const { settings } = useSettings();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isEpgSidebarOpen, setIsEpgSidebarOpen] = useState(false);

  // Distinct category list maintaining natural broadcast order
  const distinctCategories = useMemo(() => {
    return Array.from(new Set(channels.map((c) => c.category)));
  }, [channels]);

  const categoryTabs = useMemo(() => {
    return ['All', ...distinctCategories];
  }, [distinctCategories]);

  // Filter channels by tab & search query with memoization
  const query = (searchQuery || '').trim().toLowerCase();
  const filteredChannels = useMemo(() => {
    return channels.filter((c) => {
      const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
      const matchesSearch = !query ||
        c.name.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query) ||
        (c.channelNumber && String(c.channelNumber).includes(query)) ||
        (c.tags && c.tags.some((t) => t.toLowerCase().includes(query)));
      return matchesCat && matchesSearch;
    });
  }, [channels, selectedCategory, query]);

  // Group channels by category when viewing "Tất cả" (or show single category if filtered)
  const groupedCategories = useMemo(() => {
    return distinctCategories
      .map((category) => ({
        category,
        channels: filteredChannels.filter((c) => c.category === category)
      }))
      .filter((group) => group.channels.length > 0);
  }, [distinctCategories, filteredChannels]);

  return (
    <div className="space-y-4 sm:space-y-8 pb-16">
      {/* Top Banner / Channel Title */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-black dark:text-white tracking-tight flex items-center gap-2">
            <span>{`${String(currentChannel.channelNumber || 1).padStart(3, '0')} | ${currentChannel.name}`}</span>
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-black dark:text-[#9CA3AF] mt-0.5 font-medium flex items-center gap-2">
          <span>{currentChannel.category}</span>
        </p>
      </div>

      {/* Video Player Section (Clean full width without adjacent EPG panel) */}
      <div className="w-full">
        <VideoPlayer
          channel={currentChannel}
          onOpenCustomStreamModal={onOpenCustomStreamModal}
          isTheaterMode={isTheaterMode}
          onToggleTheaterMode={() => setIsTheaterMode(!isTheaterMode)}
        />
      </div>


      {/* Channel List Section */}
      <div className="space-y-6 pt-2">
        {/* Section Header & Filters */}
        <div className="flex flex-col gap-3 sm:gap-3.5">
          <div className="flex items-center gap-2.5">
            <CategoryIcon className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold font-square text-black dark:text-white">
              Channels
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F1F3F5] dark:bg-[#26262C] text-black dark:text-[#9CA3AF] border border-[#E5E7EB] dark:border-[#383842]">
              {filteredChannels.length} channels
            </span>
          </div>

          {/* Category Tabs Filter */}
          <div id="livetv-category-tabs" className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {/* All button */}
            <button
              id="livetv-cat-btn-all"
              type="button"
              onClick={() => setSelectedCategory('All')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer select-none ${
                selectedCategory === 'All'
                  ? 'bg-[#E50914] text-white shadow-sm'
                  : 'bg-[#F1F3F5] hover:bg-[#E5E7EB] text-[#4B5563] hover:text-[#111827] dark:bg-[#27121d] dark:hover:bg-[#331726] dark:text-[#A1A1AA] dark:hover:text-white border border-[#E5E7EB] dark:border-white/10'
              }`}
            >
              All
            </button>

            {/* Colored button with calendar icon placed right next to All button to open right sidebar */}
            <button
              id="btn-livetv-open-epg-sidebar"
              type="button"
              onClick={() => setIsEpgSidebarOpen(true)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer select-none flex items-center gap-1.5 shrink-0 bg-gradient-to-r from-[#0078d4] via-[#0284c7] to-[#4cc2ff] hover:from-[#006cbd] hover:to-[#38bdf8] active:scale-95 text-white shadow-sm hover:shadow border border-white/25"
              title="Xem lịch phát sóng các kênh (EPG)"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Lịch phát sóng</span>
            </button>

            {/* Remaining Category Tabs */}
            {categoryTabs.filter((cat) => cat !== 'All').map((cat, idx) => (
              <button
                key={cat}
                id={`livetv-cat-btn-${idx + 1}`}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer select-none ${
                  selectedCategory === cat
                    ? 'bg-[#E50914] text-white shadow-sm'
                    : 'bg-[#F1F3F5] hover:bg-[#E5E7EB] text-[#4B5563] hover:text-[#111827] dark:bg-[#27121d] dark:hover:bg-[#331726] dark:text-[#A1A1AA] dark:hover:text-white border border-[#E5E7EB] dark:border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>


        {/* Channel Categories & Grids */}
        {filteredChannels.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#38383d] border border-[#E5E7EB] dark:border-[#2D2D35]">
            <Tv className="w-10 h-10 mx-auto text-[#9CA3AF] mb-2" />
            <p className="text-sm font-semibold text-[#111827] dark:text-white">No channels found</p>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1">Please try searching with a different keyword or channel number</p>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedCategories.map((group, groupIdx) => (
              <SequentialSection
                key={group.category}
                order={groupIdx}
                enabled={settings.loadPagesSequentially}
              >
                <section className="space-y-3">
                  {/* Category Section Header & Divider */}
                  <div className="livetv-category-divider flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#2D2D35] pb-2">
                    <div className="flex items-center gap-2.5">
                      <CategoryIcon className="w-6 h-6 sm:w-6.5 sm:h-6.5 shrink-0" />
                      <h3 className="text-sm sm:text-base font-bold font-square text-[#111827] dark:text-white">
                        {group.category}
                      </h3>
                      <span className="text-[11px] font-semibold text-[#6B7280] dark:text-[#9CA3AF]">
                        ({group.channels.length})
                      </span>
                    </div>
                  </div>

                  {/* Channel Grid: Unified fixed width & height cards, 6 cols on desktop, 3 cols on mobile */}
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3.5">
                    {group.channels.map((ch) => {
                      const isSelected = ch.id === currentChannel.id;

                      return (
                        <div
                          key={ch.id}
                          id={`livetv-channel-card-${ch.id}`}
                          onClick={() => onSelectChannel(ch)}
                          className={`fluent-reveal-item channel-card group relative w-full aspect-[136/78] rounded-xl sm:rounded-2xl transition-none cursor-pointer overflow-hidden flex items-center justify-center p-1.5 sm:p-2.5 select-none bg-[#38383d] ${
                            isSelected ? 'is-selected' : ''
                          }`}
                          title={ch.name}
                        >
                          {/* Channel Logo Box without background (strictly only logo) */}
                          <div className="w-full h-full flex items-center justify-center p-1 relative">
                            <img
                              src={ch.logo}
                              alt={ch.name}
                              loading="lazy"
                              decoding="async"
                              referrerPolicy="no-referrer"
                              className={`${
                                ch.category === 'Kênh địa phương' || ch.category === 'Kênh phát thanh' || ch.category === 'Kênh HTV'
                                  ? 'max-h-[78%] max-w-[92%] scale-110'
                                  : ch.category === 'Kênh VTV'
                                    ? 'max-h-[56%] max-w-[80%]'
                                    : 'max-h-[58%] max-w-[82%]'
                              } w-auto h-auto object-contain filter drop-shadow-sm select-none pointer-events-none transition-transform`}
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </SequentialSection>
            ))}
          </div>
        )}

        {filteredChannels.length === 0 && (
          <div className="py-16 text-center space-y-3 rounded-2xl bg-[#38383d]/60 border border-white/10 p-6">
            <p className="text-sm font-medium text-[#9CA3AF]">
              No television channels found matching "{query}"
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
        )}
      </div>

      {/* Right Sidebar Drawer for EPG Broadcast Schedule */}
      <AnimatePresence>

        {isEpgSidebarOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setIsEpgSidebarOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            />

            {/* Right Sidebar Drawer Panel with slide animation */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 260 }}
              className="absolute top-0 right-0 h-full w-full sm:w-[460px] md:w-[480px] max-w-[95vw] bg-[#1a1d22] text-white shadow-2xl border-l border-white/10 flex flex-col z-10 overflow-hidden"
            >
              <EpgScheduleWidget
                currentChannel={currentChannel}
                isSidebarMode={true}
                onClose={() => setIsEpgSidebarOpen(false)}
                className="h-full"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

