import React, { useEffect, useState } from 'react';
import { SpinningRing } from './SpinningRing';

const LOGO_SRC = 'https://static.wikia.nocookie.net/ep-deo/images/4/4b/Vplay_no_wordmark.png/revision/latest/scale-to-width-down/1000?cb=20260829062616';

interface SplashScreenProps {
  duration?: number; // duration in ms, default 3000 (3 seconds)
  onFinish?: () => void;
  subtitle?: string;
  isClosable?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  duration = 3000,
  onFinish,
  subtitle,
  isClosable = true
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onFinish?.();
    }, duration);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isClosable && e.key === 'Escape') {
        setIsVisible(false);
        onFinish?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [duration, onFinish, isClosable]);

  if (!isVisible) return null;

  return (
    <div
      id="vplay-splash-screen"
      className="fixed inset-0 z-[99999] bg-[#202020] text-white flex flex-col items-center justify-center select-none"
    >
      {/* Splash content: ONLY 2 things — logo in center and spinning ring positioned lower */}
      <div className="relative w-full h-full flex flex-col items-center justify-center px-6">
        {/* Logo web in the center (bigger) */}
        <div className="flex items-center justify-center">
          {!logoError ? (
            <img
              src={LOGO_SRC}
              alt="Vplay"
              referrerPolicy="no-referrer"
              className="h-28 sm:h-36 md:h-44 w-auto max-w-[340px] sm:max-w-[440px] object-contain drop-shadow-xl"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="text-[#4cc2ff] font-black text-7xl sm:text-8xl tracking-tighter">V</span>
          )}
        </div>

        {/* Thick spinning ring (colored #4cc2ff) positioned lower with subtitle text */}
        <div className="absolute bottom-14 sm:bottom-20 md:bottom-24 flex flex-col items-center justify-center gap-3 text-center px-4">
          <SpinningRing size={52} strokeWidth={5.5} color="#4cc2ff" />
          {subtitle && (
            <p className="text-[13.5px] sm:text-[14.5px] text-[#FFFFFF] font-normal tracking-wide max-w-md">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
