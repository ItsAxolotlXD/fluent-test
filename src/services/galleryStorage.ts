// IndexedDB storage service for Sparkle Gallery and Draws integration

export interface GalleryMediaItem {
  id: string;
  title: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string; // Blob URL or external URL or data URL
  blobData?: Blob; // Stored binary blob
  thumbnailUrl?: string;
  mimeType?: string;
  size?: number; // bytes
  dateAdded: string; // ISO date string
  dateLabel?: string; // e.g. "October 14, 2022" or "October 2022"
  year?: number; // e.g. 2022
  dimensions?: { width: number; height: number };
  aspectRatio: number; // width / height, e.g. 1.77 for 16:9, 0.75 for 3:4
  duration?: number; // seconds for audio/video
  isFavorite?: boolean;
  tags?: string[];
  description?: string;
  source?: 'upload' | 'draws' | 'default';
  folderId?: string | null;
}

export interface GalleryFolder {
  id: string;
  name: string;
  dateCreated: string;
}

const DB_NAME = 'VOne_Gallery_DB';
const DB_VERSION = 2;
const STORE_NAME = 'media_items';
const FOLDER_STORE_NAME = 'folders';

// High-fidelity initial seed media matching the reference image layout
export const DEFAULT_GALLERY_ITEMS: GalleryMediaItem[] = [
  // Row 1 items (October 2022)
  {
    id: 'seed-plane-sunset-2022',
    title: 'Flight over pink clouds',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?w=1600&auto=format&fit=crop&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?w=600&auto=format&fit=crop&q=80',
    mimeType: 'image/jpeg',
    size: 2450000,
    dateAdded: '2022-10-12T08:30:00Z',
    dateLabel: 'October 12, 2022',
    year: 2022,
    dimensions: { width: 1920, height: 1080 },
    aspectRatio: 16 / 9,
    isFavorite: true,
    tags: ['Travel', 'Aviation', 'Sunset', 'Clouds'],
    description: 'Looking out the window over pastel sunset clouds while cruising at 35,000 feet.',
    source: 'default',
  },
  {
    id: 'seed-city-sunset-street-2022',
    title: 'Downtown golden hour lights',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1600&auto=format&fit=crop&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&auto=format&fit=crop&q=80',
    mimeType: 'image/jpeg',
    size: 3100000,
    dateAdded: '2022-10-13T17:45:00Z',
    dateLabel: 'October 13, 2022',
    year: 2022,
    dimensions: { width: 1600, height: 1000 },
    aspectRatio: 1.6,
    isFavorite: false,
    tags: ['City', 'Architecture', 'Sunset'],
    description: 'Vibrant golden hour glow over the urban street boulevard and autumn trees.',
    source: 'default',
  },
  {
    id: 'seed-river-skyscrapers-2022',
    title: 'Sunset reflection on the bay',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80',
    mimeType: 'image/jpeg',
    size: 1980000,
    dateAdded: '2022-10-14T18:10:00Z',
    dateLabel: 'October 14, 2022',
    year: 2022,
    dimensions: { width: 900, height: 1600 },
    aspectRatio: 9 / 16,
    isFavorite: true,
    tags: ['Nature', 'Water', 'Reflections'],
    description: 'City skyline silhouettes shimmering across the twilight river water.',
    source: 'default',
  },
  {
    id: 'seed-sand-dune-shadow-2022',
    title: 'Desert dune at dusk',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&auto=format&fit=crop&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=500&auto=format&fit=crop&q=80',
    mimeType: 'image/jpeg',
    size: 2120000,
    dateAdded: '2022-10-15T16:20:00Z',
    dateLabel: 'October 15, 2022',
    year: 2022,
    dimensions: { width: 900, height: 1600 },
    aspectRatio: 9 / 16,
    isFavorite: false,
    tags: ['Landscape', 'Desert', 'Minimal'],
    description: 'Crisp shadow cast across the golden sand under an azure sky.',
    source: 'default',
  },
  {
    id: 'seed-waterfront-mountain-2022',
    title: 'Harbor pavilion and mountain clouds',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1600&auto=format&fit=crop&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&auto=format&fit=crop&q=80',
    mimeType: 'image/jpeg',
    size: 2890000,
    dateAdded: '2022-10-16T19:00:00Z',
    dateLabel: 'October 16, 2022',
    year: 2022,
    dimensions: { width: 1600, height: 1000 },
    aspectRatio: 1.6,
    isFavorite: true,
    tags: ['Harbor', 'Mountains', 'Twilight'],
    description: 'Evening blue hour lighting up the coastal waterfront beneath dramatic clouds.',
    source: 'default',
  },

  // Row 2 items
  {
    id: 'seed-fluffy-puppy-2022',
    title: 'Curious caramel puppy',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=1200&auto=format&fit=crop&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500&auto=format&fit=crop&q=80',
    mimeType: 'image/jpeg',
    size: 1750000,
    dateAdded: '2022-10-10T11:15:00Z',
    dateLabel: 'October 10, 2022',
    year: 2022,
    dimensions: { width: 1000, height: 1250 },
    aspectRatio: 4 / 5,
    isFavorite: true,
    tags: ['Pets', 'Dog', 'Cute'],
    description: 'A little fluffy maltipoo puppy sitting softly by the bright window.',
    source: 'default',
  },
  {
    id: 'seed-rice-terrace-vietnam',
    title: 'Emerald mountain rice terraces',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1600&auto=format&fit=crop&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&auto=format&fit=crop&q=80',
    mimeType: 'image/jpeg',
    size: 3400000,
    dateAdded: '2022-10-11T14:20:00Z',
    dateLabel: 'October 11, 2022',
    year: 2022,
    dimensions: { width: 1920, height: 1080 },
    aspectRatio: 16 / 9,
    isFavorite: true,
    tags: ['Vietnam', 'Landscape', 'Green', 'Nature'],
    description: 'Lush green terraced hillsides cascading down the tranquil northern valleys.',
    source: 'default',
  },
  {
    id: 'seed-koi-pond-garden',
    title: 'Koi fish in freshwater garden',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1544943910-4c1dc44a0b2d?w=1200&auto=format&fit=crop&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544943910-4c1dc44a0b2d?w=500&auto=format&fit=crop&q=80',
    mimeType: 'image/jpeg',
    size: 2600000,
    dateAdded: '2022-10-12T15:00:00Z',
    dateLabel: 'October 12, 2022',
    year: 2022,
    dimensions: { width: 1000, height: 1200 },
    aspectRatio: 5 / 6,
    isFavorite: false,
    tags: ['Zen', 'Pond', 'Fish', 'Garden'],
    description: 'Graceful red and white koi fish swimming beneath aquatic plant foliage.',
    source: 'default',
  },
  {
    id: 'seed-sandy-beach-trees',
    title: 'Tropical coastline serenity',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80',
    mimeType: 'image/jpeg',
    size: 2100000,
    dateAdded: '2022-10-14T09:40:00Z',
    dateLabel: 'October 14, 2022',
    year: 2022,
    dimensions: { width: 900, height: 1600 },
    aspectRatio: 9 / 16,
    isFavorite: false,
    tags: ['Beach', 'Coast', 'Summer'],
    description: 'Golden sandy shore meeting clean ocean waves under the tropical canopy.',
    source: 'default',
  },
  {
    id: 'seed-night-city-skyline-video',
    title: 'Metropolis night reflections (Video)',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&auto=format&fit=crop&q=80',
    mimeType: 'video/mp4',
    size: 15400000,
    dateAdded: '2022-10-16T21:30:00Z',
    dateLabel: 'October 16, 2022',
    year: 2022,
    dimensions: { width: 1400, height: 1050 },
    aspectRatio: 4 / 3,
    duration: 15,
    isFavorite: true,
    tags: ['Video', 'Night', 'City', 'Timelapse'],
    description: 'Cinematic night skyline illuminated across the tranquil marina.',
    source: 'default',
  },

  // Row 3 items
  {
    id: 'seed-beach-cafe-table',
    title: 'Bayside cafe umbrellas',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&auto=format&fit=crop&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&auto=format&fit=crop&q=80',
    mimeType: 'image/jpeg',
    size: 2300000,
    dateAdded: '2022-10-13T10:00:00Z',
    dateLabel: 'October 13, 2022',
    year: 2022,
    dimensions: { width: 900, height: 1600 },
    aspectRatio: 9 / 16,
    isFavorite: false,
    tags: ['Cafe', 'Travel', 'Breeze'],
    description: 'Open-air coastal tables shaded by palm trees facing crystal blue water.',
    source: 'default',
  },
  {
    id: 'seed-coffee-sandwich-breakfast',
    title: 'Morning artisan sandwich and latte',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=1200&auto=format&fit=crop&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=500&auto=format&fit=crop&q=80',
    mimeType: 'image/jpeg',
    size: 1950000,
    dateAdded: '2022-10-15T08:15:00Z',
    dateLabel: 'October 15, 2022',
    year: 2022,
    dimensions: { width: 1200, height: 1200 },
    aspectRatio: 1,
    isFavorite: true,
    tags: ['Food', 'Coffee', 'Breakfast'],
    description: 'Fresh grilled sourdough melt with a cup of hot crafted latte.',
    source: 'default',
  },
  {
    id: 'seed-turquoise-lagoon-boat-video',
    title: 'Turquoise island lagoon cruise (Video)',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80',
    mimeType: 'video/mp4',
    size: 18200000,
    dateAdded: '2022-10-15T13:45:00Z',
    dateLabel: 'October 15, 2022',
    year: 2022,
    dimensions: { width: 1920, height: 1080 },
    aspectRatio: 16 / 9,
    duration: 15,
    isFavorite: true,
    tags: ['Video', 'Lagoon', 'Island', 'Sea'],
    description: 'Gentle waves rolling past wooden fishing boats anchored along the turquoise bay.',
    source: 'default',
  },
  {
    id: 'seed-ocean-coastline-sunshine',
    title: 'Rocky shoreline sun glitter',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1200&auto=format&fit=crop&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=500&auto=format&fit=crop&q=80',
    mimeType: 'image/jpeg',
    size: 2780000,
    dateAdded: '2022-10-16T12:00:00Z',
    dateLabel: 'October 16, 2022',
    year: 2022,
    dimensions: { width: 900, height: 1600 },
    aspectRatio: 9 / 16,
    isFavorite: false,
    tags: ['Ocean', 'Glitter', 'Coast'],
    description: 'Warm morning sunlight sparkling off breaking waves along the rocky cliff.',
    source: 'default',
  },
  {
    id: 'seed-horses-pasture-mountains',
    title: 'Wild horses on green alpine plateau',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=1800&auto=format&fit=crop&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=600&auto=format&fit=crop&q=80',
    mimeType: 'image/jpeg',
    size: 3890000,
    dateAdded: '2022-10-17T11:20:00Z',
    dateLabel: 'October 17, 2022',
    year: 2022,
    dimensions: { width: 2000, height: 1000 },
    aspectRatio: 2,
    isFavorite: true,
    tags: ['Animals', 'Horses', 'Mountains', 'Pasture'],
    description: 'Pair of mountain horses peacefully grazing in the high alpine meadows.',
    source: 'default',
  },

  // Row 4 items
  {
    id: 'seed-vietnamese-fried-rice',
    title: 'Crispy fried egg special rice',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=1200&auto=format&fit=crop&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&auto=format&fit=crop&q=80',
    mimeType: 'image/jpeg',
    size: 1820000,
    dateAdded: '2022-10-14T19:30:00Z',
    dateLabel: 'October 14, 2022',
    year: 2022,
    dimensions: { width: 1200, height: 1200 },
    aspectRatio: 1,
    isFavorite: false,
    tags: ['Food', 'Vietnamese', 'Cuisine'],
    description: 'Fragrant garlic wok fried rice topped with a sunny-side up egg and herbs.',
    source: 'default',
  },
  {
    id: 'seed-dog-river-fun',
    title: 'Puppy adventure across stones',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=1400&auto=format&fit=crop&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=500&auto=format&fit=crop&q=80',
    mimeType: 'image/jpeg',
    size: 2150000,
    dateAdded: '2022-10-15T15:00:00Z',
    dateLabel: 'October 15, 2022',
    year: 2022,
    dimensions: { width: 1400, height: 1050 },
    aspectRatio: 4 / 3,
    isFavorite: false,
    tags: ['Pets', 'Dog', 'River'],
    description: 'Happy puppy exploring river pebbles and crystal cool water.',
    source: 'default',
  },
  {
    id: 'seed-blue-sky-clouds',
    title: 'Sunny blue sky with billowy cumulus',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1200&auto=format&fit=crop&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=500&auto=format&fit=crop&q=80',
    mimeType: 'image/jpeg',
    size: 1670000,
    dateAdded: '2022-10-16T14:15:00Z',
    dateLabel: 'October 16, 2022',
    year: 2022,
    dimensions: { width: 1200, height: 1200 },
    aspectRatio: 1,
    isFavorite: false,
    tags: ['Sky', 'Clouds', 'Sun'],
    description: 'Pure radiant sunlight through billowing white clouds over bright blue sky.',
    source: 'default',
  },
  {
    id: 'seed-roasted-lemon-chicken-video',
    title: 'Cast-iron roasted chicken & herbs (Video)',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&auto=format&fit=crop&q=80',
    mimeType: 'video/mp4',
    size: 14100000,
    dateAdded: '2022-10-17T20:00:00Z',
    dateLabel: 'October 17, 2022',
    year: 2022,
    dimensions: { width: 1920, height: 1080 },
    aspectRatio: 16 / 9,
    duration: 15,
    isFavorite: true,
    tags: ['Video', 'Food', 'Culinary'],
    description: 'Crispy skin roasted chicken skillet with grilled caramelized lemon slices.',
    source: 'default',
  },
  // Sample Audio Item
  {
    id: 'seed-peaceful-lofi-track',
    title: 'Gentle Morning Acoustic Stream',
    type: 'audio',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    mimeType: 'audio/mp3',
    size: 6120000,
    dateAdded: '2023-04-10T10:00:00Z',
    dateLabel: 'April 10, 2023',
    year: 2023,
    dimensions: { width: 800, height: 800 },
    aspectRatio: 1,
    duration: 372,
    isFavorite: true,
    tags: ['Audio', 'Acoustic', 'Music', 'Relax'],
    description: 'Calm ambient acoustic rhythm for deep focus and relaxation.',
    source: 'default',
  },
  // Sample Document Items
  {
    id: 'seed-vone-welcome-guide',
    title: 'Sparkle User Handbook & Shortcuts.pdf',
    type: 'document',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=80',
    mimeType: 'application/pdf',
    size: 142000,
    dateAdded: '2023-08-20T14:30:00Z',
    dateLabel: 'August 20, 2023',
    year: 2023,
    dimensions: { width: 1200, height: 1600 },
    aspectRatio: 3 / 4,
    isFavorite: false,
    tags: ['Document', 'PDF', 'Guide'],
    description: 'Documentation guide and keybind reference for Sparkle.',
    source: 'default',
  },
  {
    id: 'seed-vone-project-brief-docx',
    title: 'Sparkle Project Roadmap & Requirements.docx',
    type: 'document',
    url: 'https://calibre-ebook.com/downloads/demos/demo.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 285000,
    dateAdded: '2023-09-05T10:15:00Z',
    dateLabel: 'September 5, 2023',
    year: 2023,
    dimensions: { width: 1200, height: 1600 },
    aspectRatio: 3 / 4,
    isFavorite: true,
    tags: ['Word', 'DOCX', 'Document', 'Roadmap'],
    description: 'Word document outlining system design and milestone goals.',
    source: 'default',
  },
  {
    id: 'seed-vone-keynote-presentation-pptx',
    title: 'Sparkle Community Pitch Deck.pptx',
    type: 'document',
    url: 'https://scholar.harvard.edu/files/torman_personal/files/samplepptx.pptx',
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    size: 890000,
    dateAdded: '2023-10-12T16:00:00Z',
    dateLabel: 'October 12, 2023',
    year: 2023,
    dimensions: { width: 1920, height: 1080 },
    aspectRatio: 16 / 9,
    isFavorite: false,
    tags: ['PowerPoint', 'PPTX', 'Presentation', 'Slides'],
    description: 'Slide presentation deck showcasing Sparkle features and UI.',
    source: 'default',
  },
  {
    id: 'seed-channel-frequency-sheet-xlsx',
    title: 'Vietnam TV Channels Frequency List.xlsx',
    type: 'document',
    url: 'https://go.microsoft.com/fwlink/?LinkID=521962',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    size: 420000,
    dateAdded: '2023-11-01T09:30:00Z',
    dateLabel: 'November 1, 2023',
    year: 2023,
    dimensions: { width: 1600, height: 1200 },
    aspectRatio: 4 / 3,
    isFavorite: false,
    tags: ['Excel', 'XLSX', 'Spreadsheet', 'Data'],
    description: 'Spreadsheet database containing national channel streams and transponder data.',
    source: 'default',
  }
];

class GalleryDatabase {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private listeners: Set<() => void> = new Set();

  private openDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('dateAdded', 'dateAdded', { unique: false });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('isFavorite', 'isFavorite', { unique: false });
        }
        if (!db.objectStoreNames.contains(FOLDER_STORE_NAME)) {
          db.createObjectStore(FOLDER_STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  // Subscribe to changes
  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch (e) {
        console.error(e);
      }
    });
  }

  // Load all items (gallery starts empty by default; user can upload or click Load Demo)
  public async getAll(): Promise<GalleryMediaItem[]> {
    try {
      const db = await this.openDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      let items: GalleryMediaItem[] = await new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });

      // For Build 261014: Ensure initial gallery is empty by default unless user has uploaded files or explicitly loaded demo
      const initializedBuild = localStorage.getItem('vone_gallery_build_261014_init');
      if (!initializedBuild) {
        // If there were only auto-seeded default items from previous version, clear them so user starts with a clean empty gallery
        const onlyDefaults = items.length > 0 && items.every((it) => it.source === 'default');
        if (onlyDefaults) {
          await this.clearAll();
          items = [];
        }
        localStorage.setItem('vone_gallery_build_261014_init', 'true');
      }

      // Sort newest first
      return items.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
    } catch (err) {
      console.warn('IndexedDB read failed:', err);
      return [];
    }
  }

  public async seedDefaults(): Promise<void> {
    try {
      const db = await this.openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      for (const item of DEFAULT_GALLERY_ITEMS) {
        store.put(item);
      }
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      localStorage.setItem('vone_gallery_initialized', 'true');
      localStorage.setItem('vone_gallery_build_261014_init', 'true');
      this.notify();
    } catch (e) {
      console.error('Failed to seed defaults', e);
    }
  }

  // Add single media item
  public async add(item: GalleryMediaItem): Promise<void> {
    try {
      const db = await this.openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(item);
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      localStorage.setItem('vone_gallery_initialized', 'true');
      this.notify();
    } catch (e) {
      console.error('Failed to add gallery item', e);
      throw e;
    }
  }

  // Delete single media item
  public async delete(id: string): Promise<void> {
    try {
      const db = await this.openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      this.notify();
    } catch (e) {
      console.error('Failed to delete gallery item', e);
    }
  }

  // Duplicate media item
  public async duplicate(id: string): Promise<GalleryMediaItem | null> {
    try {
      const db = await this.openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);

      const item: GalleryMediaItem | undefined = await new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });

      if (item) {
        const newItem: GalleryMediaItem = {
          ...item,
          id: `copy-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          title: `Copy of ${item.title}`,
          dateAdded: new Date().toISOString(),
          isFavorite: false,
        };
        store.put(newItem);
        await new Promise<void>((resolve, reject) => {
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
        this.notify();
        return newItem;
      }
      return null;
    } catch (e) {
      console.error('Failed to duplicate item', e);
      return null;
    }
  }

  // Delete multiple items
  public async deleteMany(ids: string[]): Promise<void> {
    try {
      const db = await this.openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      for (const id of ids) {
        store.delete(id);
      }
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      this.notify();
    } catch (e) {
      console.error('Failed to delete items', e);
    }
  }

  // Toggle favorite
  public async toggleFavorite(id: string): Promise<boolean> {
    try {
      const db = await this.openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);

      const item: GalleryMediaItem | undefined = await new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });

      if (item) {
        item.isFavorite = !item.isFavorite;
        store.put(item);
        await new Promise<void>((resolve, reject) => {
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
        this.notify();
        return item.isFavorite;
      }
      return false;
    } catch (e) {
      console.error('Failed to toggle favorite', e);
      return false;
    }
  }

  // Clear all items (to test empty state!)
  public async clearAll(): Promise<void> {
    try {
      const db = await this.openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.clear();
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      localStorage.setItem('vone_gallery_initialized', 'true');
      this.notify();
    } catch (e) {
      console.error('Failed to clear gallery', e);
    }
  }

  private async patchItems(ids: string[], patch: (item: GalleryMediaItem) => void): Promise<void> {
    const db = await this.openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    for (const id of ids) {
      const req = store.get(id);
      req.onsuccess = () => {
        const item = req.result as GalleryMediaItem | undefined;
        if (item) {
          patch(item);
          store.put(item);
        }
      };
    }
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    this.notify();
  }

  public async rename(id: string, title: string): Promise<void> {
    await this.patchItems([id], (item) => {
      item.title = title;
    });
  }

  public async moveToFolder(ids: string[], folderId: string | null): Promise<void> {
    await this.patchItems(ids, (item) => {
      item.folderId = folderId;
    });
  }

  public async getFolders(): Promise<GalleryFolder[]> {
    try {
      const db = await this.openDB();
      const tx = db.transaction(FOLDER_STORE_NAME, 'readonly');
      const req = tx.objectStore(FOLDER_STORE_NAME).getAll();
      const folders: GalleryFolder[] = await new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
      return folders.sort((a, b) => a.name.localeCompare(b.name));
    } catch (e) {
      console.warn('Failed to read folders', e);
      return [];
    }
  }

  public async createFolder(name: string): Promise<GalleryFolder> {
    const folder: GalleryFolder = {
      id: `folder-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      dateCreated: new Date().toISOString(),
    };
    const db = await this.openDB();
    const tx = db.transaction(FOLDER_STORE_NAME, 'readwrite');
    tx.objectStore(FOLDER_STORE_NAME).put(folder);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    this.notify();
    return folder;
  }

  public async renameFolder(id: string, name: string): Promise<void> {
    const db = await this.openDB();
    const tx = db.transaction(FOLDER_STORE_NAME, 'readwrite');
    const store = tx.objectStore(FOLDER_STORE_NAME);
    const req = store.get(id);
    req.onsuccess = () => {
      if (req.result) store.put({ ...req.result, name });
    };
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    this.notify();
  }

  // Deleting a folder moves its contents back to the Gallery root
  public async deleteFolder(id: string): Promise<void> {
    const items = await this.getAll();
    const childIds = items.filter((it) => it.folderId === id).map((it) => it.id);
    if (childIds.length) await this.moveToFolder(childIds, null);
    const db = await this.openDB();
    const tx = db.transaction(FOLDER_STORE_NAME, 'readwrite');
    tx.objectStore(FOLDER_STORE_NAME).delete(id);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    this.notify();
  }

  // Restore sample items
  public async restoreSamples(): Promise<void> {
    await this.clearAll();
    await this.seedDefaults();
  }
}

export const galleryDB = new GalleryDatabase();

// Helper to determine media aspect ratio from file
export const getMediaDimensions = async (
  file: File
): Promise<{ width: number; height: number; duration?: number }> => {
  return new Promise((resolve) => {
    if (file.type.startsWith('image/')) {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const w = img.naturalWidth || 800;
        const h = img.naturalHeight || 600;
        URL.revokeObjectURL(url);
        resolve({ width: w, height: h });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ width: 800, height: 600 });
      };
      img.src = url;
    } else if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      const url = URL.createObjectURL(file);
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        const w = video.videoWidth || 1280;
        const h = video.videoHeight || 720;
        const dur = Math.round(video.duration) || 0;
        URL.revokeObjectURL(url);
        resolve({ width: w, height: h, duration: dur });
      };
      video.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ width: 1280, height: 720, duration: 0 });
      };
      video.src = url;
    } else {
      // Audio or documents default
      resolve({ width: 600, height: 600 });
    }
  });
};
