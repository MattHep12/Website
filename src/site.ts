// Site-wide settings. Edit this file to change your name, intro and links.

export const SITE = {
  url: 'https://matthepburn.com',
  name: 'Matt Hepburn',
  // Default <title> suffix and meta description.
  title: 'Matt Hepburn',
  description:
    'Matt Hepburn builds software and writes about it. Projects, experiments, and miscellaneous notes.',
  // Used for Open Graph when a page has no image of its own (lives in /public).
  ogImage: '/og-default.png',
  locale: 'en',
};

// Home page intro. Placeholder copy. Replace with your own words.
export const INTRO = {
  greeting: 'Hi, I’m Matt.',
  // Each string is one paragraph.
  paragraphs: [
    'I’m a developer who likes building useful tools and small, curious experiments, from terminal apps to data dashboards to things that run in the browser.',
    'This is where I keep the projects I’m proud of, a few that are still half-finished, and notes on whatever I’m learning.',
  ],
};

// Links shown in the intro and footer. Remove any you don't want.
export const LINKS: { label: string; href: string }[] = [
  { label: 'GitHub', href: 'https://github.com/MattHep12' },
  // { label: 'LinkedIn', href: 'https://www.linkedin.com/in/your-handle/' },
  // { label: 'Email', href: 'mailto:hello@matthepburn.com' },
];

export const NAV = [
  { label: 'Projects', href: '/projects/' },
  { label: 'Misc', href: '/misc/' },
];
