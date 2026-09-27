# matthepburn.com

The personal site of Matt Hepburn: projects, small browser demos and miscellaneous notes.

- **[Astro](https://astro.build)**, static output. Every page is plain HTML. No client-side
  JavaScript ships unless a demo needs it.
- **Content is Markdown.** One `.md` file per project or post, with no code changes.
- **Hosted on Cloudflare Workers** (static assets), deployed automatically from GitHub.
- Light/dark mode follows the visitor's system setting. There's no tracking or analytics, and fonts are
  self-hosted, so visitors' browsers never contact a third party.

---

## Contents

1. [Run it locally](#run-it-locally)
2. [Pick a theme](#pick-a-theme)
3. [Project layout](#project-layout)
4. [Add a project](#add-a-project)
5. [Add a post](#add-a-post)
6. [Edit the intro, links and SEO defaults](#edit-the-intro-links-and-seo-defaults)
7. [Add an interactive demo](#add-an-interactive-demo)
8. [Deploy to Cloudflare and connect matthepburn.com](#deploy-to-cloudflare-and-connect-matthepburncom)

---

## Run it locally

You need **Node.js 22.12 or newer** (`node --version`). Then:

```sh
npm install        # once
npm run dev        # dev server at http://localhost:4321 (reloads as you edit)
```

Other commands:

| Command                 | What it does                                               |
| ----------------------- | ---------------------------------------------------------- |
| `npm run dev`           | Dev server with the default theme                          |
| `npm run dev:notebook`  | Dev server with theme A (Lab Notebook)                     |
| `npm run dev:swiss`     | Dev server with theme C (Swiss Grid)                       |
| `npm run build`         | Production build into `dist/`                              |
| `npm run build:swiss`   | Production build with the Swiss theme                      |
| `npm run preview`       | Serve the built `dist/` folder locally                     |
| `npm run check`         | Type-check the project and validate content                |
| `npm run deploy`        | Build and deploy from your machine with Wrangler (optional) |

Drafts (`draft: true`) show up in `npm run dev` but are left out of production builds.

---

## Pick a theme

Two visual directions are built on the same content, so you can compare them:

- **A · Lab Notebook** (`src/themes/notebook/`): warm paper tones, serif type (Newsreader),
  monospace margin notes (JetBrains Mono), a terracotta accent, and an editorial project list.
- **C · Swiss Grid** (`src/themes/swiss/`): big grotesk type (Inter Tight / Inter), a strict
  12-column grid, a cobalt accent, and large numbered project tiles.

The theme is chosen at build time with the `SITE_THEME` environment variable (`notebook` by default).
Run `npm run dev:notebook` and `npm run dev:swiss` side by side (the second starts on port 4322) to compare them.

**Once you've decided**, make the choice permanent:

1. Delete the folder of the theme you don't want from `src/themes/`.
2. In `astro.config.mjs`, set the fallback on the `const theme = ...` line to your theme and trim
   `THEMES` to it.
3. In `tsconfig.json`, point the `@theme/*` path at your theme's folder (this only helps editor
   autocompletion).
4. Optionally remove the `dev:*` / `build:*` theme scripts from `package.json`.
5. `public/favicon.svg` and `public/og-default.png` use the notebook colours. Tweak them if you
   pick Swiss.

How it works: every route in `src/pages/` loads content and hands it to a component imported from
`@theme/…`, an alias that points at the active theme folder. Each theme provides the same set of
components (`Layout`, `Home`, `ProjectsIndex`, `ProjectPage`, `PostsIndex`, `PostPage`,
`DemosIndex`, `NotFound`).

---

## Project layout

```
src/
  site.ts                  ← your name, intro text, links, default SEO description
  content.config.ts        ← the frontmatter schema for projects and posts
  content/
    projects/*.md          ← one file per project (+ its screenshot next to it)
    posts/*.md             ← one file per misc post
  pages/                   ← routes (/, /projects/, /projects/<slug>/, /misc/, /demos/, 404)
  themes/notebook/         ← theme A
  themes/swiss/            ← theme C
  components/              ← shared bits: SEO tags, demo embed
  lib/content.ts           ← helpers for sorting, drafts and links
  styles/base.css          ← shared reset + accessibility helpers
public/
  demos/<name>/            ← self-contained interactive demos, served at /demos/<name>/
  _headers                 ← HTTP headers (security + long caching for hashed assets)
  favicon.svg, og-default.png, robots.txt
wrangler.jsonc             ← Cloudflare Workers config
```

---

## Add a project

Create **one Markdown file** in `src/content/projects/`. The file name becomes the URL:
`src/content/projects/pixel-garden.md` → `/projects/pixel-garden/`.

```md
---
title: Pixel Garden
description: A tiny generative garden that grows a little every time you visit.
date: 2026-10-12
tags: [TypeScript, Canvas]
cover: ./pixel-garden.png
coverAlt: A grid of pixel-art flowers in pastel colours on a dark background.
github: https://github.com/MattHep12/pixel-garden
demo: /demos/pixel-garden/
embed: true
featured: true
---

Optional longer write-up in Markdown. Headings, lists, code blocks, images, links…
```

| Field         | Required | Notes                                                                                            |
| ------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `title`       | yes      |                                                                                                  |
| `description` | yes      | One or two sentences. Shown on cards and used as the page's meta description.                   |
| `date`        | yes      | `YYYY-MM-DD`. Projects are sorted newest first.                                                  |
| `tags`        | no       | Tech tags, e.g. `[Go, SQLite]`.                                                                  |
| `cover`       | no       | Screenshot path **relative to the .md file**. Astro resizes it and serves AVIF/WebP automatically. |
| `coverAlt`    | if cover | Alt text describing the image. The build fails without it, on purpose.                           |
| `github`      | no       | Source link.                                                                                     |
| `demo`        | no       | Live demo link: a full URL, or a local path like `/demos/pixel-garden/`.                         |
| `embed`       | no       | `true` embeds the local demo on the project page (needs `demo: /demos/...`).                     |
| `embedHeight` | no       | Embed height in pixels (default `520`).                                                          |
| `featured`    | no       | `true` shows it on the home page (up to 4; if none are featured, the newest 4 show).             |
| `draft`       | no       | `true` hides it from the production build.                                                       |

**Does it get its own page?** A project gets a page at `/projects/<slug>/` when it has a write-up
(any text below the frontmatter) or `embed: true`. Without either, its card links straight to
the demo or GitHub.

**Screenshots:** drop a PNG or JPG next to the Markdown file. Use something reasonably large
(1600px wide is plenty). Astro generates the small sizes. It also becomes the project's social-preview
image.

**Several screenshots in a write-up:** put them in a folder named after the project and
reference them from the Markdown, e.g. `![Alt text](./life/payroll.png)`. `life.md` and
`sentiment-trader.md` both work this way. Images in a write-up are optimized too, and can run a
little wider than the text.

> The screenshots of **Life** and **Sentiment Trader** show the real apps running on made-up
> sample data (each is labelled "sample data"). Swap in your own when you like.
> `sentiment-trader.md` has no `github:` link because that repo is private. Add one if you make it
> public.

---

## Add a post

Create **one Markdown file** in `src/content/posts/`. `notes-on-rust.md` becomes `/misc/notes-on-rust/`.

```md
---
title: Notes on learning Rust
description: One sentence for lists and search results.
date: 2026-10-20
tags: [rust, learning]
---

The post, in Markdown.
```

Optional fields: `updated` (a date), `draft: true`.

---

## Edit the intro, links and SEO defaults

Everything personal that isn't a project or post lives in **`src/site.ts`**:

- `INTRO`: the home page greeting and paragraphs (currently placeholder copy).
- `LINKS`: GitHub, LinkedIn, email… shown on the home page and footer. Uncomment or add entries.
- `SITE`: the site name, default meta description and default social-preview image.

The canonical site URL (`https://matthepburn.com`) is set in `astro.config.mjs` and is used for the
sitemap (`/sitemap-index.xml`), canonical links and Open Graph URLs.

---

## Add an interactive demo

Demos are **self-contained static folders** in `public/demos/`. Anything in
`public/demos/<name>/` is served as-is at `https://matthepburn.com/demos/<name>/`, so plain
HTML/JS, canvas and WebAssembly all work without touching the Astro build.

A starter lives in `public/demos/example/` (a canvas particle field with a pause button that
respects reduced-motion settings). It's embedded in the sample post.

### 1. Create the demo

```sh
cp -r public/demos/example public/demos/my-demo
```

Edit `public/demos/my-demo/index.html`. Add more files (JS modules, CSS, images, `.wasm`) next to it
and reference them with **relative paths** (`./main.js`, `./app.wasm`) so the folder works wherever it's
served. Visit `http://localhost:4321/demos/my-demo/` while `npm run dev` is running.

Tips:

- Make the page fill the viewport (`html, body { height: 100% }`), because it's shown full-screen at its
  own URL *and* inside an iframe.
- Keep a `<title>`, a `<main>` and an `<h1>` (it can be visually hidden) for accessibility, and
  give `<canvas>` elements an `aria-label`.
- Respect `prefers-reduced-motion` and `prefers-color-scheme` if you can.

### 2. Connect it to a project

In the project's Markdown file:

```yaml
demo: /demos/my-demo/   # adds a "Live demo" link
embed: true             # also embeds it on the project page
embedHeight: 480        # optional
```

Projects with a local demo are also listed automatically at `/demos/`.

### 3. (Optional) Embed it in a post

Markdown allows raw HTML, so a post can embed any demo:

```html
<iframe src="/demos/my-demo/" title="Live demo: My demo" loading="lazy" height="400"></iframe>
```

### Demos with a build step (TypeScript, Vite, Rust → WebAssembly, …)

Keep the demo's source wherever you like (a separate repo, or a folder like `demos-src/my-demo/`
in this one) and **build its output into `public/demos/my-demo/`**:

- **Vite:** set `base: './'` (or `'/demos/my-demo/'`) and `build.outDir: '../../public/demos/my-demo'`,
  then commit the built files. Or add the build to `npm run build`, e.g.
  `"build": "npm --prefix demos-src/my-demo run build && astro build"`.
- **Rust/WebAssembly:** `wasm-pack build --target web --out-dir ../../public/demos/my-demo/pkg`, then
  load it from `index.html` with `import init from './pkg/my_demo.js'`.
  Cloudflare serves `.wasm` files with the correct `application/wasm` type.
- **SharedArrayBuffer / threads** need cross-origin isolation headers. Add them for just that
  demo in `public/_headers`:

  ```
  /demos/my-demo/*
    Cross-Origin-Opener-Policy: same-origin
    Cross-Origin-Embedder-Policy: require-corp
  ```

If a demo ever needs to be a full Astro page instead (for example to share the site header), create
`src/pages/demos/my-demo.astro`. Just don't also have a `public/demos/my-demo/` folder, because the two
would clash.

---

## Deploy to Cloudflare and connect matthepburn.com

The site deploys as a **Cloudflare Worker with static assets**. For new projects, Cloudflare now
recommends Workers over Pages, and a purely static site like this one is served straight from Cloudflare's
edge with no Worker code running (static asset requests are free and unmetered). The config is in
`wrangler.jsonc`.

> Cloudflare's dashboard labels change from time to time. If a button below is named slightly
> differently, the linked docs have the current wording.

### 0. Get the code onto `main`

The site lives in `MattHep12/Website`. Cloudflare deploys the `main` branch to production, so
merge the working branch into `main` first (open a pull request on GitHub and merge it).

### 1. Create the Worker from GitHub

1. Log in at [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** →
   **Create** (Create application) → **Import a repository** (Workers tab, *not* Pages).
2. Connect your GitHub account if asked, and allow the Cloudflare app access to this repo.
3. Select the repository and configure:
   - **Project name:** `matthepburn`. This **must match** `"name"` in `wrangler.jsonc`, or the deploy
     fails. If you'd rather use a different name, change it in both places.
   - **Production branch:** `main`
   - **Build command:** `npm run build`
   - **Deploy command:** `npx wrangler deploy` (the default)
   - **Root directory:** `/` (default)
4. Under **Advanced settings → Build variables**, add:
   - `SITE_THEME` = `notebook` or `swiss` (whichever you picked; optional if it's `notebook`)
   - `NODE_VERSION` = `22`. The `.nvmrc` file already asks for Node 22, so this is a belt-and-braces
     setting.
5. **Deploy.** When the build finishes, the site is live at
   `https://matthepburn.<your-subdomain>.workers.dev`. Check it there.

From now on **every push to `main` redeploys automatically**. Pushes to other branches can build
preview versions (Worker → **Settings → Build → Branch control**), which is a handy way to compare
the two themes live: set `SITE_THEME=swiss` on a preview branch.

Docs: [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/) ·
[Static assets](https://developers.cloudflare.com/workers/static-assets/) ·
[Astro on Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/)

### 2. Connect matthepburn.com

Because the domain is registered with Cloudflare, its DNS is already on Cloudflare, so this takes one step:

1. Go to **Workers & Pages → matthepburn → Settings → Domains & Routes → Add → Custom domain**.
2. Enter `matthepburn.com` and confirm.

Cloudflare creates the DNS record and the HTTPS certificate automatically, which usually takes a
minute or two. If it complains that a record already exists, go to **matthepburn.com → DNS → Records**,
delete the old `A`/`AAAA`/`CNAME` record for `matthepburn.com` (for example a parking page), and try again.

Docs: [Custom domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)

### 3. Redirect www.matthepburn.com → matthepburn.com

`www` needs a DNS record so requests reach Cloudflare, plus a rule that redirects them.

1. **DNS record:** **matthepburn.com → DNS → Records → Add record**
   - Type `AAAA`, Name `www`, IPv6 address `100::`, **Proxy status: Proxied** (orange cloud).
   - (`100::` is a special "discard" address. Cloudflare answers the request itself, so the
     address never actually gets used.)
2. **Redirect rule:** **matthepburn.com → Rules → Overview → Create rule → Redirect Rule**
   (or pick the **"Redirect from WWW to root"** template if it's offered, which fills this in for you):
   - **Rule name:** `www to root`
   - **If incoming requests match:** Custom filter expression, `Hostname` **equals**
     `www.matthepburn.com`
   - **Then:** Type **Dynamic**, expression
     `concat("https://matthepburn.com", http.request.uri.path)`
   - **Status code:** `301`
   - **Preserve query string:** on
   - **Deploy.**
3. Test it: `https://www.matthepburn.com/projects/` should land on `https://matthepburn.com/projects/`.

Docs: [Redirect www to root](https://developers.cloudflare.com/rules/url-forwarding/examples/redirect-www-to-root/)

### 4. Recommended settings

- **SSL/TLS → Edge Certificates → Always Use HTTPS:** on.
- Leave **Web Analytics** off (the site is deliberately tracking-free). If you enable it later,
  Cloudflare's is cookieless.

### Deploying from your own machine (optional)

```sh
npx wrangler login
npm run deploy                          # builds, then uploads dist/
# or: npx cross-env SITE_THEME=swiss npm run deploy
```

---

## Notes

- **SEO:** each page gets a title, meta description, canonical URL, Open Graph and Twitter card
  tags. Project pages use their screenshot as the social image, and everything else uses
  `public/og-default.png`. `robots.txt` points at the generated sitemap.
- **Performance:** zero client-side JavaScript on site pages, and fonts are self-hosted and subset.
  Images are resized at build time and served as AVIF/WebP with `srcset`. Hashed assets under `/_astro/`
  are cached for a year (`public/_headers`).
- **Accessibility:** semantic landmarks, a skip link, visible focus styles, alt text enforced by the
  content schema, AA colour contrast in both themes and both colour schemes, and reduced-motion support.
