// @ts-check
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Two visual themes ship with the site so they can be compared:
//   notebook: "Lab Notebook" (warm, serif, editorial)
//   swiss:    "Swiss Grid" (bold sans, big image tiles)
// Pick one with the SITE_THEME env var (see package.json scripts).
// Once you've chosen, delete the other folder in src/themes and set the default below.
const THEMES = ['notebook', 'swiss'];
const theme = process.env.SITE_THEME ?? 'notebook';
if (!THEMES.includes(theme)) {
  throw new Error(`Unknown SITE_THEME "${theme}". Expected one of: ${THEMES.join(', ')}`);
}

// In `astro dev`, serve public/<folder>/index.html for /<folder>/ so demos in
// public/demos/<name>/ work locally the same way they do on Cloudflare.
function publicFolderIndex() {
  const publicDir = fileURLToPath(new URL('./public', import.meta.url));
  return {
    name: 'public-folder-index',
    /** @param {import('vite').ViteDevServer} server */
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const [path, query] = (req.url ?? '').split('?');
        if (path.length > 1 && path.endsWith('/')) {
          if (existsSync(`${publicDir}${decodeURIComponent(path)}index.html`)) {
            req.url = `${path}index.html${query ? `?${query}` : ''}`;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig({
  site: 'https://matthepburn.com',
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      // Code blocks follow the system light/dark setting (see src/styles/base.css).
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: false,
    },
  },
  vite: {
    plugins: [publicFolderIndex()],
    resolve: {
      alias: {
        '@theme': fileURLToPath(new URL(`./src/themes/${theme}`, import.meta.url)),
      },
    },
  },
});
