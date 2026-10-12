import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  RefreshCw, 
  Radio, 
  ExternalLink, 
  AlertCircle,
  Search,
  Sparkles,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Flame,
  Tv
} from 'lucide-react';
import { Channel } from '../types';
import { fetchChannelEpgGuide, EpgProgram, EpgGuideResponse } from '../services/epgService';
import { SpinningRing } from './SpinningRing';

interface EpgScheduleWidgetProps {
  currentChannel: Channel;
  className?: string;
}

export const EpgScheduleWidget: React.FC<EpgScheduleWidgetProps> = ({
  currentChannel,
  className = '',
}) => {
  const [guideData, setGuideData] = useState<EpgGuideResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [expandedProgramId, setExpandedProgramId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [currentTimeText, setCurrentTimeText] = useState<string>('');

  const listContainerRef = useRef<HTMLDivElement>(null);
  const liveProgramRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const clockIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update clock display
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      setCurrentTimeText(`${hh}:${mm}:${ss}`);
    };
    updateClock();
    clockIntervalRef.current = setInterval(updateClock, 1000);
    return () => {
      if (clockIntervalRef.current) clearInterval(clockIntervalRef.current);
    };
  }, []);

  // Fetch EPG for current channel and date
  const loadEpg = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const data = await fetchChannelEpgGuide(currentChannel, selectedDate || undefined, isManualRefresh);
      setGuideData(data);
      if (!selectedDate && data.dates && data.dates.length > 0) {
        // Today is typically the middle or current date in the array
        const todayStr = new Date().toISOString().slice(0, 10);
        const match = data.dates.find((d) => d === todayStr) || data.dates[0];
        setSelectedDate(match);
      }
    } catch (err: any) {
      console.warn('Lỗi tải lịch phát sóng từ epg.io.vn:', err);
      setError('Không thể tải lịch phát sóng từ epg.io.vn. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentChannel, selectedDate]);

  // Load when currentChannel changes or selectedDate changes
  useEffect(() => {
    loadEpg(false);
  }, [currentChannel.id, selectedDate]);

  // Background auto-refresh every 3 minutes for daily real-time accuracy
  useEffect(() => {
    pollIntervalRef.current = setInterval(() => {
      loadEpg(true);
    }, 3 * 60 * 1000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [loadEpg]);

  // Filter programs by selected date and search text
  const displayedPrograms = useMemo(() => {
    if (!guideData?.programs) return [];
    let list = guideData.programs;

    // Filter by selected date
    if (selectedDate) {
      list = list.filter((p) => p.start.startsWith(selectedDate));
    }

    // Filter by search query
    if (filterQuery.trim()) {
      const q = filterQuery.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.startTimeText.includes(q)
      );
    }

    return list;
  }, [guideData, selectedDate, filterQuery]);

  // Find currently live program
  const liveProgram = useMemo(() => {
    return displayedPrograms.find((p) => p.isLive) || guideData?.programs.find((p) => p.isLive);
  }, [displayedPrograms, guideData]);

  // Scroll to current live program
  const scrollToLive = useCallback(() => {
    if (liveProgramRef.current && listContainerRef.current) {
      liveProgramRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  // Auto-scroll on initial load when live program is ready
  useEffect(() => {
    if (!isLoading && liveProgram) {
      const t = setTimeout(scrollToLive, 350);
      return () => clearTimeout(t);
    }
  }, [isLoading, liveProgram?.id, scrollToLive]);

  // Format date tab labels
  const formatDateLabel = (dateStr: string) => {
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const d = new Date(dateStr);
      const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      const dayName = dayNames[d.getDay()];
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');

      if (dateStr === todayStr) {
        return `Hôm nay (${day}/${month})`;
      }
      return `${dayName} ${day}/${month}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      id="epg-schedule-widget"
      className={`fluent-card flex flex-col h-full max-h-[580px] lg:max-h-[620px] rounded-2xl bg-white dark:bg-[#38383d] border border-black/10 dark:border-white/10 shadow-sm overflow-hidden select-none ${className}`}
    >
      {/* 1. Header Bar */}
      <div className="p-3.5 sm:p-4 border-b border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-black/20 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#4cc2ff]/15 text-[#4cc2ff] flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-bold text-[#111827] dark:text-white truncate leading-tight">
                  Lịch phát sóng
                </h3>
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live EPG
                </span>
              </div>
              <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] truncate">
                Nguồn: <span className="font-medium text-[#4cc2ff]">epg.io.vn</span>
                {currentTimeText && ` • ${currentTimeText}`}
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {liveProgram && (
              <button
                type="button"
                onClick={scrollToLive}
                title="Cuộn tới chương trình đang phát"
                className="px-2 py-1 rounded-[6px] text-[11px] font-medium bg-[#4cc2ff]/15 hover:bg-[#4cc2ff]/25 active:scale-95 text-[#0078d4] dark:text-[#4cc2ff] border border-[#4cc2ff]/30 transition-all flex items-center gap-1 cursor-pointer"
              >
                <Radio className="w-3 h-3 animate-pulse" />
                <span className="hidden sm:inline">Đang chiếu</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => loadEpg(true)}
              disabled={isRefreshing || isLoading}
              title="Làm mới lịch phát sóng"
              className={`p-1.5 rounded-[6px] text-neutral-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer ${
                isRefreshing ? 'animate-spin text-[#4cc2ff]' : ''
              }`}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Date Tabs & Search Filter */}
        <div className="flex items-center justify-between gap-1.5 pt-1">
          {guideData?.dates && guideData.dates.length > 0 ? (
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 max-w-full">
              {guideData.dates.map((dateStr) => {
                const isSelected = selectedDate === dateStr;
                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => setSelectedDate(dateStr)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-[#4cc2ff] text-black font-bold shadow-xs'
                        : 'bg-black/5 dark:bg-white/10 text-[#4B5563] dark:text-[#D1D5DB] hover:bg-black/10 dark:hover:bg-white/15'
                    }`}
                  >
                    {formatDateLabel(dateStr)}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-[11px] text-[#9CA3AF]">Hôm nay</div>
          )}

          {/* Search toggle or quick query */}
          <div className="relative shrink-0 w-28 sm:w-36">
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Tìm CT..."
              className="w-full h-7 pl-6 pr-2 rounded-full text-[11px] bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 text-[#111827] dark:text-white placeholder-neutral-400 outline-none focus:border-[#4cc2ff]"
            />
            <Search className="w-3 h-3 text-neutral-400 absolute left-2 top-2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 3. Program Schedule List */}
      <div 
        ref={listContainerRef}
        className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-2 no-scrollbar"
      >
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center space-y-3">
            <SpinningRing size={38} strokeWidth={3.5} color="#4cc2ff" />
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              Đang tải lịch phát sóng từ epg.io.vn...
            </p>
          </div>
        ) : error ? (
          <div className="h-56 p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-dashed border-black/10 dark:border-white/10 flex flex-col items-center justify-center text-center space-y-2.5">
            <AlertCircle className="w-8 h-8 text-amber-500/80" />
            <p className="text-xs text-[#111827] dark:text-white font-medium max-w-[260px]">
              {error}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => loadEpg(true)}
                className="px-3 py-1 rounded-[6px] text-xs font-semibold bg-[#4cc2ff] text-black hover:bg-[#6bd0ff] transition-all cursor-pointer"
              >
                Thử lại
              </button>
              <a
                href="https://epg.io.vn/"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 rounded-[6px] text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:underline inline-flex items-center gap-1"
              >
                <span>Xem trên epg.io.vn</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ) : displayedPrograms.length === 0 ? (
          <div className="h-56 p-4 rounded-xl bg-black/5 dark:bg-white/5 flex flex-col items-center justify-center text-center space-y-2">
            <Tv className="w-8 h-8 text-neutral-400" />
            <p className="text-xs font-medium text-[#111827] dark:text-white">
              Chưa có dữ liệu lịch phát sóng cho ngày này
            </p>
            <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
              Dữ liệu EPG từ epg.io.vn sẽ cập nhật khi có lịch chính thức.
            </p>
          </div>
        ) : (
          displayedPrograms.map((program) => {
            const isLive = program.isLive;
            const isExpanded = expandedProgramId === program.id;

            return (
              <div
                key={program.id}
                ref={isLive ? liveProgramRef : undefined}
                className={`relative rounded-xl transition-all p-2.5 border text-left ${
                  isLive
                    ? 'bg-[#4cc2ff]/10 dark:bg-[#4cc2ff]/15 border-[#4cc2ff] shadow-sm'
                    : program.isPast
                    ? 'bg-black/[0.02] dark:bg-white/[0.03] border-black/5 dark:border-white/5 opacity-80'
                    : 'bg-black/[0.04] dark:bg-white/[0.06] border-black/5 dark:border-white/5 hover:border-black/15 dark:hover:border-white/15'
                }`}
              >
                {/* Top Row: Time & Badges */}
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono font-bold tracking-tight ${
                        isLive ? 'text-[#0078d4] dark:text-[#4cc2ff]' : 'text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {program.startTimeText} – {program.stopTimeText}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-medium">
                      ({program.durationMinutes}p)
                    </span>
                  </div>

                  {isLive && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#4cc2ff] text-black shadow-xs flex items-center gap-1 shrink-0 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-black" />
                      Đang phát
                    </span>
                  )}
                  {program.isUpcoming && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-neutral-500/15 text-neutral-600 dark:text-neutral-400">
                      Sắp phát
                    </span>
                  )}
                </div>

                {/* Live Progress Bar */}
                {isLive && (
                  <div className="w-full h-1 bg-black/10 dark:bg-white/15 rounded-full overflow-hidden my-1.5">
                    <div
                      className="h-full bg-[#4cc2ff] transition-all duration-1000 ease-linear rounded-full"
                      style={{ width: `${program.progress}%` }}
                    />
                  </div>
                )}

                {/* Main Content: Title & Thumbnail */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="min-w-0 flex-1">
                    <h4
                      className={`text-xs sm:text-[13px] font-semibold leading-snug line-clamp-2 ${
                        isLive
                          ? 'text-[#0078d4] dark:text-white font-bold'
                          : 'text-[#111827] dark:text-neutral-200'
                      }`}
                    >
                      {program.title}
                    </h4>

                    {program.description && (
                      <p
                        className={`text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5 leading-relaxed ${
                          isExpanded ? '' : 'line-clamp-1'
                        }`}
                      >
                        {program.description}
                      </p>
                    )}
                  </div>

                  {program.thumbnail && (
                    <img
                      src={program.thumbnail}
                      alt={program.title}
                      loading="lazy"
                      className="w-12 h-8 sm:w-14 sm:h-9 object-cover rounded-md bg-black/10 shrink-0 border border-black/10 dark:border-white/10"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  )}
                </div>

                {/* Expand / Collapse description toggle if text is longer */}
                {program.description && program.description.length > 50 && (
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedProgramId(isExpanded ? null : program.id)
                    }
                    className="mt-1 text-[10px] text-[#4cc2ff] hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>{isExpanded ? 'Thu gọn' : 'Chi tiết'}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 4. Footer link to epg.io.vn */}
      <div className="p-2 sm:p-2.5 border-t border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-black/20 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 shrink-0">
        <span className="truncate">
          Kênh: <strong className="text-neutral-800 dark:text-white">{currentChannel.shortName || currentChannel.name}</strong>
        </span>
        <a
          href={`https://epg.io.vn/`}
          target="_blank"
          rel="noreferrer"
          className="text-[#0078d4] dark:text-[#4cc2ff] hover:underline flex items-center gap-1 font-medium shrink-0"
        >
          <span>epg.io.vn</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
