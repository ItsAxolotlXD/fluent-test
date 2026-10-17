import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Download, Image as GalleryIcon, PenLine, Trash2, type LucideIcon } from 'lucide-react';
import { flyoutPanelClassName, flyoutPanelStyle } from './FlyoutDropdown';

export type CanvasContextAction = 'export' | 'gallery' | 'rename' | 'delete';

interface CanvasContextMenuProps {
  x: number;
  y: number;
  onAction: (action: CanvasContextAction) => void;
  onClose: () => void;
}

const entries: Array<{ action: CanvasContextAction; label: string; icon: LucideIcon; danger?: boolean }> = [
  { action: 'export', label: 'Export canvas', icon: Download },
  { action: 'gallery', label: 'Save to Gallery', icon: GalleryIcon },
  { action: 'rename', label: 'Rename', icon: PenLine },
  { action: 'delete', label: 'Delete', icon: Trash2, danger: true },
];

export const CanvasContextMenu: React.FC<CanvasContextMenuProps> = ({ x, y, onAction, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: x, top: y });

  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    const { width, height } = menu.getBoundingClientRect();
    setPosition({
      left: Math.max(8, Math.min(x, window.innerWidth - width - 8)),
      top: Math.max(8, y > window.innerHeight - height - 8 ? y - height : y),
    });
    menu.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus({ preventScroll: true });
  }, [x, y]);

  useEffect(() => {
    const handlePointer = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) onClose();
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('pointerdown', handlePointer, true);
    document.addEventListener('keydown', handleKey);
    window.addEventListener('resize', onClose);
    return () => {
      document.removeEventListener('pointerdown', handlePointer, true);
      document.removeEventListener('keydown', handleKey);
      window.removeEventListener('resize', onClose);
    };
  }, [onClose]);

  return (
    <motion.div
      ref={menuRef}
      role="menu"
      aria-label="Canvas actions"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      onContextMenu={(event) => event.preventDefault()}
      className={`fixed z-[60] w-[232px] ${flyoutPanelClassName}`}
      style={{ ...flyoutPanelStyle, left: position.left, top: position.top }}
    >
      {entries.map((entry, index) => {
        const Icon = entry.icon;
        return (
          <motion.button
            key={entry.action}
            type="button"
            role="menuitem"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: index * 0.035 }}
            onClick={() => onAction(entry.action)}
            className={`w-full h-[36px] px-3 rounded-[6px] flex items-center gap-3 text-[13px] font-medium text-left outline-none transition-colors cursor-pointer hover:bg-black/[0.05] dark:hover:bg-white/[0.08] focus-visible:bg-black/[0.05] dark:focus-visible:bg-white/[0.08] ${entry.danger ? 'text-[#c42b1c] dark:text-[#ff99a4]' : ''}`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${entry.danger ? 'text-[#c42b1c] dark:text-[#ff99a4]' : 'text-neutral-600 dark:text-neutral-300'}`} />
            <span className="truncate">{entry.label}</span>
          </motion.button>
        );
      })}
    </motion.div>
  );
};
