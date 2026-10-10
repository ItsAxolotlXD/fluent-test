import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  StickyNote, 
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
  ArrowLeft, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  FileDown,
  Printer,
  ChevronDown,
  Check,
  Undo2,
  Redo2,
  Highlighter,
  RemoveFormatting,
  FileText
} from 'lucide-react';
import { exportDocx, exportWritePdf } from '../utils/officeExport';
import { useNotes, STICKY_COLORS } from '../context/NotesContext';

interface NotesAppProps {
  navigate: (route: string) => void;
}

const PRESET_FONTS = [
  'Segoe UI',
  'Inter',
  'Arial',
  'Times New Roman',
  'Georgia',
  'Courier New',
  'Roboto',
];

const PRESET_COLORS = [
  '#ffffff',
  '#000000',
  '#4cc2ff',
  '#0078d4',
  '#107c41',
  '#d83b01',
  '#e81123',
  '#8764b8',
  '#f59e0b',
  '#9ca3af',
];

const PRESET_HIGHLIGHTS = [
  'transparent',
  '#fef08a', // yellow
  '#fed7aa', // orange
  '#bbf7d0', // green
  '#bae6fd', // blue
  '#e9d5ff', // purple
  '#fbcfe8', // pink
];

export const NotesApp: React.FC<NotesAppProps> = ({ navigate }) => {
  const {
    noteTitle,
    setNoteTitle,
    noteContent,
    setNoteContent,
    isStickyVisible,
    setIsStickyVisible,
    stickyColorId,
    setStickyColorId,
    currentStickyColor,
  } = useNotes();

  const [activeFont, setActiveFont] = useState('Segoe UI');
  const [activeFontSize, setActiveFontSize] = useState<number>(16);
  const [fontSizeInput, setFontSizeInput] = useState<string>('16');
  const [activeColor, setActiveColor] = useState('#ffffff');
  const [activeHighlight, setActiveHighlight] = useState('transparent');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right' | 'justify'>('left');
  
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showStickyColorMenu, setShowStickyColorMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);

  // Initialize editor with current note content
  useEffect(() => {
    if (editorRef.current) {
      if (editorRef.current.innerHTML !== noteContent) {
        editorRef.current.innerHTML = noteContent || '';
      }
    }
  }, [noteContent]);

  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const updateStats = useCallback(() => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(text.length);
  }, []);

  // Selection & Range management
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current) {
      const range = sel.getRangeAt(0);
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
      }
    }
  };

  const restoreSelection = () => {
    if (savedRangeRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    }
  };

  const updateToolbarStates = useCallback(() => {
    try {
      setIsBold(document.queryCommandState('bold'));
      setIsItalic(document.queryCommandState('italic'));
      setIsUnderline(document.queryCommandState('underline'));
      setIsStrikethrough(document.queryCommandState('strikeThrough'));
      if (document.queryCommandState('justifyCenter')) setTextAlign('center');
      else if (document.queryCommandState('justifyRight')) setTextAlign('right');
      else if (document.queryCommandState('justifyFull')) setTextAlign('justify');
      else setTextAlign('left');
    } catch {}
  }, []);

  // Format execution helper using document.execCommand with selection retention
  const execCmd = (cmd: string, value: string | undefined = undefined) => {
    if (editorRef.current) {
      editorRef.current.focus();
      restoreSelection();
      document.execCommand('styleWithCSS', false, 'true');
      document.execCommand(cmd, false, value);
      saveSelection();
      updateToolbarStates();
      handleEditorInput();
    }
  };

  const handleToggleBold = () => {
    execCmd('bold');
    setIsBold(!isBold);
  };

  const handleToggleItalic = () => {
    execCmd('italic');
    setIsItalic(!isItalic);
  };

  const handleToggleUnderline = () => {
    execCmd('underline');
    setIsUnderline(!isUnderline);
  };

  const handleToggleStrikethrough = () => {
    execCmd('strikeThrough');
    setIsStrikethrough(!isStrikethrough);
  };

  const handleColorSelect = (color: string) => {
    setActiveColor(color);
    if (editorRef.current) {
      editorRef.current.focus();
      restoreSelection();
      document.execCommand('styleWithCSS', false, 'true');
      document.execCommand('foreColor', false, color);
      saveSelection();
      handleEditorInput();
    }
    setShowColorPicker(false);
  };

  const handleHighlightSelect = (color: string) => {
    setActiveHighlight(color);
    if (editorRef.current) {
      editorRef.current.focus();
      restoreSelection();
      document.execCommand('styleWithCSS', false, 'true');
      document.execCommand('hiliteColor', false, color === 'transparent' ? 'initial' : color);
      saveSelection();
      handleEditorInput();
    }
    setShowHighlightPicker(false);
  };

  const handleFontChange = (font: string) => {
    setActiveFont(font);
    if (editorRef.current) {
      editorRef.current.focus();
      restoreSelection();
      document.execCommand('styleWithCSS', false, 'true');
      document.execCommand('fontName', false, font);
      saveSelection();
      handleEditorInput();
    }
  };

  // Robust font size application supporting exact 1 to 200px
  const applyExactFontSize = (sizeVal: number) => {
    const clampedSize = Math.max(1, Math.min(200, sizeVal));
    setActiveFontSize(clampedSize);
    setFontSizeInput(clampedSize.toString());

    if (!editorRef.current) return;
    editorRef.current.focus();
    restoreSelection();

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const range = sel.getRangeAt(0);
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        // Use a unique marker attribute to replace
        const uniqueMarker = `font-sz-marker-${Date.now()}`;
        document.execCommand('styleWithCSS', false, 'false');
        document.execCommand('fontSize', false, '7');
        
        const fontTags = editorRef.current.querySelectorAll('font[size="7"]');
        fontTags.forEach((f) => {
          const span = document.createElement('span');
          span.style.fontSize = `${clampedSize}px`;
          span.setAttribute('data-sz', uniqueMarker);
          span.innerHTML = f.innerHTML;
          f.parentNode?.replaceChild(span, f);
        });

        // Re-select applied text
        saveSelection();
        handleEditorInput();
        return;
      }
    }

    // If collapsed or no selection, wrap active node or apply directly
    document.execCommand('styleWithCSS', false, 'false');
    document.execCommand('fontSize', false, '7');
    const fontTags = editorRef.current.querySelectorAll('font[size="7"]');
    fontTags.forEach((f) => {
      const span = document.createElement('span');
      span.style.fontSize = `${clampedSize}px`;
      span.innerHTML = f.innerHTML;
      f.parentNode?.replaceChild(span, f);
    });
    saveSelection();
    handleEditorInput();
  };

  const handleFontSizeInputBlurOrEnter = () => {
    const parsed = parseInt(fontSizeInput, 10);
    if (!isNaN(parsed)) {
      applyExactFontSize(parsed);
    } else {
      setFontSizeInput(activeFontSize.toString());
    }
  };

  const handleAlign = (align: 'left' | 'center' | 'right' | 'justify') => {
    setTextAlign(align);
    if (align === 'left') execCmd('justifyLeft');
    if (align === 'center') execCmd('justifyCenter');
    if (align === 'right') execCmd('justifyRight');
    if (align === 'justify') execCmd('justifyFull');
  };

  const handleFormatBlock = (tag: string) => {
    execCmd('formatBlock', tag);
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setNoteContent(html);
      updateStats();
    }
  };

  const triggerToast = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleExportDocx = async () => {
    setShowExportMenu(false);
    const rawText = editorRef.current?.innerText || '';
    try {
      await exportDocx(noteTitle, rawText, editorRef.current?.innerHTML);
      triggerToast('Đã xuất file Word (.docx) thành công!');
    } catch (e) {
      console.error(e);
      triggerToast('Xuất .docx thất bại');
    }
  };

  const handleExportPdf = () => {
    setShowExportMenu(false);
    const rawText = editorRef.current?.innerText || '';
    try {
      exportWritePdf(noteTitle, rawText);
      triggerToast('Đã xuất file PDF (.pdf) thành công!');
    } catch (e) {
      console.error(e);
      triggerToast('Xuất .pdf thất bại');
    }
  };

  const handleExportTxt = () => {
    setShowExportMenu(false);
    const rawText = editorRef.current?.innerText || '';
    const blob = new Blob([rawText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${noteTitle || 'Note'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast('Đã tải xuống file văn bản (.txt)');
  };

  const handleClear = () => {
    if (confirm('Bạn có chắc muốn xóa nội dung ghi chú này không?')) {
      if (editorRef.current) {
        editorRef.current.innerHTML = '<p><br></p>';
        handleEditorInput();
      }
    }
  };

  const handleToggleStickies = () => {
    setIsStickyVisible(!isStickyVisible);
    if (!isStickyVisible) {
      triggerToast('Đã bật Sticky Note! Bạn có thể kéo và co giãn kích thước quanh màn hình.');
    } else {
      triggerToast('Đã ẩn Sticky Note.');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#1c1c22] text-[#f3f4f6] select-text">
      {/* 1. TOP SUITE NAVIGATION BAR */}
      <div className="h-14 bg-[#24242c] border-b border-white/10 px-4 sm:px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-8 h-8 rounded-md flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Quay lại Trang chủ"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* App Branding Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0078d4]/15 border border-[#4cc2ff]/30 text-white">
            <StickyNote className="w-4 h-4 text-[#4cc2ff]" />
            <span className="font-semibold text-sm">V-One Notes</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#4cc2ff]/20 text-[#4cc2ff] font-medium hidden sm:inline">
              Ghi chú
            </span>
          </div>
        </div>

        {/* Title Input & Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            className="bg-black/30 border border-white/10 px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold text-white outline-none focus:border-[#4cc2ff] w-36 sm:w-56 text-center"
            placeholder="Tiêu đề ghi chú..."
          />

          {/* "Show as stickies" Button */}
          <button
            type="button"
            onClick={handleToggleStickies}
            className={`px-3 py-1.5 rounded-md font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer border ${
              isStickyVisible
                ? 'bg-[#ca8a04] hover:bg-[#a16207] text-white border-[#facc15] shadow-sm'
                : 'bg-white/10 hover:bg-white/15 text-neutral-200 border-white/15'
            }`}
            title="Hiển thị ghi chú dưới dạng Sticky Note nổi trên màn hình"
          >
            <StickyNote className="w-3.5 h-3.5" style={{ color: currentStickyColor.accent }} />
            <span className="hidden xs:inline">Show as stickies</span>
            <span className="xs:hidden">Stickies</span>
            {isStickyVisible && (
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse ml-0.5" />
            )}
          </button>

          {/* Sticky Color Quick Switcher */}
          <div className="relative hidden md:block">
            <button
              type="button"
              onClick={() => setShowStickyColorMenu(!showStickyColorMenu)}
              className="px-2.5 py-1.5 rounded-md bg-white/10 hover:bg-white/15 text-neutral-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Đổi màu Sticky Note"
            >
              <div 
                className="w-3.5 h-3.5 rounded-full border border-black/20" 
                style={{ backgroundColor: currentStickyColor.bg }} 
              />
              <span className="text-[11px]">{currentStickyColor.name}</span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>
            {showStickyColorMenu && (
              <div
                className="absolute right-0 mt-1.5 p-2 bg-[#282832] border border-[#3e3e48] rounded-md shadow-xl grid grid-cols-4 gap-1.5 z-50 w-44"
                onClick={(e) => e.stopPropagation()}
              >
                {STICKY_COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setStickyColorId(c.id);
                      setShowStickyColorMenu(false);
                    }}
                    className="w-8 h-8 rounded-lg border border-white/20 hover:scale-105 transition-transform flex items-center justify-center cursor-pointer"
                    style={{ backgroundColor: c.bg }}
                    title={c.name}
                  >
                    {stickyColorId === c.id && (
                      <Check className="w-3.5 h-3.5 text-black font-bold" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-3.5 py-1.5 rounded-md bg-[#4cc2ff] hover:bg-[#3bb2ef] text-black font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất file</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {showExportMenu && (
              <div 
                className="absolute right-0 mt-1.5 w-48 bg-[#282832] border border-[#3e3e48] rounded-md shadow-xl p-1 z-50 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={handleExportDocx}
                  className="w-full text-left px-3 py-2 rounded text-white hover:bg-white/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <FileDown className="w-4 h-4 text-[#4cc2ff]" />
                  <div>
                    <div className="font-semibold">Word Document</div>
                    <div className="text-[10px] text-neutral-400">Xuất định dạng .docx</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={handleExportPdf}
                  className="w-full text-left px-3 py-2 rounded text-white hover:bg-white/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#e81123]" />
                  <div>
                    <div className="font-semibold">PDF Document</div>
                    <div className="text-[10px] text-neutral-400">Xuất định dạng .pdf</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={handleExportTxt}
                  className="w-full text-left px-3 py-2 rounded text-white hover:bg-white/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-[#107c41]" />
                  <div>
                    <div className="font-semibold">Plain Text</div>
                    <div className="text-[10px] text-neutral-400">Xuất định dạng .txt</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. RICH FORMATTING TOOLBAR */}
      <div 
        className="bg-[#212128] border-b border-white/10 px-4 sm:px-6 py-2 flex flex-wrap items-center gap-1.5 sm:gap-2 shrink-0 select-none"
        onMouseDown={(e) => {
          // Prevent losing selection on editor when interacting with toolbar elements
          const target = e.target as HTMLElement;
          if (target.tagName !== 'INPUT' && target.tagName !== 'SELECT') {
            e.preventDefault();
          }
        }}
      >
        {/* Undo / Redo */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd('undo')}
          className="w-7 h-7 rounded flex items-center justify-center text-neutral-300 hover:bg-white/10 transition-colors cursor-pointer"
          title="Hoàn tác (Ctrl+Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd('redo')}
          className="w-7 h-7 rounded flex items-center justify-center text-neutral-300 hover:bg-white/10 transition-colors cursor-pointer"
          title="Làm lại (Ctrl+Y)"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-5 bg-white/10 mx-1" />

        {/* Font Family Selector */}
        <select
          value={activeFont}
          onChange={(e) => handleFontChange(e.target.value)}
          className="bg-black/30 border border-white/10 rounded-md px-2.5 py-1 text-xs text-white outline-none cursor-pointer hover:bg-black/40"
          title="Phông chữ"
        >
          {PRESET_FONTS.map((f) => (
            <option key={f} value={f} className="bg-[#212128] text-white">
              {f}
            </option>
          ))}
        </select>

        {/* Font Size: Custom typing (1 - 200) + Stepper */}
        <div className="flex items-center gap-1 bg-black/30 border border-white/10 rounded-md px-1.5 py-0.5" title="Cỡ chữ (gõ từ 1 đến 200px)">
          <span className="text-[10px] text-neutral-400 font-medium pl-0.5">Size</span>
          <input
            type="number"
            min={1}
            max={200}
            value={fontSizeInput}
            onChange={(e) => {
              setFontSizeInput(e.target.value);
              const num = parseInt(e.target.value, 10);
              if (!isNaN(num) && num >= 1 && num <= 200) {
                applyExactFontSize(num);
              }
            }}
            onBlur={handleFontSizeInputBlurOrEnter}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleFontSizeInputBlurOrEnter();
              }
            }}
            className="w-12 bg-transparent text-xs text-center font-bold text-white outline-none"
            placeholder="16"
          />
          <span className="text-[10px] text-neutral-400">px</span>
          <div className="flex flex-col ml-0.5">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyExactFontSize(activeFontSize + 1)}
              className="text-[9px] leading-[9px] text-neutral-400 hover:text-white px-0.5 cursor-pointer"
              title="Tăng cỡ chữ"
            >
              ▲
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyExactFontSize(activeFontSize - 1)}
              className="text-[9px] leading-[9px] text-neutral-400 hover:text-white px-0.5 cursor-pointer"
              title="Giảm cỡ chữ"
            >
              ▼
            </button>
          </div>
        </div>

        <div className="w-[1px] h-5 bg-white/10 mx-1" />

        {/* Bold, Italic, Underline, Strikethrough */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleToggleBold}
          className={`w-7 h-7 rounded flex items-center justify-center transition-colors cursor-pointer ${
            isBold ? 'bg-[#4cc2ff] text-black font-bold' : 'text-neutral-300 hover:bg-white/10'
          }`}
          title="In đậm (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleToggleItalic}
          className={`w-7 h-7 rounded flex items-center justify-center transition-colors cursor-pointer ${
            isItalic ? 'bg-[#4cc2ff] text-black' : 'text-neutral-300 hover:bg-white/10'
          }`}
          title="In nghiêng (Ctrl+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleToggleUnderline}
          className={`w-7 h-7 rounded flex items-center justify-center transition-colors cursor-pointer ${
            isUnderline ? 'bg-[#4cc2ff] text-black' : 'text-neutral-300 hover:bg-white/10'
          }`}
          title="Gạch chân (Ctrl+U)"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleToggleStrikethrough}
          className={`w-7 h-7 rounded flex items-center justify-center transition-colors cursor-pointer ${
            isStrikethrough ? 'bg-[#4cc2ff] text-black' : 'text-neutral-300 hover:bg-white/10'
          }`}
          title="Gạch ngang"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-5 bg-white/10 mx-1" />

        {/* Text Color Picker */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowHighlightPicker(false);
            }}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/20 hover:bg-white/10 text-neutral-300 text-xs transition-colors cursor-pointer"
            title="Màu chữ"
          >
            <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: activeColor }} />
            <span>Màu</span>
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          </button>
          {showColorPicker && (
            <div 
              className="absolute left-0 mt-1.5 p-2 bg-[#282832] border border-[#3e3e48] rounded-md shadow-xl grid grid-cols-5 gap-1.5 z-50"
              onClick={(e) => e.stopPropagation()}
            >
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleColorSelect(c)}
                  className="w-6 h-6 rounded-full border border-white/20 hover:scale-110 transition-transform cursor-pointer flex items-center justify-center"
                  style={{ backgroundColor: c }}
                  title={c}
                >
                  {activeColor === c && (
                    <Check className={`w-3 h-3 ${c === '#ffffff' ? 'text-black' : 'text-white'}`} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Highlighter Picker */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setShowHighlightPicker(!showHighlightPicker);
              setShowColorPicker(false);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded bg-black/20 hover:bg-white/10 text-neutral-300 text-xs transition-colors cursor-pointer"
            title="Màu nền đánh dấu (Highlighter)"
          >
            <Highlighter className="w-3.5 h-3.5 text-yellow-300" />
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          </button>
          {showHighlightPicker && (
            <div 
              className="absolute left-0 mt-1.5 p-2 bg-[#282832] border border-[#3e3e48] rounded-md shadow-xl grid grid-cols-4 gap-1.5 z-50 w-36"
              onClick={(e) => e.stopPropagation()}
            >
              {PRESET_HIGHLIGHTS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleHighlightSelect(c)}
                  className="w-6 h-6 rounded border border-white/20 hover:scale-110 transition-transform cursor-pointer flex items-center justify-center"
                  style={{ backgroundColor: c === 'transparent' ? '#333' : c }}
                  title={c === 'transparent' ? 'Không màu' : c}
                >
                  {activeHighlight === c && (
                    <Check className="w-3 h-3 text-black" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-[1px] h-5 bg-white/10 mx-1" />

        {/* Text Alignment */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleAlign('left')}
          className={`w-7 h-7 rounded flex items-center justify-center cursor-pointer ${
            textAlign === 'left' ? 'bg-white/20 text-white' : 'text-neutral-400 hover:bg-white/10'
          }`}
          title="Căn trái"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleAlign('center')}
          className={`w-7 h-7 rounded flex items-center justify-center cursor-pointer ${
            textAlign === 'center' ? 'bg-white/20 text-white' : 'text-neutral-400 hover:bg-white/10'
          }`}
          title="Căn giữa"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleAlign('right')}
          className={`w-7 h-7 rounded flex items-center justify-center cursor-pointer ${
            textAlign === 'right' ? 'bg-white/20 text-white' : 'text-neutral-400 hover:bg-white/10'
          }`}
          title="Căn phải"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleAlign('justify')}
          className={`w-7 h-7 rounded flex items-center justify-center cursor-pointer ${
            textAlign === 'justify' ? 'bg-white/20 text-white' : 'text-neutral-400 hover:bg-white/10'
          }`}
          title="Căn đều hai bên"
        >
          <AlignJustify className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-5 bg-white/10 mx-1" />

        {/* Headings & Blocks */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleFormatBlock('h1')}
          className="w-7 h-7 rounded flex items-center justify-center text-neutral-300 hover:bg-white/10 transition-colors cursor-pointer"
          title="Tiêu đề 1 (H1)"
        >
          <Heading1 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleFormatBlock('h2')}
          className="w-7 h-7 rounded flex items-center justify-center text-neutral-300 hover:bg-white/10 transition-colors cursor-pointer"
          title="Tiêu đề 2 (H2)"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd('insertUnorderedList')}
          className="w-7 h-7 rounded flex items-center justify-center text-neutral-300 hover:bg-white/10 transition-colors cursor-pointer"
          title="Danh sách dấu đầu dòng"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd('insertOrderedList')}
          className="w-7 h-7 rounded flex items-center justify-center text-neutral-300 hover:bg-white/10 transition-colors cursor-pointer"
          title="Danh sách có thứ tự"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd('formatBlock', 'blockquote')}
          className="w-7 h-7 rounded flex items-center justify-center text-neutral-300 hover:bg-white/10 transition-colors cursor-pointer"
          title="Trích dẫn (Quote)"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd('removeFormat')}
          className="w-7 h-7 rounded flex items-center justify-center text-neutral-300 hover:bg-white/10 transition-colors cursor-pointer"
          title="Xóa định dạng"
        >
          <RemoveFormatting className="w-3.5 h-3.5" />
        </button>

        {/* Clear Content Button */}
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={handleClear}
            className="w-7 h-7 rounded flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
            title="Xóa trắng tài liệu"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Toast Notice */}
      {notice && (
        <div className="bg-[#0078d4] text-white text-xs px-4 py-2 text-center font-medium shadow-md transition-all">
          {notice}
        </div>
      )}

      {/* 4. MAIN DOCUMENT EDITING CANVAS */}
      <div 
        className="flex-1 overflow-y-auto px-4 py-8 flex justify-center bg-[#15151a]"
        onClick={() => {
          setShowColorPicker(false);
          setShowHighlightPicker(false);
          setShowStickyColorMenu(false);
          setShowExportMenu(false);
        }}
      >
        <div className="w-full max-w-4xl bg-[#1e1e24] border border-white/10 shadow-2xl rounded-xl min-h-[700px] flex flex-col p-8 sm:p-14">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleEditorInput}
            onSelect={saveSelection}
            onKeyUp={() => {
              saveSelection();
              updateToolbarStates();
              updateStats();
            }}
            onMouseUp={() => {
              saveSelection();
              updateToolbarStates();
              updateStats();
            }}
            className="flex-1 outline-none text-neutral-200 leading-relaxed font-sans text-base empty:before:content-['Bắt_đầu_viết_ghi_chú_tại_đây...'] empty:before:text-neutral-500"
            style={{
              fontFamily: activeFont,
              minHeight: '600px',
            }}
          />
        </div>
      </div>

      {/* 5. FOOTER STATUS BAR */}
      <div className="h-8 bg-[#18181f] border-t border-white/5 px-4 sm:px-6 flex items-center justify-between text-[11px] text-neutral-400 shrink-0">
        <div className="flex items-center gap-4">
          <span>{wordCount} từ</span>
          <span>{charCount} ký tự</span>
          <span className="hidden sm:inline">Phông: {activeFont} ({activeFontSize}px)</span>
        </div>
        <div className="flex items-center gap-3">
          {isStickyVisible && (
            <span className="text-[#facc15] font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#facc15]" />
              Sticky Note Đang Mở
            </span>
          )}
          <span>Tự động lưu vào V-One</span>
        </div>
      </div>
    </div>
  );
};
