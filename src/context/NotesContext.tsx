import React, { createContext, useContext, useState } from 'react';

export interface StickyColorOption {
  id: string;
  name: string;
  bg: string;
  headerBg: string;
  border: string;
  text: string;
  accent: string;
}

export const STICKY_COLORS: StickyColorOption[] = [
  {
    id: 'yellow',
    name: 'Vàng Cổ Điển',
    bg: '#fef9c3', // yellow-100
    headerBg: '#fef08a', // yellow-200
    border: '#fde047', // yellow-300
    text: '#1f2937',
    accent: '#ca8a04',
  },
  {
    id: 'orange',
    name: 'Cam Đào',
    bg: '#ffedd5', // orange-100
    headerBg: '#fed7aa', // orange-200
    border: '#fdba74', // orange-300
    text: '#1f2937',
    accent: '#ea580c',
  },
  {
    id: 'green',
    name: 'Xanh Lá Tươi',
    bg: '#dcfce7', // green-100
    headerBg: '#bbf7d0', // green-200
    border: '#86efac', // green-300
    text: '#1f2937',
    accent: '#16a34a',
  },
  {
    id: 'blue',
    name: 'Xanh Dương Nhạt',
    bg: '#e0f2fe', // sky-100
    headerBg: '#bae6fd', // sky-200
    border: '#7dd3fc', // sky-300
    text: '#1f2937',
    accent: '#0284c7',
  },
  {
    id: 'purple',
    name: 'Tím Lavender',
    bg: '#f3e8ff', // purple-100
    headerBg: '#e9d5ff', // purple-200
    border: '#d8b4fe', // purple-300
    text: '#1f2937',
    accent: '#9333ea',
  },
  {
    id: 'pink',
    name: 'Hồng Phấn',
    bg: '#fce7f3', // pink-100
    headerBg: '#fbcfe8', // pink-200
    border: '#f472b6', // pink-400
    text: '#1f2937',
    accent: '#db2777',
  },
  {
    id: 'dark',
    name: 'Fluent Tối',
    bg: '#25252b',
    headerBg: '#1f1f23',
    border: '#3f3f46',
    text: '#f3f4f6',
    accent: '#4cc2ff',
  },
];

const DEFAULT_CONTENT = `
  <h2 style="color: #4cc2ff; font-size: 22px; font-weight: bold; margin-bottom: 8px;">Ghi chú mới trong Sparkle Notes</h2>
  <p style="font-size: 15px; line-height: 1.6; margin-bottom: 12px;">Soạn thảo nhanh ý tưởng, kế hoạch hoặc việc cần làm ngay tại đây.</p>
  <ul style="margin-left: 20px; margin-bottom: 12px;">
    <li>Định dạng văn bản: <strong>In đậm</strong>, <em>In nghiêng</em>, <u>Gạch chân</u>, màu sắc và cỡ chữ linh hoạt từ 1 đến 200px.</li>
    <li>Bấm nút <strong>Show as stickies</strong> ở thanh công cụ để mở ghi chú dán nổi trên màn hình.</li>
    <li>Có thể di chuyển, kéo co giãn kích thước (resize) quanh ứng dụng và đổi màu sắc tùy thích!</li>
  </ul>
  <p style="font-size: 14px; color: #9ca3af; font-style: italic;">Chúc bạn một ngày làm việc và giải trí hiệu quả!</p>
`;

interface NotesContextType {
  noteTitle: string;
  setNoteTitle: (title: string) => void;
  noteContent: string;
  setNoteContent: (content: string) => void;
  stickyColorId: string;
  setStickyColorId: (colorId: string) => void;
  currentStickyColor: StickyColorOption;
  isStickyVisible: boolean;
  setIsStickyVisible: (visible: boolean) => void;
  toggleSticky: () => void;
  isStickyMinimized: boolean;
  setIsStickyMinimized: (minimized: boolean) => void;
  stickyPosition: { x: number; y: number };
  setStickyPosition: (pos: { x: number; y: number }) => void;
  stickySize: { width: number; height: number };
  setStickySize: (size: { width: number; height: number }) => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

const STORAGE_KEY = 'vone_notes_state_v2';

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [noteTitle, setNoteTitleState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('vone_notes_state_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.noteTitle) return parsed.noteTitle;
      }
    } catch {}
    return 'Ghi chú Sparkle';
  });

  const [noteContent, setNoteContentState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('vone_notes_state_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.noteContent) return parsed.noteContent;
      }
    } catch {}
    return DEFAULT_CONTENT;
  });

  const [stickyColorId, setStickyColorIdState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('vone_notes_state_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.stickyColorId) return parsed.stickyColorId;
      }
    } catch {}
    return 'yellow';
  });

  const [isStickyVisible, setIsStickyVisibleState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('vone_notes_state_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.isStickyVisible === 'boolean') return parsed.isStickyVisible;
      }
    } catch {}
    return false;
  });

  const [isStickyMinimized, setIsStickyMinimizedState] = useState<boolean>(false);

  const [stickyPosition, setStickyPositionState] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('vone_notes_state_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.stickyPosition && typeof parsed.stickyPosition.x === 'number') {
          return parsed.stickyPosition;
        }
      }
    } catch {}
    if (typeof window !== 'undefined') {
      return { x: Math.max(20, window.innerWidth - 350), y: Math.max(70, window.innerHeight - 380) };
    }
    return { x: 100, y: 100 };
  });

  const [stickySize, setStickySizeState] = useState<{ width: number; height: number }>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.stickySize && typeof parsed.stickySize.width === 'number') {
          return parsed.stickySize;
        }
      }
    } catch {}
    return { width: 320, height: 280 };
  });

  // Save changes to localStorage
  const saveState = (override: Partial<{
    noteTitle: string;
    noteContent: string;
    stickyColorId: string;
    isStickyVisible: boolean;
    stickyPosition: { x: number; y: number };
    stickySize: { width: number; height: number };
  }>) => {
    try {
      const cur = {
        noteTitle,
        noteContent,
        stickyColorId,
        isStickyVisible,
        stickyPosition,
        stickySize,
        ...override,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cur));
    } catch {}
  };

  const setNoteTitle = (title: string) => {
    setNoteTitleState(title);
    saveState({ noteTitle: title });
  };

  const setNoteContent = (content: string) => {
    setNoteContentState(content);
    saveState({ noteContent: content });
  };

  const setStickyColorId = (colorId: string) => {
    setStickyColorIdState(colorId);
    saveState({ stickyColorId: colorId });
  };

  const setIsStickyVisible = (visible: boolean) => {
    setIsStickyVisibleState(visible);
    saveState({ isStickyVisible: visible });
  };

  const toggleSticky = () => {
    const next = !isStickyVisible;
    setIsStickyVisibleState(next);
    saveState({ isStickyVisible: next });
  };

  const setStickyPosition = (pos: { x: number; y: number }) => {
    setStickyPositionState(pos);
    saveState({ stickyPosition: pos });
  };

  const setStickySize = (size: { width: number; height: number }) => {
    setStickySizeState(size);
    saveState({ stickySize: size });
  };

  const currentStickyColor =
    STICKY_COLORS.find((c) => c.id === stickyColorId) || STICKY_COLORS[0];

  return (
    <NotesContext.Provider
      value={{
        noteTitle,
        setNoteTitle,
        noteContent,
        setNoteContent,
        stickyColorId,
        setStickyColorId,
        currentStickyColor,
        isStickyVisible,
        setIsStickyVisible,
        toggleSticky,
        isStickyMinimized,
        setIsStickyMinimized: setIsStickyMinimizedState,
        stickyPosition,
        setStickyPosition,
        stickySize,
        setStickySize,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};
