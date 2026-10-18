import React from 'react';
import { motion } from 'motion/react';
import { SpinningRing } from './SpinningRing';
import {
  Tv,
  Heart,
  FlaskConical,
  PanelsTopLeft
} from 'lucide-react';
import {
  FluentHomeIcon,
  FluentGalleryIcon,
  FluentScreenbugIcon
} from './FluentIcons';

interface TabLoadingScreenProps {
  route?: string;
  className?: string;
}

export const TabLoadingScreen: React.FC<TabLoadingScreenProps> = ({
  route = '/',
  className = '',
}) => {
  // Determine tab icon based on the current route (pure icon, strictly NO background container)
  const getTabIcon = () => {
    const cleanRoute = (route || '/').toLowerCase();

    if (cleanRoute === '/' || cleanRoute === '/home') {
      return (
        <FluentHomeIcon className="w-16 h-16 sm:w-20 sm:h-20 text-[#0078d4] dark:text-[#4cc2ff] drop-shadow-md" />
      );
    }

    if (cleanRoute.startsWith('/live-tv') || cleanRoute.startsWith('/watch-preview')) {
      return (
        <img
          src="/icons/sidebar/watch-preview.png"
          alt=""
          className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md bg-transparent"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/icons/sidebar/watch.png';
          }}
        />
      );
    }

    if (cleanRoute.startsWith('/news') || cleanRoute.startsWith('/updates') || cleanRoute.startsWith('/article')) {
      return (
        <img
          src="/icons/sidebar/update-blogs.png"
          alt=""
          className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md bg-transparent"
        />
      );
    }

    if (cleanRoute.startsWith('/gallery')) {
      return (
        <FluentGalleryIcon className="w-16 h-16 sm:w-20 sm:h-20 text-[#0078d4] dark:text-[#4cc2ff] drop-shadow-md" />
      );
    }

    if (cleanRoute.startsWith('/vlc') || cleanRoute.startsWith('/screenbox') || cleanRoute.startsWith('/screenbug')) {
      return (
        <FluentScreenbugIcon className="w-16 h-16 sm:w-20 sm:h-20 text-[#0078d4] dark:text-[#4cc2ff] drop-shadow-md" />
      );
    }

    if (cleanRoute.startsWith('/notes') || cleanRoute === '/write' || cleanRoute === '/present' || cleanRoute === '/table') {
      return (
        <img
          src="/icons/sidebar/notes.png"
          alt=""
          className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md bg-transparent"
        />
      );
    }

    if (cleanRoute.startsWith('/draws')) {
      return (
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md">
          <path d="M15 4C8.5 4 4 8.8 4 15C4 18.5 5.5 21.5 8 23.5C9.5 25 11 26.5 11 27C11 27.5 11.5 27.8 12 27.8H13.5C14.2 27.8 14.8 27.2 14.8 26.5C14.8 25 16 23.5 18 23.5C23.2 23.5 26.5 20 26.5 15C26.5 8.8 21.5 4 15 4Z" fill="#F59E0B" />
          <circle cx="9" cy="10" r="2.2" fill="#EF4444" />
          <circle cx="15" cy="7.5" r="2.2" fill="#3B82F6" />
          <circle cx="21" cy="10.5" r="2.2" fill="#10B981" />
          <circle cx="8" cy="16.5" r="2" fill="#A855F7" />
          <path d="M29 5L20 14L22 16L31 7C31.5 6.5 31.5 5.5 31 5C30.5 4.5 29.5 4.5 29 5Z" fill="#78350F" />
          <path d="M17.5 16.5L14 20C13.5 20.5 13.5 21.5 14 22L14.5 22.5L16.5 20.5L17.5 16.5Z" fill="#38BDF8" />
        </svg>
      );
    }

    if (cleanRoute.startsWith('/craftmine')) {
      return (
        <img
          src="/icons/sidebar/craftmine.png"
          alt=""
          className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md pixelated bg-transparent"
          style={{ imageRendering: 'pixelated' }}
        />
      );
    }

    if (cleanRoute.startsWith('/photopea')) {
      return (
        <img
          src="/icons/sidebar/photopea.png"
          alt=""
          className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md bg-transparent"
        />
      );
    }

    if (cleanRoute.startsWith('/settings')) {
      return (
        <img
          src="/settings-windows-2020.svg"
          alt=""
          className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md bg-transparent"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/icons/settings/appearance.png';
          }}
        />
      );
    }

    if (cleanRoute.startsWith('/channels')) {
      return (
        <Tv className="w-16 h-16 sm:w-20 sm:h-20 text-[#0078d4] dark:text-[#4cc2ff] drop-shadow-md" />
      );
    }

    if (cleanRoute.startsWith('/favorites')) {
      return (
        <Heart className="w-16 h-16 sm:w-20 sm:h-20 text-rose-500 fill-rose-500 drop-shadow-md" />
      );
    }

    if (cleanRoute.startsWith('/search')) {
      return (
        <img
          src="/icons/search_sparkle.png"
          alt=""
          className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md bg-transparent"
        />
      );
    }

    if (cleanRoute.startsWith('/auth')) {
      return (
        <svg viewBox="0 0 32 32" fill="none" className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md">
          <circle cx="16" cy="12" r="5" fill="#4cc2ff" />
          <path d="M8 26C8 21.5 11.5 19 16 19C20.5 19 24 21.5 24 26H8Z" fill="#0078d4" />
        </svg>
      );
    }

    if (cleanRoute.startsWith('/test')) {
      return (
        <FlaskConical className="w-16 h-16 sm:w-20 sm:h-20 text-[#0078d4] dark:text-[#4cc2ff] drop-shadow-md" />
      );
    }

    if (cleanRoute.startsWith('/winui-3')) {
      return (
        <PanelsTopLeft className="w-16 h-16 sm:w-20 sm:h-20 text-[#0078d4] dark:text-[#4cc2ff] drop-shadow-md" />
      );
    }

    // Default Fallback
    return (
      <FluentHomeIcon className="w-16 h-16 sm:w-20 sm:h-20 text-[#0078d4] dark:text-[#4cc2ff] drop-shadow-md" />
    );
  };

  const icon = getTabIcon();

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading..."
      className={`w-full flex-1 flex flex-col items-center justify-center min-h-[55vh] sm:min-h-[65vh] py-16 select-none my-auto ${className}`}
    >
      <div className="flex flex-col items-center justify-center gap-6">
        {/* Tab Icon in dead center: NO background shape, gentle bounce transition */}
        <motion.div
          key={`tab-icon-${route}`}
          initial={{ opacity: 0, y: 16, scale: 0.88 }}
          animate={{
            opacity: 1,
            y: [16, -10, 3, -1, 0],
            scale: [0.88, 1.08, 0.98, 1.02, 1],
          }}
          transition={{
            duration: 0.62,
            times: [0, 0.35, 0.65, 0.85, 1],
            ease: [0.16, 1, 0.3, 1],
          }}
          className="relative flex items-center justify-center pointer-events-none select-none bg-transparent"
        >
          {icon}
        </motion.div>

        {/* Spinning ring only - absolutely NO tab name text rendered */}
        <div className="flex flex-col items-center justify-center">
          <SpinningRing size={28} strokeWidth={3.5} color="#4cc2ff" />
        </div>
      </div>
    </div>
  );
};
