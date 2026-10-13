import React from 'react';

interface Fluent3DIconProps {
  className?: string;
  style?: React.CSSProperties;
}

// 1. Home - 3D Microsoft Fluent House
export const Fluent3DHomeIcon: React.FC<Fluent3DIconProps> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} shrink-0`} style={style}>
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
      <linearGradient id="fl3d_home_door" x1="13" y1="18" x2="19" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
      <linearGradient id="fl3d_home_chimney" x1="20" y1="4" x2="25" y2="12" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#F43F5E" />
        <stop offset="100%" stopColor="#BE123C" />
      </linearGradient>
      <filter id="fl3d_home_shadow" x="-10%" y="-10%" width="125%" height="125%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#000" floodOpacity="0.25" />
      </filter>
    </defs>
    {/* Chimney */}
    <rect x="20" y="5" width="4" height="7" rx="1" fill="url(#fl3d_home_chimney)" />
    <rect x="19.5" y="4.5" width="5" height="1.5" rx="0.75" fill="#FDA4AF" />
    {/* House Body */}
    <path d="M7 14.5L16 7L25 14.5V26C25 27.1046 24.1046 28 23 28H9C7.89543 28 7 27.1046 7 26V14.5Z" fill="url(#fl3d_home_body)" filter="url(#fl3d_home_shadow)" />
    {/* 3D Roof */}
    <path d="M3.8 14.4C3.1 15 3.3 16 4.2 16H27.8C28.7 16 28.9 15 28.2 14.4L16.8 4.5C16.4 4.1 15.6 4.1 15.2 4.5L3.8 14.4Z" fill="url(#fl3d_home_roof)" />
    <path d="M16 5.5L5.5 14.8H26.5L16 5.5Z" fill="#7DD3FC" opacity="0.45" />
    {/* Door */}
    <rect x="13" y="19" width="6" height="9" rx="1.5" fill="url(#fl3d_home_door)" />
    <circle cx="17.5" cy="23.5" r="0.75" fill="#FEF3C7" />
    {/* Window */}
    <rect x="9.5" y="16.5" width="3" height="3" rx="0.75" fill="#BAE6FD" opacity="0.9" />
    <rect x="19.5" y="16.5" width="3" height="3" rx="0.75" fill="#BAE6FD" opacity="0.9" />
  </svg>
);

// 2. Articles - 3D Microsoft Fluent News Document
export const Fluent3DArticlesIcon: React.FC<Fluent3DIconProps> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} shrink-0`} style={style}>
    <defs>
      <linearGradient id="fl3d_art_bg" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#E2E8F0" />
      </linearGradient>
      <linearGradient id="fl3d_art_header" x1="7" y1="6" x2="25" y2="13" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
      <linearGradient id="fl3d_art_fold" x1="21" y1="4" x2="27" y2="10" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#94A3B8" />
        <stop offset="100%" stopColor="#CBD5E1" />
      </linearGradient>
      <filter id="fl3d_art_shadow" x="-10%" y="-10%" width="125%" height="125%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#000" floodOpacity="0.2" />
      </filter>
    </defs>
    {/* Paper card */}
    <path d="M6 5.5C6 4.67157 6.67157 4 7.5 4H21L27 10V26.5C27 27.3284 26.3284 28 25.5 28H7.5C6.67157 28 6 27.3284 6 26.5V5.5Z" fill="url(#fl3d_art_bg)" filter="url(#fl3d_art_shadow)" />
    {/* Corner fold */}
    <path d="M21 4V8.5C21 9.32843 21.6716 10 22.5 10H27L21 4Z" fill="url(#fl3d_art_fold)" />
    {/* Header bar */}
    <rect x="8.5" y="7" width="10.5" height="4.5" rx="1.25" fill="url(#fl3d_art_header)" />
    {/* Photo thumbnail box */}
    <rect x="8.5" y="14" width="6" height="5" rx="1" fill="#06B6D4" />
    <circle cx="10" cy="15.5" r="0.75" fill="#E0F2FE" />
    {/* Text Lines */}
    <rect x="16" y="14" width="8.5" height="1.8" rx="0.9" fill="#F43F5E" />
    <rect x="16" y="17" width="6.5" height="1.6" rx="0.8" fill="#3B82F6" />
    <rect x="8.5" y="21" width="16" height="1.6" rx="0.8" fill="#64748B" />
    <rect x="8.5" y="24" width="11" height="1.6" rx="0.8" fill="#94A3B8" />
  </svg>
);

// 3. Updates - 3D Microsoft Sync Arrows
export const Fluent3DUpdatesIcon: React.FC<Fluent3DIconProps> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} shrink-0`} style={style}>
    <defs>
      <linearGradient id="fl3d_up_top" x1="4" y1="4" x2="28" y2="16" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="50%" stopColor="#059669" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
      <linearGradient id="fl3d_up_bot" x1="28" y1="28" x2="4" y2="16" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#38BDF8" />
        <stop offset="50%" stopColor="#0284C7" />
        <stop offset="100%" stopColor="#0369A1" />
      </linearGradient>
      <filter id="fl3d_up_shadow" x="-10%" y="-10%" width="125%" height="125%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#000" floodOpacity="0.22" />
      </filter>
    </defs>
    {/* Upper Green Arrow */}
    <g filter="url(#fl3d_up_shadow)">
      <path d="M7 16C7 11.0294 11.0294 7 16 7C19.1176 7 21.8676 8.58333 23.5 11" stroke="url(#fl3d_up_top)" strokeWidth="3.8" strokeLinecap="round" />
      <path d="M22 6L25.8 11.2L20.2 12.2" fill="url(#fl3d_up_top)" stroke="url(#fl3d_up_top)" strokeWidth="1.2" strokeLinejoin="round" />
    </g>
    {/* Lower Cyan Arrow */}
    <g filter="url(#fl3d_up_shadow)">
      <path d="M25 16C25 20.9706 20.9706 25 16 25C12.8824 25 10.1324 23.4167 8.5 21" stroke="url(#fl3d_up_bot)" strokeWidth="3.8" strokeLinecap="round" />
      <path d="M10 26L6.2 20.8L11.8 19.8" fill="url(#fl3d_up_bot)" stroke="url(#fl3d_up_bot)" strokeWidth="1.2" strokeLinejoin="round" />
    </g>
  </svg>
);

// 4. Watch / Live TV - 3D Microsoft Movies & TV Player
export const Fluent3DWatchIcon: React.FC<Fluent3DIconProps> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} shrink-0`} style={style}>
    <defs>
      <linearGradient id="fl3d_watch_bg" x1="4" y1="5" x2="28" y2="27" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="60%" stopColor="#6D28D9" />
        <stop offset="100%" stopColor="#4C1D95" />
      </linearGradient>
      <linearGradient id="fl3d_watch_clapper" x1="4" y1="4" x2="28" y2="11" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#EC4899" />
        <stop offset="100%" stopColor="#8B5CF6" />
      </linearGradient>
      <filter id="fl3d_watch_shadow" x="-10%" y="-10%" width="125%" height="125%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" floodColor="#000" floodOpacity="0.25" />
      </filter>
    </defs>
    {/* Screen Body */}
    <rect x="4" y="6" width="24" height="20" rx="3.5" fill="url(#fl3d_watch_bg)" filter="url(#fl3d_watch_shadow)" />
    {/* Clapper Top Stripe */}
    <path d="M4 9.5C4 7.567 5.567 6 7.5 6H24.5C26.433 6 28 7.567 28 9.5V10.5H4V9.5Z" fill="url(#fl3d_watch_clapper)" />
    {/* Clapper dashes */}
    <path d="M8 6L6 10.5H8.5L10.5 6H8ZM14 6L12 10.5H14.5L16.5 6H14ZM20 6L18 10.5H20.5L22.5 6H20ZM26 6L24 10.5H26.5L28 7.5V6H26Z" fill="#FFFFFF" opacity="0.85" />
    {/* Play Button Disc */}
    <circle cx="16" cy="18.5" r="4.8" fill="#FFFFFF" fillOpacity="0.2" />
    {/* Triangle Play */}
    <path d="M14.5 15.5L19.2 18.5L14.5 21.5V15.5Z" fill="#FFFFFF" />
  </svg>
);

// 5. Gallery - 3D Microsoft Photos
export const Fluent3DGalleryIcon: React.FC<Fluent3DIconProps> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} shrink-0`} style={style}>
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
);

// 6. Draws - 3D Artist Palette
export const Fluent3DDrawsIcon: React.FC<Fluent3DIconProps> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} shrink-0`} style={style}>
    <defs>
      <linearGradient id="fl3d_draw_palette" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="50%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
      <filter id="fl3d_draw_shadow" x="-10%" y="-10%" width="125%" height="125%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" floodColor="#000" floodOpacity="0.25" />
      </filter>
    </defs>
    {/* Palette Base */}
    <path d="M16 4C9.37258 4 4 9.37258 4 16C4 19.5 5.5 22.5 8 24.5C10 26 11.5 27.5 11.5 28C11.5 28.5 12 28.8 12.5 28.8H14C14.8 28.8 15.5 28 15.5 27C15.5 25.5 17 24 19 24C24.5 24 28 20.5 28 16C28 9.37258 22.6274 4 16 4Z" fill="url(#fl3d_draw_palette)" filter="url(#fl3d_draw_shadow)" />
    {/* Thumb Hole */}
    <ellipse cx="21.5" cy="18.5" rx="2" ry="2.2" fill="#78350F" opacity="0.35" />
    {/* Paint Drops */}
    {/* Red */}
    <circle cx="10" cy="11" r="2.2" fill="#EF4444" />
    <circle cx="9.4" cy="10.2" r="0.6" fill="#FEE2E2" />
    {/* Blue */}
    <circle cx="16" cy="8.5" r="2.2" fill="#3B82F6" />
    <circle cx="15.4" cy="7.7" r="0.6" fill="#EFF6FF" />
    {/* Green */}
    <circle cx="22" cy="11.5" r="2.2" fill="#10B981" />
    <circle cx="21.4" cy="10.7" r="0.6" fill="#ECFDF5" />
    {/* Purple */}
    <circle cx="9" cy="17.5" r="2" fill="#A855F7" />
    <circle cx="8.5" cy="16.8" r="0.5" fill="#FAF5FF" />
  </svg>
);

// 7. Notes - 3D Microsoft OneNote & Pen
export const Fluent3DNotesIcon: React.FC<Fluent3DIconProps> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} shrink-0`} style={style}>
    <defs>
      <linearGradient id="fl3d_note_cover" x1="4" y1="4" x2="26" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#A855F7" />
        <stop offset="60%" stopColor="#7C3AED" />
        <stop offset="100%" stopColor="#5B21B6" />
      </linearGradient>
      <linearGradient id="fl3d_note_pen" x1="16" y1="20" x2="28" y2="8" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#FDE68A" />
      </linearGradient>
      <filter id="fl3d_note_shadow" x="-10%" y="-10%" width="125%" height="125%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#000" floodOpacity="0.25" />
      </filter>
    </defs>
    {/* Notebook Cover */}
    <rect x="5" y="4" width="20" height="24" rx="3" fill="url(#fl3d_note_cover)" filter="url(#fl3d_note_shadow)" />
    {/* Inner Paper */}
    <rect x="8" y="6" width="15.5" height="20" rx="1.5" fill="#FFFFFF" />
    {/* Binding spine */}
    <rect x="5" y="4" width="3" height="24" rx="1.5" fill="#4C1D95" />
    {/* Ruled lines */}
    <rect x="10.5" y="9" width="10.5" height="1.6" rx="0.8" fill="#9333EA" />
    <rect x="10.5" y="13" width="9" height="1.4" rx="0.7" fill="#CBD5E1" />
    <rect x="10.5" y="16.5" width="8" height="1.4" rx="0.7" fill="#CBD5E1" />
    {/* Stylus Pen */}
    <g filter="url(#fl3d_note_shadow)">
      <path d="M28 8L24 4L15 17L14 21L18 20L28 8Z" fill="url(#fl3d_note_pen)" />
      <path d="M14 21L16 19.5L15.5 18L14 21Z" fill="#1E293B" />
      <path d="M25 5L27 7L28 6L26 4L25 5Z" fill="#F43F5E" />
    </g>
  </svg>
);

// 8. VLC - 3D Traffic Cone in Authentic Vibrant VLC Style
export const Fluent3DVlcIcon: React.FC<Fluent3DIconProps> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} shrink-0`} style={style}>
    <defs>
      <linearGradient id="fl3d_vlc_orange" x1="16" y1="3" x2="16" y2="26" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FB923C" />
        <stop offset="50%" stopColor="#F97316" />
        <stop offset="100%" stopColor="#EA580C" />
      </linearGradient>
      <linearGradient id="fl3d_vlc_base" x1="4" y1="24" x2="28" y2="29" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="100%" stopColor="#1E293B" />
      </linearGradient>
      <filter id="fl3d_vlc_shadow" x="-10%" y="-10%" width="125%" height="125%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#000" floodOpacity="0.25" />
      </filter>
    </defs>
    {/* Base Plate */}
    <rect x="4" y="24" width="24" height="4" rx="2" fill="url(#fl3d_vlc_base)" filter="url(#fl3d_vlc_shadow)" />
    {/* Cone Body Base */}
    <path d="M7 24L9.5 18H22.5L25 24H7Z" fill="url(#fl3d_vlc_orange)" />
    {/* Lower White Stripe */}
    <path d="M10.2 16.5H21.8L22.5 18H9.5L10.2 16.5Z" fill="#FFFFFF" />
    {/* Middle Orange Segment */}
    <path d="M11.5 12.5H20.5L21.8 16.5H10.2L11.5 12.5Z" fill="url(#fl3d_vlc_orange)" />
    {/* Upper White Stripe */}
    <path d="M12.8 8.5H19.2L20.5 12.5H11.5L12.8 8.5Z" fill="#FFFFFF" />
    {/* Top Orange Tip */}
    <path d="M14.2 4.2C14.8 2.8 17.2 2.8 17.8 4.2L19.2 8.5H12.8L14.2 4.2Z" fill="url(#fl3d_vlc_orange)" />
    {/* Left 3D Highlight curve */}
    <path d="M14.5 4.5L10 24H8L13.8 4.5H14.5Z" fill="#FFFFFF" opacity="0.3" />
  </svg>
);

// 9. Craftmine - 3D Isometric Minecraft Grass Block
export const Fluent3DCraftmineIcon: React.FC<Fluent3DIconProps> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} shrink-0`} style={style}>
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
      {/* Left Dirt Face */}
      <path d="M4 11.5L16 18.5V28L4 21V11.5Z" fill="url(#fl3d_craft_left)" />
      {/* Right Dirt Face */}
      <path d="M16 18.5L28 11.5V21L16 28V18.5Z" fill="url(#fl3d_craft_right)" />
      {/* Top Grass Face */}
      <path d="M16 4.5L28 11.5L16 18.5L4 11.5L16 4.5Z" fill="url(#fl3d_craft_top)" />
      {/* Left Grass Edge Drops */}
      <path d="M4 11.5L16 18.5V21L13 19.5V20.5L10 18.8V19.8L7 18.1V19L4 17.5V11.5Z" fill="#15803D" />
      {/* Right Grass Edge Drops */}
      <path d="M16 18.5L28 11.5V17.5L25 19V18.1L22 19.8V18.8L19 20.5V19.5L16 21V18.5Z" fill="#16A34A" />
    </g>
  </svg>
);

// 10. Photopea - 3D Vibrant Photopea Tile
export const Fluent3DPhotopeaIcon: React.FC<Fluent3DIconProps> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} shrink-0`} style={style}>
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
    {/* Squircle Tile */}
    <rect x="4" y="4" width="24" height="24" rx="6.5" fill="url(#fl3d_pea_bg)" filter="url(#fl3d_pea_shadow)" />
    <rect x="4.5" y="4.5" width="23" height="10" rx="6" fill="#38BDF8" opacity="0.2" />
    {/* 3D "P" Letter */}
    <path d="M10.5 8.5H17.2C19.851 8.5 22 10.649 22 13.3C22 15.951 19.851 18.1 17.2 18.1H14V23.5H10.5V8.5ZM14 11.5V15.1H17C17.9941 15.1 18.8 14.2941 18.8 13.3C18.8 12.3059 17.9941 11.5 17 11.5H14Z" fill="url(#fl3d_pea_p)" />
    {/* Sparkle star */}
    <circle cx="22" cy="9.5" r="1.5" fill="#FEF08A" />
  </svg>
);

// 11. Discord - 3D Microsoft Fluent Discord Clyde
export const Fluent3DDiscordIcon: React.FC<Fluent3DIconProps> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} shrink-0`} style={style}>
    <defs>
      <linearGradient id="fl3d_dc_bg" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#6366F1" />
        <stop offset="50%" stopColor="#4F46E5" />
        <stop offset="100%" stopColor="#3730A3" />
      </linearGradient>
      <filter id="fl3d_dc_shadow" x="-10%" y="-10%" width="125%" height="125%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" floodColor="#000" floodOpacity="0.28" />
      </filter>
    </defs>
    {/* Squircle base */}
    <rect x="4" y="4" width="24" height="24" rx="6.5" fill="url(#fl3d_dc_bg)" filter="url(#fl3d_dc_shadow)" />
    {/* Top shine */}
    <path d="M7 5H25C26.5 5 27 6 27 7V10L5 10V7C5 6 5.5 5 7 5Z" fill="#818CF8" opacity="0.4" />
    {/* Clyde controller icon */}
    <g filter="url(#fl3d_dc_shadow)">
      <path d="M23.3 11.3C22 10.7 20.6 10.3 19.1 10.1C18.9 10.4 18.7 10.9 18.6 11.2C17 11 15.3 11 13.7 11.2C13.5 10.9 13.3 10.4 13.1 10.1C11.6 10.3 10.2 10.7 8.9 11.3C6.3 15.1 5.6 18.8 6 22.4C7.8 23.7 9.4 24.5 11 25.1C11.4 24.5 11.8 23.9 12.1 23.3C11.5 23.1 10.9 22.8 10.4 22.4C10.5 22.3 10.7 22.2 10.8 22C14.1 23.6 17.9 23.6 21.2 22C21.3 22.2 21.5 22.3 21.6 22.4C21.1 22.8 20.5 23.1 19.9 23.3C20.2 23.9 20.6 24.5 21 25.1C22.6 24.5 24.2 23.7 26 22.4C26.5 18.1 25.3 14.5 23.3 11.3ZM12.7 19.2C11.7 19.2 10.9 18.3 10.9 17.2C10.9 16.1 11.7 15.2 12.7 15.2C13.7 15.2 14.5 16.1 14.5 17.2C14.5 18.3 13.7 19.2 12.7 19.2ZM19.3 19.2C18.3 19.2 17.5 18.3 17.5 17.2C17.5 16.1 18.3 15.2 19.3 15.2C20.3 15.2 21.1 16.1 21.1 17.2C21.1 18.3 20.3 19.2 19.3 19.2Z" fill="#FFFFFF" />
    </g>
  </svg>
);

// 12. Sign In / User - 3D Microsoft Fluent Profile Avatar
export const Fluent3DUserIcon: React.FC<Fluent3DIconProps> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} shrink-0`} style={style}>
    <defs>
      <linearGradient id="fl3d_user_bg" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="60%" stopColor="#2563EB" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
      <linearGradient id="fl3d_user_body" x1="8" y1="18" x2="24" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#E2E8F0" />
      </linearGradient>
      <filter id="fl3d_user_shadow" x="-10%" y="-10%" width="125%" height="125%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" floodColor="#000" floodOpacity="0.25" />
      </filter>
    </defs>
    {/* Circle badge */}
    <circle cx="16" cy="16" r="12" fill="url(#fl3d_user_bg)" filter="url(#fl3d_user_shadow)" />
    {/* Inner rim highlight */}
    <circle cx="16" cy="16" r="11" stroke="#60A5FA" strokeWidth="1" opacity="0.4" />
    {/* Head */}
    <circle cx="16" cy="12" r="4.2" fill="url(#fl3d_user_body)" />
    {/* Shoulders */}
    <path d="M8.5 24C8.5 19.8 11.8 18 16 18C20.2 18 23.5 19.8 23.5 24C23.5 25.2 22.5 26.5 21 26.5H11C9.5 26.5 8.5 25.2 8.5 24Z" fill="url(#fl3d_user_body)" />
  </svg>
);

// 13. Settings - 3D Microsoft Fluent Azure/Metallic Gear
export const Fluent3DSettingsIcon: React.FC<Fluent3DIconProps> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} shrink-0`} style={style}>
    <defs>
      <linearGradient id="fl3d_set_gear" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#38BDF8" />
        <stop offset="50%" stopColor="#0284C7" />
        <stop offset="100%" stopColor="#075985" />
      </linearGradient>
      <linearGradient id="fl3d_set_inner" x1="11" y1="11" x2="21" y2="21" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#0369A1" />
        <stop offset="100%" stopColor="#0C4A6E" />
      </linearGradient>
      <filter id="fl3d_set_shadow" x="-10%" y="-10%" width="125%" height="125%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" floodColor="#000" floodOpacity="0.25" />
      </filter>
    </defs>
    {/* 3D Gear Cogs */}
    <g filter="url(#fl3d_set_shadow)">
      <path d="M14 4H18V7.2C18.7 7.5 19.4 7.9 20 8.4L22.6 6.5L25.4 9.3L23.5 11.9C24 12.5 24.4 13.2 24.7 13.9H28V17.9H24.7C24.4 18.6 24 19.3 23.5 19.9L25.4 22.5L22.6 25.3L20 23.4C19.4 23.9 18.7 24.3 18 24.6V27.8H14V24.6C13.3 24.3 12.6 23.9 12 23.4L9.4 25.3L6.6 22.5L8.5 19.9C8 19.3 7.6 18.6 7.3 17.9H4V13.9H7.3C7.6 13.2 8 12.5 8.5 11.9L6.6 9.3L9.4 6.5L12 8.4C12.6 7.9 13.3 7.5 14 7.2V4Z" fill="url(#fl3d_set_gear)" />
      {/* Outer beveled rim */}
      <circle cx="16" cy="15.9" r="6.8" fill="url(#fl3d_set_inner)" />
      {/* Axle hole */}
      <circle cx="16" cy="15.9" r="3.2" fill="#F8FAFC" opacity="0.9" />
    </g>
  </svg>
);
