import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera as CameraIcon, 
  RotateCw, 
  Timer, 
  Grid3X3, 
  Sparkles, 
  Lock, 
  Folder, 
  ExternalLink, 
  Check, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Sliders, 
  ChevronRight,
  ShieldAlert,
  KeyRound,
  RefreshCw,
  Video,
  Image as ImageIcon
} from 'lucide-react';
import { galleryDB, GalleryMediaItem, GalleryFolder } from '../services/galleryStorage';
import { UnderConstructionModal } from '../components/UnderConstructionModal';
import { useSettings } from '../hooks/useSettings';
import { showAppToast } from '../utils/toast';
import { CAMERA_ICON_URL } from '../components/FluentIcons';

interface CameraProps {
  navigate: (route: string, state?: any) => void;
}

type AspectRatio = '16:9' | '4:3' | '1:1';
type GridMode = 'off' | 'rule_of_thirds' | 'golden_ratio';
type CameraFilter = 'none' | 'vivid' | 'mono' | 'warm' | 'cool' | 'vintage' | 'cyberpunk';

const FILTER_STYLES: Record<CameraFilter, { name: string; css: string }> = {
  none: { name: 'Natural', css: 'none' },
  vivid: { name: 'Vivid', css: 'saturate(1.4) contrast(1.1)' },
  mono: { name: 'B&W', css: 'grayscale(1) contrast(1.15)' },
  warm: { name: 'Warm', css: 'sepia(0.25) saturate(1.2) hue-rotate(-10deg)' },
  cool: { name: 'Cool', css: 'saturate(1.1) hue-rotate(15deg) brightness(1.05)' },
  vintage: { name: 'Vintage', css: 'sepia(0.4) contrast(0.9) brightness(1.05)' },
  cyberpunk: { name: 'Neon', css: 'hue-rotate(180deg) saturate(1.6) contrast(1.2)' }
};

export const Camera: React.FC<CameraProps> = ({ navigate }) => {
  const { settings } = useSettings();
  const isLightMode = settings.theme === 'light';

  // 1. Password & Lock State (Persisted in sessionStorage)
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('sparkle_camera_unlocked') === 'true';
  });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(() => {
    return sessionStorage.getItem('sparkle_camera_unlocked') !== 'true';
  });

  // 2. Hardware / Stream State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const virtualCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [isVirtualCamera, setIsVirtualCamera] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [streamError, setStreamError] = useState<string | null>(null);

  // 3. Camera Controls & Modes
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [gridMode, setGridMode] = useState<GridMode>('rule_of_thirds');
  const [timerSeconds, setTimerSeconds] = useState<number>(0); // 0 = off, 3, 5, 10
  const [activeFilter, setActiveFilter] = useState<CameraFilter>('none');
  const [isShutterSoundOn, setIsShutterSoundOn] = useState(true);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownValue, setCountdownValue] = useState<number>(0);
  const [isFlashing, setIsFlashing] = useState(false);
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | null>(null);

  // 4. Recent captured photo & Camera Rolls folder
  const [recentCapture, setRecentCapture] = useState<GalleryMediaItem | null>(null);
  const [cameraRollFolder, setCameraRollFolder] = useState<GalleryFolder | null>(null);

  // Web Audio Context for Shutter Sound
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Play realistic synthesized camera shutter sound
  const playShutterSound = useCallback(() => {
    if (!isShutterSoundOn) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Click 1: High frequency tick
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(1400, now);
      osc1.frequency.exponentialRampToValueAtTime(120, now + 0.045);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.045);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.05);

      // Click 2: Mechanical curtain release
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(800, now + 0.05);
      osc2.frequency.exponentialRampToValueAtTime(80, now + 0.12);
      gain2.gain.setValueAtTime(0.25, now + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.13);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.05);
      osc2.stop(now + 0.14);
    } catch (e) {
      console.warn('Audio playback not permitted or supported', e);
    }
  }, [getAudioContext, isShutterSoundOn]);

  // Play countdown beep
  const playCountdownBeep = useCallback((isFinal = false) => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isFinal ? 1200 : 750, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + (isFinal ? 0.25 : 0.1));
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + (isFinal ? 0.26 : 0.11));
    } catch {}
  }, [getAudioContext]);

  // Find or create "Camera Rolls" folder on mount
  useEffect(() => {
    let isCancelled = false;
    const initFolder = async () => {
      try {
        const folders = await galleryDB.getFolders();
        let roll = folders.find(
          (f) => f.name.toLowerCase() === 'camera rolls' || f.name.toLowerCase() === 'camera roll'
        );
        if (!roll) {
          roll = await galleryDB.createFolder('Camera Rolls');
        }
        if (!isCancelled) {
          setCameraRollFolder(roll);
        }

        // Also check if there are existing photos in Camera Rolls for quick preview
        const allItems = await galleryDB.getAll();
        const rollItems = allItems.filter((it) => it.folderId === roll?.id);
        if (rollItems.length > 0 && !isCancelled) {
          setRecentCapture(rollItems[0]);
        }
      } catch (e) {
        console.error('Failed to init Camera Rolls folder', e);
      }
    };

    initFolder();
    return () => {
      isCancelled = true;
    };
  }, []);

  // Initialize or start webcam stream
  const startCamera = useCallback(async () => {
    if (!isUnlocked) return;
    setStreamError(null);

    // Stop existing stream if any
    if (videoRef.current && videoRef.current.srcObject) {
      const oldStream = videoRef.current.srcObject as MediaStream;
      oldStream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(console.error);
        };
      }
      setIsStreamActive(true);
      setIsVirtualCamera(false);
    } catch (err: any) {
      console.warn('Physical camera unavailable, activating Virtual Camera mode:', err);
      setIsStreamActive(false);
      setIsVirtualCamera(true);
      setStreamError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Using Virtual Camera simulation.'
          : 'No camera hardware found or access blocked. Using Virtual Camera simulation.'
      );
    }
  }, [facingMode, isUnlocked]);

  // Handle stream lifecycle when unlocked
  useEffect(() => {
    if (isUnlocked) {
      startCamera();
    }
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isUnlocked, startCamera]);

  // Render Virtual Camera scenic animation on Canvas when physical webcam is unavailable
  useEffect(() => {
    if (!isVirtualCamera || !isUnlocked) return;
    const canvas = virtualCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frameCount = 0;

    const render = () => {
      frameCount++;
      const w = canvas.width;
      const h = canvas.height;

      // Dynamic scenic landscape with horizon & animated sun/particles
      const gradient = ctx.createLinearGradient(0, 0, 0, h);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(0.5, '#1e293b');
      gradient.addColorStop(0.75, '#334155');
      gradient.addColorStop(1, '#020617');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // Glowing sun/orb
      const orbX = w * 0.5 + Math.sin(frameCount * 0.01) * 40;
      const orbY = h * 0.38 + Math.cos(frameCount * 0.015) * 15;
      const orbGrad = ctx.createRadialGradient(orbX, orbY, 10, orbX, orbY, 160);
      orbGrad.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
      orbGrad.addColorStop(0.3, 'rgba(14, 165, 233, 0.45)');
      orbGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(orbX, orbY, 160, 0, Math.PI * 2);
      ctx.fill();

      // Cyber Grid / Landscape lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 1;
      const horizonY = h * 0.62;
      for (let i = -10; i <= 10; i++) {
        ctx.beginPath();
        ctx.moveTo(w * 0.5 + i * 20, horizonY);
        ctx.lineTo(w * 0.5 + i * 180, h);
        ctx.stroke();
      }
      for (let y = horizonY; y < h; y += 22) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Animated floating cyber crystals / particles
      for (let i = 0; i < 18; i++) {
        const px = (Math.sin(frameCount * 0.01 + i * 1.5) * 0.5 + 0.5) * w;
        const py = (Math.cos(frameCount * 0.012 + i * 2.1) * 0.4 + 0.45) * h;
        const size = (Math.sin(frameCount * 0.03 + i) + 1.5) * 3;
        ctx.fillStyle = i % 2 === 0 ? 'rgba(56, 189, 248, 0.7)' : 'rgba(236, 72, 153, 0.7)';
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Center subject silhouette (Simulated human subject in viewfinder)
      const centerX = w * 0.5;
      const centerY = h * 0.55;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      // Head
      ctx.beginPath();
      ctx.arc(centerX, centerY - 60, 36, 0, Math.PI * 2);
      ctx.fill();
      // Shoulders / torso
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + 30, 85, 60, 0, 0, Math.PI * 2);
      ctx.fill();

      // Virtual tracking reticle box around subject
      const boxSize = 180 + Math.sin(frameCount * 0.04) * 4;
      const bx = centerX - boxSize / 2;
      const by = centerY - 100;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
      ctx.lineWidth = 1.5;
      const corner = 20;

      // Draw 4 corners
      // Top-Left
      ctx.beginPath();
      ctx.moveTo(bx, by + corner);
      ctx.lineTo(bx, by);
      ctx.lineTo(bx + corner, by);
      ctx.stroke();
      // Top-Right
      ctx.beginPath();
      ctx.moveTo(bx + boxSize - corner, by);
      ctx.lineTo(bx + boxSize, by);
      ctx.lineTo(bx + boxSize, by + corner);
      ctx.stroke();
      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(bx, by + boxSize - corner);
      ctx.lineTo(bx, by + boxSize);
      ctx.lineTo(bx + corner, by + boxSize);
      ctx.stroke();
      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(bx + boxSize - corner, by + boxSize);
      ctx.lineTo(bx + boxSize, by + boxSize);
      ctx.lineTo(bx + boxSize, by + boxSize - corner);
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isVirtualCamera, isUnlocked]);

  // Focus tap effect
  const handleViewfinderClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setFocusPoint({ x, y });
    setTimeout(() => {
      setFocusPoint(null);
    }, 1200);
  };

  // Perform the capture and save to Gallery -> Camera Rolls folder
  const executeCapture = async () => {
    setIsFlashing(true);
    playShutterSound();
    setTimeout(() => setIsFlashing(false), 160);

    try {
      // 1. Prepare target offscreen canvas
      const offscreen = document.createElement('canvas');
      let sourceWidth = 1920;
      let sourceHeight = 1080;

      if (aspectRatio === '4:3') {
        sourceWidth = 1440;
        sourceHeight = 1080;
      } else if (aspectRatio === '1:1') {
        sourceWidth = 1080;
        sourceHeight = 1080;
      }

      offscreen.width = sourceWidth;
      offscreen.height = sourceHeight;
      const ctx = offscreen.getContext('2d');
      if (!ctx) return;

      // Apply active filter CSS to 2D context
      if (activeFilter !== 'none') {
        ctx.filter = FILTER_STYLES[activeFilter].css;
      }

      if (isStreamActive && videoRef.current && videoRef.current.videoWidth > 0) {
        const v = videoRef.current;
        // Crop / draw video according to selected aspect ratio
        const vWidth = v.videoWidth;
        const vHeight = v.videoHeight;
        let cropW = vWidth;
        let cropH = vHeight;

        if (aspectRatio === '1:1') {
          cropW = Math.min(vWidth, vHeight);
          cropH = cropW;
        } else if (aspectRatio === '4:3') {
          cropW = (vHeight * 4) / 3;
          cropH = vHeight;
          if (cropW > vWidth) {
            cropW = vWidth;
            cropH = (vWidth * 3) / 4;
          }
        }

        const cropX = (vWidth - cropW) / 2;
        const cropY = (vHeight - cropH) / 2;

        if (facingMode === 'user') {
          // Mirror front camera
          ctx.translate(sourceWidth, 0);
          ctx.scale(-1, 1);
        }

        ctx.drawImage(v, cropX, cropY, cropW, cropH, 0, 0, sourceWidth, sourceHeight);
      } else if (virtualCanvasRef.current) {
        // Draw virtual camera canvas
        const vc = virtualCanvasRef.current;
        ctx.drawImage(vc, 0, 0, vc.width, vc.height, 0, 0, sourceWidth, sourceHeight);
      } else {
        // Fallback procedural placeholder
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, sourceWidth, sourceHeight);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('WIN_CAMERA_PRO', sourceWidth / 2, sourceHeight / 2);
      }

      // Reset filter
      ctx.filter = 'none';

      // 2. Generate JPEG Blob and Data URL
      const dataUrl = offscreen.toDataURL('image/jpeg', 0.95);
      const blob: Blob = await new Promise((resolve) => {
        offscreen.toBlob((b) => resolve(b || new Blob()), 'image/jpeg', 0.95);
      });

      // 3. Ensure "Camera Rolls" folder exists
      let targetFolder = cameraRollFolder;
      if (!targetFolder) {
        const folders = await galleryDB.getFolders();
        let found = folders.find(
          (f) => f.name.toLowerCase() === 'camera rolls' || f.name.toLowerCase() === 'camera roll'
        );
        if (!found) {
          found = await galleryDB.createFolder('Camera Rolls');
        }
        targetFolder = found;
        setCameraRollFolder(found);
      }

      // 4. Create standard Windows Camera filename: WIN_YYYYMMDD_HHMMSS_Pro.jpg
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
      const timeStr = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      const fileName = `WIN_${dateStr}_${timeStr}_Pro.jpg`;

      const newItem: GalleryMediaItem = {
        id: `camera-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: fileName,
        type: 'image',
        url: dataUrl,
        blobData: blob,
        thumbnailUrl: dataUrl,
        mimeType: 'image/jpeg',
        size: blob.size,
        dateAdded: now.toISOString(),
        dateLabel: now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        year: now.getFullYear(),
        dimensions: { width: sourceWidth, height: sourceHeight },
        aspectRatio: sourceWidth / sourceHeight,
        isFavorite: false,
        tags: ['Camera', 'Camera Rolls', 'Photo', activeFilter !== 'none' ? activeFilter : 'Natural'],
        description: `Captured with Sparkle Camera (${sourceWidth}x${sourceHeight}).`,
        source: 'upload',
        folderId: targetFolder ? targetFolder.id : null
      };

      // 5. Save to Gallery IndexedDB
      await galleryDB.add(newItem);
      setRecentCapture(newItem);
      showAppToast(`Photo saved to "Camera Rolls" in Gallery`);
    } catch (err) {
      console.error('Failed to capture photo', err);
      showAppToast('Failed to save photo');
    }
  };

  // Trigger capture with optional timer countdown
  const handleTakeShutter = () => {
    if (isCountingDown) return;

    if (timerSeconds === 0) {
      executeCapture();
      return;
    }

    // Countdown flow
    setIsCountingDown(true);
    setCountdownValue(timerSeconds);
    playCountdownBeep(false);

    let current = timerSeconds;
    const interval = setInterval(() => {
      current--;
      if (current > 0) {
        setCountdownValue(current);
        playCountdownBeep(false);
      } else {
        clearInterval(interval);
        setIsCountingDown(false);
        playCountdownBeep(true);
        executeCapture();
      }
    }, 1000);
  };

  // Cycle aspect ratio
  const handleCycleAspectRatio = () => {
    if (aspectRatio === '16:9') setAspectRatio('4:3');
    else if (aspectRatio === '4:3') setAspectRatio('1:1');
    else setAspectRatio('16:9');
  };

  // Cycle grid
  const handleCycleGrid = () => {
    if (gridMode === 'off') setGridMode('rule_of_thirds');
    else if (gridMode === 'rule_of_thirds') setGridMode('golden_ratio');
    else setGridMode('off');
  };

  // Cycle timer
  const handleCycleTimer = () => {
    if (timerSeconds === 0) setTimerSeconds(3);
    else if (timerSeconds === 3) setTimerSeconds(5);
    else if (timerSeconds === 5) setTimerSeconds(10);
    else setTimerSeconds(0);
  };

  // Flip camera
  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Lock feature again (to test the Under construction modal)
  const handleLockFeature = () => {
    sessionStorage.removeItem('sparkle_camera_unlocked');
    setIsUnlocked(false);
    setIsModalOpen(true);
  };

  return (
    <div 
      id="camera-page"
      className={`relative w-full h-full flex flex-col select-none overflow-hidden font-sans transition-colors ${
        isLightMode ? 'bg-[#f3f3f3] text-[#111827]' : 'bg-[#18181b] text-white'
      }`}
    >
      {/* Flash Effect Overlay */}
      <AnimatePresence>
        {isFlashing && (
          <motion.div
            initial={{ opacity: 0.95 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="fixed inset-0 z-9999 bg-white pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Under Construction Modal Dialog */}
      <UnderConstructionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Under construction"
        description="Camera application is currently in Insider Preview development. Enter the developer passcode to unlock full camera capabilities and save photos directly to your Camera Rolls gallery."
        buttonText={isUnlocked ? "Close" : "Understood"}
        requirePassword={!isUnlocked}
        expectedPassword="camera"
        onUnlockSuccess={() => {
          setIsUnlocked(true);
          sessionStorage.setItem('sparkle_camera_unlocked', 'true');
          showAppToast('Camera feature unlocked successfully');
        }}
      />

      {/* 1. If Locked: Clean WinUI 3 Locked Card Screen */}
      {!isUnlocked ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-[460px] p-8 rounded-[12px] border shadow-xl flex flex-col items-center gap-5 ${
              isLightMode 
                ? 'bg-white border-black/10 shadow-black/5' 
                : 'bg-[#202020] border-white/10 shadow-black/40'
            }`}
          >
            {/* Camera WinUI 3 Icon */}
            <div className="relative">
              <img
                src={CAMERA_ICON_URL}
                alt="Camera"
                referrerPolicy="no-referrer"
                className="w-20 h-20 object-contain drop-shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#0078d4] dark:bg-[#4cc2ff] flex items-center justify-center text-white dark:text-black shadow-md border-2 border-white dark:border-[#202020]">
                <Lock className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-2">
                <span>Insider Preview · Under construction</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight">Camera App</h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
                This feature is under active development. Enter the developer passcode to unlock the viewfinder, shutter controls, and direct Camera Rolls gallery integration.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:flex-1 h-9 rounded-[6px] bg-[#0078d4] dark:bg-[#4cc2ff] hover:bg-[#106ebe] dark:hover:bg-[#6bd0ff] active:bg-[#005a9e] dark:active:bg-[#3bb2ef] text-white dark:text-black font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Enter Passcode</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full sm:w-auto px-4 h-9 rounded-[6px] bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-xs font-medium transition-colors cursor-pointer"
              >
                Back to Home
              </button>
            </div>
          </motion.div>
        </div>
      ) : (
        /* 2. Unlocked: Full Native-grade WinUI 3 Camera Experience */
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Top WinUI 3 Camera Ribbon */}
          <header className={`h-12 px-4 flex items-center justify-between border-b shrink-0 z-20 backdrop-blur-md ${
            isLightMode 
              ? 'bg-white/80 border-black/[0.08]' 
              : 'bg-[#202020]/80 border-white/[0.08]'
          }`}>
            {/* Left: App Title and Status */}
            <div className="flex items-center gap-2.5">
              <img
                src={CAMERA_ICON_URL}
                alt="Camera"
                referrerPolicy="no-referrer"
                className="w-5 h-5 object-contain"
              />
              <span className="font-semibold text-xs tracking-tight">Camera</span>
              {isVirtualCamera ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400 font-medium">
                  Virtual Camera
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-medium">
                  Live View
                </span>
              )}
            </div>

            {/* Center Quick Tool Icons */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Aspect Ratio Toggle */}
              <button
                type="button"
                onClick={handleCycleAspectRatio}
                title={`Aspect Ratio: ${aspectRatio}`}
                className="h-8 px-2.5 rounded-[5px] text-xs font-medium hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Maximize className="w-3.5 h-3.5" />
                <span className="font-mono text-[11px]">{aspectRatio}</span>
              </button>

              {/* Grid Toggle */}
              <button
                type="button"
                onClick={handleCycleGrid}
                title={`Framing Grid: ${gridMode}`}
                className={`w-8 h-8 rounded-[5px] flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer ${
                  gridMode !== 'off' ? 'text-[#0078d4] dark:text-[#4cc2ff]' : 'text-neutral-500 dark:text-neutral-400'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>

              {/* Timer Toggle */}
              <button
                type="button"
                onClick={handleCycleTimer}
                title={`Shutter Timer: ${timerSeconds === 0 ? 'Off' : `${timerSeconds}s`}`}
                className={`h-8 px-2 rounded-[5px] flex items-center gap-1 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer ${
                  timerSeconds > 0 ? 'text-[#0078d4] dark:text-[#4cc2ff]' : 'text-neutral-500 dark:text-neutral-400'
                }`}
              >
                <Timer className="w-4 h-4" />
                {timerSeconds > 0 && <span className="text-[11px] font-mono font-bold">{timerSeconds}s</span>}
              </button>

              {/* Shutter Sound Mute Toggle */}
              <button
                type="button"
                onClick={() => setIsShutterSoundOn(!isShutterSoundOn)}
                title={`Shutter Sound: ${isShutterSoundOn ? 'On' : 'Off'}`}
                className="w-8 h-8 rounded-[5px] flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-400 transition-colors cursor-pointer"
              >
                {isShutterSoundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Flip camera */}
              <button
                type="button"
                onClick={handleFlipCamera}
                title="Switch Camera (Front / Rear)"
                className="w-8 h-8 rounded-[5px] flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-400 transition-colors cursor-pointer"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Gallery Shortcut & Re-lock */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  if (cameraRollFolder) {
                    navigate('/gallery', { folderId: cameraRollFolder.id });
                  } else {
                    navigate('/gallery');
                  }
                }}
                title="Open Camera Rolls in Gallery"
                className="h-8 px-2.5 rounded-[5px] text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Folder className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Camera Rolls</span>
              </button>

              <button
                type="button"
                onClick={handleLockFeature}
                title="Re-lock feature with Under construction modal"
                className="h-8 w-8 rounded-[5px] text-neutral-400 hover:text-amber-500 hover:bg-amber-500/10 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            </div>
          </header>

          {/* Filter Preset Chips Bar */}
          <div className={`h-8 px-4 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 border-b text-xs ${
            isLightMode ? 'bg-[#fafafa] border-black/[0.05]' : 'bg-[#1c1c1f] border-white/[0.05]'
          }`}>
            <span className="text-[11px] text-neutral-400 font-medium shrink-0">Filters:</span>
            {(Object.keys(FILTER_STYLES) as CameraFilter[]).map((filterKey) => (
              <button
                key={filterKey}
                type="button"
                onClick={() => setActiveFilter(filterKey)}
                className={`px-2.5 py-0.5 rounded-[4px] text-[11px] font-medium transition-colors cursor-pointer shrink-0 ${
                  activeFilter === filterKey
                    ? 'bg-[#0078d4] dark:bg-[#4cc2ff] text-white dark:text-black font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/10'
                }`}
              >
                {FILTER_STYLES[filterKey].name}
              </button>
            ))}
          </div>

          {/* Center Main Stage: Viewfinder + Controls Layout */}
          <div className="flex-1 relative flex flex-col md:flex-row overflow-hidden bg-black">
            {/* Viewfinder Viewport */}
            <div 
              className="flex-1 relative flex items-center justify-center overflow-hidden cursor-crosshair"
              onClick={handleViewfinderClick}
            >
              {/* Aspect Ratio Sizing Wrapper */}
              <div 
                className="relative overflow-hidden transition-all duration-200 shadow-2xl flex items-center justify-center bg-black"
                style={{
                  aspectRatio: aspectRatio === '16:9' ? '16/9' : aspectRatio === '4:3' ? '4/3' : '1/1',
                  maxHeight: '100%',
                  maxWidth: '100%',
                  width: aspectRatio === '1:1' ? 'min(75vh, 75vw)' : '100%',
                  height: aspectRatio === '1:1' ? 'min(75vh, 75vw)' : '100%',
                }}
              >
                {/* 1. Hardware Webcam Video element */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    filter: FILTER_STYLES[activeFilter].css,
                    transform: facingMode === 'user' ? 'scaleX(-1)' : 'none'
                  }}
                  className={`w-full h-full object-cover transition-opacity duration-200 ${
                    isStreamActive && !isVirtualCamera ? 'opacity-100' : 'hidden opacity-0'
                  }`}
                />

                {/* 2. Virtual Camera Canvas element */}
                <canvas
                  ref={virtualCanvasRef}
                  width={1920}
                  height={1080}
                  style={{
                    filter: FILTER_STYLES[activeFilter].css
                  }}
                  className={`w-full h-full object-cover ${
                    isVirtualCamera ? 'block' : 'hidden'
                  }`}
                />

                {/* Framing Grid Overlay */}
                {gridMode === 'rule_of_thirds' && (
                  <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 z-10">
                    <div className="border-r border-b border-white/25" />
                    <div className="border-r border-b border-white/25" />
                    <div className="border-b border-white/25" />
                    <div className="border-r border-b border-white/25" />
                    <div className="border-r border-b border-white/25" />
                    <div className="border-b border-white/25" />
                    <div className="border-r border-white/25" />
                    <div className="border-r border-white/25" />
                    <div />
                  </div>
                )}

                {gridMode === 'golden_ratio' && (
                  <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between">
                    <div className="w-full h-[38.2%] border-b border-white/25 flex">
                      <div className="h-full w-[38.2%] border-r border-white/25" />
                      <div className="h-full w-[23.6%] border-r border-white/25" />
                      <div className="h-full flex-1" />
                    </div>
                    <div className="w-full h-[23.6%] border-b border-white/25 flex">
                      <div className="h-full w-[38.2%] border-r border-white/25" />
                      <div className="h-full w-[23.6%] border-r border-white/25" />
                      <div className="h-full flex-1" />
                    </div>
                    <div className="w-full flex-1 flex">
                      <div className="h-full w-[38.2%] border-r border-white/25" />
                      <div className="h-full w-[23.6%] border-r border-white/25" />
                      <div className="h-full flex-1" />
                    </div>
                  </div>
                )}

                {/* Focus Ring Indicator on Tap/Click */}
                <AnimatePresence>
                  {focusPoint && (
                    <motion.div
                      initial={{ scale: 1.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ left: focusPoint.x - 28, top: focusPoint.y - 28 }}
                      className="absolute w-14 h-14 border border-amber-400 rounded-[6px] pointer-events-none z-20 shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                    >
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-amber-400/40" />
                      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-amber-400/40" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Countdown Large Number Overlay */}
                <AnimatePresence>
                  {isCountingDown && (
                    <motion.div
                      key={countdownValue}
                      initial={{ scale: 1.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                    >
                      <div className="w-24 h-24 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border-2 border-white/80 shadow-2xl">
                        <span className="text-white text-5xl font-black font-mono">
                          {countdownValue}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bottom Watermark Overlay */}
                <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 pointer-events-none">
                  <span className="px-2 py-0.5 rounded-[4px] bg-black/50 backdrop-blur-md text-white/90 text-[10px] font-mono font-medium">
                    {aspectRatio} · {activeFilter !== 'none' ? FILTER_STYLES[activeFilter].name : 'Natural'}
                  </span>
                </div>
              </div>
            </div>

            {/* WinUI 3 Camera Controls Sidebar (Right side on Desktop, Bottom bar on Mobile) */}
            <div className={`w-full md:w-28 shrink-0 flex md:flex-col items-center justify-between p-4 z-20 backdrop-blur-xl ${
              isLightMode 
                ? 'bg-white/90 md:border-l border-t md:border-t-0 border-black/10' 
                : 'bg-[#18181b]/95 md:border-l border-t md:border-t-0 border-white/10'
            }`}>
              {/* Top / Left Secondary Action */}
              <div className="flex md:flex-col items-center gap-3">
                {/* Physical Camera Retry button if currently virtual */}
                {isVirtualCamera && (
                  <button
                    type="button"
                    onClick={startCamera}
                    title="Attempt connecting to physical camera"
                    className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Shutter Capture Button - WinUI 3 Fluent Circular Button */}
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  id="btn-camera-shutter"
                  onClick={handleTakeShutter}
                  disabled={isCountingDown}
                  aria-label="Take Photo"
                  className="group relative w-16 h-16 sm:w-18 sm:h-18 rounded-full border-[3px] border-white/90 flex items-center justify-center p-1 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-xl disabled:opacity-50"
                  style={{
                    boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
                  }}
                >
                  {/* Outer glow ring */}
                  <div className="absolute inset-0 rounded-full border border-black/20 pointer-events-none" />

                  {/* Inner capture disk */}
                  <div className="w-full h-full rounded-full bg-white dark:bg-white group-hover:bg-neutral-100 dark:group-hover:bg-neutral-200 group-active:scale-90 transition-all flex items-center justify-center shadow-inner">
                    <CameraIcon className="w-6 h-6 text-neutral-800 shrink-0" />
                  </div>
                </button>
                <span className="text-[11px] font-medium tracking-tight text-neutral-500 dark:text-neutral-400 hidden sm:inline">
                  Photo
                </span>
              </div>

              {/* Bottom / Right: Recent Photo Bubble Preview */}
              <div className="flex md:flex-col items-center gap-2">
                <button
                  type="button"
                  id="btn-camera-recent-preview"
                  onClick={() => {
                    if (recentCapture && cameraRollFolder) {
                      navigate('/gallery', { 
                        folderId: cameraRollFolder.id, 
                        itemId: recentCapture.id 
                      });
                    } else if (cameraRollFolder) {
                      navigate('/gallery', { folderId: cameraRollFolder.id });
                    } else {
                      navigate('/gallery');
                    }
                  }}
                  title={recentCapture ? `View ${recentCapture.title} in Camera Rolls` : 'View Camera Rolls'}
                  className="group relative w-11 h-11 rounded-full overflow-hidden border-2 border-white/60 dark:border-white/30 hover:border-[#0078d4] dark:hover:border-[#4cc2ff] transition-all cursor-pointer shadow-md shrink-0 bg-neutral-800"
                >
                  {recentCapture?.thumbnailUrl || recentCapture?.url ? (
                    <img
                      src={recentCapture.thumbnailUrl || recentCapture.url}
                      alt="Recent capture"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-neutral-700 text-neutral-300">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                  )}

                  {/* Tiny Camera Roll badge */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#0078d4] dark:bg-[#4cc2ff] flex items-center justify-center text-white dark:text-black">
                    <Folder className="w-2.5 h-2.5" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
