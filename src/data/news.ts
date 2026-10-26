import { NewsArticle } from '../types';

export const NEWS_DATA: NewsArticle[] = [
  {
    id: 'news-sparkle-update-26-11-261024',
    slug: 'announcing-sparkle-26-11-insider-preview-build-261024',
    title: '# Announcing Sparkle 26.11 Insider Preview - Build 261024',
    subtitle: '',
    coverImage: 'https://static.wikia.nocookie.net/ep-deo/images/2/2b/Banner_update_1.png/revision/latest/scale-to-width-down/1000?cb=20261022065926',
    category: '',
    publishedAt: '24 Tháng 10, 2026',
    readingTime: '4 phút đọc',
    author: {
      name: 'Sparkle Engineering Team',
      role: 'Insider Program & Changelog',
      avatar: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-iTzEG0iuHLTKbWp5e2y55NABj3UWZr.png'
    },
    excerpt: 'Build 261024 brings us closer to completing Project Orbit, kicking off Milestone 4 on the Watch tab, introducing a dedicated Feedback page, hover tooltips, refined WinUI 3 cards, modal dialog refreshes, and Light Mode fixes.',
    summary: {
      lead: 'Sparkle 26.11 (Build 261024) is here for Insider Program users.',
      points: [
        'Speak Your Thoughts: Added dedicated Feedback page for suggestions, feature requests, and bug reports.',
        'Tooltips For Better Clarity: Contextual hover hints across interface elements.',
        'User Interface: Better Home Page experience with larger Recommended & Quick Access cards, and redesigned WinUI 3 Gallery.',
        'Project Orbit — Milestone 4 Begins: Overhauled Watch tab player controls, navigation tabs, and EPG page.',
        'Small Touches & Bug Fixes: Redesigned modal dialogs, bouncy tab icons, native scrollbar, and deep Light Mode bug fixes.'
      ],
      conclusion: 'Build 261024 moves past legacy Vplay components toward a cohesive, modern Sparkle experience.'
    },
    featured: true,
    tags: [],
    content: [
      '# Speak Your Thoughts',
      '• Your feedback matters, and we want to make it easier than ever to share it with us!',
      '• We\'ve added a dedicated **Feedback** page where you can send us your suggestions, feature requests, and bug reports directly. Whether you\'ve spotted something that isn\'t working as expected or have an idea that could make Sparkle even better, we\'d love to hear from you.',
      '• Your feedback will go straight to our developers, helping us identify issues, improve existing features, and shape the future of Sparkle.',
      '# Tooltips For Better Clarity',
      '• Ever hovered over something and wondered what it does?',
      '• We\'ve introduced tooltips to provide additional context for interface elements when you hover over them. These little hints help make the UI easier to understand without cluttering the screen with unnecessary text.',
      '• It\'s a small addition, but one that makes discovering and using Sparkle a little more straightforward.',
      '# User Interface',
      '• We\'re continuing to refine the way UI components are presented with native WinUI 3, making them feel more organized and bringing its overall appearance closer to the design language we\'re building across Sparkle.',
      '## Better Home Page Experience',
      '• We\'ve updated the **Recommended** and **Quick Access** sections on the home page with larger cards and a more thoughtfully arranged layout.',
      '• The new design gives content more room to breathe, improves visual hierarchy, and makes important items easier to discover at a glance. It\'s another step toward a home page that feels more inviting and intuitive to use.',
      '## Consistent WinUI 3 Gallery',
      '• The WinUI 3 Gallery has received a redesign, featuring a cleaner cards layout and improved content arrangement.',
      '## Project Orbit — Milestone 4 Begins',
      '• We\'re moving into **Milestone 4 of Project Orbit**, bringing us one step closer to the final stages of our UI overhaul. This milestone focuses on the **Watch** tab, where the player controls, navigation tabs, and EPG page have all received redesigns with WinUI 3.',
      '• We\'re working toward a more cohesive viewing experience, with a cleaner interface that feels consistent with Sparkle\'s evolving visual identity rather than the legacy design inherited from Vplay.',
      '• There\'s still work to be done, but we\'re getting closer to the finish line. The Watch tab is the next major piece of the puzzle, and we\'re excited to keep pushing it forward!',
      '# Small Touches',
      '• **Redesigned modal dialogs:** All modal dialogs have been refreshed to better align with the WinUI 3 design language, creating a more consistent experience throughout the app.',
      '• **Bouncy tab icons:** Tab icons now feature a playful bounce animation when clicked, adding a little more personality to navigation.',
      '• **Native scrollbar:** We\'ve replaced the browser-style scrollbar with a native one for a more integrated and consistent look.',
      '# Bug Fixes',
      '• We\'ve squashed even more bugs affecting Light Mode in this release. The Light Mode experience feels almost perfect as of right now.',
      '• These fixes aim to improve visual consistency and make the experience more reliable when using Sparkle in light-themed environments. We\'re continuing to polish the little details to ensure everything looks and behaves as expected.',
      '# Wrapping Up',
      '• Build 261024 brings us closer to completing Project Orbit, with Milestone 3 now behind us and Milestone 4 officially underway.',
      '• We\'re continuing to refine Sparkle\'s interface, improve usability, and move beyond the legacy components of Vplay. There\'s still plenty to explore and polish, but every update brings us closer to the experience we envision.',
      '• Don\'t forget that your feedback helps shape what comes next. Whether it\'s a bug report, a suggestion, or just a thought you\'d like to share, we\'d love to hear from you.'
    ]
  },
  {
    id: 'news-sparkle-update-26-11-261019',
    slug: 'announcing-sparkle-26-11-insider-preview-build-261019',
    title: '# Announcing Sparkle 26.11 Insider Preview - Build 261019',
    subtitle: '',
    coverImage: 'https://static.wikia.nocookie.net/ep-deo/images/2/2b/Banner_update_1.png/revision/latest/scale-to-width-down/1000?cb=20261022065926',
    category: '',
    publishedAt: '20 Tháng 10, 2026',
    readingTime: '3 phút đọc',
    author: {
      name: 'Sparkle Engineering Team',
      role: 'Insider Program & Changelog',
      avatar: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-iTzEG0iuHLTKbWp5e2y55NABj3UWZr.png'
    },
    excerpt: 'This release is another step forward in Sparkle\'s ongoing evolution, as we continue refining the interface and moving away from legacy Vplay components. Let\'s take a look at what\'s new!',
    summary: {
      lead: 'Sparkle 26.11 (Build 261019) is here for Insider Program users.',
      points: [
        'A brand-new look: Redesigned logo with two sparkling stars surrounded by Saturn\'s onion ring, paired with our signature red-to-magenta palette.',
        'Project Orbit - Milestone 3 begins: Brand-new Home Preview layout aiming to eliminate legacy Vplay components.',
        'Project Orbit - Milestone 2 completed: Streamlined Settings page with all legacy broken Vplay options removed.',
        'Small Touches: Bouncy tab-switch splash screen animation, and VLC renamed to Screenbox.',
        'Bug Fixes: Multiple fixes for Light Mode visual consistency and reliability.'
      ],
      conclusion: 'Every update brings us closer to the vision of a refined, modern, and polished Sparkle experience.'
    },
    featured: false,
    tags: [],
    content: [
      '> This release is another step forward in Sparkle\'s ongoing evolution, as we continue refining the interface and moving away from legacy Vplay components. Let\'s take a look at what\'s new!',
      '# A brand-new look',
      '• Sparkle is getting a fresh new look! We\'ve redesigned the logo with two sparkling stars surrounded by Saturn\'s onion ring, paired with our new signature red-to-magenta color palette.',
      '• This isn\'t just a visual refresh — it\'s another step toward establishing Sparkle\'s own identity and design direction.',
      '# Project Orbit - Milestone 3 begins',
      '• We\'re experimenting with a brand-new home page experience: Home Preview.',
      '• Designed to be more visually appealing and intuitive, this new layout represents the third attempt under Project Orbit (internally known as PJO-03), our ongoing effort to eliminate outdated UI components inherited from Vplay.',
      '• There\'s still work to be done, but we\'re gradually moving toward a cleaner, more cohesive interface that feels like Sparkle rather than its predecessor.',
      '# Project Orbit - Milestone 2 completed',
      '• We\'ve given the Settings page a much-needed cleanup to make it more organized and easier to navigate, as part of the Project Orbit (internally known as PJO-02) work.',
      '• All legacy Vplay options that broke during the transition to Sparkle have now been removed. No more broken options hanging around — just a cleaner settings experience.',
      '# Small Touches',
      '• Switching tabs just got a little more playful! We\'ve added a new splash screen featuring a bouncy icon animation when navigating between tabs. It\'s a small touch, but sometimes it\'s the little things that make an interface feel more alive.',
      '• VLC has been renamed to Screenbox. And yes, there was a little naming mishap along the way. Due to a coding oversight, we accidentally typed Screenbug instead of Screenbox lol.',
      '# Bug Fixes',
      '• We\'ve squashed quite a few more bugs affecting Light Mode in this release.',
      '• These fixes aim to improve visual consistency and make the experience more reliable when using Sparkle in light-themed environments. We\'re continuing to polish the little details to ensure everything looks and behaves as expected.',
      '# Wrapping Up',
      '• Sparkle 26.11 Insider Preview - Build 261019 is another step toward a more refined Sparkle experience, introducing a new visual identity, an experimental home page, and several quality-of-life improvements. There\'s still plenty to room to grow, but every update brings us closer to the vision we have for Sparkle.'
    ]
  }
];
