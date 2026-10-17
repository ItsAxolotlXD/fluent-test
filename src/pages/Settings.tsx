import React, { useState, useEffect } from 'react';
import { 
  Type, 
  X,
  RotateCcw,
  AlertCircle,
  Tv,
  ChevronDown,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings, FONT_SCALE_CONFIG, SystemSettings } from '../hooks/useSettings';
import { SfCheckmark } from '../components/SfCheckmark';
import { KEYBIND_DEFINITIONS, DEFAULT_KEYBINDS, eventToKeyString, validateKeybind } from '../utils/keybinds';
import { KeybindAction } from '../types';

export type SettingsCategoryId = 
  | 'settings-section-experimental'
  | 'settings-section-interface'
  | 'settings-section-accessibility'
  | 'settings-section-tools'
  | 'settings-section-version';

interface SettingsProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onOpenUpdate?: () => void;
  onOpenOfficeTool?: (tool: string) => void;
}

// Staggered slide up variant for cascading entrance animation from top to bottom
const slideUpVariant = {
  hidden: { opacity: 0, y: 22 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.52,
      ease: [0.16, 1, 0.3, 1],
      delay: Math.min(i * 0.046, 1.1),
    },
  }),
};

export const Settings: React.FC<SettingsProps> = ({
  searchQuery = '',
  onOpenUpdate,
  onOpenOfficeTool
}) => {
  const { 
    draftSettings, 
    updateDraftSetting 
  } = useSettings();

  const [showApplyToast, setShowApplyToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Insider Flags collapsed by default as requested
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({
    'settings-section-experimental': true,
  });

  const [isLightModeUnlockOpen, setIsLightModeUnlockOpen] = useState(false);
  const [lightModeUnlockCode, setLightModeUnlockCode] = useState('');
  const [lightModeUnlockError, setLightModeUnlockError] = useState('');
  const [editingKeybindId, setEditingKeybindId] = useState<KeybindAction | null>(null);
  const [keybindError, setKeybindError] = useState<{ id: KeybindAction; message: string } | null>(null);

  const toggleCategoryCollapse = (catId: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const isCategoryCollapsed = (catId: string) => {
    if (searchQuery.trim()) return false;
    return Boolean(collapsedCategories[catId]);
  };

  const updateDraft = <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => {
    updateDraftSetting(key, value);
    if (key === 'superDarkMode') {
      if (value) {
        document.documentElement.classList.add('super-dark');
        document.body?.classList.add('super-dark');
      } else {
        document.documentElement.classList.remove('super-dark');
        document.body?.classList.remove('super-dark');
      }
    }
    if (key === 'theme') {
      if (value === 'light') {
        document.documentElement.classList.add('light-mode');
        document.documentElement.classList.remove('dark');
        document.body?.classList.add('light-mode');
      } else {
        document.documentElement.classList.remove('light-mode');
        document.documentElement.classList.add('dark');
        document.body?.classList.remove('light-mode');
      }
    }
    if (key === 'disableShinyOutline') {
      if (value) {
        document.documentElement.classList.add('no-shiny-outline');
        document.body?.classList.add('no-shiny-outline');
      } else {
        document.documentElement.classList.remove('no-shiny-outline');
        document.body?.classList.remove('no-shiny-outline');
      }
    }
  };

  useEffect(() => {
    const handleAppliedEvent = () => {
      setToastMessage('Đã lưu các cài đặt thành công!');
      setShowApplyToast(true);
      setTimeout(() => setShowApplyToast(false), 2400);
    };
    window.addEventListener('settings-applied-toast', handleAppliedEvent);
    return () => window.removeEventListener('settings-applied-toast', handleAppliedEvent);
  }, []);

  // Ordered categories: Insider experiments -> Appearance -> Accessibility -> Tools -> Updates
  const navCategories = [
    { id: 'settings-section-experimental', label: 'Insider experiments', iconSrc: '/icons/settings/insider.png' },
    { id: 'settings-section-interface', label: 'Appearance', iconSrc: '/icons/settings/appearance.png' },
    { id: 'settings-section-accessibility', label: 'Accessibility', iconSrc: '/icons/settings/accessibility.png' },
    { id: 'settings-section-tools', label: 'Tools', iconSrc: '/icons/settings/tools.png' },
    { id: 'settings-section-version', label: 'Updates', iconSrc: '/icons/settings/updates.png' },
  ];

  const [activeNavSection, setActiveNavSection] = useState<string>('settings-section-experimental');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible?.target?.id) {
          setActiveNavSection(visible.target.id);
        }
      },
      { rootMargin: '-15% 0px -65% 0px', threshold: 0.05 }
    );

    navCategories.forEach((cat) => {
      const el = document.getElementById(cat.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Search filter helper
  const query = searchQuery.trim().toLowerCase();
  const matchesSearch = (texts: (string | undefined)[]) => {
    if (!query) return true;
    return texts.some((t) => t && t.toLowerCase().includes(query));
  };

  const matchesExperimental = 
    matchesSearch(['Insider experiments', 'Insider Flags', 'thử nghiệm', 'native keyboard', 'bàn phím ảo', 'immersive search', 'fluent icons', '3d icons']);
  const matchesInterface = 
    matchesSearch(['Appearance', 'Interface', 'giao diện', 'chế độ ứng dụng', 'ban ngày', 'ban đêm', 'light', 'dark', 'thanh điều hướng', 'navigation', 'side view', 'top view', 'tab view', 'thu phóng giao diện', 'font', 'vị trí thanh bên', 'siêu chế độ tối', 'super dark']);
  const matchesAccessibility = 
    matchesSearch(['Accessibility', 'trợ năng', 'hover to expand', 'page loading', 'tải trang', 'load pages sequentially', 'bàn phím số', 'clipboard', 'âm bàn phím', 'keyboard sound', 'tổ hợp phím', 'phím tắt', 'keybinds']);
  const matchesTools = 
    matchesSearch(['Tools', 'công cụ', 'tỉ lệ khung hình', 'aspect ratio', '16:9', '4:3', 'tự động ẩn side view', 'auto hide', 'sparkle notes', 'ghi chú']);
  const matchesVersion = 
    matchesSearch(['Updates', 'thông tin phiên bản', 'cập nhật', 'software update', 'build', 'test sparkle', 'update sparkle']);

  const hasAnyMatch = 
    !query || 
    matchesExperimental ||
    matchesInterface || 
    matchesAccessibility || 
    matchesTools || 
    matchesVersion;

  // Global staggered element counter for cascading animation
  let elementIndex = 0;

  return (
    <motion.div
      id="settings-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="settings-page-wrapper w-full max-w-5xl mx-auto pb-28 pt-2 px-4 sm:px-6 select-none space-y-6"
    >
      {/* Top Header with updated description */}
      <motion.div 
        variants={slideUpVariant}
        initial="hidden"
        animate="visible"
        custom={elementIndex++}
        className="pb-3 border-none bg-transparent"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] dark:text-white tracking-tight">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
          Customize your Sparkle experience your way
        </p>
      </motion.div>

      {/* Quick Navigation Category Pills */}
      {!query && (
        <motion.nav 
          variants={slideUpVariant}
          initial="hidden"
          animate="visible"
          custom={elementIndex++}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 bg-transparent" 
          aria-label="Settings Categories"
        >
          {navCategories.map((cat) => {
            const isActive = activeNavSection === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveNavSection(cat.id);
                  const el = document.getElementById(cat.id);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className={`px-3 py-1.5 rounded-[6px] text-xs font-normal transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer select-none border-none ${
                  isActive
                    ? 'bg-[#0078d4] text-white shadow-xs font-normal'
                    : 'bg-black/5 dark:bg-[#2c3037] hover:bg-black/10 dark:hover:bg-[#363b43] text-[#4b5563] dark:text-[#d1d5db]'
                }`}
              >
                <img src={cat.iconSrc} alt="" aria-hidden="true" draggable={false} className="fluent-3d-icon w-4 h-4 object-contain shrink-0" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </motion.nav>
      )}

      {/* No matching results fallback */}
      {!hasAnyMatch && (
        <motion.div 
          variants={slideUpVariant}
          initial="hidden"
          animate="visible"
          custom={elementIndex++}
          className="rounded-[6px] bg-white dark:bg-[#2c3037] p-8 text-center space-y-2 border-none"
        >
          <p className="text-sm font-normal text-[#111827] dark:text-white" style={{ fontWeight: 400 }}>
            Không tìm thấy cài đặt phù hợp với "{searchQuery}"
          </p>
          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            Hãy thử tìm bằng từ khóa khác hoặc xóa nội dung tìm kiếm trên thanh top bar.
          </p>
        </motion.div>
      )}

      {/* Settings Sections Container */}
      <div className="space-y-8 bg-transparent">
        {/* 1. SECTION: INSIDER FLAGS (Collapsed by default) */}
        {matchesExperimental && (
          <section id="settings-section-experimental" className="space-y-3 bg-transparent">
            {/* Category Header */}
            <motion.div
              variants={slideUpVariant}
              initial="hidden"
              animate="visible"
              custom={elementIndex++}
            >
              <button
                type="button"
                onClick={() => toggleCategoryCollapse('settings-section-experimental')}
                className="w-full flex items-center justify-between py-2 px-1 text-left bg-transparent hover:opacity-85 transition-opacity cursor-pointer select-none border-none"
              >
                <div className="flex items-center gap-2.5">
                  <img src="/icons/settings/insider.png" alt="" aria-hidden="true" draggable={false} className="fluent-3d-icon w-6 h-6 object-contain shrink-0" />
                  <h2 className="text-base sm:text-lg font-bold text-[#111827] dark:text-white tracking-tight">
                    Insider experiments
                  </h2>
                </div>
                <ChevronDown 
                  className={`w-4 h-4 text-white transition-transform duration-200 ${
                    isCategoryCollapsed('settings-section-experimental') ? '-rotate-90' : 'rotate-0'
                  }`} 
                />
              </button>
            </motion.div>

            {/* Individual Option Blocks */}
            {!isCategoryCollapsed('settings-section-experimental') && (
              <div className="space-y-2.5 bg-transparent">
                {/* 1. Native keyboard */}
                {matchesSearch(['Native keyboard', 'bàn phím', 'cảm ứng']) && (
                  <motion.div 
                    variants={slideUpVariant}
                    initial="hidden"
                    animate="visible"
                    custom={elementIndex++}
                    id="setting-experimental-native-keyboard"
                    onClick={() => updateDraft('nativeKeyboard', !draftSettings.nativeKeyboard)}
                    className="rounded-[6px] bg-white dark:bg-[#2c3037] shadow-xs px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4 cursor-default hover:bg-black/[0.02] dark:hover:bg-[#363b43] transition-colors border-none"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="font-normal text-sm text-[#111827] dark:text-white" style={{ fontWeight: 400 }}>
                        Native keyboard
                      </div>
                      <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">
                        Sử dụng bàn phím của ứng dụng thay vì bàn phím của thiết bị (chỉ áp dụng cho thiết bị cảm ứng).
                      </div>
                    </div>

                    <button
                      id="toggle-native-keyboard"
                      type="button"
                      role="switch"
                      aria-checked={draftSettings.nativeKeyboard}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateDraft('nativeKeyboard', !draftSettings.nativeKeyboard);
                      }}
                      className="toggle-switch-btn focus:outline-none shrink-0 border-none"
                    >
                      <span className="toggle-switch-thumb" />
                    </button>
                  </motion.div>
                )}

                {/* 2. Immersive search experience */}
                {matchesSearch(['Immersive search experience', 'tìm kiếm', 'immersive']) && (
                  <motion.div 
                    variants={slideUpVariant}
                    initial="hidden"
                    animate="visible"
                    custom={elementIndex++}
                    id="setting-experimental-immersive-search"
                    onClick={() => updateDraft('immersiveSearch', !draftSettings.immersiveSearch)}
                    className="rounded-[6px] bg-white dark:bg-[#2c3037] shadow-xs px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4 cursor-default hover:bg-black/[0.02] dark:hover:bg-[#363b43] transition-colors border-none"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="font-normal text-sm text-[#111827] dark:text-white" style={{ fontWeight: 400 }}>
                        Immersive search experience
                      </div>
                      <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">
                        Search UI that looks immersive.
                      </div>
                    </div>

                    <button
                      id="toggle-immersive-search"
                      type="button"
                      role="switch"
                      aria-checked={draftSettings.immersiveSearch}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateDraft('immersiveSearch', !draftSettings.immersiveSearch);
                      }}
                      className="toggle-switch-btn focus:outline-none shrink-0 border-none"
                    >
                      <span className="toggle-switch-thumb" />
                    </button>
                  </motion.div>
                )}

                {/* 3. Fluent icons */}
                {matchesSearch(['Fluent icons', '3d icons', 'biểu tượng 3d']) && (
                  <motion.div 
                    variants={slideUpVariant}
                    initial="hidden"
                    animate="visible"
                    custom={elementIndex++}
                    id="setting-experimental-fluent-icons"
                    onClick={() => updateDraft('fluentIcons', !draftSettings.fluentIcons)}
                    className="rounded-[6px] bg-white dark:bg-[#2c3037] shadow-xs px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4 cursor-default hover:bg-black/[0.02] dark:hover:bg-[#363b43] transition-colors border-none"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                      <div className="w-9 h-9 flex items-center justify-center shrink-0">
                        <img
                          src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Leaf%20fluttering%20in%20wind/3D/leaf_fluttering_in_wind_3d.png"
                          alt=""
                          aria-hidden="true"
                          referrerPolicy="no-referrer"
                          className="w-7 h-7 object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-normal text-sm text-[#111827] dark:text-white flex items-center gap-2" style={{ fontWeight: 400 }}>
                          <span>Fluent icons</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-[6px] font-normal uppercase tracking-wider bg-[#0078d4]/10 dark:bg-[#4cc2ff]/20 text-[#0078d4] dark:text-[#4cc2ff]">
                            Mới
                          </span>
                        </div>
                        <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">
                          Beautifully crafted 3D icons in vibrant colors, inspired by Microsoft Fluent Design
                        </div>
                      </div>
                    </div>

                    <button
                      id="toggle-fluent-icons"
                      type="button"
                      role="switch"
                      aria-checked={draftSettings.fluentIcons}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateDraft('fluentIcons', !draftSettings.fluentIcons);
                      }}
                      className="toggle-switch-btn focus:outline-none shrink-0 border-none"
                    >
                      <span className="toggle-switch-thumb" />
                    </button>
                  </motion.div>
                )}

                {/* New Watch Tab */}
                {matchesSearch(['New Watch Tab', 'watch', 'preview', 'tab xem']) && (
                  <motion.div
                    variants={slideUpVariant}
                    initial="hidden"
                    animate="visible"
                    custom={elementIndex++}
                    id="setting-experimental-new-watch-tab"
                    onClick={() => updateDraft('newWatchTab', !draftSettings.newWatchTab)}
                    className="rounded-[6px] bg-white dark:bg-[#2c3037] shadow-xs px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4 cursor-default hover:bg-black/[0.02] dark:hover:bg-[#363b43] transition-colors border-none"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="font-normal text-sm text-[#111827] dark:text-white flex items-center gap-2">
                        <span>New Watch Tab</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-[6px] uppercase tracking-wider bg-[#0078d4]/10 dark:bg-[#4cc2ff]/20 text-[#0078d4] dark:text-[#4cc2ff]">New</span>
                      </div>
                      <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">Hiển thị tab Watch preview mới với giao diện xem nội dung.</div>
                    </div>
                    <button id="toggle-new-watch-tab" type="button" role="switch" aria-checked={draftSettings.newWatchTab} onClick={(e) => { e.stopPropagation(); updateDraft('newWatchTab', !draftSettings.newWatchTab); }} className="toggle-switch-btn focus:outline-none shrink-0 border-none"><span className="toggle-switch-thumb" /></button>
                  </motion.div>
                )}

                {/* Dynamic sidebar icons */}
                {matchesSearch(['Dynamic sidebar icons', 'dynamic icons', 'sidebar icons', 'icon thanh bên']) && (
                  <motion.div
                    variants={slideUpVariant}
                    initial="hidden"
                    animate="visible"
                    custom={elementIndex++}
                    id="setting-dynamic-sidebar-icons"
                    onClick={() => updateDraft('dynamicSidebarIcons', !draftSettings.dynamicSidebarIcons)}
                    className="rounded-[6px] bg-white dark:bg-[#2c3037] shadow-xs px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4 cursor-default hover:bg-black/[0.02] dark:hover:bg-[#363b43] transition-colors border-none"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                      <div className="w-9 h-9 flex items-center justify-center shrink-0">
                        <img
                          src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Sparkles/3D/sparkles_3d.png"
                          alt=""
                          aria-hidden="true"
                          referrerPolicy="no-referrer"
                          className="w-7 h-7 object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-normal text-sm text-[#111827] dark:text-white flex items-center gap-2" style={{ fontWeight: 400 }}>
                          <span>Dynamic sidebar icons</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-[6px] font-normal uppercase tracking-wider bg-[#0078d4]/10 dark:bg-[#4cc2ff]/20 text-[#0078d4] dark:text-[#4cc2ff]">
                            Sidebar
                          </span>
                        </div>
                        <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">
                          Kết hợp 2 dạng icon: Sign in, Settings, WinUI 3 dùng icon thường; Home, Update blogs, Watch, Gallery, Notes, Draws, VLC, Craftmine, Photopea, Discord dùng icon Fluent colored
                        </div>
                      </div>
                    </div>

                    <button
                      id="toggle-dynamic-sidebar-icons"
                      type="button"
                      role="switch"
                      aria-checked={draftSettings.dynamicSidebarIcons}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateDraft('dynamicSidebarIcons', !draftSettings.dynamicSidebarIcons);
                      }}
                      className="toggle-switch-btn focus:outline-none shrink-0 border-none"
                    >
                      <span className="toggle-switch-thumb" />
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </section>
        )}

        {/* 2. SECTION: INTERFACE */}
        {matchesInterface && (
          <section id="settings-section-interface" className="space-y-3 bg-transparent">
            {/* Category Header */}
            <motion.div
              variants={slideUpVariant}
              initial="hidden"
              animate="visible"
              custom={elementIndex++}
            >
              <button
                type="button"
                onClick={() => toggleCategoryCollapse('settings-section-interface')}
                className="w-full flex items-center justify-between py-2 px-1 text-left bg-transparent hover:opacity-85 transition-opacity cursor-pointer select-none border-none"
              >
                <div className="flex items-center gap-2.5">
                  <img src="/icons/settings/appearance.png" alt="" aria-hidden="true" draggable={false} className="fluent-3d-icon w-6 h-6 object-contain shrink-0" />
                  <h2 className="text-base sm:text-lg font-bold text-[#111827] dark:text-white tracking-tight">
                    Appearance
                  </h2>
                </div>
                <ChevronDown 
                  className={`w-4 h-4 text-white transition-transform duration-200 ${
                    isCategoryCollapsed('settings-section-interface') ? '-rotate-90' : 'rotate-0'
                  }`} 
                />
              </button>
            </motion.div>

            {/* Individual Option Blocks */}
            {!isCategoryCollapsed('settings-section-interface') && (
              <div className="space-y-2.5 bg-transparent">
                {/* 1. Chế độ ứng dụng */}
                {matchesSearch(['Chế độ ứng dụng', 'ban ngày', 'ban đêm', 'light', 'dark', 'theme']) && (
                  <motion.div
                    variants={slideUpVariant}
                    initial="hidden"
                    animate="visible"
                    custom={elementIndex++}
                    id="setting-theme-mode"
                    className="rounded-[6px] bg-white dark:bg-[#2c3037] shadow-xs px-4 py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-black/[0.02] dark:hover:bg-[#363b43] transition-colors border-none"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-normal text-sm text-[#111827] dark:text-white" style={{ fontWeight: 400 }}>
                        Chế độ ứng dụng
                      </div>
                      <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">
                        Lựa chọn giao diện sáng hoặc tối cho toàn bộ hệ thống.
                      </div>
                    </div>
                    <div className="settings-segmented-group grid grid-cols-2 gap-1 rounded-[6px] bg-black/5 dark:bg-black/30 p-1 w-full sm:w-auto sm:min-w-[220px] border-none" role="group" aria-label="Chế độ ứng dụng">
                      {([
                        ['light', 'Ban ngày', Sun],
                        ['dark', 'Ban đêm', Moon],
                      ] as const).map(([val, label, IconComponent]) => (
                        <button
                          key={val}
                          type="button"
                          id={`theme-btn-${val}`}
                          onClick={() => {
                            if (val === 'light') {
                              setLightModeUnlockCode('');
                              setLightModeUnlockError('');
                              setIsLightModeUnlockOpen(true);
                              return;
                            }
                            updateDraft('theme', val);
                          }}
                          className={`flex items-center justify-center gap-1.5 rounded-[6px] px-3 py-1.5 text-xs transition-colors cursor-default border-none ${
                            (draftSettings.theme || 'dark') === val
                              ? 'bg-[#0078d4] dark:bg-[#4cc2ff] text-white dark:text-black shadow-xs font-normal'
                              : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 font-normal'
                          }`}
                          aria-pressed={(draftSettings.theme || 'dark') === val}
                        >
                          <IconComponent className="w-3.5 h-3.5 text-white" />
                          <span className="light-mode-white-label">{label}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* 2. Thanh điều hướng */}
                {matchesSearch(['Thanh điều hướng', 'side view', 'top view', 'tab view', 'navigation']) && (
                  <motion.div 
                    variants={slideUpVariant}
                    initial="hidden"
                    animate="visible"
                    custom={elementIndex++}
                    className="rounded-[6px] bg-white dark:bg-[#2c3037] shadow-xs px-4 py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-black/[0.02] dark:hover:bg-[#363b43] transition-colors border-none"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-normal text-sm text-[#111827] dark:text-white" style={{ fontWeight: 400 }}>
                          Thanh điều hướng
                        </div>
                        {draftSettings.navigationMode === 'topbar' && (
                          <span className="inline-flex items-center text-[10px] font-semibold text-[#0078d4] dark:text-[#4cc2ff] bg-[#0078d4]/10 dark:bg-[#4cc2ff]/10 px-2 py-0.5 rounded-[6px]">
                            Top View
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">
                        {draftSettings.navigationMode === 'topbar'
                          ? 'Giao diện Top View đưa thanh điều khiển lên đầu màn hình.'
                          : 'Lựa chọn kiểu điều hướng của ứng dụng (Side View, Top View, Tab View).'}
                      </div>
                    </div>
                    <div className="settings-segmented-group grid grid-cols-3 gap-1 rounded-[6px] bg-black/5 dark:bg-black/30 p-1 w-full sm:w-auto sm:min-w-[280px] border-none" role="group" aria-label="Thanh điều hướng">
                      {([
                        ['sidebar', 'Side View'],
                        ['topbar', 'Top View'],
                        ['floaty', 'Tab View'],
                      ] as const).map(([value, label]) => (
                        <button 
                          key={value} 
                          type="button" 
                          onClick={() => { 
                            updateDraft('navigationMode', value); 
                            updateDraft('immersiveSidebar', false); 
                          }} 
                          className={`rounded-[6px] px-2.5 py-1.5 text-xs font-normal transition-colors cursor-default text-center truncate border-none ${
                            draftSettings.navigationMode === value
                              ? 'bg-[#0078d4] dark:bg-[#4cc2ff] text-white dark:text-black shadow-xs font-normal'
                              : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 font-normal'
                          }`} 
                          aria-pressed={draftSettings.navigationMode === value}
                          title={label}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* 3. Thu phóng giao diện */}
                {matchesSearch(['Thu phóng giao diện', 'font', 'scale', 'kích cỡ']) && (
                  <motion.div 
                    variants={slideUpVariant}
                    initial="hidden"
                    animate="visible"
                    custom={elementIndex++}
                    className="rounded-[6px] bg-white dark:bg-[#2c3037] shadow-xs px-4 py-3 sm:py-3.5 space-y-2 hover:bg-black/[0.02] dark:hover:bg-[#363b43] transition-colors border-none"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Type className="w-4 h-4 text-white" />
                          <span className="font-normal text-sm text-[#111827] dark:text-white" style={{ fontWeight: 400 }}>
                            Thu phóng giao diện
                          </span>
                        </div>
                        <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">
                          Tùy chỉnh kích cỡ giao diện ứng dụng để phù hợp với thiết bị của bạn.
                        </div>
                      </div>
                    </div>

                    <div className="py-2.5 px-1">
                      <div className="group relative w-full h-5 flex items-center transition-all settings-slider-capsule select-none">
                        <input
                          id="slider-font-scale"
                          type="range"
                          min="0"
                          max={FONT_SCALE_CONFIG.length - 1}
                          step="1"
                          value={draftSettings.fontScale}
                          onChange={(e) => updateDraft('fontScale', parseInt(e.target.value, 10))}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-default z-20"
                          aria-label="Thu phóng giao diện"
                        />

                        <div className="settings-slider-track relative w-full h-1 rounded-full bg-[#8a8a8a] dark:bg-[#7f7f84] overflow-visible pointer-events-none z-10">
                          <div 
                            className="absolute left-0 top-0 h-full rounded-full bg-[#0078d4] dark:bg-[#4cc2ff] transition-all duration-150 ease-out"
                            style={{ width: `${(draftSettings.fontScale / (FONT_SCALE_CONFIG.length - 1)) * 100}%` }}
                          />
                          <div 
                            id="settings-slider-thumb"
                            className="settings-slider-thumb"
                            style={{ 
                              left: `${(draftSettings.fontScale / (FONT_SCALE_CONFIG.length - 1)) * 100}%`,
                              top: '50%',
                              transform: 'translate(-50%, -50%)'
                            }}
                          />
                        </div>
                      </div>

                      <div className="relative flex items-center justify-between text-[11px] pt-2 px-1">
                        {FONT_SCALE_CONFIG.map((item, idx) => {
                          const isSelected = draftSettings.fontScale === idx;
                          let alignClass = 'text-center';
                          if (idx === 0) alignClass = 'text-left';
                          else if (idx === FONT_SCALE_CONFIG.length - 1) alignClass = 'text-right';
                          return (
                            <button
                              key={item.label}
                              type="button"
                              id={`btn-font-scale-${idx}`}
                              onClick={() => updateDraft('fontScale', idx)}
                              className={`cursor-default transition-colors py-1 border-none ${alignClass} ${
                                isSelected
                                  ? 'text-[#0078d4] dark:text-[#4cc2ff] font-normal text-xs'
                                  : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white font-normal'
                              }`}
                            >
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 4. Vị trí thanh bên (nếu dùng Side View) */}
                {draftSettings.navigationMode === 'sidebar' && matchesSearch(['Vị trí thanh bên', 'trái', 'phải', 'sidebar position']) && (
                  <motion.div
                    variants={slideUpVariant}
                    initial="hidden"
                    animate="visible"
                    custom={elementIndex++}
                    id="setting-sidebar-position"
                    className="rounded-[6px] bg-white dark:bg-[#2c3037] shadow-xs px-4 py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-black/[0.02] dark:hover:bg-[#363b43] transition-colors border-none"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-normal text-sm text-[#111827] dark:text-white" style={{ fontWeight: 400 }}>
                        Vị trí thanh bên (Side View position)
                      </div>
                      <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">
                        Chọn vị trí hiển thị thanh bên trái hoặc phải.
                      </div>
                    </div>
                    <div className="settings-segmented-group grid grid-cols-2 gap-1 rounded-[6px] bg-black/5 dark:bg-black/30 p-1 w-full sm:w-auto sm:min-w-[180px] border-none">
                      {[
                        ['left', 'Trái'],
                        ['right', 'Phải'],
                      ].map(([pos, label]) => (
                        <button
                          key={pos}
                          type="button"
                          onClick={() => updateDraft('sidebarPosition', pos as 'left' | 'right')}
                          className={`rounded-[6px] px-3 py-1.5 text-xs font-normal transition-colors cursor-default text-center border-none ${
                            draftSettings.sidebarPosition === pos
                              ? 'bg-[#0078d4] dark:bg-[#4cc2ff] text-white dark:text-black shadow-xs font-normal'
                              : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 font-normal'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* 5. Siêu chế độ tối */}
                {matchesSearch(['Siêu chế độ tối', 'super dark', 'oled', 'pure black']) && (
                  <motion.div
                    variants={slideUpVariant}
                    initial="hidden"
                    animate="visible"
                    custom={elementIndex++}
                    id="setting-super-dark-mode"
                    className="rounded-[6px] bg-white dark:bg-[#2c3037] shadow-xs px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4 transition-colors hover:bg-black/[0.02] dark:hover:bg-[#363b43] border-none"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="font-normal text-sm text-[#111827] dark:text-white" style={{ fontWeight: 400 }}>
                        Siêu chế độ tối (Super Dark Mode)
                      </div>
                      <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">
                        Chuyển đổi giao diện sang màu đen tuyền tuyệt đối (OLED Pure Black #000000) giúp tối ưu tiết kiệm pin trên màn hình OLED và tạo cảm giác dịu mắt ban đêm.
                      </div>
                    </div>

                    <button
                      id="toggle-super-dark-mode"
                      type="button"
                      role="switch"
                      aria-checked={draftSettings.superDarkMode}
                      onClick={() => updateDraft('superDarkMode', !draftSettings.superDarkMode)}
                      className="toggle-switch-btn focus:outline-none shrink-0 border-none"
                    >
                      <span className="toggle-switch-thumb" />
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </section>
        )}

        {/* 3. SECTION: ACCESSIBILITY */}
        {matchesAccessibility && (
          <section id="settings-section-accessibility" className="space-y-3 bg-transparent">
            {/* Category Header */}
            <motion.div
              variants={slideUpVariant}
              initial="hidden"
              animate="visible"
              custom={elementIndex++}
            >
              <button
                type="button"
                onClick={() => toggleCategoryCollapse('settings-section-accessibility')}
                className="w-full flex items-center justify-between py-2 px-1 text-left bg-transparent hover:opacity-85 transition-opacity cursor-pointer select-none border-none"
              >
                <div className="flex items-center gap-2.5">
                  <img src="/icons/settings/accessibility.png" alt="" aria-hidden="true" draggable={false} className="fluent-3d-icon w-6 h-6 object-contain shrink-0" />
                  <h2 className="text-base sm:text-lg font-bold text-[#111827] dark:text-white tracking-tight">
                    Accessibility
                  </h2>
                </div>
                <ChevronDown 
                  className={`w-4 h-4 text-white transition-transform duration-200 ${
                    isCategoryCollapsed('settings-section-accessibility') ? '-rotate-90' : 'rotate-0'
                  }`} 
                />
              </button>
            </motion.div>

            {/* Individual Option Blocks */}
            {!isCategoryCollapsed('settings-section-accessibility') && (
              <div className="space-y-2.5 bg-transparent">
                {/* 1. Hover to expand */}
                {matchesSearch(['Hover to expand', 'sidebar', 'di chuột', 'mở rộng']) && (
                  <motion.div 
                    variants={slideUpVariant}
                    initial="hidden"
                    animate="visible"
                    custom={elementIndex++}
                    id="setting-hover-to-expand"
                    onClick={() => updateDraft('hoverToExpand', !draftSettings.hoverToExpand)}
                    className="rounded-[6px] bg-white dark:bg-[#2c3037] shadow-xs px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4 cursor-default hover:bg-black/[0.02] dark:hover:bg-[#363b43] transition-colors border-none"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="font-normal text-sm text-[#111827] dark:text-white" style={{ fontWeight: 400 }}>
                        Hover to expand
                      </div>
                      <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">
                        Khi di chuột qua thanh bên đang thu gọn, thanh bên sẽ tự động mở rộng mà không làm thay đổi độ rộng của trang.
                      </div>
                    </div>

                    <button
                      id="toggle-hover-to-expand"
                      type="button"
                      role="switch"
                      aria-checked={draftSettings.hoverToExpand}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateDraft('hoverToExpand', !draftSettings.hoverToExpand);
                      }}
                      className="toggle-switch-btn focus:outline-none shrink-0 border-none"
                    >
                      <span className="toggle-switch-thumb" />
                    </button>
                  </motion.div>
                )}

                {/* 2. Page loading */}
                {matchesSearch(['Page loading', 'tải trang', 'vòng xoay']) && (
                  <motion.div 
                    variants={slideUpVariant}
                    initial="hidden"
                    animate="visible"
                    custom={elementIndex++}
                    id="setting-page-loading"
                    onClick={() => updateDraft('pageLoading', !draftSettings.pageLoading)}
                    className="rounded-[6px] bg-white dark:bg-[#2c3037] shadow-xs px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4 cursor-default hover:bg-black/[0.02] dark:hover:bg-[#363b43] transition-colors border-none"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="font-normal text-sm text-[#111827] dark:text-white" style={{ fontWeight: 400 }}>
                        Page loading
                      </div>
                      <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">
                        Hiển thị vòng xoay đang tải trong 1 giây trước khi trang hoàn tất để tạo cảm giác mượt mà hơn.
                      </div>
                    </div>

                    <button
                      id="toggle-page-loading"
                      type="button"
                      role="switch"
                      aria-checked={draftSettings.pageLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateDraft('pageLoading', !draftSettings.pageLoading);
                      }}
                      className="toggle-switch-btn focus:outline-none shrink-0 border-none"
                    >
                      <span className="toggle-switch-thumb" />
                    </button>
                  </motion.div>
                )}

                {/* 3. Load pages sequentially */}
                {matchesSearch(['Load pages sequentially', 'tải tuần tự', 'cuộn trang']) && (
                  <motion.div 
                    variants={slideUpVariant}
                    initial="hidden"
                    animate="visible"
                    custom={elementIndex++}
                    id="setting-load-pages-sequentially"
                    onClick={() => updateDraft('loadPagesSequentially', !draftSettings.loadPagesSequentially)}
                    className="rounded-[6px] bg-white dark:bg-[#2c3037] shadow-xs px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4 cursor-default hover:bg-black/[0.02] dark:hover:bg-[#363b43] transition-colors border-none"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="font-normal text-sm text-[#111827] dark:text-white" style={{ fontWeight: 400 }}>
                        Load pages sequentially
                      </div>
                      <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">
                        Tải nội dung ban ��ầu của trang, sau đó hiển thị v��ng xoay tải trong 1 giây khi cuộn xuống để khám phá thêm.
                      </div>
                    </div>

                    <button
                      id="toggle-load-pages-sequentially"
                      type="button"
                      role="switch"
                      aria-checked={draftSettings.loadPagesSequentially}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateDraft('loadPagesSequentially', !draftSettings.loadPagesSequentially);
                      }}
                      className="toggle-switch-btn focus:outline-none shrink-0 border-none"
                    >
                      <span className="toggle-switch-thumb" />
                    </button>
                  </motion.div>
                )}

                {/* 4. Bàn phím số */}
                {matchesSearch(['Bàn phím số', 'keyboard number', 'số 0-9']) && (
                  <motion.div 
                    variants={slideUpVariant}
                    initial="hidden"
                    animate="visible"
                    custom={elementIndex++}
                    id="setting-keyboard-number-row"
                    onClick={() => updateDraft('keyboardNumberRow', !draftSettings.keyboardNumberRow)}
                    className="rounded-[6px] bg-white dark:bg-[#2c3037] shadow-xs px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4 cursor-default hover:bg-black/[0.02] dark:hover:bg-[#363b43] transition-colors border-none"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="font-normal text-sm text-[#111827] dark:text-white" style={{ fontWeight: 400 }}>
                        Bàn phím số
                      </div>
                      <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">
                        Hiển thị bàn phím số từ 0 đến 9 ngay trên dải phím chữ.
                      </div>
                    </div>

                    <button
                      id="toggle-keyboard-number-row"
                      type="button"
                      role="switch"
                      aria-checked={draftSettings.keyboardNumberRow}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateDraft('keyboardNumberRow', !draftSettings.keyboardNumberRow);
                      }}
                      className="toggle-switch-btn focus:outline-none shrink-0 border-none"
                    >
                      <span className="toggle-switch-thumb" />
                    </button>
                  </motion.div>
                )}

                {/* 5. Clipboard */}
                {matchesSearch(['Clipboard', 'lịch sử sao chép', 'bộ nhớ tạm']) && (
                  <motion.div 
                    variants={slideUpVariant}
                    initial="hidden"
                    animate="visible"
                    custom={elementIndex++}
                    id="setting-keyboard-clipboard"
                    onClick={() => updateDraft('keyboardClipboard', !draftSettings.keyboardClipboard)}
                    className="rounded-[6px] bg-white dark:bg-[#2c3037] shadow-xs px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4 cursor-default hover:bg-black/[0.02] dark:hover:bg-[#363b43] transition-colors border-none"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="font-normal text-sm text-[#111827] dark:text-white" style={{ fontWeight: 400 }}>
                        Clipboard
                      </div>
                      <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">
                        Danh sách lịch sử sao chép trong ứng dụng.
                      </div>
                    </div>

                    <button
                      id="toggle-keyboard-clipboard"
                      type="button"
                      role="switch"
                      aria-checked={draftSettings.keyboardClipboard}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateDraft('keyboardClipboard', !draftSettings.keyboardClipboard);
                      }}
                      className="toggle-switch-btn focus:outline-none shrink-0 border-none"
                    >
                      <span className="toggle-switch-thumb" />
                    </button>
                  </motion.div>
                )}

                {/* 6. Âm bàn phím */}
                {matchesSearch(['Âm bàn phím', 'keyboard sound', 'âm thanh']) && (
                  <motion.div 
                    variants={slideUpVariant}
                    initial="hidden"
                    animate="visible"
                    custom={elementIndex++}
                    id="setting-keyboard-sound"
                    onClick={() => updateDraft('keyboardSoundEnabled', !draftSettings.keyboardSoundEnabled)}
                    className="rounded-[6px] bg-white dark:bg-[#2c3037] shadow-xs px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4 cursor-default hover:bg-black/[0.02] dark:hover:bg-[#363b43] transition-colors border-none"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="font-normal text-sm text-[#111827] dark:text-white" style={{ fontWeight: 400 }}>
                        Âm bàn phím
                      </div>
                      <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">
                        Phát ra tiếng "pop" khi gõ trên bàn phím.
                      </div>
                    </div>

                    <button
                      id="toggle-keyboard-sound"
                      type="button"
                      role="switch"
                      aria-checked={draftSettings.keyboardSoundEnabled}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateDraft('keyboardSoundEnabled', !draftSettings.keyboardSoundEnabled);
                      }}
                      className="toggle-switch-btn focus:outline-none shrink-0 border-none"
                    >
                      <span className="toggle-switch-thumb" />
                    </button>
                  </motion.div>
                )}

                {/* 7. Keybinds Options Card */}
                {matchesSearch(['Tổ hợp phím', 'keybinds', 'phím tắt', 'ctrl', 'alt']) && (
                  <motion.div 
                    variants={slideUpVariant}
                    initial="hidden"
                    animate="visible"
                    custom={elementIndex++}
                    className="space-y-2 pt-2 bg-transparent"
                  >
                    <div className="flex items-center justify-between px-1 bg-transparent">
                      <div className="font-normal text-xs text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider" style={{ fontWeight: 400 }}>
                        Keybinds
                      </div>
                      <button
                        type="button"
                        id="btn-reset-keybinds"
                        onClick={() => {
                          updateDraft('customKeybinds', { ...DEFAULT_KEYBINDS });
                          setEditingKeybindId(null);
                          setKeybindError(null);
                        }}
                        title="Đặt lại tất cả phím tắt về mặc định"
                        className="px-2.5 py-1 rounded-[6px] text-xs font-normal text-[#0078d4] dark:text-[#4cc2ff] hover:bg-black/5 dark:hover:bg-black/20 transition-colors flex items-center gap-1.5 shrink-0 cursor-default border-none"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-white" />
                        <span>Phím tắt mặc định</span>
                      </button>
                    </div>

                    <div className="space-y-2 bg-transparent">
                      {KEYBIND_DEFINITIONS.map((def) => {
                        const currentKey = draftSettings.customKeybinds?.[def.id] || def.defaultKey;
                        const isEditing = editingKeybindId === def.id;
                        const error = keybindError?.id === def.id ? keybindError.message : null;

                        return (
                          <div
                            key={def.id}
                            id={`keybind-row-${def.id}`}
                            className="rounded-[6px] bg-white dark:bg-[#2c3037] shadow-xs px-4 py-3 sm:py-3.5 flex flex-col gap-2 hover:bg-black/[0.02] dark:hover:bg-[#363b43] transition-colors border-none"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="font-normal text-sm text-[#111827] dark:text-white flex items-center gap-2" style={{ fontWeight: 400 }}>
                                  <span>{def.label}</span>
                                  {currentKey !== def.defaultKey && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded-[6px] bg-[#0078d4]/10 dark:bg-[#4cc2ff]/20 text-[#0078d4] dark:text-[#4cc2ff] font-normal">
                                      Đã đổi
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">
                                  {def.description}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {isEditing ? (
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="text"
                                      autoFocus
                                      readOnly
                                      data-keybind-recording="true"
                                      value="Nhấn tổ hợp phím..."
                                      onKeyDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();

                                        if (e.key === 'Escape') {
                                          setEditingKeybindId(null);
                                          setKeybindError(null);
                                          return;
                                        }

                                        const keyStr = eventToKeyString(e.nativeEvent);
                                        if (!keyStr) return;

                                        const validation = validateKeybind(keyStr);
                                        if (!validation.valid) {
                                          setKeybindError({ id: def.id, message: validation.reason || 'Phím tắt không hợp lệ.' });
                                          return;
                                        }

                                        const existingAction = Object.entries(draftSettings.customKeybinds || {}).find(
                                          ([act, key]) => act !== def.id && typeof key === 'string' && key.toLowerCase() === keyStr.toLowerCase()
                                        );

                                        if (existingAction) {
                                          const conflictDef = KEYBIND_DEFINITIONS.find((d) => d.id === existingAction[0]);
                                          setKeybindError({
                                            id: def.id,
                                            message: `Phím này đã được dùng cho "${conflictDef?.label || existingAction[0]}".`
                                          });
                                          return;
                                        }

                                        const updated = {
                                          ...(draftSettings.customKeybinds || DEFAULT_KEYBINDS),
                                          [def.id]: keyStr
                                        };
                                        updateDraft('customKeybinds', updated);
                                        setEditingKeybindId(null);
                                        setKeybindError(null);
                                      }}
                                      className="px-2.5 py-1 text-xs rounded-[6px] bg-[#0078d4]/10 text-[#0078d4] dark:text-[#4cc2ff] outline-none font-mono font-normal w-36 text-center animate-pulse border border-[#0078d4]"
                                      aria-label={`Gán phím cho ${def.label}`}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingKeybindId(null);
                                        setKeybindError(null);
                                      }}
                                      className="p-1.5 rounded-[6px] text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 text-xs transition-colors border-none"
                                      title="Hủy"
                                    >
                                      <X className="w-3.5 h-3.5 text-white" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      id={`btn-edit-keybind-${def.id}`}
                                      onClick={() => {
                                        setEditingKeybindId(def.id);
                                        setKeybindError(null);
                                      }}
                                      title="Nhấp để thay đổi phím tắt"
                                      className="px-2.5 py-1 rounded-[6px] bg-black/5 dark:bg-black/30 hover:bg-black/10 dark:hover:bg-black/40 text-[#111827] dark:text-white font-mono text-xs font-normal transition-colors cursor-default border-none"
                                    >
                                      {currentKey}
                                    </button>
                                    {currentKey !== def.defaultKey && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = {
                                            ...(draftSettings.customKeybinds || DEFAULT_KEYBINDS),
                                            [def.id]: def.defaultKey
                                          };
                                          updateDraft('customKeybinds', updated);
                                          setKeybindError(null);
                                        }}
                                        className="p-1 rounded-[6px] text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-default border-none"
                                        title="Khôi phục mặc định"
                                      >
                                        <RotateCcw className="w-3 h-3 text-white" />
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {error && (
                              <div className="flex items-start gap-1.5 text-xs text-red-500 bg-red-500/10 p-2 rounded-[6px] border border-red-500/20">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-white" />
                                <span>{error}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </section>
        )}

        {/* 4. SECTION: TOOLS */}
        {matchesTools && (
          <section id="settings-section-tools" className="space-y-3 bg-transparent">
            {/* Category Header */}
            <motion.div
              variants={slideUpVariant}
              initial="hidden"
              animate="visible"
              custom={elementIndex++}
            >
              <button
                type="button"
                onClick={() => toggleCategoryCollapse('settings-section-tools')}
                className="w-full flex items-center justify-between py-2 px-1 text-left bg-transparent hover:opacity-85 transition-opacity cursor-pointer select-none border-none"
              >
                <div className="flex items-center gap-2.5">
                  <img src="/icons/settings/tools.png" alt="" aria-hidden="true" draggable={false} className="fluent-3d-icon w-6 h-6 object-contain shrink-0" />
                  <h2 className="text-base sm:text-lg font-bold text-[#111827] dark:text-white tracking-tight">
                    Tools
                  </h2>
                </div>
                <ChevronDown 
                  className={`w-4 h-4 text-white transition-transform duration-200 ${
                    isCategoryCollapsed('settings-section-tools') ? '-rotate-90' : 'rotate-0'
                  }`} 
                />
              </button>
            </motion.div>

            {/* Individual Option Blocks */}
            {!isCategoryCollapsed('settings-section-tools') && (
              <div className="space-y-2.5 bg-transparent">
                {/* 1. Tỉ lệ khung hình */}
                {matchesSearch(['Tỉ lệ khung hình', 'aspect ratio', '16:9', '4:3']) && (
                  <motion.div 
                    variants={slideUpVariant}
                    initial="hidden"
                    animate="visible"
                    custom={elementIndex++}
                    className="rounded-[6px] bg-white dark:bg-[#2c3037] shadow-xs px-4 py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-black/[0.02] dark:hover:bg-[#363b43] transition-colors border-none"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Tv className="w-4 h-4 text-white" />
                        <span className="font-normal text-sm text-[#111827] dark:text-white" style={{ fontWeight: 400 }}>
                          Tỉ lệ khung hình
                        </span>
                      </div>
                      <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">
                        Chuyển đổi tỉ lệ khung hình khi xem giữa 4:3 hoặc 16:9.
                      </div>
                    </div>
                    <div className="settings-segmented-group grid grid-cols-2 gap-1 rounded-[6px] bg-black/5 dark:bg-black/30 p-1 w-full sm:w-auto sm:min-w-[220px] border-none">
                      {[
                        { value: '16:9', label: '16:9 (chuẩn rộng)' },
                        { value: '4:3', label: '4:3 (chuẩn vuông)' },
                      ].map(({ value, label }) => (
                        <button
                          key={value}
                          type="button"
                          id={`btn-aspect-${value.replace(':', '-')}`}
                          onClick={() => updateDraft('streamAspectRatio', value as '16:9' | '4:3')}
                          className={`rounded-[6px] px-3 py-1.5 text-xs font-normal transition-colors cursor-default text-center border-none ${
                            draftSettings.streamAspectRatio === value
                              ? 'bg-[#0078d4] dark:bg-[#4cc2ff] text-white dark:text-black shadow-xs font-normal'
                              : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 font-normal'
                          }`}
                          aria-pressed={draftSettings.streamAspectRatio === value}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* 2. Tự động ẩn Side View */}
                {matchesSearch(['Tự động ẩn Side View', 'auto hide', 'sidebar']) && (
                  <motion.div 
                    variants={slideUpVariant}
                    initial="hidden"
                    animate="visible"
                    custom={elementIndex++}
                    className="rounded-[6px] bg-white dark:bg-[#2c3037] shadow-xs px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4 transition-colors hover:bg-black/[0.02] dark:hover:bg-[#363b43] border-none"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="font-normal text-sm text-[#111827] dark:text-white" style={{ fontWeight: 400 }}>
                        Tự động ẩn Side View
                      </div>
                      <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">
                        Tự động thu gọn thanh menu khi không di chuột vào.
                      </div>
                    </div>

                    <button
                      id="toggle-autohide-sidebar"
                      type="button"
                      role="switch"
                      aria-checked={draftSettings.autoHideSidebar}
                      onClick={() => updateDraft('autoHideSidebar', !draftSettings.autoHideSidebar)}
                      className="toggle-switch-btn focus:outline-none shrink-0 border-none"
                    >
                      <span className="toggle-switch-thumb" />
                    </button>
                  </motion.div>
                )}

                {/* 3. Sparkle Notes */}
                {matchesSearch(['Sparkle Notes', 'ghi chú', 'notes']) && (
                  <motion.div 
                    variants={slideUpVariant}
                    initial="hidden"
                    animate="visible"
                    custom={elementIndex++}
                    className="rounded-[6px] bg-white dark:bg-[#2c3037] shadow-xs px-4 py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-black/[0.02] dark:hover:bg-[#363b43] transition-colors border-none"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-normal text-sm text-[#111827] dark:text-white flex items-center gap-2" style={{ fontWeight: 400 }}>
                        <span>Sparkle Notes</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-[6px] font-normal uppercase tracking-wider bg-[#0078d4]/10 dark:bg-[#4cc2ff]/20 text-[#0078d4] dark:text-[#4cc2ff]">
                          Ghi chú
                        </span>
                      </div>
                      <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">
                        Ứng dụng ghi chú & soạn thảo văn bản, hỗ trợ hiển thị dưới dạng Sticky Note nổi di động.
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenOfficeTool?.('notes')}
                      className="px-4 py-1.5 rounded-[6px] font-normal text-xs text-white bg-[#0078d4] hover:bg-[#106ebe] dark:bg-[#4cc2ff] dark:text-black dark:hover:bg-[#6bd0ff] transition-colors flex items-center gap-2 self-start sm:self-auto cursor-default shadow-xs border-none"
                    >
                      <span>Mở Sparkle Notes</span>
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </section>
        )}

        {/* 5. SECTION: UPDATES */}
        {matchesVersion && (
          <section id="settings-section-version" className="space-y-3 bg-transparent">
            {/* Category Header */}
            <motion.div
              variants={slideUpVariant}
              initial="hidden"
              animate="visible"
              custom={elementIndex++}
            >
              <button
                type="button"
                onClick={() => toggleCategoryCollapse('settings-section-version')}
                className="w-full flex items-center justify-between py-2 px-1 text-left bg-transparent hover:opacity-85 transition-opacity cursor-pointer select-none border-none"
              >
                <div className="flex items-center gap-2.5">
                  <img src="/icons/settings/updates.png" alt="" aria-hidden="true" draggable={false} className="fluent-3d-icon w-6 h-6 object-contain shrink-0" />
                  <h2 className="text-base sm:text-lg font-bold text-[#111827] dark:text-white tracking-tight">
                    Updates
                  </h2>
                </div>
                <ChevronDown 
                  className={`w-4 h-4 text-white transition-transform duration-200 ${
                    isCategoryCollapsed('settings-section-version') ? '-rotate-90' : 'rotate-0'
                  }`} 
                />
              </button>
            </motion.div>

            {/* Individual Option Blocks */}
            {!isCategoryCollapsed('settings-section-version') && (
              <div className="space-y-2.5 bg-transparent">
                {/* 1. Software info block */}
                {matchesSearch(['Software Update', 'Software Build', 'phiên bản', '26.11']) && (
                  <motion.div 
                    variants={slideUpVariant}
                    initial="hidden"
                    animate="visible"
                    custom={elementIndex++}
                    className="rounded-[6px] bg-white dark:bg-[#2c3037] shadow-xs p-4 sm:p-5 space-y-3 select-text hover:bg-black/[0.02] dark:hover:bg-[#363b43] transition-colors border-none"
                  >
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-normal text-[#111827] dark:text-white" style={{ fontWeight: 400 }}>Software Update</span>
                      <span className="font-semibold text-[#9CA3AF]">26.11</span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-normal text-[#111827] dark:text-white" style={{ fontWeight: 400 }}>Software Build</span>
                      <span className="font-semibold text-[#9CA3AF]">261016</span>
                    </div>
                    <div id="settings-compatible-spatial-glass" className="pt-2.5 mt-1 flex items-center">
                      <p className="text-sm font-normal tracking-tight text-[#111827] dark:text-white" style={{ fontWeight: 400 }}>
                        Compatible with{' '}
                        <span className="text-[#4cc2ff] font-semibold">
                          Microsoft Fluent Design.
                        </span>
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* 2. Test Sparkle Option Card */}
                {matchesSearch(['Test Sparkle', 'bản thử nghiệm', 'test build']) && (
                  <motion.div 
                    variants={slideUpVariant}
                    initial="hidden"
                    animate="visible"
                    custom={elementIndex++}
                    className="rounded-[6px] bg-white dark:bg-[#2c3037] shadow-xs p-4 sm:p-4.5 flex items-center justify-between gap-3 hover:bg-black/[0.02] dark:hover:bg-[#363b43] transition-colors border-none"
                  >
                    <div>
                      <div className="font-normal text-[#111827] dark:text-white text-xs sm:text-sm" style={{ fontWeight: 400 }}>
                        Test Sparkle
                      </div>
                      <div className="text-[11px] sm:text-xs text-[#9CA3AF] mt-0.5 leading-normal">
                        Try our test builds of Sparkle with new, early unreleased features.
                      </div>
                    </div>

                    <a
                      id="btn-test-vplay-switch"
                      href="https://test-vplay.vercel.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-1.5 rounded-[6px] font-normal text-white bg-[#005fb8] dark:bg-[#4cc2ff] hover:bg-[#0067c0] dark:hover:bg-[#6bd0ff] dark:text-black transition-colors text-xs cursor-default flex items-center justify-center shrink-0 shadow-xs tracking-tight text-center select-none border-none"
                    >
                      <span className="light-mode-white-label">Switch</span>
                    </a>
                  </motion.div>
                )}

                {/* 3. Update Sparkle Option Card */}
                {matchesSearch(['Update Sparkle', 'cập nhật', 'phiên bản mới']) && (
                  <motion.div 
                    variants={slideUpVariant}
                    initial="hidden"
                    animate="visible"
                    custom={elementIndex++}
                    className="rounded-[6px] bg-white dark:bg-[#2c3037] shadow-xs p-4 sm:p-4.5 flex items-center justify-between gap-3 hover:bg-black/[0.02] dark:hover:bg-[#363b43] transition-colors border-none"
                  >
                    <div>
                      <div className="font-normal text-[#111827] dark:text-white text-xs sm:text-sm" style={{ fontWeight: 400 }}>
                        Update Sparkle
                      </div>
                      <div className="text-[11px] sm:text-xs text-[#9CA3AF] mt-0.5 leading-normal">
                        Kiểm tra và cập nhật phiên bản mới nhất của nền tảng Sparkle.
                      </div>
                    </div>

                    <button
                      id="btn-update-vplay"
                      type="button"
                      onClick={onOpenUpdate}
                      className="px-4 py-1.5 rounded-[6px] font-normal text-white bg-[#005fb8] dark:bg-[#4cc2ff] hover:bg-[#0067c0] dark:hover:bg-[#6bd0ff] dark:text-black transition-colors text-xs cursor-default flex items-center justify-center shrink-0 shadow-xs tracking-tight text-center border-none"
                    >
                      <span className="light-mode-white-label">Update</span>
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </section>
        )}
      </div>

      {/* Temporary light mode maintenance lock */}
      <AnimatePresence>
        {isLightModeUnlockOpen && (
          <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6 select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={() => setIsLightModeUnlockOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="light-mode-lock-title"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 1, 
                transition: {
                  duration: 0.24,
                  ease: [0.16, 1, 0.3, 1]
                }
              }}
              exit={{ 
                opacity: 0, 
                transition: {
                  duration: 0.18,
                  ease: [0.16, 1, 0.3, 1]
                }
              }}
              className="fluent-modal-dialog relative z-10 w-full max-w-[480px] bg-white dark:bg-[#202020] rounded-[6px] overflow-hidden shadow-[0_24px_48px_rgba(0,0,0,0.22),0_2px_6px_rgba(0,0,0,0.08)] dark:shadow-[0_24px_48px_rgba(0,0,0,0.7),0_2px_6px_rgba(255,255,255,0.04)] text-[#111827] dark:text-[#F3F4F6] border-none"
            >
              <div className="p-6 pb-5">
                <h2 id="light-mode-lock-title" className="text-[19px] sm:text-[20px] font-semibold text-[#111827] dark:text-white tracking-tight leading-snug">
                  Tính năng bị khóa
                </h2>
                <p className="text-[13.5px] sm:text-[14px] text-[#4b5563] dark:text-[#a1a1aa] leading-relaxed mt-2.5">
                  Chế độ ban ngày tạm thời bị khóa để bảo trì. Nếu bạn là nhà phát triển thử nghiệm tính năng này, hãy nhập mã bảo vệ gồm 6 chữ số.
                </p>
                <input
                  autoFocus
                  inputMode="numeric"
                  maxLength={6}
                  value={lightModeUnlockCode}
                  onChange={(event) => {
                    setLightModeUnlockCode(event.target.value.replace(/\D/g, '').slice(0, 6));
                    setLightModeUnlockError('');
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      if (lightModeUnlockCode === '366761') {
                        updateDraft('theme', 'light');
                        updateDraft('spatialGlassOpacity', 43);
                        setIsLightModeUnlockOpen(false);
                      } else {
                        setLightModeUnlockError('Mã bảo vệ không chính xác.');
                      }
                    }
                  }}
                  placeholder="Nhập mã 6 chữ số"
                  aria-label="Mã bảo vệ"
                  className="mt-4 w-full h-9 rounded-[6px] bg-black/5 dark:bg-[#2c3037] px-3 text-sm text-[#111827] dark:text-white placeholder:text-[#71717a] dark:placeholder:text-[#8e8e8e] outline-none transition-colors border-none"
                />
                {lightModeUnlockError && <p className="mt-2 text-xs text-red-500">{lightModeUnlockError}</p>}
              </div>
              <div className="h-[1px] w-full bg-[#E5E5E5] dark:bg-[#2F2F2F]" />
              <div className="fluent-modal-footer bg-[#F3F3F3] dark:bg-[#1C1C1C] px-6 py-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsLightModeUnlockOpen(false)}
                  className="fluent-btn-secondary px-4 h-8 rounded-[6px] bg-white dark:bg-[#2C2C2C] hover:bg-[#F9F9F9] dark:hover:bg-[#343434] text-[#111827] dark:text-white text-[12.5px] shadow-xs transition-colors cursor-pointer border-none"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (lightModeUnlockCode === '366761') {
                      updateDraft('theme', 'light');
                      updateDraft('spatialGlassOpacity', 43);
                      setIsLightModeUnlockOpen(false);
                    } else {
                      setLightModeUnlockError('Mã bảo vệ không chính xác.');
                    }
                  }}
                  className="fluent-btn-primary px-4 h-8 rounded-[6px] bg-[#0078d4] dark:bg-[#4cc2ff] hover:bg-[#106ebe] dark:hover:bg-[#6bd0ff] text-white dark:text-black font-semibold shadow-xs transition-colors cursor-pointer text-[12.5px] border-none"
                >
                  Unlock
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Apply Feedback Toast */}
      <AnimatePresence>
        {showApplyToast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-2.5 rounded-[6px] bg-[#1E1D24] text-white text-xs sm:text-sm font-normal shadow-2xl border-none"
          >
            <div className="w-5 h-5 rounded-full bg-[#4cc2ff] flex items-center justify-center shrink-0">
              <SfCheckmark className="w-3 h-3" />
            </div>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
