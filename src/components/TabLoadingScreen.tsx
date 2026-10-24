import React from 'react';
import { motion } from 'motion/react';
import { Tv, Heart, FlaskConical, PanelsTopLeft } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import {
  FluentHomeIcon,
  FluentWatchIcon,
  FluentArticlesIcon,
  FluentNotesIcon,
  FluentGalleryIcon,
  FluentInkCanvasIcon,
  FluentScreenbugIcon,
  FluentCraftmineIcon,
  FluentPhotopeaIcon,
  FluentSettingsIcon,
  FluentPersonFeedbackIcon,
} from './FluentIcons';
import {
  Fluent3DHomeIcon,
  Fluent3DArticlesIcon,
  Fluent3DWatchPreviewIcon,
  Fluent3DGalleryIcon,
  Fluent3DNotesIcon,
  Fluent3DScreenbugIcon,
  Fluent3DSettingsIcon,
  Fluent3DCraftmineIcon,
  Fluent3DPhotopeaIcon,
} from './Fluent3DIcons';

interface TabLoadingScreenProps {
  route?: string;
  className?: string;
}

const largeIconClass =
  'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 drop-shadow-xl flex items-center justify-center [&_img]:!w-16 [&_img]:!h-16 sm:[&_img]:!w-20 sm:[&_img]:!h-20 md:[&_img]:!w-24 md:[&_img]:!h-24 [&_img]:!object-contain [&_svg]:!w-16 [&_svg]:!h-16 sm:[&_svg]:!w-20 sm:[&_svg]:!h-20 md:[&_svg]:!w-24 md:[&_svg]:!h-24';
const standardIconClass = `${largeIconClass} text-[#0078d4] dark:text-[#4cc2ff]`;

export const TabLoadingScreen: React.FC<TabLoadingScreenProps> = ({
  route = '/',
  className = '',
}) => {
  const { settings } = useSettings();
  const cleanRoute = (route || '/').toLowerCase();
  const useFluent3DForContent = Boolean(settings.dynamicSidebarIcons || settings.fluentIcons);
  const useFluent3DForSystem = Boolean(!settings.dynamicSidebarIcons && settings.fluentIcons);

  const getTabIcon = () => {
    if (cleanRoute === '/' || cleanRoute === '/home' || cleanRoute === '/home-preview') {
      return useFluent3DForContent ? (
        <Fluent3DHomeIcon className={largeIconClass} />
      ) : (
        <FluentHomeIcon className={standardIconClass} />
      );
    }

    if (cleanRoute.startsWith('/live-tv') || cleanRoute.startsWith('/watch-preview')) {
      return useFluent3DForContent ? (
        <Fluent3DWatchPreviewIcon className={largeIconClass} />
      ) : (
        <FluentWatchIcon className={standardIconClass} />
      );
    }

    if (cleanRoute.startsWith('/news') || cleanRoute.startsWith('/updates') || cleanRoute.startsWith('/article')) {
      return useFluent3DForContent ? (
        <Fluent3DArticlesIcon className={largeIconClass} />
      ) : (
        <FluentArticlesIcon className={standardIconClass} />
      );
    }

    if (cleanRoute.startsWith('/gallery')) {
      return useFluent3DForContent ? (
        <Fluent3DGalleryIcon className={largeIconClass} />
      ) : (
        <FluentGalleryIcon className={standardIconClass} />
      );
    }

    if (cleanRoute.startsWith('/draws')) {
      return <FluentInkCanvasIcon className={`${largeIconClass} ${useFluent3DForContent ? 'fluent-3d-icon' : 'text-black dark:text-white'}`} />;
    }

    if (cleanRoute.startsWith('/notes') || cleanRoute === '/write' || cleanRoute === '/present' || cleanRoute === '/table') {
      return useFluent3DForContent ? (
        <Fluent3DNotesIcon className={largeIconClass} />
      ) : (
        <FluentNotesIcon className={standardIconClass} />
      );
    }

    if (cleanRoute.startsWith('/vlc') || cleanRoute.startsWith('/screenbox') || cleanRoute.startsWith('/screenbug')) {
      return useFluent3DForContent ? (
        <Fluent3DScreenbugIcon className={largeIconClass} />
      ) : (
        <FluentScreenbugIcon white className={largeIconClass} />
      );
    }

    if (cleanRoute.startsWith('/craftmine')) {
      return useFluent3DForContent ? (
        <Fluent3DCraftmineIcon className={largeIconClass} />
      ) : (
        <FluentCraftmineIcon className={`${standardIconClass} pixelated`} style={{ imageRendering: 'pixelated' }} />
      );
    }

    if (cleanRoute.startsWith('/photopea')) {
      return useFluent3DForContent ? (
        <Fluent3DPhotopeaIcon className={largeIconClass} />
      ) : (
        <FluentPhotopeaIcon className={standardIconClass} />
      );
    }

    if (cleanRoute.startsWith('/settings')) {
      return useFluent3DForSystem ? (
        <Fluent3DSettingsIcon className={largeIconClass} />
      ) : (
        <FluentSettingsIcon className={standardIconClass} />
      );
    }

    if (cleanRoute.startsWith('/channels')) {
      return <Tv className={standardIconClass} />;
    }

    if (cleanRoute.startsWith('/favorites')) {
      return <Heart className={`${largeIconClass} text-rose-500 fill-rose-500`} />;
    }

    if (cleanRoute.startsWith('/search')) {
      return <img src="/icons/search_sparkle.png" alt="" className={`${largeIconClass} object-contain`} />;
    }

    if (cleanRoute.startsWith('/auth')) {
      return (
        <svg viewBox="0 0 32 32" fill="none" className={largeIconClass}>
          <circle cx="16" cy="12" r="5" fill="#4cc2ff" />
          <path d="M8 26C8 21.5 11.5 19 16 19C20.5 19 24 21.5 24 26H8Z" fill="#0078d4" />
        </svg>
      );
    }

    if (cleanRoute.startsWith('/feedback')) {
      return <FluentPersonFeedbackIcon className={standardIconClass} />;
    }

    if (cleanRoute.startsWith('/test')) {
      return <FlaskConical className={standardIconClass} />;
    }

    if (cleanRoute.startsWith('/winui-3')) {
      return (
        <img
          src="https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8e/WinUI.svg/120px-WinUI.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail&_=20241127184612"
          alt="WinUI 3"
          className={`${largeIconClass} object-contain`}
        />
      );
    }

    return useFluent3DForContent ? (
      <Fluent3DHomeIcon className={largeIconClass} />
    ) : (
      <FluentHomeIcon className={standardIconClass} />
    );
  };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading..."
      className={`w-full flex-1 flex flex-col items-center justify-center min-h-[55vh] sm:min-h-[65vh] py-16 select-none my-auto ${className}`}
    >
      <motion.div
        key={`tab-icon-${route}`}
        initial={{ scale: 0.15, opacity: 0 }}
        animate={{
          scale: [0.15, 1.18, 0.92, 1.05, 1],
          opacity: [0, 1, 1, 1, 1],
        }}
        transition={{
          duration: 0.65,
          times: [0, 0.4, 0.68, 0.86, 1],
          ease: [0.34, 1.56, 0.64, 1],
        }}
        className="relative flex items-center justify-center origin-center pointer-events-none select-none bg-transparent"
      >
        {getTabIcon()}
      </motion.div>
    </div>
  );
};
