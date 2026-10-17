import React from 'react';

interface Fluent3DIconProps {
  className?: string;
  style?: React.CSSProperties;
}

// 1. Home - Microsoft Fluent Design Home (scaled down slightly)
export const Fluent3DHomeIcon: React.FC<Fluent3DIconProps> = ({ className = 'w-5 h-5', style }) => {
  const [loadError, setLoadError] = React.useState(false);

  return (
    <div className={`fluent-3d-icon ${className} shrink-0 flex items-center justify-center`} style={style}>
      {!loadError ? (
        <img
          src="https://www.elevenforum.com/data/attachments/30/30188-c9f25938bd40f9c2e3af267cc96b3e28.jpg?hash=yfJZOL1A-c"
          alt="Home"
          referrerPolicy="no-referrer"
          className="w-[17px] h-[17px] shrink-0 object-contain rounded-[2px]"
          onError={() => setLoadError(true)}
        />
      ) : (
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[17px] h-[17px] shrink-0">
          <defs>
            <linearGradient id="fl3d_home_roof" x1="4" y1="5" x2="28" y2="17" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#0369A1" />
            </linearGradient>
            <linearGradient id="fl3d_home_body" x1="6" y1="14" x2="26" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#075985" />
            </linearGradient>
            <filter id="fl3d_home_shadow" x="-10%" y="-10%" width="125%" height="125%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#000" floodOpacity="0.25" />
            </filter>
          </defs>
          <path d="M7 14.5L16 7L25 14.5V26C25 27.1046 24.1046 28 23 28H9C7.89543 28 7 27.1046 7 26V14.5Z" fill="url(#fl3d_home_body)" filter="url(#fl3d_home_shadow)" />
          <path d="M3.8 14.4C3.1 15 3.3 16 4.2 16H27.8C28.7 16 28.9 15 28.2 14.4L16.8 4.5C16.4 4.1 15.6 4.1 15.2 4.5L3.8 14.4Z" fill="url(#fl3d_home_roof)" />
          <rect x="13" y="19" width="6" height="9" rx="1.5" fill="#F59E0B" />
          <circle cx="17.5" cy="23.5" r="0.75" fill="#FEF3C7" />
        </svg>
      )}
    </div>
  );
};

// 2. Articles - 3D Red Megaphone
export const Fluent3DArticlesIcon: React.FC<Fluent3DIconProps> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={`fluent-3d-icon ${className} shrink-0`} style={style}>
    <defs>
      <linearGradient id="fl3d_mega_cone" x1="6" y1="18" x2="22" y2="10" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#EF4444" />
        <stop offset="60%" stopColor="#DC2626" />
        <stop offset="100%" stopColor="#B91C1C" />
      </linearGradient>
      <linearGradient id="fl3d_mega_mouth" x1="20" y1="6" x2="24" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FECACA" />
        <stop offset="100%" stopColor="#F87171" />
      </linearGradient>
      <linearGradient id="fl3d_mega_back" x1="4" y1="12" x2="10" y2="20" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#F87171" />
        <stop offset="100%" stopColor="#DC2626" />
      </linearGradient>
      <linearGradient id="fl3d_mega_handle" x1="10" y1="19" x2="15" y2="29" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="100%" stopColor="#1E293B" />
      </linearGradient>
      <filter id="fl3d_mega_shadow" x="-10%" y="-10%" width="125%" height="125%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" floodColor="#000" floodOpacity="0.25" />
      </filter>
    </defs>
    <g filter="url(#fl3d_mega_shadow)">
      {/* Handle */}
      <path d="M11 19.5L13.5 27.5C13.7 28.2 14.5 28.6 15.2 28.4L16.2 28.1C16.9 27.9 17.3 27.1 17 26.4L15 18.5L11 19.5Z" fill="url(#fl3d_mega_handle)" />
      {/* Handle trigger */}
      <rect x="15" y="21" width="2" height="3" rx="1" fill="#EF4444" />
      {/* Rear cylinder / cap */}
      <ellipse cx="7.5" cy="16" rx="3.5" ry="4" fill="url(#fl3d_mega_back)" />
      {/* Main cone body */}
      <path d="M7.5 12L21 6.5C21.8 6.2 22.5 6.6 22.8 7.3L23.2 8.5V23.5L22.8 24.7C22.5 25.4 21.8 25.8 21 25.5L7.5 20V12Z" fill="url(#fl3d_mega_cone)" />
      {/* Front rim opening ellipse */}
      <ellipse cx="22" cy="16" rx="2.5" ry="9" fill="url(#fl3d_mega_mouth)" />
      <ellipse cx="22.2" cy="16" rx="1.6" ry="7.6" fill="#7F1D1D" />
      {/* 3D highlight gleam */}
      <path d="M8 13.5L20.5 8.5C21.2 8.3 21.8 8.6 22 9.2V11L9.5 15.5L8 13.5Z" fill="#FFFFFF" opacity="0.35" />
      {/* Sound wave arcs emitting from megaphone */}
      <path d="M26 11.5C27.5 12.8 28.5 14.3 28.5 16C28.5 17.7 27.5 19.2 26 20.5" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M29 9C31 11 32 13.4 32 16C32 18.6 31 21 29 23" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" />
    </g>
  </svg>
);

// 3. Updates - 3D Yellow-Orange (Vàng cam) Sync Arrows
export const Fluent3DUpdatesIcon: React.FC<Fluent3DIconProps> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={`fluent-3d-icon ${className} shrink-0`} style={style}>
    <defs>
      <linearGradient id="fl3d_up_orange_top" x1="4" y1="4" x2="28" y2="16" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="35%" stopColor="#FBBF24" />
        <stop offset="70%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#EA580C" />
      </linearGradient>
      <linearGradient id="fl3d_up_orange_bot" x1="28" y1="28" x2="4" y2="16" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#EA580C" />
        <stop offset="35%" stopColor="#F97316" />
        <stop offset="70%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#FBBF24" />
      </linearGradient>
      <filter id="fl3d_up_shadow" x="-10%" y="-10%" width="125%" height="125%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#000" floodOpacity="0.22" />
      </filter>
    </defs>
    {/* Upper Yellow-Orange Arrow */}
    <g filter="url(#fl3d_up_shadow)">
      <path d="M7 16C7 11.0294 11.0294 7 16 7C19.1176 7 21.8676 8.58333 23.5 11" stroke="url(#fl3d_up_orange_top)" strokeWidth="3.8" strokeLinecap="round" />
      <path d="M22 6L25.8 11.2L20.2 12.2" fill="url(#fl3d_up_orange_top)" stroke="url(#fl3d_up_orange_top)" strokeWidth="1.2" strokeLinejoin="round" />
    </g>
    {/* Lower Yellow-Orange Arrow */}
    <g filter="url(#fl3d_up_shadow)">
      <path d="M25 16C25 20.9706 20.9706 25 16 25C12.8824 25 10.1324 23.4167 8.5 21" stroke="url(#fl3d_up_orange_bot)" strokeWidth="3.8" strokeLinecap="round" />
      <path d="M10 26L6.2 20.8L11.8 19.8" fill="url(#fl3d_up_orange_bot)" stroke="url(#fl3d_up_orange_bot)" strokeWidth="1.2" strokeLinejoin="round" />
    </g>
  </svg>
);

// 4. Watch / Movies & TV - Official 2020 Microsoft Movies & TV Films Icon (scaled down slightly)
export const Fluent3DWatchIcon: React.FC<Fluent3DIconProps> = ({ className = 'w-5 h-5', style }) => (
  <div className={`fluent-3d-icon ${className} shrink-0 flex items-center justify-center`} style={style}>
    <svg
      viewBox="0 0 559 508"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-[17px] h-[17px] shrink-0"
      aria-label="Watch"
    >
      <defs>
        <clipPath id="fl3d_mtv_clip">
          <path d="M696 119 1255 119 1255 627 696 627Z" fillRule="evenodd" clipRule="evenodd" />
        </clipPath>
        <linearGradient id="fl3d_mtv_bg" x1="723.1" y1="96.2" x2="1227.9" y2="650.8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FE924A" />
          <stop offset="0.51" stopColor="#BF6F91" />
          <stop offset="1" stopColor="#8962C2" />
        </linearGradient>
        <linearGradient id="fl3d_mtv_screen" x1="792.6" y1="167.7" x2="1158.4" y2="625.3" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4B4C4C" />
          <stop offset="0.5" stopColor="#3E3E3E" />
          <stop offset="1" stopColor="#252525" />
        </linearGradient>
        <linearGradient id="fl3d_mtv_play" x1="922.3" y1="260" x2="1081.7" y2="536" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="0.6" stopColor="#E2E8EE" />
          <stop offset="1" stopColor="#AABDCD" />
        </linearGradient>
        <linearGradient id="fl3d_mtv_chev" x1="781.4" y1="278.9" x2="1177.6" y2="50.1" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#B3596E" />
          <stop offset="1" stopColor="#AF4E63" />
        </linearGradient>
      </defs>
      <g clipPath="url(#fl3d_mtv_clip)" transform="translate(-696 -119)">
        {/* Card rounded background with 2020 gradient */}
        <path
          d="M697 140.944C697 129.377 706.377 120 717.944 120L1233.06 120C1244.62 120 1254 129.377 1254 140.944L1254 606.056C1254 617.623 1244.62 627 1233.06 627L717.944 627C706.377 627 697 617.623 697 606.056Z"
          fill="url(#fl3d_mtv_bg)"
          fillRule="evenodd"
        />
        {/* Inner dark cinema screen */}
        <rect x="741" y="209" width="469" height="375" rx="8" fill="url(#fl3d_mtv_screen)" />
        {/* Film clapper chevrons top */}
        <path d="M741 120 799.319 120 832 164.5 799.319 209 741 209 773.681 164.5Z" fill="url(#fl3d_mtv_chev)" fillRule="evenodd" />
        <path d="M870 120 927.319 120 960 164.5 927.319 209 870 209 902.681 164.5Z" fill="url(#fl3d_mtv_chev)" fillRule="evenodd" />
        <path d="M998 120 1056.32 120 1089 164.5 1056.32 209 998 209 1030.68 164.5Z" fill="url(#fl3d_mtv_chev)" fillRule="evenodd" />
        <path d="M1127 120 1185.32 120 1218 164.5 1185.32 209 1127 209 1159.68 164.5Z" fill="url(#fl3d_mtv_chev)" fillRule="evenodd" />
        {/* Center Play Button */}
        <path
          d="M905 286.32C905.221 272.574 917.96 264.924 930.921 273.813L1088.57 380.963C1102.04 390.872 1103.17 402.092 1087.86 414.672L937.779 518.568C918.864 531.513 905.959 526.801 905.572 510.263L905 286.32Z"
          fill="url(#fl3d_mtv_play)"
          fillRule="evenodd"
        />
      </g>
    </svg>
  </div>
);

// 5. Gallery - 3D Microsoft Photos / Gallery (scaled down like home, settings, watch)
export const Fluent3DGalleryIcon: React.FC<Fluent3DIconProps> = ({ className = 'w-5 h-5', style }) => {
  const [loadError, setLoadError] = React.useState(false);

  return (
    <div className={`fluent-3d-icon ${className} shrink-0 flex items-center justify-center`} style={style}>
      {!loadError ? (
        <img
          src="https://www.elevenforum.com/data/attachments/73/73114-b7601bc81d404bb12cc522e1acb2fea8.jpg?hash=t2AbyB1AS7"
          alt="Gallery"
          referrerPolicy="no-referrer"
          className="w-[17px] h-[17px] shrink-0 object-contain rounded-[2px]"
          onError={() => setLoadError(true)}
        />
      ) : (
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[17px] h-[17px] shrink-0">
          <defs>
            <linearGradient id="fl3d_gal_back" x1="4" y1="4" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
            <linearGradient id="fl3d_gal_sky" x1="8" y1="8" x2="28" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="60%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#1E3A8A" />
            </linearGradient>
            <linearGradient id="fl3d_gal_mount" x1="12" y1="18" x2="28" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <filter id="fl3d_gal_shadow" x="-10%" y="-10%" width="125%" height="125%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#000" floodOpacity="0.22" />
            </filter>
          </defs>
          {/* Back Card */}
          <rect x="4" y="4" width="19" height="19" rx="3.5" fill="url(#fl3d_gal_back)" opacity="0.65" />
          {/* Front Picture Card */}
          <rect x="9" y="8" width="19" height="19" rx="3.5" fill="url(#fl3d_gal_sky)" filter="url(#fl3d_gal_shadow)" />
          {/* Sun */}
          <circle cx="14.5" cy="13.5" r="2.4" fill="#FBBF24" />
          {/* Mountains */}
          <path d="M9 24L14 18L18 22L22 17L28 24V24.5C28 25.8807 26.8807 27 25.5 27H11.5C10.1193 27 9 25.8807 9 24.5V24Z" fill="url(#fl3d_gal_mount)" />
          <path d="M17 23L22 17L28 24V25C28 26.1046 27.1046 27 26 27H21L17 23Z" fill="#10B981" opacity="0.5" />
        </svg>
      )}
    </div>
  );
};

// 6. Draws - 3D Artist Palette WITH PAINT BRUSH (Cọ vẽ)
export const Fluent3DDrawsIcon: React.FC<Fluent3DIconProps> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={`fluent-3d-icon ${className} shrink-0`} style={style}>
    <defs>
      <linearGradient id="fl3d_draw_palette" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="50%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
      <linearGradient id="fl3d_draw_brush_handle" x1="14" y1="26" x2="28" y2="12" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#B45309" />
        <stop offset="60%" stopColor="#D97706" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
      <linearGradient id="fl3d_draw_ferrule" x1="18" y1="18" x2="22" y2="14" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#E2E8F0" />
        <stop offset="50%" stopColor="#94A3B8" />
        <stop offset="100%" stopColor="#CBD5E1" />
      </linearGradient>
      <filter id="fl3d_draw_shadow" x="-10%" y="-10%" width="125%" height="125%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" floodColor="#000" floodOpacity="0.25" />
      </filter>
    </defs>
    {/* Palette Base */}
    <g filter="url(#fl3d_draw_shadow)">
      <path d="M15 4C8.5 4 4 8.8 4 15C4 18.5 5.5 21.5 8 23.5C9.5 25 11 26.5 11 27C11 27.5 11.5 27.8 12 27.8H13.5C14.2 27.8 14.8 27.2 14.8 26.5C14.8 25 16 23.5 18 23.5C23.2 23.5 26.5 20 26.5 15C26.5 8.8 21.5 4 15 4Z" fill="url(#fl3d_draw_palette)" />
      {/* Thumb Hole */}
      <ellipse cx="20.5" cy="18" rx="2" ry="2.2" fill="#78350F" opacity="0.35" />
      {/* Paint Drops */}
      <circle cx="9" cy="10" r="2.2" fill="#EF4444" />
      <circle cx="8.4" cy="9.2" r="0.6" fill="#FEE2E2" />
      <circle cx="15" cy="7.5" r="2.2" fill="#3B82F6" />
      <circle cx="14.4" cy="6.7" r="0.6" fill="#EFF6FF" />
      <circle cx="21" cy="10.5" r="2.2" fill="#10B981" />
      <circle cx="20.4" cy="9.7" r="0.6" fill="#ECFDF5" />
      <circle cx="8" cy="16.5" r="2" fill="#A855F7" />
      <circle cx="7.5" cy="15.8" r="0.5" fill="#FAF5FF" />
    </g>
    {/* Paint Brush across palette */}
    <g filter="url(#fl3d_draw_shadow)">
      {/* Brush Handle */}
      <path d="M29 5L24 10L21.5 12.5L20 14L22 16L23.5 14.5L26 12L31 7C31.5 6.5 31.5 5.5 31 5C30.5 4.5 29.5 4.5 29 5Z" fill="url(#fl3d_draw_brush_handle)" />
      {/* Metal Ferrule */}
      <path d="M20 14L17.5 16.5L19.5 18.5L22 16L20 14Z" fill="url(#fl3d_draw_ferrule)" />
      {/* Bristles tip with vibrant paint */}
      <path d="M17.5 16.5L14 20C13.5 20.5 13.5 21.5 14 22L14.5 22.5L16.5 20.5L17 19L19.5 18.5L17.5 16.5Z" fill="#38BDF8" />
      <path d="M14 22C13.2 22.8 12.2 23.5 11.5 24C11.2 24.2 11 23.8 11.2 23.5C11.8 22.8 12.5 21.8 13.5 21L14 22Z" fill="#0284C7" />
    </g>
  </svg>
);

// 7. Notes - 4 Stacked Sticky Notes (Vàng, Xanh lá, Xanh dương, Đỏ)
export const Fluent3DNotesIcon: React.FC<Fluent3DIconProps> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={`fluent-3d-icon ${className} shrink-0`} style={style}>
    <defs>
      <linearGradient id="fl3d_note_red" x1="4" y1="4" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#F87171" />
        <stop offset="100%" stopColor="#EF4444" />
      </linearGradient>
      <linearGradient id="fl3d_note_blue" x1="8" y1="6" x2="26" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="100%" stopColor="#2563EB" />
      </linearGradient>
      <linearGradient id="fl3d_note_green" x1="6" y1="8" x2="24" y2="26" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#34D399" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
      <linearGradient id="fl3d_note_yellow" x1="8" y1="8" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="60%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
      <filter id="fl3d_note_shadow" x="-15%" y="-15%" width="130%" height="130%">
        <feDropShadow dx="0" dy="1.2" stdDeviation="1" floodColor="#000" floodOpacity="0.22" />
      </filter>
    </defs>
    {/* 1. Red Sticky Note (Bottom, tilted left) */}
    <g transform="rotate(-8 14 15)" filter="url(#fl3d_note_shadow)">
      <rect x="4" y="4" width="18" height="18" rx="2.5" fill="url(#fl3d_note_red)" />
      <rect x="4" y="4" width="18" height="3" rx="1.5" fill="#DC2626" opacity="0.4" />
    </g>
    {/* 2. Blue Sticky Note (tilted right) */}
    <g transform="rotate(7 17 16)" filter="url(#fl3d_note_shadow)">
      <rect x="8" y="5" width="18" height="18" rx="2.5" fill="url(#fl3d_note_blue)" />
      <rect x="8" y="5" width="18" height="3" rx="1.5" fill="#1D4ED8" opacity="0.35" />
    </g>
    {/* 3. Green Sticky Note (tilted slight left) */}
    <g transform="rotate(-3 16 18)" filter="url(#fl3d_note_shadow)">
      <rect x="6" y="8" width="18" height="18" rx="2.5" fill="url(#fl3d_note_green)" />
      <rect x="6" y="8" width="18" height="3" rx="1.5" fill="#047857" opacity="0.35" />
    </g>
    {/* 4. Yellow Sticky Note (Top, upright with folded bottom corner & lines) */}
    <g filter="url(#fl3d_note_shadow)">
      <path d="M9 10C9 8.6 10.1 7.5 11.5 7.5H24.5C25.9 7.5 27 8.6 27 10V22.5L23.5 26.5H11.5C10.1 26.5 9 25.4 9 24V10Z" fill="url(#fl3d_note_yellow)" />
      {/* Top glue strip */}
      <path d="M9 10C9 8.6 10.1 7.5 11.5 7.5H24.5C25.9 7.5 27 8.6 27 10V10.8H9V10Z" fill="#D97706" opacity="0.3" />
      {/* Peeled corner triangle */}
      <path d="M23.5 22.5H27L23.5 26.5V22.5Z" fill="#D97706" opacity="0.4" />
      {/* Handwriting / lines on yellow note */}
      <rect x="12" y="13" width="10" height="1.5" rx="0.75" fill="#B45309" opacity="0.5" />
      <rect x="12" y="16.5" width="8" height="1.5" rx="0.75" fill="#B45309" opacity="0.4" />
      <rect x="12" y="20" width="6" height="1.5" rx="0.75" fill="#B45309" opacity="0.4" />
    </g>
  </svg>
);

// 8. VLC - 3D Traffic Cone WITH 2 CLEAR WHITE HORIZONTAL STRIPES (2 thanh ngang trắng)
export const Fluent3DVlcIcon: React.FC<Fluent3DIconProps> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={`fluent-3d-icon ${className} shrink-0`} style={style}>
    <defs>
      <linearGradient id="fl3d_vlc_orange_base" x1="16" y1="4" x2="16" y2="26" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FB923C" />
        <stop offset="50%" stopColor="#F97316" />
        <stop offset="100%" stopColor="#EA580C" />
      </linearGradient>
      <linearGradient id="fl3d_vlc_dark_base" x1="3" y1="24" x2="29" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="100%" stopColor="#1E293B" />
      </linearGradient>
      <filter id="fl3d_vlc_shadow" x="-10%" y="-10%" width="125%" height="125%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#000" floodOpacity="0.25" />
      </filter>
    </defs>
    {/* Base Plate */}
    <rect x="3.5" y="24" width="25" height="4.5" rx="2.2" fill="url(#fl3d_vlc_dark_base)" filter="url(#fl3d_vlc_shadow)" />
    {/* Cone Body Base - Orange */}
    <path d="M7 24L8.8 19.5H23.2L25 24H7Z" fill="url(#fl3d_vlc_orange_base)" />
    {/* 1. LOWER WHITE HORIZONTAL STRIPE (Bolder & distinctly white) */}
    <path d="M8.8 19.5L10.5 15H21.5L23.2 19.5H8.8Z" fill="#FFFFFF" filter="url(#fl3d_vlc_shadow)" />
    <path d="M8.8 19.5H23.2" stroke="#E2E8F0" strokeWidth="0.5" />
    {/* Middle Orange Segment */}
    <path d="M10.5 15L12.2 10.5H19.8L21.5 15H10.5Z" fill="url(#fl3d_vlc_orange_base)" />
    {/* 2. UPPER WHITE HORIZONTAL STRIPE (Bolder & distinctly white) */}
    <path d="M12.2 10.5L13.8 6.5H18.2L19.8 10.5H12.2Z" fill="#FFFFFF" filter="url(#fl3d_vlc_shadow)" />
    <path d="M12.2 10.5H19.8" stroke="#E2E8F0" strokeWidth="0.5" />
    {/* Top Orange Tip */}
    <path d="M13.8 6.5L15 3.5C15.4 2.5 16.6 2.5 17 3.5L18.2 6.5H13.8Z" fill="url(#fl3d_vlc_orange_base)" />
    {/* 3D Highlight curve on left side */}
    <path d="M15 3.5L9 24H7L14 3.5H15Z" fill="#FFFFFF" opacity="0.3" />
  </svg>
);

// 9. Craftmine - 3D Isometric Minecraft Grass Block
export const Fluent3DCraftmineIcon: React.FC<Fluent3DIconProps> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={`fluent-3d-icon ${className} shrink-0`} style={style}>
    <defs>
      <linearGradient id="fl3d_craft_top" x1="16" y1="4" x2="16" y2="15" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#4ADE80" />
        <stop offset="100%" stopColor="#16A34A" />
      </linearGradient>
      <linearGradient id="fl3d_craft_left" x1="4" y1="12" x2="16" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#78350F" />
        <stop offset="100%" stopColor="#451A03" />
      </linearGradient>
      <linearGradient id="fl3d_craft_right" x1="16" y1="12" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#92400E" />
        <stop offset="100%" stopColor="#78350F" />
      </linearGradient>
      <filter id="fl3d_craft_shadow" x="-10%" y="-10%" width="125%" height="125%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" floodColor="#000" floodOpacity="0.25" />
      </filter>
    </defs>
    <g filter="url(#fl3d_craft_shadow)">
      <path d="M4 11.5L16 18.5V28L4 21V11.5Z" fill="url(#fl3d_craft_left)" />
      <path d="M16 18.5L28 11.5V21L16 28V18.5Z" fill="url(#fl3d_craft_right)" />
      <path d="M16 4.5L28 11.5L16 18.5L4 11.5L16 4.5Z" fill="url(#fl3d_craft_top)" />
      <path d="M4 11.5L16 18.5V21L13 19.5V20.5L10 18.8V19.8L7 18.1V19L4 17.5V11.5Z" fill="#15803D" />
      <path d="M16 18.5L28 11.5V17.5L25 19V18.1L22 19.8V18.8L19 20.5V19.5L16 21V18.5Z" fill="#16A34A" />
    </g>
  </svg>
);

// 10. Photopea - 3D Vibrant Photopea Tile
export const Fluent3DPhotopeaIcon: React.FC<Fluent3DIconProps> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={`fluent-3d-icon ${className} shrink-0`} style={style}>
    <defs>
      <linearGradient id="fl3d_pea_bg" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#0E7490" />
        <stop offset="50%" stopColor="#155E75" />
        <stop offset="100%" stopColor="#083344" />
      </linearGradient>
      <linearGradient id="fl3d_pea_p" x1="10" y1="8" x2="22" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#67E8F9" />
        <stop offset="50%" stopColor="#06B6D4" />
        <stop offset="100%" stopColor="#0891B2" />
      </linearGradient>
      <filter id="fl3d_pea_shadow" x="-10%" y="-10%" width="125%" height="125%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" floodColor="#000" floodOpacity="0.25" />
      </filter>
    </defs>
    <rect x="4" y="4" width="24" height="24" rx="6.5" fill="url(#fl3d_pea_bg)" filter="url(#fl3d_pea_shadow)" />
    <rect x="4.5" y="4.5" width="23" height="10" rx="6" fill="#38BDF8" opacity="0.2" />
    <path d="M10.5 8.5H17.2C19.851 8.5 22 10.649 22 13.3C22 15.951 19.851 18.1 17.2 18.1H14V23.5H10.5V8.5ZM14 11.5V15.1H17C17.9941 15.1 18.8 14.2941 18.8 13.3C18.8 12.3059 17.9941 11.5 17 11.5H14Z" fill="url(#fl3d_pea_p)" />
    <circle cx="22" cy="9.5" r="1.5" fill="#FEF08A" />
  </svg>
);

// 11. Discord - 3D Microsoft Fluent Discord Clyde
export const Fluent3DDiscordIcon: React.FC<Fluent3DIconProps> = ({ className = 'w-5 h-5', style }) => (
  <img
    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-aIiiyqCXj2M4Gy2HPiavRZwWekqrS1.png"
    alt="Discord"
    className={`fluent-3d-icon ${className} shrink-0 object-contain`}
    style={style}
  />
);

// 12. Sign In / User - 3D Microsoft Fluent Profile Avatar WITH GRAY BACKGROUND (Background is gray)
export const Fluent3DUserIcon: React.FC<Fluent3DIconProps> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={`fluent-3d-icon ${className} shrink-0`} style={style}>
    <defs>
      <linearGradient id="fl3d_user_gray_bg" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#9CA3AF" />
        <stop offset="50%" stopColor="#6B7280" />
        <stop offset="100%" stopColor="#4B5563" />
      </linearGradient>
      <linearGradient id="fl3d_user_body" x1="8" y1="18" x2="24" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#E2E8F0" />
      </linearGradient>
      <filter id="fl3d_user_shadow" x="-10%" y="-10%" width="125%" height="125%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" floodColor="#000" floodOpacity="0.25" />
      </filter>
    </defs>
    {/* Circle badge with Gray background */}
    <circle cx="16" cy="16" r="12" fill="url(#fl3d_user_gray_bg)" filter="url(#fl3d_user_shadow)" />
    {/* Inner rim highlight */}
    <circle cx="16" cy="16" r="11" stroke="#D1D5DB" strokeWidth="1" opacity="0.4" />
    {/* Head */}
    <circle cx="16" cy="12" r="4.2" fill="url(#fl3d_user_body)" />
    {/* Shoulders */}
    <path d="M8.5 24C8.5 19.8 11.8 18 16 18C20.2 18 23.5 19.8 23.5 24C23.5 25.2 22.5 26.5 21 26.5H11C9.5 26.5 8.5 25.2 8.5 24Z" fill="url(#fl3d_user_body)" />
  </svg>
);

// 13. Settings - Official Windows 2020 Settings Gear (Settings_Windows_2020.svg, scaled down slightly)
export const Fluent3DSettingsIcon: React.FC<Fluent3DIconProps> = ({ className = 'w-5 h-5', style }) => (
  <div className={`fluent-3d-icon ${className} shrink-0 flex items-center justify-center`} style={style}>
    <svg
      viewBox="0 0 651 612.4"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-[17.5px] h-[17.5px] shrink-0"
    >
      <defs>
        <linearGradient id="fl3d_win2020_gear" x1="325.5" y1="612.4" x2="325.5" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#69757C" />
          <stop offset="0.5" stopColor="#7E8890" />
          <stop offset="1" stopColor="#878F95" />
        </linearGradient>
        <linearGradient id="fl3d_win2020_blue" x1="325.5" y1="470.7" x2="325.5" y2="141.7" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1C3A6D" />
          <stop offset="1" stopColor="#154687" />
        </linearGradient>
        <linearGradient id="fl3d_win2020_inner" x1="325.5" y1="418.7" x2="325.5" y2="193.7" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#D4D3D8" />
          <stop offset="1" stopColor="#FFFFFF" />
        </linearGradient>
      </defs>
      <path
        fill="url(#fl3d_win2020_gear)"
        d="M651,306.2c0,18.7-1.6,37-4.6,54.8c-1.1,6.6-6.8,11.5-13.5,11.6c-38.3,0.6-75.3,20.7-95.9,56.2 c-20.5,35.5-19.4,77.5-1,110.9c3.2,5.9,1.8,13.2-3.3,17.5c-27.6,22.8-59.1,41.2-93.3,54c-6.3,2.3-13.4-0.1-16.9-5.9 c-19.7-32.7-55.5-54.7-96.5-54.7c-41.1,0-77,22-96.7,54.9c-3.4,5.8-10.5,8.2-16.8,5.9c-34.5-12.8-66.3-31.3-94.2-54.3 c-5.2-4.3-6.6-11.6-3.3-17.5c18.5-33.4,19.5-75.4-1-110.9c-20.5-35.6-57.6-55.7-95.9-56.2c-6.7-0.1-12.4-5-13.5-11.6 c-3-17.8-4.6-36.1-4.6-54.8c0-18.7,1.6-37,4.6-54.8c1.1-6.6,6.8-11.5,13.5-11.6c38.3-0.6,75.3-20.7,95.9-56.2 c20.5-35.5,19.4-77.5,1-110.9c-3.2-5.9-1.8-13.2,3.3-17.5c27.6-22.8,59.1-41.2,93.3-54c6.3-2.3,13.4,0.1,16.9,5.9 C248.2,39.8,284,61.7,325,61.7c41.1,0,77-22,96.7-54.9c3.4-5.8,10.5-8.2,16.8-5.9c34.5,12.8,66.3,31.3,94.2,54.3 c5.2,4.3,6.6,11.6,3.3,17.5c-18.5,33.4-19.5,75.4,1,110.9c20.5,35.6,57.6,55.7,95.9,56.2c6.7,0.1,12.4,5,13.5,11.6 C649.4,269.2,651,287.5,651,306.2z"
      />
      <circle cx="325.5" cy="306.2" r="164.5" fill="url(#fl3d_win2020_blue)" />
      <circle cx="325.5" cy="306.2" r="112.5" fill="url(#fl3d_win2020_inner)" />
    </svg>
  </div>
);

// 14. Folder Search / Search in Folder - Microsoft Fluent Design Colored 3D Folder with 3D Magnifying Glass
export const Fluent3DFolderSearchIcon: React.FC<Fluent3DIconProps> = ({ className = 'w-5 h-5', style }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`fluent-3d-icon ${className} shrink-0`}
    style={style}
  >
    <defs>
      {/* Folder Back Tab & Base Gradients */}
      <linearGradient id="fl3d_fsearch_back" x1="4" y1="6" x2="28" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="50%" stopColor="#D97706" />
        <stop offset="100%" stopColor="#B45309" />
      </linearGradient>
      {/* Folder Front Flap Gradient */}
      <linearGradient id="fl3d_fsearch_front" x1="4" y1="11" x2="28" y2="26" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="35%" stopColor="#FBBF24" />
        <stop offset="75%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
      {/* Magnifier Rim Gradient (Vibrant Azure 3D) */}
      <linearGradient id="fl3d_fsearch_rim" x1="10" y1="9" x2="23" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="30%" stopColor="#38BDF8" />
        <stop offset="70%" stopColor="#0284C7" />
        <stop offset="100%" stopColor="#0369A1" />
      </linearGradient>
      {/* Magnifier Handle Gradient */}
      <linearGradient id="fl3d_fsearch_handle" x1="19" y1="20" x2="28" y2="29" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#94A3B8" />
        <stop offset="30%" stopColor="#475569" />
        <stop offset="70%" stopColor="#1E293B" />
        <stop offset="100%" stopColor="#0F172A" />
      </linearGradient>
      {/* Magnifier Glass Lens Gradient */}
      <linearGradient id="fl3d_fsearch_glass" x1="11" y1="10" x2="21" y2="20" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.88" />
        <stop offset="45%" stopColor="#7DD3FC" stopOpacity="0.65" />
        <stop offset="100%" stopColor="#0284C7" stopOpacity="0.82" />
      </linearGradient>
      {/* Drop Shadows */}
      <filter id="fl3d_fsearch_shadow" x="-15%" y="-15%" width="130%" height="130%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#000000" floodOpacity="0.25" />
      </filter>
      <filter id="fl3d_fsearch_mag_shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0.5" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.32" />
      </filter>
    </defs>

    {/* Folder Back with Tab */}
    <g filter="url(#fl3d_fsearch_shadow)">
      <path
        d="M3.5 8.5C3.5 7.4 4.4 6.5 5.5 6.5H11.2C12 6.5 12.7 6.9 13.2 7.5L14.7 9.5C15 9.9 15.5 10.2 16.1 10.2H26.5C27.6 10.2 28.5 11.1 28.5 12.2V23C28.5 24.1 27.6 25 26.5 25H5.5C4.4 25 3.5 24.1 3.5 23V8.5Z"
        fill="url(#fl3d_fsearch_back)"
      />
      {/* Folder Inside Shadow / Depth */}
      <path
        d="M4.5 11.5H27.5V13H4.5V11.5Z"
        fill="#78350F"
        opacity="0.35"
      />
      {/* Peeking White Paper Sheet inside folder */}
      <path
        d="M6 8.5C6 7.9 6.4 7.5 7 7.5H20.5C21.1 7.5 21.5 7.9 21.5 8.5V13H6V8.5Z"
        fill="#FFFFFF"
        opacity="0.9"
      />
      <line x1="8.5" y1="9.8" x2="15.5" y2="9.8" stroke="#93C5FD" strokeWidth="1" strokeLinecap="round" />
    </g>

    {/* Folder Front Pocket Flap */}
    <g filter="url(#fl3d_fsearch_shadow)">
      <path
        d="M2.5 12.5C2.5 11.4 3.4 10.5 4.5 10.5H27.5C28.6 10.5 29.5 11.4 29.5 12.5V23.5C29.5 24.6 28.6 25.5 27.5 25.5H4.5C3.4 25.5 2.5 24.6 2.5 23.5V12.5Z"
        fill="url(#fl3d_fsearch_front)"
      />
      {/* Top 3D Gloss Highlight Edge on Front Flap */}
      <path
        d="M4.5 11H27.5"
        stroke="#FEF9C3"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.8"
      />
      {/* Bottom subtle shadow on front flap */}
      <path
        d="M4.5 25H27.5"
        stroke="#B45309"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.4"
      />
    </g>

    {/* 3D Magnifying Glass superimposed in 3D */}
    <g filter="url(#fl3d_fsearch_mag_shadow)">
      {/* 3D Cylindrical Handle */}
      <path
        d="M19.8 21.2L25.6 27C26.2 27.6 27.2 27.6 27.8 27C28.4 26.4 28.4 25.4 27.8 24.8L22 19L19.8 21.2Z"
        fill="url(#fl3d_fsearch_handle)"
      />
      {/* Metallic Ferrule Ring between Handle and Lens Rim */}
      <rect
        x="19"
        y="19"
        width="3"
        height="1.5"
        rx="0.5"
        transform="rotate(45 19 19)"
        fill="#E2E8F0"
      />
      {/* Outer 3D Bevel Lens Rim */}
      <circle cx="15" cy="15.5" r="5.6" fill="url(#fl3d_fsearch_rim)" />
      {/* Inner Lens Rim Highlight */}
      <circle cx="15" cy="15.5" r="4.3" stroke="#BAE6FD" strokeWidth="0.5" opacity="0.6" />
      {/* Glass Lens (Translucent 3D Glass) */}
      <circle cx="15" cy="15.5" r="4.1" fill="url(#fl3d_fsearch_glass)" />
      {/* Specular Curved Reflection Gleam on Top-Left of Glass */}
      <path
        d="M12.5 13C13.2 12.3 14.1 11.9 15.1 11.9C15.5 11.9 15.8 12.1 15.7 12.4C15.6 12.7 15.3 12.9 14.9 12.9C14.1 12.9 13.5 13.2 13 13.7C12.7 14 12.4 13.9 12.3 13.6C12.1 13.3 12.2 13.1 12.5 13Z"
        fill="#FFFFFF"
        opacity="0.95"
      />
      {/* Secondary subtle glint */}
      <circle cx="17.2" cy="17.5" r="0.65" fill="#FFFFFF" opacity="0.75" />
    </g>
  </svg>
);

// 15. Search / Magnifying Glass - Microsoft Fluent Design Colored 3D Magnifying Glass
export const Fluent3DSearchIcon: React.FC<Fluent3DIconProps> = ({ className = 'w-5 h-5', style }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`fluent-3d-icon ${className} shrink-0`}
    style={style}
  >
    <defs>
      {/* 3D Cylindrical Handle Gradient */}
      <linearGradient id="fl3d_mag_handle" x1="18.5" y1="18.5" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#94A3B8" />
        <stop offset="25%" stopColor="#475569" />
        <stop offset="65%" stopColor="#1E293B" />
        <stop offset="100%" stopColor="#0F172A" />
      </linearGradient>
      {/* Metallic Ferrule Collar */}
      <linearGradient id="fl3d_mag_collar" x1="17.5" y1="17.5" x2="21.5" y2="21.5" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="40%" stopColor="#E2E8F0" />
        <stop offset="100%" stopColor="#64748B" />
      </linearGradient>
      {/* 3D Rim Gradient (Fluent Azure / Windows Blue) */}
      <linearGradient id="fl3d_mag_rim" x1="5" y1="4" x2="22" y2="21" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="35%" stopColor="#38BDF8" />
        <stop offset="70%" stopColor="#0284C7" />
        <stop offset="100%" stopColor="#0369A1" />
      </linearGradient>
      {/* Inner Rim Bevel */}
      <linearGradient id="fl3d_mag_inner_rim" x1="6" y1="5" x2="20" y2="19" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#BAE6FD" />
        <stop offset="100%" stopColor="#0284C7" />
      </linearGradient>
      {/* Translucent Glass Lens Gradient */}
      <linearGradient id="fl3d_mag_glass" x1="6.5" y1="5.5" x2="19.5" y2="18.5" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#F0F9FF" stopOpacity="0.9" />
        <stop offset="40%" stopColor="#7DD3FC" stopOpacity="0.55" />
        <stop offset="85%" stopColor="#0284C7" stopOpacity="0.75" />
        <stop offset="100%" stopColor="#0369A1" stopOpacity="0.85" />
      </linearGradient>
      {/* Drop Shadow */}
      <filter id="fl3d_mag_shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0.5" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.32" />
      </filter>
    </defs>
    <g filter="url(#fl3d_mag_shadow)">
      {/* 3D Cylindrical Handle */}
      <path
        d="M19.2 19.2L26.8 26.8C27.4 27.4 28.4 27.4 29 26.8C29.6 26.2 29.6 25.2 29 24.6L21.4 17L19.2 19.2Z"
        fill="url(#fl3d_mag_handle)"
      />
      {/* Metallic Ferrule Ring between Handle and Lens Rim */}
      <rect
        x="18.5"
        y="18.5"
        width="3.5"
        height="1.8"
        rx="0.6"
        transform="rotate(45 18.5 18.5)"
        fill="url(#fl3d_mag_collar)"
      />
      {/* Outer 3D Bevel Lens Rim */}
      <circle cx="13" cy="13" r="8.5" fill="url(#fl3d_mag_rim)" />
      {/* Inner Lens Rim Highlight */}
      <circle cx="13" cy="13" r="6.5" fill="url(#fl3d_mag_inner_rim)" />
      {/* Translucent Glass Lens */}
      <circle cx="13" cy="13" r="5.8" fill="url(#fl3d_mag_glass)" />
      {/* Specular Curved Reflection Gleam on Top-Left of Glass */}
      <path
        d="M9.5 9.5C10.5 8.5 11.8 8 13.2 8C13.8 8 14.1 8.3 14 8.7C13.9 9.1 13.5 9.3 13 9.3C11.9 9.3 11 9.7 10.3 10.4C9.9 10.8 9.5 10.7 9.3 10.3C9.1 9.9 9.2 9.7 9.5 9.5Z"
        fill="#FFFFFF"
        opacity="0.95"
      />
      {/* Secondary subtle glint */}
      <circle cx="16" cy="16" r="0.9" fill="#FFFFFF" opacity="0.75" />
    </g>
  </svg>
);

// 16. Calculator - Microsoft Fluent Design Colored 3D Calculator
export const Fluent3DCalculatorIcon: React.FC<Fluent3DIconProps> = ({ className = 'w-5 h-5', style }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`fluent-3d-icon ${className} shrink-0`}
    style={style}
  >
    <defs>
      <linearGradient id="fl3d_calc_body" x1="6" y1="3" x2="26" y2="29" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="50%" stopColor="#334155" />
        <stop offset="100%" stopColor="#1E293B" />
      </linearGradient>
      <linearGradient id="fl3d_calc_screen" x1="8" y1="6" x2="24" y2="12" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#0F172A" />
        <stop offset="100%" stopColor="#1E293B" />
      </linearGradient>
      <linearGradient id="fl3d_calc_orange_btn" x1="18" y1="21" x2="24" y2="26" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FB923C" />
        <stop offset="100%" stopColor="#EA580C" />
      </linearGradient>
      <linearGradient id="fl3d_calc_blue_btn" x1="18" y1="14" x2="24" y2="19" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#38BDF8" />
        <stop offset="100%" stopColor="#0284C7" />
      </linearGradient>
      <filter id="fl3d_calc_shadow" x="-15%" y="-15%" width="130%" height="130%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" floodColor="#000" floodOpacity="0.28" />
      </filter>
    </defs>
    <g filter="url(#fl3d_calc_shadow)">
      {/* Calculator Body */}
      <rect x="5.5" y="3.5" width="21" height="25" rx="4.5" fill="url(#fl3d_calc_body)" />
      {/* Top 3D Rim Highlight */}
      <rect x="6" y="4" width="20" height="2" rx="1" fill="#94A3B8" opacity="0.35" />
      {/* Screen Display */}
      <rect x="8" y="6.5" width="16" height="5.5" rx="1.8" fill="url(#fl3d_calc_screen)" />
      <rect x="8" y="6.5" width="16" height="5.5" rx="1.8" stroke="#334155" strokeWidth="0.6" />
      {/* Subtle Digital Digits glow */}
      <rect x="18" y="8.2" width="4" height="2" rx="0.5" fill="#38BDF8" opacity="0.9" />
      <rect x="14" y="8.2" width="3" height="2" rx="0.5" fill="#38BDF8" opacity="0.6" />

      {/* Row 1 Keys */}
      <rect x="8" y="14" width="3.5" height="3" rx="1" fill="#64748B" />
      <rect x="12.5" y="14" width="3.5" height="3" rx="1" fill="#64748B" />
      <rect x="17" y="14" width="3.5" height="3" rx="1" fill="#64748B" />
      <rect x="21.5" y="14" width="2.5" height="3" rx="1" fill="url(#fl3d_calc_blue_btn)" />

      {/* Row 2 Keys */}
      <rect x="8" y="18" width="3.5" height="3" rx="1" fill="#64748B" />
      <rect x="12.5" y="18" width="3.5" height="3" rx="1" fill="#64748B" />
      <rect x="17" y="18" width="3.5" height="3" rx="1" fill="#64748B" />
      <rect x="21.5" y="18" width="2.5" height="3" rx="1" fill="url(#fl3d_calc_blue_btn)" />

      {/* Row 3 Keys */}
      <rect x="8" y="22" width="3.5" height="3" rx="1" fill="#64748B" />
      <rect x="12.5" y="22" width="3.5" height="3" rx="1" fill="#64748B" />
      <rect x="17" y="22" width="7" height="3" rx="1" fill="url(#fl3d_calc_orange_btn)" />
    </g>
  </svg>
);

// 17. Maps - Microsoft Fluent Design Colored 3D Folded Map with Pin
export const Fluent3DMapsIcon: React.FC<Fluent3DIconProps> = ({ className = 'w-5 h-5', style }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`fluent-3d-icon ${className} shrink-0`}
    style={style}
  >
    <defs>
      <linearGradient id="fl3d_map_left" x1="4" y1="7" x2="11" y2="27" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#38BDF8" />
        <stop offset="60%" stopColor="#0284C7" />
        <stop offset="100%" stopColor="#0369A1" />
      </linearGradient>
      <linearGradient id="fl3d_map_mid" x1="11" y1="4" x2="19" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#86EFAC" />
        <stop offset="60%" stopColor="#22C55E" />
        <stop offset="100%" stopColor="#15803D" />
      </linearGradient>
      <linearGradient id="fl3d_map_right" x1="19" y1="7" x2="26" y2="27" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="60%" stopColor="#EAB308" />
        <stop offset="100%" stopColor="#CA8A04" />
      </linearGradient>
      <linearGradient id="fl3d_map_pin" x1="17" y1="5" x2="25" y2="17" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#EF4444" />
        <stop offset="70%" stopColor="#DC2626" />
        <stop offset="100%" stopColor="#991B1B" />
      </linearGradient>
      <filter id="fl3d_map_shadow" x="-15%" y="-15%" width="130%" height="130%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" floodColor="#000" floodOpacity="0.25" />
      </filter>
      <filter id="fl3d_pin_shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0.5" dy="2" stdDeviation="1" floodColor="#000" floodOpacity="0.35" />
      </filter>
    </defs>
    <g filter="url(#fl3d_map_shadow)">
      {/* Left Fold */}
      <path d="M5 8.5L12 5.5V23.5L5 26.5V8.5Z" fill="url(#fl3d_map_left)" />
      {/* Middle Fold */}
      <path d="M12 5.5L19 8.5V26.5L12 23.5V5.5Z" fill="url(#fl3d_map_mid)" />
      {/* Right Fold */}
      <path d="M19 8.5L26 5.5V23.5L19 26.5V8.5Z" fill="url(#fl3d_map_right)" />
      {/* Road / Path across folds */}
      <path d="M5 16L12 14L19 18L26 15" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
    </g>
    {/* 3D Location Pin */}
    <g filter="url(#fl3d_pin_shadow)">
      <path
        d="M21 5.5C18.5 5.5 16.5 7.5 16.5 10C16.5 13.5 21 19 21 19C21 19 25.5 13.5 25.5 10C25.5 7.5 23.5 5.5 21 5.5Z"
        fill="url(#fl3d_map_pin)"
      />
      <circle cx="21" cy="9.8" r="1.8" fill="#FFFFFF" />
    </g>
  </svg>
);

// 18. Mail & Calendar - Microsoft Fluent Design Colored 3D Mail & Calendar
export const Fluent3DMailIcon: React.FC<Fluent3DIconProps> = ({ className = 'w-5 h-5', style }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`fluent-3d-icon ${className} shrink-0`}
    style={style}
  >
    <defs>
      <linearGradient id="fl3d_mail_body" x1="4" y1="8" x2="28" y2="26" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#38BDF8" />
        <stop offset="50%" stopColor="#0284C7" />
        <stop offset="100%" stopColor="#0369A1" />
      </linearGradient>
      <linearGradient id="fl3d_mail_flap" x1="4" y1="8" x2="28" y2="20" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="100%" stopColor="#2563EB" />
      </linearGradient>
      <linearGradient id="fl3d_mail_cal_top" x1="16" y1="14" x2="28" y2="18" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#EF4444" />
        <stop offset="100%" stopColor="#DC2626" />
      </linearGradient>
      <filter id="fl3d_mail_shadow" x="-15%" y="-15%" width="130%" height="130%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" floodColor="#000" floodOpacity="0.25" />
      </filter>
      <filter id="fl3d_cal_badge_shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0.5" dy="1.5" stdDeviation="1" floodColor="#000" floodOpacity="0.3" />
      </filter>
    </defs>
    <g filter="url(#fl3d_mail_shadow)">
      {/* Envelope Back & Body */}
      <rect x="4" y="8" width="24" height="17" rx="3" fill="url(#fl3d_mail_body)" />
      {/* Envelope Flap Fold Lines */}
      <path d="M4 8.5L16 17.5L28 8.5" fill="none" stroke="#BAE6FD" strokeWidth="1.2" opacity="0.6" />
      <path d="M4 24.5L12 17.5" stroke="#075985" strokeWidth="1" opacity="0.4" />
      <path d="M28 24.5L20 17.5" stroke="#075985" strokeWidth="1" opacity="0.4" />
      <path d="M4 9C4 7.9 4.9 7 6 7H26C27.1 7 28 7.9 28 9L16 18L4 9Z" fill="url(#fl3d_mail_flap)" opacity="0.9" />
    </g>
    {/* Mini Calendar Badge overlay bottom right */}
    <g filter="url(#fl3d_cal_badge_shadow)">
      <rect x="17" y="15" width="12" height="12" rx="2.5" fill="#FFFFFF" />
      <path d="M17 17.5C17 16.1 18.1 15 19.5 15H26.5C27.9 15 29 16.1 29 17.5V18.5H17V17.5Z" fill="url(#fl3d_mail_cal_top)" />
      <rect x="19.5" y="21" width="2" height="2" rx="0.5" fill="#3B82F6" />
      <rect x="23.5" y="21" width="2" height="2" rx="0.5" fill="#94A3B8" />
      <rect x="19.5" y="24" width="2" height="2" rx="0.5" fill="#94A3B8" />
      <rect x="23.5" y="24" width="2" height="2" rx="0.5" fill="#94A3B8" />
    </g>
  </svg>
);


