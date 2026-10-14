import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
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
  FileText,
  Type,
  FolderPlus
} from 'lucide-react';
import { FluentNotesIcon, FluentGalleryIcon } from '../components/FluentIcons';
import { exportDocx, exportWritePdf, createDocxBlob } from '../utils/officeExport';
import { galleryDB, GalleryMediaItem } from '../services/galleryStorage';
import { useNotes, STICKY_COLORS } from '../context/NotesContext';

interface NotesAppProps {
  navigate: (route: string) => void;
}

export interface FontOption {
  id: string;
  name: string;
  label: string;
  fontFamily: string;
}

export const PRESET_FONTS: FontOption[] = [
  {
    id: 'segoe-ui',
    name: 'Segoe UI',
    label: 'Segoe UI (Hỗ trợ tiếng Việt)',
    fontFamily: "'Segoe UI', 'Be Vietnam Pro', 'Inter', system-ui, sans-serif"
  },
  {
    id: 'be-vietnam-pro',
    name: 'Be Vietnam Pro',
    label: 'Be Vietnam Pro (Chuẩn Việt hóa đẹp)',
    fontFamily: "'Be Vietnam Pro', 'Inter', sans-serif"
  },
  {
    id: 'inter',
    name: 'Inter',
    label: 'Inter (Hiện đại & Tinh gọn)',
    fontFamily: "'Inter', sans-serif"
  },
  {
    id: 'roboto',
    name: 'Roboto',
    label: 'Roboto (Google Fonts)',
    fontFamily: "'Roboto', sans-serif"
  },
  {
    id: 'arial',
    name: 'Arial',
    label: 'Arial (Phổ thông)',
    fontFamily: "Arial, Helvetica, sans-serif"
  },
  {
    id: 'times-new-roman',
    name: 'Times New Roman',
    label: 'Times New Roman (Có chân cổ điển)',
    fontFamily: "'Times New Roman', Times, serif"
  },
  {
    id: 'georgia',
    name: 'Georgia',
    label: 'Georgia (Báo chí & Tạp chí)',
    fontFamily: "Georgia, serif"
  },
  {
    id: 'courier-new',
    name: 'Courier New',
    label: 'Courier New (Mã nguồn / Đơn cách)',
    fontFamily: "'Courier New', Courier, monospace"
  }
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

const QUICK_FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 64, 72];

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

  const [selectedFont, setSelectedFont] = useState<FontOption>(PRESET_FONTS[0]);
  const [activeFontSize, setActiveFontSize] = useState<number>(16);
  const [fontSizeInput, setFontSizeInput] = useState<string>('16');
  const [activeColor, setActiveColor] = useState('#ffffff');
  const [activeHighlight, setActiveHighlight] = useState('transparent');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right' | 'justify'>('left');
  
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showFontSizeMenu, setShowFontSizeMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showStickyColorMenu, setShowStickyColorMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const isInternalChangeRef = useRef(false);

  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const updateStats = useCallback(() => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(text.length);
  }, []);

  // Initialize editor with current note content once or on external update
  useEffect(() => {
    if (editorRef.current) {
      if (isInternalChangeRef.current) {
        isInternalChangeRef.current = false;
        return;
      }
      if (document.activeElement === editorRef.current) {
        return;
      }
      if (editorRef.current.innerHTML !== (noteContent || '')) {
        editorRef.current.innerHTML = noteContent || '';
        updateStats();
      }
    }
  }, [noteContent, updateStats]);

  // Selection & Range management
  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current) {
      const range = sel.getRangeAt(0);
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
      }
    }
  }, []);

  const ensureSelection = useCallback((): Selection | null => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.getRangeAt(0).commonAncestorContainer)) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
      return sel;
    }
    if (savedRangeRef.current && editorRef.current) {
      const sel2 = window.getSelection();
      if (sel2) {
        sel2.removeAllRanges();
        sel2.addRange(savedRangeRef.current);
        return sel2;
      }
    }
    return null;
  }, []);

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

  const handleEditorInput = useCallback(() => {
    if (editorRef.current) {
      isInternalChangeRef.current = true;
      const html = editorRef.current.innerHTML;
      setNoteContent(html);
      updateStats();
    }
  }, [setNoteContent, updateStats]);

  // Format execution helper using document.execCommand with selection retention
  const execCmd = (cmd: string, value: string | undefined = undefined) => {
    if (editorRef.current) {
      ensureSelection();
      document.execCommand('styleWithCSS', false, true as any);
      document.execCommand(cmd, false, value);
      saveSelection();
      updateToolbarStates();
      handleEditorInput();
    }
  };

  // Keyboard Shortcuts: Ctrl+Z for Undo, Ctrl+D for Redo (disabling browser bookmarks)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        if (key === 'z') {
          e.preventDefault();
          e.stopPropagation();
          execCmd('undo');
        } else if (key === 'd' || key === 'y') {
          e.preventDefault();
          e.stopPropagation();
          execCmd('redo');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, []);

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
    if (!editorRef.current) return;
    const sel = ensureSelection();
    
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const range = sel.getRangeAt(0);
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        try {
          const span = document.createElement('span');
          span.style.color = color;
          const fragment = range.extractContents();
          span.appendChild(fragment);
          range.insertNode(span);
          
          const newRange = document.createRange();
          newRange.selectNodeContents(span);
          sel.removeAllRanges();
          sel.addRange(newRange);
          savedRangeRef.current = newRange.cloneRange();
          handleEditorInput();
          setShowColorPicker(false);
          return;
        } catch {}
      }
    }
    
    document.execCommand('styleWithCSS', false, true as any);
    document.execCommand('foreColor', false, color);
    saveSelection();
    handleEditorInput();
    setShowColorPicker(false);
  };

  const handleHighlightSelect = (color: string) => {
    setActiveHighlight(color);
    if (!editorRef.current) return;
    const sel = ensureSelection();
    
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const range = sel.getRangeAt(0);
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        try {
          const span = document.createElement('span');
          span.style.backgroundColor = color === 'transparent' ? 'transparent' : color;
          if (color !== 'transparent') {
            span.style.color = '#000000';
            span.style.padding = '0.05em 0.2em';
            span.style.borderRadius = '3px';
          }
          const fragment = range.extractContents();
          span.appendChild(fragment);
          range.insertNode(span);
          
          const newRange = document.createRange();
          newRange.selectNodeContents(span);
          sel.removeAllRanges();
          sel.addRange(newRange);
          savedRangeRef.current = newRange.cloneRange();
          handleEditorInput();
          setShowHighlightPicker(false);
          return;
        } catch {}
      }
    }
    
    document.execCommand('styleWithCSS', false, true as any);
    document.execCommand('hiliteColor', false, color === 'transparent' ? 'transparent' : color);
    saveSelection();
    handleEditorInput();
    setShowHighlightPicker(false);
  };

  const handleFontSelect = (fontObj: FontOption) => {
    setSelectedFont(fontObj);
    setShowFontMenu(false);
    if (!editorRef.current) return;
    const sel = ensureSelection();
    
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const range = sel.getRangeAt(0);
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        try {
          const span = document.createElement('span');
          span.style.fontFamily = fontObj.fontFamily;
          const fragment = range.extractContents();
          span.appendChild(fragment);
          range.insertNode(span);
          
          const newRange = document.createRange();
          newRange.selectNodeContents(span);
          sel.removeAllRanges();
          sel.addRange(newRange);
          savedRangeRef.current = newRange.cloneRange();
          handleEditorInput();
          return;
        } catch {}
      }
    }
    
    // If no text selected or whole note: apply default font family to editor container
    editorRef.current.style.fontFamily = fontObj.fontFamily;
    document.execCommand('styleWithCSS', false, true as any);
    document.execCommand('fontName', false, fontObj.fontFamily);
    saveSelection();
    handleEditorInput();
  };

  // Robust font size application supporting exact 1 to 200px
  const applyExactFontSize = (sizeVal: number) => {
    const clampedSize = Math.max(1, Math.min(200, sizeVal));
    setActiveFontSize(clampedSize);
    setFontSizeInput(clampedSize.toString());
    setShowFontSizeMenu(false);
    
    if (!editorRef.current) return;
    const sel = ensureSelection();
    
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const range = sel.getRangeAt(0);
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        try {
          const span = document.createElement('span');
          span.style.fontSize = `${clampedSize}px`;
          span.style.lineHeight = '1.35';
          const fragment = range.extractContents();
          span.appendChild(fragment);
          range.insertNode(span);
          
          const newRange = document.createRange();
          newRange.selectNodeContents(span);
          sel.removeAllRanges();
          sel.addRange(newRange);
          savedRangeRef.current = newRange.cloneRange();
          handleEditorInput();
          return;
        } catch {}
      }
    }
    
    // If collapsed or no selection, update default root font size or insert styled node
    if (!editorRef.current.innerText.trim()) {
      editorRef.current.style.fontSize = `${clampedSize}px`;
    } else {
      document.execCommand('styleWithCSS', false, true as any);
      const span = document.createElement('span');
      span.style.fontSize = `${clampedSize}px`;
      span.innerHTML = '&#8203;';
      const r = sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
      if (r && editorRef.current.contains(r.commonAncestorContainer)) {
        r.insertNode(span);
        const newR = document.createRange();
        newR.setStart(span, 1);
        newR.collapse(true);
        sel?.removeAllRanges();
        sel?.addRange(newR);
        savedRangeRef.current = newR.cloneRange();
      }
    }
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        handleToggleBold();
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        handleToggleItalic();
      } else if (e.key === 'u' || e.key === 'U') {
        e.preventDefault();
        handleToggleUnderline();
      }
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
      handleEditorInput();
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
    a.download = `${noteTitle.trim() || 'notes'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast('Đã xuất file văn bản (.txt) thành công!');
  };

  const createStickySvgDataUrl = (title: string, content: string, bgColor: string, textColor: string) => {
    const safeTitle = (title || 'Sticky Note').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeContent = (content || '').slice(0, 350).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
      <rect width="600" height="600" rx="20" fill="${bgColor}"/>
      <rect width="600" height="56" rx="20" fill="rgba(0,0,0,0.07)"/>
      <circle cx="36" cy="28" r="7" fill="rgba(0,0,0,0.2)"/>
      <circle cx="60" cy="28" r="7" fill="rgba(0,0,0,0.2)"/>
      <text x="85" y="35" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="bold" fill="${textColor}" opacity="0.85">${safeTitle}</text>
      <foreignObject x="36" y="76" width="528" height="490">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 22px; line-height: 1.45; color: ${textColor}; word-break: break-word; white-space: pre-wrap;">
          ${safeContent}
        </div>
      </foreignObject>
    </svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };

  const handleSaveToGalleryAsDocument = async () => {
    setShowExportMenu(false);
    const rawText = editorRef.current?.innerText || '';
    const title = (noteTitle || 'Document').trim();
    try {
      const docxBlob = await createDocxBlob(title, rawText);
      const url = URL.createObjectURL(docxBlob);
      const now = new Date();
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const dateLabel = `${monthNames[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

      const newItem: GalleryMediaItem = {
        id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: `${title}.docx`,
        type: 'document',
        url,
        blobData: docxBlob,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: docxBlob.size,
        dateAdded: now.toISOString(),
        dateLabel,
        year: now.getFullYear(),
        dimensions: { width: 800, height: 1100 },
        aspectRatio: 8.5 / 11,
        tags: ['Notes', 'Word', 'DOCX', 'Document'],
        description: rawText.slice(0, 160) || 'Word document saved from Sparkle Notes',
        source: 'upload',
      };

      await galleryDB.add(newItem);
      triggerToast('Đã lưu vào Gallery dưới dạng Document (.docx)!');
    } catch (e) {
      console.error(e);
      triggerToast('Lưu vào Gallery thất bại');
    }
  };

  const handleSaveToGalleryAsStickies = async () => {
    setShowExportMenu(false);
    const rawText = editorRef.current?.innerText || '';
    const title = (noteTitle || 'Sticky Note').trim();
    try {
      const now = new Date();
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const dateLabel = `${monthNames[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
      const svgUrl = createStickySvgDataUrl(title, rawText, currentStickyColor.bg, currentStickyColor.text);
      const stickyBlob = new Blob([rawText], { type: 'text/plain;charset=utf-8' });

      const newItem: GalleryMediaItem = {
        id: `sticky-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title,
        type: 'document',
        url: svgUrl,
        thumbnailUrl: svgUrl,
        blobData: stickyBlob,
        mimeType: 'application/x-sticky-note',
        size: stickyBlob.size,
        dateAdded: now.toISOString(),
        dateLabel,
        year: now.getFullYear(),
        dimensions: { width: 600, height: 600 },
        aspectRatio: 1,
        tags: ['Stickies', 'Sticky Note', currentStickyColor.name, 'Notes'],
        description: rawText.slice(0, 160) || 'Sticky note saved from Sparkle Notes',
        source: 'upload',
      };

      await galleryDB.add(newItem);
      triggerToast('Đã lưu vào Gallery dưới dạng Stickies!');
    } catch (e) {
      console.error(e);
      triggerToast('Lưu Stickies vào Gallery thất bại');
    }
  };

  const handleClear = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ nội dung ghi chú này không?')) {
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
        handleEditorInput();
      }
    }
  };

  const handleToggleStickies = () => {
    setIsStickyVisible(!isStickyVisible);
    triggerToast(
      !isStickyVisible 
        ? 'Đã mở chế độ Sticky Note! Ghi chú hiển thị trên toàn ứng dụng.' 
        : 'Đã ẩn Sticky Note.'
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e24] text-neutral-100 select-text overflow-hidden">
      {/* 1. TOP HEADER APP BAR */}
      <div className="h-14 bg-[#18181f] border-b border-white/10 px-4 sm:px-6 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Quay lại Trang chủ"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          {/* App Branding Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0078d4]/15 border border-[#4cc2ff]/30 text-white">
            <FluentNotesIcon className="w-4 h-4 text-[#4cc2ff]" />
            <span className="font-semibold text-sm">Sparkle Notes</span>
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
            className="h-8 sm:h-8.5 bg-black/5 dark:bg-[#282c31] border border-black/10 dark:border-white/10 px-3 rounded-[6px] text-xs sm:text-[13px] font-semibold text-[#111827] dark:text-white placeholder-[#71717a] dark:placeholder-white outline-none focus:border-b-2 focus:border-b-[#005fb8] dark:focus:border-b-[#4cc2ff] w-36 sm:w-56 text-center transition-all no-fluent-line"
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
            <FluentNotesIcon className="w-3.5 h-3.5" style={{ color: currentStickyColor.accent }} />
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
                className="absolute right-0 mt-1.5 w-60 bg-[#282832] border border-[#3e3e48] rounded-md shadow-2xl p-1 z-50 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={handleExportDocx}
                  className="w-full text-left px-3 py-2 rounded text-white hover:bg-white/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <FileDown className="w-4 h-4 text-[#4cc2ff] shrink-0" />
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
                  <Printer className="w-4 h-4 text-[#e81123] shrink-0" />
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
                  <FileText className="w-4 h-4 text-[#107c41] shrink-0" />
                  <div>
                    <div className="font-semibold">Plain Text</div>
                    <div className="text-[10px] text-neutral-400">Xuất định dạng .txt</div>
                  </div>
                </button>

                <div className="my-1 border-t border-white/10" />

                <button
                  type="button"
                  onClick={handleSaveToGalleryAsDocument}
                  className="w-full text-left px-3 py-2 rounded text-white hover:bg-white/10 flex items-center gap-2.5 transition-colors cursor-pointer group"
                >
                  <FluentGalleryIcon className="w-4 h-4 text-[#4cc2ff] shrink-0" />
                  <div>
                    <div className="font-semibold text-[#4cc2ff] group-hover:text-white transition-colors">Save to Gallery as Document</div>
                    <div className="text-[10px] text-neutral-400">Lưu file Word (.docx) vào Gallery</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleSaveToGalleryAsStickies}
                  className="w-full text-left px-3 py-2 rounded text-white hover:bg-white/10 flex items-center gap-2.5 transition-colors cursor-pointer group"
                >
                  <FluentNotesIcon className="w-4 h-4 shrink-0" style={{ color: currentStickyColor.accent }} />
                  <div>
                    <div className="font-semibold text-amber-300 group-hover:text-white transition-colors">Save to Gallery as Stickies</div>
                    <div className="text-[10px] text-neutral-400">Lưu dạng Sticky Note vào Gallery</div>
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
          title="Làm lại (Ctrl+D)"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-5 bg-white/10 mx-1" />

        {/* Font Family Selector Menu */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setShowFontMenu(!showFontMenu);
              setShowFontSizeMenu(false);
              setShowColorPicker(false);
              setShowHighlightPicker(false);
            }}
            className="flex items-center gap-1.5 bg-black/30 hover:bg-white/10 border border-white/10 rounded-md px-2.5 py-1 text-xs text-white outline-none cursor-pointer transition-colors max-w-[170px]"
            title="Chọn phông chữ (Hỗ trợ tiếng Việt)"
          >
            <Type className="w-3.5 h-3.5 text-[#4cc2ff] shrink-0" />
            <span className="truncate">{selectedFont.name}</span>
            <ChevronDown className="w-3 h-3 text-neutral-400 shrink-0 ml-1" />
          </button>

          {showFontMenu && (
            <div 
              className="absolute left-0 mt-1.5 w-64 bg-[#282832] border border-[#3e3e48] rounded-lg shadow-2xl p-1 z-50 text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-2.5 py-1 text-[11px] font-semibold text-neutral-400 border-b border-white/10 mb-1">
                Phông chữ hỗ trợ tiếng Việt
              </div>
              {PRESET_FONTS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleFontSelect(f)}
                  className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer ${
                    selectedFont.id === f.id ? 'bg-[#4cc2ff]/20 text-[#4cc2ff] font-semibold' : 'text-neutral-200'
                  }`}
                  style={{ fontFamily: f.fontFamily }}
                >
                  <span className="truncate">{f.label}</span>
                  {selectedFont.id === f.id && <Check className="w-3.5 h-3.5 shrink-0 ml-1 text-[#4cc2ff]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font Size: Custom typing (1 - 200) + Stepper + Quick Presets */}
        <div className="relative flex items-center">
          <div className="flex items-center gap-1 bg-black/30 border border-white/10 rounded-md px-1.5 py-0.5" title="Cỡ chữ (Gõ số từ 1 đến 200px)">
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

            {/* Quick dropdown arrow for font sizes */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setShowFontSizeMenu(!showFontSizeMenu);
                setShowFontMenu(false);
                setShowColorPicker(false);
                setShowHighlightPicker(false);
              }}
              className="ml-1 pl-1 border-l border-white/15 text-neutral-400 hover:text-white cursor-pointer"
              title="Danh sách cỡ chữ mẫu"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {showFontSizeMenu && (
            <div 
              className="absolute left-0 top-full mt-1.5 w-36 bg-[#282832] border border-[#3e3e48] rounded-lg shadow-2xl p-1 z-50 text-xs grid grid-cols-3 gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              {QUICK_FONT_SIZES.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyExactFontSize(sz)}
                  className={`py-1 text-center rounded hover:bg-white/10 transition-colors cursor-pointer ${
                    activeFontSize === sz ? 'bg-[#4cc2ff] text-black font-bold' : 'text-neutral-200'
                  }`}
                >
                  {sz}px
                </button>
              ))}
            </div>
          )}
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
              setShowFontMenu(false);
              setShowFontSizeMenu(false);
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
              setShowFontMenu(false);
              setShowFontSizeMenu(false);
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
          setShowFontMenu(false);
          setShowFontSizeMenu(false);
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
            onKeyDown={handleKeyDown}
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
            className="flex-1 outline-none text-neutral-200 leading-relaxed text-base empty:before:content-['Bắt_đầu_viết_ghi_chú_tại_đây...'] empty:before:text-neutral-500"
            style={{
              fontFamily: selectedFont.fontFamily,
              fontSize: `${activeFontSize}px`,
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
          <span className="hidden sm:inline">Phông: {selectedFont.name} ({activeFontSize}px)</span>
        </div>
        <div className="flex items-center gap-3">
          {isStickyVisible && (
            <span className="text-[#facc15] font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#facc15]" />
              Sticky Note Đang Mở
            </span>
          )}
          <span>Tự động lưu vào Sparkle</span>
        </div>
      </div>
    </div>
  );
};
