/**
 * Serves the static site and applies each visitor's chosen theme.
 *
 * Every theme is built into dist/ (see scripts/build.mjs): the default at the
 * root, the others under dist/_themes/<id>/. Page requests from visitors who
 * picked another theme (a `theme` cookie, set by /theme/<id>/) are answered
 * from that theme's copy at the same URL. Everyone else, including search
 * engines, gets the default. Hashed files under /_astro/ skip this code
 * entirely (run_worker_first in wrangler.jsonc).
 */
import { DEFAULT_THEME, THEME_COOKIE, THEMES, THEMES_DIR } from '../src/themes.config.mjs';

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

const ONE_YEAR = 60 * 60 * 24 * 365;
const themeIds = new Set(THEMES.map((t) => t.id));
const hiddenPrefix = `/${THEMES_DIR}/`;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // /theme/<id>/?next=/some/page/ remembers the choice, then goes back.
    const pick = url.pathname.match(/^\/theme\/([a-z0-9-]+)\/?$/);
    if (pick) return chooseTheme(pick[1], url);

    // The other themes' copies are only reachable through the cookie.
    if (`${url.pathname}/`.startsWith(hiddenPrefix)) {
      // A path with no file behind it, so the 404 page comes back with a 404 status.
      return env.ASSETS.fetch(new Request(new URL('/__not-found__/', url), request));
    }

    if (!isPage(url.pathname)) return env.ASSETS.fetch(request);

    const theme = readCookie(request, THEME_COOKIE);
    if (theme && theme !== DEFAULT_THEME && themeIds.has(theme)) {
      const prefix = `${hiddenPrefix}${theme}`;
      const themed = new URL(prefix + url.pathname + url.search, url);
      return varyByCookie(unprefixRedirect(await env.ASSETS.fetch(new Request(themed, request)), prefix, url));
    }
    return varyByCookie(await env.ASSETS.fetch(request));
  },
};

function chooseTheme(id: string, url: URL): Response {
  // Only same-site paths: "/x" is fine, "//evil.com" and "/\evil.com" are not.
  const next = url.searchParams.get('next') ?? '/';
  const headers = new Headers({
    Location: /^\/(?![/\\])/.test(next) ? next : '/',
    'Cache-Control': 'no-store',
  });
  if (themeIds.has(id)) {
    headers.append('Set-Cookie', `${THEME_COOKIE}=${id}; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax; Secure; HttpOnly`);
  }
  return new Response(null, { status: 303, headers });
}

/** Pages are paths without a file extension (/projects/life/) or .html files. */
function isPage(pathname: string): boolean {
  const last = pathname.slice(pathname.lastIndexOf('/') + 1);
  return !last.includes('.') || last.endsWith('.html');
}

function readCookie(request: Request, name: string): string | undefined {
  for (const part of (request.headers.get('Cookie') ?? '').split(';')) {
    const [key, ...value] = part.trim().split('=');
    if (key === name) return value.join('=');
  }
  return undefined;
}

/** Trailing-slash redirects from the themed copy must not expose /_themes/<id>/. */
function unprefixRedirect(response: Response, prefix: string, url: URL): Response {
  const location = response.headers.get('Location');
  if (!location) return response;
  const target = new URL(location, url);
  if (!target.pathname.startsWith(prefix)) return response;
  const fixed = new Response(response.body, response);
  fixed.headers.set('Location', target.pathname.slice(prefix.length) + target.search);
  return fixed;
}

/** The same URL can hold different pages, so caches must key on the cookie too. */
function varyByCookie(response: Response): Response {
  const varied = new Response(response.body, response);
  varied.headers.append('Vary', 'Cookie');
  return varied;
}
