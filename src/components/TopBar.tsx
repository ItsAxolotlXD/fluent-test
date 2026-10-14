import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Menu, History, X, UserRound as UserRoundIcon } from 'lucide-react';
import { 
  FluentHomeIcon, 
  FluentLiveTvIcon, 
  FluentNewsIcon, 
  FluentSearchIcon, 
  FLUENT_ICON_URLS 
} from './FluentIcons';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '../hooks/useSettings';
import { useIsMobile } from '../hooks/useIsMobile';
import { Channel, NewsArticle } from '../types';
import { NEWS_DATA } from '../data/news';
import { galleryDB, GalleryMediaItem } from '../services/galleryStorage';

const LOGO_SRC = 'https://static.wikia.nocookie.net/ep-deo/images/8/8a/V-green.png/revision/latest/scale-to-width-down/1000?cb=20261011062111';
const HOME_ICON_SRC = FLUENT_ICON_URLS.home;
const TV_ICON_SRC = FLUENT_ICON_URLS.liveTv;
const NEWS_ICON_SRC = FLUENT_ICON_URLS.news;
const SETTINGS_ICON_SRC = 'https://static.wikia.nocookie.net/ftv/images/9/97/Settungs.png/revision/latest?cb=20260411085024&path-prefix=vi';

const DEFAULT_HISTORY_ITEMS = [
  'minecraft preview for windows',
  'mail and calendar',
  'calculator',
  'microsoft maps',
  'notepad',
  'watch live tv',
  'vtv1 hd thoi su 19h'
];

interface SearchAspectItem {
  id: string;
  title: string;
  type: 'history' | 'page' | 'channel' | 'news' | 'setting' | 'tool';
  logo?: string;
  keywords?: string;
  onSelect: () => void;
}

interface TopBarProps {
  currentRoute: string;
  navigate: (route: string) => void;
  onOpenSearch: () => void;
  onOpenMobileMenu?: () => void;
  currentChannel?: Channel;
  channels?: Channel[];
  onSelectChannel?: (channel: Channel) => void;
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
  tabSearchQuery?: string;
  onTabSearchChange?: (query: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentRoute,
  navigate,
  onOpenSearch,
  onOpenMobileMenu,
  currentChannel,
  channels = [],
  onSelectChannel,
  onOpenHelp = () => {},
  onOpenDiscord = () => {},
  onOpenSummarize = (_art?: NewsArticle) => {},
  onOpenTextToSpeech = (_art?: NewsArticle) => {},
  onOpenFindWords = () => {},
  onOpenAddStream = () => {},
  onImportChannels = () => {},
  fontSize = 16,
  onChangeFontSize = () => {},
  showUnsavedTooltip = false,
  onDismissUnsavedTooltip = () => {},
  tabSearchQuery = '',
  onTabSearchChange
}) => {
  const { settings, hasChanges, applyDraftSettings } = useSettings();
  const isMobile = useIsMobile();
  const [logoError, setLogoError] = useState(false);
  const [searchQuery, setSearchQuery] = useState(tabSearchQuery);
  const [isSearchFlyoutOpen, setIsSearchFlyoutOpen] = useState(false);
  const [galleryItems, setGalleryItems] = useState<GalleryMediaItem[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Synchronize searchQuery with current tab's search query
  useEffect(() => {
    setSearchQuery(tabSearchQuery || '');
  }, [tabSearchQuery, currentRoute]);

  // Load gallery items so TopBar search can find gallery media/documents
  useEffect(() => {
    galleryDB.getAll().then(setGalleryItems).catch(() => {});
    const unsubscribe = galleryDB.subscribe(() => {
      galleryDB.getAll().then(setGalleryItems).catch(() => {});
    });
    return () => unsubscribe();
  }, []);

  // Search History from localStorage
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('vone_search_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_HISTORY_ITEMS;
  });

  const saveToHistory = (query: string) => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return;
    setSearchHistory((prev) => {
      const next = [trimmed, ...prev.filter((item) => item.toLowerCase() !== trimmed)].slice(0, 15);
      try {
        localStorage.setItem('vone_search_history', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Close flyout on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFlyoutOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchFlyoutOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const isTopBarMode = settings.navigationMode === 'topbar';

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleApplySettings = () => {
    applyDraftSettings();
    onDismissUnsavedTooltip();
  };

  // Pre-configured App Aspects (Pages, Settings, Tools) with exact original naming
  const appAspects = useMemo(() => {
    const aspects: SearchAspectItem[] = [
      // Pages
      { id: 'page-home', title: 'Home', keywords: 'trang chủ home overview', type: 'page', onSelect: () => navigate('/') },
      { id: 'page-watch', title: 'Watch', keywords: 'live tv xem truyền hình trực tuyến watch', type: 'page', onSelect: () => navigate('/live-tv') },
      { id: 'page-news', title: 'Articles', keywords: 'tin tức bài viết news articles', type: 'page', onSelect: () => navigate('/news') },
      { id: 'page-channels', title: 'Channels', keywords: 'danh sách kênh channels channel directory', type: 'page', onSelect: () => navigate('/channels') },
      { id: 'page-favs', title: 'Favorites', keywords: 'kênh yêu thích favorites favs', type: 'page', onSelect: () => navigate('/favorites') },
      { id: 'page-updates', title: 'Updates', keywords: 'cập nhật phiên bản updates changelog', type: 'page', onSelect: () => navigate('/updates') },
      { id: 'page-craftmine', title: 'Craftmine', keywords: 'minecraft preview web game', type: 'page', onSelect: () => navigate('/craftmine') },
      { id: 'page-photopea', title: 'Photopea', keywords: 'photopea photoshop chỉnh sửa ảnh biên tập ảnh psd photo editor web app', type: 'page', onSelect: () => navigate('/photopea') },
      { id: 'page-gallery', title: 'Gallery', keywords: 'gallery bộ sưu tập ảnh video âm thanh phương tiện media photos', type: 'page', onSelect: () => navigate('/gallery') },
      { id: 'page-draws', title: 'Draws', keywords: 'draws paint vẽ hội họa bút cọ sketch ms paint canvas', type: 'page', onSelect: () => navigate('/draws') },
      { id: 'page-notes', title: 'Notes', keywords: 'ghi chú soạn thảo notes office', type: 'page', onSelect: () => navigate('/notes') },
      { id: 'page-vlc', title: 'VLC Media Player', keywords: 'vlc media player phát video âm thanh stream disc network equalizer', type: 'page', onSelect: () => navigate('/vlc') },
      { id: 'page-settings', title: 'Settings', keywords: 'cài đặt hệ thống settings preferences', type: 'page', onSelect: () => navigate('/settings') },
      { id: 'page-about', title: 'About', keywords: 'giới thiệu about v-one', type: 'page', onSelect: () => navigate('/about') },

      // Settings Shortcuts
      { id: 'set-sideview', title: 'Side View', keywords: 'settings side view thanh bên', type: 'setting', onSelect: () => navigate('/settings') },
      { id: 'set-darkmode', title: 'Dark / Light Mode', keywords: 'settings dark light mode giao diện tối sáng', type: 'setting', onSelect: () => navigate('/settings') },
      { id: 'set-spatialglass', title: 'Spatial Glass & Blur', keywords: 'settings spatial glass acrylic blur kính mờ', type: 'setting', onSelect: () => navigate('/settings') },
      { id: 'set-fontscale', title: 'Text Scaling & Typography', keywords: 'settings text scaling font size zoom cỡ chữ', type: 'setting', onSelect: () => navigate('/settings') },
      { id: 'set-keyboard', title: 'Native Virtual Keyboard', keywords: 'settings native virtual keyboard bàn phím ảo', type: 'setting', onSelect: () => navigate('/settings') },
      { id: 'set-aspect', title: 'Stream Aspect Ratio', keywords: 'settings stream aspect ratio tỉ lệ khung hình 16:9 4:3', type: 'setting', onSelect: () => navigate('/settings') },

      // Tools
      { id: 'tool-sticky', title: 'Sticky Note', keywords: 'tools sticky note ghi chú dán', type: 'tool', onSelect: () => navigate('/notes') },
      { id: 'tool-tts', title: 'Text-to-Speech Player', keywords: 'tools text-to-speech tts đọc bài viết', type: 'tool', onSelect: () => onOpenTextToSpeech(NEWS_DATA[0]) },
      { id: 'tool-findwords', title: 'Find Words', keywords: 'tools find words tìm từ trong trang', type: 'tool', onSelect: () => onOpenFindWords() },
      { id: 'tool-addstream', title: 'Add Custom Stream', keywords: 'tools add custom stream thêm luồng phát', type: 'tool', onSelect: () => onOpenAddStream() },
      { id: 'tool-discord', title: 'Discord Community', keywords: 'community discord v-one', type: 'tool', onSelect: () => window.open('https://discord.gg/wcdjaDDayK', '_blank') }
    ];

    // Channels
    channels.forEach((ch) => {
      aspects.push({
        id: `channel-${ch.id}`,
        title: ch.name,
        keywords: `${ch.category} ${ch.shortName || ''} ${ch.slug}`,
        type: 'channel',
        logo: ch.logo,
        onSelect: () => {
          if (onSelectChannel) onSelectChannel(ch);
          navigate(`/live-tv?channel=${ch.slug}`);
        }
      });
    });

    // News
    NEWS_DATA.forEach((art) => {
      aspects.push({
        id: `article-${art.id}`,
        title: art.title,
        keywords: `${art.category} ${art.excerpt || ''}`,
        type: 'news',
        onSelect: () => navigate(`/article/${art.id}`)
      });
    });

    return aspects;
  }, [channels, navigate, onSelectChannel, onOpenTextToSpeech, onOpenFindWords, onOpenAddStream]);

  // Filtered search results for flyout
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      // Empty input: render recent search history (matches user screenshot)
      return searchHistory.map((hist, idx) => ({
        id: `history-${idx}`,
        title: hist,
        type: 'history' as const,
        onSelect: () => {
          setSearchQuery(hist);
          saveToHistory(hist);
          // If query matches a known page/aspect
          const match = appAspects.find((a) => a.title.toLowerCase().includes(hist.toLowerCase()));
          if (match) {
            match.onSelect();
          } else {
            navigate(`/channels?search=${encodeURIComponent(hist)}`);
          }
          setIsSearchFlyoutOpen(false);
        }
      }));
    }

    // When query is typed: match every aspect of the app
    const matches: SearchAspectItem[] = [];

    // History matches
    searchHistory.forEach((hist, idx) => {
      if (hist.toLowerCase().includes(q)) {
        matches.push({
          id: `hist-match-${idx}`,
          title: hist,
          type: 'history',
          onSelect: () => {
            setSearchQuery(hist);
            saveToHistory(hist);
            navigate(`/channels?search=${encodeURIComponent(hist)}`);
            setIsSearchFlyoutOpen(false);
          }
        });
      }
    });

    // App aspects matches
    appAspects.forEach((item) => {
      if (item.title.toLowerCase().includes(q) || (item.keywords && item.keywords.toLowerCase().includes(q))) {
        matches.push(item);
      }
    });

    // Gallery media and document matches
    galleryItems.forEach((gItem) => {
      const matchTitle = gItem.title.toLowerCase().includes(q);
      const matchTag = gItem.tags?.some((t) => t.toLowerCase().includes(q));
      const matchDesc = gItem.description?.toLowerCase().includes(q);
      if (matchTitle || matchTag || matchDesc) {
        matches.push({
          id: `gallery-item-${gItem.id}`,
          title: gItem.title,
          keywords: `gallery ${gItem.type} ${gItem.tags?.join(' ') || ''}`,
          type: 'tool',
          logo: gItem.type === 'image' ? (gItem.thumbnailUrl || gItem.url) : undefined,
          onSelect: () => {
            navigate('/gallery');
            if (onTabSearchChange) {
              onTabSearchChange(gItem.title);
            }
          }
        });
      }
    });

    // Return ALL matches
    return matches;
  }, [searchQuery, searchHistory, appAspects, galleryItems, navigate, onTabSearchChange]);

  const handleSelectSearchResult = (item: SearchAspectItem) => {
    saveToHistory(item.title);
    item.onSelect();
    setIsSearchFlyoutOpen(false);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (currentRoute === '/gallery') {
      setIsSearchFlyoutOpen(false);
      return;
    }
    if (searchQuery.trim()) {
      saveToHistory(searchQuery.trim());
      setIsSearchFlyoutOpen(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      setIsSearchFlyoutOpen(false);
      onOpenSearch();
    }
  };

  return (
    <header className="w-full h-14 relative bg-[#f3f3f3] dark:bg-[#1b1f24] px-3 sm:px-6 md:px-8 flex items-center justify-between gap-3 sticky top-0 z-30 select-none">
      {/* Sticky top-left tab corner rounded mask: keeps top-left of tab page rounded (bo cong 10px) when scrolling, hidden on mobile UI */}
      <div
        aria-hidden="true"
        className="hidden md:block pointer-events-none absolute top-full left-0 z-30 w-[10px] h-[10px] overflow-hidden"
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[10px] h-[10px] block"
        >
          <path
            d="M 0,0 L 10,0 A 10 10 0 0 0 0,10 Z"
            className={settings.superDarkMode ? 'fill-black' : 'fill-[#f3f3f3] dark:fill-[#1b1f24]'}
          />
        </svg>
      </div>

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

      {/* 2. Center Search Box with Flyout matching Microsoft Fluent Design and reference image */}
      <div 
        ref={searchContainerRef}
        className="flex-1 flex items-center justify-center min-w-0 px-2 sm:px-4 z-40 md:absolute md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-[460px]"
      >
        <div className="relative w-full max-w-[460px] min-w-0 mx-auto">
          <form onSubmit={handleSearchSubmit} className="w-full">
            <div
              id="topbar-search-box"
              className={`group relative w-full h-8 sm:h-8.5 bg-black/5 dark:bg-[#282c31] border border-black/10 dark:border-white/10 flex items-center px-3 gap-2 transition-all ${
                isSearchFlyoutOpen
                  ? 'rounded-t-[6px] rounded-b-none border-b-2 border-b-[#005fb8] dark:border-b-[#4cc2ff]'
                  : 'rounded-[6px]'
              }`}
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  setIsSearchFlyoutOpen(true);
                  if (onTabSearchChange) {
                    onTabSearchChange(val);
                  }
                }}
                onFocus={() => setIsSearchFlyoutOpen(true)}
                placeholder={(() => {
                  if (currentRoute === '/' || currentRoute === '/home') return 'Search Home';
                  if (currentRoute.startsWith('/live-tv')) return 'Search Watch';
                  if (currentRoute.startsWith('/news') || currentRoute.startsWith('/article')) return 'Search Articles';
                  if (currentRoute.startsWith('/updates')) return 'Search Updates';
                  if (currentRoute.startsWith('/gallery')) return 'Search Gallery';
                  if (currentRoute.startsWith('/draws')) return 'Search Draws';
                  if (currentRoute.startsWith('/notes') || currentRoute.startsWith('/write') || currentRoute.startsWith('/present') || currentRoute.startsWith('/table')) return 'Search Notes';
                  if (currentRoute.startsWith('/vlc')) return 'Search VLC';
                  if (currentRoute.startsWith('/craftmine')) return 'Search Craftmine';
                  if (currentRoute.startsWith('/photopea')) return 'Search Photopea';
                  if (currentRoute.startsWith('/settings')) return 'Search Settings';
                  if (currentRoute.startsWith('/channels')) return 'Search Channels';
                  if (currentRoute.startsWith('/favorites')) return 'Search Favorites';
                  if (currentRoute.startsWith('/about')) return 'Search About';
                  if (currentRoute.startsWith('/test')) return 'Search Insider Flags';
                  const clean = currentRoute.replace(/^\//, '').split(/[/?#]/)[0];
                  return `Search ${clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : 'Home'}`;
                })()}
                className="w-full bg-transparent text-xs sm:text-[13px] text-[#111827] dark:text-white placeholder-[#71717a] dark:placeholder-white outline-none border-none py-1 pr-6 no-fluent-line"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchFlyoutOpen(false);
                    if (onTabSearchChange) {
                      onTabSearchChange('');
                    }
                  }}
                  title="Clear search"
                  className="absolute right-1 text-[#71717a] dark:text-white hover:text-[#111827] dark:hover:text-white p-0.5 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  title="Search"
                  className="absolute right-1 text-[#71717a] dark:text-white hover:text-[#111827] dark:hover:text-white p-0.5 transition-colors cursor-pointer"
                >
                  <FluentSearchIcon className="w-3.5 h-3.5 text-[#71717a] dark:text-white" />
                </button>
              )}
            </div>
          </form>

          {/* Flyout Result Dropdown: Displays ~5 items at a time, scrollable to see all results with tab-like slide-up */}
          <AnimatePresence>
            {isSearchFlyoutOpen && searchResults.length > 0 && (
              <motion.div
                key="topbar-search-flyout"
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 18 }}
                transition={{ duration: 0.44, ease: [0.16, 1, 0.3, 1] }}
                className="topbar-search-results-dropdown absolute top-full left-0 right-0 z-50 bg-white/70 dark:bg-[#1b1f24]/90 backdrop-blur-2xl rounded-b-[8px] border border-black/10 dark:border-white/10 border-t-0 shadow-[0_16px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_48px_rgba(0,0,0,0.6)] p-1.5 space-y-0.5 max-h-[240px] overflow-y-auto sidebar-scroller"
                style={{
                  backdropFilter: 'blur(28px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(28px) saturate(180%)',
                }}
              >
                {searchResults.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.44,
                      delay: Math.min(index * 0.04, 0.24),
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    onClick={() => handleSelectSearchResult(item)}
                    className="w-full h-11 px-2.5 rounded-[6px] flex items-center gap-3.5 text-left text-[#111827] dark:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:bg-black/[0.08] dark:active:bg-white/[0.12] transition-colors cursor-pointer group select-none"
                  >
                    {/* Rounded square box containing the icon with Light & Dark mode support */}
                    <div className="w-8 h-8 rounded-[6px] bg-black/[0.06] dark:bg-[#000000] flex items-center justify-center shrink-0 border border-black/[0.08] dark:border-white/5 shadow-xs">
                      {item.logo ? (
                        <img src={item.logo} alt="" className="max-h-5 max-w-5 object-contain" />
                      ) : (
                        <History className="w-4 h-4 text-black/70 dark:text-white/85 group-hover:text-black dark:group-hover:text-white transition-colors" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 truncate">
                      <div className="text-[13px] font-normal text-[#111827] dark:text-white/95 truncate">
                        {item.title}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 3. Right Action Icons: Account and Settings */}
  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 z-10">
  <button
    type="button"
    onClick={() => navigate('/auth')}
    className={`flex h-9 items-center gap-2 rounded-md px-2.5 text-xs font-semibold transition-colors cursor-pointer ${currentRoute === '/auth' ? 'bg-[#4cc2ff] text-black' : 'text-black/70 hover:bg-black/5 dark:text-white/80 dark:hover:bg-white/10'}`}
    title="Đăng nhập hoặc đăng ký"
    aria-label="Đăng nhập hoặc đăng ký"
  >
    <UserRoundIcon />
    <span className="hidden sm:inline">Tài khoản</span>
  </button>


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

      </div>
    </header>
  );
};
