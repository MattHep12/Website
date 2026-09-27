// Production build: every theme in one dist/ folder. The default theme goes at
// the root; the others go under dist/_themes/<id>/, and the Worker
// (worker/index.ts) serves them to visitors who picked them.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, renameSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { DEFAULT_THEME, THEMES, THEMES_DIR } from '../src/themes.config.mjs';

const astroBin = fileURLToPath(new URL('../node_modules/astro/bin/astro.mjs', import.meta.url));

function build(theme, outDir) {
  console.log(`\n▶ Building theme "${theme}"${outDir ? ` into ${outDir}` : ''}\n`);
  const args = [astroBin, 'build', ...(outDir ? ['--outDir', outDir] : [])];
  execFileSync(process.execPath, args, { stdio: 'inherit', env: { ...process.env, SITE_THEME: theme } });
}

build(DEFAULT_THEME);

for (const { id } of THEMES) {
  if (id === DEFAULT_THEME) continue;
  const out = `dist/${THEMES_DIR}/${id}`;
  build(id, out);

  // CSS, fonts and images have content hashes in their names, so they can
  // share the root's /_astro/ folder (identical files are simply skipped).
  for (const file of readdirSync(`${out}/_astro`)) {
    if (!existsSync(`dist/_astro/${file}`)) renameSync(`${out}/_astro/${file}`, `dist/_astro/${file}`);
  }
  rmSync(`${out}/_astro`, { recursive: true });

  // These only make sense once, at the root.
  for (const file of ['sitemap-index.xml', 'sitemap-0.xml', 'robots.txt', '_headers', 'favicon.svg', 'og-default.png']) {
    rmSync(`${out}/${file}`, { force: true });
  }
}

console.log(`\n✓ Built ${THEMES.length} themes (default: ${DEFAULT_THEME})`);
