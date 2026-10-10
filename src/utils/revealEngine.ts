/**
 * Windows Fluent Design Global Reveal Highlight Engine
 * 
 * Provides app-wide 60/120fps hardware-accelerated Reveal Highlight:
 * 1. Surface Fill Illumination: Soft radial spotlight following cursor or finger touch.
 * 2. Border Reveal Illumination: Concentrated border illumination focused right where the pointer is.
 * 3. Proximity Sibling Illumination: Neighboring items illuminate adjacent borders as cursor/finger approaches.
 * 4. Full Touch & Finger Support: When dragging or moving finger across sidebar and app items,
 *    dynamically detects elements via elementFromPoint and illuminates them.
 * 5. Applied on all cards, banners, channel boxes, settings page cards/sections, and tags.
 * 
 * Zero React re-renders, fully decoupled.
 */

let isInitialized = false;
const activeElements = new Set<HTMLElement>();
const activeSiblings = new Set<HTMLElement>();

function isRevealCandidate(node: HTMLElement): boolean {
  if (node.classList.contains('no-reveal')) return false;

  const id = node.id || '';
  const className = typeof node.className === 'string' ? node.className : '';

  return (
    node.classList.contains('fluent-reveal-item') ||
    node.classList.contains('reveal-item') ||
    node.classList.contains('reveal-target') ||
    node.classList.contains('channel-card') ||
    node.classList.contains('news-card') ||
    node.classList.contains('sidebar-nav-item') ||
    node.classList.contains('banner-card') ||
    node.classList.contains('hero-carousel-slide') ||
    node.classList.contains('setting-card') ||
    node.classList.contains('settings-fluent-group') ||
    className.includes('card') ||
    id.startsWith('channel-card-') ||
    id.startsWith('home-channel-card-') ||
    id.startsWith('livetv-channel-card-') ||
    id.startsWith('recommended-channel-') ||
    id.startsWith('hero-carousel-slide-') ||
    id.startsWith('settings-section-') ||
    id.startsWith('settings-category-') ||
    id.startsWith('setting-') ||
    id.startsWith('home-about-') ||
    id.startsWith('news-card-') ||
    node.classList.contains('floaty-bar__item') ||
    node.classList.contains('glass-player-btn') ||
    node.classList.contains('video-player-glass-btn') ||
    node.classList.contains('onair-card') ||
    node.classList.contains('category-pill') ||
    node.tagName === 'BUTTON' ||
    node.getAttribute('role') === 'button' ||
    node.tagName === 'INPUT' ||
    (node.tagName === 'A' && node.classList.contains('cursor-default'))
  );
}

export function initGlobalRevealEngine(): () => void {
  if (typeof window === 'undefined' || isInitialized) {
    return () => {};
  }

  isInitialized = true;

  const updateCoordinates = (clientX: number, clientY: number) => {
    const currentHovered = new Set<HTMLElement>();
    const currentSiblings = new Set<HTMLElement>();

    // 1. Find direct element under pointer/finger
    const hitNode = document.elementFromPoint(clientX, clientY) as HTMLElement | null;

    let node: HTMLElement | null = hitNode;
    while (node && node !== document.body && node !== document.documentElement) {
      if (isRevealCandidate(node)) {
        currentHovered.add(node);
      }
      node = node.parentElement;
    }

    // 2. Illuminate direct hovered elements
    currentHovered.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const x = Math.round(clientX - rect.left);
      const y = Math.round(clientY - rect.top);

      el.style.setProperty('--reveal-x', `${x}px`);
      el.style.setProperty('--reveal-y', `${y}px`);
      el.style.setProperty('--reveal-opacity', '1');
      el.style.setProperty('--reveal-border-opacity', '1');
      activeElements.add(el);

      // Check siblings if element is in a list or group (sidebar, card grids, tab bars)
      const parent = el.parentElement;
      if (
        parent &&
        (parent.classList.contains('reveal-group') ||
          parent.classList.contains('space-y-0.5') ||
          parent.classList.contains('space-y-1') ||
          parent.classList.contains('grid') ||
          parent.classList.contains('flex') ||
          parent.id === 'waves-desktop-sidebar' ||
          parent.closest('#waves-desktop-sidebar') ||
          parent.closest('#waves-mobile-sidebar') ||
          parent.closest('#settings-section-version') ||
          parent.closest('.settings-fluent-group'))
      ) {
        const siblings = parent.children;
        const maxDist = 110;
        for (let i = 0; i < siblings.length; i++) {
          const sib = siblings[i] as HTMLElement;
          if (sib !== el && isRevealCandidate(sib)) {
            const sibRect = sib.getBoundingClientRect();
            const dx = Math.max(sibRect.left - clientX, 0, clientX - sibRect.right);
            const dy = Math.max(sibRect.top - clientY, 0, clientY - sibRect.bottom);
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < maxDist) {
              const sibX = Math.round(clientX - sibRect.left);
              const sibY = Math.round(clientY - sibRect.top);
              sib.style.setProperty('--reveal-x', `${sibX}px`);
              sib.style.setProperty('--reveal-y', `${sibY}px`);
              const borderOpacity = Math.max(0, (1 - dist / maxDist) * 0.9).toFixed(2);
              sib.style.setProperty('--reveal-border-opacity', borderOpacity);
              currentSiblings.add(sib);
            }
          }
        }
      }
    });

    // 3. Clear elements that are no longer hovered
    activeElements.forEach((el) => {
      if (!currentHovered.has(el)) {
        el.style.setProperty('--reveal-opacity', '0');
        el.style.setProperty('--reveal-border-opacity', '0');
        activeElements.delete(el);
      }
    });

    // 4. Clear siblings that are out of range
    activeSiblings.forEach((el) => {
      if (!currentSiblings.has(el)) {
        el.style.setProperty('--reveal-border-opacity', '0');
        activeSiblings.delete(el);
      }
    });

    currentSiblings.forEach((el) => activeSiblings.add(el));
  };

  const clearAllHighlights = () => {
    activeElements.forEach((el) => {
      el.style.setProperty('--reveal-opacity', '0');
      el.style.setProperty('--reveal-border-opacity', '0');
    });
    activeElements.clear();

    activeSiblings.forEach((el) => {
      el.style.setProperty('--reveal-border-opacity', '0');
    });
    activeSiblings.clear();
  };

  // Pointer events (Mouse & Stylus & Touch)
  const handlePointerMove = (e: PointerEvent) => {
    updateCoordinates(e.clientX, e.clientY);
  };

  const handlePointerDown = (e: PointerEvent) => {
    updateCoordinates(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    clearAllHighlights();
  };

  // Touch events (Finger moving on mobile screen or touchscreen)
  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches && e.touches.length > 0) {
      const touch = e.touches[0];
      updateCoordinates(touch.clientX, touch.clientY);
    }
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches && e.touches.length > 0) {
      const touch = e.touches[0];
      updateCoordinates(touch.clientX, touch.clientY);
    }
  };

  const handleTouchEnd = () => {
    clearAllHighlights();
  };

  // Register listeners
  window.addEventListener('pointermove', handlePointerMove, { passive: true });
  window.addEventListener('pointerdown', handlePointerDown, { passive: true });
  window.addEventListener('pointerup', handlePointerUp, { passive: true });
  window.addEventListener('pointercancel', handlePointerUp, { passive: true });

  window.addEventListener('touchmove', handleTouchMove, { passive: true });
  window.addEventListener('touchstart', handleTouchStart, { passive: true });
  window.addEventListener('touchend', handleTouchEnd, { passive: true });
  window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

  document.addEventListener('pointerleave', clearAllHighlights, { passive: true });
  window.addEventListener('blur', clearAllHighlights);

  return () => {
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerdown', handlePointerDown);
    window.removeEventListener('pointerup', handlePointerUp);
    window.removeEventListener('pointercancel', handlePointerUp);

    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchstart', handleTouchStart);
    window.removeEventListener('touchend', handleTouchEnd);
    window.removeEventListener('touchcancel', handleTouchEnd);

    document.removeEventListener('pointerleave', clearAllHighlights);
    window.removeEventListener('blur', clearAllHighlights);
    isInitialized = false;
  };
}
