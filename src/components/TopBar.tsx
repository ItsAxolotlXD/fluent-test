import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { 
  FluentHomeIcon, 
  FluentLiveTvIcon, 
  FluentNewsIcon, 
  FluentSearchIcon, 
  FLUENT_ICON_URLS 
} from './FluentIcons';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '../hooks/useSettings';
import { Channel, NewsArticle } from '../types';

const LOGO_SRC = 'https://static.wikia.nocookie.net/ep-deo/images/8/8a/V-green.png/revision/latest/scale-to-width-down/1000?cb=20261011062111';
const HOME_ICON_SRC = FLUENT_ICON_URLS.home;
const TV_ICON_SRC = FLUENT_ICON_URLS.liveTv;
const NEWS_ICON_SRC = FLUENT_ICON_URLS.news;
const SETTINGS_ICON_SRC = 'https://static.wikia.nocookie.net/ftv/images/9/97/Settungs.png/revision/latest?cb=20260411085024&path-prefix=vi';

interface TopBarProps {
  currentRoute: string;
  navigate: (route: string) => void;
  onOpenSearch: () => void;
  onOpenMobileMenu?: () => void;
  currentChannel?: Channel;
  channels?: Channel[];
  onOpenHelp?: () => void;
  onOpenDiscord?: () => void;
  onOpenSummarize?: (article: NewsArticle) => void;
  onOpenTextToSpeech?: (article: NewsArticle) => void;
  onOpenFindWords?: () => void;
  onOpenAddStream?: () => void;
  onImportChannels?: (channels: Channel[]) => void;
  onOpenNotifications?: () => void;
  fontSize?: number;
  onChangeFontSize?: (size: number) => void;
  showUnsavedTooltip?: boolean;
  onDismissUnsavedTooltip?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentRoute,
  navigate,
  onOpenSearch,
  onOpenMobileMenu,
  currentChannel,
  channels = [],
  onOpenHelp = () => {},
  onOpenDiscord = () => {},
  onOpenSummarize = () => {},
  onOpenTextToSpeech = () => {},
  onOpenFindWords = () => {},
  onOpenAddStream = () => {},
  onImportChannels = () => {},
  fontSize = 16,
  onChangeFontSize = () => {},
  showUnsavedTooltip = false,
  onDismissUnsavedTooltip = () => {}
}) => {
  const { settings, hasChanges, applyDraftSettings } = useSettings();
  const [logoError, setLogoError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isTopBarMode = settings.navigationMode === 'topbar';

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleApplySettings = () => {
    applyDraftSettings();
    onDismissUnsavedTooltip();
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/channels?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      onOpenSearch();
    }
  };

  return (
    <header className="w-full h-14 relative bg-[#f3f3f3] dark:bg-[#202020] px-3 sm:px-6 md:px-8 flex items-center justify-between gap-3 sticky top-0 z-30 select-none">
      {/* 1. Left Section */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 z-10">
        {settings.navigationMode !== 'floaty' && (
          <motion.button
            id="btn-mobile-menu-toggle"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={onOpenMobileMenu}
            className="md:hidden w-8 h-8 rounded-md flex items-center justify-center text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/15 transition-colors cursor-pointer shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5 transition-transform text-black dark:text-white" />
          </motion.button>
        )}

        {isTopBarMode && (
          <nav className="hidden xl:flex items-center gap-1 shrink-0" aria-label="Main Navigation">
            {/* Home */}
            <button
              id="btn-topbar-nav-home"
              type="button"
              onClick={() => navigate('/')}
              className={`group relative flex items-center gap-2 px-3 h-8.5 rounded-[4px] text-xs sm:text-[13px] font-normal transition-colors cursor-default whitespace-nowrap outline-none select-none ${
                currentRoute === '/' || currentRoute === '/home'
                  ? 'bg-black/5 dark:bg-white/10 text-[#111827] dark:text-white font-medium'
                  : 'text-[#4b5563] dark:text-[#d1d5db] hover:bg-black/5 dark:hover:bg-white/[0.06] hover:text-[#111827] dark:hover:text-white'
              }`}
              title="Home"
            >
              <FluentHomeIcon className="w-4 h-4 shrink-0 text-[#111827] dark:text-white" />
              <span>Home</span>

              {(currentRoute === '/' || currentRoute === '/home') && (
                <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#4cc2ff] rounded-t-full pointer-events-none" />
              )}
            </button>

            {/* Watch */}
            <button
              id="btn-topbar-nav-tv"
              type="button"
              onClick={() => navigate('/live-tv')}
              className={`group relative flex items-center gap-2 px-3 h-8.5 rounded-[4px] text-xs sm:text-[13px] font-normal transition-colors cursor-default whitespace-nowrap outline-none select-none ${
                currentRoute === '/live-tv'
                  ? 'bg-black/5 dark:bg-white/10 text-[#111827] dark:text-white font-medium'
                  : 'text-[#4b5563] dark:text-[#d1d5db] hover:bg-black/5 dark:hover:bg-white/[0.06] hover:text-[#111827] dark:hover:text-white'
              }`}
              title="Watch"
            >
              <FluentLiveTvIcon className="w-4 h-4 shrink-0 text-[#111827] dark:text-white" />
              <span>Watch</span>

              {currentRoute === '/live-tv' && (
                <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#4cc2ff] rounded-t-full pointer-events-none" />
              )}
            </button>

            {/* Articles */}
            <button
              id="btn-topbar-nav-news"
              type="button"
              onClick={() => navigate('/news')}
              className={`group relative flex items-center gap-2 px-3 h-8.5 rounded-[4px] text-xs sm:text-[13px] font-normal transition-colors cursor-default whitespace-nowrap outline-none select-none ${
                currentRoute === '/news' || currentRoute.startsWith('/article')
                  ? 'bg-black/5 dark:bg-white/10 text-[#111827] dark:text-white font-medium'
                  : 'text-[#4b5563] dark:text-[#d1d5db] hover:bg-black/5 dark:hover:bg-white/[0.06] hover:text-[#111827] dark:hover:text-white'
              }`}
              title="Articles"
            >
              <FluentNewsIcon className="w-4 h-4 shrink-0 text-[#111827] dark:text-white" />
              <span>Articles</span>

              {(currentRoute === '/news' || currentRoute.startsWith('/article')) && (
                <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#4cc2ff] rounded-t-full pointer-events-none" />
              )}
            </button>
          </nav>
        )}
      </div>

      {/* 2. Center Search Box (Căn giữa thanh search) */}
      <div className="flex-1 flex items-center justify-center min-w-0 px-2 sm:px-4 z-10 md:absolute md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-[460px] md:pointer-events-none">
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-[460px] min-w-0 mx-auto md:pointer-events-auto">
          <div
            id="topbar-search-box"
            className="group relative w-full h-8 sm:h-8.5 bg-black/5 dark:bg-[#2b2b2b] border border-black/10 dark:border-white/10 flex items-center px-3 gap-2 rounded-[6px] overflow-hidden"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in V-One"
              className="w-full bg-transparent text-xs sm:text-[13px] text-[#111827] dark:text-white placeholder-[#71717a] dark:placeholder-[#8e8e8e] outline-none border-none py-1 pr-6 no-fluent-line"
            />
            <button
              type="submit"
              title="Search"
              className="absolute right-2.5 text-[#71717a] dark:text-[#8e8e8e] hover:text-[#111827] dark:hover:text-white p-0.5 transition-colors cursor-pointer"
            >
              <FluentSearchIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* 3. Right Action Icons: Settings Gear */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 z-10">
        {/* TopBar Mode: Settings Gear Icon */}
        {isTopBarMode && (
          <button
            id="btn-top-settings-gear"
            onClick={handleSettingsClick}
            className={`w-9 h-9 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
              currentRoute === '/settings'
                ? 'bg-black/10 dark:bg-white/15'
                : 'hover:bg-black/5 dark:hover:bg-white/10'
            }`}
            title="Settings"
          >
            <img 
              src={SETTINGS_ICON_SRC}
              alt="Settings"
              referrerPolicy="no-referrer"
              className={`w-5 h-5 object-contain shrink-0 brightness-0 dark:brightness-0 dark:invert transition-opacity duration-200 ${
                currentRoute === '/settings' ? 'opacity-100' : 'opacity-75 hover:opacity-100'
              }`}
            />
          </button>
        )}

        {/* In Settings tab: Fluent Save Button */}
        {currentRoute === '/settings' ? (
          <div className="relative flex items-center justify-center ml-1">
            <button
              id="btn-top-settings-apply-checkbox"
              type="button"
              onClick={handleApplySettings}
              className={`px-4 py-1.5 rounded-[4px] font-semibold text-white dark:text-black bg-[#4cc2ff] hover:bg-[#6bd0ff] active:bg-[#3bb2ef] transition-colors text-xs sm:text-[13px] cursor-default flex items-center justify-center shrink-0 border-b-2 border-black/25 shadow-xs select-none ${
                hasChanges 
                  ? 'ring-2 ring-[#4cc2ff]/50' 
                  : ''
              } ${showUnsavedTooltip ? 'animate-shake' : ''}`}
              title={
                hasChanges
                  ? "Unsaved changes. Click to save!"
                  : "All settings saved"
              }
              aria-label={hasChanges ? "Save settings" : "Settings saved"}
            >
              <span className="font-semibold">Save</span>
            </button>

            {/* Unsaved Settings Warning Tooltip */}
            <AnimatePresence>
              {showUnsavedTooltip && (
                <motion.div
                  id="settings-unsaved-tooltip"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -2 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full mt-2 right-0 z-50 flex flex-col items-end pointer-events-auto"
                >
                  <div className="px-3 py-1.5 rounded-[4px] bg-[#2c2c2c] border border-[#3e3e3e] text-white shadow-xl flex items-center gap-2 whitespace-nowrap text-xs">
                    <span className="w-2 h-2 rounded-full bg-[#4cc2ff] shrink-0" />
                    <span>Please save changes before leaving</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : null}
      </div>
    </header>
  );
};
