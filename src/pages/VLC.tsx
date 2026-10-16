import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  Sliders,
  ListMusic,
  FolderOpen,
  Globe,
  Disc,
  Video as VideoIcon,
  Camera,
  Repeat,
  Repeat1,
  Shuffle,
  Info,
  RotateCcw,
  Upload,
  Download,
  Trash2,
  HelpCircle,
  Check,
  ChevronDown,
  X,
  Settings,
  Sparkles,
  Subtitles,
  ExternalLink,
  Layers,
  Search,
  Music
} from 'lucide-react';
import { FluentVlcIcon } from '../components/FluentIcons';

export interface VlcPlaylistItem {
  id: string;
  title: string;
  artist?: string;
  url: string;
  type: 'video' | 'audio' | 'stream' | 'capture';
  duration?: number;
  format?: string;
  subtitlesUrl?: string;
  aspectRatio?: string;
}

// Built-in high quality sample media collection for VLC
const VLC_DEMO_ITEMS: VlcPlaylistItem[] = [
  {
    id: 'vlc-demo-1',
    title: 'Big Buck Bunny (1080p HD)',
    artist: 'Blender Foundation',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    type: 'video',
    duration: 596,
    format: 'MP4 / H.264',
    aspectRatio: '16:9'
  },
  {
    id: 'vlc-demo-2',
    title: 'Tears of Steel (Sci-Fi VFX)',
    artist: 'Blender VFX Project',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    type: 'video',
    duration: 734,
    format: 'MP4 / H.264',
    aspectRatio: '2.4:1'
  },
  {
    id: 'vlc-demo-3',
    title: 'Sintel Open Animation Movie',
    artist: 'Durian Open Movie',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    type: 'video',
    duration: 888,
    format: 'MP4 / H.264',
    aspectRatio: '16:9'
  },
  {
    id: 'vlc-demo-4',
    title: 'Lofi Chill Hip Hop Odyssey',
    artist: 'VLC Audio Streams',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    type: 'audio',
    duration: 147,
    format: 'MP3 Stereo 320kbps'
  },
  {
    id: 'vlc-demo-5',
    title: 'Cyberpunk Synthwave Electronic',
    artist: 'Retro Beats',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=electronic-future-beats-117997.mp3',
    type: 'audio',
    duration: 165,
    format: 'MP3 Stereo 320kbps'
  },
  {
    id: 'vlc-demo-6',
    title: 'For Bigger Blazes (Action Demo)',
    artist: 'Chromecast Samples',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    type: 'video',
    duration: 15,
    format: 'MP4 / H.264'
  }
];

// Equalizer 10 Frequency Bands (Standard VLC EQ)
const EQ_BANDS = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

// Standard VLC Equalizer Presets
const EQ_PRESETS: Record<string, number[]> = {
  Flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  Rock: [4.8, 3.2, -1.6, -3.2, -1.6, 2.4, 4.0, 5.6, 5.6, 5.6],
  Pop: [-1.6, 1.6, 4.0, 4.8, 3.2, -1.6, -2.4, -2.4, -1.6, -1.6],
  'Full Bass': [7.2, 7.2, 7.2, 4.0, 1.6, -3.2, -6.4, -8.0, -8.8, -8.8],
  'Full Treble': [-8.0, -8.0, -8.0, -4.0, 1.6, 6.4, 8.8, 9.6, 10.4, 11.2],
  Techno: [4.8, 4.0, 1.6, -1.6, -3.2, -1.6, 1.6, 4.8, 5.6, 5.6],
  Classical: [4.8, 4.0, 3.2, 2.4, -1.6, -1.6, 0, 2.4, 3.2, 4.0],
  Jazz: [3.2, 2.4, 1.6, 2.4, -1.6, -1.6, 0, 1.6, 3.2, 4.0],
  Voice: [-2.4, -1.6, 0, 3.2, 4.8, 4.0, 2.4, 0.8, -1.6, -3.2],
  Live: [-3.2, 0, 2.4, 3.2, 3.2, 3.2, 2.4, 1.6, 1.6, 1.6],
  Dance: [6.4, 5.6, 2.4, 0, 1.6, 3.2, 5.6, 5.6, 4.8, 0],
  Party: [5.6, 5.6, 0, 0, 0, 0, 0, 0, 5.6, 5.6],
  Reggae: [0, 0, -0.8, -4.0, 0, 4.0, 4.0, 2.4, 0, 0]
};

interface VLCProps {
  navigate?: (route: string) => void;
}

export const VLC: React.FC<VLCProps> = ({ navigate }) => {
  // Playlist State
  const [playlist, setPlaylist] = useState<VlcPlaylistItem[]>(() => {
    const saved = localStorage.getItem('vone_vlc_playlist');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // Fallback to demo items
      }
    }
    return VLC_DEMO_ITEMS;
  });

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const currentItem = playlist[currentIndex] || null;

  // Media Player State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(100); // 0 to 200% (VLC signature)
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [loopMode, setLoopMode] = useState<'off' | 'all' | 'one'>('all');
  const [isShuffle, setIsShuffle] = useState<boolean>(false);

  // A-B Repeat Loop
  const [loopPointA, setLoopPointA] = useState<number | null>(null);
  const [loopPointB, setLoopPointB] = useState<number | null>(null);

  // UI Panels
  const [isPlaylistOpen, setIsPlaylistOpen] = useState<boolean>(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [playlistSearch, setPlaylistSearch] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isOpenMediaModal, setIsOpenMediaModal] = useState<boolean>(false);
  const [openMediaTab, setOpenMediaTab] = useState<'file' | 'network' | 'disc' | 'capture'>('file');
  const [networkUrlInput, setNetworkUrlInput] = useState<string>('');
  const [discDrive, setDiscDrive] = useState<string>('DVD Drive (D:) - Video Title');
  const [discChapter, setDiscChapter] = useState<number>(1);
  const [captureDeviceType, setCaptureDeviceType] = useState<'camera' | 'screen'>('camera');

  const [isEffectsModalOpen, setIsEffectsModalOpen] = useState<boolean>(false);
  const [effectsTab, setEffectsTab] = useState<'audio' | 'video' | 'sync'>('audio');
  const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState<boolean>(false);

  // Subtitles
  const [subtitles, setSubtitles] = useState<string | null>(null);
  const [subtitleDelayMs, setSubtitleDelayMs] = useState<number>(0);
  const [subtitleSize, setSubtitleSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [isSubtitlesEnabled, setIsSubtitlesEnabled] = useState<boolean>(true);

  // Audio Equalizer State
  const [isEqEnabled, setIsEqEnabled] = useState<boolean>(true);
  const [eqPreset, setEqPreset] = useState<string>('Flat');
  const [preampGain, setPreampGain] = useState<number>(0); // -20dB to +20dB
  const [bandGains, setBandGains] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [stereoMode, setStereoMode] = useState<'stereo' | 'left' | 'right' | 'spatial'>('stereo');
  const [audioDelayMs, setAudioDelayMs] = useState<number>(0);

  // Video Adjustments
  const [videoBrightness, setVideoBrightness] = useState<number>(100); // 0 to 200%
  const [videoContrast, setVideoContrast] = useState<number>(100); // 0 to 200%
  const [videoSaturation, setVideoSaturation] = useState<number>(100); // 0 to 200%
  const [videoHue, setVideoHue] = useState<number>(0); // 0 to 360 deg
  const [videoGamma, setVideoGamma] = useState<number>(1.0); // 0.5 to 2.0
  const [videoRotation, setVideoRotation] = useState<number>(0); // 0, 90, 180, 270 deg
  const [videoFlipH, setVideoFlipH] = useState<boolean>(false);
  const [videoFlipV, setVideoFlipV] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<'default' | '16:9' | '4:3' | '1:1' | '21:9' | 'fill'>('default');

  // DOM Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const subtitleInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  // Web Audio Nodes
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const preampGainNodeRef = useRef<GainNode | null>(null);
  const volumeGainNodeRef = useRef<GainNode | null>(null);
  const filtersRef = useRef<BiquadFilterNode[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Save playlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('vone_vlc_playlist', JSON.stringify(playlist));
    } catch (e) {
      // ignore
    }
  }, [playlist]);

  // Click outside to close menus
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Web Audio API setup for Equalizer and 200% Volume Boost
  const setupAudioGraph = useCallback(() => {
    const video = videoRef.current;
    if (!video || sourceNodeRef.current) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const source = ctx.createMediaElementSource(video);
      sourceNodeRef.current = source;

      // Preamp gain node
      const preamp = ctx.createGain();
      preampGainNodeRef.current = preamp;

      // Master volume gain node (allows boosting up to 200%)
      const masterVol = ctx.createGain();
      masterVol.gain.value = volume / 100;
      volumeGainNodeRef.current = masterVol;

      // 10 BiquadFilter peaking filters
      const filters = EQ_BANDS.map((freq) => {
        const filter = ctx.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = freq;
        filter.Q.value = 1.4;
        filter.gain.value = 0;
        return filter;
      });
      filtersRef.current = filters;

      // Analyser node for audio visualizer
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      // Connect graph: source -> preamp -> filter0 -> ... -> filter9 -> masterVol -> analyser -> destination
      let lastNode: AudioNode = source;
      lastNode.connect(preamp);
      lastNode = preamp;

      filters.forEach((filter) => {
        lastNode.connect(filter);
        lastNode = filter;
      });

      lastNode.connect(masterVol);
      masterVol.connect(analyser);
      analyser.connect(ctx.destination);
    } catch (e) {
      console.warn('Web Audio API initialized with standard output', e);
    }
  }, [volume]);

  // Update Equalizer filters when gains change
  useEffect(() => {
    if (filtersRef.current.length > 0) {
      filtersRef.current.forEach((filter, idx) => {
        const gainVal = isEqEnabled ? bandGains[idx] || 0 : 0;
        filter.gain.setValueAtTime(gainVal, audioContextRef.current?.currentTime || 0);
      });
    }
    if (preampGainNodeRef.current) {
      const pVal = isEqEnabled ? Math.pow(10, preampGain / 20) : 1;
      preampGainNodeRef.current.gain.setValueAtTime(pVal, audioContextRef.current?.currentTime || 0);
    }
  }, [bandGains, preampGain, isEqEnabled]);

  // Update volume (supports 0 to 200%)
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = isMuted;
    }
    if (volumeGainNodeRef.current && audioContextRef.current) {
      const targetGain = isMuted ? 0 : volume / 100;
      volumeGainNodeRef.current.gain.setValueAtTime(targetGain, audioContextRef.current.currentTime);
    } else if (video) {
      video.volume = isMuted ? 0 : Math.min(1.0, volume / 100);
    }
  }, [volume, isMuted]);

  // Play / Pause Handlers
  const handleTogglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
    setupAudioGraph();

    if (video.paused) {
      try {
        await video.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn('Playback error', err);
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  // Next / Prev track
  const handlePlayNext = () => {
    if (playlist.length === 0) return;
    if (isShuffle) {
      const nextIdx = Math.floor(Math.random() * playlist.length);
      setCurrentIndex(nextIdx);
    } else {
      const nextIdx = (currentIndex + 1) % playlist.length;
      setCurrentIndex(nextIdx);
    }
  };

  const handlePlayPrev = () => {
    if (playlist.length === 0) return;
    const prevIdx = (currentIndex - 1 + playlist.length) % playlist.length;
    setCurrentIndex(prevIdx);
  };

  // Play a specific item from playlist
  const handleSelectTrack = (idx: number) => {
    setCurrentIndex(idx);
    setIsPlaying(true);
    setTimeout(() => {
      const video = videoRef.current;
      if (video) {
        setupAudioGraph();
        video.play().catch(() => {});
      }
    }, 50);
  };

  // Seek bar
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  // Step Frame
  const handleStepFrame = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      setIsPlaying(false);
      video.currentTime = Math.min(video.duration || 0, video.currentTime + 1 / 30);
    }
  };

  // Jump forwards / backwards
  const handleJump = (seconds: number) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + seconds));
      showToast(`${seconds > 0 ? '+' : ''}${seconds}s`);
    }
  };

  // A-B Repeat Loop Toggle
  const handleToggleABLoop = () => {
    if (loopPointA === null) {
      setLoopPointA(currentTime);
      showToast(`Point A set at ${formatTime(currentTime)}`);
    } else if (loopPointB === null) {
      if (currentTime > loopPointA) {
        setLoopPointB(currentTime);
        showToast(`Point B set at ${formatTime(currentTime)} (Loop A-B Active)`);
      } else {
        setLoopPointA(currentTime);
        showToast(`Point A updated to ${formatTime(currentTime)}`);
      }
    } else {
      setLoopPointA(null);
      setLoopPointB(null);
      showToast('A-B Repeat cleared');
    }
  };

  // Snapshot (Take Screenshot of video frame)
  const handleTakeSnapshot = () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataUrl;
        const cleanTitle = (currentItem?.title || 'vlc-snapshot').replace(/[^a-z0-9]/gi, '_');
        a.download = `${cleanTitle}_${Math.floor(currentTime)}s.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast('Snapshot captured & saved as PNG');
      }
    } catch (e) {
      showToast('Cannot capture snapshot from this stream due to browser security');
    }
  };

  // Fullscreen toggle
  const handleToggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Picture in Picture
  const handleTogglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      showToast('Picture-in-Picture not supported or active');
    }
  };

  // Speed changer
  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    showToast(`Speed: ${speed}x`);
  };

  // Presets changer for EQ
  const handleSelectEqPreset = (name: string) => {
    setEqPreset(name);
    const preset = EQ_PRESETS[name];
    if (preset) {
      setBandGains([...preset]);
      showToast(`Equalizer: ${name}`);
    }
  };

  // Handle local file uploads
  const handleLocalFileOpen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: VlcPlaylistItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = URL.createObjectURL(file);
      const isAudio = file.type.startsWith('audio/');
      newItems.push({
        id: `local-${Date.now()}-${i}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Local Media',
        url,
        type: isAudio ? 'audio' : 'video',
        format: file.type || (isAudio ? 'Audio' : 'Video')
      });
    }

    setPlaylist((prev) => [...prev, ...newItems]);
    setCurrentIndex(playlist.length); // Play first added item
    setIsPlaying(true);
    setIsOpenMediaModal(false);
    showToast(`Added ${newItems.length} file(s) to playlist`);
  };

  // Load custom subtitle file (.srt / .vtt)
  const handleSubtitleOpen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setSubtitles(text);
      setIsSubtitlesEnabled(true);
      showToast(`Loaded subtitle: ${file.name}`);
    };
    reader.readAsText(file);
  };

  // Open Network Stream URL
  const handleAddNetworkStream = () => {
    if (!networkUrlInput.trim()) return;
    const url = networkUrlInput.trim();
    const isAudio = url.endsWith('.mp3') || url.endsWith('.ogg') || url.endsWith('.aac') || url.includes('radio');
    const isHls = url.includes('.m3u8');
    const newItem: VlcPlaylistItem[] = [
      {
        id: `stream-${Date.now()}`,
        title: url.split('/').pop()?.split('?')[0] || 'Network Stream',
        artist: isHls ? 'HLS Live Stream' : 'Internet Stream',
        url,
        type: isAudio ? 'audio' : 'stream',
        format: isHls ? 'HLS Stream' : 'Network Stream'
      }
    ];

    setPlaylist((prev) => [...prev, ...newItem]);
    setCurrentIndex(playlist.length);
    setIsPlaying(true);
    setNetworkUrlInput('');
    setIsOpenMediaModal(false);
    showToast('Loaded network stream');
  };

  // Simulated Disc / DVD load
  const handleOpenDisc = () => {
    const newItem: VlcPlaylistItem = {
      id: `disc-${Date.now()}`,
      title: `${discDrive} (Chapter ${discChapter})`,
      artist: 'Optical Disc Player',
      url: VLC_DEMO_ITEMS[1].url, // Use high quality cinematic demo for disc simulation
      type: 'video',
      duration: 734,
      format: 'DVD / ISO 1080p'
    };
    setPlaylist((prev) => [...prev, newItem]);
    setCurrentIndex(playlist.length);
    setIsPlaying(true);
    setIsOpenMediaModal(false);
    showToast(`Loaded ${discDrive}`);
  };

  // Open Capture device (Webcam or Screen)
  const handleOpenCaptureDevice = async () => {
    try {
      let stream: MediaStream;
      if (captureDeviceType === 'camera') {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        showToast('Webcam & Microphone capture activated');
      } else {
        stream = await (navigator.mediaDevices as any).getDisplayMedia({ video: true });
        showToast('Screen capture active');
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
      setIsOpenMediaModal(false);
    } catch (err) {
      showToast('Camera/Screen access cancelled or not granted');
    }
  };

  // Export M3U Playlist
  const handleExportPlaylist = () => {
    let m3u = '#EXTM3U\n';
    playlist.forEach((item) => {
      m3u += `#EXTINF:${item.duration || -1},${item.artist ? `${item.artist} - ` : ''}${item.title}\n`;
      m3u += `${item.url}\n`;
    });
    const blob = new Blob([m3u], { type: 'audio/x-mpegurl' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vlc-playlist.m3u';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported playlist as M3U');
  };

  // Audio Spectrum Visualizer Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;
    const renderSpectrum = () => {
      if (!running) return;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const analyser = analyserRef.current;
      if (analyser && isPlaying) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        const barWidth = (width / bufferLength) * 1.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * height * 0.9;
          const gradient = ctx.createLinearGradient(0, height, 0, 0);
          gradient.addColorStop(0, '#f97316');
          gradient.addColorStop(0.5, '#fb923c');
          gradient.addColorStop(1, '#ffedd5');

          ctx.fillStyle = gradient;
          ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
          x += barWidth;
        }
      } else {
        // Idle gentle waveform
        ctx.fillStyle = 'rgba(249, 115, 22, 0.2)';
        ctx.fillRect(0, height - 2, width, 2);
      }

      animFrameIdRef.current = requestAnimationFrame(renderSpectrum);
    };

    renderSpectrum();
    return () => {
      running = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isPlaying]);

  // Video Time Update listener
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);

    // A-B Repeat Loop check
    if (loopPointA !== null && loopPointB !== null) {
      if (video.currentTime >= loopPointB) {
        video.currentTime = loopPointA;
      }
    }
  };

  // Video Ended listener
  const handleEnded = () => {
    if (loopMode === 'one') {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    } else if (loopMode === 'all') {
      handlePlayNext();
    } else {
      setIsPlaying(false);
    }
  };

  // Keyboard Shortcuts (Standard VLC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          handleTogglePlay();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          handleToggleFullscreen();
          break;
        case 's':
        case 'S':
          if (!e.shiftKey) {
            e.preventDefault();
            handleStop();
          } else {
            // Shift + S = Snapshot
            e.preventDefault();
            handleTakeSnapshot();
          }
          break;
        case 'e':
        case 'E':
          e.preventDefault();
          handleStepFrame();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          setIsMuted((prev) => !prev);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleJump(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleJump(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume((v) => Math.min(200, v + 5));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume((v) => Math.max(0, v - 5));
          break;
        case '[':
          e.preventDefault();
          handleSpeedChange(Math.max(0.25, +(playbackRate - 0.1).toFixed(2)));
          break;
        case ']':
          e.preventDefault();
          handleSpeedChange(Math.min(4.0, +(playbackRate + 0.1).toFixed(2)));
          break;
        case '=':
          e.preventDefault();
          handleSpeedChange(1.0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playbackRate, loopPointA, loopPointB, currentTime, playlist, currentIndex]);

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) {
      return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Video Filter Style string
  const videoFilterStyle = useMemo(() => {
    return `brightness(${videoBrightness}%) contrast(${videoContrast}%) saturate(${videoSaturation}%) hue-rotate(${videoHue}deg)`;
  }, [videoBrightness, videoContrast, videoSaturation, videoHue]);

  const videoTransformStyle = useMemo(() => {
    const scaleX = videoFlipH ? -1 : 1;
    const scaleY = videoFlipV ? -1 : 1;
    return `rotate(${videoRotation}deg) scale(${scaleX}, ${scaleY})`;
  }, [videoRotation, videoFlipH, videoFlipV]);

  // Filtered playlist for search
  const filteredPlaylist = useMemo(() => {
    if (!playlistSearch.trim()) return playlist;
    const q = playlistSearch.toLowerCase();
    return playlist.filter((it) => it.title.toLowerCase().includes(q) || it.artist?.toLowerCase().includes(q));
  }, [playlist, playlistSearch]);

  return (
    <div 
      ref={playerContainerRef}
      className="vlc-applet flex flex-col h-full min-h-[82vh] bg-[#f9f9f9] dark:bg-[#18181b] text-[#111827] dark:text-[#f3f4f6] select-none rounded-[10px] overflow-hidden border border-black/10 dark:border-white/10 shadow-sm relative font-sans transition-colors"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-12 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-black/85 dark:bg-black/90 backdrop-blur-md text-white text-xs font-medium border border-orange-500/40 shadow-xl flex items-center gap-2 pointer-events-none"
          >
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. VLC Fluent Menu Bar - Sparkle Design */}
      <div 
        ref={menuContainerRef}
        className="vlc-menu-bar h-9 bg-white/90 dark:bg-[#202024]/90 backdrop-blur-md border-b border-black/10 dark:border-white/10 flex items-center justify-between px-2 text-xs font-normal relative z-40 shrink-0 text-neutral-800 dark:text-neutral-200"
      >
        <div className="flex items-center gap-0.5">
          {/* VLC Cone Branding (Iconic Orange) */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 mr-1 font-semibold text-neutral-900 dark:text-white tracking-tight">
            <FluentVlcIcon className="w-4 h-4" />
            <span className="hidden sm:inline text-[13px] text-orange-500 dark:text-orange-400 font-bold">VLC</span>
          </div>

          {/* Media Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveMenu(activeMenu === 'media' ? null : 'media')}
              className={`px-2.5 py-1 rounded-[4px] hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${
                activeMenu === 'media' ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 font-medium' : 'text-neutral-700 dark:text-neutral-300'
              }`}
            >
              Media
            </button>
            {activeMenu === 'media' && (
              <div className="absolute top-full left-0 mt-1 w-60 bg-white/95 dark:bg-[#25252a]/95 backdrop-blur-xl rounded-[8px] shadow-2xl border border-black/10 dark:border-white/10 py-1 text-xs text-neutral-800 dark:text-neutral-200 z-50">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu(null);
                    fileInputRef.current?.click();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-orange-500 hover:text-white flex items-center justify-between rounded-[4px] transition-colors text-neutral-700 dark:text-neutral-200 group"
                >
                  <span className="flex items-center gap-2">
                    <FolderOpen className="w-3.5 h-3.5 text-orange-500 group-hover:text-white" /> Open File...
                  </span>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 group-hover:text-white/80">Ctrl+O</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu(null);
                    setOpenMediaTab('network');
                    setIsOpenMediaModal(true);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-orange-500 hover:text-white flex items-center justify-between rounded-[4px] transition-colors text-neutral-700 dark:text-neutral-200 group"
                >
                  <span className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-orange-500 group-hover:text-white" /> Open Network Stream...
                  </span>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 group-hover:text-white/80">Ctrl+N</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu(null);
                    setOpenMediaTab('disc');
                    setIsOpenMediaModal(true);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-orange-500 hover:text-white flex items-center justify-between rounded-[4px] transition-colors text-neutral-700 dark:text-neutral-200 group"
                >
                  <span className="flex items-center gap-2">
                    <Disc className="w-3.5 h-3.5 text-orange-500 group-hover:text-white" /> Open Disc...
                  </span>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 group-hover:text-white/80">Ctrl+D</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu(null);
                    setOpenMediaTab('capture');
                    setIsOpenMediaModal(true);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-orange-500 hover:text-white flex items-center justify-between rounded-[4px] transition-colors text-neutral-700 dark:text-neutral-200 group"
                >
                  <span className="flex items-center gap-2">
                    <VideoIcon className="w-3.5 h-3.5 text-orange-500 group-hover:text-white" /> Open Capture Device...
                  </span>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 group-hover:text-white/80">Ctrl+C</span>
                </button>
                <div className="my-1 border-t border-black/10 dark:border-white/10" />
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu(null);
                    setPlaylist(VLC_DEMO_ITEMS);
                    setCurrentIndex(0);
                    showToast('Loaded VLC demo playlist');
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-orange-500 hover:text-white flex items-center gap-2 rounded-[4px] transition-colors text-neutral-700 dark:text-neutral-200 group"
                >
                  <Sparkles className="w-3.5 h-3.5 text-orange-500 group-hover:text-white" /> Load Demo Media Pack
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu(null);
                    handleExportPlaylist();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-orange-500 hover:text-white flex items-center justify-between rounded-[4px] transition-colors text-neutral-700 dark:text-neutral-200 group"
                >
                  <span className="flex items-center gap-2">
                    <Download className="w-3.5 h-3.5 text-orange-500 group-hover:text-white" /> Save Playlist to File...
                  </span>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 group-hover:text-white/80">.m3u</span>
                </button>
              </div>
            )}
          </div>

          {/* Playback Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveMenu(activeMenu === 'playback' ? null : 'playback')}
              className={`px-2.5 py-1 rounded-[4px] hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${
                activeMenu === 'playback' ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 font-medium' : 'text-neutral-700 dark:text-neutral-300'
              }`}
            >
              Playback
            </button>
            {activeMenu === 'playback' && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white/95 dark:bg-[#25252a]/95 backdrop-blur-xl rounded-[8px] shadow-2xl border border-black/10 dark:border-white/10 py-1 text-xs text-neutral-800 dark:text-neutral-200 z-50">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu(null);
                    handleTogglePlay();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-orange-500 hover:text-white flex items-center justify-between rounded-[4px] transition-colors text-neutral-700 dark:text-neutral-200 group"
                >
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 group-hover:text-white/80">Space</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu(null);
                    handleStop();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-orange-500 hover:text-white flex items-center justify-between rounded-[4px] transition-colors text-neutral-700 dark:text-neutral-200 group"
                >
                  <span>Stop</span>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 group-hover:text-white/80">S</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu(null);
                    handlePlayPrev();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-orange-500 hover:text-white rounded-[4px] transition-colors text-neutral-700 dark:text-neutral-200"
                >
                  Previous Track
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu(null);
                    handlePlayNext();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-orange-500 hover:text-white rounded-[4px] transition-colors text-neutral-700 dark:text-neutral-200"
                >
                  Next Track
                </button>
                <div className="my-1 border-t border-black/10 dark:border-white/10" />
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu(null);
                    handleStepFrame();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-orange-500 hover:text-white flex items-center justify-between rounded-[4px] transition-colors text-neutral-700 dark:text-neutral-200 group"
                >
                  <span>Step Forward Frame</span>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 group-hover:text-white/80">E</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu(null);
                    handleToggleABLoop();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-orange-500 hover:text-white flex items-center justify-between rounded-[4px] transition-colors text-neutral-700 dark:text-neutral-200 group"
                >
                  <span>A-B Repeat Loop</span>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 group-hover:text-white/80">
                    {loopPointA !== null && loopPointB !== null ? 'Active' : 'Off'}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Audio Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveMenu(activeMenu === 'audio' ? null : 'audio')}
              className={`px-2.5 py-1 rounded-[4px] hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${
                activeMenu === 'audio' ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 font-medium' : 'text-neutral-700 dark:text-neutral-300'
              }`}
            >
              Audio
            </button>
            {activeMenu === 'audio' && (
              <div className="absolute top-full left-0 mt-1 w-60 bg-white/95 dark:bg-[#25252a]/95 backdrop-blur-xl rounded-[8px] shadow-2xl border border-black/10 dark:border-white/10 py-1 text-xs text-neutral-800 dark:text-neutral-200 z-50">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu(null);
                    setEffectsTab('audio');
                    setIsEffectsModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-orange-500 hover:text-white flex items-center justify-between rounded-[4px] transition-colors text-neutral-700 dark:text-neutral-200 group"
                >
                  <span className="flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-orange-500 group-hover:text-white" /> 10-Band Equalizer...
                  </span>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 group-hover:text-white/80">Ctrl+E</span>
                </button>
                <div className="my-1 border-t border-black/10 dark:border-white/10" />
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu(null);
                    setVolume(100);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-orange-500 hover:text-white rounded-[4px] transition-colors text-neutral-700 dark:text-neutral-200"
                >
                  Reset Volume to 100%
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu(null);
                    setVolume(200);
                    showToast('VLC Volume boosted to 200% maximum!');
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-orange-500 hover:text-white font-semibold text-orange-500 dark:text-orange-400 group-hover:text-white rounded-[4px] transition-colors"
                >
                  Boost Volume to 200% (VLC Max)
                </button>
                <div className="my-1 border-t border-black/10 dark:border-white/10" />
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu(null);
                    setIsMuted((prev) => !prev);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-orange-500 hover:text-white flex items-center justify-between rounded-[4px] transition-colors text-neutral-700 dark:text-neutral-200 group"
                >
                  <span>Mute Audio</span>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 group-hover:text-white/80">M</span>
                </button>
              </div>
            )}
          </div>

          {/* Video Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveMenu(activeMenu === 'video' ? null : 'video')}
              className={`px-2.5 py-1 rounded-[4px] hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${
                activeMenu === 'video' ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 font-medium' : 'text-neutral-700 dark:text-neutral-300'
              }`}
            >
              Video
            </button>
            {activeMenu === 'video' && (
              <div className="absolute top-full left-0 mt-1 w-60 bg-white/95 dark:bg-[#25252a]/95 backdrop-blur-xl rounded-[8px] shadow-2xl border border-black/10 dark:border-white/10 py-1 text-xs text-neutral-800 dark:text-neutral-200 z-50">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu(null);
                    handleToggleFullscreen();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-orange-500 hover:text-white flex items-center justify-between rounded-[4px] transition-colors text-neutral-700 dark:text-neutral-200 group"
                >
                  <span>Fullscreen</span>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 group-hover:text-white/80">F</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu(null);
                    handleTogglePiP();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-orange-500 hover:text-white rounded-[4px] transition-colors text-neutral-700 dark:text-neutral-200"
                >
                  Picture-in-Picture
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu(null);
                    handleTakeSnapshot();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-orange-500 hover:text-white flex items-center justify-between rounded-[4px] transition-colors text-neutral-700 dark:text-neutral-200 group"
                >
                  <span className="flex items-center gap-2">
                    <Camera className="w-3.5 h-3.5 text-orange-500 group-hover:text-white" /> Take Snapshot
                  </span>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 group-hover:text-white/80">Shift+S</span>
                </button>
                <div className="my-1 border-t border-black/10 dark:border-white/10" />
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu(null);
                    setEffectsTab('video');
                    setIsEffectsModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-orange-500 hover:text-white rounded-[4px] transition-colors text-neutral-700 dark:text-neutral-200"
                >
                  Adjustments & Effects...
                </button>
              </div>
            )}
          </div>

          {/* Subtitle Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveMenu(activeMenu === 'subtitle' ? null : 'subtitle')}
              className={`px-2.5 py-1 rounded-[4px] hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${
                activeMenu === 'subtitle' ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 font-medium' : 'text-neutral-700 dark:text-neutral-300'
              }`}
            >
              Subtitle
            </button>
            {activeMenu === 'subtitle' && (
              <div className="absolute top-full left-0 mt-1 w-60 bg-white/95 dark:bg-[#25252a]/95 backdrop-blur-xl rounded-[8px] shadow-2xl border border-black/10 dark:border-white/10 py-1 text-xs text-neutral-800 dark:text-neutral-200 z-50">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu(null);
                    subtitleInputRef.current?.click();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-orange-500 hover:text-white flex items-center gap-2 rounded-[4px] transition-colors text-neutral-700 dark:text-neutral-200 group"
                >
                  <Subtitles className="w-3.5 h-3.5 text-orange-500 group-hover:text-white" /> Add Subtitle File...
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu(null);
                    setIsSubtitlesEnabled((prev) => !prev);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-orange-500 hover:text-white flex items-center justify-between rounded-[4px] transition-colors text-neutral-700 dark:text-neutral-200 group"
                >
                  <span>Toggle Subtitles</span>
                  <span className="font-semibold text-orange-500 group-hover:text-white">{isSubtitlesEnabled ? 'On' : 'Off'}</span>
                </button>
                <div className="my-1 border-t border-black/10 dark:border-white/10" />
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu(null);
                    setSubtitleDelayMs((d) => d - 50);
                    showToast(`Subtitle Delay: ${subtitleDelayMs - 50}ms`);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-orange-500 hover:text-white flex items-center justify-between rounded-[4px] transition-colors text-neutral-700 dark:text-neutral-200 group"
                >
                  <span>Delay -50ms</span>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 group-hover:text-white/80">G</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu(null);
                    setSubtitleDelayMs((d) => d + 50);
                    showToast(`Subtitle Delay: ${subtitleDelayMs + 50}ms`);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-orange-500 hover:text-white flex items-center justify-between rounded-[4px] transition-colors text-neutral-700 dark:text-neutral-200 group"
                >
                  <span>Delay +50ms</span>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 group-hover:text-white/80">H</span>
                </button>
              </div>
            )}
          </div>

          {/* Tools Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveMenu(activeMenu === 'tools' ? null : 'tools')}
              className={`px-2.5 py-1 rounded-[4px] hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${
                activeMenu === 'tools' ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 font-medium' : 'text-neutral-700 dark:text-neutral-300'
              }`}
            >
              Tools
            </button>
            {activeMenu === 'tools' && (
              <div className="absolute top-full left-0 mt-1 w-60 bg-white/95 dark:bg-[#25252a]/95 backdrop-blur-xl rounded-[8px] shadow-2xl border border-black/10 dark:border-white/10 py-1 text-xs text-neutral-800 dark:text-neutral-200 z-50">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu(null);
                    setIsEffectsModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-orange-500 hover:text-white flex items-center justify-between rounded-[4px] transition-colors text-neutral-700 dark:text-neutral-200 group"
                >
                  <span className="flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-orange-500 group-hover:text-white" /> Effects and Filters
                  </span>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 group-hover:text-white/80">Ctrl+E</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu(null);
                    setIsInfoModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-orange-500 hover:text-white flex items-center justify-between rounded-[4px] transition-colors text-neutral-700 dark:text-neutral-200 group"
                >
                  <span className="flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-orange-500 group-hover:text-white" /> Media Information
                  </span>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 group-hover:text-white/80">Ctrl+I</span>
                </button>
              </div>
            )}
          </div>

          {/* View Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveMenu(activeMenu === 'view' ? null : 'view')}
              className={`px-2.5 py-1 rounded-[4px] hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${
                activeMenu === 'view' ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 font-medium' : 'text-neutral-700 dark:text-neutral-300'
              }`}
            >
              View
            </button>
            {activeMenu === 'view' && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white/95 dark:bg-[#25252a]/95 backdrop-blur-xl rounded-[8px] shadow-2xl border border-black/10 dark:border-white/10 py-1 text-xs text-neutral-800 dark:text-neutral-200 z-50">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu(null);
                    setIsPlaylistOpen((prev) => !prev);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-orange-500 hover:text-white flex items-center justify-between rounded-[4px] transition-colors text-neutral-700 dark:text-neutral-200 group"
                >
                  <span className="flex items-center gap-2">
                    <ListMusic className="w-3.5 h-3.5 text-orange-500 group-hover:text-white" /> Toggle Playlist
                  </span>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 group-hover:text-white/80">Ctrl+L</span>
                </button>
              </div>
            )}
          </div>

          {/* Help Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveMenu(activeMenu === 'help' ? null : 'help')}
              className={`px-2.5 py-1 rounded-[4px] hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${
                activeMenu === 'help' ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 font-medium' : 'text-neutral-700 dark:text-neutral-300'
              }`}
            >
              Help
            </button>
            {activeMenu === 'help' && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white/95 dark:bg-[#25252a]/95 backdrop-blur-xl rounded-[8px] shadow-2xl border border-black/10 dark:border-white/10 py-1 text-xs text-neutral-800 dark:text-neutral-200 z-50">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu(null);
                    setIsAboutModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-orange-500 hover:text-white flex items-center gap-2 rounded-[4px] transition-colors text-neutral-700 dark:text-neutral-200 group"
                >
                  <FluentVlcIcon className="w-3.5 h-3.5" /> About VLC media player
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right side current title status */}
        <div className="hidden md:flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 max-w-[40%] truncate">
          <span className="text-orange-600 dark:text-orange-400 font-medium truncate">
            {currentItem ? currentItem.title : 'Ready'}
          </span>
          {currentItem?.format && (
            <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-[10px] text-orange-600 dark:text-orange-400 font-mono border border-orange-500/20">
              {currentItem.format}
            </span>
          )}
        </div>
      </div>

      {/* 2. Main Player Body (Video / Visualizer Stage + Optional Playlist Sidebar) */}
      <div className="flex-1 flex overflow-hidden relative min-h-0 bg-black">
        {/* Video / Visualizer Canvas Area */}
        <div 
          className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-black select-none"
          onDoubleClick={handleToggleFullscreen}
        >
          {/* Main Video Element */}
          <video
            ref={videoRef}
            src={currentItem?.url}
            onTimeUpdate={handleTimeUpdate}
            onDurationChange={() => {
              if (videoRef.current) setDuration(videoRef.current.duration || 0);
            }}
            onEnded={handleEnded}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            crossOrigin="anonymous"
            playsInline
            style={{
              filter: videoFilterStyle,
              transform: videoTransformStyle,
              objectFit: aspectRatio === 'fill' ? 'fill' : aspectRatio === 'default' ? 'contain' : 'contain'
            }}
            className={`w-full h-full transition-transform duration-150 ${currentItem?.type === 'audio' ? 'opacity-0 absolute pointer-events-none' : 'relative z-10'}`}
          />

          {/* Audio Visualizer Stage when playing audio */}
          {currentItem?.type === 'audio' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6 bg-gradient-to-b from-[#141414] via-[#0a0a0a] to-[#000000]">
              <div className="w-28 h-28 rounded-full bg-orange-500/10 border-2 border-orange-500/30 flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(249,115,22,0.2)]">
                <Music className="w-14 h-14 text-orange-400 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1 tracking-tight text-center max-w-lg truncate">
                {currentItem.title}
              </h3>
              <p className="text-xs text-neutral-400 mb-6 font-medium">
                {currentItem.artist || 'Audio Track'} • {currentItem.format || 'Stereo'}
              </p>
              {/* Realtime 64-band Audio Frequency Canvas */}
              <canvas
                ref={canvasRef}
                width={400}
                height={80}
                className="w-full max-w-md h-20 rounded-md bg-black/40 border border-white/5"
              />
            </div>
          )}

          {/* Subtitle Overlay */}
          {isSubtitlesEnabled && subtitles && (
            <div 
              className={`absolute bottom-14 inset-x-4 z-20 text-center pointer-events-none transition-all ${
                subtitleSize === 'small' ? 'text-sm' : subtitleSize === 'large' ? 'text-2xl' : 'text-lg'
              }`}
            >
              <span className="px-3 py-1 rounded bg-black/80 text-amber-300 font-bold backdrop-blur-sm shadow-md">
                {/* Clean preview of active subtitles */}
                Subtitle track enabled • Delay: {subtitleDelayMs}ms
              </span>
            </div>
          )}

          {/* A-B Loop Indicator overlay */}
          {(loopPointA !== null || loopPointB !== null) && (
            <div className="absolute top-4 left-4 z-20 px-2.5 py-1 rounded bg-orange-600/90 text-white text-[11px] font-bold shadow-lg flex items-center gap-1.5 backdrop-blur-sm">
              <Repeat className="w-3.5 h-3.5" />
              <span>
                Loop A-B: {loopPointA !== null ? formatTime(loopPointA) : 'Off'} → {loopPointB !== null ? formatTime(loopPointB) : '...'}
              </span>
            </div>
          )}

          {/* Aspect Ratio Badge */}
          {aspectRatio !== 'default' && (
            <div className="absolute top-4 right-4 z-20 px-2 py-0.5 rounded bg-black/70 text-orange-400 text-[10px] font-mono border border-white/10">
              {aspectRatio}
            </div>
          )}

          {/* Empty state when no media is playing */}
          {!currentItem && (
            <div className="flex flex-col items-center justify-center text-center p-8 z-10">
              <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 shadow-xl">
                <FluentVlcIcon className="w-16 h-16" />
              </div>
              <h2 className="text-lg font-bold text-white mb-1">VLC Media Player</h2>
              <p className="text-xs text-neutral-400 max-w-xs mb-6">
                Plays everything — Files, Discs, Webcams, Devices and Streams
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 rounded-md bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <FolderOpen className="w-3.5 h-3.5" /> Open Media File
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpenMediaTab('network');
                    setIsOpenMediaModal(true);
                  }}
                  className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5" /> Open URL / Stream
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPlaylist(VLC_DEMO_ITEMS);
                    setCurrentIndex(0);
                  }}
                  className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/15 text-orange-400 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Load Samples
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Collapsible Playlist Panel */}
        <AnimatePresence>
          {isPlaylistOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-72 bg-white/95 dark:bg-[#1e1e22]/95 backdrop-blur-xl border-l border-black/10 dark:border-white/10 flex flex-col shrink-0 overflow-hidden z-20"
            >
              {/* Playlist Header */}
              <div className="p-2.5 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-neutral-50/80 dark:bg-[#25252a]/80">
                <div className="flex items-center gap-2">
                  <ListMusic className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-bold text-neutral-900 dark:text-white tracking-tight">Playlist</span>
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400">({playlist.length})</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1 rounded-[4px] hover:bg-black/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors"
                    title="Add file"
                  >
                    <Upload className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlaylist([])}
                    className="p-1 rounded-[4px] hover:bg-black/5 dark:hover:bg-white/10 text-neutral-500 hover:text-rose-500 transition-colors"
                    title="Clear playlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPlaylistOpen(false)}
                    className="p-1 rounded-[4px] hover:bg-black/5 dark:hover:bg-white/10 text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Playlist Search Filter */}
              <div className="p-2 border-b border-black/5 dark:border-white/5">
                <div className="relative">
                  <input
                    type="text"
                    value={playlistSearch}
                    onChange={(e) => setPlaylistSearch(e.target.value)}
                    placeholder="Search in playlist..."
                    className="w-full h-8 sm:h-8.5 px-3 text-xs sm:text-[13px] rounded-[6px] bg-black/5 dark:bg-[#282c31] text-[#111827] dark:text-white placeholder-[#71717a] dark:placeholder-white border border-black/10 dark:border-white/10 outline-none focus:border-[#0078d4] dark:focus:border-[#4cc2ff] transition-all"
                  />
                </div>
              </div>

              {/* Playlist Item List */}
              <div className="flex-1 overflow-y-auto divide-y divide-black/5 dark:divide-white/5 p-1">
                {filteredPlaylist.length === 0 ? (
                  <div className="p-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
                    Playlist is empty
                  </div>
                ) : (
                  filteredPlaylist.map((item, idx) => {
                    const isSelected = playlist[currentIndex]?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectTrack(playlist.findIndex((p) => p.id === item.id))}
                        className={`group px-2.5 py-2 rounded-[6px] flex items-center justify-between text-xs cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 font-semibold border-l-2 border-orange-500'
                            : 'hover:bg-black/5 dark:hover:bg-white/5 text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <span className={`text-[10px] w-4 text-center font-mono ${isSelected ? 'text-orange-500 font-bold' : 'text-neutral-400'}`}>
                            {isSelected && isPlaying ? '▶' : idx + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-xs leading-snug">{item.title}</p>
                            <p className={`text-[10px] truncate ${isSelected ? 'text-orange-600/80 dark:text-orange-400/80' : 'text-neutral-400'}`}>
                              {item.artist || item.type}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {item.duration && (
                            <span className={`text-[10px] font-mono ${isSelected ? 'text-orange-600 dark:text-orange-400' : 'text-neutral-400'}`}>
                              {formatTime(item.duration)}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPlaylist((prev) => prev.filter((p) => p.id !== item.id));
                            }}
                            className={`p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 ${
                              isSelected ? 'text-orange-600 dark:text-orange-400' : 'text-neutral-400 hover:text-rose-500'
                            }`}
                            title="Remove"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. VLC Playback Controls Bar - Sparkle Fluent Design */}
      <div className="vlc-controls-panel bg-white/95 dark:bg-[#202024]/95 backdrop-blur-xl border-t border-black/10 dark:border-white/10 px-3 py-2.5 flex flex-col gap-2 shrink-0 z-30 text-neutral-800 dark:text-neutral-200">
        {/* Scrubber Seek Track */}
        <div className="flex items-center gap-3 text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
          <span className="w-12 text-right shrink-0">{formatTime(currentTime)}</span>
          <div className="flex-1 relative flex items-center">
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 rounded-lg appearance-none bg-black/10 dark:bg-[#3a3a3a] accent-orange-500 cursor-pointer"
            />
            {/* Loop markers */}
            {loopPointA !== null && duration > 0 && (
              <div
                style={{ left: `${(loopPointA / duration) * 100}%` }}
                className="absolute top-1/2 -translate-y-1/2 w-1.5 h-3 bg-blue-500 pointer-events-none rounded-[1px]"
                title={`Point A: ${formatTime(loopPointA)}`}
              />
            )}
            {loopPointB !== null && duration > 0 && (
              <div
                style={{ left: `${(loopPointB / duration) * 100}%` }}
                className="absolute top-1/2 -translate-y-1/2 w-1.5 h-3 bg-red-500 pointer-events-none rounded-[1px]"
                title={`Point B: ${formatTime(loopPointB)}`}
              />
            )}
          </div>
          <span className="w-12 shrink-0">{formatTime(duration)}</span>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between">
          {/* Left Controls: Play, Stop, Prev, Next, Loop, Shuffle */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              onClick={handleTogglePlay}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 active:scale-95 text-white flex items-center justify-center transition-all shadow-md shadow-orange-500/25 cursor-pointer"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={handleStop}
              className="p-1.5 rounded-[6px] hover:bg-black/5 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors"
              title="Stop (S)"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>

            <button
              type="button"
              onClick={handlePlayPrev}
              className="p-1.5 rounded-[6px] hover:bg-black/5 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors"
              title="Previous Track"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handlePlayNext}
              className="p-1.5 rounded-[6px] hover:bg-black/5 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors"
              title="Next Track"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Loop Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = loopMode === 'off' ? 'all' : loopMode === 'all' ? 'one' : 'off';
                setLoopMode(next);
                showToast(`Loop: ${next}`);
              }}
              className={`p-1.5 rounded-[6px] transition-colors ${loopMode !== 'off' ? 'text-orange-500 bg-orange-500/15' : 'text-neutral-500 hover:bg-black/5 dark:hover:bg-white/10'}`}
              title={`Loop Mode (${loopMode})`}
            >
              {loopMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
            </button>

            {/* Shuffle */}
            <button
              type="button"
              onClick={() => {
                setIsShuffle((s) => !s);
                showToast(`Shuffle: ${!isShuffle ? 'On' : 'Off'}`);
              }}
              className={`p-1.5 rounded-[6px] transition-colors ${isShuffle ? 'text-orange-500 bg-orange-500/15' : 'text-neutral-500 hover:bg-black/5 dark:hover:bg-white/10'}`}
              title="Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            {/* Snapshot */}
            <button
              type="button"
              onClick={handleTakeSnapshot}
              className="hidden sm:flex p-1.5 rounded-[6px] hover:bg-black/5 dark:hover:bg-white/10 text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
              title="Take Snapshot (Shift+S)"
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* Speed Badge */}
            <div className="relative group ml-1">
              <button
                type="button"
                className="px-1.5 py-0.5 rounded-[4px] bg-orange-500/10 text-[10px] font-mono text-orange-600 dark:text-orange-400 border border-orange-500/20 hover:border-orange-500/50 cursor-pointer"
              >
                {playbackRate.toFixed(2)}x
              </button>
              <div className="hidden group-hover:flex absolute bottom-full left-0 mb-1 flex-col bg-white/95 dark:bg-[#28282c]/95 backdrop-blur-xl rounded-[6px] shadow-xl border border-black/10 dark:border-white/10 py-1 text-[11px] z-50 text-neutral-800 dark:text-neutral-200">
                {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => handleSpeedChange(spd)}
                    className="px-3 py-1 text-left hover:bg-orange-500 hover:text-white whitespace-nowrap transition-colors"
                  >
                    {spd}x {spd === 1.0 ? '(Normal)' : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Controls: Volume (0-200%), Equalizer, Playlist Toggle, Fullscreen */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Signature VLC Volume Slider (up to 200%) */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsMuted((m) => !m)}
                className="p-1 rounded-[4px] hover:bg-black/5 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors"
                title="Mute (M)"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-500" />
                ) : volume > 100 ? (
                  <Volume2 className="w-4 h-4 text-orange-500" />
                ) : (
                  <Volume1 className="w-4 h-4" />
                )}
              </button>

              <input
                type="range"
                min="0"
                max="200"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseInt(e.target.value, 10));
                  setIsMuted(false);
                }}
                className="w-16 sm:w-24 h-1.5 rounded-lg appearance-none bg-black/10 dark:bg-[#3a3a3a] accent-orange-500 cursor-pointer"
                title={`Volume: ${volume}% (up to 200%)`}
              />

              <span className={`text-[10px] font-mono w-8 text-right ${volume > 100 ? 'text-orange-500 font-bold' : 'text-neutral-500'}`}>
                {isMuted ? '0%' : `${volume}%`}
              </span>
            </div>

            {/* Equalizer & Video Filters Dialog */}
            <button
              type="button"
              onClick={() => setIsEffectsModalOpen(true)}
              className="p-1.5 rounded-[6px] hover:bg-black/5 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300 hover:text-orange-500 transition-colors cursor-pointer"
              title="Extended GUI & Equalizer (Ctrl+E)"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Playlist Toggle */}
            <button
              type="button"
              onClick={() => setIsPlaylistOpen((p) => !p)}
              className={`p-1.5 rounded-[6px] transition-colors cursor-pointer ${isPlaylistOpen ? 'bg-orange-500/15 text-orange-500 font-bold' : 'hover:bg-black/5 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300'}`}
              title="Toggle Playlist (Ctrl+L)"
            >
              <ListMusic className="w-4 h-4" />
            </button>

            {/* Fullscreen */}
            <button
              type="button"
              onClick={handleToggleFullscreen}
              className="p-1.5 rounded-[6px] hover:bg-black/5 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              title="Fullscreen (F)"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="video/*,audio/*,.mkv,.avi,.mov,.flv,.webm,.mp4,.mp3,.wav,.ogg,.flac"
        onChange={handleLocalFileOpen}
        className="hidden"
      />
      <input
        ref={subtitleInputRef}
        type="file"
        accept=".srt,.vtt,.sub"
        onChange={handleSubtitleOpen}
        className="hidden"
      />

      {/* 4. Open Media Modal (Tabbed: File, Network, Disc, Capture) */}
      <AnimatePresence>
        {isOpenMediaModal && (
          <div 
            className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6 select-none"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={() => setIsOpenMediaModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                transition: {
                  duration: 0.24,
                  ease: [0.16, 1, 0.3, 1]
                }
              }}
              exit={{ 
                opacity: 0, 
                scale: 1.04,
                transition: {
                  duration: 0.18,
                  ease: [0.16, 1, 0.3, 1]
                }
              }}
              className="fluent-modal-dialog relative z-10 w-full max-w-lg bg-white dark:bg-[#202020] rounded-[10px] overflow-hidden shadow-[0_24px_48px_rgba(0,0,0,0.22),0_2px_6px_rgba(0,0,0,0.08)] dark:shadow-[0_24px_48px_rgba(0,0,0,0.7),0_2px_6px_rgba(255,255,255,0.04)] border border-black/[0.08] dark:border-white/[0.08] text-[#111827] dark:text-[#F3F4F6]"
            >
              {/* Modal Header */}
              <div className="px-4 py-3 bg-neutral-50/90 dark:bg-[#1a1a1e]/90 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FluentVlcIcon className="w-4 h-4" />
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Open Media</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpenMediaModal(false)}
                  className="p-1 rounded-[4px] hover:bg-black/5 dark:hover:bg-white/10 text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Segmented Fluent Tabs */}
              <div className="p-1.5 border-b border-black/10 dark:border-white/10 bg-neutral-100/60 dark:bg-black/30 flex gap-1 text-xs">
                {(['file', 'network', 'disc', 'capture'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setOpenMediaTab(tab)}
                    className={`flex-1 py-1.5 px-3 text-center capitalize font-medium rounded-[6px] transition-all cursor-pointer ${
                      openMediaTab === tab
                        ? 'bg-orange-500 text-white font-bold shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-4 text-xs space-y-4">
                {openMediaTab === 'file' && (
                  <div className="space-y-3">
                    <p className="text-neutral-400">
                      Select one or multiple media files from your local storage. Supports all modern video & audio codecs.
                    </p>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-white/20 hover:border-orange-500 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors"
                    >
                      <FolderOpen className="w-8 h-8 text-orange-400 mb-2" />
                      <p className="font-semibold text-white">Click to Browse Local Files</p>
                      <p className="text-[11px] text-neutral-400">.mp4, .mkv, .webm, .avi, .mp3, .wav, .flac</p>
                    </div>
                  </div>
                )}

                {openMediaTab === 'network' && (
                  <div className="space-y-3">
                    <p className="text-neutral-400">
                      Enter a direct network stream URL (HTTP, HTTPS, HLS `.m3u8`, or radio audio stream).
                    </p>
                    <div>
                      <label className="block text-neutral-300 font-medium mb-1">Stream URL:</label>
                      <input
                        type="url"
                        value={networkUrlInput}
                        onChange={(e) => setNetworkUrlInput(e.target.value)}
                        placeholder="https://example.com/live/stream.m3u8"
                        className="w-full h-8 px-3 rounded bg-black/40 border border-white/15 text-white focus:outline-none focus:border-orange-500 font-mono text-xs"
                      />
                    </div>
                    {/* Quick Presets */}
                    <div>
                      <span className="text-[11px] text-neutral-400 block mb-1.5">Presets:</span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => setNetworkUrlInput('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4')}
                          className="px-2 py-1 rounded bg-black/30 hover:bg-white/10 text-orange-400 text-[11px]"
                        >
                          Big Buck Bunny HD
                        </button>
                        <button
                          type="button"
                          onClick={() => setNetworkUrlInput('https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3')}
                          className="px-2 py-1 rounded bg-black/30 hover:bg-white/10 text-orange-400 text-[11px]"
                        >
                          Lofi Radio Stream
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {openMediaTab === 'disc' && (
                  <div className="space-y-3">
                    <p className="text-neutral-400">
                      Configure optical disc drive playback (DVD-Video / Blu-Ray / Audio CD).
                    </p>
                    <div>
                      <label className="block text-neutral-300 font-medium mb-1">Disc Device:</label>
                      <select
                        value={discDrive}
                        onChange={(e) => setDiscDrive(e.target.value)}
                        className="w-full h-8 px-2 rounded bg-black/40 border border-white/15 text-white text-xs"
                      >
                        <option value="DVD Drive (D:) - Video Title">DVD Drive (D:) - Feature Film ISO</option>
                        <option value="BD-ROM Drive (E:) - 1080p Master">BD-ROM Drive (E:) - 1080p Master</option>
                        <option value="Audio CD (F:) - 44.1kHz PCM">Audio CD (F:) - Hi-Res PCM</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <label className="block text-neutral-300 mb-1">Title / Chapter:</label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={discChapter}
                          onChange={(e) => setDiscChapter(parseInt(e.target.value, 10))}
                          className="w-20 h-7 px-2 rounded bg-black/40 border border-white/15 text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {openMediaTab === 'capture' && (
                  <div className="space-y-3">
                    <p className="text-neutral-400">
                      Live real-time monitoring from video capture devices (Webcam, Screen share, Microphone).
                    </p>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="captureType"
                          checked={captureDeviceType === 'camera'}
                          onChange={() => setCaptureDeviceType('camera')}
                          className="accent-orange-500"
                        />
                        <span>Webcam & Mic</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="captureType"
                          checked={captureDeviceType === 'screen'}
                          onChange={() => setCaptureDeviceType('screen')}
                          className="accent-orange-500"
                        />
                        <span>Desktop Screen</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="fluent-modal-footer bg-[#F3F3F3] dark:bg-[#1C1C1C] px-6 py-3 flex items-center justify-end gap-2.5 border-t border-[#E5E5E5] dark:border-[#2F2F2F]">
                <button
                  type="button"
                  onClick={() => setIsOpenMediaModal(false)}
                  className="fluent-btn-secondary px-4 h-8 rounded-[5px] bg-white dark:bg-[#2C2C2C] hover:bg-[#F9F9F9] dark:hover:bg-[#343434] active:bg-[#EEEEEE] dark:active:bg-[#222222] text-[#111827] dark:text-[#FFFFFF] border border-[#d1d1d1] dark:border-[#3E3E3E] text-[12.5px] font-normal shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors flex items-center justify-center cursor-pointer"
                >
                  Cancel
                </button>
                {openMediaTab === 'network' && (
                  <button
                    type="button"
                    onClick={handleAddNetworkStream}
                    className="fluent-btn-primary px-4 h-8 rounded-[5px] bg-[#0078d4] dark:bg-[#4cc2ff] hover:bg-[#106ebe] dark:hover:bg-[#6bd0ff] active:bg-[#005a9e] dark:active:bg-[#3bb2ef] text-white dark:text-black font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.1)] transition-colors border border-black/20 flex items-center justify-center cursor-pointer text-[12.5px]"
                  >
                    Play Stream
                  </button>
                )}
                {openMediaTab === 'disc' && (
                  <button
                    type="button"
                    onClick={handleOpenDisc}
                    className="fluent-btn-primary px-4 h-8 rounded-[5px] bg-[#0078d4] dark:bg-[#4cc2ff] hover:bg-[#106ebe] dark:hover:bg-[#6bd0ff] active:bg-[#005a9e] dark:active:bg-[#3bb2ef] text-white dark:text-black font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.1)] transition-colors border border-black/20 flex items-center justify-center cursor-pointer text-[12.5px]"
                  >
                    Play Disc
                  </button>
                )}
                {openMediaTab === 'capture' && (
                  <button
                    type="button"
                    onClick={handleOpenCaptureDevice}
                    className="fluent-btn-primary px-4 h-8 rounded-[5px] bg-[#0078d4] dark:bg-[#4cc2ff] hover:bg-[#106ebe] dark:hover:bg-[#6bd0ff] active:bg-[#005a9e] dark:active:bg-[#3bb2ef] text-white dark:text-black font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.1)] transition-colors border border-black/20 flex items-center justify-center cursor-pointer text-[12.5px]"
                  >
                    Start Capture
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Extended GUI / Equalizer & Video Effects Modal (Ctrl+E) */}
      <AnimatePresence>
        {isEffectsModalOpen && (
          <div 
            className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6 select-none"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={() => setIsEffectsModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                transition: {
                  duration: 0.24,
                  ease: [0.16, 1, 0.3, 1]
                }
              }}
              exit={{ 
                opacity: 0, 
                scale: 1.04,
                transition: {
                  duration: 0.18,
                  ease: [0.16, 1, 0.3, 1]
                }
              }}
              className="fluent-modal-dialog relative z-10 w-full max-w-2xl bg-white dark:bg-[#202020] rounded-[10px] overflow-hidden shadow-[0_24px_48px_rgba(0,0,0,0.22),0_2px_6px_rgba(0,0,0,0.08)] dark:shadow-[0_24px_48px_rgba(0,0,0,0.7),0_2px_6px_rgba(255,255,255,0.04)] border border-black/[0.08] dark:border-white/[0.08] text-[#111827] dark:text-[#F3F4F6]"
            >
              {/* Header */}
              <div className="px-4 py-3 bg-neutral-50/90 dark:bg-[#1a1a1e]/90 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-orange-500" />
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Adjustments and Effects</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEffectsModalOpen(false)}
                  className="p-1 rounded-[4px] hover:bg-black/5 dark:hover:bg-white/10 text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tabs: Audio Effects, Video Effects, Synchronization */}
              <div className="p-1.5 border-b border-black/10 dark:border-white/10 bg-neutral-100/60 dark:bg-black/30 flex gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setEffectsTab('audio')}
                  className={`flex-1 py-1.5 px-3 text-center rounded-[6px] font-medium transition-all cursor-pointer ${
                    effectsTab === 'audio' ? 'bg-orange-500 text-white font-bold shadow-xs' : 'text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  Audio Effects (EQ)
                </button>
                <button
                  type="button"
                  onClick={() => setEffectsTab('video')}
                  className={`flex-1 py-1.5 px-3 text-center rounded-[6px] font-medium transition-all cursor-pointer ${
                    effectsTab === 'video' ? 'bg-orange-500 text-white font-bold shadow-xs' : 'text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  Video Effects
                </button>
                <button
                  type="button"
                  onClick={() => setEffectsTab('sync')}
                  className={`flex-1 py-1.5 px-3 text-center rounded-[6px] font-medium transition-all cursor-pointer ${
                    effectsTab === 'sync' ? 'bg-orange-500 text-white font-bold shadow-xs' : 'text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  Synchronization
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-5 text-xs">
                {effectsTab === 'audio' && (
                  <div className="space-y-4">
                    {/* Top Row: Enable EQ, Presets Dropdown */}
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isEqEnabled}
                          onChange={(e) => setIsEqEnabled(e.target.checked)}
                          className="accent-orange-500"
                        />
                        <span>Enable 10-Band Equalizer</span>
                      </label>

                      <div className="flex items-center gap-2">
                        <span className="text-neutral-400">Preset:</span>
                        <select
                          value={eqPreset}
                          onChange={(e) => handleSelectEqPreset(e.target.value)}
                          className="h-7 px-2 rounded bg-black/40 border border-white/15 text-white text-xs"
                        >
                          {Object.keys(EQ_PRESETS).map((preset) => (
                            <option key={preset} value={preset}>
                              {preset}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Equalizer Sliders: Preamp + 10 Bands */}
                    <div className="bg-black/30 p-4 rounded-lg border border-white/5">
                      <div className="flex items-end justify-between h-44 gap-2">
                        {/* Preamp */}
                        <div className="flex flex-col items-center justify-between h-full w-8">
                          <span className="text-[10px] font-mono text-orange-400">{preampGain > 0 ? `+${preampGain}` : preampGain}dB</span>
                          <input
                            type="range"
                            orient="vertical"
                            min="-20"
                            max="20"
                            value={preampGain}
                            onChange={(e) => setPreampGain(parseFloat(e.target.value))}
                            className="h-28 w-2 accent-orange-500 cursor-pointer"
                          />
                          <span className="text-[10px] text-neutral-400 font-bold mt-1">Preamp</span>
                        </div>

                        <div className="w-[1px] h-36 bg-white/10" />

                        {/* 10 Freq Bands */}
                        {EQ_BANDS.map((freq, idx) => {
                          const val = bandGains[idx] || 0;
                          return (
                            <div key={freq} className="flex flex-col items-center justify-between h-full flex-1">
                              <span className="text-[9px] font-mono text-neutral-400">{val > 0 ? `+${val.toFixed(0)}` : val.toFixed(0)}</span>
                              <input
                                type="range"
                                orient="vertical"
                                min="-20"
                                max="20"
                                step="0.5"
                                value={val}
                                onChange={(e) => {
                                  const next = [...bandGains];
                                  next[idx] = parseFloat(e.target.value);
                                  setBandGains(next);
                                  setEqPreset('Custom');
                                }}
                                className="h-28 w-1.5 accent-orange-500 cursor-pointer"
                              />
                              <span className="text-[9px] text-neutral-400 font-mono mt-1">
                                {freq >= 1000 ? `${freq / 1000}k` : freq}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => handleSelectEqPreset('Flat')}
                        className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-neutral-300 text-xs"
                      >
                        Reset EQ to Flat
                      </button>
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-400">Stereo Mode:</span>
                        <select
                          value={stereoMode}
                          onChange={(e) => setStereoMode(e.target.value as any)}
                          className="h-7 px-2 rounded bg-black/40 border border-white/15 text-white text-xs"
                        >
                          <option value="stereo">Original Stereo</option>
                          <option value="left">Left Only</option>
                          <option value="right">Right Only</option>
                          <option value="spatial">Spatial Widener</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {effectsTab === 'video' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Image Adjustments */}
                      <div className="space-y-3 bg-black/30 p-3 rounded-lg border border-white/5">
                        <h4 className="font-bold text-white text-xs mb-2">Color & Contrast</h4>
                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span>Brightness</span>
                            <span className="font-mono text-orange-400">{videoBrightness}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="200"
                            value={videoBrightness}
                            onChange={(e) => setVideoBrightness(parseInt(e.target.value, 10))}
                            className="w-full h-1.5 accent-orange-500"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span>Contrast</span>
                            <span className="font-mono text-orange-400">{videoContrast}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="200"
                            value={videoContrast}
                            onChange={(e) => setVideoContrast(parseInt(e.target.value, 10))}
                            className="w-full h-1.5 accent-orange-500"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span>Saturation</span>
                            <span className="font-mono text-orange-400">{videoSaturation}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="200"
                            value={videoSaturation}
                            onChange={(e) => setVideoSaturation(parseInt(e.target.value, 10))}
                            className="w-full h-1.5 accent-orange-500"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span>Hue</span>
                            <span className="font-mono text-orange-400">{videoHue}°</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            value={videoHue}
                            onChange={(e) => setVideoHue(parseInt(e.target.value, 10))}
                            className="w-full h-1.5 accent-orange-500"
                          />
                        </div>
                      </div>

                      {/* Geometry & Orientation */}
                      <div className="space-y-3 bg-black/30 p-3 rounded-lg border border-white/5">
                        <h4 className="font-bold text-white text-xs mb-2">Geometry & Aspect</h4>
                        <div>
                          <label className="block text-neutral-400 mb-1">Rotation:</label>
                          <select
                            value={videoRotation}
                            onChange={(e) => setVideoRotation(parseInt(e.target.value, 10))}
                            className="w-full h-7 px-2 rounded bg-black/40 border border-white/15 text-white"
                          >
                            <option value="0">0° (Original)</option>
                            <option value="90">90° Clockwise</option>
                            <option value="180">180° Inverted</option>
                            <option value="270">270° Counter-Clockwise</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-neutral-400 mb-1">Aspect Ratio Override:</label>
                          <select
                            value={aspectRatio}
                            onChange={(e) => setAspectRatio(e.target.value as any)}
                            className="w-full h-7 px-2 rounded bg-black/40 border border-white/15 text-white"
                          >
                            <option value="default">Default (Auto)</option>
                            <option value="16:9">16:9 Widescreen</option>
                            <option value="4:3">4:3 Standard</option>
                            <option value="1:1">1:1 Square</option>
                            <option value="21:9">21:9 Cinema</option>
                            <option value="fill">Fill Window</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-4 pt-2">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={videoFlipH}
                              onChange={(e) => setVideoFlipH(e.target.checked)}
                              className="accent-orange-500"
                            />
                            <span>Flip Horizontal</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={videoFlipV}
                              onChange={(e) => setVideoFlipV(e.target.checked)}
                              className="accent-orange-500"
                            />
                            <span>Flip Vertical</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setVideoBrightness(100);
                          setVideoContrast(100);
                          setVideoSaturation(100);
                          setVideoHue(0);
                          setVideoRotation(0);
                          setVideoFlipH(false);
                          setVideoFlipV(false);
                          setAspectRatio('default');
                          showToast('Reset video adjustments to default');
                        }}
                        className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-neutral-300 text-xs"
                      >
                        Reset Video Defaults
                      </button>
                    </div>
                  </div>
                )}

                {effectsTab === 'sync' && (
                  <div className="space-y-4">
                    <div className="bg-black/30 p-4 rounded-lg border border-white/5 space-y-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-white">Audio Track Synchronization</span>
                          <span className="font-mono text-orange-400">{audioDelayMs} ms</span>
                        </div>
                        <p className="text-[11px] text-neutral-400 mb-2">
                          A positive value delays the audio relative to video.
                        </p>
                        <input
                          type="range"
                          min="-1000"
                          max="1000"
                          step="50"
                          value={audioDelayMs}
                          onChange={(e) => setAudioDelayMs(parseInt(e.target.value, 10))}
                          className="w-full h-1.5 accent-orange-500"
                        />
                      </div>

                      <div className="border-t border-white/10 pt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-white">Subtitle Synchronization</span>
                          <span className="font-mono text-orange-400">{subtitleDelayMs} ms</span>
                        </div>
                        <p className="text-[11px] text-neutral-400 mb-2">
                          Adjust subtitle timing with keys G (-50ms) and H (+50ms).
                        </p>
                        <input
                          type="range"
                          min="-2000"
                          max="2000"
                          step="50"
                          value={subtitleDelayMs}
                          onChange={(e) => setSubtitleDelayMs(parseInt(e.target.value, 10))}
                          className="w-full h-1.5 accent-orange-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 bg-[#242424] border-t border-black/40 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsEffectsModalOpen(false)}
                  className="px-4 py-1.5 rounded bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Media Information Dialog (Ctrl+I) */}
      <AnimatePresence>
        {isInfoModalOpen && (
          <div 
            className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6 select-none"
            onClick={() => setIsInfoModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                transition: {
                  duration: 0.24,
                  ease: [0.16, 1, 0.3, 1]
                }
              }}
              exit={{ 
                opacity: 0, 
                scale: 1.04,
                transition: {
                  duration: 0.18,
                  ease: [0.16, 1, 0.3, 1]
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="fluent-modal-dialog relative z-10 w-full max-w-md bg-white/95 dark:bg-[#202020] rounded-[10px] overflow-hidden shadow-[0_24px_48px_rgba(0,0,0,0.22),0_2px_6px_rgba(0,0,0,0.08)] dark:shadow-[0_24px_48px_rgba(0,0,0,0.7),0_2px_6px_rgba(255,255,255,0.04)] border border-black/[0.08] dark:border-white/[0.08] text-neutral-800 dark:text-neutral-200"
            >
              <div className="px-4 py-3 bg-neutral-50/90 dark:bg-[#1a1a1e]/90 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-orange-500" />
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Current Media Information</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsInfoModalOpen(false)}
                  className="p-1 rounded-[4px] hover:bg-black/5 dark:hover:bg-white/10 text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 text-xs space-y-3">
                <div className="bg-black/5 dark:bg-black/30 p-3.5 rounded-[8px] border border-black/5 dark:border-white/5 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400">Title:</span>
                    <span className="font-semibold text-neutral-900 dark:text-white truncate max-w-[200px]">{currentItem?.title || 'None'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400">Artist / Creator:</span>
                    <span className="text-neutral-700 dark:text-neutral-300">{currentItem?.artist || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400">Format / Container:</span>
                    <span className="text-orange-600 dark:text-orange-400 font-mono font-medium">{currentItem?.format || 'HTML5 Media'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400">Duration:</span>
                    <span className="font-mono text-neutral-800 dark:text-neutral-200">{formatTime(duration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400">Resolution:</span>
                    <span className="font-mono text-neutral-800 dark:text-neutral-200">
                      {videoRef.current?.videoWidth ? `${videoRef.current.videoWidth} × ${videoRef.current.videoHeight}` : 'Audio Only'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400">Volume Level:</span>
                    <span className="text-orange-600 dark:text-orange-400 font-bold">{volume}%</span>
                  </div>
                </div>
              </div>

              <div className="px-4 py-2.5 bg-neutral-50/90 dark:bg-[#1a1a1e]/90 border-t border-black/10 dark:border-white/10 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsInfoModalOpen(false)}
                  className="px-4 py-1.5 rounded-[6px] bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  OK
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. About VLC Media Player Dialog */}
      <AnimatePresence>
        {isAboutModalOpen && (
          <div 
            className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6 select-none"
            onClick={() => setIsAboutModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                transition: {
                  duration: 0.24,
                  ease: [0.16, 1, 0.3, 1]
                }
              }}
              exit={{ 
                opacity: 0, 
                scale: 1.04,
                transition: {
                  duration: 0.18,
                  ease: [0.16, 1, 0.3, 1]
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="fluent-modal-dialog relative z-10 w-full max-w-md bg-white/95 dark:bg-[#202020] rounded-[10px] overflow-hidden shadow-[0_24px_48px_rgba(0,0,0,0.22),0_2px_6px_rgba(0,0,0,0.08)] dark:shadow-[0_24px_48px_rgba(0,0,0,0.7),0_2px_6px_rgba(255,255,255,0.04)] border border-black/[0.08] dark:border-white/[0.08] text-neutral-800 dark:text-neutral-200"
            >
              <div className="px-4 py-3 bg-neutral-50/90 dark:bg-[#1a1a1e]/90 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FluentVlcIcon className="w-4 h-4" />
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">About VLC media player</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAboutModalOpen(false)}
                  className="p-1 rounded-[4px] hover:bg-black/5 dark:hover:bg-white/10 text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 text-center space-y-3">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center shadow-lg shadow-orange-500/10">
                  <FluentVlcIcon className="w-14 h-14" />
                </div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">VLC media player</h3>
                <p className="text-xs text-orange-600 dark:text-orange-400 font-mono font-semibold">Sparkle Edition 3.0.21 Vetinari</p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-sm mx-auto">
                  VLC is a free and open source cross-platform multimedia player and framework that plays most multimedia files as well as DVDs, Audio CDs, VCDs, and various streaming protocols.
                </p>
                <div className="p-2.5 rounded-[6px] bg-black/5 dark:bg-black/30 border border-black/5 dark:border-white/5 text-[11px] text-neutral-500 dark:text-neutral-400">
                  Copyright © 1996-2026 VideoLAN and Sparkle Project
                </div>
              </div>

              <div className="px-4 py-2.5 bg-neutral-50/90 dark:bg-[#1a1a1e]/90 border-t border-black/10 dark:border-white/10 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsAboutModalOpen(false)}
                  className="px-4 py-1.5 rounded-[6px] bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
