import React, { useState } from 'react';
import {
  Check,
  ChevronRight,
  Copy,
  ExternalLink,
  Info,
  PanelTop,
  Play,
  Search,
  X,
} from 'lucide-react';

const componentGroups = [
  { label: 'Buttons', count: '04' },
  { label: 'Toggles', count: '02' },
  { label: 'Inputs', count: '05' },
  { label: 'Dialogs', count: '01' },
];

export const WinUI3: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [volume, setVolume] = useState(68);
  const [notifications, setNotifications] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToken = async () => {
    await navigator.clipboard?.writeText('--winui-accent: #4cc2ff');
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className={`winui3 ${isDarkMode ? '' : 'winui3-light'} min-h-full bg-[#282c31] px-4 py-6 text-white sm:px-7 sm:py-8 lg:px-10`}>
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-6 border-b border-white/10 pb-7 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#4cc2ff]">
              <PanelTop className="size-4" /> Fluent design system
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">WinUI 3</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">A practical collection of familiar Windows controls, ready to use across Waves.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/45">
            <span className="size-2 rounded-full bg-emerald-400" /> Library ready
            <button type="button" onClick={copyToken} className="ml-3 inline-flex items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1.5 text-white/70 transition hover:bg-white/10">
              {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
              {copied ? 'Copied' : 'Copy token'}
            </button>
          </div>
        </header>

        <div className="grid gap-6 py-7 lg:grid-cols-[180px_1fr]">
          <aside className="hidden lg:block">
            <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-wider text-white/35">Components</p>
            <nav className="flex flex-col gap-1" aria-label="WinUI 3 components">
              {componentGroups.map((group, index) => (
                <button key={group.label} type="button" className={`flex items-center justify-between rounded-md px-2.5 py-2 text-left text-sm ${index === 0 ? 'bg-white/10 text-white' : 'text-white/55 hover:bg-white/5 hover:text-white'}`}>
                  <span>{group.label}</span><span className="text-[10px] text-white/30">{group.count}</span>
                </button>
              ))}
            </nav>
            <div className="mt-8 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs leading-5 text-white/45">
              Controls follow Fluent spacing, focus states, and accent color tokens.
            </div>
          </aside>

          <main className="flex flex-col gap-6">
            <section className="rounded-xl border border-white/10 bg-[#30353b] p-5 sm:p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div><p className="text-[11px] font-semibold uppercase tracking-wider text-[#4cc2ff]">01 / Actions</p><h2 className="mt-1 text-xl font-bold">Buttons</h2></div>
                <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] text-white/45">Button</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" className="inline-flex h-9 items-center gap-2 rounded-md bg-[#4cc2ff] px-4 text-sm font-semibold text-black transition hover:bg-[#6bd0ff]"><Play className="size-3.5 fill-current" /> Primary</button>
                <button type="button" className="h-9 rounded-md border border-[#4cc2ff]/70 px-4 text-sm font-semibold text-[#75d5ff] transition hover:bg-[#4cc2ff]/10">Outline</button>
                <button type="button" className="h-9 rounded-md px-4 text-sm font-semibold text-white/70 transition hover:bg-white/10">Subtle</button>
                <button type="button" disabled className="h-9 rounded-md bg-white/10 px-4 text-sm font-semibold text-white/30">Disabled</button>
              </div>
            </section>

            <div className="grid gap-6 md:grid-cols-2">
              <section className="rounded-xl border border-white/10 bg-[#30353b] p-5 sm:p-6">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#4cc2ff]">02 / State</p><h2 className="mt-1 text-xl font-bold">Toggles & sliders</h2>
                <div className="mt-6 flex flex-col gap-5">
                  <label className="flex items-center justify-between gap-4 text-sm"><span><span className="block font-medium">Notifications</span><span className="text-xs text-white/45">Get updates from Waves</span></span><button type="button" role="switch" aria-checked={notifications} onClick={() => setNotifications(!notifications)} className={`relative h-6 w-11 rounded-full transition ${notifications ? 'bg-[#4cc2ff]' : 'bg-white/20'}`}><span className={`absolute top-1 size-4 rounded-full bg-white shadow transition ${notifications ? 'left-6' : 'left-1'}`} /></button></label>
                  <label className="flex items-center justify-between gap-4 text-sm"><span><span className="block font-medium">Dark appearance</span><span className="text-xs text-white/45">Use the dark canvas</span></span><button type="button" role="switch" aria-checked={isDarkMode} onClick={() => setIsDarkMode(!isDarkMode)} className={`relative h-6 w-11 rounded-full transition ${isDarkMode ? 'bg-[#4cc2ff]' : 'bg-white/20'}`}><span className={`absolute top-1 size-4 rounded-full bg-white shadow transition ${isDarkMode ? 'left-6' : 'left-1'}`} /></button></label>
                  <label className="text-sm"><span className="flex justify-between"><span>Volume</span><span className="text-white/45">{volume}%</span></span><input aria-label="Volume" type="range" min="0" max="100" value={volume} onChange={(event) => setVolume(Number(event.target.value))} className="winui-slider mt-3 h-1.5 w-full" /></label>
                </div>
              </section>

              <section className="rounded-xl border border-white/10 bg-[#30353b] p-5 sm:p-6">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#4cc2ff]">03 / Selection</p><h2 className="mt-1 text-xl font-bold">Checkboxes & radios</h2>
                <div className="mt-6 flex flex-col gap-4 text-sm">
                  <label className="flex items-center gap-3"><input type="checkbox" defaultChecked className="winui-checkbox size-4" /> Remember my preference</label>
                  <label className="flex items-center gap-3"><input type="checkbox" className="winui-checkbox size-4" /> Show system labels</label>
                  <div className="my-1 h-px bg-white/10" />
                  <fieldset className="flex flex-col gap-3"><legend className="mb-1 text-xs text-white/45">Accent color</legend><label className="flex items-center gap-3"><input type="radio" name="accent" defaultChecked className="winui-checkbox size-4" /> Blue accent</label><label className="flex items-center gap-3"><input type="radio" name="accent" className="winui-checkbox size-4" /> System default</label></fieldset>
                </div>
              </section>
            </div>

            <section className="rounded-xl border border-white/10 bg-[#30353b] p-5 sm:p-6">
              <div className="mb-5 flex items-start justify-between gap-4"><div><p className="text-[11px] font-semibold uppercase tracking-wider text-[#4cc2ff]">04 / Content</p><h2 className="mt-1 text-xl font-bold">Input boxes</h2></div><span className="text-xs text-white/35">TextBox · PasswordBox</span></div>
              <div className="grid gap-4 md:grid-cols-2"><label className="text-sm font-medium">Display name<div className="winui-search-input mt-2"><Search aria-hidden="true" /><input placeholder="Enter a name" /></div></label><label className="text-sm font-medium">Email address<div className="winui-search-input mt-2"><Search aria-hidden="true" /><input type="email" placeholder="you@example.com" /></div></label></div>
            </section>

            <section className="flex flex-col gap-4 rounded-xl border border-[#4cc2ff]/25 bg-[#4cc2ff]/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div className="flex gap-3"><Info className="mt-0.5 size-5 shrink-0 text-[#4cc2ff]" /><div><h2 className="font-bold">Modal popup dialogs</h2><p className="mt-1 text-sm text-white/50">Preview an accessible confirmation dialog with keyboard-friendly actions.</p></div></div><button type="button" onClick={() => setIsDialogOpen(true)} className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-[#4cc2ff] px-4 text-sm font-semibold text-black transition hover:bg-[#6bd0ff]">Open dialog <ChevronRight className="size-4" /></button></section>
          </main>
        </div>
      </div>

      {isDialogOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs" role="presentation" onMouseDown={() => setIsDialogOpen(false)}><section role="dialog" aria-modal="true" aria-labelledby="winui-dialog-title" onMouseDown={(event) => event.stopPropagation()} className="fluent-modal-dialog winui-dialog w-full max-w-[480px] overflow-hidden rounded-[10px] border border-black/[0.08] bg-white text-[#111827] shadow-[0_24px_48px_rgba(0,0,0,0.22),0_2px_6px_rgba(0,0,0,0.08)] dark:border-white/[0.08] dark:bg-[#202020] dark:text-[#f3f4f6] dark:shadow-[0_24px_48px_rgba(0,0,0,0.7),0_2px_6px_rgba(255,255,255,0.04)]"><div className="p-6 pb-5"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-[#0078d4] dark:text-[#4cc2ff]">ContentDialog</p><h2 id="winui-dialog-title" className="mt-2 text-[19px] font-semibold tracking-tight">Apply these settings?</h2></div><button type="button" aria-label="Close dialog" onClick={() => setIsDialogOpen(false)} className="rounded-md p-1.5 text-[#4b5563] hover:bg-[#f3f3f3] dark:text-white/45 dark:hover:bg-white/10"><X className="size-4" /></button></div><p className="mt-2.5 text-sm leading-relaxed text-[#4b5563] dark:text-[#a1a1aa]">Your selected controls will be applied to the current workspace.</p></div><div className="h-px w-full bg-[#e5e5e5] dark:bg-[#2f2f2f]" /><div className="flex items-center justify-end gap-2.5 bg-[#f3f3f3] px-6 py-3 dark:bg-[#1c1c1c]"><button type="button" onClick={() => setIsDialogOpen(false)} className="h-8 rounded-[5px] border border-[#d1d1d1] bg-white px-4 text-[12.5px] text-[#111827] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-[#f9f9f9] dark:border-[#3e3e3e] dark:bg-[#2c2c2c] dark:text-white dark:hover:bg-[#343434]">Cancel</button><button type="button" onClick={() => setIsDialogOpen(false)} className="h-8 rounded-[5px] border border-black/20 bg-[#0078d4] px-4 text-[12.5px] font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#106ebe] dark:bg-[#4cc2ff] dark:text-black dark:hover:bg-[#6bd0ff]">Apply</button></div></section></div>}
    </div>
  );
};

export default WinUI3;
