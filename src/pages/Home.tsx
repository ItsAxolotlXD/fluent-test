import React from 'react';
import { HeroCarousel } from '../components/HeroCarousel';
import { OnAirSlider } from '../components/OnAirSlider';
import { FarewellAnnouncement } from '../components/FarewellAnnouncement';
import { CategoryIcon } from '../components/CategoryIcon';
import { NEWS_DATA } from '../data/news';
import { Channel } from '../types';
import { 
  Shield, 
  ExternalLink,
  Settings as SettingsIcon,
  Search,
  SlidersHorizontal,
  Compass,
  Layers
} from 'lucide-react';
import { FluentHomeIcon, FluentLiveTvIcon, FluentNewsIcon } from '../components/FluentIcons';
import { SequentialSection } from '../components/SequentialSection';
import { useSettings } from '../hooks/useSettings';

interface HomeProps {
  navigate: (route: string, state?: any) => void;
  onSelectChannel: (channel: Channel) => void;
  channels: Channel[];
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onOpenSpotlight?: () => void;
}

const APP_PAGES = [
  { id: 'page-home', title: 'Home', desc: 'Overview, trending & featured channels', route: '/', icon: FluentHomeIcon, keywords: 'home overview trending' },
  { id: 'page-livetv', title: 'Watch', desc: 'Watch live broadcasts from VTV, HTV, VTC, Local channels', route: '/live-tv', icon: FluentLiveTvIcon, keywords: 'watch live tv vtv htv vtc broadcasting' },
  { id: 'page-news', title: 'Articles', desc: 'Broadcasting technology news, branding & articles', route: '/news', icon: FluentNewsIcon, keywords: 'articles news announcements updates' },
  { id: 'page-test', title: 'Test Channels', desc: 'Experimental feeds and test stream laboratory', route: '/test', icon: Compass, keywords: 'test channels lab developer' },
  { id: 'page-settings', title: 'Settings', desc: 'Customize theme, navigation bar, and keybinds', route: '/settings', icon: SettingsIcon, keywords: 'settings personalization font display' },
];

const SETTINGS_SHORTCUTS = [
  { id: 'set-font', title: 'Text Scaling & Typography', desc: 'Adjust font size scale from 78% to 124%', route: '/settings', keywords: 'font size zoom text scale' },
  { id: 'set-nav', title: 'Navigation Mode', desc: 'Switch between Top View, Side View, and Tab View', route: '/settings', keywords: 'navigation mode topbar sidebar floaty tab view' },
  { id: 'set-autohide', title: 'Auto-hide Side View', desc: 'Automatically collapse sidebar when watching content', route: '/settings', keywords: 'auto-hide sidebar collapse' },
  { id: 'set-motion', title: 'Motion & Movements', desc: 'Reduce animations or enable fluid transitions', route: '/settings', keywords: 'motion reduce animations movements' },
  { id: 'set-keybinds', title: 'Custom Keybinds', desc: 'Configure keyboard shortcuts for quick actions', route: '/settings', keywords: 'keybinds shortcuts keyboard alt' },
  { id: 'set-search-cats', title: 'Search Categories', desc: 'Choose which content types show in search', route: '/settings', keywords: 'search spotlight categories customize' },
];

export const Home: React.FC<HomeProps> = ({
  navigate,
  onSelectChannel,
  channels,
  searchQuery,
  onSearchChange,
  onOpenSpotlight
}) => {
  const { settings } = useSettings();
  const query = (searchQuery || '').trim().toLowerCase();

  // 1. Matching App Pages
  const matchingPages = query
    ? APP_PAGES.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.desc.toLowerCase().includes(query) ||
          p.keywords.toLowerCase().includes(query)
      )
    : [];

  // 2. Matching Settings Shortcuts
  const matchingSettings = query
    ? SETTINGS_SHORTCUTS.filter(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.desc.toLowerCase().includes(query) ||
          s.keywords.toLowerCase().includes(query)
      )
    : [];

  // 3. Matching Channels
  const matchingChannels = query
    ? channels.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.category.toLowerCase().includes(query) ||
          (c.channelNumber && String(c.channelNumber).includes(query)) ||
          (c.tags && c.tags.some((t) => t.toLowerCase().includes(query)))
      )
    : [];

  // 4. Matching News
  const matchingNews = query
    ? NEWS_DATA.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.excerpt.toLowerCase().includes(query) ||
          a.category.toLowerCase().includes(query)
      )
    : [];

  const totalMatches = matchingPages.length + matchingSettings.length + matchingChannels.length + matchingNews.length;

  if (query) {
    return (
      <div className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto space-y-8 py-6 pb-24">
        {/* Header with clear & Spotlight trigger */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#E6005A]/20 text-[#FF4D8B] border border-[#E6005A]/30">
                Spotlight Search
              </span>
              <span className="text-xs text-[#9CA3AF]">
                {totalMatches} results across the application
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] dark:text-white tracking-tight mt-1">
              Results for "{searchQuery}"
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {onOpenSpotlight && (
              <button
                type="button"
                onClick={onOpenSpotlight}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors cursor-pointer"
                title="Open Spotlight Search window"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Open Spotlight (⌘K)</span>
              </button>
            )}
            {onSearchChange && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#4cc2ff] text-black hover:bg-[#6bd0ff] transition-colors cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>
        </div>

        {/* 1. Pages & Categories */}
        {matchingPages.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-bold font-square uppercase tracking-wider text-[#9CA3AF] flex items-center gap-2.5">
              <CategoryIcon className="w-6 h-6 sm:w-6.5 sm:h-6.5 shrink-0" />
              <span>Pages & Categories ({matchingPages.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {matchingPages.map((page) => {
                const IconComponent = page.icon;
                return (
                  <div
                    key={page.id}
                    onClick={() => navigate(page.route)}
                    className="p-3.5 rounded-2xl bg-[#38383d] border border-white/10 hover:border-[#E6005A] transition-colors cursor-pointer flex items-center gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#E6005A]/15 text-[#E6005A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-[#111827] dark:text-white group-hover:text-[#FF4D8B] transition-colors truncate">
                        {page.title}
                      </div>
                      <div className="text-xs text-[#9CA3AF] truncate">
                        {page.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 2. Settings Shortcuts */}
        {matchingSettings.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-bold font-square uppercase tracking-wider text-[#9CA3AF] flex items-center gap-2.5">
              <CategoryIcon className="w-6 h-6 sm:w-6.5 sm:h-6.5 shrink-0" />
              <span>Settings ({matchingSettings.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {matchingSettings.map((set) => (
                <div
                  key={set.id}
                  onClick={() => navigate(set.route)}
                  className="p-3.5 rounded-2xl bg-[#38383d] border border-white/10 hover:border-[#E6005A] transition-colors cursor-pointer flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0 group-hover:bg-[#E6005A] transition-colors">
                    <SettingsIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-[#111827] dark:text-white group-hover:text-[#FF4D8B] transition-colors truncate">
                      {set.title}
                    </div>
                    <div className="text-xs text-[#9CA3AF] truncate">
                      {set.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. Channels */}
        {matchingChannels.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-bold font-square uppercase tracking-wider text-[#9CA3AF] flex items-center gap-2.5">
              <CategoryIcon className="w-6 h-6 sm:w-6.5 sm:h-6.5 shrink-0" />
              <span>Live TV Channels ({matchingChannels.length})</span>
            </h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3.5">
              {matchingChannels.map((ch) => (
                <div
                  key={ch.id}
                  id={`home-channel-card-${ch.id}`}
                  onClick={() => onSelectChannel(ch)}
                  className="group relative w-full aspect-[136/78] rounded-xl sm:rounded-2xl transition-none cursor-pointer overflow-hidden flex items-center justify-center p-1.5 sm:p-2.5 select-none bg-[#38383d]"
                  title={ch.name}
                >
                  <img
                    src={ch.logo}
                    alt={ch.name}
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
              ))}
            </div>
          </section>
        )}

        {/* 4. News */}
        {matchingNews.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-bold font-square uppercase tracking-wider text-[#9CA3AF] flex items-center gap-2.5">
              <CategoryIcon className="w-6 h-6 sm:w-6.5 sm:h-6.5 shrink-0" />
              <span>News Articles ({matchingNews.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {matchingNews.map((article) => (
                <div
                  key={article.id}
                  onClick={() => navigate(`/news/${article.slug}`)}
                  className="rounded-2xl bg-[#38383d] border border-white/10 p-4 hover:border-[#E6005A] cursor-pointer space-y-2 transition-colors"
                >
                  <span className="text-[10px] font-bold text-[#E6005A] uppercase tracking-wider">
                    {article.category}
                  </span>
                  <h3 className="font-bold text-[#111827] dark:text-white text-sm line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-xs text-[#9CA3AF] line-clamp-2">
                    {article.excerpt}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {totalMatches === 0 && (
          <div className="py-16 text-center space-y-3 rounded-2xl bg-[#38383d]/60 border border-white/10 p-6">
            <p className="text-sm font-medium text-[#9CA3AF]">
              No results found matching "{searchQuery}" across the app
            </p>
            {onSearchChange && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#4cc2ff] text-black hover:bg-[#6bd0ff] transition-colors cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-16">
      {/* 1. 3D Coverflow Hero Banner (Section 0 - loads first) */}
      <SequentialSection order={0} enabled={settings.loadPagesSequentially}>
        <HeroCarousel
          navigate={navigate}
          onSelectChannel={onSelectChannel}
          channels={channels}
        />
      </SequentialSection>

      <div className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto space-y-8 sm:space-y-10">
        {/* 2. Đề xuất cho bạn (Section 1) */}
        <SequentialSection order={1} enabled={settings.loadPagesSequentially}>
          <OnAirSlider
            channels={channels}
            onSelectChannel={onSelectChannel}
            navigate={navigate}
          />
        </SequentialSection>

        {/* Thông báo dừng sản xuất & Lời cảm ơn VPlay (Section 2) */}
        <SequentialSection order={2} enabled={settings.loadPagesSequentially}>
          <FarewellAnnouncement />
        </SequentialSection>

        {/* 3. About VNRT Online (Section 3) */}
        <SequentialSection order={3} enabled={settings.loadPagesSequentially}>
          <section id="home-about-section" className="space-y-8 pt-4 border-t border-[#26262E]">
            {/* Hero Intro */}
            <div className="text-center space-y-4 pt-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black dark:text-white tracking-tight">
                VNRT Online -{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2020] via-[#FF3366] to-[#E6005A]">
                  Bringing Vietnam to Your Screen
                </span>
              </h2>

              <div className="text-sm sm:text-base text-black dark:text-[#9CA3AF] max-w-3xl mx-auto leading-relaxed text-left space-y-3 pt-2">
                <p className="flex items-start gap-2">
                  <span className="text-[#E6005A] font-bold select-none">•</span>
                  <span>
                    VNRT Online is a non-profit online television platform providing users with high-quality streaming experiences across diverse broadcast channels, completely free of charge.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-[#E6005A] font-bold select-none">•</span>
                  <span>
                    In addition, VNRT Online provides comprehensive updates on broadcasting technology, television branding & motion graphics, and media culture in Vietnam.
                  </span>
                </p>
              </div>
            </div>

            {/* Disclaimer and Ethics Card */}
            <div
              id="home-about-disclaimer-card"
              className="fluent-reveal-item setting-card p-5 sm:p-6 rounded-[8px] bg-white dark:bg-[#38383d] border border-[#e5e5e5] dark:border-[#48484e] shadow-xs space-y-2.5 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-[#4cc2ff] shrink-0" />
                <h3 id="about-disclaimer-title" className="text-base font-semibold text-black dark:text-white">
                  Copyright & Broadcast Source Disclaimer
                </h3>
              </div>
              <p id="about-disclaimer-text" className="text-xs sm:text-sm text-black dark:text-[#a1a1aa] leading-relaxed">
                All television logos, trademarks, studio images, and broadcast feeds are the intellectual property of their respective broadcasters (Vietnam Television VTV, Ho Chi Minh City Television HTV, VTC Digital Television, and local radio-television stations). VNRT Online serves non-commercial, academic research, and technical archive purposes only.
              </p>
            </div>

            {/* Community Connect */}
            <div
              id="home-about-community-card"
              className="fluent-reveal-item setting-card text-center p-5 sm:p-6 rounded-[8px] bg-white dark:bg-[#38383d] border border-[#e5e5e5] dark:border-[#48484e] shadow-xs space-y-3.5 transition-colors"
            >
              <h3 className="text-base sm:text-lg font-semibold text-black dark:text-white">Join the Waves Community</h3>
              <p className="text-xs sm:text-sm text-black dark:text-[#a1a1aa] max-w-2xl mx-auto leading-relaxed">
                “Waves of Our Time” — connecting people from across all regions to meet, share, and discuss stories of our era. A space to preserve media memories, iconic broadcasts, and cultural milestones of television.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                <a
                  id="btn-home-join-discord"
                  href="https://discord.gg/wcdjaDDayK"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex items-center gap-2 px-5 py-2 rounded-[4px] bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs sm:text-[13px] font-medium transition-colors shadow-xs cursor-pointer active:scale-95"
                >
                  <svg className="w-4 h-4 fill-current text-white transition-colors" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.078.078 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                  <span>Join Waves on Discord</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-90 group-hover:opacity-100" />
                </a>
              </div>
            </div>
          </section>
        </SequentialSection>
      </div>
    </div>
  );
};
