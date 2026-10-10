import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home,
  Search,
  Tv,
  LayoutGrid,
  Megaphone,
  Heart,
  Sliders,
  FlaskConical,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Wrench,
  Info,
  MessageSquarePlus,
  MessageSquare,
  PlusCircle,
  UploadCloud,
  DownloadCloud,
  Sparkles,
  Volume2,
  User,
  UserX
} from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { useSettings } from '../hooks/useSettings';
import { CHANNELS_DATA } from '../data/channels';
import { Channel, NewsArticle } from '../types';
import { DiscordWelcomeModal } from './DiscordWelcomeModal';
import { parseM3UPlaylist, downloadPlaylistFile } from '../utils/m3uParser';

const LOGO_SRC = 'https://static.wikia.nocookie.net/ep-deo/images/4/4b/Vplay_no_wordmark.png/revision/latest/scale-to-width-down/1000?cb=20260829062616';

interface MorphingIndicatorProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  currentRoute: string;
  dependencyKey?: string;
}

const MorphingVerticalIndicator: React.FC<MorphingIndicatorProps> = ({
  containerRef,
  currentRoute,
  dependencyKey,
}) => {
  const [bounds, setBounds] = useState<{
    top: number;
    left: number;
    height: number;
    visible: boolean;
  }>({ top: 0, left: 10, height: 38, visible: false });

  useEffect(() => {
    let isCancelled = false;
    let observer: ResizeObserver | null = null;
    let mutationObserver: MutationObserver | null = null;
    let rafId: number | null = null;
    let timer1: NodeJS.Timeout | null = null;
    let timer2: NodeJS.Timeout | null = null;
    let timer3: NodeJS.Timeout | null = null;

    const measure = () => {
      if (isCancelled) return;
      const container = containerRef.current;
      if (!container) return;

      const activeEl = container.querySelector('[data-nav-active="true"]') as HTMLElement | null;
      if (!activeEl) {
        setBounds((prev) => (prev.visible ? { ...prev, visible: false } : prev));
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();
      const top = Math.round(activeRect.top - containerRect.top + container.scrollTop);
      const left = Math.round(activeRect.left - containerRect.left);
      const height = Math.round(activeRect.height);

      if (height > 0) {
        setBounds({ top, left, height, visible: true });
      }
    };

    measure();
    rafId = requestAnimationFrame(measure);
    timer1 = setTimeout(measure, 40);
    timer2 = setTimeout(measure, 120);
    timer3 = setTimeout(measure, 300);

    const container = containerRef.current;
    if (container) {
      observer = new ResizeObserver(() => measure());
      observer.observe(container);

      mutationObserver = new MutationObserver(() => measure());
      mutationObserver.observe(container, {
        attributes: true,
        attributeFilter: ['data-nav-active'],
        subtree: true,
      });

      container.addEventListener('scroll', measure, { passive: true });
    }

    return () => {
      isCancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (timer1) clearTimeout(timer1);
      if (timer2) clearTimeout(timer2);
      if (timer3) clearTimeout(timer3);
      if (observer) observer.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
      if (container) container.removeEventListener('scroll', measure);
    };
  }, [currentRoute, dependencyKey, containerRef]);

  if (!bounds.visible) return null;

  const INDICATOR_HEIGHT = 16;
  const centeredTop = bounds.top + Math.round((bounds.height - INDICATOR_HEIGHT) / 2);

  return (
    <motion.div
      className="absolute w-[3px] h-[16px] bg-[#4cc2ff] z-30 pointer-events-none rounded-full shadow-none"
      initial={false}
      animate={{
        top: centeredTop,
        left: bounds.left,
        opacity: bounds.visible ? 1 : 0,
      }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 35,
        mass: 0.5,
      }}
    />
  );
};

interface SidebarProps {
  currentRoute: string;
  navigate: (route: string, state?: any) => void;
  onOpenSearch: () => void;
  selectedChannel?: Channel | null;
  onSelectChannel?: (channel: Channel) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  channels?: Channel[];
  currentChannel?: Channel;
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
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  navigate,
  onOpenSearch,
  onSelectChannel,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
  channels = [],
  currentChannel,
  onOpenHelp = () => {},
  onOpenDiscord = () => {},
  onOpenSummarize = (_article: NewsArticle) => {},
  onOpenTextToSpeech = (_article: NewsArticle) => {},
  onOpenFindWords = () => {},
  onOpenAddStream = () => {},
  onImportChannels = (_channels: Channel[]) => {},
  onOpenNotifications = () => {},
  fontSize = 16,
  onChangeFontSize = (_size: number) => {}
}) => {
  const { settings } = useSettings();
  const { favoriteChannelIds } = useFavorites();

  const desktopNavRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const collapsedNavRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLiveTvExpanded, setIsLiveTvExpanded] = useState(false);
  const [isFavoritesExpanded, setIsFavoritesExpanded] = useState(false);
  const [isDiscordModalOpen, setIsDiscordModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isToolsFlyoutOpen, setIsToolsFlyoutOpen] = useState(false);
  const [isSignInFlyoutOpen, setIsSignInFlyoutOpen] = useState(false);
  const [signedInAccount, setSignedInAccount] = useState<string | null>(null);
  const [signInToast, setSignInToast] = useState<string | null>(null);

  const toggleSignInFlyout = () => {
    setIsSignInFlyoutOpen((prev) => !prev);
    if (isToolsFlyoutOpen) setIsToolsFlyoutOpen(false);
  };

  const toggleToolsFlyout = () => {
    setIsToolsFlyoutOpen((prev) => !prev);
    if (isSignInFlyoutOpen) setIsSignInFlyoutOpen(false);
  };

  const handleSignInAction = (provider: string) => {
    setIsSignInFlyoutOpen(false);
    if (provider === 'Sign out') {
      setSignedInAccount(null);
      setSignInToast('Signed out of account');
    } else if (provider === 'Guest') {
      setSignedInAccount(null);
      setSignInToast('Continuing without account');
    } else {
      setSignedInAccount(`${provider} Account`);
      setSignInToast(`Signed in with ${provider}`);
    }
  };

  useEffect(() => {
    if (!signInToast) return;
    const timer = setTimeout(() => setSignInToast(null), 3000);
    return () => clearTimeout(timer);
  }, [signInToast]);

  // Close flyouts when clicking outside
  useEffect(() => {
    if (!isToolsFlyoutOpen && !isSignInFlyoutOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (isToolsFlyoutOpen && target && !target.closest('.tools-flyout-container')) {
        setIsToolsFlyoutOpen(false);
      }
      if (isSignInFlyoutOpen && target && !target.closest('.signin-flyout-container') && !target.closest('.signin-toggle-btn')) {
        setIsSignInFlyoutOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isToolsFlyoutOpen, isSignInFlyoutOpen]);

  // Touch swipe to close mobile drawer
  const drawerTouchStartX = useRef<number | null>(null);
  const drawerTouchStartY = useRef<number | null>(null);

  const handleDrawerTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      drawerTouchStartX.current = e.touches[0].clientX;
      drawerTouchStartY.current = e.touches[0].clientY;
    }
  };

  const handleDrawerTouchEnd = (e: React.TouchEvent) => {
    if (drawerTouchStartX.current === null || drawerTouchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - drawerTouchStartX.current;
    const deltaY = e.changedTouches[0].clientY - drawerTouchStartY.current;

    if (deltaX < -35 && Math.abs(deltaX) > Math.abs(deltaY) * 1.1) {
      onCloseMobile?.();
    }
    drawerTouchStartX.current = null;
    drawerTouchStartY.current = null;
  };

  const favoriteChannels = useMemo(() => {
    return CHANNELS_DATA.filter((ch) => favoriteChannelIds.includes(ch.id));
  }, [favoriteChannelIds]);

  const shouldAnimateSidebar = !settings.reduceAllMotion && settings.animateSidebar;
  const effectiveCollapsed = settings.autoHideSidebar ? !isHovered : isCollapsed;

  const handleNavClick = (route: string, state?: any) => {
    navigate(route, state);
    if (onCloseMobile) onCloseMobile();
  };

  // Handler for Export M3U8
  const handleExportM3U8 = () => {
    try {
      downloadPlaylistFile(channels.length > 0 ? channels : CHANNELS_DATA, 'vplay_playlist.m3u8');
    } catch (e) {
      console.error(e);
    }
  };

  // Handler for Import M3U File
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;
      try {
        const parsed = parseM3UPlaylist(content);
        if (parsed.length === 0) return;
        const fullChannels: Channel[] = parsed.map((p, idx) => ({
          id: p.id || `m3u-file-${Date.now()}-${idx}`,
          name: p.name || `Channel ${idx + 1}`,
          shortName: p.name || `Channel ${idx + 1}`,
          slug: p.slug || `m3u-file-ch-${idx + 1}`,
          logo: p.logo || 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=200&auto=format&fit=crop&q=80',
          category: p.category || 'Special',
          quality: p.quality || 'HD',
          streamUrl: p.streamUrl || '',
          isLive: true,
          description: p.description || 'Channel loaded from M3U file.',
          currentProgram: p.currentProgram || {
            title: p.name || 'Live Broadcast',
            startTime: '00:00',
            endTime: '24:00',
            progress: 50,
            description: 'Live broadcast.'
          }
        }));
        onImportChannels(fullChannels);
      } catch (err) {
        console.error(err);
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  // Navigation Items matching the Windows 10 Settings Style (Settings moved to bottom footer)
  const navItems = useMemo(() => {
    const list = [
      {
        id: 'live-tv',
        label: 'Live TV',
        secondary: 'Taskbar / Live TV',
        route: '/live-tv',
        icon: Tv,
        hasSubmenu: true,
      },
      {
        id: 'channels',
        label: 'Channels',
        secondary: 'Channels',
        route: '/channels',
        icon: LayoutGrid,
      },
      {
        id: 'news',
        label: 'News',
        secondary: 'News',
        route: '/news',
        icon: Megaphone,
      },
      {
        id: 'favorites',
        label: 'Favorites',
        secondary: 'Favorites',
        route: '/favorites',
        icon: Heart,
        hasFavoritesSubmenu: true,
      },
    ];

    if (settings.developerMode) {
      list.push({
        id: 'test',
        label: 'Experimental (Lab)',
        secondary: 'Developer Mode',
        route: '/test',
        icon: FlaskConical,
      });
    }

    return list;
  }, [settings.developerMode]);

  const isCurrentActive = (route: string) => {
    if (route === '/' && (currentRoute === '/' || currentRoute === '/home')) return true;
    if (route === '/news' && (currentRoute === '/news' || currentRoute.startsWith('/article'))) return true;
    if (route === '/live-tv' && (currentRoute === '/live-tv' || currentRoute.startsWith('/live-tv'))) return true;
    if (route === '/channels' && (currentRoute === '/channels' || currentRoute.startsWith('/channels'))) return true;
    if (route === '/favorites' && (currentRoute === '/favorites' || currentRoute.startsWith('/favorites'))) return true;
    if (route === '/settings' && (currentRoute === '/settings' || currentRoute.startsWith('/settings'))) return true;
    if (route === '/about' && (currentRoute === '/about' || currentRoute.startsWith('/about'))) return true;
    if (route !== '/' && currentRoute.startsWith(route)) return true;
    return false;
  };

  // Render Flyout Menu matching user screenshot
  const renderToolsFlyout = (isCollapsedMode = false) => {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: isCollapsedMode ? 0 : 4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: isCollapsedMode ? 0 : 4 }}
        transition={{ duration: 0.14, ease: 'easeOut' }}
        className={`tools-flyout-container absolute z-50 w-[230px] bg-[#202020] border border-[#3e3e3e] rounded-[6px] shadow-2xl p-1.5 space-y-0.5 text-white select-none ${
          isCollapsedMode ? 'left-[52px] bottom-14' : 'left-3 right-3 sm:left-[265px] sm:right-auto bottom-12'
        }`}
        style={{
          boxShadow: '0 16px 40px rgba(0,0,0,0.65), 0 2px 8px rgba(0,0,0,0.4)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. About with chevron right > */}
        <button
          type="button"
          onClick={() => {
            setIsToolsFlyoutOpen(false);
            onOpenHelp();
          }}
          className="w-full h-[36px] px-3 rounded-[4px] flex items-center justify-between text-[13px] text-white hover:bg-white/10 active:bg-white/15 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-white stroke-[1.75]" />
            <span>About</span>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-400 stroke-[1.5]" />
        </button>

        {/* 2. Send feedback */}
        <button
          type="button"
          onClick={() => {
            setIsToolsFlyoutOpen(false);
            onOpenDiscord();
          }}
          className="w-full h-[36px] px-3 rounded-[4px] flex items-center justify-between text-[13px] text-white hover:bg-white/10 active:bg-white/15 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <MessageSquarePlus className="w-4 h-4 text-white stroke-[1.75]" />
            <span>Send feedback</span>
          </div>
        </button>

        {/* 3. Notification settings */}
        <button
          type="button"
          onClick={() => {
            setIsToolsFlyoutOpen(false);
            onOpenNotifications();
          }}
          className="w-full h-[36px] px-3 rounded-[4px] flex items-center justify-between text-[13px] text-white hover:bg-white/10 active:bg-white/15 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-4 h-4 text-white stroke-[1.75]" />
            <span>Notification settings</span>
          </div>
        </button>

        <div className="my-1 mx-1 h-[1px] bg-white/10" />

        {/* 4. Add stream */}
        <button
          type="button"
          onClick={() => {
            setIsToolsFlyoutOpen(false);
            onOpenAddStream();
          }}
          className="w-full h-[36px] px-3 rounded-[4px] flex items-center justify-between text-[13px] text-white hover:bg-white/10 active:bg-white/15 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <PlusCircle className="w-4 h-4 text-[#4cc2ff] stroke-[1.75]" />
            <span>Add stream</span>
          </div>
        </button>

        {/* 5. Import playlist */}
        <button
          type="button"
          onClick={() => {
            setIsToolsFlyoutOpen(false);
            fileInputRef.current?.click();
          }}
          className="w-full h-[36px] px-3 rounded-[4px] flex items-center justify-between text-[13px] text-white hover:bg-white/10 active:bg-white/15 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <UploadCloud className="w-4 h-4 text-neutral-300 stroke-[1.75]" />
            <span>Import playlist</span>
          </div>
        </button>

        {/* 6. Export playlist */}
        <button
          type="button"
          onClick={() => {
            setIsToolsFlyoutOpen(false);
            handleExportM3U8();
          }}
          className="w-full h-[36px] px-3 rounded-[4px] flex items-center justify-between text-[13px] text-white hover:bg-white/10 active:bg-white/15 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <DownloadCloud className="w-4 h-4 text-neutral-300 stroke-[1.75]" />
            <span>Export playlist</span>
          </div>
        </button>

        {/* Article contextual tools */}
        {(currentRoute === '/news' || currentRoute.startsWith('/article')) && (
          <>
            <div className="my-1 mx-1 h-[1px] bg-white/10" />
            <button
              type="button"
              onClick={() => {
                setIsToolsFlyoutOpen(false);
                onOpenFindWords();
              }}
              className="w-full h-[36px] px-3 rounded-[4px] flex items-center gap-2.5 text-[13px] text-white hover:bg-white/10 active:bg-white/15 transition-colors cursor-pointer text-left"
            >
              <Search className="w-4 h-4 text-neutral-300 stroke-[1.75]" />
              <span>Find words</span>
            </button>
          </>
        )}
      </motion.div>
    );
  };

  // Render Flyout Menu for Sign in with smooth slide-up animation
  const renderSignInFlyout = (isCollapsedMode = false) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className={`signin-flyout-container absolute z-50 w-[264px] bg-[#242424]/95 dark:bg-[#1f1f1f]/95 backdrop-blur-2xl border border-white/10 rounded-[10px] shadow-[0_12px_40px_rgba(0,0,0,0.65),0_2px_8px_rgba(0,0,0,0.4)] p-1.5 space-y-0.5 text-white select-none ${
          isCollapsedMode
            ? settings.sidebarPosition === 'right'
              ? 'right-[54px] bottom-0'
              : 'left-[54px] bottom-0'
            : 'bottom-full mb-2 left-0 right-0 sm:left-0 sm:right-auto sm:w-[264px]'
        }`}
        style={{
          boxShadow: '0 16px 40px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.4)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Signed in status header */}
        {signedInAccount && (
          <div className="px-3 py-2 mb-1 rounded-[6px] bg-white/[0.04] border border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded-full bg-[#4cc2ff]/20 text-[#4cc2ff] flex items-center justify-center text-xs font-bold shrink-0 border border-[#4cc2ff]/30">
                {signedInAccount[0]}
              </div>
              <div className="min-w-0 truncate">
                <div className="text-[12px] font-medium text-white truncate">{signedInAccount}</div>
                <div className="text-[10px] text-emerald-400 font-medium">Active account</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleSignInAction('Sign out')}
              className="text-[11px] text-neutral-400 hover:text-rose-400 hover:underline px-1.5 py-0.5 rounded cursor-pointer transition-colors"
            >
              Sign out
            </button>
          </div>
        )}

        {/* 1. Sign in with Vplay */}
        <button
          type="button"
          onClick={() => handleSignInAction('Vplay')}
          className="w-full h-[40px] px-3 rounded-[6px] flex items-center gap-3 text-[13px] text-white hover:bg-white/[0.08] active:bg-white/[0.12] transition-colors cursor-pointer text-left"
        >
          <div className="w-5 h-5 rounded-[5px] bg-gradient-to-br from-[#0078d4] to-[#4cc2ff] flex items-center justify-center shrink-0 border border-[#4cc2ff]/40 shadow-xs">
            <span className="text-white font-black text-xs leading-none">V</span>
          </div>
          <span className="font-medium truncate">Sign in with Vplay</span>
        </button>

        {/* 2. Sign in with Apple */}
        <button
          type="button"
          onClick={() => handleSignInAction('Apple')}
          className="w-full h-[40px] px-3 rounded-[6px] flex items-center gap-3 text-[13px] text-white hover:bg-white/[0.08] active:bg-white/[0.12] transition-colors cursor-pointer text-left"
        >
          <div className="w-5 h-5 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.63 1.35-.58.67-1.09 1.74-.96 2.77 1 .08 2.05-.52 2.67-1.27z"/>
            </svg>
          </div>
          <span className="font-medium truncate">Sign in with Apple</span>
        </button>

        {/* 3. Sign in with Google */}
        <button
          type="button"
          onClick={() => handleSignInAction('Google')}
          className="w-full h-[40px] px-3 rounded-[6px] flex items-center gap-3 text-[13px] text-white hover:bg-white/[0.08] active:bg-white/[0.12] transition-colors cursor-pointer text-left"
        >
          <div className="w-5 h-5 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
          </div>
          <span className="font-medium truncate">Sign in with Google</span>
        </button>

        {/* 4. Sign in with Microsoft */}
        <button
          type="button"
          onClick={() => handleSignInAction('Microsoft')}
          className="w-full h-[40px] px-3 rounded-[6px] flex items-center gap-3 text-[13px] text-white hover:bg-white/[0.08] active:bg-white/[0.12] transition-colors cursor-pointer text-left"
        >
          <div className="w-5 h-5 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
              <rect x="13" y="1" width="10" height="10" fill="#7FBA00"/>
              <rect x="1" y="13" width="10" height="10" fill="#00A4EF"/>
              <rect x="13" y="13" width="10" height="10" fill="#FFB900"/>
            </svg>
          </div>
          <span className="font-medium truncate">Sign in with Microsoft</span>
        </button>

        {/* Divider */}
        <div className="my-1.5 mx-1 h-[1px] bg-white/[0.08]" />

        {/* 5. Continue without account */}
        <button
          type="button"
          onClick={() => handleSignInAction('Guest')}
          className="w-full h-[40px] px-3 rounded-[6px] flex items-center gap-3 text-[13px] text-neutral-300 hover:text-white hover:bg-white/[0.08] active:bg-white/[0.12] transition-colors cursor-pointer text-left"
        >
          <div className="w-5 h-5 flex items-center justify-center shrink-0">
            <UserX className="w-4 h-4 text-neutral-400 stroke-[1.75]" />
          </div>
          <span className="font-normal truncate">Continue without account</span>
        </button>
      </motion.div>
    );
  };

  // Render Full Windows 10 Settings Style Sidebar Content
  const renderSidebarBody = (isMobile: boolean = false) => {
    const containerRef = isMobile ? mobileNavRef : desktopNavRef;

    return (
      <div className="flex flex-col h-full select-none text-[13.5px] font-sans">
        {/* Hidden M3U file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".m3u,.m3u8,text/plain"
          onChange={handleFileInputChange}
          className="hidden"
          aria-hidden="true"
        />

        {/* Top Header: Hamburger Toggle + Vplay Logo placed right beside it, Clock removed */}
        <div className="px-3.5 pt-3 pb-2 flex items-center justify-start gap-2.5 shrink-0">
          {/* Hamburger Menu Icon */}
          <button
            type="button"
            id={isMobile ? 'btn-mobile-sidebar-toggle' : 'btn-desktop-sidebar-toggle'}
            onClick={isMobile ? onCloseMobile : onToggleCollapse}
            title={isMobile ? 'Close menu' : 'Collapse menu'}
            className="w-9 h-9 rounded-[6px] flex items-center justify-center text-white/90 hover:text-white hover:bg-white/10 active:bg-white/15 cursor-pointer transition-colors"
          >
            {isMobile ? <X className="w-4 h-4 stroke-[1.75]" /> : <Menu className="w-4 h-4 stroke-[1.75]" />}
          </button>

          {/* Logo placed right next to hamburger menu icon */}
          <button
            type="button"
            onClick={() => handleNavClick('/')}
            className="cursor-pointer flex items-center p-0 border-0 bg-transparent hover:opacity-85 active:scale-95 transition-opacity"
            title="Home"
          >
            <img 
              src={LOGO_SRC}
              alt="Vplay" 
              referrerPolicy="no-referrer"
              className="h-6 w-auto object-contain drop-shadow-sm"
            />
          </button>
        </div>

        {/* Unified Navigation List inside common scroll container */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-y-auto pb-4 no-scrollbar space-y-1 px-2.5 font-normal relative"
        >
          {/* Morphing Vertical Blue Accent Bar */}
          <MorphingVerticalIndicator
            containerRef={containerRef}
            currentRoute={currentRoute}
            dependencyKey={`${navItems.length}-${isLiveTvExpanded}-${isFavoritesExpanded}-${currentRoute}`}
          />

          {/* 1. Home Item */}
          <div className="shrink-0">
            <button
              type="button"
              id={isMobile ? 'mobile-nav-home' : 'sidebar-nav-home'}
              data-nav-active={currentRoute === '/' ? 'true' : undefined}
              onClick={() => handleNavClick('/')}
              title="Home"
              className={`sidebar-nav-item w-full h-[38px] flex items-center gap-3.5 px-3 cursor-pointer relative text-left rounded-[6px] transition-colors ${
                currentRoute === '/'
                  ? 'bg-white/[0.08] dark:bg-white/[0.08] text-white font-medium shadow-xs'
                  : 'text-[#cccccc] hover:bg-white/[0.05] hover:text-white'
              }`}
            >
              <Home className="w-4 h-4 stroke-[1.5] shrink-0 text-white" />
              <span className="truncate text-[13.5px]">Home</span>
            </button>
          </div>

          {/* 2. Category Heading: "Navigation & Content" */}
          <div className="px-1.5 pt-2 pb-1 shrink-0">
            <h2 className="text-[#a1a1aa] text-[11px] font-semibold tracking-wider uppercase select-none">
              Navigation & Content
            </h2>
          </div>

          {/* Primary Navigation Items */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isCurrentActive(item.route) && (item.route !== '/' || currentRoute === '/');

            return (
              <div key={item.id} className="w-full">
                <button
                  type="button"
                  id={isMobile ? `mobile-nav-${item.id}` : `sidebar-nav-${item.id}`}
                  data-nav-active={active ? 'true' : undefined}
                  onClick={() => handleNavClick(item.route)}
                  title={item.label}
                  className={`sidebar-nav-item w-full h-[38px] flex items-center justify-between px-3 cursor-pointer relative text-left rounded-[6px] transition-colors ${
                    active
                      ? 'bg-white/[0.08] dark:bg-white/[0.08] text-white font-medium shadow-xs'
                      : 'text-[#cccccc] hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3.5 truncate">
                    <Icon className="w-4 h-4 stroke-[1.5] shrink-0 text-white" />
                    <span className="truncate text-[13.5px]">{item.label}</span>
                  </div>

                  {/* Submenu toggles for Live TV or Favorites */}
                  {item.hasSubmenu && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsLiveTvExpanded(!isLiveTvExpanded);
                      }}
                      className="p-1 hover:bg-white/10 rounded-[4px] cursor-pointer"
                    >
                      {isLiveTvExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                      )}
                    </div>
                  )}

                  {item.hasFavoritesSubmenu && favoriteChannels.length > 0 && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFavoritesExpanded(!isFavoritesExpanded);
                      }}
                      className="p-1 hover:bg-white/10 rounded-[4px] cursor-pointer"
                    >
                      {isFavoritesExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                      )}
                    </div>
                  )}
                </button>

                {/* Live TV Channels Quick Submenu */}
                {item.hasSubmenu && isLiveTvExpanded && (
                  <div className="ml-4 pl-2.5 border-l border-white/10 space-y-0.5 py-1">
                    {channels.slice(0, 8).map((ch) => (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => {
                          handleNavClick(`/live-tv?channel=${ch.slug}`);
                          if (onSelectChannel) onSelectChannel(ch);
                        }}
                        className="w-full h-[30px] flex items-center justify-between px-2.5 rounded-[4px] text-xs text-[#a1a1aa] hover:text-white hover:bg-white/10 cursor-pointer"
                      >
                        <span className="truncate">{`${String(ch.channelNumber || 1).padStart(3, '0')} | ${ch.shortName || ch.name}`}</span>
                        <span className="px-1.5 py-0.2 text-[9px] bg-[#4cc2ff] text-white rounded-[2px] font-bold">
                          Play
                        </span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleNavClick('/live-tv')}
                      className="w-full text-left px-2.5 py-1 text-[11px] text-[#4cc2ff] hover:underline font-normal cursor-pointer rounded-[4px]"
                    >
                      + View all channels
                    </button>
                  </div>
                )}

                {/* Favorites Quick Submenu */}
                {item.hasFavoritesSubmenu && isFavoritesExpanded && (
                  <div className="ml-4 pl-2.5 border-l border-white/10 space-y-0.5 py-1">
                    {favoriteChannels.map((ch) => (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => {
                          handleNavClick(`/live-tv?channel=${ch.slug}`);
                          if (onSelectChannel) onSelectChannel(ch);
                        }}
                        className="w-full h-[30px] flex items-center justify-between px-2.5 rounded-[4px] text-xs text-[#a1a1aa] hover:text-white hover:bg-white/10 cursor-pointer"
                      >
                        <span className="truncate">{`${String(ch.channelNumber || 1).padStart(3, '0')} | ${ch.shortName || ch.name}`}</span>
                        <span className="px-1.5 py-0.2 text-[9px] bg-[#4cc2ff] text-white rounded-[2px] font-bold">
                          Play
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Tools Item that toggles the Tools Flyout */}
          <div className="relative tools-flyout-container">
            <button
              type="button"
              id={isMobile ? 'mobile-nav-tools' : 'sidebar-nav-tools'}
              onClick={() => setIsToolsFlyoutOpen(!isToolsFlyoutOpen)}
              title="Tools"
              className={`sidebar-nav-item w-full h-[38px] flex items-center justify-between px-3 cursor-pointer text-left rounded-[6px] transition-colors ${
                isToolsFlyoutOpen
                  ? 'bg-white/[0.08] text-white font-medium shadow-xs'
                  : 'text-[#cccccc] hover:bg-white/[0.05] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3.5 truncate">
                <Wrench className="w-4 h-4 stroke-[1.5] shrink-0 text-white" />
                <span className="truncate text-[13.5px]">Tools</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${isToolsFlyoutOpen ? 'rotate-90' : ''}`} />
            </button>

            {/* Render Flyout Menu */}
            <AnimatePresence>
              {isToolsFlyoutOpen && renderToolsFlyout(false)}
            </AnimatePresence>
          </div>

          {/* Discord Community Button */}
          <button
            type="button"
            id={isMobile ? 'mobile-nav-discord' : 'sidebar-nav-discord'}
            onClick={() => setIsDiscordModalOpen(true)}
            title="Discord Community"
            className="sidebar-nav-item w-full h-[38px] flex items-center gap-3.5 px-3 text-[#cccccc] hover:bg-white/[0.05] hover:text-white cursor-pointer text-left rounded-[6px] transition-colors"
          >
            <svg className="w-4 h-4 fill-current shrink-0 text-white" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.078.078 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            <span className="truncate text-[13.5px]">Discord Community</span>
          </button>
        </div>

        {/* Bottom Section: Sign In (placed directly above Settings) & Settings */}
        <div className="px-2.5 py-2 shrink-0 border-t border-white/10 mt-auto space-y-1 relative signin-flyout-container">
          {/* Sign In item placed directly ABOVE Settings tab */}
          <div className="relative">
            <button
              type="button"
              id={isMobile ? 'mobile-nav-signin' : 'sidebar-nav-signin'}
              onClick={toggleSignInFlyout}
              title="Sign in"
              className={`sidebar-nav-item signin-toggle-btn w-full h-[38px] flex items-center justify-between px-3 cursor-pointer relative text-left rounded-[6px] transition-colors ${
                isSignInFlyoutOpen
                  ? 'bg-white/[0.12] text-white font-medium shadow-xs'
                  : 'text-[#cccccc] hover:bg-white/[0.05] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3.5 truncate">
                <User className="w-4 h-4 stroke-[1.5] shrink-0 text-white" />
                <span className="truncate text-[13.5px]">
                  {signedInAccount ? signedInAccount : 'Sign in'}
                </span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${isSignInFlyoutOpen ? 'rotate-90' : ''}`} />
            </button>

            {/* Render Flyout Menu for Sign in */}
            <AnimatePresence>
              {isSignInFlyoutOpen && renderSignInFlyout(false)}
            </AnimatePresence>
          </div>

          {/* Bottom Settings Tab Item */}
          <button
            type="button"
            id={isMobile ? 'mobile-nav-settings' : 'sidebar-nav-settings'}
            data-nav-active={currentRoute === '/settings' ? 'true' : undefined}
            onClick={() => handleNavClick('/settings')}
            title="Settings"
            className={`sidebar-nav-item w-full h-[38px] flex items-center gap-3.5 px-3 cursor-pointer relative text-left rounded-[6px] transition-colors ${
              currentRoute === '/settings'
                ? 'bg-white/[0.08] dark:bg-white/[0.08] text-white font-medium shadow-xs'
                : 'text-[#cccccc] hover:bg-white/[0.05] hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4 stroke-[1.5] shrink-0 text-white" />
            <span className="truncate text-[13.5px]">Settings</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 1. Desktop Persistent Sidebar */}
      {settings.dockToSidebar && (
        <aside 
          id="waves-desktop-sidebar"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`hidden md:flex flex-col h-screen bg-[#202020] text-white border-r border-[#2e2e2e] select-none shrink-0 fixed top-0 z-40 overflow-hidden shadow-2xl ${
            settings.sidebarPosition === 'right' ? 'right-0 border-l border-r-0' : 'left-0'
          } ${
            shouldAnimateSidebar ? 'transition-all duration-200 ease-in-out' : 'transition-none'
          } ${
            effectiveCollapsed ? 'w-[48px]' : 'w-[260px]'
          }`}
          style={{
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {!effectiveCollapsed ? (
            renderSidebarBody(false)
          ) : (
            /* Collapsed Windows 10 Sidebar Icon Bar */
            <div 
              ref={collapsedNavRef}
              className="flex flex-col h-full select-none items-center py-2.5 space-y-1 relative"
            >
              <MorphingVerticalIndicator
                containerRef={collapsedNavRef}
                currentRoute={currentRoute}
                dependencyKey={`${navItems.length}-${currentRoute}`}
              />

              {/* Hamburger Button to Expand */}
              <button 
                id="btn-sidebar-expand-toggle"
                type="button"
                onClick={onToggleCollapse} 
                className="w-9 h-9 rounded-[6px] flex items-center justify-center text-white/90 hover:bg-white/10 hover:text-white mb-1.5 cursor-pointer transition-colors"
                title="Expand menu"
              >
                <Menu className="w-4 h-4 stroke-[1.75]" />
              </button>

              {/* Home Icon */}
              <button
                type="button"
                id="sidebar-collapsed-home"
                data-nav-active={currentRoute === '/' ? 'true' : undefined}
                onClick={() => handleNavClick('/')}
                title="Home"
                className={`sidebar-nav-item w-10 h-[38px] rounded-[6px] flex items-center justify-center relative transition-colors cursor-pointer ${
                  currentRoute === '/'
                    ? 'bg-white/[0.08] text-white shadow-xs'
                    : 'text-[#cccccc] hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <Home className="w-4 h-4 stroke-[1.5] text-white" />
              </button>

              {/* Search Icon */}
              <button
                type="button"
                onClick={onOpenSearch}
                title="Search"
                className="sidebar-nav-item w-10 h-[38px] rounded-[6px] flex items-center justify-center text-[#cccccc] hover:bg-white/[0.05] hover:text-white transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4 stroke-[1.5] text-white" />
              </button>

              <div className="w-6 h-[1px] bg-white/10 my-1" />

              {/* Primary Navigation Icons */}
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isCurrentActive(item.route) && (item.route !== '/' || currentRoute === '/');

                return (
                  <button
                    key={item.id}
                    type="button"
                    id={`sidebar-collapsed-${item.id}`}
                    data-nav-active={active ? 'true' : undefined}
                    onClick={() => handleNavClick(item.route)}
                    title={item.label}
                    className={`sidebar-nav-item w-10 h-[38px] rounded-[6px] flex items-center justify-center relative transition-colors cursor-pointer ${
                      active
                        ? 'bg-white/[0.08] text-white shadow-xs'
                        : 'text-[#cccccc] hover:bg-white/[0.05] hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 stroke-[1.5] text-white" />
                  </button>
                );
              })}

              {/* Tools Icon Button with flyout */}
              <div className="relative tools-flyout-container">
                <button
                  type="button"
                  id="sidebar-collapsed-tools"
                  onClick={() => setIsToolsFlyoutOpen(!isToolsFlyoutOpen)}
                  title="Tools"
                  className={`sidebar-nav-item w-10 h-[38px] rounded-[6px] flex items-center justify-center relative transition-colors cursor-pointer ${
                    isToolsFlyoutOpen
                      ? 'bg-white/[0.08] text-white shadow-xs'
                      : 'text-[#cccccc] hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  <Wrench className="w-4 h-4 stroke-[1.5] text-white" />
                </button>

                <AnimatePresence>
                  {isToolsFlyoutOpen && renderToolsFlyout(true)}
                </AnimatePresence>
              </div>

              {/* Bottom Sign In & Settings Icons */}
              <div className="mt-auto pt-2 space-y-1 relative signin-flyout-container">
                {/* Sign In Collapsed Button placed directly above Settings */}
                <div className="relative">
                  <button
                    type="button"
                    id="sidebar-collapsed-signin"
                    onClick={toggleSignInFlyout}
                    title="Sign in"
                    className={`sidebar-nav-item signin-toggle-btn w-10 h-[38px] rounded-[6px] flex items-center justify-center relative transition-colors cursor-pointer ${
                      isSignInFlyoutOpen
                        ? 'bg-white/[0.12] text-white shadow-xs'
                        : 'text-[#cccccc] hover:bg-white/[0.05] hover:text-white'
                    }`}
                  >
                    <User className="w-4 h-4 stroke-[1.5] text-white" />
                  </button>

                  <AnimatePresence>
                    {isSignInFlyoutOpen && renderSignInFlyout(true)}
                  </AnimatePresence>
                </div>

                {/* Bottom Settings Icon */}
                <button
                  type="button"
                  id="sidebar-collapsed-settings"
                  data-nav-active={currentRoute === '/settings' ? 'true' : undefined}
                  onClick={() => handleNavClick('/settings')}
                  title="Settings"
                  className={`sidebar-nav-item w-10 h-[38px] rounded-[6px] flex items-center justify-center relative transition-colors cursor-pointer ${
                    currentRoute === '/settings'
                      ? 'bg-white/[0.08] text-white shadow-xs'
                      : 'text-[#cccccc] hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  <Sliders className="w-4 h-4 stroke-[1.5] text-white" />
                </button>
              </div>
            </div>
          )}
        </aside>
      )}

      {/* 2. Mobile Drawer Navigation */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-50 md:hidden flex"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div 
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
            aria-hidden="true"
          />

          {/* Slide-out Sidebar Drawer */}
          <div 
            id="waves-mobile-sidebar"
            onTouchStart={handleDrawerTouchStart}
            onTouchEnd={handleDrawerTouchEnd}
            className="relative w-[280px] max-w-[85vw] h-full bg-[#202020] text-white border-r border-[#2e2e2e] shadow-2xl flex flex-col z-10"
            style={{
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            {renderSidebarBody(true)}
          </div>
        </div>
      )}

      {/* Discord Welcome Modal */}
      <DiscordWelcomeModal
        isOpen={isDiscordModalOpen}
        onClose={() => setIsDiscordModalOpen(false)}
      />

      {/* Toast Feedback for Sign In Actions */}
      <AnimatePresence>
        {signInToast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-5 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-[1000] px-4 py-2.5 rounded-[6px] bg-[#2d2d2d] border border-[#3e3e3e] shadow-2xl text-xs sm:text-sm text-white flex items-center gap-2.5 pointer-events-none"
          >
            <div className="w-2 h-2 rounded-full bg-[#4cc2ff] shrink-0" />
            <span>{signInToast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
