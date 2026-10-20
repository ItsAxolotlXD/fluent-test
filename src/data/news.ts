import { NewsArticle } from '../types';

export const NEWS_DATA: NewsArticle[] = [
  {
    id: 'news-sparkle-261019-insider-preview',
    slug: 'announcing-sparkle-26-11-insider-preview-build-261019',
    title: 'Announcing Sparkle 26.11 Insider Preview — Build 261019',
    subtitle: 'A fresh brand identity, an experimental home page, and a more polished Sparkle experience.',
    coverImage: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-cdRJ5BQ7c1KUAX41rwONtNyhwrFH9G.png',
    category: 'Cập nhật hệ thống',
    publishedAt: '19 Tháng 10, 2026',
    readingTime: '4 phút đọc',
    author: {
      name: 'Sparkle Engineering Team',
      role: 'Product Updates & Changelog',
      avatar: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-iTzEG0iuHLTKbWp5e2y55NABj3UWZr.png'
    },
    excerpt: "Sparkle 26.11 Insider Preview — Build 261019 brings a fresh new brand identity, a revamped experimental home page, and UI improvements that make the overall experience feel more modern and polished.",
    summary: {
      lead: "This release is another step in Sparkle's ongoing evolution as we refine the interface and move away from legacy Vplay components.",
      points: [
        'A brand-new Sparkle identity with a redesigned logo and red-to-magenta signature palette.',
        'Project Orbit Milestone 3 begins with the experimental Home Preview experience.',
        'Project Orbit Milestone 2 completes the Settings cleanup and removes broken legacy options.',
        'A bouncy tab splash screen, the Screenbox rename, and continued Light Mode fixes.'
      ],
      conclusion: 'Every update brings Sparkle closer to a cleaner, more cohesive experience that feels distinctly its own.'
    },
    featured: true,
    tags: ['Sparkle', 'Insider Preview', 'Build 261019', 'Project Orbit', 'Home Preview', 'Changelog'],
    content: [
      'Sparkle 26.11 Insider Preview — Build 261019 is here, bringing a fresh new brand identity, a revamped experimental home page, and a handful of UI improvements to make the overall experience feel more modern and polished.',
      'A BRAND-NEW LOOK',
      "Sparkle is getting a fresh new look! We've redesigned the logo with two sparkling stars surrounded by Saturn's onion ring, paired with our new signature red-to-magenta color palette.",
      "This isn't just a visual refresh — it's another step toward establishing Sparkle's own identity and design direction.",
      'PROJECT ORBIT — MILESTONE 3 BEGINS',
      'We are experimenting with a brand-new home page experience: Home Preview. Designed to be more visually appealing and intuitive, this new layout represents the third attempt under Project Orbit, internally known as PJO-03.',
      "There's still work to be done, but we're gradually moving toward a cleaner, more cohesive interface that feels like Sparkle rather than its predecessor.",
      'PROJECT ORBIT — MILESTONE 2 COMPLETED',
      "We've given the Settings page a much-needed cleanup to make it more organized and easier to navigate, as part of the Project Orbit work. All legacy Vplay options that broke during the transition to Sparkle have now been removed.",
      'SMALL TOUCHES',
      "Switching tabs just got a little more playful! We've added a new splash screen featuring a bouncy icon animation when navigating between tabs. It's a small touch, but sometimes it's the little things that make an interface feel more alive.",
      'VLC has been renamed to Screenbox. And yes, there was a little naming mishap along the way: due to a coding oversight, we accidentally typed Screenbug instead of Screenbox lol.',
      'BUG FIXES',
      "We've squashed quite a few more bugs affecting Light Mode in this release. These fixes aim to improve visual consistency and make the experience more reliable when using Sparkle in light-themed environments.",
      'WRAPPING UP',
      "Sparkle 26.11 Insider Preview — Build 261019 is another step toward a more refined Sparkle experience, introducing a new visual identity, an experimental home page, and several quality-of-life improvements. There's still plenty of room to grow, but every update brings us closer to the vision we have for Sparkle."
    ]
  }
];
