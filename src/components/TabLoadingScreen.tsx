import React from 'react';
import { motion } from 'framer-motion';
import { SpinningRing } from './SpinningRing';
import {
  Tv,
  Heart,
  FlaskConical,
} from 'lucide-react';

interface TabLoadingScreenProps {
  route?: string;
  className?: string;
}

export const TabLoadingScreen: React.FC<TabLoadingScreenProps> = ({
  route = '/',
  className = '',
}) => {
  // Determine tab information (title & icon) based on the current route
  const getTabInfo = () => {
    const cleanRoute = (route || '/').toLowerCase();

    if (cleanRoute === '/' || cleanRoute === '/home') {
      return {
        title: 'Home',
        icon: (
          <img
            src="https://www.elevenforum.com/data/attachments/30/30188-c9f25938bd40f9c2e3af267cc96b3e28.jpg?hash=yfJZOL1A-c"
            alt="Home"
            referrerPolicy="no-referrer"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md rounded-lg"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
        ),
      };
    }

    if (cleanRoute.startsWith('/live-tv') || cleanRoute.startsWith('/watch-preview')) {
      return {
        title: 'Watch (preview)',
        icon: (
          <img
            src="/icons/sidebar/watch-preview.png"
            alt="Watch"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/icons/sidebar/watch.png';
            }}
          />
        ),
      };
    }

    if (cleanRoute.startsWith('/news') || cleanRoute.startsWith('/updates') || cleanRoute.startsWith('/article')) {
      return {
        title: 'Articles',
        icon: (
          <img
            src="/icons/sidebar/update-blogs.png"
            alt="Articles"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md"
          />
        ),
      };
    }

    if (cleanRoute.startsWith('/gallery')) {
      return {
        title: 'Gallery',
        icon: (
          <img
            src="https://www.elevenforum.com/data/attachments/73/73114-b7601bc81d404bb12cc522e1acb2fea8.jpg?hash=t2AbyB1AS7"
            alt="Gallery"
            referrerPolicy="no-referrer"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md rounded-lg"
          />
        ),
      };
    }

    if (cleanRoute.startsWith('/vlc') || cleanRoute.startsWith('/screenbox') || cleanRoute.startsWith('/screenbug')) {
      return {
        title: 'Screenbug',
        icon: (
          <img
            src="https://cdn3d.iconscout.com/3d/premium/thumb/play-button-3d-icon-png-download-13354190.png"
            alt="Screenbug"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/icons/sidebar/vlc.png';
            }}
          />
        ),
      };
    }

    if (cleanRoute.startsWith('/notes') || cleanRoute === '/write' || cleanRoute === '/present' || cleanRoute === '/table') {
      return {
        title: 'Notes',
        icon: (
          <img
            src="/icons/sidebar/notes.png"
            alt="Notes"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md"
          />
        ),
      };
    }

    if (cleanRoute.startsWith('/draws')) {
      return {
        title: 'Draws',
        icon: (
          <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg p-3">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow">
              <path d="M15 4C8.5 4 4 8.8 4 15C4 18.5 5.5 21.5 8 23.5C9.5 25 11 26.5 11 27C11 27.5 11.5 27.8 12 27.8H13.5C14.2 27.8 14.8 27.2 14.8 26.5C14.8 25 16 23.5 18 23.5C23.2 23.5 26.5 20 26.5 15C26.5 8.8 21.5 4 15 4Z" fill="#FFF7ED" />
              <circle cx="9" cy="10" r="2.2" fill="#EF4444" />
              <circle cx="15" cy="7.5" r="2.2" fill="#3B82F6" />
              <circle cx="21" cy="10.5" r="2.2" fill="#10B981" />
              <circle cx="8" cy="16.5" r="2" fill="#A855F7" />
              <path d="M29 5L20 14L22 16L31 7C31.5 6.5 31.5 5.5 31 5C30.5 4.5 29.5 4.5 29 5Z" fill="#78350F" />
              <path d="M17.5 16.5L14 20C13.5 20.5 13.5 21.5 14 22L14.5 22.5L16.5 20.5L17.5 16.5Z" fill="#38BDF8" />
            </svg>
          </div>
        ),
      };
    }

    if (cleanRoute.startsWith('/craftmine')) {
      return {
        title: 'Craftmine',
        icon: (
          <img
            src="/icons/sidebar/craftmine.png"
            alt="Craftmine"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md pixelated"
            style={{ imageRendering: 'pixelated' }}
          />
        ),
      };
    }

    if (cleanRoute.startsWith('/photopea')) {
      return {
        title: 'Photopea',
        icon: (
          <img
            src="/icons/sidebar/photopea.png"
            alt="Photopea"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md"
          />
        ),
      };
    }

    if (cleanRoute.startsWith('/settings')) {
      return {
        title: 'Settings',
        icon: (
          <img
            src="/settings-windows-2020.svg"
            alt="Settings"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/icons/settings/appearance.png';
            }}
          />
        ),
      };
    }

    if (cleanRoute.startsWith('/channels')) {
      return {
        title: 'Channels',
        icon: (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#005fb8] to-[#003d75] dark:from-[#0078d4] dark:to-[#004e8c] flex items-center justify-center shadow-lg">
            <Tv className="w-9 h-9 sm:w-11 sm:h-11 text-white" />
          </div>
        ),
      };
    }

    if (cleanRoute.startsWith('/favorites')) {
      return {
        title: 'Favorites',
        icon: (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
            <Heart className="w-9 h-9 sm:w-11 sm:h-11 text-white fill-white" />
          </div>
        ),
      };
    }

    if (cleanRoute.startsWith('/search')) {
      return {
        title: 'Search',
        icon: (
          <img
            src="/icons/search_sparkle.png"
            alt="Search"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md"
          />
        ),
      };
    }

    if (cleanRoute.startsWith('/auth')) {
      return {
        title: 'Account',
        icon: (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-neutral-500 flex items-center justify-center shadow-lg">
            <svg viewBox="0 0 32 32" fill="none" className="w-10 h-10">
              <circle cx="16" cy="12" r="5" fill="#FFFFFF" />
              <path d="M8 26C8 21.5 11.5 19 16 19C20.5 19 24 21.5 24 26H8Z" fill="#FFFFFF" />
            </svg>
          </div>
        ),
      };
    }

    if (cleanRoute.startsWith('/test')) {
      return {
        title: 'Insider Lab',
        icon: (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-purple-600 flex items-center justify-center shadow-lg">
            <FlaskConical className="w-9 h-9 sm:w-11 sm:h-11 text-white" />
          </div>
        ),
      };
    }

    // Default Fallback
    return {
      title: 'Sparkle',
      icon: (
        <img
          src="/icons/monochrom.png"
          alt="Sparkle"
          className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/icons/monochrome-loader-256.png';
          }}
        />
      ),
    };
  };

  const { title, icon } = getTabInfo();

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Đang tải ${title}...`}
      className={`w-full flex-1 flex flex-col items-center justify-center min-h-[55vh] sm:min-h-[65vh] py-16 select-none my-auto ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -8 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center justify-center gap-6"
      >
        {/* Tab Icon in the dead center */}
        <div className="relative flex items-center justify-center">
          {icon}
        </div>

        {/* Spinning ring only (no tab name as requested) */}
        <div className="flex flex-col items-center justify-center">
          <SpinningRing size={28} strokeWidth={3.5} color="#4cc2ff" />
        </div>
      </motion.div>
    </div>
  );
};
