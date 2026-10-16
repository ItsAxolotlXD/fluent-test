import React, { useState, useRef, useEffect } from 'react';
import { 
  Palette,
  Key,
  Type, 
  X,
  Sparkles,
  Sliders,
  Mic,
  MicOff,
  Wrench,
  FlaskConical,
  Keyboard,
  RotateCcw,
  AlertCircle,
  Info,
  Tv,
  Box,
  ChevronRight,
  ChevronLeft,
  Sun,
  Moon,
  Layers
} from 'lucide-react';
import { FlyoutDropdown } from '../components/FlyoutDropdown';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings, FONT_SCALE_CONFIG, SystemSettings } from '../hooks/useSettings';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import { WelcomeModal } from '../components/WelcomeModal';
import { SfCheckmark } from '../components/SfCheckmark';
import { CategoryIcon } from '../components/CategoryIcon';
import { TriangleLoader } from '../components/TriangleLoader';
import { SpinningRing } from '../components/SpinningRing';
import { Fluent3DHomeIcon } from '../components/Fluent3DIcons';
import { KEYBIND_DEFINITIONS, DEFAULT_KEYBINDS, eventToKeyString, validateKeybind } from '../utils/keybinds';
import { KeybindAction } from '../types';

export type SettingsCategoryId = 
  | 'spatial-glass' 
  | 'interface' 
  | 'accessibility' 
  | 'tools' 
  | 'experimental';

interface SettingsCategoryItem {
  id: SettingsCategoryId;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeColor: string;
  keywords: string[];
}

const SETTINGS_GROUP_1: SettingsCategoryItem[] = [
  {
    id: 'spatial-glass',
    title: 'Fluent Design',
    subtitle: 'Acrylic, Mica material effects and modern visual styling',
    icon: Box,
    badgeColor: 'bg-gradient-to-b from-[#4cc2ff] to-[#3bb2ef]',
    keywords: ['fluent', 'design', 'acrylic', 'mica', 'opacity', 'blur', 'windows 11', 'transparency'],
  },
  {
    id: 'interface',
    title: 'Interface',
    subtitle: 'Navigation bar, app theme, text scaling, and display mode',
    icon: Palette,
    badgeColor: 'bg-gradient-to-b from-[#34C759] to-[#248A3D]',
    keywords: ['interface', 'navigation', 'sidebar', 'topbar', 'side view', 'top view', 'floaty', 'tab view', 'theme', 'light mode', 'dark mode', 'font', 'scale', 'super dark'],
  },
  {
    id: 'accessibility',
    title: 'Accessibility',
    subtitle: 'Page loading, motion animations, search scope, and virtual keyboard',
    icon: Key,
    badgeColor: 'bg-gradient-to-b from-[#4cc2ff] to-[#3bb2ef]',
    keywords: ['accessibility', 'page loading', 'load pages sequentially', 'sequential', 'performance', 'spinning ring', 'motion', 'animation', 'reduce all animation', 'search', 'spotlight', 'keyboard', 'clipboard', 'sound', 'keybinds', 'shortcuts', 'hover to expand', 'hover', 'expand', 'sidebar'],
  },
];

const SETTINGS_GROUP_2: SettingsCategoryItem[] = [
  {
    id: 'tools',
    title: 'Tools',
    subtitle: 'Aspect ratio and sidebar auto-hide preferences',
    icon: Wrench,
    badgeColor: 'bg-gradient-to-b from-[#8E8E93] to-[#636366]',
    keywords: ['tools', 'aspect ratio', '16:9', '4:3', 'auto hide', 'sidebar'],
  },
  {
    id: 'experimental',
    title: 'Insider Flags',
    subtitle: 'Preview features and diagnostic flags',
    icon: FlaskConical,
    badgeColor: 'bg-gradient-to-b from-[#8E8E93] to-[#636366]',
    keywords: ['insider flags', 'insider', 'flags', 'experimental', 'lab', 'native keyboard', 'immersive search', 'triangle', 'loader', 'fluent icons', 'fluent icon', '3d icons', 'microsoft fluent design', 'page animation', 'slide up', 'zoom in', 'transition'],
  },
];

const ALL_CATEGORIES = [...SETTINGS_GROUP_1, ...SETTINGS_GROUP_2];

interface SettingsProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onOpenUpdate?: () => void;
  onOpenOfficeTool?: (tool: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  searchQuery: externalSearchQuery,
  onSearchChange: externalOnSearchChange,
  onOpenUpdate,
  onOpenOfficeTool
}) => {
  const { 
    settings, 
    draftSettings, 
    hasChanges, 
    changedKeys, 
    updateDraftSetting, 
    applyDraftSettings 
  } = useSettings();

  const [activeCategory, setActiveCategory] = useState<SettingsCategoryId | null>(null);
  const activeCatObj = ALL_CATEGORIES.find((c) => c.id === activeCategory);
  const [showApplyToast, setShowApplyToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [internalSearchQuery, setInternalSearchQuery] = useState('');

  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const setSearchQuery = (q: string) => {
    setInternalSearchQuery(q);
    externalOnSearchChange?.(q);
  };

  const [isFocused, setIsFocused] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [isLightModeUnlockOpen, setIsLightModeUnlockOpen] = useState(false);
  const [lightModeUnlockCode, setLightModeUnlockCode] = useState('');
  const [lightModeUnlockError, setLightModeUnlockError] = useState('');
  const [editingKeybindId, setEditingKeybindId] = useState<KeybindAction | null>(null);
  const [keybindError, setKeybindError] = useState<{ id: KeybindAction; message: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const shouldAnimateMotion = !draftSettings.reduceAllMotion && draftSettings.animatePageTransitions;

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

  const handleApplySettings = () => {
    if (isSaving) return;
    if (!hasChanges) {
      setToastMessage('All settings are already up to date');
      setShowApplyToast(true);
      setTimeout(() => setShowApplyToast(false), 2200);
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      applyDraftSettings();
      setIsSaving(false);
      setToastMessage(`Applied ${changedKeys.length} settings changes!`);
      setShowApplyToast(true);
      setTimeout(() => setShowApplyToast(false), 2600);
    }, 1000);
  };

  useEffect(() => {
    const handleAppliedEvent = () => {
      setToastMessage('Settings changes applied successfully!');
      setShowApplyToast(true);
      setTimeout(() => setShowApplyToast(false), 2600);
    };
    window.addEventListener('settings-applied-toast', handleAppliedEvent);
    return () => window.removeEventListener('settings-applied-toast', handleAppliedEvent);
  }, []);

  const {
    isListening,
    toggleListening
  } = useVoiceSearch((transcript) => {
    setSearchQuery(transcript);
    setIsFocused(true);
    inputRef.current?.focus();
  });

  const matchesSearch = (text: string) => {
    if (!searchQuery.trim()) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase().trim());
  };

  const [activeNavSection, setActiveNavSection] = useState<string>('settings-section-spatial-glass');

  const navCategories = [
    { id: 'settings-section-spatial-glass', label: 'Fluent Design', icon: Box, color: 'text-[#0078d4] dark:text-[#4cc2ff]', badge: 'bg-[#0078d4]/10 dark:bg-[#4cc2ff]/15', desc: 'Mica & Acrylic' },
    { id: 'settings-section-interface', label: 'Giao diện', icon: Palette, color: 'text-[#34C759]', badge: 'bg-[#34C759]/10', desc: 'Theme & Hiển thị' },
    { id: 'settings-section-tools', label: 'Công cụ', icon: Wrench, color: 'text-[#8E8E93]', badge: 'bg-black/5 dark:bg-white/10', desc: 'Tỉ lệ & Thanh bên' },
    { id: 'settings-section-accessibility', label: 'Trợ năng', icon: Key, color: 'text-[#0078d4] dark:text-[#4cc2ff]', badge: 'bg-[#0078d4]/10 dark:bg-[#4cc2ff]/15', desc: 'Phím tắt & Tải trang' },
    { id: 'settings-section-experimental', label: 'Insider Flags', icon: FlaskConical, color: 'text-[#e81123]', badge: 'bg-[#e81123]/10', desc: 'Tính năng thử nghiệm' },
    { id: 'settings-section-version', label: 'Cập nhật', icon: Info, color: 'text-[#0078d4] dark:text-[#4cc2ff]', badge: 'bg-[#0078d4]/10 dark:bg-[#4cc2ff]/15', desc: 'Thông tin phiên bản' },
  ];

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

  return (
    <div className="w-full max-w-7xl mx-auto pb-28 pt-2 select-none">
      {/* 2-Column Windows 11 Settings Layout */}
      <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
        {/* Left Column: Authentic Windows 11 Navigation Sidebar */}
        <aside className="w-full md:w-64 lg:w-72 shrink-0 md:sticky md:top-3 space-y-3">
          {/* Windows 11 User Profile Tile */}
          <div className="p-3 rounded-xl bg-white/70 dark:bg-[#282c31]/80 backdrop-blur-md border border-black/8 dark:border-white/10 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#005fb8] to-[#4cc2ff] flex items-center justify-center text-white font-bold text-sm shadow-inner shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-sm text-[#111827] dark:text-white truncate">
                Sparkle Waves
              </div>
              <div className="text-[11px] text-[#6b7280] dark:text-[#9ca3af] truncate flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Cài đặt hệ thống
              </div>
            </div>
          </div>

          {/* Search Box in Sidebar - matching exact rules: no line, no border, blue outline on focus, h-[35px] sm:h-[37px] */}
          <div 
            id="settings-search-box"
            onClick={() => {
              setIsFocused(true);
              inputRef.current?.focus();
            }}
            className={`group relative w-full h-[35px] sm:h-[37px] bg-black/5 dark:bg-[#282c31] border-0 flex items-center px-3 gap-2 rounded-[6px] transition-all cursor-text select-none ${
              isFocused
                ? 'ring-2 ring-[#005fb8] dark:ring-[#4cc2ff] bg-white dark:bg-[#282c31]'
                : 'ring-0'
            }`}
          >
            <input
              ref={inputRef}
              id="settings-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Tìm kiếm cài đặt..."
              className="w-full bg-transparent text-xs sm:text-[13px] text-[#111827] dark:text-white placeholder-[#71717a] dark:placeholder-white outline-none border-none py-1 pr-14 no-fluent-line"
            />

            <div className="absolute right-2.5 flex items-center gap-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchQuery('');
                    inputRef.current?.focus();
                  }}
                  className="text-[#71717a] dark:text-[#8e8e8e] hover:text-[#111827] dark:hover:text-white p-0.5 transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleListening();
                }}
                className={`p-0.5 transition-colors cursor-pointer ${
                  isListening
                    ? 'text-[#E6005A] animate-pulse'
                    : 'text-[#71717a] dark:text-[#8e8e8e] hover:text-[#111827] dark:hover:text-white'
                }`}
                title={isListening ? 'Stop listening' : 'Voice search'}
              >
                {isListening ? (
                  <MicOff className="w-3.5 h-3.5" fill="none" />
                ) : (
                  <Mic className="w-3.5 h-3.5" fill="none" />
                )}
              </button>
            </div>
          </div>

          {/* Navigation Categories List */}
          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-1 md:pb-0 scrollbar-none" aria-label="Settings Categories">
            {navCategories.map((cat) => {
              const Icon = cat.icon;
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
                  className={`relative group flex items-center gap-3 px-3 py-2 rounded-lg text-left text-xs sm:text-sm font-medium transition-all shrink-0 md:shrink md:w-full cursor-pointer ${
                    isActive
                      ? 'bg-black/8 dark:bg-white/10 text-[#005fb8] dark:text-[#4cc2ff]'
                      : 'text-[#4b5563] dark:text-[#d1d5db] hover:bg-black/4 dark:hover:bg-white/5 hover:text-[#111827] dark:hover:text-white'
                  }`}
                >
                  {/* Left Accent Pill Indicator (Windows 11 style) */}
                  {isActive && (
                    <span className="hidden md:block absolute left-0 top-2 bottom-2 w-1 bg-[#005fb8] dark:bg-[#4cc2ff] rounded-r-full" />
                  )}

                  <div className={`w-7 h-7 rounded-md ${cat.badge} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}>
                    <Icon className={`w-4 h-4 ${cat.color}`} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-xs sm:text-[13px] truncate">{cat.label}</div>
                    <div className="hidden md:block text-[11px] text-[#6b7280] dark:text-[#9ca3af] font-normal truncate">
                      {cat.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Windows 11 Quick Status Card at sidebar bottom */}
          <div className="hidden md:block p-3 rounded-xl bg-white/40 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 text-[11px] text-[#6b7280] dark:text-[#9ca3af] space-y-1.5">
            <div className="font-semibold text-xs text-[#111827] dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Thiết bị hoạt động
            </div>
            <div className="flex justify-between">
              <span>Chế độ:</span>
              <span className="font-medium text-[#111827] dark:text-white">{draftSettings.theme === 'light' ? 'Ban ngày' : 'Ban đêm'}</span>
            </div>
            <div className="flex justify-between">
              <span>Mica Acrylic:</span>
              <span className="font-medium text-[#111827] dark:text-white">{draftSettings.spatialGlass ? `${draftSettings.spatialGlassOpacity ?? 20}%` : 'Đã tắt'}</span>
            </div>
            <div className="flex justify-between">
              <span>Tỉ lệ:</span>
              <span className="font-medium text-[#111827] dark:text-white">{draftSettings.streamAspectRatio || '16:9'}</span>
            </div>
          </div>
        </aside>

        {/* Right Column: Main Content Area */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* Top Bar Header with Title & Save button */}
          <div className="flex items-center justify-between gap-4 pb-2 border-b border-black/5 dark:border-white/10">
            <div>
              <div className="text-[11px] uppercase tracking-wider font-semibold text-[#0078d4] dark:text-[#4cc2ff]">
                Cài đặt hệ thống
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] dark:text-white tracking-tight">
                Settings
              </h1>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
                Tùy chỉnh toàn diện ngôn ngữ thiết kế Fluent Design, hiệu năng và công cụ hiển thị.
              </p>
            </div>

            {(hasChanges || isSaving) && (
              <button
                type="button"
                id="btn-settings-save"
                disabled={isSaving}
                onClick={handleApplySettings}
                className={`min-w-[80px] h-8 px-4 rounded-full text-xs sm:text-sm flex items-center justify-center shrink-0 tracking-tight text-center select-none shadow-none transition-all ${
                  isSaving
                    ? 'bg-black/5 dark:bg-white/10 text-[#111827] dark:text-white border border-black/10 dark:border-white/15 cursor-default'
                    : 'bg-[#005fb8] dark:bg-[#4cc2ff] hover:bg-[#0067c0] dark:hover:bg-[#6bd0ff] active:bg-[#00458b] dark:active:bg-[#3bb2ef] text-white dark:text-black font-semibold border border-transparent cursor-pointer'
                }`}
              >
                {isSaving ? (
                  <SpinningRing size={16} strokeWidth={2.5} color="currentColor" />
                ) : (
                  <span className="text-white dark:text-black font-semibold">Save</span>
                )}
              </button>
            )}
          </div>

          {/* Windows 11 Hero Status Banner */}
          <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-[#0078d4]/10 via-[#4cc2ff]/5 to-purple-500/10 dark:from-[#4cc2ff]/15 dark:via-cyan-500/10 dark:to-purple-500/10 border border-black/8 dark:border-white/10 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#30353b] border border-black/10 dark:border-white/15 flex items-center justify-center text-[#0078d4] dark:text-[#4cc2ff] shadow-sm shrink-0">
                <Box className="w-7 h-7" />
              </div>
              <div>
                <div className="font-bold text-sm sm:text-base text-[#111827] dark:text-white flex items-center gap-2">
                  <span>Sparkle Waves Fluent</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#0078d4]/10 dark:bg-[#4cc2ff]/20 text-[#0078d4] dark:text-[#4cc2ff]">
                    v26.11
                  </span>
                </div>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
                  Chất liệu Mica & Acrylic · Trải nghiệm thị giác hiện đại theo phong cách Windows 11
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('settings-section-version');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/15 text-[#111827] dark:text-white border border-black/10 dark:border-white/10 transition-colors shadow-xs cursor-pointer"
              >
                Thông tin bản dựng
              </button>
            </div>
          </div>

          {/* Settings Sections Container */}
          <div className="space-y-8">
        {/* SECTION 1: FLUENT DESIGN */}
        <section id="settings-section-spatial-glass" className="space-y-2">
          <div className="flex items-center gap-2.5 px-1 pt-1">
            <Box className="w-5 h-5 text-[#0078d4] dark:text-[#4cc2ff]" />
            <h2 className="text-base sm:text-lg font-bold text-[#111827] dark:text-white tracking-tight">
              Fluent Design
            </h2>
            <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-normal hidden sm:inline">
              — Mica, Acrylic material effects and modern visual styling
            </span>
          </div>
          <div className="rounded-[8px] bg-white dark:bg-[#38383d] border border-[#e5e5e5] dark:border-[#383838] shadow-xs overflow-hidden select-none">
                {/* 1. Fluent Design Master Toggle */}
                <div 
                  id="setting-spatial-glass"
                  className="px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.04]"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="font-semibold text-sm text-[#111827] dark:text-white">
                      <span className="text-[#0078d4] dark:text-[#4cc2ff] font-semibold">
                        Fluent Design (Mica & Acrylic)
                      </span>
                    </div>
                    <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">
                      Ngôn ngữ thiết kế giao diện người dùng Fluent Design của Microsoft, kết hợp hiệu ứng chất liệu Mica và Acrylic, phân cấp thị giác tinh tế và đường nét tối giản hiện đại.
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    id="toggle-spatial-glass"
                    type="button"
                    role="switch"
                    aria-checked={draftSettings.spatialGlass}
                    onClick={() => updateDraft('spatialGlass', !draftSettings.spatialGlass)}
                    className="toggle-switch-btn focus:outline-none"
                    title="Bật/Tắt hiệu ứng Acrylic Fluent Design"
                  >
                    <span
                      className="toggle-switch-thumb"
                    />
                  </button>
                </div>

                <div className="divider-line h-[1px] bg-black/5 dark:bg-white/10 ml-4 mr-4" />

                {/* 2. Slider: Độ trong suốt (Opacity) */}
                <div 
                  id="setting-spatial-glass-opacity"
                  className={`px-4 py-3 sm:py-3.5 space-y-2 transition-opacity duration-200 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] ${
                    !draftSettings.spatialGlass ? 'opacity-40 pointer-events-none' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm text-[#111827] dark:text-white">
                        Độ trong suốt Acrylic (Opacity)
                      </div>
                      <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">
                        Điều chỉnh độ trong suốt của chất liệu Acrylic Fluent Design từ 0% đến 100%. Khi trên 40%, biểu tượng và văn bản sẽ tự động cân bằng tương phản tối ưu.
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold text-[#0078d4] dark:text-[#4cc2ff] px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 shrink-0 ml-2">
                      {draftSettings.spatialGlassOpacity ?? 20}%
                    </span>
                  </div>

                  {/* Clean Slider matching image.png */}
                  <div className="py-2.5 px-1">
                    <div className="group relative w-full h-5 flex items-center transition-all settings-slider-capsule select-none">
                      <input
                        id="slider-spatial-glass-opacity"
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={draftSettings.spatialGlassOpacity ?? 20}
                        onChange={(e) => updateDraft('spatialGlassOpacity', parseInt(e.target.value, 10))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-default z-20"
                        aria-label="Độ trong suốt (Opacity)"
                      />

                      {/* Track */}
                      <div className="settings-slider-track relative w-full h-1 rounded-full bg-[#8a8a8a] dark:bg-[#7f7f84] overflow-visible pointer-events-none z-10">
                        {/* Active Filled Bar */}
                        <div 
                          className="absolute left-0 top-0 h-full rounded-full bg-[#005fb8] dark:bg-[#4cc2ff] transition-all duration-75 ease-out"
                          style={{ width: `${draftSettings.spatialGlassOpacity ?? 20}%` }}
                        />
                        {/* Thumb: Concentric Dark Ring & Blue Dot matching image.png */}
                        <div 
                          id="settings-slider-thumb-opacity"
                          className="settings-slider-thumb"
                          style={{ 
                            left: `${draftSettings.spatialGlassOpacity ?? 20}%`,
                            top: '50%',
                            transform: 'translate(-50%, -50%)'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="divider-line h-[1px] bg-black/5 dark:bg-white/10 ml-4 mr-4" />

                {/* 3. Slider: Độ mờ (Blur) */}
                <div 
                  id="setting-spatial-glass-blur"
                  className={`px-4 py-3 sm:py-3.5 space-y-2 transition-opacity duration-200 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] ${
                    !draftSettings.spatialGlass ? 'opacity-40 pointer-events-none' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm text-[#111827] dark:text-white">
                        Độ mờ Acrylic (Blur)
                      </div>
                      <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">
                        Điều chỉnh độ nhòe phông nền (backdrop blur) của chất liệu Acrylic từ 0% đến 100% cho thanh điều hướng và menu hệ thống.
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold text-[#0078d4] dark:text-[#4cc2ff] px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 shrink-0 ml-2">
                      {draftSettings.spatialGlassBlur ?? 10}%
                    </span>
                  </div>

                  {/* Clean Slider matching image.png */}
                  <div className="py-2.5 px-1">
                    <div className="group relative w-full h-5 flex items-center transition-all settings-slider-capsule select-none">
                      <input
                        id="slider-spatial-glass-blur"
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={draftSettings.spatialGlassBlur ?? 10}
                        onChange={(e) => updateDraft('spatialGlassBlur', parseInt(e.target.value, 10))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-default z-20"
                        aria-label="Độ mờ (Blur)"
                      />

                      {/* Track */}
                      <div className="settings-slider-track relative w-full h-1 rounded-full bg-[#8a8a8a] dark:bg-[#7f7f84] overflow-visible pointer-events-none z-10">
                        {/* Active Filled Bar */}
                        <div 
                          className="absolute left-0 top-0 h-full rounded-full bg-[#005fb8] dark:bg-[#4cc2ff] transition-all duration-75 ease-out"
                          style={{ width: `${draftSettings.spatialGlassBlur ?? 10}%` }}
                        />
                        {/* Thumb: Concentric Dark Ring & Blue Dot matching image.png */}
                        <div 
                          id="settings-slider-thumb-blur"
                          className="settings-slider-thumb"
                          style={{ 
                            left: `${draftSettings.spatialGlassBlur ?? 10}%`,
                            top: '50%',
                            transform: 'translate(-50%, -50%)'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 2: GIAO DIỆN */}
            <section id="settings-section-interface" className="space-y-2">
              <div className="flex items-center gap-2.5 px-1 pt-1">
                <Palette className="w-5 h-5 text-[#34C759]" />
                <h2 className="text-base sm:text-lg font-bold text-[#111827] dark:text-white tracking-tight">
                  Giao diện (Interface)
                </h2>
                <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-normal hidden sm:inline">
                  — Navigation bar, app theme, text scaling, and display mode
                </span>
              </div>
              <div className="rounded-[8px] bg-white dark:bg-[#38383d] border border-[#e5e5e5] dark:border-[#383838] shadow-xs overflow-hidden select-none">
                {/* 1. Chế độ ứng dụng (Ban ngày / Ban đêm) */}
                <div
                  id="setting-theme-mode"
                  className="px-4 py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm text-[#111827] dark:text-white">Chế độ ứng dụng</div>
                    <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">
                      Lựa chọn giao diện sáng hoặc tối cho toàn bộ hệ thống.
                    </div>
                  </div>
                  <div className="settings-segmented-group grid grid-cols-2 gap-1 rounded-md sm:rounded-lg bg-black/5 dark:bg-black/30 border border-black/10 dark:border-white/10 p-1 w-full sm:w-auto sm:min-w-[220px]" role="group" aria-label="Chế độ ứng dụng">
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
                          if (draftSettings.spatialGlassOpacity === 43) {
                            updateDraft('spatialGlassOpacity', 20);
                          }
                        }}
                        className={`flex items-center justify-center gap-1.5 rounded-sm sm:rounded-[6px] px-3 py-1.5 text-xs font-semibold transition-all cursor-default ${
                          (draftSettings.theme || 'dark') === val
                            ? 'bg-[#0078d4] dark:bg-[#4cc2ff] text-white dark:text-black shadow-xs font-normal'
                            : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                        aria-pressed={(draftSettings.theme || 'dark') === val}
                      >
                        <IconComponent className="w-3.5 h-3.5" />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="divider-line h-[1px] bg-black/5 dark:bg-white/10 ml-4 mr-4" />

                {/* 2. Thanh điều hướng */}
                <div className="px-4 py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-sm text-[#111827] dark:text-white">Thanh điều hướng</div>
                      {draftSettings.navigationMode === 'topbar' && (
                        <span className="inline-flex items-center text-[10px] font-semibold text-[#0078d4] dark:text-[#4cc2ff] bg-[#0078d4]/10 dark:bg-[#4cc2ff]/10 px-2 py-0.5 rounded-full">
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
                  <div className="settings-segmented-group grid grid-cols-3 gap-1 rounded-md sm:rounded-lg bg-black/5 dark:bg-black/30 border border-black/10 dark:border-white/10 p-1 w-full sm:w-auto sm:min-w-[280px]" role="group" aria-label="Thanh điều hướng">
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
                        className={`rounded-sm sm:rounded-[6px] px-2.5 py-1.5 text-xs font-normal transition-all cursor-default text-center truncate ${
                          draftSettings.navigationMode === value
                            ? 'bg-[#0078d4] dark:bg-[#4cc2ff] text-white dark:text-black shadow-xs font-normal'
                            : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                        }`} 
                        aria-pressed={draftSettings.navigationMode === value}
                        title={label}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="divider-line h-[1px] bg-black/5 dark:bg-white/10 ml-4 mr-4" />

                {/* 3. Thu phóng giao diện */}
                <div className="px-4 py-3 sm:py-3.5 space-y-2 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <Type className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
                        <span className="font-semibold text-sm text-[#111827] dark:text-white">
                          Thu phóng giao diện
                        </span>
                      </div>
                      <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">
                        Tùy chỉnh kích cỡ giao diện ứng dụng để phù hợp với thiết bị của bạn.
                      </div>
                    </div>
                  </div>

                  {/* Clean Slider matching image.png */}
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

                      {/* Track */}
                      <div className="settings-slider-track relative w-full h-1 rounded-full bg-[#8a8a8a] dark:bg-[#7f7f84] overflow-visible pointer-events-none z-10">
                        {/* Active Filled Bar */}
                        <div 
                          className="absolute left-0 top-0 h-full rounded-full bg-[#0078d4] dark:bg-[#4cc2ff] transition-all duration-150 ease-out"
                          style={{ width: `${(draftSettings.fontScale / (FONT_SCALE_CONFIG.length - 1)) * 100}%` }}
                        />
                        {/* Thumb: Concentric Dark Ring & Blue Dot matching image.png */}
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
                            className={`cursor-default transition-colors py-1 ${alignClass} ${
                              isSelected
                                ? 'text-[#0078d4] dark:text-[#4cc2ff] font-normal text-xs'
                                : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white'
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 4. Vị trí thanh bên (nếu dùng chế độ Side View) */}
                {draftSettings.navigationMode === 'sidebar' && (
                  <>
                    <div className="divider-line h-[1px] bg-black/5 dark:bg-white/10 ml-4 mr-4" />
                    <div
                      id="setting-sidebar-position"
                      className="px-4 py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm text-[#111827] dark:text-white">Vị trí thanh bên (Side View position)</div>
                        <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">Chọn vị trí hiển thị thanh bên trái ho��c phải.</div>
                      </div>
                      <div className="settings-segmented-group grid grid-cols-2 gap-1 rounded-md sm:rounded-lg bg-black/5 dark:bg-black/30 border border-black/10 dark:border-white/10 p-1 w-full sm:w-auto sm:min-w-[180px]">
                        {[
                          ['left', 'Trái'],
                          ['right', 'Phải'],
                        ].map(([pos, label]) => (
                          <button
                            key={pos}
                            type="button"
                            onClick={() => updateDraft('sidebarPosition', pos as 'left' | 'right')}
                            className={`rounded-sm sm:rounded-[6px] px-3 py-1.5 text-xs font-normal transition-all cursor-default text-center ${
                              draftSettings.sidebarPosition === pos
                                ? 'bg-[#0078d4] dark:bg-[#4cc2ff] text-white dark:text-black shadow-xs font-normal'
                                : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div className="divider-line h-[1px] bg-black/5 dark:bg-white/10 ml-4 mr-4" />

                {/* 5. Siêu chế độ tối */}
                <div
                  id="setting-super-dark-mode"
                  className="px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.04]"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="font-semibold text-sm text-[#111827] dark:text-white">
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
                    className="toggle-switch-btn focus:outline-none"
                  >
                    <span
                      className="toggle-switch-thumb"
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* SECTION 3: CÔNG CỤ */}
            <section id="settings-section-tools" className="space-y-2">
              <div className="flex items-center gap-2.5 px-1 pt-1">
                <Wrench className="w-5 h-5 text-[#8E8E93]" />
                <h2 className="text-base sm:text-lg font-bold text-[#111827] dark:text-white tracking-tight">
                  Công cụ (Tools)
                </h2>
                <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-normal hidden sm:inline">
                  — Aspect ratio and sidebar preferences
                </span>
              </div>
              <div className="rounded-[8px] bg-white dark:bg-[#38383d] border border-[#e5e5e5] dark:border-[#383838] shadow-xs overflow-hidden select-none">
                {/* 1. Tỉ lệ khung hình */}
                <div className="px-4 py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Tv className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
                      <span className="font-semibold text-sm text-[#111827] dark:text-white">
                        Tỉ lệ khung hình
                      </span>
                    </div>
                    <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">
                      Chuyển đổi tỉ lệ khung hình khi xem giữa 4:3 hoặc 16:9.
                    </div>
                  </div>
                  <div className="settings-segmented-group grid grid-cols-2 gap-1 rounded-md sm:rounded-lg bg-black/5 dark:bg-black/30 border border-black/10 dark:border-white/10 p-1 w-full sm:w-auto sm:min-w-[220px]">
                    {[
                      { value: '16:9', label: '16:9 (chuẩn rộng)' },
                      { value: '4:3', label: '4:3 (chuẩn vuông)' },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        id={`btn-aspect-${value.replace(':', '-')}`}
                        onClick={() => updateDraft('streamAspectRatio', value as '16:9' | '4:3')}
                        className={`rounded-sm sm:rounded-[6px] px-3 py-1.5 text-xs font-semibold transition-all cursor-default text-center ${
                          draftSettings.streamAspectRatio === value
                            ? 'bg-[#0078d4] dark:bg-[#4cc2ff] text-white dark:text-black shadow-xs font-normal'
                            : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                        aria-pressed={draftSettings.streamAspectRatio === value}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="divider-line h-[1px] bg-black/5 dark:bg-white/10 ml-4 mr-4" />

                {/* 2. Tự động ẩn Side View */}
                <div className="px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.04]">
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="font-semibold text-sm text-[#111827] dark:text-white">
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
                    className="toggle-switch-btn focus:outline-none"
                  >
                    <span
                      className="toggle-switch-thumb"
                    />
                  </button>
                </div>

                <div className="divider-line h-[1px] bg-black/5 dark:bg-white/10 ml-4 mr-4" />

                {/* 3. Sparkle Notes */}
                <div className="px-4 py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm text-[#111827] dark:text-white flex items-center gap-2">
                      <span>Sparkle Notes</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[#0078d4]/10 dark:bg-[#4cc2ff]/20 text-[#0078d4] dark:text-[#4cc2ff]">
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
                    className="px-4 py-1.5 rounded-md font-semibold text-xs text-white bg-[#0078d4] hover:bg-[#106ebe] dark:bg-[#4cc2ff] dark:text-black dark:hover:bg-[#6bd0ff] transition-all flex items-center gap-2 self-start sm:self-auto cursor-default shadow-xs"
                  >
                    <span>Mở Sparkle Notes</span>
                  </button>
                </div>
              </div>
            </section>

            {/* SECTION 4: TRỢ NĂNG */}
            <section id="settings-section-accessibility" className="space-y-3">
              <div className="flex items-center gap-2.5 px-1 pt-1">
                <Key className="w-5 h-5 text-[#0078d4] dark:text-[#4cc2ff]" />
                <h2 className="text-base sm:text-lg font-bold text-[#111827] dark:text-white tracking-tight">
                  Trợ năng (Accessibility)
                </h2>
                <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-normal hidden sm:inline">
                  — Page loading, motion animations, search scope, and virtual keyboard
                </span>
              </div>
              <div className="space-y-4 select-none">
                {/* Section: Điều hướng & Thanh bên (Sidebar & Navigation) */}
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider px-1">
                    ��iều hướng & Thanh bên (Sidebar & Navigation)
                  </div>
                  <section 
                    id="settings-section-sidebar-accessibility"
                    className="rounded-[8px] bg-white dark:bg-[#38383d] border border-[#e5e5e5] dark:border-[#383838] shadow-xs overflow-hidden"
                  >
                    {/* Hover to expand */}
                    <div 
                      id="setting-hover-to-expand"
                      onClick={() => updateDraft('hoverToExpand', !draftSettings.hoverToExpand)}
                      className="px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4 cursor-default hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="font-semibold text-sm text-[#111827] dark:text-white">
                          Hover to expand
                        </div>
                        <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">
                          When the mouse is hovered over the collapsed sidebar, it automatically expands it without changing the tab pages width.
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
                        className="toggle-switch-btn focus:outline-none"
                      >
                        <span className="toggle-switch-thumb" />
                      </button>
                    </div>
                  </section>
                </div>

                {/* Section 1: Tải trang & Hiệu năng */}
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider px-1">
                    Tải trang & Hiệu năng (Page Loading & Performance)
                  </div>
                  <section 
                    id="settings-section-page-loading"
                    className="rounded-[8px] bg-white dark:bg-[#38383d] border border-[#e5e5e5] dark:border-[#383838] shadow-xs overflow-hidden"
                  >
                    {/* Option 1: Page loading */}
                    <div 
                      id="setting-page-loading"
                      onClick={() => updateDraft('pageLoading', !draftSettings.pageLoading)}
                      className="px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4 cursor-default hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="font-semibold text-sm text-[#111827] dark:text-white">
                          Page loading
                        </div>
                        <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">
                          Displays a spinning ring for 1 second before the page finishes loading to improve perceived performance.
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
                        className="toggle-switch-btn focus:outline-none"
                      >
                        <span className="toggle-switch-thumb" />
                      </button>
                    </div>

                    <div className="divider-line h-[1px] bg-black/5 dark:bg-white/10 ml-4 mr-4" />

                    {/* Option 2: Load pages sequentially */}
                    <div 
                      id="setting-load-pages-sequentially"
                      onClick={() => updateDraft('loadPagesSequentially', !draftSettings.loadPagesSequentially)}
                      className="px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4 cursor-default hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="font-semibold text-sm text-[#111827] dark:text-white">
                          Load pages sequentially
                        </div>
                        <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">
                          Loads the initial portion of page content, then displays a loading ring for 1 second when scrolling down to reveal more.
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
                        className="toggle-switch-btn focus:outline-none"
                      >
                        <span className="toggle-switch-thumb" />
                      </button>
                    </div>
                  </section>
                </div>

                {/* Section 2: Hiệu ứng chuyển động */}
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider px-1">
                    Hiệu ứng chuyển động (Motion)
                  </div>
                  <section 
                    id="settings-section-motion"
                    className="rounded-[8px] bg-white dark:bg-[#38383d] border border-[#e5e5e5] dark:border-[#383838] shadow-xs overflow-hidden"
                  >
                    {/* Reduce all animation */}
                    <div 
                      id="setting-motion-reduce-all"
                      onClick={() => updateDraft('reduceAllMotion', !draftSettings.reduceAllMotion)}
                      className="px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4 cursor-default hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="font-semibold text-sm text-[#111827] dark:text-white">
                          Reduce all animation
                        </div>
                        <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">
                          Giảm và tắt toàn bộ các hiệu ứng chuyển động trong ứng dụng.
                        </div>
                      </div>

                      <button
                        id="toggle-motion-reduce-all"
                        type="button"
                        role="switch"
                        aria-checked={draftSettings.reduceAllMotion}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateDraft('reduceAllMotion', !draftSettings.reduceAllMotion);
                        }}
                        className="toggle-switch-btn focus:outline-none"
                      >
                        <span className="toggle-switch-thumb" />
                      </button>
                    </div>

                    {/* Sub-options Container */}
                    <div 
                      className={`transition-opacity duration-200 ${
                        draftSettings.reduceAllMotion 
                          ? 'opacity-35 pointer-events-none select-none filter grayscale-[30%]' 
                          : ''
                      }`}
                    >
                      <div className="divider-line h-[1px] bg-black/5 dark:bg-white/10 ml-4 mr-4" />

                      {/* Side View */}
                      <div 
                        id="setting-motion-sidebar"
                        onClick={() => {
                          if (!draftSettings.reduceAllMotion) {
                            updateDraft('animateSidebar', !draftSettings.animateSidebar);
                          }
                        }}
                        className="px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4 cursor-default hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors pl-6 sm:pl-8"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="font-semibold text-sm text-[#111827] dark:text-white">
                            Side View
                          </div>
                          <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">
                            Hiệu ứng mở rộng/thu gọn và trượt ngăn kéo menu bên.
                          </div>
                        </div>

                        <button
                          id="toggle-motion-sidebar"
                          type="button"
                          role="switch"
                          aria-checked={draftSettings.animateSidebar && !draftSettings.reduceAllMotion}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateDraft('animateSidebar', !draftSettings.animateSidebar);
                          }}
                          className="toggle-switch-btn focus:outline-none"
                        >
                          <span className="toggle-switch-thumb" />
                        </button>
                      </div>

                      <div className="divider-line h-[1px] bg-black/5 dark:bg-white/10 ml-6 sm:ml-8 mr-4" />

                      {/* Hộp thoại */}
                      <div 
                        id="setting-motion-modals"
                        onClick={() => {
                          if (!draftSettings.reduceAllMotion) {
                            updateDraft('animateModals', !draftSettings.animateModals);
                          }
                        }}
                        className="px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4 cursor-default hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors pl-6 sm:pl-8"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="font-semibold text-sm text-[#111827] dark:text-white">
                            Hộp thoại (Modal dialog)
                          </div>
                          <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">
                            Hiệu ứng phóng to, thu nhỏ và làm mờ các cửa sổ bật lên.
                          </div>
                        </div>

                        <button
                          id="toggle-motion-modals"
                          type="button"
                          role="switch"
                          aria-checked={draftSettings.animateModals && !draftSettings.reduceAllMotion}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateDraft('animateModals', !draftSettings.animateModals);
                          }}
                          className="toggle-switch-btn focus:outline-none"
                        >
                          <span className="toggle-switch-thumb" />
                        </button>
                      </div>

                      <div className="divider-line h-[1px] bg-black/5 dark:bg-white/10 ml-6 sm:ml-8 mr-4" />

                      {/* Chuyển trang */}
                      <div 
                        id="setting-motion-page-transitions"
                        onClick={() => {
                          if (!draftSettings.reduceAllMotion) {
                            updateDraft('animatePageTransitions', !draftSettings.animatePageTransitions);
                          }
                        }}
                        className="px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4 cursor-default hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors pl-6 sm:pl-8"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="font-semibold text-sm text-[#111827] dark:text-white">
                            Chuyển trang trong Cài đặt
                          </div>
                          <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">
                            Hiệu ứng trượt ngang mượt mà khi vào hoặc thoát các mục cài đặt.
                          </div>
                        </div>

                        <button
                          id="toggle-motion-page-transitions"
                          type="button"
                          role="switch"
                          aria-checked={draftSettings.animatePageTransitions && !draftSettings.reduceAllMotion}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateDraft('animatePageTransitions', !draftSettings.animatePageTransitions);
                          }}
                          className="toggle-switch-btn focus:outline-none"
                        >
                          <span className="toggle-switch-thumb" />
                        </button>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Section 3: Nội dung Tìm kiếm */}
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider px-1">
                    Nội dung Tìm kiếm
                  </div>
                  <section 
                    id="settings-section-search"
                    className="rounded-[8px] bg-white dark:bg-[#38383d] border border-[#e5e5e5] dark:border-[#383838] shadow-xs overflow-hidden"
                  >
                    {/* Danh mục */}
                    <div 
                      id="setting-search-categories"
                      onClick={() => updateDraft('searchCategories', !draftSettings.searchCategories)}
                      className="px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4 cursor-default hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="font-semibold text-sm text-[#111827] dark:text-white">
                          Danh mục
                        </div>
                        <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">
                          Hiển thị các tab và điều hướng hệ thống (Home, Live TV, News, v.v.).
                        </div>
                      </div>

                      <button
                        id="toggle-search-categories"
                        type="button"
                        role="switch"
                        aria-checked={draftSettings.searchCategories}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateDraft('searchCategories', !draftSettings.searchCategories);
                        }}
                        className="toggle-switch-btn focus:outline-none"
                      >
                        <span className="toggle-switch-thumb" />
                      </button>
                    </div>

                    <div className="divider-line h-[1px] bg-black/5 dark:bg-white/10 ml-4 mr-4" />

                    {/* Tin tức */}
                    <div 
                      id="setting-search-news"
                      onClick={() => updateDraft('searchNews', !draftSettings.searchNews)}
                      className="px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4 cursor-default hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="font-semibold text-sm text-[#111827] dark:text-white">
                          Tin tức
                        </div>
                        <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">
                          Hiển thị các bài viết tin tức, thông báo cộng đồng và sự kiện.
                        </div>
                      </div>

                      <button
                        id="toggle-search-news"
                        type="button"
                        role="switch"
                        aria-checked={draftSettings.searchNews}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateDraft('searchNews', !draftSettings.searchNews);
                        }}
                        className="toggle-switch-btn focus:outline-none"
                      >
                        <span className="toggle-switch-thumb" />
                      </button>
                    </div>

                    <div className="divider-line h-[1px] bg-black/5 dark:bg-white/10 ml-4 mr-4" />

                    {/* Truyền hình */}
                    <div 
                      id="setting-search-tv"
                      onClick={() => updateDraft('searchTv', !draftSettings.searchTv)}
                      className="px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4 cursor-default hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="font-semibold text-sm text-[#111827] dark:text-white">
                          Truyền hình
                        </div>
                        <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">
                          Hiển thị danh sách kênh truyền hình trực tiếp theo tên hoặc nhóm kênh.
                        </div>
                      </div>

                      <button
                        id="toggle-search-tv"
                        type="button"
                        role="switch"
                        aria-checked={draftSettings.searchTv}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateDraft('searchTv', !draftSettings.searchTv);
                        }}
                        className="toggle-switch-btn focus:outline-none"
                      >
                        <span className="toggle-switch-thumb" />
                      </button>
                    </div>

                    <div className="divider-line h-[1px] bg-black/5 dark:bg-white/10 ml-4 mr-4" />

                    {/* Tìm kênh theo số hiệu kênh */}
                    <div 
                      id="setting-search-channel-number"
                      onClick={() => updateDraft('searchChannelNumber', !draftSettings.searchChannelNumber)}
                      className="px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4 cursor-default hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-[#111827] dark:text-white">
                            Tìm kênh theo số hiệu kênh
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#0078d4]/10 dark:bg-[#4cc2ff]/20 text-[#0078d4] dark:text-[#4cc2ff] tracking-wider">
                            CH #
                          </span>
                        </div>
                        <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">
                          Cho phép gõ số kênh (ví dụ: 1, 001, #12, kênh 5) để tìm nhanh.
                        </div>
                      </div>

                      <button
                        id="toggle-search-channel-number"
                        type="button"
                        role="switch"
                        aria-checked={draftSettings.searchChannelNumber}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateDraft('searchChannelNumber', !draftSettings.searchChannelNumber);
                        }}
                        className="toggle-switch-btn focus:outline-none"
                      >
                        <span className="toggle-switch-thumb" />
                      </button>
                    </div>

                    <div className="divider-line h-[1px] bg-black/5 dark:bg-white/10 ml-4 mr-4" />

                    {/* Cài đặt */}
                    <div 
                      id="setting-search-settings"
                      onClick={() => updateDraft('searchSettings', !draftSettings.searchSettings)}
                      className="px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4 cursor-default hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="font-semibold text-sm text-[#111827] dark:text-white">
                          Cài đặt
                        </div>
                        <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">
                          Quản lý và chuy��n nhanh tới các mục tùy chọn hệ thống.
                        </div>
                      </div>

                      <button
                        id="toggle-search-settings"
                        type="button"
                        role="switch"
                        aria-checked={draftSettings.searchSettings}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateDraft('searchSettings', !draftSettings.searchSettings);
                        }}
                        className="toggle-switch-btn focus:outline-none"
                      >
                        <span className="toggle-switch-thumb" />
                      </button>
                    </div>
                  </section>
                </div>

                {/* Section 4: Bàn phím & Âm thanh */}
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider px-1">
                    Bàn phím & Âm thanh
                  </div>
                  <section 
                    id="settings-section-keyboard"
                    className="rounded-[8px] bg-white dark:bg-[#38383d] border border-[#e5e5e5] dark:border-[#383838] shadow-xs overflow-hidden"
                  >
                    {/* Bàn phím số */}
                    <div 
                      id="setting-keyboard-number-row"
                      onClick={() => updateDraft('keyboardNumberRow', !draftSettings.keyboardNumberRow)}
                      className="px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4 cursor-default hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="font-semibold text-sm text-[#111827] dark:text-white">
                          Bàn phím số
                        </div>
                        <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">
                          Hiển thị bàn phím số từ 0 đến 9 ngay trên d���i phím chữ.
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
                        className="toggle-switch-btn focus:outline-none"
                      >
                        <span className="toggle-switch-thumb" />
                      </button>
                    </div>

                    <div className="divider-line h-[1px] bg-black/5 dark:bg-white/10 ml-4 mr-4" />

                    {/* Clipboard */}
                    <div 
                      id="setting-keyboard-clipboard"
                      onClick={() => updateDraft('keyboardClipboard', !draftSettings.keyboardClipboard)}
                      className="px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4 cursor-default hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="font-semibold text-sm text-[#111827] dark:text-white">
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
                        className="toggle-switch-btn focus:outline-none"
                      >
                        <span className="toggle-switch-thumb" />
                      </button>
                    </div>

                    <div className="divider-line h-[1px] bg-black/5 dark:bg-white/10 ml-4 mr-4" />

                    {/* Âm bàn phím */}
                    <div 
                      id="setting-keyboard-sound"
                      onClick={() => updateDraft('keyboardSoundEnabled', !draftSettings.keyboardSoundEnabled)}
                      className="px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4 cursor-default hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="font-semibold text-sm text-[#111827] dark:text-white">
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
                        className="toggle-switch-btn focus:outline-none"
                      >
                        <span className="toggle-switch-thumb" />
                      </button>
                    </div>
                  </section>
                </div>

                {/* Section 5: Tổ hợp phím */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-1">
                    <div className="text-xs font-bold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">
                      Tổ hợp phím
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
                      className="px-2.5 py-1 rounded-md text-xs font-semibold text-[#0078d4] dark:text-[#4cc2ff] hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1.5 shrink-0 cursor-default"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Phím tắt mặc định</span>
                    </button>
                  </div>
                  <section 
                    id="settings-section-keybinds"
                    className="rounded-[8px] bg-white dark:bg-[#38383d] border border-[#e5e5e5] dark:border-[#383838] shadow-xs overflow-hidden"
                  >
                    {/* Keybind items list */}
                    {KEYBIND_DEFINITIONS.map((def, idx) => {
                      const currentKey = draftSettings.customKeybinds?.[def.id] || def.defaultKey;
                      const isEditing = editingKeybindId === def.id;
                      const error = keybindError?.id === def.id ? keybindError.message : null;

                      return (
                        <React.Fragment key={def.id}>
                          <div
                            id={`keybind-row-${def.id}`}
                            className="px-4 py-3 sm:py-3.5 flex flex-col gap-2 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold text-sm text-[#111827] dark:text-white flex items-center gap-2">
                                  <span>{def.label}</span>
                                  {currentKey !== def.defaultKey && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#0078d4]/10 dark:bg-[#4cc2ff]/20 text-[#0078d4] dark:text-[#4cc2ff] font-medium">
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
                                          const targetDef = KEYBIND_DEFINITIONS.find(d => d.id === existingAction[0]);
                                          setKeybindError({
                                            id: def.id,
                                            message: `Tổ hợp này đã gán cho mục "${targetDef?.label || existingAction[0]}".`
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
                                      onBlur={() => {
                                        setEditingKeybindId(null);
                                      }}
                                      className="px-3 py-1.5 text-xs rounded-md bg-[#0078d4]/10 dark:bg-[#4cc2ff]/20 border border-[#0078d4] dark:border-[#4cc2ff] text-[#0078d4] dark:text-[#4cc2ff] font-mono animate-pulse text-center w-36 cursor-default outline-none select-none font-semibold"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingKeybindId(null);
                                        setKeybindError(null);
                                      }}
                                      className="p-1.5 rounded text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 text-xs transition-colors"
                                      title="Hủy"
                                    >
                                      <X className="w-3.5 h-3.5" />
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
                                      className="px-2.5 py-1 rounded-md bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 border border-black/10 dark:border-white/15 text-[#111827] dark:text-white font-mono text-xs font-semibold transition-all active:scale-95 cursor-default"
                                      title="Nhấp để thay đổi phím tắt"
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
                                        className="p-1 rounded text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-default"
                                        title="Khôi phục mặc định"
                                      >
                                        <RotateCcw className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {error && (
                              <div className="flex items-start gap-1.5 text-xs text-red-500 bg-red-500/10 border border-red-500/20 p-2 rounded-md">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                <span>{error}</span>
                              </div>
                            )}
                          </div>
                          {idx < KEYBIND_DEFINITIONS.length - 1 && (
                            <div className="divider-line h-[1px] bg-black/5 dark:bg-white/10 ml-4 mr-4" />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </section>
                </div>
              </div>
            </section>

            {/* SECTION 5: INSIDER FLAGS */}
            <section id="settings-section-experimental" className="space-y-2">
              <div className="flex items-center gap-2.5 px-1 pt-1">
                <FlaskConical className="w-5 h-5 text-[#e81123]" />
                <h2 className="text-base sm:text-lg font-bold text-[#111827] dark:text-white tracking-tight">
                  Insider Flags
                </h2>
                <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-normal hidden sm:inline">
                  — Preview features and diagnostic flags
                </span>
              </div>
              <div className="rounded-[8px] bg-white dark:bg-[#38383d] border border-[#e5e5e5] dark:border-[#383838] shadow-xs overflow-hidden select-none">
                {/* Native keyboard */}
                <div 
                  id="setting-experimental-native-keyboard"
                  onClick={() => updateDraft('nativeKeyboard', !draftSettings.nativeKeyboard)}
                  className="px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4 cursor-default hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="font-semibold text-sm text-[#111827] dark:text-white">
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
                    className="toggle-switch-btn focus:outline-none"
                  >
                    <span className="toggle-switch-thumb" />
                  </button>
                </div>

                <div className="divider-line h-[1px] bg-black/5 dark:bg-white/10 ml-4 mr-4" />

                {/* Immersive search experience */}
                <div 
                  id="setting-experimental-immersive-search"
                  onClick={() => updateDraft('immersiveSearch', !draftSettings.immersiveSearch)}
                  className="px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4 cursor-default hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="font-semibold text-sm text-[#111827] dark:text-white">
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
                    className="toggle-switch-btn focus:outline-none"
                  >
                    <span className="toggle-switch-thumb" />
                  </button>
                </div>

                <div className="divider-line h-[1px] bg-black/5 dark:bg-white/10 ml-4 mr-4" />

                {/* Thử nghiệm "Tam giác" */}
                <div 
                  id="setting-experimental-triangle"
                  onClick={() => updateDraft('triangleExperiment', !draftSettings.triangleExperiment)}
                  className="px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4 cursor-default hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                    <div className="w-9 h-9 flex items-center justify-center shrink-0">
                      <TriangleLoader size={30} glow={false} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm text-[#111827] dark:text-white flex items-center gap-2">
                        <span>Tam giác</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider bg-[#0078d4]/10 dark:bg-[#4cc2ff]/20 text-[#0078d4] dark:text-[#4cc2ff]">
                          Mới
                        </span>
                      </div>
                      <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">
                        Khi bật, biểu tượng loading của app sẽ thay bằng hình tam giác lỗ màu đỏ cam gradient chạy loop liên tục.
                      </div>
                    </div>
                  </div>

                  <button
                    id="toggle-triangle-experiment"
                    type="button"
                    role="switch"
                    aria-checked={draftSettings.triangleExperiment}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateDraft('triangleExperiment', !draftSettings.triangleExperiment);
                    }}
                    className="toggle-switch-btn focus:outline-none"
                  >
                    <span className="toggle-switch-thumb" />
                  </button>
                </div>

                <div className="divider-line h-[1px] bg-black/5 dark:bg-white/10 ml-4 mr-4" />

                {/* Fluent icons */}
                <div 
                  id="setting-experimental-fluent-icons"
                  onClick={() => updateDraft('fluentIcons', !draftSettings.fluentIcons)}
                  className="px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4 cursor-default hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors"
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
                      <div className="font-semibold text-sm text-[#111827] dark:text-white flex items-center gap-2">
                        <span>Fluent icons</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider bg-[#0078d4]/10 dark:bg-[#4cc2ff]/20 text-[#0078d4] dark:text-[#4cc2ff]">
                          Mới
                        </span>
                      </div>
                      <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">
                        Beautifully crafted 3D icons in vibrant colors, insprired by Microsoft Fluent Design
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
                    className="toggle-switch-btn focus:outline-none"
                  >
                    <span className="toggle-switch-thumb" />
                  </button>
                </div>

                <div className="divider-line h-[1px] bg-black/5 dark:bg-white/10 ml-4 mr-4" />

                {/* Page animation */}
                <div
                  id="setting-experimental-page-animation"
                  className="px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4 cursor-default hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                    <div className="w-9 h-9 flex items-center justify-center shrink-0 text-[#0078d4] dark:text-[#4cc2ff]">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm text-[#111827] dark:text-white">Page animation</div>
                      <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal">
                        Choose how pages transition when you switch between tabs
                      </div>
                    </div>
                  </div>

                  <FlyoutDropdown
                    id="dropdown-page-animation"
                    ariaLabel="Page animation"
                    value={draftSettings.pageAnimation}
                    onChange={(v) => updateDraft('pageAnimation', v)}
                    options={[
                      { value: 'slideUp', label: 'Slide up', hint: 'Default' },
                      { value: 'zoomIn', label: 'Zoom in' },
                    ]}
                  />
                </div>
              </div>
            </section>

            {/* SECTION 6: THÔNG TIN PHẦN MỀM & CẬP NHẬT */}
            <section id="settings-section-version" className="space-y-2">
              <div className="flex items-center gap-2.5 px-1 pt-1">
                <Info className="w-5 h-5 text-[#0078d4] dark:text-[#4cc2ff]" />
                <h2 className="text-base sm:text-lg font-bold text-[#111827] dark:text-white tracking-tight">
                  Thông tin phiên bản & Cập nhật
                </h2>
                <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-normal hidden sm:inline">
                  — Build info, testing releases and changelogs
                </span>
              </div>
              <div className="fluent-reveal-item setting-card p-4 sm:p-5 rounded-[8px] bg-white dark:bg-[#38383d] border border-[#e5e5e5] dark:border-[#383838] shadow-xs space-y-3.5 select-none">
                <div className="p-3.5 sm:p-4 rounded-[18px] bg-black/[0.03] dark:bg-white/5 space-y-3 select-text">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-medium text-[#111827] dark:text-white">Software Update</span>
                    <span className="font-semibold text-[#9CA3AF]">26.11</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-medium text-[#111827] dark:text-white">Software Build</span>
                    <span className="font-semibold text-[#9CA3AF]">261016</span>
                  </div>
                  {/* Compatible with Fluent Design */}
                  <div id="settings-compatible-spatial-glass" className="pt-2.5 mt-1 border-t border-black/10 dark:border-white/10 flex items-center">
                    <p className="text-sm sm:text-base font-semibold tracking-tight text-[#111827] dark:text-white">
                      Compatible with{' '}
                      <span className="text-[#4cc2ff] font-semibold">
                        Microsoft Fluent Design.
                      </span>
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-0.5">
                  {/* Test Sparkle Option Card */}
                  <div className="fluent-reveal-item setting-card p-3 sm:p-3.5 rounded-[18px] flex items-center justify-between gap-3 transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                    <div>
                      <div className="font-bold text-[#111827] dark:text-white text-xs sm:text-sm">
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
                      className="px-4 py-1.5 rounded-full font-normal text-white bg-[#005fb8] dark:bg-[#4cc2ff] hover:bg-[#0067c0] dark:hover:bg-[#6bd0ff] dark:text-black active:scale-[0.96] transition-all text-xs cursor-default flex items-center justify-center shrink-0 shadow-md tracking-tight text-center select-none"
                    >
                      <span className="font-normal text-white dark:text-black">Switch</span>
                    </a>
                  </div>

                  {/* Changelogs Option Card */}
                  <div className="fluent-reveal-item setting-card p-3 sm:p-3.5 rounded-[18px] flex items-center justify-between gap-3 transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                    <div>
                      <div className="font-bold text-[#111827] dark:text-white text-xs sm:text-sm">
                        Changelogs
                      </div>
                      <div className="text-[11px] sm:text-xs text-[#9CA3AF] mt-0.5 leading-normal">
                        Danh sách những sự thay đổi trong bản cập nhật mới nhất của Sparkle.
                      </div>
                    </div>

                    <button
                      id="btn-changelogs-read"
                      type="button"
                      onClick={() => setIsWelcomeModalOpen(true)}
                      className="px-4 py-1.5 rounded-full font-normal text-white bg-[#005fb8] dark:bg-[#4cc2ff] hover:bg-[#0067c0] dark:hover:bg-[#6bd0ff] dark:text-black active:scale-[0.96] transition-all text-xs cursor-default flex items-center justify-center shrink-0 shadow-md tracking-tight text-center"
                    >
                      <span className="font-normal text-white dark:text-black">Read</span>
                    </button>
                  </div>

                  {/* Update Sparkle Option Card */}
                  <div className="fluent-reveal-item setting-card p-3 sm:p-3.5 rounded-[18px] flex items-center justify-between gap-3 transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                    <div>
                      <div className="font-bold text-[#111827] dark:text-white text-xs sm:text-sm">
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
                      className="px-4 py-1.5 rounded-full font-normal text-white bg-[#005fb8] dark:bg-[#4cc2ff] hover:bg-[#0067c0] dark:hover:bg-[#6bd0ff] dark:text-black active:scale-[0.96] transition-all text-xs cursor-default flex items-center justify-center shrink-0 shadow-md tracking-tight text-center"
                    >
                      <span className="font-normal text-white dark:text-black">Update</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
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
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ 
                opacity: 0, 
                scale: 1.04,
                transition: {
                  duration: 0.18,
                  ease: [0.16, 1, 0.3, 1]
                }
              }}
              className="fluent-modal-dialog relative z-10 w-full max-w-[480px] bg-white dark:bg-[#202020] rounded-[10px] overflow-hidden shadow-[0_24px_48px_rgba(0,0,0,0.22),0_2px_6px_rgba(0,0,0,0.08)] dark:shadow-[0_24px_48px_rgba(0,0,0,0.7),0_2px_6px_rgba(255,255,255,0.04)] border border-black/[0.08] dark:border-white/[0.08] text-[#111827] dark:text-[#F3F4F6]"
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
                  className="mt-4 w-full h-9 rounded-[6px] bg-black/5 dark:bg-[#282c31] border border-black/10 dark:border-white/10 px-3 text-sm text-[#111827] dark:text-white placeholder:text-[#71717a] dark:placeholder:text-[#8e8e8e] outline-none focus:border-[#0078d4] dark:focus:border-[#4cc2ff] transition-colors"
                />
                {lightModeUnlockError && <p className="mt-2 text-xs text-red-500">{lightModeUnlockError}</p>}
              </div>
              <div className="h-[1px] w-full bg-[#E5E5E5] dark:bg-[#2F2F2F]" />
              <div className="fluent-modal-footer bg-[#F3F3F3] dark:bg-[#1C1C1C] px-6 py-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsLightModeUnlockOpen(false)}
                  className="fluent-btn-secondary px-4 h-8 rounded-[5px] bg-white dark:bg-[#2C2C2C] hover:bg-[#F9F9F9] dark:hover:bg-[#343434] active:bg-[#EEEEEE] dark:active:bg-[#222222] text-[#111827] dark:text-white border border-[#d1d1d1] dark:border-[#3E3E3E] text-[12.5px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors cursor-pointer"
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
                  className="fluent-btn-primary px-4 h-8 rounded-[5px] bg-[#0078d4] dark:bg-[#4cc2ff] hover:bg-[#106ebe] dark:hover:bg-[#6bd0ff] active:bg-[#005a9e] dark:active:bg-[#3bb2ef] text-white dark:text-black font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.1)] transition-colors border border-black/20 cursor-pointer text-[12.5px]"
                >
                  Unlock
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Welcome to Sparkle / Changelogs Modal Dialog */}
      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={() => setIsWelcomeModalOpen(false)}
      />

      {/* Floating Apply Feedback Toast */}
      <AnimatePresence>
        {showApplyToast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[#1E1D24] border border-[#4cc2ff]/60 text-white text-xs sm:text-sm font-semibold shadow-2xl "
          >
            <div className="w-5 h-5 rounded-full bg-[#4cc2ff] flex items-center justify-center shrink-0">
              <SfCheckmark className="w-3 h-3" />
            </div>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
