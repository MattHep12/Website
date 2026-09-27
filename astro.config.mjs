// @ts-check
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { DEFAULT_THEME, THEMES } from './src/themes.config.mjs';

// Each build renders one theme (src/themes/<id>/), chosen by SITE_THEME.
// `npm run build` builds all of them (scripts/build.mjs) so visitors can switch.
const themeIds = THEMES.map((t) => t.id);
const theme = process.env.SITE_THEME ?? DEFAULT_THEME;
if (!themeIds.includes(theme)) {
  throw new Error(`Unknown SITE_THEME "${theme}". Expected one of: ${themeIds.join(', ')}`);
}

// Dev-server helpers: serve public/<folder>/index.html for /<folder>/ so demos in
// public/demos/<name>/ work locally the same way they do on Cloudflare, and
// answer theme-switch links (which only the Worker can really handle).
function devServerHelpers() {
  const publicDir = fileURLToPath(new URL('./public', import.meta.url));
  return {
    name: 'dev-server-helpers',
    /** @param {import('vite').ViteDevServer} server */
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const [path, query] = (req.url ?? '').split('?');
        // The theme switch needs the Worker (npm run preview); in dev, just go back.
        if (/^\/theme\/[^/]+\/?$/.test(path)) {
          const next = new URLSearchParams(query).get('next') ?? '/';
          server.config.logger.warn('Theme switching works in `npm run preview` and on the live site. ' +
            'In dev, use `npm run dev:notebook` or `npm run dev:swiss`.');
          res.writeHead(303, { Location: /^\/(?![/\\])/.test(next) ? next : '/' }).end();
          return;
        }
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
    plugins: [devServerHelpers()],
    resolve: {
      alias: {
        '@theme': fileURLToPath(new URL(`./src/themes/${theme}`, import.meta.url)),
      },
    },
  },
});
