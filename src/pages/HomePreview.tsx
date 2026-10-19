import React, { useMemo } from 'react';
import { ChevronDown, Radio } from 'lucide-react';
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

  const openChannel = (channel: Channel) => {
    onSelectChannel(channel);
    navigate(`/live-tv?channel=${channel.slug}`);
  };

  return (
    <div className="home-preview-page mx-auto flex w-full max-w-7xl flex-col gap-5 px-1 py-2 selection:bg-[#ff01ff] selection:text-black dark:selection:bg-[#ff82ff] sm:gap-6 sm:py-4">
      <HeroCarousel channels={channels} onSelectChannel={onSelectChannel} navigate={navigate} flipActiveSlide />

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
