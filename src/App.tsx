import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { BottomDock } from './components/BottomDock';
import { SpotlightModal } from './components/SpotlightModal';
import { CustomStreamModal } from './components/CustomStreamModal';
import { WelcomeModal } from './components/WelcomeModal';
import { UnderConstructionModal } from './components/UnderConstructionModal';
import { UnsavedSettingsModal } from './components/UnsavedSettingsModal';
import { HelpModal } from './components/HelpModal';
import { NewsSummaryModal } from './components/NewsSummaryModal';
import { FindWordsBar } from './components/FindWordsBar';
import { AddStreamModal } from './components/AddStreamModal';
import { TextToSpeechPlayer } from './components/TextToSpeechPlayer';
import { SplashScreen } from './components/SplashScreen';
import { NativeKeyboard } from './components/NativeKeyboard';
import { NativeKeyboardProvider } from './context/NativeKeyboardContext';
import { NotesProvider } from './context/NotesContext';
import { StickyNoteWidget } from './components/StickyNoteWidget';
import { TabLoadingScreen } from './components/TabLoadingScreen';
import { AppScrollbar } from './components/AppScrollbar';
import { HomePreview } from './pages/HomePreview';
import { About } from './pages/About';
import { LiveTV } from './pages/LiveTV';
import { WatchPreview } from './pages/WatchPreview';
import { TestChannels } from './pages/TestChannels';
import { News } from './pages/News';
import { Article } from './pages/Article';
import { Channels } from './pages/Channels';
import { Favorites } from './pages/Favorites';
import { Settings } from './pages/Settings';
import { ImmersiveSearch } from './pages/ImmersiveSearch';
import { NotesApp } from './pages/NotesApp';
import { Craftmine } from './pages/Craftmine';
import { Photopea } from './pages/Photopea';
import { Updates } from './pages/Updates';
import { Gallery } from './pages/Gallery';
import { Draws } from './pages/Draws';
import { VLC } from './pages/VLC';
import { Auth } from './pages/Auth';
import { Feedback } from './pages/Feedback';
import { WinUI3 } from './pages/WinUI3';
import { CHANNELS_DATA } from './data/channels';
import { NEWS_DATA } from './data/news';
import { Channel, NewsArticle } from './types';
import { useSettings } from './hooks/useSettings';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

export default function App() {
  const { settings, draftSettings, hasChanges, applyDraftSettings, discardDraftSettings } = useSettings();

  // Tooltip & navigation block for unsaved settings
  const [showUnsavedTooltip, setShowUnsavedTooltip] = useState(false);
  const unsavedTooltipTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerUnsavedTooltip = useCallback(() => {
    setShowUnsavedTooltip(true);
    if (unsavedTooltipTimerRef.current) clearTimeout(unsavedTooltipTimerRef.current);
    unsavedTooltipTimerRef.current = setTimeout(() => {
      setShowUnsavedTooltip(false);
    }, 4500);
  }, []);

  // When changes are saved or cleared, hide tooltip
  useEffect(() => {
    if (!hasChanges) {
      setShowUnsavedTooltip(false);
    }
  }, [hasChanges]);

  useEffect(() => {
    return () => {
      if (unsavedTooltipTimerRef.current) clearTimeout(unsavedTooltipTimerRef.current);
    };
  }, []);

  // Navigation Route State (supports browser pathname or internal state)
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.pathname === '/' ? '/' : window.location.pathname;
  });
  const [routeState, setRouteState] = useState<any>(null);
  const previousRouteRef = useRef<string>('/');
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [tabLoadCount, setTabLoadCount] = useState(0);
  const tabLoadingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (tabLoadingTimerRef.current) clearTimeout(tabLoadingTimerRef.current);
    };
  }, []);



  // Tab-specific search state for Floating Search Bar
  const [tabSearchQueries, setTabSearchQueries] = useState<Record<string, string>>({});
  const currentTabSearchQuery = tabSearchQueries[currentRoute] || '';
  const handleTabSearchChange = (query: string) => {
    setTabSearchQueries((prev) => ({
      ...prev,
      [currentRoute]: query
    }));
  };

  // Channels State (base channels + imported channels from localStorage)
  const [channels, setChannels] = useState<Channel[]>(() => {
    const saved = localStorage.getItem('waves_custom_channels');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return [...CHANNELS_DATA, ...parsed];
      } catch {
        return CHANNELS_DATA;
      }
    }
    return CHANNELS_DATA;
  });

  // Current Active Channel for Live TV Player
  const [currentChannel, setCurrentChannel] = useState<Channel>(() => {
    // Check if URL has ?channel=slug
    const urlParams = new URLSearchParams(window.location.search);
    const channelSlug = urlParams.get('channel');
    if (channelSlug) {
      const matched = CHANNELS_DATA.find((c) => c.slug === channelSlug);
      if (matched) return matched;
    }
    try {
      const savedRecentId = localStorage.getItem('vplay_recent_channel_id');
      if (savedRecentId) {
        const found = CHANNELS_DATA.find((c) => c.id === savedRecentId);
        if (found) return found;
      }
    } catch {}
    return CHANNELS_DATA[0];
  });

  // Track recent channel in localStorage
  useEffect(() => {
    if (currentChannel?.id) {
      try {
        localStorage.setItem('vplay_recent_channel_id', currentChannel.id);
      } catch {}
    }
  }, [currentChannel]);

  // Modals state
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [isSplashFinished, setIsSplashFinished] = useState(false);
  const [isUnderConstructionOpen, setIsUnderConstructionOpen] = useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isCustomStreamModalOpen, setIsCustomStreamModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isNewsSummaryOpen, setIsNewsSummaryOpen] = useState(false);
  const [summarizeArticle, setSummarizeArticle] = useState<NewsArticle>(NEWS_DATA[0]);
  const [isTtsOpen, setIsTtsOpen] = useState(false);
  const [ttsArticle, setTtsArticle] = useState<NewsArticle>(NEWS_DATA[0]);
  const [isFindWordsOpen, setIsFindWordsOpen] = useState(false);
  const [isAddStreamOpen, setIsAddStreamOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const handleOpenOfficeTool = (tool: string) => {
    if (tool === 'notes' || tool === 'write' || tool === 'present' || tool === 'table') {
      navigate('/notes');
    } else {
      navigate(`/${tool}`);
    }
  };
  const [articleFontSize, setArticleFontSize] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('vplay_font_size');
      return saved ? parseInt(saved, 10) : 16;
    } catch {
      return 16;
    }
  });

  const handleFontSizeChange = (size: number) => {
    setArticleFontSize(size);
    try {
      localStorage.setItem('vplay_font_size', String(size));
    } catch {}
  };

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isInkCanvasChromeVisible, setIsInkCanvasChromeVisible] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('waves_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('waves_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Edge swipe gesture: vuốt từ cạnh trái sang để mở sidebar
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let isTrackingEdgeSwipe = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      // Swipe originates from within 45px of the left screen edge
      if (touch.clientX <= 45) {
        startX = touch.clientX;
        startY = touch.clientY;
        isTrackingEdgeSwipe = true;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isTrackingEdgeSwipe) return;
      isTrackingEdgeSwipe = false;
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;

      // Swiped right with at least 40px, predominantly horizontal
      if (deltaX > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.1) {
        setIsMobileSidebarOpen(true);
        if (isSidebarCollapsed) {
          setIsSidebarCollapsed(false);
          try {
            localStorage.setItem('waves_sidebar_collapsed', 'false');
          } catch {}
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isSidebarCollapsed]);

  // Determine effective sidebar width for page adaptation
  const isEffectiveCollapsed = settings.autoHideSidebar || isSidebarCollapsed;
  const isInkCanvasEditor = currentRoute.startsWith('/draws/');

  useEffect(() => {
    if (!isInkCanvasEditor) return;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    const handlePointerMove = (event: MouseEvent) => {
      const nearEdge = event.clientY <= 48 || event.clientY >= window.innerHeight - 48 || event.clientX <= 48;
      if (nearEdge) {
        setIsInkCanvasChromeVisible(true);
        if (hideTimer) clearTimeout(hideTimer);
        hideTimer = setTimeout(() => setIsInkCanvasChromeVisible(false), 900);
      }
    };
    window.addEventListener('mousemove', handlePointerMove);
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [isInkCanvasEditor]);

  useEffect(() => {
    setIsInkCanvasChromeVisible(false);
  }, [isInkCanvasEditor, currentRoute]);

  // Gallery Fullscreen Viewer: auto-hide Sidebar & TopBar when viewing photos/videos/files
  const [isGalleryViewerOpen, setIsGalleryViewerOpen] = useState(false);

  useEffect(() => {
    const handleGalleryLightbox = (e: any) => {
      setIsGalleryViewerOpen(Boolean(e.detail?.isOpen));
    };
    window.addEventListener('vplay:gallery:lightbox_toggle', handleGalleryLightbox);
    return () => {
      window.removeEventListener('vplay:gallery:lightbox_toggle', handleGalleryLightbox);
    };
  }, []);

  useEffect(() => {
    if (currentRoute !== '/gallery') {
      setIsGalleryViewerOpen(false);
    }
  }, [currentRoute]);

  const [isUnsavedSettingsModalOpen, setIsUnsavedSettingsModalOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<{ path: string; state?: any } | null>(null);

  // Perform actual navigation
  const executeNavigation = useCallback((path: string, state?: any) => {
    const targetRoute = path.includes('?') ? path.split('?')[0] : path;
    const isDifferentTab = targetRoute !== currentRoute;

    if (currentRoute !== '/search') {
      previousRouteRef.current = currentRoute;
    }

    setRouteState(state);
    
    // Parse query params if any
    if (path.includes('?')) {
      const [parsedBaseRoute, query] = path.split('?');
      const params = new URLSearchParams(query);
      const chSlug = params.get('channel');
      if (chSlug) {
        const matched = channels.find((c) => c.slug === chSlug);
        if (matched) setCurrentChannel(matched);
      }
      window.history.pushState(null, '', path);
      setCurrentRoute(parsedBaseRoute);
    } else {
      window.history.pushState(null, '', path);
      setCurrentRoute(path);
    }

    // Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Tab Splash screen: displays centered tab icon with spinning ring for 1 second on tab switch
    if (isDifferentTab) {
      if (tabLoadingTimerRef.current) clearTimeout(tabLoadingTimerRef.current);
      setIsTabLoading(true);
      tabLoadingTimerRef.current = setTimeout(() => {
        setIsTabLoading(false);
        setTabLoadCount((c) => c + 1);
      }, 1000);
    }
  }, [channels, currentRoute]);

  // Navigation handler
  const navigate = useCallback((path: string, state?: any) => {
    // If currently on settings and there are unsaved changes, prompt before leaving
    if (currentRoute === '/settings' && hasChanges) {
      const isStillSettings = path === '/settings' || path.startsWith('/settings?') || path.startsWith('/settings#');
      if (!isStillSettings) {
        setPendingNavigation({ path, state });
        setIsUnsavedSettingsModalOpen(true);
        return;
      }
    }

    executeNavigation(path, state);
  }, [currentRoute, hasChanges, executeNavigation]);

  const handleSaveAndNavigate = () => {
    applyDraftSettings();
    setIsUnsavedSettingsModalOpen(false);
    if (pendingNavigation) {
      executeNavigation(pendingNavigation.path, pendingNavigation.state);
      setPendingNavigation(null);
    }
  };

  const handleDiscardAndNavigate = () => {
    discardDraftSettings();
    setIsUnsavedSettingsModalOpen(false);
    if (pendingNavigation) {
      executeNavigation(pendingNavigation.path, pendingNavigation.state);
      setPendingNavigation(null);
    }
  };

  const handleCancelNavigate = () => {
    setIsUnsavedSettingsModalOpen(false);
    setPendingNavigation(null);
  };

  // Open search handler - opens new search box on TopBar
  const handleOpenSearch = useCallback(() => {
    window.dispatchEvent(new CustomEvent('vplay:focus-topbar-search'));
  }, []);

  // Global search shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleGlobalSearchKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('vplay:focus-topbar-search'));
      }
    };
    window.addEventListener('keydown', handleGlobalSearchKey);
    return () => window.removeEventListener('keydown', handleGlobalSearchKey);
  }, []);

  // Global Customizable Keybinds (Alt+1: Home, Alt+2: Search box mới, Alt+3: Tools menu, Alt+4: Settings, Alt+5: Recent Channel)
  useKeyboardShortcuts({
    onHome: useCallback(() => {
      navigate('/');
    }, [navigate]),
    onSearch: useCallback(() => {
      window.dispatchEvent(new CustomEvent('vplay:focus-topbar-search'));
    }, []),
    onTools: useCallback(() => {
      window.dispatchEvent(new CustomEvent('vone:toggle-tools'));
      window.dispatchEvent(new CustomEvent('vplay:toggle-tools'));
    }, []),
    onSettings: useCallback(() => {
      navigate('/settings');
    }, [navigate]),
    onRecentChannel: useCallback(() => {
      let targetChannel = currentChannel;
      try {
        const savedId = localStorage.getItem('vplay_recent_channel_id');
        if (savedId) {
          const found = channels.find((c) => c.id === savedId);
          if (found) targetChannel = found;
        }
      } catch {}
      if (targetChannel) {
        setCurrentChannel(targetChannel);
        navigate(`/live-tv?channel=${targetChannel.slug}`);
      }
    }, [currentChannel, channels, navigate])
  });

  // Handle browser back / forward navigation
  useEffect(() => {
    const handlePopState = () => {
      if (currentRoute === '/settings' && hasChanges) {
        window.history.pushState(null, '', '/settings');
        setPendingNavigation({ path: window.location.pathname });
        setIsUnsavedSettingsModalOpen(true);
        return;
      }
      const path = window.location.pathname;
      const isTabSwitch = path !== currentRoute;
      const params = new URLSearchParams(window.location.search);
      const chSlug = params.get('channel');
      if (chSlug) {
        const matched = channels.find((c) => c.slug === chSlug);
        if (matched) setCurrentChannel(matched);
      }
      setCurrentRoute(path);

      if (isTabSwitch) {
        if (tabLoadingTimerRef.current) clearTimeout(tabLoadingTimerRef.current);
        setIsTabLoading(true);
        tabLoadingTimerRef.current = setTimeout(() => {
          setIsTabLoading(false);
          setTabLoadCount((c) => c + 1);
        }, 1000);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [channels, currentRoute, hasChanges, triggerUnsavedTooltip]);

  // Handle page reload / unload when settings are unsaved
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentRoute === '/settings' && hasChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentRoute, hasChanges]);

  // Handle playing a custom single channel
  const handlePlayCustomChannel = (newChannel: Channel) => {
    setChannels((prev) => {
      const exists = prev.some((c) => c.id === newChannel.id);
      if (exists) return prev;
      const updated = [newChannel, ...prev];
      return updated;
    });
    setCurrentChannel(newChannel);
    navigate(`/live-tv?channel=${newChannel.slug}`);
  };

  // Handle importing a list of M3U channels
  const handleImportPlaylist = (importedList: Channel[]) => {
    setChannels((prev) => {
      const updated = [...importedList, ...prev];
      try {
        localStorage.setItem('waves_custom_channels', JSON.stringify(importedList));
      } catch {}
      return updated;
    });
    if (importedList.length > 0) {
      setCurrentChannel(importedList[0]);
      navigate(`/live-tv?channel=${importedList[0].slug}`);
    }
  };

  // Render Page Content based on currentRoute
  const renderContent = () => {
    if (currentRoute.startsWith('/draws/')) return <Draws navigate={navigate} />;

    // Route matching for news detail: /news/:slug
    if (currentRoute.startsWith('/news/')) {
      const slug = currentRoute.replace('/news/', '');
      return <Article slug={slug} navigate={navigate} fontSize={articleFontSize} />;
    }

    switch (currentRoute) {
      case '/':
      case '/home':
      case '/home-preview':
        return <HomePreview channels={channels} onSelectChannel={setCurrentChannel} navigate={navigate} />;

      case '/live-tv':
      case '/watch-preview':
        return (
          <LiveTV
            currentChannel={currentChannel}
            onSelectChannel={setCurrentChannel}
            channels={channels}
            onOpenCustomStreamModal={() => setIsCustomStreamModalOpen(true)}
            searchQuery={currentTabSearchQuery}
            onSearchChange={handleTabSearchChange}
            navigate={navigate}
          />
        );

      case '/test':
        return (
          <TestChannels
            currentChannel={currentChannel}
            onSelectChannel={setCurrentChannel}
            channels={channels}
            onOpenCustomStreamModal={() => setIsCustomStreamModalOpen(true)}
            searchQuery={currentTabSearchQuery}
            onSearchChange={handleTabSearchChange}
          />
        );

      case '/news':
      case '/updates':
        return (
          <News
            navigate={navigate}
            searchQuery={currentTabSearchQuery}
            onSearchChange={handleTabSearchChange}
            onOpenUpdate={() => setIsUpdating(true)}
          />
        );

      case '/channels':
        return (
          <Channels
            channels={channels}
            onSelectChannel={setCurrentChannel}
            navigate={navigate}
            onOpenCustomStreamModal={() => setIsCustomStreamModalOpen(true)}
            searchQuery={currentTabSearchQuery}
            onSearchChange={handleTabSearchChange}
          />
        );

      case '/favorites':
        return (
          <Favorites
            channels={channels}
            onSelectChannel={setCurrentChannel}
            navigate={navigate}
            searchQuery={currentTabSearchQuery}
            onSearchChange={handleTabSearchChange}
          />
        );

      case '/about':
        return <About />;

      case '/auth':
        return <Auth navigate={navigate} />;

      case '/feedback':
        return <Feedback navigate={navigate} />;

      case '/winui-3':
        return <WinUI3 />;

      case '/settings':
        return (
          <Settings
            searchQuery={currentTabSearchQuery}
            onSearchChange={handleTabSearchChange}
            onOpenUpdate={() => setIsUpdating(true)}
            onOpenOfficeTool={handleOpenOfficeTool}
          />
        );

      case '/search':
        return (
          <ImmersiveSearch
            navigate={navigate}
            onSelectChannel={setCurrentChannel}
            onClose={() => {
              const target = previousRouteRef.current && previousRouteRef.current !== '/search' ? previousRouteRef.current : '/';
              navigate(target);
            }}
          />
        );

      case '/notes':
      case '/write':
      case '/present':
      case '/table':
        return <NotesApp navigate={navigate} />;

      case '/gallery':
        return <Gallery navigate={navigate} searchQuery={currentTabSearchQuery} routeState={routeState} />;

      case '/draws':
        return <Draws navigate={navigate} />;

      case '/screenbug':
      case '/screenbox':
      case '/vlc':
        return <VLC navigate={navigate} />;

      case '/craftmine':
        return <Craftmine />;

      case '/photopea':
        return <Photopea />;

      default:
        return <HomePreview channels={channels} onSelectChannel={setCurrentChannel} navigate={navigate} />;
    }
  };

  const isOfficeRoute = currentRoute === '/notes' || currentRoute === '/write';

  return (
    <NativeKeyboardProvider>
      <NotesProvider>
        <div
        data-immersive-sidebar={settings.immersiveSidebar}
      data-sidebar-position={settings.sidebarPosition}
      className={`min-h-screen ${settings.superDarkMode ? 'bg-black' : 'bg-[#f9f9f9] dark:bg-[#1b1f24]'} text-[#111827] dark:text-[#E0E0E6] flex font-sans selection:bg-[#4cc2ff] selection:text-black relative`}
    >
      {/* Fixed atmospheric cosmic background matching custom nebula gradient */}
      <div 
        id="fixed-app-background-solid" 
        className={`fixed inset-0 pointer-events-none -z-50 ${settings.superDarkMode ? '!bg-black' : ''}`} 
        aria-hidden="true" 
      />

      {isInkCanvasEditor && !isInkCanvasChromeVisible && <><div onMouseEnter={() => setIsInkCanvasChromeVisible(true)} className="fixed left-0 top-0 bottom-0 w-3 z-[200]" /><div onMouseEnter={() => setIsInkCanvasChromeVisible(true)} className="fixed left-0 top-0 right-0 h-3 z-[200]" /><div onMouseEnter={() => setIsInkCanvasChromeVisible(true)} className="fixed left-0 bottom-0 right-0 h-3 z-[200]" /></>}

      {/* Sidebar Navigation (Desktop + Mobile Drawer) */}
      {(settings.navigationMode === 'sidebar' || isMobileSidebarOpen) && (!isInkCanvasEditor || isInkCanvasChromeVisible) && !isGalleryViewerOpen && (
        <Sidebar
          currentRoute={currentRoute}
          navigate={navigate}
          onOpenSearch={handleOpenSearch}
          onSelectChannel={setCurrentChannel}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          channels={channels}
          currentChannel={currentChannel}
          onOpenHelp={() => setIsHelpModalOpen(true)}
          onOpenDiscord={() => setIsWelcomeModalOpen(true)}
          onOpenSummarize={(art) => {
            setSummarizeArticle(art);
            setIsNewsSummaryOpen(true);
          }}
          onOpenTextToSpeech={(art) => {
            setTtsArticle(art);
            setIsTtsOpen(true);
          }}
          onOpenFindWords={() => setIsFindWordsOpen(true)}
          onOpenAddStream={() => setIsAddStreamOpen(true)}
          onImportChannels={handleImportPlaylist}
          onOpenNotifications={() => setIsUnderConstructionOpen(true)}
          fontSize={articleFontSize}
          onChangeFontSize={handleFontSizeChange}
          onOpenUpdate={() => setIsUpdating(true)}
          onOpenOfficeTool={handleOpenOfficeTool}
          isSplashFinished={isSplashFinished}
        />
      )}

      {/* Main App Container */}
      <div className={`flex-1 flex flex-col min-w-0 min-h-screen transition-[padding] duration-300 ease-in-out bg-[#f3f3f3] dark:bg-[#1b1f24] ${
        isInkCanvasEditor || isGalleryViewerOpen
          ? 'md:pl-0 md:pr-0 pb-0'
          : settings.navigationMode === 'topbar'
          ? 'md:pl-0 md:pr-0 pb-10'
          : !settings.dockToSidebar || settings.navigationMode !== 'sidebar'
            ? 'md:pl-0 md:pr-0 pb-20'
            : settings.sidebarPosition === 'right'
              ? isEffectiveCollapsed
                ? 'md:pr-[48px]'
                : 'md:pr-[260px]'
              : isEffectiveCollapsed
                ? 'md:pl-[48px]'
                : 'md:pl-[260px]'
      }`}>
        {/* TopBar Header - hidden on an Ink Canvas sheet until the top edge is hovered or when Gallery media viewer is open */}
        {(!isInkCanvasEditor || isInkCanvasChromeVisible) && !isGalleryViewerOpen && <TopBar
          currentRoute={currentRoute}
          navigate={navigate}
          tabSearchQuery={currentTabSearchQuery}
          onTabSearchChange={handleTabSearchChange}
          onOpenSearch={handleOpenSearch}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          currentChannel={currentChannel}
          channels={channels}
          onSelectChannel={setCurrentChannel}
          onOpenHelp={() => setIsHelpModalOpen(true)}
          onOpenDiscord={() => setIsWelcomeModalOpen(true)}
          onOpenSummarize={(art) => {
            setSummarizeArticle(art);
            setIsNewsSummaryOpen(true);
          }}
          onOpenTextToSpeech={(art) => {
            setTtsArticle(art);
            setIsTtsOpen(true);
          }}
          onOpenFindWords={() => {
            setIsFindWordsOpen(true);
          }}
          onOpenAddStream={() => setIsAddStreamOpen(true)}
          onImportChannels={handleImportPlaylist}
          onOpenNotifications={() => setIsUnderConstructionOpen(true)}
          fontSize={articleFontSize}
          onChangeFontSize={handleFontSizeChange}
          showUnsavedTooltip={showUnsavedTooltip}
          onDismissUnsavedTooltip={() => setShowUnsavedTooltip(false)}
        />}

        {/* Dynamic Page Content with smooth slide-up transition - Bo cong 10px góc trên trái ở desktop, không bo ở mobile */}
        <main className={`main-tab-page flex-1 w-full mx-auto rounded-tl-none md:rounded-tl-[10px] rounded-tr-none rounded-br-none rounded-bl-none overflow-hidden bg-[#f9f9f9] dark:bg-[#282c31] ${
          currentRoute === '/' || currentRoute === '/home' || isOfficeRoute || currentRoute === '/craftmine' || currentRoute === '/photopea' || currentRoute === '/vlc' || currentRoute === '/screenbox' || currentRoute === '/screenbug' || currentRoute === '/gallery' || currentRoute === '/draws' || currentRoute.startsWith('/draws/')
            ? 'p-0 max-w-none pt-0' 
            : 'px-4 sm:px-6 md:px-8 py-5 max-w-7xl'
        } ${
          settings.navigationMode === 'floaty' && !isOfficeRoute
            ? 'pb-28 sm:pb-32'
            : ''
        }`}>
          {/* Dynamic Page Content with 1-second splash screen transition on tab switch */}
          {isTabLoading ? (
            <div
              key={`tab-loading-${currentRoute}`}
              className="w-full flex-1 flex flex-col items-center justify-center min-h-[60vh] sm:min-h-[70vh]"
            >
              <TabLoadingScreen route={currentRoute} />
            </div>
          ) : (
            <div
              key={`tab-loaded-${currentRoute}-${tabLoadCount}`}
              className={`tab-element-slide-up-container w-full h-full rounded-tl-none md:rounded-tl-[10px] rounded-tr-none rounded-br-none rounded-bl-none overflow-hidden ${
                settings.pageAnimation === 'zoomIn' ? 'page-anim-zoom origin-center' : ''
              }`}
            >
              {renderContent()}
            </div>
          )}
        </main>

      </div>

      {/* Floaty bar navigation (Tab View) */}
      {settings.navigationMode === 'floaty' && !isGalleryViewerOpen && (
        <BottomDock
          currentRoute={currentRoute}
          navigate={navigate}
          currentChannel={currentChannel}
          channels={channels}
          onOpenSearch={handleOpenSearch}
          onOpenHelp={() => setIsHelpModalOpen(true)}
          onOpenDiscord={() => setIsWelcomeModalOpen(true)}
          onOpenSummarize={(art) => {
            setSummarizeArticle(art);
            setIsNewsSummaryOpen(true);
          }}
          onOpenTextToSpeech={(art) => {
            setTtsArticle(art);
            setIsTtsOpen(true);
          }}
          onOpenFindWords={() => {
            setIsFindWordsOpen(true);
          }}
          onOpenAddStream={() => setIsAddStreamOpen(true)}
          onImportChannels={handleImportPlaylist}
          fontSize={articleFontSize}
          onChangeFontSize={handleFontSizeChange}
          searchQuery={currentTabSearchQuery}
          onSearchChange={handleTabSearchChange}
          onOpenSpotlight={() => setIsSpotlightOpen(true)}
          onOpenOfficeTool={handleOpenOfficeTool}
        />
      )}

      {/* Global Modals */}
      <SpotlightModal
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
        navigate={navigate}
        onSelectChannel={setCurrentChannel}
      />

      {/* Unsaved Settings Confirmation Modal */}
      <UnsavedSettingsModal
        isOpen={isUnsavedSettingsModalOpen}
        onSave={handleSaveAndNavigate}
        onDiscard={handleDiscardAndNavigate}
        onCancel={handleCancelNavigate}
      />

      <CustomStreamModal
        isOpen={isCustomStreamModalOpen}
        onClose={() => setIsCustomStreamModalOpen(false)}
        onPlayCustomChannel={handlePlayCustomChannel}
        onImportPlaylist={handleImportPlaylist}
      />

      {/* Help Modal */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      {/* News Summary Modal */}
      <NewsSummaryModal
        isOpen={isNewsSummaryOpen}
        onClose={() => setIsNewsSummaryOpen(false)}
        article={summarizeArticle}
      />

      {/* Text to Speech Floating Player */}
      <TextToSpeechPlayer
        isOpen={isTtsOpen}
        onClose={() => setIsTtsOpen(false)}
        article={ttsArticle}
      />

      {/* In-Article / News Word Finder */}
      <FindWordsBar
        isOpen={isFindWordsOpen}
        onClose={() => setIsFindWordsOpen(false)}
      />

      {/* Quick Add Stream Modal Dialog (Tên luồng, Địa chỉ luồng) */}
      <AddStreamModal
        isOpen={isAddStreamOpen}
        onClose={() => setIsAddStreamOpen(false)}
        onAddStream={handlePlayCustomChannel}
      />

      {/* Startup / Refresh Welcome Modal */}
      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={() => setIsWelcomeModalOpen(false)}
      />

      {/* Notifications / Under Construction Modal */}
      <UnderConstructionModal
        isOpen={isUnderConstructionOpen}
        onClose={() => setIsUnderConstructionOpen(false)}
      />

      {/* Floating Movable Sticky Note Widget */}
      {!isGalleryViewerOpen && <StickyNoteWidget onNavigateNotes={() => navigate('/notes')} />}

      {/* Windows 11 Fluent In-App Custom Scroller Bar */}
      <AppScrollbar
        currentRoute={currentRoute}
        isGalleryViewerOpen={isGalleryViewerOpen}
        isTopBarVisible={(!isInkCanvasEditor || isInkCanvasChromeVisible) && !isGalleryViewerOpen}
      />

      {/* App Native Virtual Keyboard for Touch Devices */}
      <NativeKeyboard />

      {/* Startup Splash Screen (3 seconds) */}
      <SplashScreen duration={3000} onFinish={() => setIsSplashFinished(true)} />

      {/* Update Sparkle Splash Screen (1 minute: 60s) */}
      {isUpdating && (
        <SplashScreen
          duration={60000}
          subtitle="Sparkle needs an update - Working on it"
          onFinish={() => setIsUpdating(false)}
        />
      )}
    </div>
      </NotesProvider>
    </NativeKeyboardProvider>
  );
}
