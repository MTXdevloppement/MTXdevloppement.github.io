import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [film, sortie, liste, cols = '4'] = process.argv.slice(2);
const base = process.env.FILMS_URL || 'http://127.0.0.1:8765';
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1920, height: 1920 } });
const erreurs = [];
page.on('pageerror', (e) => erreurs.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
await page.goto(`${base}/outils/films/presentations/${film}.html?tournage`, { waitUntil: 'load' });
await page.waitForFunction(() => window.film && document.fonts.status === 'loaded');
await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {}))));
const { l, h } = await page.evaluate(() => { const s = document.querySelector('.scene'); return { l: s.offsetWidth, h: s.offsetHeight }; });
await page.setViewportSize({ width: l, height: h });
const ts = liste.split(',').map(Number);
const images = [];
for (const t of ts) { await page.evaluate((t) => window.film.aller(t), t); images.push((await page.screenshot({ type: 'jpeg', quality: 80 })).toString('base64')); }
const c = Number(cols), r = Math.ceil(ts.length / c), w = l / 2, hh = h / 2;
const png = await page.evaluate(async ({ images, c, r, w, hh, ts }) => {
  const cv = document.createElement('canvas'); cv.width = c * w + (c - 1) * 6; cv.height = r * hh + (r - 1) * 6;
  const x = cv.getContext('2d'); x.fillStyle = '#f0f'; x.fillRect(0, 0, cv.width, cv.height);
  for (let i = 0; i < images.length; i++) {
    const im = new Image(); im.src = 'data:image/jpeg;base64,' + images[i]; await im.decode();
    const px = (i % c) * (w + 6), py = Math.floor(i / c) * (hh + 6);
    x.drawImage(im, px, py, w, hh);
    x.fillStyle = 'rgba(0,0,0,.7)'; x.fillRect(px, py, 110, 40); x.fillStyle = '#fff'; x.font = '26px sans-serif'; x.fillText(ts[i].toFixed(2) + ' s', px + 8, py + 29);
  }
  return cv.toDataURL('image/png').split(',')[1];
}, { images, c, r, w, hh, ts });
require('fs').writeFileSync(sortie, Buffer.from(png, 'base64'));
if (erreurs.length) console.log('ERREURS', erreurs.slice(0, 5));
await b.close();
