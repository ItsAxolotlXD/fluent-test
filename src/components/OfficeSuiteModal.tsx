import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  FileText, 
  Table as TableIcon, 
  Presentation as PresentIcon, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered, 
  Quote, 
  Download, 
  Trash2, 
  Plus, 
  Play, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Printer, 
  RotateCcw,
  Sparkles,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react';

export type OfficeToolType = 'write' | 'table' | 'present';

interface OfficeSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTool?: OfficeToolType;
}

interface SlideItem {
  id: string;
  title: string;
  subtitle?: string;
  bullets?: string[];
  layout: 'title' | 'content' | 'quote';
  notes?: string;
}

export const OfficeSuiteModal: React.FC<OfficeSuiteModalProps> = ({
  isOpen,
  onClose,
  initialTool = 'write'
}) => {
  const [activeTool, setActiveTool] = useState<OfficeToolType>(initialTool);

  useEffect(() => {
    if (isOpen && initialTool) {
      setActiveTool(initialTool);
    }
  }, [isOpen, initialTool]);

  // ===================== WRITE (WORD) STATE =====================
  const [docTitle, setDocTitle] = useState('Untitled Document');
  const [docContent, setDocContent] = useState<string>(() => {
    return `# Welcome to Vplay Write\n\nA lightweight, modern document editor built right into your streaming suite.\n\n## Getting Started\n- Use the toolbar above to format headings, bold, italic, and lists.\n- Your work is automatically preserved.\n- You can export your document anytime.\n\n> "Simplicity is the soul of efficiency."\n\nStart typing your document here...`;
  });
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const wordCount = docContent.trim() ? docContent.trim().split(/\s+/).length : 0;
  const charCount = docContent.length;

  const insertWriteFormat = (prefix: string, suffix: string = '') => {
    const textarea = editorRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = docContent.substring(start, end);
    const replacement = `${prefix}${selected || 'text'}${suffix}`;
    const newContent = docContent.substring(0, start) + replacement + docContent.substring(end);
    setDocContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 4));
    }, 10);
  };

  const handleExportWriteTxt = () => {
    const blob = new Blob([docContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docTitle.trim() || 'Document'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ===================== TABLE (EXCEL) STATE =====================
  const ROWS_COUNT = 15;
  const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const [sheetTitle, setSheetTitle] = useState('Workbook 1');
  const [gridData, setGridData] = useState<Record<string, string>>(() => ({
    'A1': 'Item / Channel',
    'B1': 'Category',
    'C1': 'Views (K)',
    'D1': 'Rating',
    'A2': 'VTV1 HD',
    'B2': 'News',
    'C2': '145',
    'D2': '4.8',
    'A3': 'VTV3 HD',
    'B3': 'Entertainment',
    'C3': '210',
    'D3': '4.9',
    'A4': 'HTV7 HD',
    'B4': 'Variety',
    'C4': '95',
    'D4': '4.6',
    'A5': 'Total / Avg',
    'B5': 'Summary',
    'C5': '=SUM(C2:C4)',
    'D5': '4.76'
  }));

  const [selectedCell, setSelectedCell] = useState<string>('A1');
  const [formulaValue, setFormulaValue] = useState<string>('');

  useEffect(() => {
    setFormulaValue(gridData[selectedCell] || '');
  }, [selectedCell, gridData]);

  const evaluateCellValue = (raw: string): string => {
    if (!raw) return '';
    if (raw.startsWith('=')) {
      const formula = raw.substring(1).trim().toUpperCase();
      // Handle =SUM(C2:C4)
      const sumMatch = formula.match(/^SUM\(([A-H])(\d+):([A-H])(\d+)\)$/);
      if (sumMatch) {
        const col = sumMatch[1];
        const r1 = parseInt(sumMatch[2], 10);
        const r2 = parseInt(sumMatch[4], 10);
        let total = 0;
        for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++) {
          const val = parseFloat(gridData[`${col}${r}`] || '0');
          if (!isNaN(val)) total += val;
        }
        return String(total);
      }
      // Handle simple math
      try {
        const sanitized = formula.replace(/[^0-9+\-*/().]/g, '');
        if (sanitized) {
          // eslint-disable-next-line no-eval
          const res = Function(`"use strict"; return (${sanitized})`)();
          return String(res);
        }
      } catch {
        return '#ERR';
      }
    }
    return raw;
  };

  const handleCellChange = (cellKey: string, val: string) => {
    setGridData((prev) => ({ ...prev, [cellKey]: val }));
  };

  const handleExportTableCsv = () => {
    let csv = '';
    for (let r = 1; r <= ROWS_COUNT; r++) {
      const rowVals = COLS.map((col) => {
        const raw = gridData[`${col}${r}`] || '';
        const evaluated = evaluateCellValue(raw);
        return `"${evaluated.replace(/"/g, '""')}"`;
      });
      csv += rowVals.join(',') + '\n';
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sheetTitle.trim() || 'Sheet'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ===================== PRESENT (POWERPOINT) STATE =====================
  const [deckTitle, setDeckTitle] = useState('Presentation 1');
  const [slides, setSlides] = useState<SlideItem[]>([
    {
      id: 'slide-1',
      title: 'Vplay Media Suite',
      subtitle: 'Modern Television & Office Tools Platform',
      layout: 'title'
    },
    {
      id: 'slide-2',
      title: 'Core Features',
      bullets: [
        'High definition IPTV streaming with low latency',
        'Built-in Microsoft 365 Fluent productivity suite',
        'Full keyboard navigation and spatial glass interface',
        'Custom stream importation and playlist bookmarking'
      ],
      layout: 'content'
    },
    {
      id: 'slide-3',
      title: 'Next Generation Web Experience',
      subtitle: '"Bringing media streaming and creativity together into one fluid canvas."',
      layout: 'quote'
    }
  ]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isSlideshowActive, setIsSlideshowActive] = useState(false);

  const currentSlide = slides[activeSlideIndex] || slides[0];

  const handleAddSlide = () => {
    const newSlide: SlideItem = {
      id: `slide-${Date.now()}`,
      title: `New Slide ${slides.length + 1}`,
      bullets: ['Point 1', 'Point 2', 'Point 3'],
      layout: 'content'
    };
    setSlides((prev) => [...prev, newSlide]);
    setActiveSlideIndex(slides.length);
  };

  const handleDeleteSlide = (index: number) => {
    if (slides.length <= 1) return;
    const next = slides.filter((_, i) => i !== index);
    setSlides(next);
    setActiveSlideIndex(Math.max(0, index - 1));
  };

  const handleUpdateCurrentSlide = (patch: Partial<SlideItem>) => {
    setSlides((prev) => {
      const copy = [...prev];
      copy[activeSlideIndex] = { ...copy[activeSlideIndex], ...patch };
      return copy;
    });
  };

  // Slideshow keyboard navigation
  useEffect(() => {
    if (!isSlideshowActive) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        setActiveSlideIndex((prev) => Math.min(slides.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        e.preventDefault();
        setActiveSlideIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsSlideshowActive(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isSlideshowActive, slides.length]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="office-suite-modal-container"
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 select-none"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Dialog Card with requested Zoom animation (in: near to far [1.10->1], out: far to near [1->1.08]) */}
        <motion.div
          id="office-suite-dialog"
          initial={{ opacity: 0, scale: 1.10 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] }
          }}
          exit={{ 
            opacity: 0, 
            scale: 1.08,
            transition: { duration: 0.20, ease: [0.16, 1, 0.3, 1] }
          }}
          className="relative z-10 w-full max-w-5xl h-[88vh] max-h-[820px] bg-[#1e1e24] text-white rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* TOP APP BAR / RIBBON TABS */}
          <div className="h-14 px-3 sm:px-5 bg-[#25252d] border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
            {/* Tool Selector Tabs: Write, Table, Present */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Write (Word clone) */}
              <button
                type="button"
                id="office-tab-write"
                onClick={() => setActiveTool('write')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTool === 'write'
                    ? 'bg-[#185abd] text-white shadow-md'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <FileText className="w-4 h-4 text-white" />
                <span>Write</span>
              </button>

              {/* Table (Excel clone) */}
              <button
                type="button"
                id="office-tab-table"
                onClick={() => setActiveTool('table')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTool === 'table'
                    ? 'bg-[#107c41] text-white shadow-md'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <TableIcon className="w-4 h-4 text-white" />
                <span>Table</span>
              </button>

              {/* Present (PowerPoint clone) */}
              <button
                type="button"
                id="office-tab-present"
                onClick={() => setActiveTool('present')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTool === 'present'
                    ? 'bg-[#d24726] text-white shadow-md'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <PresentIcon className="w-4 h-4 text-white" />
                <span>Present</span>
              </button>
            </div>

            {/* Document Title & Close Button */}
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-[11px] font-mono text-neutral-400 hidden sm:inline">
                Office Suite
              </span>
              <button
                type="button"
                id="btn-close-office-suite"
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MAIN WORKSPACE BODY */}
          <div className="flex-1 min-h-0 flex flex-col bg-[#18181f]">
            {/* 1. WRITE (WORD) WORKSPACE */}
            {activeTool === 'write' && (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Secondary Ribbon Toolbar */}
                <div className="px-3 sm:px-5 py-2 bg-[#202028] border-b border-white/5 flex flex-wrap items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-1 overflow-x-auto">
                    <input
                      type="text"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      className="bg-black/20 border border-white/10 px-2.5 py-1 rounded-md text-xs sm:text-sm font-medium text-white outline-none focus:border-[#4cc2ff] w-36 sm:w-48 mr-2"
                      placeholder="Document title"
                    />

                    <button
                      type="button"
                      onClick={() => insertWriteFormat('**', '**')}
                      className="p-1.5 rounded hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                      title="Bold"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertWriteFormat('*', '*')}
                      className="p-1.5 rounded hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                      title="Italic"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertWriteFormat('<u>', '</u>')}
                      className="p-1.5 rounded hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                      title="Underline"
                    >
                      <Underline className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertWriteFormat('~~', '~~')}
                      className="p-1.5 rounded hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                      title="Strikethrough"
                    >
                      <Strikethrough className="w-3.5 h-3.5" />
                    </button>

                    <span className="w-[1px] h-4 bg-white/10 mx-1" />

                    <button
                      type="button"
                      onClick={() => insertWriteFormat('# ')}
                      className="p-1.5 rounded hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                      title="Heading 1"
                    >
                      <Heading1 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertWriteFormat('## ')}
                      className="p-1.5 rounded hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                      title="Heading 2"
                    >
                      <Heading2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertWriteFormat('- ')}
                      className="p-1.5 rounded hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                      title="Bullet list"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertWriteFormat('1. ')}
                      className="p-1.5 rounded hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                      title="Numbered list"
                    >
                      <ListOrdered className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertWriteFormat('> ')}
                      className="p-1.5 rounded hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                      title="Quote"
                    >
                      <Quote className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDocContent('')}
                      className="px-2.5 py-1 rounded text-xs text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                      title="Clear content"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={handleExportWriteTxt}
                      className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#185abd] hover:bg-[#2068cc] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                      title="Download as text file"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export .txt</span>
                    </button>
                  </div>
                </div>

                {/* Main Paper Canvas */}
                <div className="flex-1 p-3 sm:p-6 overflow-y-auto flex justify-center bg-[#141419]">
                  <div className="w-full max-w-3xl min-h-[500px] bg-[#1e1e24] border border-white/10 rounded-xl p-5 sm:p-8 shadow-xl flex flex-col">
                    <textarea
                      ref={editorRef}
                      value={docContent}
                      onChange={(e) => setDocContent(e.target.value)}
                      placeholder="Start typing your document..."
                      className="w-full flex-1 min-h-[420px] bg-transparent text-[#e6e6e6] text-sm sm:text-base leading-relaxed outline-none resize-none font-sans"
                    />
                  </div>
                </div>

                {/* Footer status bar */}
                <div className="h-7 px-4 bg-[#1e1e24] border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-400 shrink-0">
                  <div>Page 1 of 1</div>
                  <div className="flex items-center gap-4">
                    <span>{wordCount} words</span>
                    <span>{charCount} characters</span>
                    <span className="text-[#4cc2ff] font-medium">Ready</span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. TABLE (EXCEL) WORKSPACE */}
            {activeTool === 'table' && (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Secondary Toolbar */}
                <div className="px-3 sm:px-5 py-2 bg-[#202028] border-b border-white/5 flex flex-wrap items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={sheetTitle}
                      onChange={(e) => setSheetTitle(e.target.value)}
                      className="bg-black/20 border border-white/10 px-2.5 py-1 rounded-md text-xs sm:text-sm font-medium text-white outline-none focus:border-[#107c41] w-36 sm:w-48"
                      placeholder="Workbook title"
                    />

                    {/* Formula bar */}
                    <div className="flex items-center gap-1.5 bg-black/30 border border-white/10 px-2 py-0.5 rounded-md">
                      <span className="text-[11px] font-mono text-[#107c41] font-bold">fx</span>
                      <span className="text-[11px] font-mono text-neutral-400">{selectedCell}:</span>
                      <input
                        type="text"
                        value={formulaValue}
                        onChange={(e) => {
                          setFormulaValue(e.target.value);
                          handleCellChange(selectedCell, e.target.value);
                        }}
                        placeholder="Formula (e.g. =SUM(C2:C4))"
                        className="bg-transparent text-xs text-white outline-none w-40 sm:w-60 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setGridData({})}
                      className="px-2.5 py-1 rounded text-xs text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                      title="Clear grid"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={handleExportTableCsv}
                      className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#107c41] hover:bg-[#15934e] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                      title="Download as CSV"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export .csv</span>
                    </button>
                  </div>
                </div>

                {/* Spreadsheet Grid */}
                <div className="flex-1 overflow-auto p-3 sm:p-5 bg-[#141419]">
                  <div className="inline-block min-w-full border border-white/10 rounded-lg overflow-hidden bg-[#1e1e24] shadow-xl">
                    <table className="w-full border-collapse text-xs text-neutral-200">
                      <thead>
                        <tr className="bg-[#24242d] text-neutral-400 font-mono">
                          <th className="w-12 p-2 border-b border-r border-white/10 text-center font-normal">#</th>
                          {COLS.map((col) => (
                            <th key={col} className="min-w-[110px] p-2 border-b border-r border-white/10 text-center font-medium">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: ROWS_COUNT }, (_, rIdx) => {
                          const rowNum = rIdx + 1;
                          return (
                            <tr key={rowNum} className="hover:bg-white/[0.02]">
                              <td className="p-1 border-b border-r border-white/10 text-center font-mono text-neutral-500 bg-[#22222a]">
                                {rowNum}
                              </td>
                              {COLS.map((col) => {
                                const cellKey = `${col}${rowNum}`;
                                const raw = gridData[cellKey] || '';
                                const isSelected = selectedCell === cellKey;
                                const displayVal = evaluateCellValue(raw);

                                return (
                                  <td
                                    key={cellKey}
                                    onClick={() => setSelectedCell(cellKey)}
                                    className={`p-0 border-b border-r border-white/10 relative ${
                                      isSelected ? 'ring-2 ring-[#107c41] bg-[#107c41]/10 z-10' : ''
                                    }`}
                                  >
                                    <input
                                      type="text"
                                      value={isSelected ? raw : displayVal}
                                      onChange={(e) => handleCellChange(cellKey, e.target.value)}
                                      onFocus={() => setSelectedCell(cellKey)}
                                      className="w-full h-8 px-2 bg-transparent text-white text-xs outline-none font-sans truncate"
                                    />
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Footer status bar */}
                <div className="h-7 px-4 bg-[#1e1e24] border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-400 shrink-0">
                  <div>Sheet 1: {COLS.length} Columns × {ROWS_COUNT} Rows</div>
                  <div className="flex items-center gap-3">
                    <span>Cell: {selectedCell}</span>
                    <span className="text-[#107c41] font-medium">Ready</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. PRESENT (POWERPOINT) WORKSPACE */}
            {activeTool === 'present' && (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Secondary Toolbar */}
                <div className="px-3 sm:px-5 py-2 bg-[#202028] border-b border-white/5 flex flex-wrap items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={deckTitle}
                      onChange={(e) => setDeckTitle(e.target.value)}
                      className="bg-black/20 border border-white/10 px-2.5 py-1 rounded-md text-xs sm:text-sm font-medium text-white outline-none focus:border-[#d24726] w-36 sm:w-48"
                      placeholder="Presentation title"
                    />

                    <button
                      type="button"
                      onClick={handleAddSlide}
                      className="flex items-center gap-1.5 px-3 py-1 rounded bg-white/10 hover:bg-white/15 text-xs text-white transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#d24726]" />
                      <span>New Slide</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteSlide(activeSlideIndex)}
                      disabled={slides.length <= 1}
                      className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsSlideshowActive(true)}
                      className="flex items-center gap-1.5 px-4 py-1 rounded-lg bg-[#d24726] hover:bg-[#e0522f] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Slideshow</span>
                    </button>
                  </div>
                </div>

                {/* Slides deck main area (Thumbnails on Left + Slide Editor on Right) */}
                <div className="flex-1 flex min-h-0 bg-[#141419]">
                  {/* Left: Thumbnails List */}
                  <div className="w-44 sm:w-56 p-3 border-r border-white/10 overflow-y-auto space-y-2.5 shrink-0 bg-[#1a1a21]">
                    <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-1">
                      Slides ({slides.length})
                    </div>
                    {slides.map((s, idx) => (
                      <div
                        key={s.id}
                        onClick={() => setActiveSlideIndex(idx)}
                        className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                          idx === activeSlideIndex
                            ? 'border-[#d24726] bg-[#d24726]/10 ring-1 ring-[#d24726]'
                            : 'border-white/10 bg-[#22222b] hover:bg-white/5 text-neutral-400'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-neutral-500 mb-1">
                          <span>Slide {idx + 1}</span>
                          <span className="capitalize">{s.layout}</span>
                        </div>
                        <div className="text-xs font-medium text-white truncate">
                          {s.title || 'Untitled'}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Right: Slide Canvas Editor */}
                  <div className="flex-1 p-4 sm:p-8 overflow-y-auto flex flex-col items-center justify-center">
                    <div className="w-full max-w-2xl aspect-[16/9] bg-gradient-to-br from-[#242430] to-[#1c1c24] border border-white/15 rounded-xl p-6 sm:p-10 shadow-2xl flex flex-col justify-center relative overflow-hidden">
                      {/* Decorative accent top bar on slide */}
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#d24726] via-[#ff7849] to-[#185abd]" />

                      {/* Layout 1: Title Slide */}
                      {currentSlide.layout === 'title' && (
                        <div className="space-y-4 text-center my-auto">
                          <input
                            type="text"
                            value={currentSlide.title}
                            onChange={(e) => handleUpdateCurrentSlide({ title: e.target.value })}
                            placeholder="Slide Title"
                            className="w-full bg-transparent text-center text-2xl sm:text-4xl font-bold text-white outline-none border-b border-transparent hover:border-white/20 focus:border-[#d24726] pb-2 transition-colors"
                          />
                          <input
                            type="text"
                            value={currentSlide.subtitle || ''}
                            onChange={(e) => handleUpdateCurrentSlide({ subtitle: e.target.value })}
                            placeholder="Subtitle or description"
                            className="w-full bg-transparent text-center text-sm sm:text-lg text-neutral-300 outline-none border-b border-transparent hover:border-white/20 focus:border-[#d24726] pb-1 transition-colors"
                          />
                        </div>
                      )}

                      {/* Layout 2: Content Slide */}
                      {currentSlide.layout === 'content' && (
                        <div className="space-y-4 my-auto">
                          <input
                            type="text"
                            value={currentSlide.title}
                            onChange={(e) => handleUpdateCurrentSlide({ title: e.target.value })}
                            placeholder="Slide Title"
                            className="w-full bg-transparent text-xl sm:text-2xl font-bold text-white outline-none border-b border-white/10 focus:border-[#d24726] pb-2"
                          />
                          <div className="space-y-2">
                            {(currentSlide.bullets || ['Point 1']).map((bullet, bIdx) => (
                              <div key={bIdx} className="flex items-center gap-2.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#d24726] shrink-0" />
                                <input
                                  type="text"
                                  value={bullet}
                                  onChange={(e) => {
                                    const nextBullets = [...(currentSlide.bullets || [])];
                                    nextBullets[bIdx] = e.target.value;
                                    handleUpdateCurrentSlide({ bullets: nextBullets });
                                  }}
                                  placeholder="Bullet point text"
                                  className="w-full bg-transparent text-xs sm:text-sm text-neutral-200 outline-none hover:bg-white/5 px-1 py-0.5 rounded"
                                />
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const nextBullets = [...(currentSlide.bullets || []), 'New point'];
                                handleUpdateCurrentSlide({ bullets: nextBullets });
                              }}
                              className="text-[11px] text-[#4cc2ff] hover:underline flex items-center gap-1 mt-2 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add bullet item</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Layout 3: Quote Slide */}
                      {currentSlide.layout === 'quote' && (
                        <div className="space-y-4 text-center my-auto px-4">
                          <Quote className="w-8 h-8 text-[#d24726] mx-auto opacity-80" />
                          <textarea
                            value={currentSlide.subtitle || ''}
                            onChange={(e) => handleUpdateCurrentSlide({ subtitle: e.target.value })}
                            placeholder="Enter quotation..."
                            className="w-full bg-transparent text-center text-base sm:text-xl italic text-neutral-200 outline-none resize-none leading-relaxed"
                          />
                          <input
                            type="text"
                            value={currentSlide.title}
                            onChange={(e) => handleUpdateCurrentSlide({ title: e.target.value })}
                            placeholder="Author / Source"
                            className="w-full bg-transparent text-center text-xs sm:text-sm text-neutral-400 font-semibold outline-none"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer status bar */}
                <div className="h-7 px-4 bg-[#1e1e24] border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-400 shrink-0">
                  <div>Slide {activeSlideIndex + 1} of {slides.length}</div>
                  <div className="flex items-center gap-4">
                    <span>16:9 Widescreen</span>
                    <span className="text-[#d24726] font-medium">Ready</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* FULLSCREEN SLIDESHOW PLAYER */}
        <AnimatePresence>
          {isSlideshowActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[99999] bg-black text-white flex flex-col justify-center items-center select-none"
            >
              {/* Slideshow Content */}
              <div className="w-full max-w-5xl px-8 py-12 flex flex-col items-center justify-center my-auto">
                {currentSlide.layout === 'title' && (
                  <div className="text-center space-y-6">
                    <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white">
                      {currentSlide.title}
                    </h1>
                    {currentSlide.subtitle && (
                      <p className="text-xl sm:text-2xl text-neutral-300 font-light">
                        {currentSlide.subtitle}
                      </p>
                    )}
                  </div>
                )}

                {currentSlide.layout === 'content' && (
                  <div className="w-full max-w-3xl space-y-8">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white border-b border-white/20 pb-4">
                      {currentSlide.title}
                    </h2>
                    <ul className="space-y-4">
                      {(currentSlide.bullets || []).map((b, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-4 text-xl text-neutral-200">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#d24726] mt-2.5 shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentSlide.layout === 'quote' && (
                  <div className="max-w-3xl text-center space-y-6">
                    <Quote className="w-12 h-12 text-[#d24726] mx-auto opacity-75" />
                    <blockquote className="text-2xl sm:text-3xl italic text-neutral-200 leading-relaxed font-serif">
                      {currentSlide.subtitle}
                    </blockquote>
                    <p className="text-base text-neutral-400 font-semibold uppercase tracking-wider">
                      — {currentSlide.title}
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom controls */}
              <div className="absolute bottom-6 left-0 right-0 px-8 flex items-center justify-between text-neutral-400 text-xs sm:text-sm">
                <div>Press [Esc] to exit slideshow</div>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    disabled={activeSlideIndex <= 0}
                    onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
                    className="p-2 rounded-full hover:bg-white/10 disabled:opacity-20 cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="font-mono">{activeSlideIndex + 1} / {slides.length}</span>
                  <button
                    type="button"
                    disabled={activeSlideIndex >= slides.length - 1}
                    onClick={() => setActiveSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
                    className="p-2 rounded-full hover:bg-white/10 disabled:opacity-20 cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSlideshowActive(false)}
                  className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                >
                  Exit
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};
