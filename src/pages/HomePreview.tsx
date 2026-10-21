import React, { useMemo, useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { HeroCarousel } from '../components/HeroCarousel';
import { Channel } from '../types';
import { useIsMobile } from '../hooks/useIsMobile';
import { useNotes } from '../context/NotesContext';

interface HomePreviewProps {
  channels: Channel[];
  onSelectChannel: (channel: Channel) => void;
  navigate: (route: string, state?: any) => void;
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

const NOTEPAD_ICON_URL =
  'https://upload.wikimedia.org/wikipedia/commons/c/c9/Windows_Notepad_icon.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original';

const AUDIO_ICON_URL =
  'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/2a6d0f51-0cb3-4260-beb2-04239bc8845d/deqmc77-33847091-bb12-4bf3-9621-98ea50575f22.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi8yYTZkMGY1MS0wY2IzLTQyNjAtYmViMi0wNDIzOWJjODg0NWQvZGVxbWM3Ny0zMzg0NzA5MS1iYjEyLTRiZjMtOTYyMS05OGVhNTA1NzVmMjIucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.sJexrRdxkJgqB0XbzOaAoLy31sx5fFLNB_eD3tB3opM';

export const HomePreview: React.FC<HomePreviewProps> = ({ channels, onSelectChannel, navigate }) => {
  const isMobile = useIsMobile();
  const { notes, setActiveNoteId } = useNotes();
  const [selectedRecommendationId, setSelectedRecommendationId] = useState<string | null>(null);
  const [selectedQuickAccessId, setSelectedQuickAccessId] = useState<string | null>(null);

  const vtvChannels = useMemo(
    () => channels
      .filter((channel) => /^VTV\s*\d+(?:\s+HD)?$/i.test(channel.name.trim()))
      .sort((a, b) => Number(a.name.match(/\d+/)?.[0] ?? 0) - Number(b.name.match(/\d+/)?.[0] ?? 0)),
    [channels]
  );

  const [recommendationTilt, setRecommendationTilt] = useState<Record<string, { x: number; y: number }>>({});
  const recommendationsRef = useRef<HTMLDivElement>(null);
  const quickAccessRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (recommendationsRef.current && !recommendationsRef.current.contains(e.target as Node)) {
        setSelectedRecommendationId(null);
      }
      if (quickAccessRef.current && !quickAccessRef.current.contains(e.target as Node)) {
        setSelectedQuickAccessId(null);
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, []);

  const scrollRecommendations = (direction: 'previous' | 'next') => {
    recommendationsRef.current?.scrollBy({ left: direction === 'next' ? 300 : -300, behavior: 'smooth' });
  };

  const scrollQuickAccess = (direction: 'previous' | 'next') => {
    quickAccessRef.current?.scrollBy({ left: direction === 'next' ? 300 : -300, behavior: 'smooth' });
  };

  // Randomized recommendations on web refresh / mount
  const recommendations = useMemo(() => {
    // 1. User notes mapped into recommended items with Notepad icon
    const noteItems = (notes || []).map((note) => {
      const dateStr = note.updatedAt || note.createdAt
        ? new Date(note.updatedAt || note.createdAt).toLocaleDateString('vi-VN', { month: 'numeric', day: 'numeric' })
        : 'Gần đây';
      return {
        id: `note-${note.id}`,
        type: 'note' as const,
        title: note.title || 'Ghi chú',
        detail: `Tệp ghi chú · Cập nhật ${dateStr}`,
        image: NOTEPAD_ICON_URL,
        route: '/notes',
        noteId: note.id,
      };
    });

    // 2. Channel candidates (tab Watch) with reduced logo size
    const channelItems = [...channels].map((channel) => ({
      id: `channel-${channel.id}`,
      type: channel.category === 'Kênh phát thanh' ? ('audio' as const) : ('channel' as const),
      title: channel.name,
      detail: `${channel.category === 'Kênh phát thanh' ? 'Tệp phát thanh' : 'Kênh truyền hình'} · ${channel.quality || 'HD'}`,
      image: channel.category === 'Kênh phát thanh' ? AUDIO_ICON_URL : (channel.logo || channel.bannerImage),
      route: `/live-tv?channel=${channel.slug}`,
      channel,
    }));

    // 3. Featured static exploration items
    const featuredItems = [
      {
        id: 'radio-room',
        type: 'audio' as const,
        title: 'Phòng nghe Radio & Audio',
        detail: 'Tệp âm thanh · VOV & Trực tuyến',
        image: AUDIO_ICON_URL,
        route: '/live-tv',
      },
      {
        id: 'gallery-broadcast',
        type: 'media' as const,
        title: 'Kho tư liệu truyền hình',
        detail: 'Bộ sưu tập · Thư viện phát sóng',
        image: '/banners/thoi_su_19h_hd.webp',
        route: '/gallery',
      },
      {
        id: 'gallery-vietnam-today',
        type: 'media' as const,
        title: 'Việt Nam Hôm Nay',
        detail: 'Tin tức & Hình ảnh đặc sắc',
        image: '/banners/vietnam_today.jpg',
        route: '/gallery',
      },
      {
        id: 'sparkle-project-notes',
        type: 'note' as const,
        title: 'Tài liệu kiến trúc Sparkle',
        detail: 'Tệp ghi chú · Bản thảo hệ thống',
        image: NOTEPAD_ICON_URL,
        route: '/notes',
      },
    ];

    // Shuffle and pick a fresh random subset on each page load
    const shuffledNotes = [...noteItems].sort(() => Math.random() - 0.5);
    const shuffledChannels = [...channelItems].sort(() => Math.random() - 0.5);
    const shuffledFeatured = [...featuredItems].sort(() => Math.random() - 0.5);

    const pickedNotes = shuffledNotes.slice(0, Math.min(2, shuffledNotes.length));
    const pickedChannels = shuffledChannels.slice(0, 3);
    const pickedFeatured = shuffledFeatured.slice(0, 2);

    const pool = [...pickedNotes, ...pickedChannels, ...pickedFeatured];
    // Final random shuffle of the entire recommended cards list
    return pool.sort(() => Math.random() - 0.5);
  }, [channels, notes]);

  const openChannel = (channel: Channel) => {
    onSelectChannel(channel);
    navigate(`/live-tv?channel=${channel.slug}`);
  };

  const handleOpenItem = (item: (typeof recommendations)[number]) => {
    if (item.noteId) {
      setActiveNoteId(item.noteId);
      navigate(item.route);
    } else if (item.channel) {
      openChannel(item.channel);
    } else {
      navigate(item.route);
    }
  };

  let elementIndex = 0;

  return (
    <div className="home-preview-page mx-auto flex w-full max-w-7xl flex-col gap-5 px-1 py-2 selection:bg-[#ff01ff] selection:text-black dark:selection:bg-[#ff82ff] sm:gap-6 sm:py-4">
      {/* 1. Hero Carousel */}
      <motion.div {...slideUpProps(elementIndex++)}>
        <HeroCarousel channels={channels} onSelectChannel={onSelectChannel} navigate={navigate} flipActiveSlide />
      </motion.div>

      {/* 2. Recommendations Section */}
      <section aria-labelledby="recommendations-title" className="px-4 text-black dark:text-[#e7e7e7] sm:px-6">
        <motion.div {...slideUpProps(elementIndex++)} className="flex h-9 items-center justify-between border-b border-black/10 px-1 dark:border-white/10">
          <div className="flex items-center gap-2 text-[13px] font-medium">
            <ChevronDown className="size-3.5 text-black/60 dark:text-[#bdbdbd]" aria-hidden="true" />
            <h2 id="recommendations-title">Recommended</h2>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => scrollRecommendations('previous')} className="rounded-full p-1 text-black transition-colors hover:bg-black/10 hover:text-black dark:text-white/35 dark:hover:bg-white/10 dark:hover:text-white" aria-label="Previous recommendations">
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => scrollRecommendations('next')} className="rounded-full p-1 text-black transition-colors hover:bg-black/10 hover:text-black dark:text-white/55 dark:hover:bg-white/10 dark:hover:text-white" aria-label="Next recommendations">
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </motion.div>

        <div ref={recommendationsRef} className="flex snap-x gap-3 overflow-x-auto pt-3 pb-1 [perspective:900px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {recommendations.map((item, recIdx) => {
            const currentItemIdx = elementIndex++;
            const isSelected = selectedRecommendationId === item.id;
            return (
              <motion.button
                key={item.id}
                id={`recommended-card-${item.id}`}
                data-recommended-card="true"
                data-selected={isSelected ? 'true' : 'false'}
                aria-selected={isSelected}
                {...slideUpProps(currentItemIdx)}
                type="button"
                onClick={(e) => {
                  if (!isMobile) {
                    e.stopPropagation();
                    setSelectedRecommendationId(item.id);
                    setSelectedQuickAccessId(null);
                  } else {
                    handleOpenItem(item);
                  }
                }}
                onDoubleClick={(e) => {
                  if (!isMobile) {
                    e.stopPropagation();
                    handleOpenItem(item);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleOpenItem(item);
                  } else if (e.key === ' ') {
                    e.preventDefault();
                    if (!isMobile) {
                      setSelectedRecommendationId(item.id);
                    } else {
                      handleOpenItem(item);
                    }
                  }
                }}
                onMouseMove={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  setRecommendationTilt((items) => ({
                    ...items,
                    [item.id]: {
                      x: ((event.clientY - rect.top) / rect.height - 0.5) * -26,
                      y: ((event.clientX - rect.left) / rect.width - 0.5) * 28,
                    },
                  }));
                }}
                onMouseLeave={() => setRecommendationTilt((items) => ({ ...items, [item.id]: { x: 0, y: 0 } }))}
                style={{
                  transform: `rotateX(${recommendationTilt[item.id]?.x ?? 0}deg) rotateY(${recommendationTilt[item.id]?.y ?? 0}deg)`,
                  transition: 'transform 180ms ease-out, box-shadow 180ms ease-out',
                  transformStyle: 'preserve-3d',
                  position: 'relative',
                  zIndex: isSelected ? 30 : (recommendationTilt[item.id]?.x || recommendationTilt[item.id]?.y ? 20 : 1),
                }}
                className={`group w-[calc((100vw-2.75rem)/2)] min-w-[178px] shrink-0 snap-start overflow-hidden rounded-2xl sm:w-[220px] lg:w-[calc((100%_-_2.25rem)/5)] text-left shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d91a9c] dark:focus-visible:ring-[#ff82ff] bg-white dark:bg-[#2c3037] hover:bg-black/[0.02] dark:hover:bg-[#363b43] ${
                  isSelected
                    ? 'is-selected border-[3px] border-[#d91a9c] dark:border-[#ff82ff]'
                    : 'border-[3px] border-black/[0.08] dark:border-white/[0.08]'
                }`}
                title={!isMobile ? `${item.title} — Nhấp để chọn, nhấp đúp để mở` : item.title}
              >
                <div className="relative flex h-[92px] items-center justify-center overflow-hidden bg-black/[0.03] dark:bg-black/30 p-3">
                  {item.type === 'note' ? (
                    <img
                      src={NOTEPAD_ICON_URL}
                      alt="Notepad"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      className="size-12 object-contain drop-shadow transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : item.type === 'audio' ? (
                    <img
                      src={AUDIO_ICON_URL}
                      alt="Audio"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      className="size-12 object-contain drop-shadow transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : item.type === 'channel' || item.channel ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      className="max-h-10 max-w-[55%] w-auto object-contain filter drop-shadow-sm transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <img
                      src={item.image}
                      alt=""
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  )}
                </div>
                <div className="flex min-h-[62px] flex-col gap-0.5 px-2.5 py-2">
                  <span className="truncate text-[12px] font-medium text-black dark:text-[#f1f1f1]">{item.title}</span>
                  <span className="truncate text-[11px] text-black/50 dark:text-[#a9a9ae]">{item.detail}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* 3. Welcome Header */}
      <motion.header {...slideUpProps(elementIndex++)} className="!bg-transparent flex flex-col gap-2 px-4 sm:px-6">
        <h1 className="text-xl font-semibold tracking-tight text-black dark:text-white sm:text-2xl">
          Welcome to the new experience!
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-[#5b5b5b] dark:text-[#b8b8be]">
          This will be the future of a new rejuvenated Home page in Sparkle. We gave your an opportunity to try it out early, although it is stil buggy, unfinished product and not looking fantastic.
        </p>
      </motion.header>

      {/* 4. Quick Access / VTV Channels Section (Horizontal Tiles) */}
      <section aria-label="Quick access" className="px-4 text-black dark:text-[#e7e7e7] sm:px-6">
        <motion.div {...slideUpProps(elementIndex++)} className="flex h-9 items-center justify-between border-b border-black/10 px-1 text-[13px] font-medium text-black dark:border-white/10 dark:text-[#ededed]">
          <div className="flex items-center gap-2">
            <ChevronDown className="size-3.5 text-black/60 dark:text-[#bdbdbd]" aria-hidden="true" />
            <span>Quick access</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scrollQuickAccess('previous')}
              className="rounded-full p-1 text-black transition-colors hover:bg-black/10 hover:text-black dark:text-white/35 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Previous quick access"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollQuickAccess('next')}
              className="rounded-full p-1 text-black transition-colors hover:bg-black/10 hover:text-black dark:text-white/55 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Next quick access"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </motion.div>

        <div
          ref={quickAccessRef}
          className="flex snap-x gap-3 overflow-x-auto pt-3 pb-2 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {vtvChannels.map((channel) => {
            const channelLabel = channel.name.replace(/\s+HD$/i, '').trim();
            const currentChIdx = elementIndex++;
            const isSelected = selectedQuickAccessId === channel.id;

            return (
              <motion.button
                key={channel.id}
                id={`quick-access-card-${channel.id}`}
                data-quick-access-card="true"
                data-selected={isSelected ? 'true' : 'false'}
                aria-selected={isSelected}
                {...slideUpProps(currentChIdx)}
                type="button"
                onClick={(e) => {
                  if (!isMobile) {
                    e.stopPropagation();
                    setSelectedQuickAccessId(channel.id);
                    setSelectedRecommendationId(null);
                  } else {
                    openChannel(channel);
                  }
                }}
                onDoubleClick={(e) => {
                  if (!isMobile) {
                    e.stopPropagation();
                    openChannel(channel);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    openChannel(channel);
                  } else if (e.key === ' ') {
                    e.preventDefault();
                    if (!isMobile) {
                      setSelectedQuickAccessId(channel.id);
                      setSelectedRecommendationId(null);
                    } else {
                      openChannel(channel);
                    }
                  }
                }}
                aria-label={`Watch ${channelLabel}`}
                className={`group flex size-[88px] sm:size-[100px] shrink-0 snap-start items-center justify-center rounded-2xl shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d91a9c] dark:focus-visible:ring-[#ff82ff] bg-white dark:bg-[#2c3037] hover:bg-black/[0.02] dark:hover:bg-[#363b43] ${
                  isSelected
                    ? 'is-selected border-[3px] border-[#d91a9c] dark:border-[#ff82ff]'
                    : 'border-[3px] border-black/[0.08] dark:border-white/[0.08]'
                }`}
              >
                <div className="flex size-full items-center justify-center p-3 sm:p-3.5 select-none">
                  <img
                    src={channel.logo}
                    alt={channelLabel}
                    loading="lazy"
                    decoding="async"
                    className="max-h-full max-w-full object-contain filter drop-shadow-xs transition-transform duration-200 group-hover:scale-110"
                  />
                </div>
              </motion.button>
            );
          })}

          {vtvChannels.length === 0 && (
            <p className="px-2 py-4 text-sm text-black/60 dark:text-[#bdbdbd]">No VTV channels are available yet.</p>
          )}
        </div>
      </section>
    </div>
  );
};
