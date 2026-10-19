import React, { useMemo } from 'react';
import { ChevronDown, ChevronRight, Radio } from 'lucide-react';
import { FluentHomeIcon } from '../components/FluentIcons';
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
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-1 py-2 sm:gap-6 sm:py-4">
      <header className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold tracking-tight text-black dark:text-white sm:text-2xl">
          Welcome to the new experience!
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-[#5b5b5b] dark:text-[#b8b8be]">
          This will be the future of a new rejuvenated Home page in Sparkle. We gave your an opportunity to try it out early, although it is stil buggy and not looking fantastic.
        </p>
      </header>

      <section
        aria-label="VTV channels"
        className="overflow-hidden rounded-[7px] border border-[#3b3b3b] bg-[#101010] text-[#e7e7e7] shadow-lg"
      >
        <div className="flex h-10 items-center gap-2 border-b border-[#3b3b3b] bg-[#1b1b1b] px-3 text-[13px]">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 rounded px-1.5 py-1 text-left hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            aria-label="Go to Home"
          >
            <FluentHomeIcon className="size-4 shrink-0" />
            <span>Home</span>
          </button>
          <ChevronRight className="size-3.5 shrink-0 text-[#b9b9b9]" aria-hidden="true" />
          <span className="text-[#f0f0f0]">Channels</span>
        </div>

        <div className="px-2.5 pt-2.5 sm:px-4">
          <div className="flex h-8 items-center gap-2 border-b border-white/10 px-1 text-[13px] font-medium text-[#ededed]">
            <ChevronDown className="size-3.5 text-[#bdbdbd]" aria-hidden="true" />
            <span>Quick access</span>
          </div>

          <div className="pb-2 pt-1">
            {vtvChannels.map((channel) => {
              const channelLabel = channel.name.replace(/\s+HD$/i, '').trim();

              return (
                <button
                  key={channel.id}
                  type="button"
                  role="listitem"
                  onClick={() => openChannel(channel)}
                  aria-label={`Watch ${channelLabel}`}
                  className="group flex min-h-9 w-full items-center gap-2.5 rounded-[2px] px-1.5 text-left text-[13px] transition-colors hover:bg-[#4a4a4a] focus-visible:bg-[#4a4a4a] focus-visible:outline-none sm:gap-3 sm:px-2"
                >
                  <img
                    src={channel.logo}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="size-[18px] shrink-0 object-contain"
                  />
                  <span className="min-w-0 flex-1 truncate text-[#e5e5e5]">{channelLabel}</span>
                  <span className="hidden max-w-[45%] truncate text-xs text-[#a5a5a5] sm:block">
                    {channel.currentProgram?.title || channel.category}
                  </span>
                  <span className="ml-1 flex shrink-0 items-center gap-1.5 text-[11px] text-[#bdbdbd]">
                    <Radio className="size-3.5 text-[#60c5d8]" aria-hidden="true" />
                    <span>{channel.quality}</span>
                  </span>
                </button>
              );
            })}

            {vtvChannels.length === 0 && (
              <p className="px-2 py-4 text-sm text-[#bdbdbd]">No VTV channels are available yet.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
