// The site's visual themes. Every build includes all of them. Visitors pick
// one with the switch in the header, which sets a cookie, and the Worker in
// worker/index.ts serves the matching version of each page.

/** @type {{ id: string, label: string }[]} */
export const THEMES = [
  { id: 'notebook', label: 'Notebook' },
  { id: 'swiss', label: 'Swiss' },
];

/** What first-time visitors and search engines see. Built at the site root. */
export const DEFAULT_THEME = 'notebook';

/** Other themes are built into dist/<THEMES_DIR>/<id>/ (not directly reachable). */
export const THEMES_DIR = '_themes';

export const THEME_COOKIE = 'theme';
