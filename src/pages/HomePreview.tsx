import React, { useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ExternalLink, FileText, Image as ImageIcon, Music2, Radio, Sparkles } from 'lucide-react';
import { HeroCarousel } from '../components/HeroCarousel';
import { Channel } from '../types';

interface HomePreviewProps {
  channels: Channel[];
  onSelectChannel: (channel: Channel) => void;
  navigate: (route: string, state?: any) => void;
}

export const HomePreview: React.FC<HomePreviewProps> = ({ channels, onSelectChannel, navigate }) => {
  const vtvChannels = useMemo(
    () => channels
      .filter((channel) => /^VTV\s*\d+(?:\s+HD)?$/i.test(channel.name.trim()))
      .sort((a, b) => Number(a.name.match(/\d+/)?.[0] ?? 0) - Number(b.name.match(/\d+/)?.[0] ?? 0)),
    [channels]
  );

  const [recommendationSeed] = useState(() => Math.random());
  const [recommendationTilt, setRecommendationTilt] = useState<Record<string, { x: number; y: number }>>({});
  const recommendationsRef = useRef<HTMLDivElement>(null);
  const scrollRecommendations = (direction: 'previous' | 'next') => {
    recommendationsRef.current?.scrollBy({ left: direction === 'next' ? 300 : -300, behavior: 'smooth' });
  };
  const recommendations = useMemo(() => {
    const shuffledChannels = [...channels]
      .sort((a, b) => ((a.id.length * 17 + recommendationSeed * 100) % 97) - ((b.id.length * 13 + recommendationSeed * 100) % 97))
      .slice(0, 2);

    return [
      {
        id: 'files',
        title: 'Sparkle project notes',
        detail: 'Files · Recently added',
        image: '/banners/mindmap_sparkle_3moi.jpg',
        icon: FileText,
        route: '/notes',
      },
      {
        id: 'images',
        title: 'Broadcast archive',
        detail: 'Images · Gallery',
        image: '/banners/thoi_su_19h_hd.webp',
        icon: ImageIcon,
        route: '/gallery',
      },
      {
        id: 'gallery',
        title: 'Vietnam today collection',
        detail: 'Gallery · Featured',
        image: '/banners/vietnam_today.jpg',
        icon: Sparkles,
        route: '/gallery',
      },
      {
        id: 'audio',
        title: 'Radio listening room',
        detail: 'Audio · Explore channels',
        image: '/banners/chao_buoi_sang_vtv1_2026.webp',
        icon: Music2,
        route: '/live-tv',
      },
      ...shuffledChannels.map((channel) => ({
        id: `channel-${channel.id}`,
        title: channel.name,
        detail: `Live channel · ${channel.quality}`,
        image: channel.bannerImage || channel.logo,
        icon: Radio,
        route: `/live-tv?channel=${channel.slug}`,
        channel,
      })),
    ];
  }, [channels, recommendationSeed]);

  const openChannel = (channel: Channel) => {
    onSelectChannel(channel);
    navigate(`/live-tv?channel=${channel.slug}`);
  };

  return (
    <div className="home-preview-page mx-auto flex w-full max-w-7xl flex-col gap-5 px-1 py-2 selection:bg-[#ff01ff] selection:text-black dark:selection:bg-[#ff82ff] sm:gap-6 sm:py-4">
      <HeroCarousel channels={channels} onSelectChannel={onSelectChannel} navigate={navigate} flipActiveSlide />

      <section aria-labelledby="recommendations-title" className="px-4 text-black dark:text-[#e7e7e7] sm:px-6">
        <div className="flex h-9 items-center justify-between border-b border-black/10 px-1 dark:border-white/10">
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
        </div>
        <div ref={recommendationsRef} className="flex snap-x gap-3 overflow-x-auto pt-3 pb-1 [perspective:900px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {recommendations.map((item) => {
            const ItemIcon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => item.channel ? openChannel(item.channel) : navigate(item.route)}
                onMouseMove={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  setRecommendationTilt((items) => ({
                    ...items,
                    [item.id]: {
                      x: ((event.clientY - rect.top) / rect.height - 0.5) * -16,
                      y: ((event.clientX - rect.left) / rect.width - 0.5) * 18,
                    },
                  }));
                }}
                onMouseLeave={() => setRecommendationTilt((items) => ({ ...items, [item.id]: { x: 0, y: 0 } }))}
                style={{
                  transform: `rotateX(${recommendationTilt[item.id]?.x ?? 0}deg) rotateY(${recommendationTilt[item.id]?.y ?? 0}deg)`,
                  transition: 'transform 180ms ease-out, box-shadow 180ms ease-out',
                  transformStyle: 'preserve-3d',
                }}
                className="group w-[calc((100vw-2.75rem)/2)] min-w-[178px] shrink-0 snap-start overflow-hidden rounded-2xl sm:w-[220px] lg:w-[calc((100%_-_2.25rem)/5)] border border-black/[0.08] bg-white text-left shadow-[0_1px_5px_rgba(0,0,0,0.08)] transition-transform hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#168a9e] dark:border-white/[0.1] dark:bg-[#29292d]"
              >
                <div className="relative flex h-[92px] items-center justify-center overflow-hidden bg-[#f1f1f1] dark:bg-[#38383d]">
                  <img src={item.image} alt="" loading="lazy" decoding="async" className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                  <span className="absolute left-2 top-2 flex size-6 items-center justify-center rounded-[3px] bg-white/90 text-[#176d86] shadow-sm dark:bg-black/60 dark:text-[#80d8e7]">
                    <ItemIcon className="size-3.5" aria-hidden="true" />
                  </span>
                  <ExternalLink className="absolute right-2 top-2 size-3.5 text-white opacity-0 drop-shadow transition-opacity group-hover:opacity-100" aria-hidden="true" />
                </div>
                <div className="flex min-h-[62px] flex-col gap-0.5 px-2.5 py-2">
                  <span className="truncate text-[12px] font-medium text-black dark:text-[#f1f1f1]">{item.title}</span>
                  <span className="truncate text-[11px] text-black/50 dark:text-[#a9a9ae]">{item.detail}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <header className="!bg-transparent flex flex-col gap-2 px-4 sm:px-6">
        <h1 className="text-xl font-semibold tracking-tight text-black dark:text-white sm:text-2xl">
          Welcome to the new experience!
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-[#5b5b5b] dark:text-[#b8b8be]">
          This will be the future of a new rejuvenated Home page in Sparkle. We gave your an opportunity to try it out early, although it is stil buggy, unfinished product and not looking fantastic.
        </p>
      </header>

      <section aria-label="VTV channels" className="px-4 text-black dark:text-[#e7e7e7] sm:px-6">
        <div className="flex h-9 items-center gap-2 border-b border-black/10 px-1 text-[13px] font-medium text-black dark:border-white/10 dark:text-[#ededed]">
          <ChevronDown className="size-3.5 text-black/60 dark:text-[#bdbdbd]" aria-hidden="true" />
          <span>Quick access</span>
        </div>

        <div className="pt-1">
          {vtvChannels.map((channel) => {
            const channelLabel = channel.name.replace(/\s+HD$/i, '').trim();

            return (
              <button
                key={channel.id}
                type="button"
                role="listitem"
                onClick={() => openChannel(channel)}
                aria-label={`Watch ${channelLabel}`}
                className="group flex min-h-9 w-full items-center gap-2.5 rounded-[2px] px-1.5 text-left text-[13px] transition-colors hover:bg-black/10 focus-visible:bg-black/10 focus-visible:outline-none dark:hover:bg-white/15 dark:focus-visible:bg-white/15 sm:gap-3 sm:px-2"
              >
                <img
                  src={channel.logo}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="size-[18px] shrink-0 object-contain"
                />
                <span className="min-w-0 flex-1 truncate text-black dark:text-[#e5e5e5]">{channelLabel}</span>
                <span className="hidden max-w-[45%] truncate text-xs text-black/55 dark:text-[#a5a5a5] sm:block">
                  {channel.currentProgram?.title || channel.category}
                </span>
                <span className="ml-1 flex shrink-0 items-center gap-1.5 text-[11px] text-black/60 dark:text-[#bdbdbd]">
                  <Radio className="size-3.5 text-[#168a9e] dark:text-[#60c5d8]" aria-hidden="true" />
                  <span>{channel.quality}</span>
                </span>
              </button>
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
