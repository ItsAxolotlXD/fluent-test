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
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6 select-none"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs"
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title}
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
        <div className="p-6 pb-4">
          <h2 className="text-[19px] sm:text-[20px] font-semibold text-[#111827] dark:text-[#FFFFFF] tracking-tight leading-snug font-sans">{title}</h2>
        </div>
        {children}
      </motion.div>
    </div>
  );
};

const footerClass = 'fluent-modal-footer bg-[#F3F3F3] dark:bg-[#1C1C1C] px-6 py-3 flex items-center justify-end gap-2.5 border-t border-[#E5E5E5] dark:border-[#2F2F2F]';
const primaryBtn = 'fluent-btn-primary px-4 h-8 rounded-[5px] bg-[#0078d4] dark:bg-[#4cc2ff] hover:bg-[#106ebe] dark:hover:bg-[#6bd0ff] active:bg-[#005a9e] dark:active:bg-[#3bb2ef] text-white dark:text-black font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.1)] transition-colors border border-black/20 flex items-center justify-center cursor-pointer text-[12.5px] disabled:opacity-40 disabled:cursor-not-allowed';
const secondaryBtn = 'fluent-btn-secondary px-4 h-8 rounded-[5px] bg-white dark:bg-[#2C2C2C] hover:bg-[#F9F9F9] dark:hover:bg-[#343434] active:bg-[#EEEEEE] dark:active:bg-[#222222] text-[#111827] dark:text-[#FFFFFF] border border-[#d1d1d1] dark:border-[#3E3E3E] text-[12.5px] font-normal shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors flex items-center justify-center cursor-pointer';

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
