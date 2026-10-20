import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  ChevronRight,
  Copy,
  ExternalLink,
  Info,
  PanelTop,
  Play,
  X,
} from 'lucide-react';
import { SpinningRing } from '../components/SpinningRing';

const componentGroups = [
  { id: 'section-buttons', label: 'Buttons', count: '04' },
  { id: 'section-toggles', label: 'Toggles', count: '02' },
  { id: 'section-inputs', label: 'Inputs', count: '05' },
  { id: 'section-progress', label: 'Spinning progress', count: '04' },
  { id: 'section-dialogs', label: 'Dialogs', count: '01' },
];

export const WinUI3: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof document !== 'undefined') {
      return !document.documentElement.classList.contains('light-mode');
    }
    return true;
  });
  const [activeGroup, setActiveGroup] = useState('Buttons');
  const [volume, setVolume] = useState(68);
  const [notifications, setNotifications] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProgressActive, setIsProgressActive] = useState(true);
  const [determinateProgress, setDeterminateProgress] = useState(72);
  const [copied, setCopied] = useState(false);

  const primaryAccent = isDarkMode ? '#4cc2ff' : '#005fb8';

  const copyToken = async () => {
    await navigator.clipboard?.writeText(`--winui-accent: ${primaryAccent}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const scrollToSection = (id: string, label: string) => {
    setActiveGroup(label);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className={`winui3 ${isDarkMode ? '' : 'winui3-light'} min-h-full ${isDarkMode ? 'text-white' : 'text-[#111827]'} px-4 py-6 sm:px-7 sm:py-8 lg:px-10 transition-colors duration-150`}>
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-6 border-b border-white/10 dark:border-white/10 pb-7 md:flex-row md:items-end md:justify-between">
          <div>
            <div className={`mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] ${isDarkMode ? 'text-[#ff82ff]' : 'text-[#ff01ff]'}`}>
              <img
                src="https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8e/WinUI.svg/120px-WinUI.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail&_=20241127184612"
                alt=""
                className="size-4 object-contain inline-block"
              />
              <span>Fluent design system</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">WinUI 3</h1>
            <p className={`mt-2 max-w-2xl text-sm leading-6 ${isDarkMode ? 'text-white/55' : 'text-black/60'}`}>A practical collection of familiar Windows controls, ready to use across Waves.</p>
          </div>
          <div className={`flex items-center gap-2 text-xs ${isDarkMode ? 'text-white/45' : 'text-black/50'}`}>
            <span className="size-2 rounded-full bg-emerald-400" /> Library ready
            <button type="button" onClick={copyToken} className={`ml-3 inline-flex items-center gap-1.5 rounded-md border ${isDarkMode ? 'border-white/10 text-white/70 hover:bg-white/10' : 'border-black/10 text-black/70 hover:bg-black/5'} px-2.5 py-1.5 transition cursor-pointer`}>
              {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
              {copied ? 'Copied' : 'Copy token'}
            </button>
          </div>
        </header>

        <div className="grid gap-6 py-7 lg:grid-cols-[200px_1fr]">
          <aside className="hidden lg:block">
            <p className={`mb-3 px-2 text-[11px] font-semibold uppercase tracking-wider ${isDarkMode ? 'text-white/35' : 'text-black/40'}`}>Components</p>
            <nav className="flex flex-col gap-1 sticky top-6" aria-label="WinUI 3 components">
              {componentGroups.map((group) => (
                <button
                  key={group.label}
                  type="button"
                  onClick={() => scrollToSection(group.id, group.label)}
                  className={`flex items-center justify-between rounded-md px-2.5 py-2 text-left text-sm transition cursor-pointer ${
                    activeGroup === group.label
                      ? isDarkMode ? 'bg-white/10 text-white font-medium' : 'bg-black/10 text-black font-semibold'
                      : isDarkMode ? 'text-white/55 hover:bg-white/5 hover:text-white' : 'text-black/60 hover:bg-black/5 hover:text-black'
                  }`}
                >
                  <span>{group.label}</span>
                  <span className={`text-[10px] ${isDarkMode ? 'text-white/30' : 'text-black/35'}`}>{group.count}</span>
                </button>
              ))}
            </nav>
            <div className={`mt-8 rounded-lg border ${isDarkMode ? 'border-white/10 bg-white/[0.03] text-white/45' : 'border-black/10 bg-black/[0.02] text-black/50'} p-3 text-xs leading-5`}>
              Controls follow Fluent spacing, focus states, and accent color tokens ({primaryAccent}).
            </div>
          </aside>

          <main className="flex flex-col gap-6">
            {/* 01 / Actions - Buttons */}
            <section id="section-buttons" className={`rounded-xl border ${isDarkMode ? 'border-white/10 bg-[#30353b]' : 'border-black/10 bg-white shadow-xs'} p-5 sm:p-6 scroll-mt-6`}>
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className={`text-[11px] font-semibold uppercase tracking-wider ${isDarkMode ? 'text-[#4cc2ff]' : 'text-[#005fb8]'}`}>01 / Actions</p>
                  <h2 className="mt-1 text-xl font-bold">Buttons</h2>
                </div>
                <span className={`rounded-full px-2 py-1 text-[10px] ${isDarkMode ? 'bg-white/10 text-white/45' : 'bg-black/10 text-black/60'}`}>Button</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {/* Primary Button: #4cc2ff in Dark Mode (text black), #005fb8 in Light Mode (text white) */}
                <button
                  type="button"
                  className={`inline-flex h-9 items-center gap-2 rounded-md px-4 text-sm font-semibold transition cursor-pointer shadow-xs ${
                    isDarkMode
                      ? 'bg-[#4cc2ff] text-black hover:bg-[#6bd0ff] active:bg-[#3bb2ef]'
                      : 'bg-[#005fb8] text-white hover:bg-[#106ebe] active:bg-[#005a9e]'
                  }`}
                >
                  <Play className="size-3.5 fill-current" /> Primary
                </button>
                <button
                  type="button"
                  className={`h-9 rounded-md border px-4 text-sm font-semibold transition cursor-pointer ${
                    isDarkMode
                      ? 'border-[#4cc2ff]/70 text-[#75d5ff] hover:bg-[#4cc2ff]/10'
                      : 'border-[#005fb8]/70 text-[#005fb8] hover:bg-[#005fb8]/10'
                  }`}
                >
                  Outline
                </button>
                <button
                  type="button"
                  className={`h-9 rounded-md px-4 text-sm font-semibold transition cursor-pointer ${
                    isDarkMode
                      ? 'text-white/70 hover:bg-white/10'
                      : 'text-black/70 hover:bg-black/10'
                  }`}
                >
                  Subtle
                </button>
                <button
                  type="button"
                  disabled
                  className={`h-9 rounded-md px-4 text-sm font-semibold cursor-not-allowed ${
                    isDarkMode
                      ? 'bg-white/10 text-white/30'
                      : 'bg-black/10 text-black/30'
                  }`}
                >
                  Disabled
                </button>
              </div>
            </section>

            {/* 02 / State - Toggles & sliders */}
            <div className="grid gap-6 md:grid-cols-2">
              <section id="section-toggles" className={`rounded-xl border ${isDarkMode ? 'border-white/10 bg-[#30353b]' : 'border-black/10 bg-white shadow-xs'} p-5 sm:p-6 scroll-mt-6`}>
                <p className={`text-[11px] font-semibold uppercase tracking-wider ${isDarkMode ? 'text-[#4cc2ff]' : 'text-[#005fb8]'}`}>02 / State</p>
                <h2 className="mt-1 text-xl font-bold">Toggles & sliders</h2>
                <div className="mt-6 flex flex-col gap-5">
                  <label className="flex items-center justify-between gap-4 text-sm">
                    <span>
                      <span className="block font-medium">Notifications</span>
                      <span className={`text-xs ${isDarkMode ? 'text-white/45' : 'text-black/50'}`}>Get updates from Waves</span>
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={notifications}
                      onClick={() => setNotifications(!notifications)}
                      className={`relative h-6 w-11 rounded-full transition cursor-pointer ${notifications ? (isDarkMode ? 'bg-[#4cc2ff]' : 'bg-[#005fb8]') : (isDarkMode ? 'bg-white/20' : 'bg-black/20')}`}
                    >
                      <span className={`absolute top-1 size-4 rounded-full bg-white shadow transition ${notifications ? 'left-6' : 'left-1'}`} />
                    </button>
                  </label>
                  <label className="flex items-center justify-between gap-4 text-sm">
                    <span>
                      <span className="block font-medium">Dark appearance</span>
                      <span className={`text-xs ${isDarkMode ? 'text-white/45' : 'text-black/50'}`}>Toggle light or dark canvas</span>
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isDarkMode}
                      onClick={() => setIsDarkMode(!isDarkMode)}
                      className={`relative h-6 w-11 rounded-full transition cursor-pointer ${isDarkMode ? 'bg-[#4cc2ff]' : 'bg-[#005fb8]'}`}
                    >
                      <span className={`absolute top-1 size-4 rounded-full bg-white shadow transition ${isDarkMode ? 'left-6' : 'left-1'}`} />
                    </button>
                  </label>
                  <label className="text-sm">
                    <span className="flex justify-between">
                      <span>Volume</span>
                      <span className={isDarkMode ? 'text-white/45' : 'text-black/50'}>{volume}%</span>
                    </span>
                    <input
                      aria-label="Volume"
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(event) => setVolume(Number(event.target.value))}
                      className="winui-slider mt-3 h-1.5 w-full cursor-pointer"
                      style={{ accentColor: primaryAccent }}
                    />
                  </label>
                </div>
              </section>

              {/* 03 / Selection - Checkboxes & radios */}
              <section className={`rounded-xl border ${isDarkMode ? 'border-white/10 bg-[#30353b]' : 'border-black/10 bg-white shadow-xs'} p-5 sm:p-6`}>
                <p className={`text-[11px] font-semibold uppercase tracking-wider ${isDarkMode ? 'text-[#4cc2ff]' : 'text-[#005fb8]'}`}>03 / Selection</p>
                <h2 className="mt-1 text-xl font-bold">Checkboxes & radios</h2>
                <div className="mt-6 flex flex-col gap-4 text-sm">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="winui-checkbox size-4 rounded cursor-pointer" style={{ accentColor: primaryAccent }} />
                    Remember my preference
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="winui-checkbox size-4 rounded cursor-pointer" style={{ accentColor: primaryAccent }} />
                    Show system labels
                  </label>
                  <div className={`my-1 h-px ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`} />
                  <fieldset className="flex flex-col gap-3">
                    <legend className={`mb-1 text-xs ${isDarkMode ? 'text-white/45' : 'text-black/50'}`}>Accent color</legend>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="accent" defaultChecked className="winui-checkbox size-4 cursor-pointer" style={{ accentColor: primaryAccent }} />
                      Primary accent ({primaryAccent})
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="accent" className="winui-checkbox size-4 cursor-pointer" style={{ accentColor: primaryAccent }} />
                      System default
                    </label>
                  </fieldset>
                </div>
              </section>
            </div>

            {/* 04 / Content - Input boxes */}
            <section id="section-inputs" className={`rounded-xl border ${isDarkMode ? 'border-white/10 bg-[#30353b]' : 'border-black/10 bg-white shadow-xs'} p-5 sm:p-6 scroll-mt-6`}>
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className={`text-[11px] font-semibold uppercase tracking-wider ${isDarkMode ? 'text-[#4cc2ff]' : 'text-[#005fb8]'}`}>04 / Content</p>
                  <h2 className="mt-1 text-xl font-bold">Input boxes</h2>
                </div>
                <span className={`text-xs ${isDarkMode ? 'text-white/35' : 'text-black/40'}`}>TextBox · PasswordBox</span>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium">Display name
                  <div className={`group relative w-full h-8 sm:h-8.5 ${isDarkMode ? 'bg-[#282c31] border-white/10' : 'bg-black/5 border-black/10'} border flex items-center px-3 rounded-[6px] transition-all focus-within:border-b-2 ${isDarkMode ? 'focus-within:border-b-[#4cc2ff]' : 'focus-within:border-b-[#005fb8]'} mt-2`}>
                    <input placeholder="Enter a name" className={`w-full bg-transparent text-xs sm:text-[13px] ${isDarkMode ? 'text-white placeholder-white/40' : 'text-[#111827] placeholder-[#71717a]'} outline-none border-none py-1 no-fluent-line`} />
                  </div>
                </label>
                <label className="text-sm font-medium">Email address
                  <div className={`group relative w-full h-8 sm:h-8.5 ${isDarkMode ? 'bg-[#282c31] border-white/10' : 'bg-black/5 border-black/10'} border flex items-center px-3 rounded-[6px] transition-all focus-within:border-b-2 ${isDarkMode ? 'focus-within:border-b-[#4cc2ff]' : 'focus-within:border-b-[#005fb8]'} mt-2`}>
                    <input type="email" placeholder="you@example.com" className={`w-full bg-transparent text-xs sm:text-[13px] ${isDarkMode ? 'text-white placeholder-white/40' : 'text-[#111827] placeholder-[#71717a]'} outline-none border-none py-1 no-fluent-line`} />
                  </div>
                </label>
              </div>
            </section>

            {/* 05 / Progress - Spinning progress (ProgressRing) */}
            <section id="section-progress" className={`rounded-xl border ${isDarkMode ? 'border-white/10 bg-[#30353b]' : 'border-black/10 bg-white shadow-xs'} p-5 sm:p-6 scroll-mt-6`}>
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className={`text-[11px] font-semibold uppercase tracking-wider ${isDarkMode ? 'text-[#4cc2ff]' : 'text-[#005fb8]'}`}>05 / Progress</p>
                  <h2 className="mt-1 text-xl font-bold">Spinning progress</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${isDarkMode ? 'bg-[#4cc2ff]/20 text-[#75d5ff] border border-[#4cc2ff]/30' : 'bg-[#005fb8]/15 text-[#005fb8] border border-[#005fb8]/25'}`}>
                    <span className="size-2 rounded-full" style={{ backgroundColor: primaryAccent }} />
                    {isDarkMode ? 'Dark #4cc2ff' : 'Light #005fb8'}
                  </span>
                  <span className={`rounded-full px-2 py-1 text-[10px] ${isDarkMode ? 'bg-white/10 text-white/45' : 'bg-black/10 text-black/60'}`}>ProgressRing</span>
                </div>
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-white/55' : 'text-black/60'} -mt-3 mb-5`}>
                Displays indeterminate or determinate circular progress for ongoing operations, using the primary button accent ({isDarkMode ? '#4cc2ff' : '#005fb8'}).
              </p>
              
              <div className="grid gap-6 md:grid-cols-2 items-center">
                {/* Live Preview Area */}
                <div className={`flex flex-wrap items-center justify-around gap-6 p-6 rounded-lg ${isDarkMode ? 'bg-black/25 border-white/5' : 'bg-black/[0.03] border-black/5'} border min-h-[140px]`}>
                  {/* Small (20px) */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-14 flex items-center justify-center">
                      {isProgressActive ? (
                        <SpinningRing size={20} strokeWidth={3} color={primaryAccent} />
                      ) : (
                        <div className={`w-5 h-5 rounded-full border-2 ${isDarkMode ? 'border-white/20' : 'border-black/20'} border-dashed`} />
                      )}
                    </div>
                    <span className={`text-[11px] ${isDarkMode ? 'text-white/50' : 'text-black/55'} font-medium`}>Small (20px)</span>
                  </div>

                  {/* Medium (36px) - Standard */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-14 flex items-center justify-center">
                      {isProgressActive ? (
                        <SpinningRing size={36} strokeWidth={4} color={primaryAccent} />
                      ) : (
                        <div className={`w-9 h-9 rounded-full border-2 ${isDarkMode ? 'border-white/20' : 'border-black/20'} border-dashed`} />
                      )}
                    </div>
                    <span className={`text-[11px] ${isDarkMode ? 'text-white/50' : 'text-black/55'} font-medium`}>Medium (36px)</span>
                  </div>

                  {/* Large (52px) */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-14 flex items-center justify-center">
                      {isProgressActive ? (
                        <SpinningRing size={52} strokeWidth={5} color={primaryAccent} />
                      ) : (
                        <div className={`w-13 h-13 rounded-full border-2 ${isDarkMode ? 'border-white/20' : 'border-black/20'} border-dashed`} />
                      )}
                    </div>
                    <span className={`text-[11px] ${isDarkMode ? 'text-white/50' : 'text-black/55'} font-medium`}>Large (52px)</span>
                  </div>

                  {/* Determinate Circular Progress */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-14 flex items-center justify-center relative">
                      <svg width="44" height="44" viewBox="0 0 44 44" className="rotate-[-90deg]">
                        <circle
                          cx="22"
                          cy="22"
                          r="18"
                          fill="none"
                          stroke={isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}
                          strokeWidth="4"
                        />
                        <circle
                          cx="22"
                          cy="22"
                          r="18"
                          fill="none"
                          stroke={primaryAccent}
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray={`${(determinateProgress / 100) * (2 * Math.PI * 18)} ${(2 * Math.PI * 18)}`}
                          className="transition-all duration-200"
                        />
                      </svg>
                      <span className={`absolute text-[10px] font-bold ${isDarkMode ? 'text-white' : 'text-[#111827]'}`}>
                        {determinateProgress}%
                      </span>
                    </div>
                    <span className={`text-[11px] ${isDarkMode ? 'text-white/50' : 'text-black/55'} font-medium`}>Determinate</span>
                  </div>
                </div>

                {/* Interactive Controls & Code */}
                <div className="flex flex-col gap-4">
                  <label className="flex items-center justify-between gap-4 text-sm">
                    <span>
                      <span className="block font-medium">IsActive state</span>
                      <span className={`text-xs ${isDarkMode ? 'text-white/45' : 'text-black/50'}`}>Toggle spinning animation on or off</span>
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isProgressActive}
                      onClick={() => setIsProgressActive(!isProgressActive)}
                      className={`relative h-6 w-11 rounded-full transition cursor-pointer ${
                        isProgressActive ? (isDarkMode ? 'bg-[#4cc2ff]' : 'bg-[#005fb8]') : (isDarkMode ? 'bg-white/20' : 'bg-black/20')
                      }`}
                    >
                      <span
                        className={`absolute top-1 size-4 rounded-full bg-white shadow transition ${
                          isProgressActive ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  </label>

                  <label className="text-sm">
                    <span className="flex justify-between">
                      <span className="font-medium">Determinate value</span>
                      <span className={isDarkMode ? 'text-white/45' : 'text-black/50'}>{determinateProgress}%</span>
                    </span>
                    <input
                      aria-label="Determinate value"
                      type="range"
                      min="0"
                      max="100"
                      value={determinateProgress}
                      onChange={(e) => setDeterminateProgress(Number(e.target.value))}
                      className="winui-slider mt-2 h-1.5 w-full cursor-pointer"
                      style={{ accentColor: primaryAccent }}
                    />
                  </label>

                  <div className={`p-3 rounded-lg border ${isDarkMode ? 'border-white/10 bg-black/30' : 'border-black/10 bg-black/[0.04]'} text-xs font-mono space-y-1`}>
                    <div className={isDarkMode ? 'text-white/40' : 'text-black/45'}>// WinUI 3 XAML Control</div>
                    <div className={`${isDarkMode ? 'text-[#4cc2ff]' : 'text-[#005fb8]'} font-semibold truncate`}>
                      &lt;ProgressRing IsActive="{isProgressActive ? 'True' : 'False'}" Width="36" Height="36" /&gt;
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Dialog section */}
            <section id="section-dialogs" className={`flex flex-col gap-4 rounded-xl border ${isDarkMode ? 'border-[#4cc2ff]/25 bg-[#4cc2ff]/[0.06]' : 'border-[#005fb8]/25 bg-[#005fb8]/[0.04]'} p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 scroll-mt-6`}>
              <div className="flex gap-3">
                <Info className={`mt-0.5 size-5 shrink-0 ${isDarkMode ? 'text-[#4cc2ff]' : 'text-[#005fb8]'}`} />
                <div>
                  <h2 className="font-bold">Modal popup dialogs</h2>
                  <p className={`mt-1 text-sm ${isDarkMode ? 'text-white/50' : 'text-black/55'}`}>Preview an accessible confirmation dialog with keyboard-friendly actions.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDialogOpen(true)}
                className={`inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition cursor-pointer shadow-xs ${
                  isDarkMode
                    ? 'bg-[#4cc2ff] text-black hover:bg-[#6bd0ff] active:bg-[#3bb2ef]'
                    : 'bg-[#005fb8] text-white hover:bg-[#106ebe] active:bg-[#005a9e]'
                }`}
              >
                Open dialog <ChevronRight className="size-4" />
              </button>
            </section>
          </main>
        </div>
      </div>

      <AnimatePresence>
        {isDialogOpen && (
          <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6 select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={() => setIsDialogOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="winui-dialog-title"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                transition: {
                  duration: 0.24,
                  ease: [0.16, 1, 0.3, 1]
                }
              }}
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
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#005fb8] dark:text-[#4cc2ff]">ContentDialog</p>
                    <h2 id="winui-dialog-title" className="mt-2 text-[19px] sm:text-[20px] font-semibold tracking-tight text-[#111827] dark:text-white leading-snug">Apply these settings?</h2>
                  </div>
                  <button type="button" aria-label="Close dialog" onClick={() => setIsDialogOpen(false)} className="rounded-md p-1.5 text-[#4b5563] hover:bg-[#f3f3f3] dark:text-white/45 dark:hover:bg-white/10 cursor-pointer">
                    <X className="size-4" />
                  </button>
                </div>
                <p className="mt-2.5 text-[13.5px] sm:text-[14px] leading-relaxed text-[#4b5563] dark:text-[#a1a1aa] font-normal">
                  Your selected controls will be applied to the current workspace.
                </p>
              </div>
              <div className="h-[1px] w-full bg-[#E5E5E5] dark:bg-[#2F2F2F]" />
              <div className="fluent-modal-footer bg-[#F3F3F3] dark:bg-[#1C1C1C] px-6 py-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="fluent-btn-secondary px-4 h-8 rounded-[5px] bg-white dark:bg-[#2C2C2C] hover:bg-[#F9F9F9] dark:hover:bg-[#343434] active:bg-[#EEEEEE] dark:active:bg-[#222222] text-[#111827] dark:text-[#FFFFFF] border border-[#d1d1d1] dark:border-[#3E3E3E] text-[12.5px] font-normal shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors flex items-center justify-center cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className={`fluent-btn-primary px-4 h-8 rounded-[5px] ${isDarkMode ? 'bg-[#4cc2ff] text-black hover:bg-[#6bd0ff]' : 'bg-[#005fb8] text-white hover:bg-[#106ebe]'} font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.1)] transition-colors border border-black/20 flex items-center justify-center cursor-pointer text-[12.5px]`}
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WinUI3;
