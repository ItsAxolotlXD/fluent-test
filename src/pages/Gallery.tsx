import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UploadCloud, 
  Trash2, 
  Heart, 
  Download, 
  X, 
  Play, 
  Film, 
  Image as ImageIcon, 
  Music, 
  FileText, 
  RotateCw, 
  FolderOpen, 
  Sparkles,
  Funnel,
  CheckSquare,
  Square,
  Copy,
  Check,
  FileSpreadsheet,
  Presentation,
  FileCode,
  Folder,
  FolderPlus,
  FolderInput,
  ChevronRight,
  ArrowLeft,
  PenLine
} from 'lucide-react';
import { 
  galleryDB, 
  GalleryMediaItem, 
  GalleryFolder,
  getMediaDimensions 
} from '../services/galleryStorage';
import { GalleryContextMenu, type GalleryContextAction } from '../components/gallery/GalleryContextMenu';
import { PromptDialog, MoveToFolderDialog } from '../components/gallery/GalleryDialogs';

const LONG_PRESS_MS = 500;
import { useSettings } from '../hooks/useSettings';
import { FluentNotesIcon } from '../components/FluentIcons';

interface GalleryProps {
  navigate: (route: string) => void;
  searchQuery?: string;
}

type FilterType = 'all' | 'image' | 'video' | 'audio' | 'document' | 'favorites';

export const Gallery: React.FC<GalleryProps> = ({ navigate, searchQuery = '' }) => {
  const { settings } = useSettings();
  const [items, setItems] = useState<GalleryMediaItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GalleryMediaItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [activeYear, setActiveYear] = useState<number>(2022);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Selection mode states
  const [isSelectMode, setIsSelectMode] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Folders & context menu
  const [folders, setFolders] = useState<GalleryFolder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ item: GalleryMediaItem; x: number; y: number } | null>(null);
  const [renameTarget, setRenameTarget] = useState<{ kind: 'item' | 'folder'; id: string; name: string } | null>(null);
  const [moveTargetIds, setMoveTargetIds] = useState<string[] | null>(null);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const longPressTimer = useRef<number | null>(null);
  const longPressTriggered = useRef(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load items from database
  const loadGallery = async () => {
    const [list, folderList] = await Promise.all([galleryDB.getAll(), galleryDB.getFolders()]);
    setItems(list);
    setFolders(folderList);
  };

  const currentFolder = folders.find((f) => f.id === currentFolderId) ?? null;
  const isSearching = searchQuery.trim().length > 0;

  useEffect(() => {
    if (currentFolderId && folders.length > 0 && !folders.some((f) => f.id === currentFolderId)) {
      setCurrentFolderId(null);
    }
  }, [folders, currentFolderId]);

  useEffect(() => {
    loadGallery();
    const unsubscribe = galleryDB.subscribe(() => {
      loadGallery();
    });
    return () => unsubscribe();
  }, []);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Folder scope (search looks across every folder)
      if (!searchQuery.trim() && (item.folderId ?? null) !== currentFolderId) return false;

      // Type filter
      if (activeFilter === 'image' && item.type !== 'image') return false;
      if (activeFilter === 'video' && item.type !== 'video') return false;
      if (activeFilter === 'audio' && item.type !== 'audio') return false;
      if (activeFilter === 'document' && item.type !== 'document') return false;
      if (activeFilter === 'favorites' && !item.isFavorite) return false;

      // Search query (from TopBar)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q) ?? false;
        const matchesTags = item.tags?.some((t) => t.toLowerCase().includes(q)) ?? false;
        const matchesDate = item.dateLabel?.toLowerCase().includes(q) ?? false;
        const matchesMime = item.mimeType?.toLowerCase().includes(q) ?? false;
        if (!matchesTitle && !matchesDesc && !matchesTags && !matchesDate && !matchesMime) return false;
      }

      return true;
    });
  }, [items, activeFilter, searchQuery, currentFolderId]);

  const folderItemCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const it of items) {
      if (it.folderId) counts.set(it.folderId, (counts.get(it.folderId) ?? 0) + 1);
    }
    return counts;
  }, [items]);

  // Timeline years list from available items
  const timelineYears = useMemo(() => {
    return [2023, 2022, 2021, 2020, 2019, 2018];
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Upload handler supporting images, videos, audio, and all office formats (.docx, .doc, .pptx, .ppt, .xlsx, .xls, .pdf, .txt)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(10);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileNameLower = file.name.toLowerCase();
      let type: 'image' | 'video' | 'audio' | 'document' = 'document';

      if (file.type.startsWith('image/')) {
        type = 'image';
      } else if (file.type.startsWith('video/')) {
        type = 'video';
      } else if (file.type.startsWith('audio/')) {
        type = 'audio';
      } else {
        type = 'document';
      }

      const dims = await getMediaDimensions(file);
      const url = URL.createObjectURL(file);
      const now = new Date();
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const dateLabel = `${monthNames[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

      // Tags and format labeling
      const tags = ['Uploaded'];
      if (fileNameLower.endsWith('.docx') || fileNameLower.endsWith('.doc')) {
        tags.push('Word', 'DOCX');
      } else if (fileNameLower.endsWith('.pptx') || fileNameLower.endsWith('.ppt')) {
        tags.push('PowerPoint', 'PPTX');
      } else if (fileNameLower.endsWith('.xlsx') || fileNameLower.endsWith('.xls')) {
        tags.push('Excel', 'XLSX');
      } else if (fileNameLower.endsWith('.pdf')) {
        tags.push('PDF');
      } else {
        tags.push(type.toUpperCase());
      }

      const newItem: GalleryMediaItem = {
        id: `upload-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
        title: file.name,
        type,
        url,
        blobData: file,
        thumbnailUrl: type === 'image' ? url : undefined,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        dateAdded: now.toISOString(),
        dateLabel,
        year: now.getFullYear(),
        dimensions: { width: dims.width, height: dims.height },
        aspectRatio: dims.width / Math.max(dims.height, 1),
        duration: dims.duration,
        isFavorite: false,
        tags,
        description: `Uploaded from device (${(file.size / (1024 * 1024)).toFixed(2)} MB)`,
        source: 'upload',
      };

      await galleryDB.add(newItem);
      setUploadProgress(Math.round(((i + 1) / files.length) * 100));
    }

    setIsUploading(false);
    setUploadProgress(null);
    showToast(`Uploaded ${files.length} media ${files.length === 1 ? 'file' : 'files'}`);
    if (e.target) e.target.value = '';
  };

  const handleDeleteItem = async (item: GalleryMediaItem) => {
    // Optimistic local state update
    setItems((prev) => prev.filter((it) => it.id !== item.id));
    if (selectedItem?.id === item.id) setSelectedItem(null);
    await galleryDB.delete(item.id);
    showToast(`Deleted "${item.title}"`);
  };

  const handleToggleFavorite = async (item: GalleryMediaItem) => {
    const isFav = await galleryDB.toggleFavorite(item.id);
    if (selectedItem?.id === item.id) {
      setSelectedItem({ ...selectedItem, isFavorite: isFav });
    }
  };

  const handleRestoreSamples = async () => {
    await galleryDB.restoreSamples();
    showToast('Loaded demo files and media');
  };

  // Selection actions
  const toggleSelect = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map((it) => it.id)));
    }
  };

  const handleDuplicateSelected = async () => {
    if (selectedIds.size === 0) return;
    const ids: string[] = Array.from(selectedIds);
    for (const id of ids) {
      await galleryDB.duplicate(id);
    }
    showToast(`Duplicated ${ids.length} ${ids.length === 1 ? 'item' : 'items'}`);
    setSelectedIds(new Set());
    setIsSelectMode(false);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    const ids: string[] = Array.from(selectedIds);
    // Optimistically update items state immediately so UI refreshes without delay
    setItems((prev) => prev.filter((it) => !selectedIds.has(it.id)));
    setSelectedIds(new Set());
    setIsSelectMode(false);
    // Persist deletion to IndexedDB
    await galleryDB.deleteMany(ids);
    showToast(`Deleted ${ids.length} ${ids.length === 1 ? 'item' : 'items'}`);
  };

  const closeContextMenu = React.useCallback(() => setContextMenu(null), []);

  const openContextMenu = (item: GalleryMediaItem, x: number, y: number) => {
    if (isSelectMode) return;
    setContextMenu({ item, x, y });
  };

  const clearLongPress = () => {
    if (longPressTimer.current !== null) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchStart = (item: GalleryMediaItem, e: React.TouchEvent) => {
    longPressTriggered.current = false;
    const touch = e.touches[0];
    const { clientX, clientY } = touch;
    clearLongPress();
    longPressTimer.current = window.setTimeout(() => {
      longPressTriggered.current = true;
      if (navigator.vibrate) navigator.vibrate(10);
      openContextMenu(item, clientX, clientY);
    }, LONG_PRESS_MS);
  };

  const getFileName = (item: GalleryMediaItem) => {
    if (/\.[a-z0-9]{2,5}$/i.test(item.title)) return item.title;
    const ext = item.mimeType?.split('/')[1]?.split(/[+;]/)[0];
    return ext && ext.length <= 5 ? `${item.title}.${ext}` : item.title;
  };

  const getItemBlob = async (item: GalleryMediaItem): Promise<Blob | null> => {
    if (item.blobData) return item.blobData;
    try {
      const res = await fetch(item.url);
      return await res.blob();
    } catch {
      return null;
    }
  };

  const handleSaveToDevice = async (item: GalleryMediaItem) => {
    const blob = await getItemBlob(item);
    const href = blob ? URL.createObjectURL(blob) : item.url;
    const a = document.createElement('a');
    a.href = href;
    a.download = getFileName(item);
    a.rel = 'noopener';
    if (!blob) a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    a.remove();
    if (blob) setTimeout(() => URL.revokeObjectURL(href), 1000);
    showToast(`Saving "${item.title}"`);
  };

  const handleShare = async (item: GalleryMediaItem) => {
    try {
      const blob = await getItemBlob(item);
      if (blob && navigator.share) {
        const file = new File([blob], getFileName(item), { type: blob.type || item.mimeType });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: item.title });
          return;
        }
      }
      if (navigator.share && /^https?:/.test(item.url)) {
        await navigator.share({ title: item.title, url: item.url });
        return;
      }
      if (/^https?:/.test(item.url) && navigator.clipboard) {
        await navigator.clipboard.writeText(item.url);
        showToast('Link copied to clipboard');
        return;
      }
      showToast('Sharing is not supported on this device');
    } catch (err) {
      if ((err as DOMException)?.name !== 'AbortError') showToast('Unable to share this file');
    }
  };

  const handleContextAction = async (action: GalleryContextAction) => {
    if (!contextMenu) return;
    const { item } = contextMenu;
    setContextMenu(null);
    switch (action) {
      case 'open':
        setSelectedItem(item);
        break;
      case 'favorite': {
        const isFav = await galleryDB.toggleFavorite(item.id);
        showToast(isFav ? 'Added to favorites' : 'Removed from favorites');
        break;
      }
      case 'rename':
        setRenameTarget({ kind: 'item', id: item.id, name: item.title });
        break;
      case 'share':
        await handleShare(item);
        break;
      case 'duplicate':
        await galleryDB.duplicate(item.id);
        showToast(`Duplicated "${item.title}"`);
        break;
      case 'move':
        setMoveTargetIds([item.id]);
        break;
      case 'save':
        await handleSaveToDevice(item);
        break;
      case 'delete':
        await handleDeleteItem(item);
        break;
    }
  };

  const handleRenameConfirm = async (name: string) => {
    if (!renameTarget) return;
    if (renameTarget.kind === 'item') {
      await galleryDB.rename(renameTarget.id, name);
      if (selectedItem?.id === renameTarget.id) setSelectedItem({ ...selectedItem, title: name });
    } else {
      await galleryDB.renameFolder(renameTarget.id, name);
    }
    setRenameTarget(null);
    showToast(`Renamed to "${name}"`);
  };

  const handleCreateFolder = async (name: string) => {
    const folder = await galleryDB.createFolder(name);
    setIsNewFolderOpen(false);
    if (moveTargetIds) {
      await galleryDB.moveToFolder(moveTargetIds, folder.id);
      showToast(`Moved ${moveTargetIds.length === 1 ? 'item' : `${moveTargetIds.length} items`} to "${name}"`);
      setMoveTargetIds(null);
      setSelectedIds(new Set());
      setIsSelectMode(false);
    } else {
      showToast(`Created folder "${name}"`);
    }
  };

  const handleMove = async (folderId: string | null) => {
    if (!moveTargetIds) return;
    const ids = moveTargetIds;
    setMoveTargetIds(null);
    await galleryDB.moveToFolder(ids, folderId);
    const dest = folderId ? folders.find((f) => f.id === folderId)?.name ?? 'folder' : 'Gallery';
    showToast(`Moved ${ids.length === 1 ? 'item' : `${ids.length} items`} to "${dest}"`);
    setSelectedIds(new Set());
    setIsSelectMode(false);
  };

  const handleDeleteFolder = async (folder: GalleryFolder) => {
    await galleryDB.deleteFolder(folder.id);
    if (currentFolderId === folder.id) setCurrentFolderId(null);
    showToast(`Deleted folder "${folder.name}"`);
  };

  // Helper to determine Office Document type info
  const getDocumentDetails = (item: GalleryMediaItem) => {
    const title = item.title.toLowerCase();
    const mime = item.mimeType?.toLowerCase() || '';

    if (item.mimeType === 'application/x-sticky-note' || item.tags?.includes('Stickies') || item.tags?.includes('Sticky Note')) {
      return {
        badge: 'STICKIES',
        brand: 'Sticky Note',
        color: '#ca8a04',
        icon: FluentNotesIcon,
      };
    }
    if (title.endsWith('.docx') || title.endsWith('.doc') || mime.includes('word')) {
      return {
        badge: 'DOCX',
        brand: 'Word Document',
        color: '#2b579a',
        icon: FileText,
      };
    }
    if (title.endsWith('.pptx') || title.endsWith('.ppt') || mime.includes('presentation') || mime.includes('powerpoint')) {
      return {
        badge: 'PPTX',
        brand: 'PowerPoint',
        color: '#d24726',
        icon: Presentation,
      };
    }
    if (title.endsWith('.xlsx') || title.endsWith('.xls') || mime.includes('spreadsheet') || mime.includes('excel')) {
      return {
        badge: 'XLSX',
        brand: 'Excel Sheet',
        color: '#217346',
        icon: FileSpreadsheet,
      };
    }
    if (title.endsWith('.pdf') || mime.includes('pdf')) {
      return {
        badge: 'PDF',
        brand: 'PDF Document',
        color: '#e81123',
        icon: FileText,
      };
    }
    return {
      badge: 'FILE',
      brand: 'Document',
      color: '#4cc2ff',
      icon: FileCode,
    };
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-[#282c31] text-[#111827] dark:text-[#F3F4F6] relative select-none">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#16181d]/90 backdrop-blur-xl border border-white/10 text-white text-xs sm:text-sm px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#4cc2ff]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photos-style gallery header */}
      <header className="sticky top-0 z-30 px-6 py-2.5 border-b border-white/[0.06] bg-[#282c31]/95 backdrop-blur-xl flex items-center justify-between gap-4 shrink-0 overflow-visible">
        <div className="relative text-white/60">
          <button type="button" aria-label="Filter gallery" title="Filter gallery" onClick={() => setIsFilterMenuOpen((open) => !open)} className="size-8 rounded-md flex items-center justify-center hover:bg-white/10 transition-colors">
            <Funnel className="w-3.5 h-3.5" />
          </button>
          {isFilterMenuOpen && (
            <div className="absolute right-0 top-9 z-[100] min-w-36 rounded-lg border border-white/10 bg-[#303030] p-1.5 shadow-2xl">
              {[
                { id: 'image', label: 'Photos' },
                { id: 'video', label: 'Video' },
                { id: 'audio', label: 'Audio' },
                { id: 'document', label: 'Files' },
              ].map((option) => (
                <button key={option.id} type="button" onClick={() => { setActiveFilter(option.id as FilterType); setIsFilterMenuOpen(false); }} className={`w-full rounded-md px-3 py-2 text-left text-xs transition-colors ${activeFilter === option.id ? 'bg-white/15 text-white' : 'text-white/65 hover:bg-white/10 hover:text-white'}`}>
                  {option.label}
                </button>
              ))}
              <button type="button" onClick={() => { setActiveFilter('all'); setIsFilterMenuOpen(false); }} className={`w-full rounded-md px-3 py-2 text-left text-xs transition-colors ${activeFilter === 'all' ? 'bg-white/15 text-white' : 'text-white/65 hover:bg-white/10 hover:text-white'}`}>
                All media
              </button>
            </div>
          )}
        </div>

      {/* Right: Select Mode Actions or Normal Actions */}
        <div className="flex items-center gap-2">
          {isSelectMode ? (
            /* Action bar when Selection mode is Active */
            <div className="flex items-center gap-2 bg-black/5 dark:bg-white/10 px-3 py-1 rounded-[6px] border border-black/10 dark:border-white/10">
              <span className="text-xs font-semibold text-[#111827] dark:text-white mr-1">
                {selectedIds.size} selected
              </span>

              {/* Select All */}
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-2.5 py-1 rounded-[4px] bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-xs text-[#111827] dark:text-white transition-colors cursor-pointer"
              >
                {selectedIds.size === filteredItems.length && filteredItems.length > 0 ? 'Deselect All' : 'Select All'}
              </button>

              {/* Duplicate Selected */}
              <button
                type="button"
                onClick={handleDuplicateSelected}
                disabled={selectedIds.size === 0}
                className="px-2.5 py-1 rounded-[4px] bg-[#005fb8] dark:bg-[#4cc2ff] hover:opacity-90 disabled:opacity-40 text-white dark:text-black text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                title="Duplicate selected items"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Duplicate</span>
              </button>

              {/* Move Selected */}
              <button
                type="button"
                onClick={() => setMoveTargetIds(Array.from(selectedIds))}
                disabled={selectedIds.size === 0}
                className="px-2.5 py-1 rounded-[4px] bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 disabled:opacity-40 text-xs font-semibold text-[#111827] dark:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                title="Move selected items into a folder"
              >
                <FolderInput className="w-3.5 h-3.5" />
                <span>Move</span>
              </button>

              {/* Delete Selected */}
              <button
                type="button"
                onClick={handleDeleteSelected}
                disabled={selectedIds.size === 0}
                className="px-2.5 py-1 rounded-[4px] bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                title="Delete selected items"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete{selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}</span>
              </button>

              {/* Cancel / Done */}
              <button
                type="button"
                onClick={() => {
                  setIsSelectMode(false);
                  setSelectedIds(new Set());
                }}
                className="px-2 py-1 rounded-[4px] text-xs text-[#6b7280] dark:text-neutral-400 hover:text-[#111827] dark:hover:text-white cursor-pointer ml-1"
              >
                Cancel
              </button>
            </div>
          ) : (
            /* Normal Mode: compact gallery actions */
            <>
              <button
                type="button"
                onClick={handleRestoreSamples}
                aria-label="Load samples"
                className="size-8 rounded-[6px] text-[#111827] dark:text-white hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsSelectMode(true)}
                aria-label="Select files"
                className="size-8 rounded-[6px] text-[#111827] dark:text-white hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center"
              >
                <CheckSquare className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsNewFolderOpen(true)}
                aria-label="New folder"
                title="Create a new folder"
                className="size-8 rounded-[6px] text-[#111827] dark:text-white hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* Hidden File Input supporting all requested Office formats */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
        {!isSelectMode && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Import files"
            title="Import"
            className="ml-auto size-8 rounded-[6px] bg-[#4cc2ff] text-black hover:bg-[#76d8ff] transition-all cursor-pointer flex items-center justify-center shadow-sm"
          >
            <UploadCloud className="w-3.5 h-3.5" />
          </button>
        )}
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative" ref={galleryContainerRef}>
        {/* Gallery Content View */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 no-scrollbar">
          {/* Folder breadcrumb */}
          {currentFolder && !isSearching && (
            <nav aria-label="Folder" className="flex items-center gap-1.5 mb-4 max-w-[1800px] mx-auto text-sm">
              <button
                type="button"
                onClick={() => setCurrentFolderId(null)}
                className="w-8 h-8 rounded-[6px] flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer transition-colors"
                aria-label="Back to Gallery"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentFolderId(null)}
                className="px-1.5 py-1 rounded-[4px] text-[#6b7280] dark:text-neutral-400 hover:text-[#111827] dark:hover:text-white cursor-pointer"
              >
                Gallery
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-[#9ca3af]" />
              <span className="font-semibold truncate" aria-current="page">{currentFolder.name}</span>
              <div className="ml-auto flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setRenameTarget({ kind: 'folder', id: currentFolder.id, name: currentFolder.name })}
                  className="h-8 px-2.5 rounded-[6px] text-xs font-medium flex items-center gap-1.5 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <PenLine className="w-3.5 h-3.5" />
                  Rename
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteFolder(currentFolder)}
                  className="h-8 px-2.5 rounded-[6px] text-xs font-medium flex items-center gap-1.5 text-[#c42b1c] dark:text-[#ff99a4] hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete folder
                </button>
              </div>
            </nav>
          )}

          {/* Folder tiles at Gallery root */}
          {!currentFolderId && !isSearching && folders.length > 0 && (
            <section aria-label="Folders" className="max-w-[1800px] mx-auto mb-6">
              <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-[#4b5563] dark:text-[#d1d5db] px-1 mb-2.5">
                <span>Folders</span>
                <span className="text-[11px] text-[#6b7280] dark:text-[#9ca3af]">{folders.length}</span>
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2 sm:gap-2.5">
                {folders.map((folder) => {
                  const count = folderItemCounts.get(folder.id) ?? 0;
                  return (
                    <button
                      key={folder.id}
                      type="button"
                      onClick={() => setCurrentFolderId(folder.id)}
                      className="group flex items-center gap-3 p-3 rounded-[8px] bg-black/[0.03] dark:bg-white/[0.05] hover:bg-black/[0.06] dark:hover:bg-white/[0.09] border border-black/10 dark:border-white/10 text-left cursor-pointer transition-colors"
                    >
                      <Folder className="w-8 h-8 shrink-0 text-[#e8a33d] fill-[#f4c15d]/70" strokeWidth={1.5} />
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold truncate text-[#111827] dark:text-white">{folder.name}</p>
                        <p className="text-[11px] text-[#6b7280] dark:text-[#9ca3af]">
                          {count} {count === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Empty State */}
          {items.length === 0 && folders.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 max-w-md mx-auto">
              <div className="w-20 h-20 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center text-[#005fb8] dark:text-[#4cc2ff] mb-5 shadow-lg">
                <FolderOpen className="w-10 h-10 stroke-[1.5]" />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-[#111827] dark:text-white mb-2">
                Your important stuff, all in one place
              </h2>

              <p className="text-sm text-[#4b5563] dark:text-[#9ca3af] mb-6 leading-relaxed">
                Upload files or media from your device to save in Gallery, or load demo files to explore.
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 rounded-[8px] bg-[#005fb8] dark:bg-[#4cc2ff] hover:bg-[#0067c0] dark:hover:bg-[#6bd0ff] active:scale-95 text-white dark:text-black text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-md transition-all"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload</span>
                </button>

                <button
                  type="button"
                  onClick={handleRestoreSamples}
                  className="px-4 py-2.5 rounded-[8px] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 text-[#111827] dark:text-[#e5e7eb] text-sm font-medium border border-black/10 dark:border-white/10 cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <RotateCw className="w-4 h-4 text-[#005fb8] dark:text-[#4cc2ff]" />
                  <span>Load Demo</span>
                </button>
              </div>
            </div>
          ) : filteredItems.length === 0 && activeFilter === 'all' && !isSearching ? (
            currentFolderId ? (
              <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4 max-w-md mx-auto">
                <Folder className="w-12 h-12 mb-3 text-[#e8a33d]" strokeWidth={1.5} />
                <h3 className="text-base font-semibold text-[#111827] dark:text-white mb-1">This folder is empty</h3>
                <p className="text-xs text-[#6b7280] dark:text-[#9ca3af]">
                  Right-click or long-press a file in Gallery and choose Move into a folder.
                </p>
              </div>
            ) : null
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center text-[#6b7280] dark:text-[#9ca3af] mb-4">
                <FolderOpen className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3 className="text-base font-semibold text-[#111827] dark:text-white mb-1">
                No items match this filter or search
              </h3>
              <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] mb-4">
                Try selecting a different filter category or clearing your search term.
              </p>
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className="px-4 py-2 rounded-[6px] bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-xs font-semibold text-[#111827] dark:text-white cursor-pointer transition-colors"
              >
                Show All Items
              </button>
            </div>
          ) : (
            /* Populated Gallery Grid */
            <div className="space-y-6 max-w-[1800px] mx-auto">
              {/* Header Info */}
              <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-[#4b5563] dark:text-[#d1d5db] px-1">
                <span>All Media & Documents</span>
                <span className="text-[11px] text-[#6b7280] dark:text-[#9ca3af]">{filteredItems.length} items</span>
              </div>

              {/* Justified fluid aspect-ratio grid */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 items-stretch">
                {filteredItems.map((item) => {
                  const ar = Math.max(0.4, Math.min(3.0, item.aspectRatio || 1.33));
                  const isSelected = selectedIds.has(item.id);
                  const docInfo = item.type === 'document' ? getDocumentDetails(item) : null;

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      onClick={(e) => {
                        if (longPressTriggered.current) {
                          longPressTriggered.current = false;
                          return;
                        }
                        if (isSelectMode) {
                          toggleSelect(item.id, e);
                        } else {
                          setSelectedItem(item);
                        }
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        clearLongPress();
                        openContextMenu(item, e.clientX, e.clientY);
                      }}
                      onTouchStart={(e) => handleTouchStart(item, e)}
                      onTouchMove={clearLongPress}
                      onTouchEnd={clearLongPress}
                      onTouchCancel={clearLongPress}
                      style={{
                        flexGrow: Math.round(ar * 100),
                        flexBasis: `calc(${ar} * 160px)`,
                        height: '200px',
                        WebkitTouchCallout: 'none',
                      }}
                      className={`group relative rounded-[8px] sm:rounded-[10px] overflow-hidden bg-black/5 dark:bg-[#2a2a2a] cursor-pointer shadow-sm hover:shadow-xl transition-all select-none border ${
                        isSelected
                          ? 'ring-3 ring-[#005fb8] dark:ring-[#4cc2ff] border-transparent'
                          : 'border-black/10 dark:border-white/10 hover:ring-2 hover:ring-[#005fb8]/70 dark:hover:ring-[#4cc2ff]/70'
                      }`}
                    >
                      {/* Checkbox indicator in Select Mode */}
                      {isSelectMode && (
                        <div 
                          className="absolute top-2 right-2 z-20"
                          onClick={(e) => toggleSelect(item.id, e)}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                            isSelected 
                              ? 'bg-[#005fb8] dark:bg-[#4cc2ff] text-white dark:text-black shadow-md ring-2 ring-white' 
                              : 'bg-black/50 text-white/70 hover:text-white border border-white/40'
                          }`}>
                            {isSelected ? <Check className="w-4 h-4 stroke-[2.5]" /> : <div className="w-2.5 h-2.5 rounded-full bg-white/40" />}
                          </div>
                        </div>
                      )}

                      {/* Media Thumbnail / Preview */}
                      {item.type === 'video' ? (
                        <div className="relative w-full h-full bg-black">
                          <img
                            src={item.thumbnailUrl || item.url}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-md">
                              <Play className="w-5 h-5 fill-current ml-0.5" />
                            </div>
                          </div>
                        </div>
                      ) : item.type === 'audio' ? (
                        <div className="w-full h-full bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-4 flex flex-col justify-between">
                          <div className="flex items-center justify-between">
                            <div className="w-8 h-8 rounded-full bg-[#005fb8]/20 dark:bg-[#4cc2ff]/20 text-[#005fb8] dark:text-[#4cc2ff] flex items-center justify-center">
                              <Music className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              {item.duration ? `${Math.floor(item.duration / 60)}:${String(item.duration % 60).padStart(2, '0')}` : 'AUDIO'}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                            <p className="text-[10px] text-neutral-400">Audio Track</p>
                          </div>
                        </div>
                      ) : item.type === 'document' ? (
                        /* Office document presentation (.docx, .doc, .pptx, .ppt, .xlsx, .xls, .pdf) or Sticky Note */
                        item.mimeType === 'application/x-sticky-note' && (item.thumbnailUrl || item.url) ? (
                          <div className="relative w-full h-full bg-amber-100 dark:bg-amber-950 overflow-hidden">
                            <img
                              src={item.thumbnailUrl || item.url}
                              alt={item.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <div 
                            className="w-full h-full p-4 flex flex-col justify-between"
                            style={{
                              background: `linear-gradient(135deg, ${docInfo?.color || '#2b579a'}20 0%, #1c1c24 100%)`,
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div 
                                className="w-9 h-9 rounded-lg flex items-center justify-center shadow-md text-white font-bold"
                                style={{ backgroundColor: docInfo?.color || '#2b579a' }}
                              >
                                {docInfo && <docInfo.icon className="w-5 h-5" />}
                              </div>
                              <span 
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white shadow-xs font-mono"
                                style={{ backgroundColor: docInfo?.color || '#2b579a' }}
                              >
                                {docInfo?.badge || 'DOC'}
                              </span>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white line-clamp-2 leading-snug">{item.title}</p>
                              <div className="flex items-center justify-between mt-1 text-[10px] text-neutral-400">
                                <span>{docInfo?.brand || 'Document'}</span>
                                <span>{(item.size ? (item.size / 1024).toFixed(0) : '150')} KB</span>
                              </div>
                            </div>
                          </div>
                        )
                      ) : (
                        <img
                          src={item.thumbnailUrl || item.url}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
                          loading="lazy"
                        />
                      )}

                      {/* Top-Left Acrylic Badge Icon */}
                      <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
                        <div className="px-1.5 py-1 rounded-[5px] bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1 shadow-sm">
                          {item.type === 'video' ? (
                            <>
                              <Film className="w-3 h-3 text-white" />
                              <div className="w-2.5 h-2.5 rounded-[2px] bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center" />
                            </>
                          ) : item.type === 'audio' ? (
                            <Music className="w-3 h-3 text-[#4cc2ff]" />
                          ) : item.type === 'document' ? (
                            <div className="flex items-center gap-1">
                              {docInfo && <docInfo.icon className="w-3 h-3" style={{ color: docInfo.color }} />}
                              <span className="text-[9px] font-bold text-white font-mono">{docInfo?.badge || 'DOC'}</span>
                            </div>
                          ) : (
                            <div className="w-3 h-3 rounded-[2px] bg-gradient-to-tr from-[#3b82f6] via-[#10b981] to-[#f59e0b] shadow-xs" />
                          )}
                        </div>
                      </div>

                      {/* Favorite indicator */}
                      {!isSelectMode && item.isFavorite && (
                        <div className="absolute top-2 right-2 z-10 p-1 rounded-full bg-black/60 backdrop-blur-md text-amber-400">
                          <Heart className="w-3 h-3 fill-current" />
                        </div>
                      )}

                      {/* Quick Hover Delete button */}
                      {!isSelectMode && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteItem(item);
                          }}
                          className={`absolute ${item.isFavorite ? 'top-2 right-9' : 'top-2 right-2'} z-20 p-1 rounded-full bg-black/60 hover:bg-rose-600 text-white/80 hover:text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-md`}
                          title="Delete item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Subtle hover info */}
                      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between text-white">
                        <span className="text-[11px] font-medium truncate max-w-[85%]">{item.title}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right-Hand Timeline Scrubber Track */}
        <div className="hidden lg:flex flex-col items-center justify-center w-14 shrink-0 border-l border-black/10 dark:border-white/10 bg-transparent select-none py-6 relative">
          <div className="flex flex-col items-center justify-between h-[80%] relative">
            <div className="absolute top-2 bottom-2 w-[1px] bg-black/15 dark:bg-white/20 -z-0" />

            {timelineYears.map((year) => {
              const isOct2022 = year === 2022;
              return (
                <div key={year} className="flex flex-col items-center gap-1.5 z-10 relative group">
                  {isOct2022 ? (
                    <div className="relative flex items-center">
                      <div className="px-2 py-0.5 rounded-full bg-[#005fb8] dark:bg-[#4cc2ff] text-white dark:text-black text-[10px] font-bold shadow-md cursor-pointer whitespace-nowrap -ml-16 mr-2">
                        Oct 2022
                      </div>
                      <div className="w-2.5 h-2.5 rounded-full bg-[#005fb8] dark:bg-[#4cc2ff] ring-2 ring-white dark:ring-black" />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveYear(year);
                        showToast(`Timeline scrolled to ${year}`);
                      }}
                      className="flex flex-col items-center gap-1 cursor-pointer py-1"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-black/30 dark:bg-white/40 hover:bg-[#005fb8] dark:hover:bg-white transition-colors" />
                      <span className="text-[10px] text-[#6b7280] dark:text-neutral-400 group-hover:text-[#111827] dark:group-hover:text-white font-mono">
                        {year}
                      </span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* File context menu */}
      <AnimatePresence>
        {contextMenu && (
          <GalleryContextMenu
            key={contextMenu.item.id + contextMenu.x + contextMenu.y}
            x={contextMenu.x}
            y={contextMenu.y}
            isFavorite={!!contextMenu.item.isFavorite}
            onAction={handleContextAction}
            onClose={closeContextMenu}
          />
        )}
      </AnimatePresence>

      <PromptDialog
        isOpen={!!renameTarget}
        title={renameTarget?.kind === 'folder' ? 'Rename folder' : 'Rename'}
        label="Name"
        initialValue={renameTarget?.name}
        confirmLabel="Rename"
        onConfirm={handleRenameConfirm}
        onClose={() => setRenameTarget(null)}
      />

      <PromptDialog
        isOpen={isNewFolderOpen}
        title="New folder"
        label="Folder name"
        initialValue="New folder"
        confirmLabel="Create"
        onConfirm={handleCreateFolder}
        onClose={() => setIsNewFolderOpen(false)}
      />

      <MoveToFolderDialog
        isOpen={!!moveTargetIds && !isNewFolderOpen}
        folders={folders}
        currentFolderId={
          moveTargetIds?.length === 1 ? items.find((it) => it.id === moveTargetIds[0])?.folderId ?? null : undefined
        }
        onMove={handleMove}
        onCreateFolder={() => setIsNewFolderOpen(true)}
        onClose={() => setMoveTargetIds(null)}
      />

      {/* Lightbox / Media Preview Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex flex-col justify-between p-3 sm:p-6"
            onClick={() => setSelectedItem(null)}
          >
            {/* Modal Header */}
            <div 
              className="flex items-center justify-between text-white pb-3 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-[6px] bg-white/10 flex items-center justify-center shrink-0">
                  {selectedItem.type === 'video' ? (
                    <Film className="w-4 h-4 text-[#4cc2ff]" />
                  ) : selectedItem.type === 'audio' ? (
                    <Music className="w-4 h-4 text-[#4cc2ff]" />
                  ) : (
                    <FileText className="w-4 h-4 text-[#4cc2ff]" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-white truncate">{selectedItem.title}</h3>
                  <p className="text-[11px] text-neutral-400">
                    {selectedItem.dateLabel} • {selectedItem.dimensions ? `${selectedItem.dimensions.width}×${selectedItem.dimensions.height}` : 'Media'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleFavorite(selectedItem)}
                  className={`p-2 rounded-full cursor-pointer transition-colors ${
                    selectedItem.isFavorite ? 'text-amber-400 bg-amber-400/20' : 'text-neutral-400 hover:text-white hover:bg-white/10'
                  }`}
                  title="Favorite"
                >
                  <Heart className={`w-4 h-4 ${selectedItem.isFavorite ? 'fill-current' : ''}`} />
                </button>

                <a
                  href={selectedItem.url}
                  download={selectedItem.title}
                  className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={() => handleDeleteItem(selectedItem)}
                  className="p-2 rounded-full text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 cursor-pointer transition-colors ml-2"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div 
              className="flex-1 flex items-center justify-center p-2 min-h-0 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedItem.type === 'video' ? (
                <video
                  src={selectedItem.url}
                  controls
                  autoPlay
                  className="max-h-[75vh] max-w-[90vw] rounded-lg shadow-2xl object-contain bg-black"
                />
              ) : selectedItem.type === 'audio' ? (
                <div className="w-full max-w-lg p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full bg-[#4cc2ff]/20 text-[#4cc2ff] flex items-center justify-center mb-4">
                    <Music className="w-12 h-12" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-1">{selectedItem.title}</h4>
                  <p className="text-xs text-neutral-400 mb-6">{selectedItem.description || 'Audio track'}</p>
                  <audio ref={audioRef} src={selectedItem.url} controls className="w-full" autoPlay />
                </div>
              ) : selectedItem.type === 'document' ? (
                selectedItem.mimeType === 'application/x-sticky-note' && (selectedItem.thumbnailUrl || selectedItem.url) ? (
                  <div className="max-w-md w-full p-2 flex flex-col items-center">
                    <img
                      src={selectedItem.thumbnailUrl || selectedItem.url}
                      alt={selectedItem.title}
                      className="max-h-[70vh] w-auto rounded-2xl shadow-2xl border border-white/20 object-contain"
                    />
                    <div className="mt-4 flex items-center gap-3">
                      <a
                        href={selectedItem.url}
                        download={`${selectedItem.title}.svg`}
                        className="px-4 py-2 rounded-lg bg-[#005fb8] dark:bg-[#4cc2ff] text-white dark:text-black font-semibold text-xs sm:text-sm flex items-center gap-2 hover:opacity-90 cursor-pointer shadow-md"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Sticky Note</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="w-full max-w-lg p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col items-center text-center">
                    <div 
                      className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 text-white shadow-xl"
                      style={{ backgroundColor: getDocumentDetails(selectedItem).color }}
                    >
                      {(() => {
                        const Details = getDocumentDetails(selectedItem);
                        return <Details.icon className="w-8 h-8" />;
                      })()}
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">{selectedItem.title}</h4>
                    <p className="text-xs text-neutral-400 mb-6">{selectedItem.description || 'Stored Office document'}</p>
                    <a
                      href={selectedItem.url}
                      download={selectedItem.title}
                      className="px-5 py-2.5 rounded-lg bg-[#005fb8] dark:bg-[#4cc2ff] text-white dark:text-black font-semibold text-sm flex items-center gap-2 hover:opacity-90 cursor-pointer shadow-md"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download {getDocumentDetails(selectedItem).badge} File</span>
                    </a>
                  </div>
                )
              ) : (
                <img
                  src={selectedItem.url}
                  alt={selectedItem.title}
                  className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
                />
              )}
            </div>

            {/* Modal Footer Description */}
            {selectedItem.description && (
              <div 
                className="text-center text-xs text-neutral-300 pt-3 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                {selectedItem.description}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
