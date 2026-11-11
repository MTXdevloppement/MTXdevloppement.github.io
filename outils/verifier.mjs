// Vérification du site statique : liens et fichiers internes, images, balises SEO, données structurées,
// plan du site, poids des pages. Usage : npm run check (ou node outils/verifier.mjs).
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join, dirname, resolve, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGINE = 'https://mtxdevloppement.github.io';
const erreurs = [], avis = [];
let controles = 0;
const ok = (cond, msg, grave = true) => { controles += 1; if (!cond) (grave ? erreurs : avis).push(msg); };

const pages = [];
(function parcourir(d) {
  for (const f of readdirSync(d)) {
    if (f.startsWith('.') || f === 'node_modules' || f === 'outils') continue;
    const p = join(d, f);
    if (statSync(p).isDirectory()) parcourir(p);
    else if (f.endsWith('.html')) pages.push(p);
  }
})(racine);

const fichier = (page, url) => {
  let u = url.split('#')[0].split('?')[0];
  if (!u) return null;
  try { u = decodeURIComponent(u); } catch {}
  const base = u.startsWith('/') ? racine : dirname(page);
  let cible = resolve(base, u.replace(/^\//, ''));
  if (existsSync(cible) && statSync(cible).isDirectory()) cible = join(cible, 'index.html');
  return cible;
};
const externe = (u) => /^(https?:|mailto:|tel:|data:|#)/.test(u) || u.startsWith('//');
const attr = (balise, nom) => (balise.match(new RegExp(`\\s${nom}="([^"]*)"`)) || [])[1];

for (const page of pages) {
  const nom = relative(racine, page);
  const html = readFileSync(page, 'utf8');
  const sans = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<!--[\s\S]*?-->/g, '');
  const redirection = /http-equiv="refresh"/i.test(html);

  // Liens et ressources internes
  const poids = { html: statSync(page).size, css: 0, js: 0 };
  for (const m of html.matchAll(/\s(?:href|src|poster)="([^"]+)"/g)) {
    const u = m[1];
    if (externe(u)) continue;
    const cible = fichier(page, u);
    if (!cible) continue;
    ok(existsSync(cible), `${nom} : fichier introuvable « ${u} »`);
    if (existsSync(cible)) {
      if (extname(cible) === '.css') poids.css += statSync(cible).size;
      if (extname(cible) === '.js') poids.js += statSync(cible).size;
    }
    const ancre = u.split('#')[1];
    if (ancre && existsSync(cible) && cible.endsWith('.html')) {
      const cibleHtml = cible === page ? html : readFileSync(cible, 'utf8');
      ok(new RegExp(`id="${ancre}"`).test(cibleHtml), `${nom} : ancre absente « ${u} »`);
    }
  }
  for (const m of html.matchAll(/srcset="([^"]+)"/g)) {
    for (const part of m[1].split(',')) {
      const u = part.trim().split(/\s+/)[0];
      if (u && !externe(u)) ok(existsSync(fichier(page, u)), `${nom} : image introuvable « ${u} »`);
    }
  }
  for (const m of sans.matchAll(/href="#([^"]+)"/g)) ok(new RegExp(`id="${m[1]}"`).test(html), `${nom} : ancre locale absente « #${m[1]} »`);
  if (redirection) continue;

  // Balises essentielles
  const titre = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  const desc = attr((html.match(/<meta name="description"[^>]*>/) || [''])[0], 'content') || '';
  ok(/<html lang="fr"/.test(html), `${nom} : attribut lang manquant`);
  ok(titre.length >= 15 && titre.length <= 65, `${nom} : titre de ${titre.length} caractères (15 à 65 attendus)`, false);
  ok(desc.length >= 70 && desc.length <= 160, `${nom} : description de ${desc.length} caractères (70 à 160 attendus)`, false);
  ok((sans.match(/<h1[\s>]/g) || []).length === 1, `${nom} : il faut exactement un h1`);
  ok(/name="viewport"/.test(html), `${nom} : balise viewport manquante`);
  const niveaux = [...sans.matchAll(/<h([1-6])[\s>]/g)].map((m) => +m[1]);
  niveaux.forEach((n, i) => { if (i) ok(n - niveaux[i - 1] <= 1, `${nom} : saut de niveau de titre h${niveaux[i - 1]} → h${n}`, false); });

  // Images : texte alternatif et dimensions
  for (const m of sans.matchAll(/<img\b[^>]*>/g)) {
    const b = m[0];
    ok(/\salt="/.test(b), `${nom} : image sans attribut alt (${attr(b, 'src')})`);
    ok(/\swidth="\d+"/.test(b) && /\sheight="\d+"/.test(b), `${nom} : image sans dimensions (${attr(b, 'src')})`, false);
  }

  // Données structurées
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const d = JSON.parse(m[1]);
      for (const n of d['@graph'] || [d]) {
        if (n['@type'] === 'FAQPage') {
          // Comparaison sans tenir compte du type d'espace (normale, insécable, fine).
          const espaces = (t) => t.replace(/&#8239;|&#x202f;|&nbsp;|&#160;|[  ]/gi, ' ').replace(/&amp;/g, '&');
          for (const q of n.mainEntity) ok(espaces(sans).includes(espaces(q.name)), `${nom} : question des données structurées absente de la page « ${q.name} »`);
        }
      }
    } catch (e) { ok(false, `${nom} : données structurées illisibles (${e.message})`); }
  }

  // Canonique et partage (pages indexables)
  const canon = attr((html.match(/<link rel="canonical"[^>]*>/) || [''])[0], 'href');
  if (canon) {
    const cible = fichier(page, canon.replace(ORIGINE, '') || '/');
    ok(cible === page, `${nom} : l'adresse canonique ne désigne pas cette page (${canon})`);
    const og = attr((html.match(/<meta property="og:image"[^>]*>/) || [''])[0], 'content');
    if (og && og.startsWith(ORIGINE)) ok(existsSync(join(racine, og.replace(ORIGINE, ''))), `${nom} : image de partage introuvable (${og})`);
  }
  ok(poids.html + poids.css + poids.js < 400_000, `${nom} : HTML + CSS + JS = ${Math.round((poids.html + poids.css + poids.js) / 1024)} Ko`, false);
}

// Plan du site et robots
const plan = readFileSync(join(racine, 'sitemap.xml'), 'utf8');
for (const m of plan.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const chemin = m[1].replace(ORIGINE, '') || '/';
  const cible = fichier(join(racine, 'index.html'), chemin);
  ok(existsSync(cible), `sitemap.xml : page introuvable ${m[1]}`);
  if (existsSync(cible)) {
    const h = readFileSync(cible, 'utf8');
    ok(!/noindex/.test(h), `sitemap.xml : page marquée noindex ${m[1]}`);
    ok(h.includes(`rel="canonical" href="${m[1]}"`) || !/rel="canonical"/.test(h), `sitemap.xml : adresse différente de la canonique ${m[1]}`, false);
  }
}
ok(/Sitemap: https:\/\//.test(readFileSync(join(racine, 'robots.txt'), 'utf8')), 'robots.txt : ligne Sitemap manquante');

console.log(`${pages.length} pages, ${controles} contrôles.`);
for (const a of avis) console.log('  avis   · ' + a);
for (const e of erreurs) console.log('  ERREUR · ' + e);
console.log(erreurs.length ? `✗ ${erreurs.length} erreur(s), ${avis.length} avis` : `✓ aucune erreur, ${avis.length} avis`);
process.exit(erreurs.length ? 1 : 0);
