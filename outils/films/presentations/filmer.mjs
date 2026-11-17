import { createRequire } from 'module';
import { spawn } from 'child_process';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const [film, sortie, ...reste] = process.argv.slice(2);
if (!film || !sortie) { console.error('usage : node filmer.mjs <film> <sortie.mkv> [--de s] [--a s] [--ips n]'); process.exit(1); }
const opt = (n, d) => { const i = reste.indexOf(`--${n}`); return i >= 0 ? Number(reste[i + 1]) : d; };
const ips = opt('ips', 30);
const base = process.env.FILMS_URL || 'http://127.0.0.1:8765';

const navigateur = await chromium.launch({ args: ['--font-render-hinting=none', '--disable-lcd-text'] });
const page = await navigateur.newPage({ viewport: { width: 1920, height: 1920 }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => { console.error('Erreur dans la page :', e.message); process.exit(1); });
await page.goto(`${base}/outils/films/presentations/${film}.html?tournage`, { waitUntil: 'load' });
await page.waitForFunction(() => window.film && document.fonts.status === 'loaded');
await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {}))));
const { l, h, duree } = await page.evaluate(() => { const s = document.querySelector('.scene'); return { l: s.offsetWidth, h: s.offsetHeight, duree: window.film.duree }; });
await page.setViewportSize({ width: l, height: h });
const de = opt('de', 0), a = Math.min(opt('a', duree), duree);
const n = Math.round((a - de) * ips);

const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(ips), '-i', '-',
  '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv444p', '-c:v', 'libx264', '-preset', 'fast', '-crf', '10',
  '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-color_range', 'tv', sortie], { stdio: ['pipe', 'inherit', 'inherit'] });
const cdp = await page.context().newCDPSession(page);
const debut = Date.now();
for (let i = 0; i < n; i++) {
  const t = de + i / ips;
  await page.evaluate((t) => window.film.aller(t), t);
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true });
  if (!ff.stdin.write(Buffer.from(data, 'base64'))) await new Promise((r) => ff.stdin.once('drain', r));
  if (i % 150 === 0) process.stdout.write(`  ${film} ${t.toFixed(1)} s / ${a} s (${((Date.now() - debut) / 1000).toFixed(0)} s)\n`);
}
ff.stdin.end();
await new Promise((r) => ff.on('close', r));
await navigateur.close();
console.log(`${film} : ${n} images en ${((Date.now() - debut) / 1000).toFixed(0)} s → ${sortie}`);
