import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  FolderPlus,
  Plus,
  Search,
  Pin,
  PinOff,
  MoreVertical,
  X,
  Clock,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { FluentNotesIcon, FluentGalleryIcon } from '../components/FluentIcons';
import { exportDocx, exportWritePdf, createDocxBlob } from '../utils/officeExport';
import { galleryDB, GalleryMediaItem } from '../services/galleryStorage';
import { useNotes, STICKY_COLORS, NoteItem } from '../context/NotesContext';
import { useIsMobile } from '../hooks/useIsMobile';
import { motion, AnimatePresence } from 'motion/react';
import { flyoutPanelClassName, flyoutPanelStyle } from '../components/FlyoutDropdown';

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

// Helper to strip HTML tags for clean snippet previews
function stripHtml(html: string): string {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html || '';
  return tmp.textContent || tmp.innerText || '';
}

// Format note relative time similar to Apple Notes
function formatNoteDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    const hours = date.getHours().toString().padStart(2, '0');
    const mins = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${mins}`;
  }
  const isThisYear = date.getFullYear() === now.getFullYear();
  if (isThisYear) {
    return `${date.getDate()} thg ${date.getMonth() + 1}`;
  }
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

export const NotesApp: React.FC<NotesAppProps> = ({ navigate }) => {
  const {
    notes,
    activeNoteId,
    activeNote,
    createNote,
    deleteNote,
    updateNote,
    togglePinNote,
    setActiveNoteId,
    isStickyVisible,
    setIsStickyVisible,
    currentStickyColor,
    stickyColorId,
    setStickyColorId,
  } = useNotes();

  const isMobile = useIsMobile();
  const [mobileView, setMobileView] = useState<'list' | 'editor'>('editor');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notesFilter, setNotesFilter] = useState('');

  // Rich Text Editor states
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

  // Sync editor innerHTML whenever activeNote changes
  useEffect(() => {
    if (editorRef.current) {
      if (isInternalChangeRef.current) {
        isInternalChangeRef.current = false;
        return;
      }
      if (document.activeElement === editorRef.current) {
        return;
      }
      editorRef.current.innerHTML = activeNote?.content || '';
      updateStats();
    }
  }, [activeNote?.id, activeNote?.content, updateStats]);

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
    if (editorRef.current && activeNote) {
      isInternalChangeRef.current = true;
      const html = editorRef.current.innerHTML;
      updateNote(activeNote.id, { content: html });
      updateStats();
    }
  }, [activeNote, updateNote, updateStats]);

  // Format execution helper using document.execCommand
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

  // Keyboard Shortcuts: Ctrl+Z for Undo, Ctrl+D for Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;
      if (isCtrlOrMeta && (e.key === 'z' || e.key === 'Z')) {
        if (!e.shiftKey) {
          e.preventDefault();
          execCmd('undo');
        } else {
          e.preventDefault();
          execCmd('redo');
        }
      } else if (isCtrlOrMeta && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        execCmd('redo');
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  // Format commands
  const handleToggleBold = () => execCmd('bold');
  const handleToggleItalic = () => execCmd('italic');
  const handleToggleUnderline = () => execCmd('underline');
  const handleToggleStrikethrough = () => execCmd('strikeThrough');
  const handleListUl = () => execCmd('insertUnorderedList');
  const handleListOl = () => execCmd('insertOrderedList');
  const handleBlockquote = () => execCmd('formatBlock', 'blockquote');
  const handleClearFormat = () => execCmd('removeFormat');

  const handleSelectColor = (hex: string) => {
    setActiveColor(hex);
    setShowColorPicker(false);
    execCmd('foreColor', hex);
  };

  const handleSelectHighlight = (hex: string) => {
    setActiveHighlight(hex);
    setShowHighlightPicker(false);
    execCmd('hiliteColor', hex);
  };

  const handleSelectFont = (fontObj: FontOption) => {
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
    editorRef.current.style.fontFamily = fontObj.fontFamily;
    document.execCommand('styleWithCSS', false, true as any);
    document.execCommand('fontName', false, fontObj.fontFamily);
    saveSelection();
    handleEditorInput();
  };

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

  const triggerToast = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  // Export handlers
  const handleExportDocx = async () => {
    setShowExportMenu(false);
    const rawText = editorRef.current?.innerText || '';
    try {
      await exportDocx(activeNote?.title || 'Note', rawText, editorRef.current?.innerHTML);
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
      exportWritePdf(activeNote?.title || 'Note', rawText);
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
    a.download = `${(activeNote?.title || 'notes').trim()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast('Đã xuất file văn bản (.txt) thành công!');
  };

  const handleSaveToGalleryAsDocument = async () => {
    setShowExportMenu(false);
    const rawText = editorRef.current?.innerText || '';
    const title = (activeNote?.title || 'Document').trim();
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
    const title = (activeNote?.title || 'Sticky Note').trim();
    try {
      const now = new Date();
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const dateLabel = `${monthNames[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
      const safeTitle = (title || 'Sticky Note').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const safeContent = (rawText || '').slice(0, 350).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
        <rect width="600" height="600" rx="20" fill="${currentStickyColor.bg}"/>
        <rect width="600" height="56" rx="20" fill="rgba(0,0,0,0.07)"/>
        <circle cx="36" cy="28" r="7" fill="rgba(0,0,0,0.2)"/>
        <circle cx="60" cy="28" r="7" fill="rgba(0,0,0,0.2)"/>
        <text x="85" y="35" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="bold" fill="${currentStickyColor.text}" opacity="0.85">${safeTitle}</text>
        <foreignObject x="36" y="76" width="528" height="490">
          <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 22px; line-height: 1.45; color: ${currentStickyColor.text}; word-break: break-word; white-space: pre-wrap;">
            ${safeContent}
          </div>
        </foreignObject>
      </svg>`;
      const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
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
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ nội dung của ghi chú này không?')) {
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
        handleEditorInput();
      }
    }
  };

  const handleDeleteActiveNote = () => {
    if (notes.length <= 1) {
      if (window.confirm('Xóa nội dung ghi chú này?')) {
        updateNote(activeNote.id, { title: 'Ghi chú mới', content: '<p></p>' });
        if (editorRef.current) editorRef.current.innerHTML = '';
        updateStats();
      }
      return;
    }
    if (window.confirm(`Xóa ghi chú "${activeNote.title}"?`)) {
      deleteNote(activeNote.id);
      triggerToast('Đã xóa ghi chú');
    }
  };

  const handleToggleStickies = () => {
    setIsStickyVisible(!isStickyVisible);
    triggerToast(
      !isStickyVisible 
        ? 'Đã mở chế độ Sticky Note! Ghi chú hiển thị nổi trên màn hình.' 
        : 'Đã ẩn Sticky Note.'
    );
  };

  const handleCreateNewNote = () => {
    const created = createNote('Ghi chú mới', '<p></p>', 'yellow');
    if (isMobile) {
      setMobileView('editor');
    }
    triggerToast('Đã tạo ghi chú mới');
  };

  // Filtered notes (supporting search in title & content)
  const filteredNotes = useMemo(() => {
    const q = notesFilter.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter((n) => {
      const matchTitle = n.title.toLowerCase().includes(q);
      const plainText = stripHtml(n.content).toLowerCase();
      const matchContent = plainText.includes(q);
      return matchTitle || matchContent;
    });
  }, [notes, notesFilter]);

  // Separate pinned and unpinned notes like Apple Notes
  const pinnedNotes = useMemo(() => filteredNotes.filter((n) => n.pinned), [filteredNotes]);
  const regularNotes = useMemo(() => filteredNotes.filter((n) => !n.pinned), [filteredNotes]);

  return (
    <div className="flex h-full w-full bg-[#1e1e24] text-neutral-100 select-text overflow-hidden relative">
      {/* Toast Notification */}
      {notice && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-[8px] bg-[#0078d4] text-white text-xs sm:text-[13px] font-medium shadow-xl border border-white/20 animate-fade-in flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-white" />
          <span>{notice}</span>
        </div>
      )}

      {/* 1. LEFT SIDEBAR: NOTES LIST (Apple Notes / Notion style) */}
      <aside 
        className={`shrink-0 flex flex-col bg-[#18181f] border-r border-white/10 transition-all duration-200 select-none ${
          isMobile 
            ? (mobileView === 'list' ? 'w-full' : 'hidden')
            : (isSidebarOpen ? 'w-[290px] xl:w-[320px]' : 'w-0 overflow-hidden border-r-0')
        }`}
      >
        {/* Sidebar Header: Branding & New Note Button */}
        <div className="h-14 px-3.5 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Quay lại Trang chủ"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 font-semibold text-sm text-white">
              <FluentNotesIcon className="w-4 h-4 text-[#4cc2ff]" />
              <span>Notes</span>
              <span className="text-[11px] font-normal text-neutral-400 px-1.5 py-0.5 rounded-full bg-white/5">
                {notes.length}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCreateNewNote}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] bg-[#0078d4] hover:bg-[#006cc1] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer active:scale-95"
            title="Tạo ghi chú mới (Apple Notes / Notion)"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo note</span>
          </button>
        </div>

        {/* Search filter for notes */}
        <div className="p-2.5 border-b border-white/5">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              value={notesFilter}
              onChange={(e) => setNotesFilter(e.target.value)}
              placeholder="Tìm kiếm ghi chú..."
              className="w-full h-8 pl-8 pr-7 bg-white/5 hover:bg-white/[0.08] focus:bg-white/10 rounded-[8px] text-xs text-white placeholder-neutral-400 outline-none border border-white/10 focus:border-[#4cc2ff] transition-all"
            />
            {notesFilter && (
              <button
                type="button"
                onClick={() => setNotesFilter('')}
                className="absolute right-2 text-neutral-400 hover:text-white p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Notes Scrollable List */}
        <div className="flex-1 overflow-y-auto sidebar-scroller p-2 space-y-1">
          {filteredNotes.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-400">
              Không tìm thấy ghi chú nào khớp với "<span className="text-white font-medium">{notesFilter}</span>"
            </div>
          ) : (
            <>
              {/* Pinned Notes section */}
              {pinnedNotes.length > 0 && (
                <div className="mb-2">
                  <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#4cc2ff] flex items-center gap-1.5">
                    <Pin className="w-3 h-3" />
                    <span>Đã ghim ({pinnedNotes.length})</span>
                  </div>
                  {pinnedNotes.map((note) => {
                    const color = STICKY_COLORS.find((c) => c.id === note.colorId) || STICKY_COLORS[0];
                    const plainSnippet = stripHtml(note.content).trim();
                    const isSelected = note.id === activeNoteId;

                    return (
                      <div
                        key={note.id}
                        onClick={() => {
                          setActiveNoteId(note.id);
                          if (isMobile) setMobileView('editor');
                        }}
                        className={`group relative w-full p-2.5 rounded-[10px] text-left transition-all cursor-pointer mb-1 border ${
                          isSelected
                            ? 'bg-[#0078d4]/20 border-[#0078d4]/60 text-white shadow-xs'
                            : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/5 text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span 
                              className="w-2 h-2 rounded-full shrink-0" 
                              style={{ backgroundColor: color.bg }} 
                            />
                            <h4 className="text-[13px] font-semibold truncate leading-snug text-white">
                              {note.title.trim() || 'Ghi chú không có tiêu đề'}
                            </h4>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePinNote(note.id);
                              }}
                              className="p-1 rounded text-neutral-400 hover:text-white hover:bg-white/10"
                              title="Bỏ ghim"
                            >
                              <PinOff className="w-3 h-3 text-[#4cc2ff]" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNote(note.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded text-neutral-400 hover:text-red-400 hover:bg-white/10 transition-opacity"
                              title="Xóa ghi chú"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-neutral-400 mb-1">
                          <span className="font-medium shrink-0">{formatNoteDate(note.updatedAt)}</span>
                          <span className="truncate text-neutral-500">
                            {plainSnippet || 'Không có nội dung bổ sung'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Regular Notes section */}
              {regularNotes.length > 0 && (
                <div>
                  {pinnedNotes.length > 0 && (
                    <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                      Ghi chú
                    </div>
                  )}
                  {regularNotes.map((note) => {
                    const color = STICKY_COLORS.find((c) => c.id === note.colorId) || STICKY_COLORS[0];
                    const plainSnippet = stripHtml(note.content).trim();
                    const isSelected = note.id === activeNoteId;

                    return (
                      <div
                        key={note.id}
                        onClick={() => {
                          setActiveNoteId(note.id);
                          if (isMobile) setMobileView('editor');
                        }}
                        className={`group relative w-full p-2.5 rounded-[10px] text-left transition-all cursor-pointer mb-1 border ${
                          isSelected
                            ? 'bg-[#0078d4]/20 border-[#0078d4]/60 text-white shadow-xs'
                            : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/5 text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span 
                              className="w-2 h-2 rounded-full shrink-0" 
                              style={{ backgroundColor: color.bg }} 
                            />
                            <h4 className="text-[13px] font-semibold truncate leading-snug text-white">
                              {note.title.trim() || 'Ghi chú không có tiêu đề'}
                            </h4>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePinNote(note.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded text-neutral-400 hover:text-[#4cc2ff] hover:bg-white/10 transition-opacity"
                              title="Ghim ghi chú lên đầu"
                            >
                              <Pin className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNote(note.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded text-neutral-400 hover:text-red-400 hover:bg-white/10 transition-opacity"
                              title="Xóa ghi chú"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                          <span className="font-medium shrink-0">{formatNoteDate(note.updatedAt)}</span>
                          <span className="truncate text-neutral-500">
                            {plainSnippet || 'Không có văn bản'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </aside>

      {/* 2. RIGHT PANEL: RICH NOTE EDITOR (Notion / Apple Notes style) */}
      <main 
        className={`flex-1 flex flex-col min-w-0 bg-[#1e1e24] ${
          isMobile && mobileView === 'list' ? 'hidden' : 'flex'
        }`}
      >
        {/* Top Header of Editor */}
        <div className="h-14 px-3 sm:px-6 bg-[#18181f] border-b border-white/10 flex items-center justify-between gap-2 shrink-0 z-20">
          <div className="flex items-center gap-2 min-w-0">
            {/* Toggle sidebar button (desktop) / Back button (mobile) */}
            {isMobile ? (
              <button
                type="button"
                onClick={() => setMobileView('list')}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 shrink-0"
                title="Danh sách ghi chú"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 shrink-0 cursor-pointer"
                title={isSidebarOpen ? "Thu gọn danh sách" : "Mở rộng danh sách ghi chú"}
              >
                {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
              </button>
            )}

            {/* Note Title Input */}
            <input
              type="text"
              value={activeNote?.title || ''}
              onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
              className="bg-transparent text-sm sm:text-base font-bold text-white placeholder-neutral-500 outline-none border-b border-transparent focus:border-[#4cc2ff] py-1 px-1 min-w-[120px] max-w-[240px] sm:max-w-xs truncate transition-colors"
              placeholder="Tiêu đề ghi chú..."
            />
          </div>

          {/* Quick Actions Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Show as stickies */}
            <button
              type="button"
              onClick={handleToggleStickies}
              className={`px-2.5 sm:px-3 py-1.5 rounded-[8px] font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer border ${
                isStickyVisible
                  ? 'bg-[#ca8a04] hover:bg-[#a16207] text-white border-[#facc15] shadow-sm'
                  : 'bg-white/10 hover:bg-white/15 text-neutral-200 border-white/15'
              }`}
              title="Hiển thị ghi chú dưới dạng Sticky Note nổi trên màn hình"
            >
              <FluentNotesIcon className="w-3.5 h-3.5" style={{ color: currentStickyColor.accent }} />
              <span className="hidden sm:inline">Show as stickies</span>
              <span className="sm:hidden">Stickies</span>
              {isStickyVisible && (
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse ml-0.5" />
              )}
            </button>

            {/* Sticky Color Quick Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowStickyColorMenu(!showStickyColorMenu)}
                className="px-2 sm:px-2.5 py-1.5 rounded-[8px] bg-white/10 hover:bg-white/15 text-neutral-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Đổi màu Sticky Note"
              >
                <div 
                  className="w-3.5 h-3.5 rounded-full border border-black/20" 
                  style={{ backgroundColor: currentStickyColor.bg }} 
                />
                <span className="text-[11px] hidden md:inline">{currentStickyColor.name}</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {showStickyColorMenu && (
                <div
                  className="absolute right-0 mt-1.5 p-2 bg-[#282832] border border-[#3e3e48] rounded-[10px] shadow-2xl grid grid-cols-4 gap-1.5 z-50 w-44"
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
                      {activeNote?.colorId === c.id && (
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
                className="px-2.5 py-1.5 rounded-[8px] bg-white/10 hover:bg-white/15 text-neutral-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Xuất file hoặc lưu vào Gallery"
              >
                <Download className="w-3.5 h-3.5 text-neutral-300" />
                <span className="hidden sm:inline">Xuất file</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              <AnimatePresence>
                {showExportMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                    className={`absolute right-0 mt-1.5 w-60 z-50 text-xs ${flyoutPanelClassName}`}
                    style={flyoutPanelStyle}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={handleExportDocx}
                      className="w-full px-3 py-2 text-left hover:bg-white/10 rounded-[6px] flex items-center gap-2.5 text-neutral-200 cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-[#0078d4]" />
                      <div>
                        <div className="font-semibold text-white">Xuất file Word (.docx)</div>
                        <div className="text-[10px] text-neutral-400">Tài liệu Microsoft Word đầy đủ</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportPdf}
                      className="w-full px-3 py-2 text-left hover:bg-white/10 rounded-[6px] flex items-center gap-2.5 text-neutral-200 cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-red-400" />
                      <div>
                        <div className="font-semibold text-white">In / Xuất PDF (.pdf)</div>
                        <div className="text-[10px] text-neutral-400">Xuất file in chuẩn tài liệu</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportTxt}
                      className="w-full px-3 py-2 text-left hover:bg-white/10 rounded-[6px] flex items-center gap-2.5 text-neutral-200 cursor-pointer"
                    >
                      <FileDown className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="font-semibold text-white">Xuất văn bản (.txt)</div>
                        <div className="text-[10px] text-neutral-400">Tệp văn bản thuần</div>
                      </div>
                    </button>

                    <div className="border-t border-white/10 my-1 mx-1" />

                    <button
                      type="button"
                      onClick={handleSaveToGalleryAsDocument}
                      className="w-full px-3 py-2 text-left hover:bg-white/10 rounded-[6px] flex items-center gap-2.5 text-neutral-200 cursor-pointer"
                    >
                      <FluentGalleryIcon className="w-4 h-4 text-[#4cc2ff]" />
                      <div>
                        <div className="font-semibold text-white">Lưu vào Gallery (Docx)</div>
                        <div className="text-[10px] text-neutral-400">Xem và tải lại trong Gallery</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveToGalleryAsStickies}
                      className="w-full px-3 py-2 text-left hover:bg-white/10 rounded-[6px] flex items-center gap-2.5 text-neutral-200 cursor-pointer"
                    >
                      <FluentNotesIcon className="w-4 h-4 text-[#facc15]" />
                      <div>
                        <div className="font-semibold text-white">Lưu Stickies vào Gallery</div>
                        <div className="text-[10px] text-neutral-400">Ảnh thẻ ghi chú màu sắc</div>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Delete note */}
            <button
              type="button"
              onClick={handleDeleteActiveNote}
              className="p-1.5 rounded-[8px] bg-white/10 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
              title="Xóa ghi chú hiện tại"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. RICH TEXT FORMATTING RIBBON BAR */}
        <div className="h-10 px-3 sm:px-6 bg-[#25252e] border-b border-white/10 flex items-center gap-1.5 overflow-x-auto sidebar-scroller select-none shrink-0 z-10">
          {/* Undo / Redo */}
          <button
            type="button"
            onClick={() => execCmd('undo')}
            className="p-1.5 rounded hover:bg-white/10 text-neutral-300 cursor-pointer"
            title="Hoàn tác (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('redo')}
            className="p-1.5 rounded hover:bg-white/10 text-neutral-300 cursor-pointer"
            title="Làm lại (Ctrl+D)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-white/15 mx-0.5 shrink-0" />

          {/* Font Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFontMenu(!showFontMenu)}
              className="h-7 px-2 rounded bg-white/5 hover:bg-white/10 text-neutral-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Phông chữ"
            >
              <Type className="w-3 h-3 text-[#4cc2ff]" />
              <span className="max-w-[100px] truncate">{selectedFont.name}</span>
              <ChevronDown className="w-2.5 h-2.5 text-neutral-400" />
            </button>

            <AnimatePresence>
              {showFontMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className={`absolute left-0 mt-1 w-64 z-50 max-h-60 overflow-y-auto sidebar-scroller ${flyoutPanelClassName}`}
                  style={flyoutPanelStyle}
                  onClick={(e) => e.stopPropagation()}
                >
                  {PRESET_FONTS.map((font) => (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => handleSelectFont(font)}
                      className="w-full px-3 py-1.5 rounded-[6px] text-left text-xs text-neutral-200 hover:bg-white/10 flex items-center justify-between cursor-pointer"
                      style={{ fontFamily: font.fontFamily }}
                    >
                      <span>{font.label}</span>
                      {selectedFont.id === font.id && <Check className="w-3 h-3 text-[#4cc2ff]" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Font Size Selector */}
          <div className="relative flex items-center">
            <input
              type="number"
              min={1}
              max={200}
              value={fontSizeInput}
              onChange={(e) => setFontSizeInput(e.target.value)}
              onBlur={handleFontSizeInputBlurOrEnter}
              onKeyDown={(e) => e.key === 'Enter' && handleFontSizeInputBlurOrEnter()}
              className="w-12 h-7 bg-white/5 hover:bg-white/10 text-center rounded-l text-xs text-white border-y border-l border-white/10 outline-none"
              title="Cỡ chữ (1 - 200px)"
            />
            <button
              type="button"
              onClick={() => setShowFontSizeMenu(!showFontSizeMenu)}
              className="h-7 px-1 bg-white/5 hover:bg-white/10 rounded-r border border-white/10 text-neutral-400 hover:text-white cursor-pointer"
            >
              <ChevronDown className="w-2.5 h-2.5" />
            </button>

            <AnimatePresence>
              {showFontSizeMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className={`absolute left-0 top-full mt-1 w-20 z-50 max-h-48 overflow-y-auto sidebar-scroller ${flyoutPanelClassName}`}
                  style={flyoutPanelStyle}
                  onClick={(e) => e.stopPropagation()}
                >
                  {QUICK_FONT_SIZES.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => applyExactFontSize(sz)}
                      className="w-full px-2 py-1 rounded-[4px] text-center text-xs text-neutral-200 hover:bg-white/10 cursor-pointer"
                    >
                      {sz} px
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-[1px] h-4 bg-white/15 mx-0.5 shrink-0" />

          {/* Bold, Italic, Underline, Strikethrough */}
          <button
            type="button"
            onClick={handleToggleBold}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              isBold ? 'bg-[#0078d4] text-white' : 'hover:bg-white/10 text-neutral-300'
            }`}
            title="In đậm (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleToggleItalic}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              isItalic ? 'bg-[#0078d4] text-white' : 'hover:bg-white/10 text-neutral-300'
            }`}
            title="In nghiêng (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleToggleUnderline}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              isUnderline ? 'bg-[#0078d4] text-white' : 'hover:bg-white/10 text-neutral-300'
            }`}
            title="Gạch chân (Ctrl+U)"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleToggleStrikethrough}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              isStrikethrough ? 'bg-[#0078d4] text-white' : 'hover:bg-white/10 text-neutral-300'
            }`}
            title="Gạch ngang chữ"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-white/15 mx-0.5 shrink-0" />

          {/* Heading 1 & Heading 2 */}
          <button
            type="button"
            onClick={() => handleFormatBlock('<h1>')}
            className="px-2 py-1 rounded text-xs font-bold hover:bg-white/10 text-neutral-300 cursor-pointer"
            title="Tiêu đề lớn 1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => handleFormatBlock('<h2>')}
            className="px-2 py-1 rounded text-xs font-semibold hover:bg-white/10 text-neutral-300 cursor-pointer"
            title="Tiêu đề phụ 2"
          >
            H2
          </button>

          <div className="w-[1px] h-4 bg-white/15 mx-0.5 shrink-0" />

          {/* Lists & Quotes */}
          <button
            type="button"
            onClick={handleListUl}
            className="p-1.5 rounded hover:bg-white/10 text-neutral-300 cursor-pointer"
            title="Danh sách dấu chấm"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleListOl}
            className="p-1.5 rounded hover:bg-white/10 text-neutral-300 cursor-pointer"
            title="Danh sách đánh số"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleBlockquote}
            className="p-1.5 rounded hover:bg-white/10 text-neutral-300 cursor-pointer"
            title="Trích dẫn"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-white/15 mx-0.5 shrink-0" />

          {/* Alignments */}
          <button
            type="button"
            onClick={() => handleAlign('left')}
            className={`p-1.5 rounded cursor-pointer ${textAlign === 'left' ? 'bg-[#0078d4] text-white' : 'hover:bg-white/10 text-neutral-300'}`}
            title="Căn trái"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleAlign('center')}
            className={`p-1.5 rounded cursor-pointer ${textAlign === 'center' ? 'bg-[#0078d4] text-white' : 'hover:bg-white/10 text-neutral-300'}`}
            title="Căn giữa"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleAlign('right')}
            className={`p-1.5 rounded cursor-pointer ${textAlign === 'right' ? 'bg-[#0078d4] text-white' : 'hover:bg-white/10 text-neutral-300'}`}
            title="Căn phải"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-white/15 mx-0.5 shrink-0" />

          {/* Color & Highlight */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-1.5 rounded hover:bg-white/10 flex items-center gap-1 cursor-pointer"
              title="Màu chữ"
            >
              <span className="font-bold text-xs" style={{ color: activeColor }}>A</span>
              <span className="w-2 h-0.5 rounded-full" style={{ backgroundColor: activeColor }} />
            </button>
            {showColorPicker && (
              <div 
                className="absolute left-0 mt-1 p-2 bg-[#2a2a35] border border-[#3e3e48] rounded-[10px] shadow-2xl grid grid-cols-5 gap-1.5 z-50 w-36"
                onClick={(e) => e.stopPropagation()}
              >
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleSelectColor(c)}
                    className="w-5 h-5 rounded-full border border-white/20 hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowHighlightPicker(!showHighlightPicker)}
              className="p-1.5 rounded hover:bg-white/10 flex items-center gap-1 cursor-pointer"
              title="Màu tô sáng văn bản"
            >
              <Highlighter className="w-3.5 h-3.5 text-neutral-300" />
            </button>
            {showHighlightPicker && (
              <div 
                className="absolute left-0 mt-1 p-2 bg-[#2a2a35] border border-[#3e3e48] rounded-[10px] shadow-2xl grid grid-cols-4 gap-1.5 z-50 w-36"
                onClick={(e) => e.stopPropagation()}
              >
                {PRESET_HIGHLIGHTS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleSelectHighlight(c)}
                    className="w-5 h-5 rounded border border-white/20 hover:scale-110 transition-transform"
                    style={{ backgroundColor: c === 'transparent' ? '#333' : c }}
                    title={c === 'transparent' ? 'Không màu' : c}
                  />
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleClearFormat}
            className="p-1.5 rounded hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer ml-auto"
            title="Xóa định dạng"
          >
            <RemoveFormatting className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3. DOCUMENT EDITABLE BODY */}
        <div className="flex-1 overflow-y-auto sidebar-scroller p-4 sm:p-8 flex justify-center">
          <div className="w-full max-w-3xl min-h-[500px] flex flex-col">
            {/* Notion style Large Title */}
            <input
              type="text"
              value={activeNote?.title || ''}
              onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
              className="w-full bg-transparent text-2xl sm:text-3xl font-extrabold text-white placeholder-neutral-500 outline-none pb-2 mb-2 border-b border-white/10 focus:border-[#4cc2ff] transition-colors"
              placeholder="Tiêu đề ghi chú..."
            />

            {/* Note metadata footer subtitle */}
            <div className="flex items-center gap-3 text-xs text-neutral-400 pb-4 mb-4 border-b border-white/5 select-none">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-neutral-500" />
                Cập nhật: {formatNoteDate(activeNote.updatedAt)}
              </span>
              <span>•</span>
              <span>{wordCount} từ</span>
              <span>•</span>
              <span>{charCount} ký tự</span>
            </div>

            {/* Rich text editable container */}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleEditorInput}
              onKeyUp={updateToolbarStates}
              onMouseUp={updateToolbarStates}
              className="flex-1 outline-none text-neutral-200 text-sm sm:text-base leading-relaxed selection:bg-[#0078d4]/40 selection:text-white pb-24"
              style={{
                fontFamily: selectedFont.fontFamily,
                minHeight: '400px'
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
};
