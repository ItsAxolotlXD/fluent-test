import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Folder, FolderPlus, Home, Check } from 'lucide-react';
import type { GalleryFolder } from '../../services/galleryStorage';

const DialogShell: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm rounded-[10px] bg-white dark:bg-[#2b2b2b] border border-black/10 dark:border-white/10 shadow-2xl text-[#111827] dark:text-white"
      >
        <h2 className="px-5 pt-5 pb-3 text-base font-semibold">{title}</h2>
        {children}
      </motion.div>
    </motion.div>
  );
};

const footerClass = 'px-5 py-4 mt-2 bg-black/[0.03] dark:bg-white/[0.03] border-t border-black/10 dark:border-white/10 rounded-b-[10px] flex justify-end gap-2';
const primaryBtn = 'h-8 px-4 rounded-[6px] text-[13px] font-semibold bg-[#005fb8] dark:bg-[#4cc2ff] text-white dark:text-black hover:opacity-90 disabled:opacity-40 cursor-pointer transition-opacity';
const secondaryBtn = 'h-8 px-4 rounded-[6px] text-[13px] font-medium bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 border border-black/10 dark:border-white/10 cursor-pointer transition-colors';

interface PromptDialogProps {
  isOpen: boolean;
  title: string;
  label: string;
  initialValue?: string;
  confirmLabel: string;
  onConfirm: (value: string) => void;
  onClose: () => void;
}

export const PromptDialog: React.FC<PromptDialogProps> = ({ isOpen, title, label, initialValue = '', confirmLabel, onConfirm, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <PromptDialogBody
        title={title}
        label={label}
        initialValue={initialValue}
        confirmLabel={confirmLabel}
        onConfirm={onConfirm}
        onClose={onClose}
      />
    )}
  </AnimatePresence>
);

const PromptDialogBody: React.FC<Omit<PromptDialogProps, 'isOpen'>> = ({ title, label, initialValue = '', confirmLabel, onConfirm, onClose }) => {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    const dot = initialValue.lastIndexOf('.');
    input.setSelectionRange(0, dot > 0 ? dot : initialValue.length);
  }, [initialValue]);

  const trimmed = value.trim();

  return (
    <DialogShell title={title} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (trimmed) onConfirm(trimmed);
        }}
      >
        <label className="block px-5">
          <span className="sr-only">{label}</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={120}
            placeholder={label}
            className="w-full h-9 px-3 rounded-[6px] bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 border-b-2 border-b-[#005fb8] dark:border-b-[#4cc2ff] text-sm outline-none"
          />
        </label>
        <div className={footerClass}>
          <button type="button" onClick={onClose} className={secondaryBtn}>
            Cancel
          </button>
          <button type="submit" disabled={!trimmed} className={primaryBtn}>
            {confirmLabel}
          </button>
        </div>
      </form>
    </DialogShell>
  );
};

interface MoveDialogProps {
  isOpen: boolean;
  folders: GalleryFolder[];
  currentFolderId?: string | null;
  onMove: (folderId: string | null) => void;
  onCreateFolder: () => void;
  onClose: () => void;
}

export const MoveToFolderDialog: React.FC<MoveDialogProps> = ({ isOpen, folders, currentFolderId, onMove, onCreateFolder, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <DialogShell title="Move into a folder" onClose={onClose}>
        <ul className="px-3 max-h-[50vh] overflow-y-auto space-y-0.5" role="listbox" aria-label="Destination folder">
          {[{ id: null as string | null, name: 'Gallery (no folder)' }, ...folders].map((folder) => {
            const isCurrent = folder.id === currentFolderId;
            const Icon = folder.id === null ? Home : Folder;
            return (
              <li key={folder.id ?? 'root'}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isCurrent}
                  disabled={isCurrent}
                  onClick={() => onMove(folder.id)}
                  className="w-full h-10 px-3 rounded-[6px] flex items-center gap-3 text-[13px] font-medium text-left hover:bg-black/[0.05] dark:hover:bg-white/[0.08] disabled:opacity-50 disabled:cursor-default cursor-pointer transition-colors"
                >
                  <Icon className={`w-4 h-4 shrink-0 ${folder.id === null ? 'text-neutral-500' : 'text-[#e8a33d]'}`} />
                  <span className="truncate flex-1">{folder.name}</span>
                  {isCurrent && <Check className="w-4 h-4 text-[#005fb8] dark:text-[#4cc2ff]" />}
                </button>
              </li>
            );
          })}
        </ul>
        <div className={`${footerClass} justify-between`}>
          <button type="button" onClick={onCreateFolder} className={`${secondaryBtn} flex items-center gap-1.5`}>
            <FolderPlus className="w-4 h-4" />
            New folder
          </button>
          <button type="button" onClick={onClose} className={secondaryBtn}>
            Cancel
          </button>
        </div>
      </DialogShell>
    )}
  </AnimatePresence>
);
