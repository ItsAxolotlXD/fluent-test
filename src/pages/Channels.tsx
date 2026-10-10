import React, { useState } from 'react';
import { Channel } from '../types';
import { ChannelCard } from '../components/ChannelCard';
import { CategoryIcon } from '../components/CategoryIcon';
import { DiscontinuedBanner } from '../components/DiscontinuedBanner';
import { Tag, Search, Radio, Filter, Tv, CheckCircle2, Sparkles, Satellite } from 'lucide-react';

interface ChannelsProps {
  channels: Channel[];
  onSelectChannel: (channel: Channel) => void;
  navigate: (route: string) => void;
  onOpenCustomStreamModal: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const Channels: React.FC<ChannelsProps> = ({
  channels,
  onSelectChannel,
  navigate,
  onOpenCustomStreamModal,
  searchQuery: externalSearchQuery,
  onSearchChange: externalOnSearchChange
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [internalSearchQuery, setInternalSearchQuery] = useState<string>('');

  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const setSearchQuery = externalOnSearchChange || setInternalSearchQuery;

  const distinctCategories = Array.from(new Set(channels.map((c) => c.category)));
  const groups = ['All', ...distinctCategories];

  const filteredChannels = channels.filter((c) => {
    const matchesGroup = selectedGroup === 'All' || c.category === selectedGroup;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesGroup && matchesSearch;
  });

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      {/* Support Ceased Banner */}
      <DiscontinuedBanner navigate={navigate} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 text-xs text-[#E6005A] font-bold font-square uppercase tracking-wider mb-1">
            <CategoryIcon className="w-6 h-6 sm:w-6.5 sm:h-6.5 shrink-0" />
            <span>Broadcasting Infrastructure Directory</span>
          </div>
          <h1 className="text-3xl font-bold font-['Segoe_UI',_sans-serif] text-[#111827] dark:text-white tracking-tight">
            Television Channels Directory
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">
            National essential broadcast networks, entertainment, news, regional and international channels.
          </p>
        </div>

        <button
          onClick={onOpenCustomStreamModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#4cc2ff] hover:bg-[#6bd0ff] text-black text-xs font-bold shadow-md shrink-0 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Import M3U8 Stream</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-[28px] bg-white dark:bg-[#1E1E22] border border-[#E5E7EB] dark:border-[#2D2D35] flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        {/* Groups */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
          {groups.map((grp) => (
            <button
              key={grp}
              onClick={() => setSelectedGroup(grp)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedGroup === grp
                  ? 'bg-[#4cc2ff] text-black shadow-md'
                  : 'bg-[#F3F4F6] text-[#4B5563] hover:text-[#111827] hover:bg-[#E5E7EB] dark:bg-[#141416] dark:text-[#A1A1AA] dark:hover:text-white border border-[#E5E7EB] dark:border-[#2D2D35]'
              }`}
            >
              {grp}
            </button>
          ))}
        </div>

        {/* Search */}
        <div id="channels-search-container" className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-[#8E8E93]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search television channels..."
            className="w-full pl-10 pr-4 py-2 rounded-[6px] bg-[#F3F4F6] dark:bg-[#141416] border border-[#E5E7EB] dark:border-[#34343C] border-b-2 border-b-[#888888] dark:border-b-[#777777] text-xs text-[#111827] dark:text-white placeholder-[#8E8E93] focus:outline-none focus:border-b-[#4cc2ff] focus:border-b-2 transition-colors"
          />
        </div>
      </div>

      {/* Grid of channels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredChannels.map((channel) => (
          <ChannelCard
            key={channel.id}
            channel={channel}
            onSelect={(ch) => {
              onSelectChannel(ch);
              navigate(`/live-tv?channel=${ch.slug}`);
            }}
          />
        ))}
      </div>
    </div>
  );
};
