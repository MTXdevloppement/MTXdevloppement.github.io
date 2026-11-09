(() => {
  'use strict';
  const { $, $$, attendre, reduit, tactile } = window.Socle;

  const svgUrl = (s) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
  const ICONES = {
    photo: `url("${new URL('assets/img/photos/photo-vignette.webp', document.baseURI).href}")`,
    logo: svgUrl('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"><rect width="60" height="60" fill="#f2f3f7"/><rect x="12" y="12" width="36" height="36" rx="10" fill="#3b6cf0"/><path d="M22 38V22l8 9 8-9v16" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>'),
    son: svgUrl('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"><defs><linearGradient id="a" x2="1" y2="1"><stop offset="0" stop-color="#ff5e7e"/><stop offset="1" stop-color="#c2185b"/></linearGradient></defs><rect width="60" height="60" rx="8" fill="url(#a)"/><path d="M14 30v0M20 22v16M26 16v28M32 24v12M38 18v24M44 26v8" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/></svg>'),
    doc: svgUrl('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 60"><path d="M0 0h34l14 14v46H0z" fill="#fff"/><path d="M34 0v14h14" fill="#dfe3ec"/><path d="M9 24h30M9 31h30M9 38h22M9 45h26" stroke="#2f6bf0" stroke-width="3" stroke-linecap="round"/></svg>'),
    pdf: svgUrl('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 60"><path d="M0 0h34l14 14v46H0z" fill="#fff"/><path d="M34 0v14h14" fill="#f3d6d4"/><rect x="6" y="34" width="36" height="16" rx="3" fill="#e5484d"/><text x="24" y="46" font-family="-apple-system,Helvetica" font-size="11" font-weight="800" fill="#fff" text-anchor="middle">PDF</text></svg>'),
    zip: svgUrl('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 60"><path d="M0 0h34l14 14v46H0z" fill="#f1e7c8"/><path d="M20 0h8v6h-8zM20 12h8v6h-8zM20 24h8v6h-8z" fill="#8a6a2a"/><rect x="18" y="34" width="12" height="12" rx="3" fill="#8a6a2a"/></svg>'),
  };
  const FICHIERS = {
    photo: { nom: 'photo.jpg', type: 'image', base: 'photo', ext: 'jpg', ic: ICONES.photo },
    logo: { nom: 'logo.png', type: 'image', base: 'logo', ext: 'png', ic: ICONES.logo },
    son: { nom: 'interview.m4a', type: 'audio', base: 'interview', ext: 'm4a', ic: ICONES.son },
    doc: { nom: 'rapport.docx', type: 'doc', base: 'rapport', ext: 'docx', ic: ICONES.doc, docu: true },
  };
  const MODES = {
    maj: { touche: '⇧', nom: 'Maj', titre: 'Convertir', couleur: '#2f7bff', ic: '#i-format' },
    cmd: { touche: '⌘', nom: 'Commande', titre: 'Outils', couleur: '#a35cf0', ic: '#i-baguette' },
    ctrl: { touche: '⌃', nom: 'Contrôle', titre: 'Actions', couleur: '#ff9f1a', ic: '#i-roue' },
  };
  function options(mode, f) {
    if (mode === 'ctrl') return ['AirDrop', 'Étagère', 'Copier', 'Déplacer', 'Chemin', 'Terminal'];
    if (mode === 'cmd') {
      if (f.type === 'image') return ['Compresser', 'Recadrer', 'Retoucher', 'Annoter', 'Fond', 'Détourer', 'Masquer', 'Pivoter', 'Métadonnées', 'ZIP'];
      return f.type === 'audio' ? ['Compresser', 'Métadonnées', 'ZIP'] : ['PDF', 'Métadonnées', 'ZIP'];
    }
    if (f.type === 'image') return ['PNG', 'JPG', 'HEIC', 'WebP', 'TIFF', 'GIF', 'PDF', 'ICNS', 'AVIF', 'BMP'].filter((x) => x.toLowerCase() !== f.ext);
    if (f.type === 'audio') return ['MP3', 'WAV', 'FLAC', 'AIFF', 'OGG', 'Opus'];
    return ['PDF', 'TXT', 'RTF', 'ODT', 'Markdown', 'HTML', 'EPUB'];
  }
  const libelle = (mode, o) => mode === 'maj' ? `Convertir en ${o}` : ({ Chemin: 'Copier le chemin', Terminal: 'Ouvrir dans le Terminal', Fond: 'Changer le fond', ZIP: 'Compresser en ZIP', PDF: 'Assembler en PDF' }[o] || o);
  const EXT = { Markdown: 'md', Opus: 'opus', JPG: 'jpg', ICNS: 'icns' };
  function resultat(mode, o, f) {
    if (mode === 'maj') {
      const ext = EXT[o] || o.toLowerCase();
      const nom = `${f.base}.${ext}`;
      const ic = ext === 'pdf' ? ICONES.pdf : f.type === 'image' ? f.ic : f.type === 'audio' ? ICONES.son : ICONES.doc;
      return { nouveau: { nom, ic, docu: f.type !== 'image' && f.type !== 'audio' || ext === 'pdf' }, sous: `${f.nom} → ${nom}` };
    }
    if (mode === 'cmd') {
      const suffixes = { Compresser: 'compressee', Recadrer: 'recadree', Retoucher: 'retouchee', Annoter: 'annotee', Fond: 'fond', Détourer: 'detouree', Masquer: 'masquee', Pivoter: 'pivotee', Métadonnées: 'sans-meta' };
      if (o === 'ZIP') return { nouveau: { nom: `${f.base}.zip`, ic: ICONES.zip, docu: true }, sous: `${f.nom} → ${f.base}.zip` };
      if (o === 'PDF') return { nouveau: { nom: `${f.base}.pdf`, ic: ICONES.pdf, docu: true }, sous: `${f.nom} → ${f.base}.pdf` };
      const ext = o === 'Détourer' ? 'png' : f.ext;
      const nom = `${f.base}-${suffixes[o]}.${ext}`;
      return { nouveau: { nom, ic: f.ic, docu: f.docu }, sous: o === 'Compresser' ? `${f.nom} → ${nom} · −58 %` : `${f.nom} → ${nom}` };
    }
    const sous = { AirDrop: `${f.nom} · prêt à partager`, Étagère: `${f.nom} ajouté à l’étagère`, Copier: `${f.nom} copié`, Déplacer: `${f.nom} déplacé dans Documents`, Chemin: `~/Bureau/${f.nom}`, Terminal: '~/Bureau' }[o];
    return { nouveau: null, sous };
  }

  const PAS_LIB = 69;
  let nRoue = 0;
  function eclaircir(hex, k) {
    const n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (255 - v) * k));
    return `rgb(${c.join(',')})`;
  }
  function Roue(hote) {
    const id = `rg${++nRoue}`;
    hote.innerHTML = `<div class="roue" data-style="uni" data-fond="sombre"><div class="roue-verre"></div>
      <svg viewBox="-110 -110 220 220" aria-hidden="true"><defs><radialGradient id="${id}" cx="0" cy="0" r="100" gradientUnits="userSpaceOnUse"><stop offset=".38" class="g1"/><stop offset="1" class="g2"/></radialGradient></defs><g class="secs"></g><g class="libs"></g></svg>
      <div class="roue-centre"><span><i class="rc-ic"></i><b></b></span></div>
      <div class="roue-modes"><span data-m="maj">⇧ Convertir</span><span data-m="cmd">⌘ Outils</span><span data-m="ctrl">⌃ Actions</span></div></div>`;
    const roue = $('.roue', hote), g = $('.secs', hote), l = $('.libs', hote), centre = $('.roue-centre b', hote), ic = $('.rc-ic', hote);
    let opts = [], mode = 'maj', actif = -1, pas = 0;
    const api = {
      hote, get index() { return actif; }, get options() { return opts; }, get mode() { return mode; },
      couleur(c) {
        roue.style.setProperty('--rc', c);
        roue.style.setProperty('--rgrad', `url(#${id})`);
        $('.g1', hote).setAttribute('stop-color', eclaircir(c, .55));
        $('.g2', hote).setAttribute('stop-color', c);
        return api;
      },
      style(s) { roue.dataset.style = s; return api; },
      fond(f) { roue.dataset.fond = f; return api; },
      remplir(o, m, fichier) {
        opts = o; mode = m; actif = -1; pas = 360 / o.length;
        const p = (a, r) => [Math.cos(a * Math.PI / 180) * r, Math.sin(a * Math.PI / 180) * r];
        g.innerHTML = ''; l.innerHTML = '';
        o.forEach((nom, i) => {
          const c = -90 + i * pas, a0 = c - pas / 2 + .9, a1 = c + pas / 2 - .9;
          const [x0, y0] = p(a0, 100), [x1, y1] = p(a1, 100), [x2, y2] = p(a1, 38), [x3, y3] = p(a0, 38);
          const grand = a1 - a0 > 180 ? 1 : 0;
          g.insertAdjacentHTML('beforeend', `<path class="sec" d="M${x0.toFixed(2)} ${y0.toFixed(2)}A100 100 0 ${grand} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}L${x2.toFixed(2)} ${y2.toFixed(2)}A38 38 0 ${grand} 0 ${x3.toFixed(2)} ${y3.toFixed(2)}Z"/>`);
          const [lx, ly] = p(c, PAS_LIB);
          const glyphe = m === 'maj' ? `<path class="lib-ic" d="M${lx - 4} ${ly - 15}h5l3 3v8h-8z"/>`
            : m === 'cmd' ? `<path class="lib-ic" d="M${lx} ${ly - 15}l1.4 3.6 3.6 1.4-3.6 1.4-1.4 3.6-1.4-3.6-3.6-1.4 3.6-1.4z"/>`
              : `<circle class="lib-ic" cx="${lx}" cy="${ly - 10.5}" r="4"/>`;
          l.insertAdjacentHTML('beforeend', `<g data-i="${i}">${glyphe}<text class="lib" x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}">${nom}</text></g>`);
        });
        $$('.roue-modes span', hote).forEach((s) => s.classList.toggle('on', s.dataset.m === m));
        ic.style.setProperty('--ic', fichier ? fichier.ic : ICONES.photo);
        centre.textContent = fichier ? fichier.nom : '';
        api.fichier = fichier;
        return api;
      },
      survol(i) {
        if (i === actif) return;
        actif = i;
        $$('.sec', g).forEach((s, k) => s.classList.toggle('on', k === i));
        $$('g[data-i]', l).forEach((s, k) => $$('*', s).forEach((e) => e.classList.toggle('on-lib', k === i)));
        centre.textContent = i < 0 ? (api.fichier ? api.fichier.nom : 'Annuler') : libelle(mode, opts[i]);
      },
      indexA(x, y) {
        const d = Math.hypot(x, y) * 220 / hote.offsetWidth;
        if (d < 36) return -1;
        let a = Math.atan2(y, x) * 180 / Math.PI + 90;
        if (a < 0) a += 360;
        return Math.round(a / pas) % opts.length;
      },
      centreDe(i) {
        const c = (-90 + i * pas) * Math.PI / 180, k = hote.offsetWidth / 220;
        return [Math.cos(c) * PAS_LIB * k, Math.sin(c) * PAS_LIB * k];
      },
      placer(x, y) { hote.style.left = `${x}px`; hote.style.top = `${y}px`; return api; },
      ouvrir() { hote.classList.remove('ferme'); void hote.offsetWidth; hote.classList.add('ouverte'); return api; },
      fermer() { hote.classList.remove('ouverte'); hote.classList.add('ferme'); api.survol(-1); return api; },
    };
    return api.couleur(MODES.maj.couleur);
  }

  function hud(boite, { titre, sous, mode = 'maj', duree = 900, garder = 2600 }) {
    const el = document.createElement('div');
    el.className = 'hud';
    el.style.setProperty('--hc', MODES[mode].couleur);
    el.style.setProperty('--dur', `${duree}ms`);
    el.innerHTML = `<span class="hud-ic"><svg><use href="${MODES[mode].ic}"/></svg><span class="ok"><svg><use href="#i-check"/></svg></span></span><span class="hud-t"><b></b><small></small><span class="hud-p"><i></i></span></span>`;
    $('b', el).textContent = titre;
    $('small', el).textContent = sous;
    boite.append(el);
    while (boite.children.length > 3) boite.firstElementChild.remove();
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('va')));
    const fini = attendre(reduit ? 50 : duree).then(() => el.classList.add('fini'));
    setTimeout(() => { el.classList.add('part'); setTimeout(() => el.remove(), 420); }, garder);
    return fini;
  }

  function fichierHTML(f, cl = '') {
    const d = document.createElement('div');
    d.className = `fic ${cl}`;
    d.innerHTML = `<i class="fic-v${f.docu ? ' doc' : ''}"></i><span></span>`;
    $('.fic-v', d).style.setProperty('--ic', f.ic);
    $('span', d).textContent = f.nom;
    return d;
  }
  const echelleDe = (plateau) => plateau.getBoundingClientRect().width / plateau.offsetWidth || 1;
  const posDans = (plateau, el) => {
    const p = plateau.getBoundingClientRect(), r = el.getBoundingClientRect(), s = echelleDe(plateau);
    return [(r.left + r.width / 2 - p.left) / s, (r.top + r.height / 2 - p.top) / s];
  };

  (() => {
    const scene = $('#scene');
    if (!scene) return;
    const hero = scene.closest('.hero'), grille = $('#fd-grid'), curseur = $('#curseur'), fantome = $('#fantome'), touche = $('#touche'), huds = $('#huds');
    const roue = Roue($('#roue-hero'));
    const cles = ['photo', 'logo', 'son', 'doc'];
    const initial = () => { grille.innerHTML = ''; cles.forEach((k) => { const e = fichierHTML(FICHIERS[k]); e.dataset.k = k; grille.append(e); }); };
    initial();
    const visible = async () => { while (hero.classList.contains('is-paused') || document.hidden) await attendre(400); };
    let cx = 1150, cy = 700;
    const bouger = async (x, y, ms, avecFantome) => {
      curseur.style.setProperty('--dur', `${ms}ms`);
      curseur.style.transform = `translate(${x - 4}px, ${y - 3}px)`;
      if (avecFantome) { fantome.style.transition = `opacity .2s, transform ${ms}ms var(--ease-io)`; fantome.style.transform = `translate(${x + 26}px, ${y + 30}px)`; }
      cx = x; cy = y;
      await attendre(ms);
    };
    curseur.style.transform = `translate(${cx}px, ${cy}px)`;

    if (reduit) {
      const f = FICHIERS.photo;
      roue.remplir(options('maj', f), 'maj', f).placer(790, 300).ouvrir().survol(0);
      curseur.style.transform = 'translate(790px, 210px)';
      return;
    }
    const scenarios = [['photo', 'maj', 'PNG'], ['doc', 'maj', 'PDF'], ['photo', 'cmd', 'Détourer'], ['logo', 'ctrl', 'AirDrop']];
    (async () => {
      await attendre(1600);
      for (;;) {
        for (const [k, mode, choix] of scenarios) {
          await visible();
          const f = FICHIERS[k], el = $(`.fic[data-k="${k}"]`, grille), [fx, fy] = posDans(scene, $('.fic-v', el));
          await bouger(fx, fy, 900);
          el.classList.add('sel'); curseur.classList.add('presse');
          await attendre(220);
          fantome.innerHTML = ''; fantome.append(fichierHTML(f));
          fantome.style.transition = 'none'; fantome.style.transform = `translate(${fx + 26}px, ${fy + 30}px)`;
          void fantome.offsetWidth; fantome.classList.add('vu');
          const dx = 800, dy = 300;
          await bouger(dx, dy, 1000, true);
          $('kbd', touche).textContent = MODES[mode].touche; $('small', touche).textContent = MODES[mode].nom;
          touche.style.setProperty('--hc', MODES[mode].couleur);
          touche.classList.add('vu'); await attendre(260); touche.classList.add('appuye');
          roue.couleur(MODES[mode].couleur).remplir(options(mode, f), mode, f).placer(dx, dy).ouvrir();
          await attendre(520);
          const i = roue.options.indexOf(choix), [ox, oy] = roue.centreDe(i);
          await bouger(dx + ox * .55, dy + oy * .55, 380, true);
          roue.survol(i);
          await bouger(dx + ox, dy + oy, 320, true);
          await attendre(650);
          curseur.classList.remove('presse'); fantome.classList.remove('vu'); roue.fermer();
          touche.classList.remove('appuye'); setTimeout(() => touche.classList.remove('vu'), 200);
          el.classList.remove('sel');
          const r = resultat(mode, choix, f);
          await hud(huds, { titre: libelle(mode, choix), sous: r.sous, mode, duree: 1000, garder: 3400 });
          if (r.nouveau) { const n = fichierHTML(r.nouveau, 'nouveau'); n.dataset.k = 'n'; grille.append(n); }
          await bouger(1000, 560, 900);
          await attendre(900);
        }
        await attendre(1200);
        $$('.fic[data-k="n"]', grille).forEach((n) => { n.style.transition = 'opacity .4s, transform .4s'; n.style.opacity = '0'; n.style.transform = 'scale(.6)'; });
        await attendre(450);
        initial();
      }
    })();
  })();

  (() => {
    const plateau = $('#essai');
    if (!plateau) return;
    const liste = $('#es-fichiers'), aide = $('#es-aide'), fantome = $('#fantome-essai'), huds = $('#huds-essai');
    const roue = Roue($('#roue-essai'));
    const boutons = $$('.es-t', plateau);
    ['photo', 'son', 'doc'].forEach((k) => { const e = fichierHTML(FICHIERS[k]); e.dataset.k = k; liste.append(e); });
    let glisse = null, ouverte = false, choisi = null, modeClic = null, modeTenu = null;
    const local = (e) => { const p = plateau.getBoundingClientRect(), s = echelleDe(plateau); return [(e.clientX - p.left) / s, (e.clientY - p.top) / s]; };
    const zone = $('#es-zone');
    const borner = (x, y) => {
      const g = zone.offsetLeft, h = zone.offsetTop, w = zone.offsetWidth, t = zone.offsetHeight, r = 150;
      const bx = w > 2 * r ? Math.min(Math.max(x, g + r), g + w - r) : g + w / 2;
      const by = t > 2 * r ? Math.min(Math.max(y, h + r), h + t - r) : h + t / 2;
      return [bx, by];
    };
    const centreZone = () => [zone.offsetLeft + zone.offsetWidth / 2, zone.offsetTop + zone.offsetHeight / 2 + 10];
    const fichierDe = (el) => FICHIERS[el.dataset.k] || el._f;
    const presser = (m) => boutons.forEach((b) => b.classList.toggle('tenue', b.dataset.mode === m));
    const dire = (t) => { aide.textContent = t; };

    function ouvrirRoue(mode, f, x, y) {
      roue.couleur(MODES[mode].couleur).remplir(options(mode, f), mode, f);
      const [bx, by] = borner(x, y);
      roue.placer(bx, by).ouvrir();
      roue.cx = bx; roue.cy = by;
      ouverte = true;
      presser(mode);
    }
    function fermerRoue() { if (ouverte) roue.fermer(); ouverte = false; presser(null); boutons.forEach((b) => b.setAttribute('aria-pressed', 'false')); modeClic = null; }
    async function executer(f) {
      const i = roue.index, mode = roue.mode;
      if (i < 0) { fermerRoue(); dire('Annulé : lâcher au centre ne fait rien.'); return; }
      const o = roue.options[i];
      fermerRoue();
      const r = resultat(mode, o, f);
      dire(`${libelle(mode, o)} : c’est fait.`);
      await hud(huds, { titre: libelle(mode, o), sous: r.sous, mode });
      if (r.nouveau) {
        const n = fichierHTML(r.nouveau, 'nouveau');
        n._f = { ...r.nouveau, type: mode === 'maj' ? f.type : f.type, base: r.nouveau.nom.replace(/\.[^.]+$/, ''), ext: r.nouveau.nom.split('.').pop() };
        if (r.nouveau.ic === ICONES.pdf || r.nouveau.ic === ICONES.zip) n._f.type = 'doc';
        liste.append(n);
        const nouveaux = $$('.fic.nouveau', liste);
        if (nouveaux.length > 3) nouveaux[0].remove();
      }
    }
    const modeClavier = (e) => (e.shiftKey ? 'maj' : e.metaKey ? 'cmd' : e.ctrlKey ? 'ctrl' : null);

    liste.addEventListener('pointerdown', (e) => {
      const el = e.target.closest('.fic');
      if (!el || ouverte) return;
      e.preventDefault();
      const [x, y] = local(e);
      glisse = { el, f: fichierDe(el), x0: x, y0: y, bouge: false, id: e.pointerId };
    });
    plateau.addEventListener('contextmenu', (e) => e.preventDefault());
    addEventListener('pointermove', (e) => {
      if (!glisse || e.pointerId !== glisse.id) {
        if (ouverte && modeClic) { const [x, y] = local(e); roue.survol(roue.indexA(x - roue.cx, y - roue.cy)); }
        return;
      }
      const [x, y] = local(e);
      if (!glisse.bouge && Math.hypot(x - glisse.x0, y - glisse.y0) > 6) {
        glisse.bouge = true;
        glisse.el.classList.add('pris');
        fantome.innerHTML = ''; fantome.append(fichierHTML(glisse.f)); fantome.classList.add('vu');
        if (!modeTenu) dire('Maintenant, maintenez ⇧, ⌘ ou ⌃ (ou touchez une touche ci-dessous).');
      }
      if (!glisse.bouge) return;
      fantome.style.transform = `translate(${x + 22}px, ${y + 24}px)`;
      const mode = modeClavier(e) || modeTenu;
      if (mode && (!ouverte || roue.mode !== mode)) ouvrirRoue(mode, glisse.f, x, y);
      if (!mode && ouverte && !modeTenu) fermerRoue();
      if (ouverte) roue.survol(roue.indexA(x - roue.cx, y - roue.cy));
    }, { passive: true });
    addEventListener('pointerup', (e) => {
      if (!glisse || e.pointerId !== glisse.id) return;
      const g = glisse; glisse = null;
      g.el.classList.remove('pris'); fantome.classList.remove('vu');
      if (!g.bouge) {
        $$('.fic', liste).forEach((f) => f.classList.toggle('sel', f === g.el));
        choisi = g.f;
        dire(`${choisi.nom} choisi. Touchez ⇧, ⌘ ou ⌃.`);
        return;
      }
      if (ouverte) executer(g.f); else dire('Lâché sans touche : rien ne se passe. Réessayez en maintenant ⇧, ⌘ ou ⌃.');
      modeTenu = null;
    });
    addEventListener('keydown', (e) => {
      if (!glisse || !glisse.bouge) return;
      const m = e.key === 'Shift' ? 'maj' : e.key === 'Meta' ? 'cmd' : e.key === 'Control' ? 'ctrl' : null;
      if (m && (!ouverte || roue.mode !== m)) { const r = fantome.getBoundingClientRect(), p = plateau.getBoundingClientRect(), s = echelleDe(plateau); ouvrirRoue(m, glisse.f, (r.left - p.left) / s - 22, (r.top - p.top) / s - 24); }
    });
    boutons.forEach((b) => b.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      const m = b.dataset.mode;
      if (glisse && glisse.bouge) { modeTenu = m; b.setAttribute('aria-pressed', 'true'); const r = fantome.getBoundingClientRect(), p = plateau.getBoundingClientRect(), s = echelleDe(plateau); ouvrirRoue(m, glisse.f, (r.left - p.left) / s - 22, (r.top - p.top) / s - 24); return; }
      if (ouverte && modeClic === m) { fermerRoue(); return; }
      const f = choisi || FICHIERS.photo;
      if (!choisi) { const el = $('.fic[data-k="photo"]', liste); el.classList.add('sel'); choisi = f; }
      modeClic = m; b.setAttribute('aria-pressed', 'true');
      ouvrirRoue(m, f, ...centreZone());
      dire('Choisissez une option sur la roue, ou le centre pour annuler.');
    }));
    $('#roue-essai').addEventListener('click', (e) => {
      if (!modeClic || !ouverte) return;
      const [x, y] = local(e);
      roue.survol(roue.indexA(x - roue.cx, y - roue.cy));
      executer(choisi || FICHIERS.photo);
    });
  })();

  (() => {
    const types = $('#fm-types');
    if (!types) return;
    const T = {
      Images: { lit: ['JPG', 'PNG', 'HEIC', 'TIFF', 'BMP', 'GIF', 'PDF', 'WebP', 'AVIF', 'SVG', 'RAW'], ecrit: ['JPG', 'PNG', 'HEIC', 'TIFF', 'BMP', 'GIF', 'PDF', 'ICO', 'ICNS'], plus: ['WebP', 'AVIF'], outil: 'ffmpeg' },
      Vidéo: { lit: ['MP4', 'MOV', 'GIF'], ecrit: ['MP4', 'MOV', 'GIF', 'M4A'], plus: ['WebM', 'MKV', 'AVI', 'WMV'], plusLit: ['WebM', 'MKV', 'AVI', 'WMV'], outil: 'ffmpeg' },
      Audio: { lit: ['M4A', 'WAV', 'FLAC', 'AIFF'], ecrit: ['M4A', 'WAV', 'FLAC', 'AIFF'], plus: ['MP3', 'OGG', 'Opus', 'WMA'], plusLit: ['MP3', 'OGG', 'Opus', 'WMA'], outil: 'ffmpeg' },
      Documents: { lit: ['DOCX', 'RTF', 'ODT', 'TXT', 'Markdown', 'HTML', 'EPUB', 'PDF'], ecrit: ['PDF', 'DOCX', 'RTF', 'ODT', 'TXT', 'Markdown', 'HTML', 'EPUB', 'images'], plusLit: ['PPTX', 'PPT', 'ODP'], plus: [], outil: 'LibreOffice' },
      Tableurs: { lit: ['CSV', 'TSV', 'XLSX', 'JSON'], ecrit: ['CSV', 'TSV', 'XLSX', 'JSON', 'HTML', 'PDF'], plusLit: ['XLS', 'ODS'], plus: [], outil: 'LibreOffice' },
      Archives: { lit: ['ZIP', 'TAR', 'GZ', 'SRT', 'VTT'], ecrit: ['ZIP', 'TAR', 'GZ', 'SRT', 'VTT'], plusLit: ['RAR', '7Z'], plus: [], outil: 'unar' },
    };
    const extra = $('#fm-extra'), lit = $('#fm-lit'), ecrit = $('#fm-ecrit'), note = $('#fm-note');
    let courant = 'Images';
    types.innerHTML = Object.keys(T).map((k, i) => `<button type="button" role="radio" aria-checked="${i === 0}" data-v="${k}">${k}</button>`).join('');
    const puces = (boite, base, plus) => {
      boite.innerHTML = '';
      [...base.map((x) => [x, '']), ...(extra.checked ? plus : []).map((x) => [x, 'ext'])].forEach(([x, c], i) => {
        const s = document.createElement('span'); s.textContent = x; s.className = c; s.style.setProperty('--i', i); boite.append(s);
      });
    };
    function rendre() {
      const t = T[courant];
      puces(lit, t.lit, t.plusLit || []);
      puces(ecrit, t.ecrit, t.plus || []);
      note.textContent = extra.checked ? `En violet : formats ajoutés par ${t.outil}, détecté automatiquement (Homebrew ou MacPorts).` : 'Formats natifs de macOS. Activez les outils facultatifs pour voir ce qu’ils ajoutent.';
    }
    types.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      courant = b.dataset.v;
      $$('button', types).forEach((x) => x.setAttribute('aria-checked', x === b));
      rendre();
    });
    extra.addEventListener('change', rendre);
    rendre();
  })();

  (() => {
    const image = $('#rt-image');
    if (!image) return;
    const svg = $('svg', image), curseurs = $$('.rt-c input', image.parentElement), v = { expo: 0, contr: 0, satur: 0, chal: 0 };
    const remplir = (inp) => inp.style.setProperty('--p', `${(inp.value - inp.min) / (inp.max - inp.min) * 100}%`);
    function appliquer() {
      const chaud = v.chal > 0 ? `sepia(${v.chal / 120})` : `hue-rotate(${v.chal * .5}deg)`;
      svg.style.filter = `brightness(${1 + v.expo / 100}) contrast(${1 + v.contr / 100}) saturate(${1 + v.satur / 100}) ${chaud}`;
      curseurs.forEach((c) => { $(`#o-${c.dataset.f}`).textContent = (c.value > 0 ? '+' : '') + c.value; remplir(c); });
    }
    curseurs.forEach((c) => c.addEventListener('input', () => { v[c.dataset.f] = Number(c.value); appliquer(); }));
    const fond = $('#rt-fond');
    fond.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      $$('button', fond).forEach((x) => x.setAttribute('aria-checked', x === b));
      image.classList.toggle('detoure', b.dataset.v === 'detourer');
    });
    $('#rt-annuler').addEventListener('click', () => { curseurs.forEach((c) => { c.value = 0; v[c.dataset.f] = 0; }); image.classList.remove('detoure'); $$('button', fond).forEach((x, i) => x.setAttribute('aria-checked', i === 0)); appliquer(); });
    const ok = $('#rt-ok');
    ok.addEventListener('click', async () => {
      image.classList.remove('flash'); void image.offsetWidth; image.classList.add('flash');
      ok.textContent = 'photo-retouchée.jpg ✓';
      await attendre(1800); ok.textContent = 'Retoucher la photo';
    });
    appliquer();
    image.closest('[data-reveal]').addEventListener('apparu', async () => {
      if (reduit) return;
      await attendre(700);
      const cible = { expo: 14, contr: 12, satur: 36, chal: 18 }, t0 = performance.now();
      const pas = (t) => {
        const k = Math.min((t - t0) / 1400, 1), e = 1 - (1 - k) ** 3;
        curseurs.forEach((c) => { const f = c.dataset.f; v[f] = Math.round(cible[f] * e); c.value = v[f]; });
        appliquer();
        if (k < 1) requestAnimationFrame(pas);
      };
      requestAnimationFrame(pas);
    }, { once: true });

    const q = $('#comp-q');
    const majPoids = () => {
      const k = q.value / 100, mo = 3.2 * (.1 + .9 * k ** 1.8);
      $('#comp-qv').textContent = q.value;
      $('#comp-poids').textContent = mo >= 1 ? `${mo.toFixed(1).replace('.', ',')} Mo` : `${Math.round(mo * 1000)} Ko`;
      $('#comp-gain').textContent = `−${Math.round((1 - mo / 3.2) * 100)} %`;
      remplir(q);
    };
    q.addEventListener('input', majPoids);
    majPoids();
  })();

  (() => {
    const hote = $('#roue-reglages');
    if (!hote) return;
    const roue = Roue(hote), section = hote.closest('.chap');
    const PALETTE = { Bleu: '#0a84ff', Indigo: '#5e5ce6', Violet: '#bf5af2', Rose: '#ff375f', Rouge: '#ff453a', Orange: '#ff9f0a', Jaune: '#ffd60a', Vert: '#30d158', Menthe: '#63e6e2', Graphite: '#8e8e93' };
    const reglage = { mode: 'maj', couleurs: { maj: '#0a84ff', cmd: '#bf5af2', ctrl: '#ff9f0a' }, style: 'uni', fond: 'sombre' };
    const nuancier = $('#rg-couleurs');
    nuancier.innerHTML = Object.entries(PALETTE).map(([n, c]) => `<button type="button" role="radio" aria-checked="false" aria-label="${n}" style="--c:${c}" data-c="${c}"></button>`).join('');
    function rendre() {
      const m = reglage.mode;
      roue.remplir(options(m, FICHIERS.photo), m, FICHIERS.photo).couleur(reglage.couleurs[m]).style(reglage.style).fond(reglage.fond);
      $$('button', nuancier).forEach((b) => b.setAttribute('aria-checked', b.dataset.c === reglage.couleurs[m]));
    }
    const groupe = (sel, f) => $(sel).addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      $$('button', $(sel)).forEach((x) => x.setAttribute('aria-checked', x === b));
      f(b.dataset.v); rendre();
    });
    groupe('#rg-mode', (v) => { reglage.mode = v; });
    groupe('#rg-style', (v) => { reglage.style = v; });
    groupe('#rg-fond', (v) => { reglage.fond = v; });
    groupe('#rg-taille', (v) => { hote.style.setProperty('--t', v); });
    nuancier.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; reglage.couleurs[reglage.mode] = b.dataset.c; rendre(); });
    rendre();
    let survolee = false, i = 0;
    hote.addEventListener('pointermove', (e) => {
      survolee = true;
      const r = hote.getBoundingClientRect(), k = hote.offsetWidth / r.width;
      roue.survol(roue.indexA((e.clientX - r.left - r.width / 2) * k, (e.clientY - r.top - r.height / 2) * k));
    });
    hote.addEventListener('pointerleave', () => { survolee = false; });
    if (!reduit) setInterval(() => {
      if (survolee || section.classList.contains('is-paused')) return;
      i = (i + 1) % roue.options.length;
      roue.survol(i);
    }, 750);
    else roue.survol(0);
  })();

  (() => {
    const boite = $('#huds-atelier');
    if (!boite || reduit) return;
    const section = boite.closest('.section');
    const suite = [['Compresser', '3 fichiers · −61 %', 'cmd'], ['Convertir en PNG', 'photo.jpg → photo.png', 'maj'], ['Convertir en WebP', 'logo.png → logo.webp', 'maj'], ['AirDrop', 'rapport.pdf · prêt à partager', 'ctrl']];
    let k = 0;
    setInterval(() => {
      if (section.classList.contains('is-paused') || document.hidden) return;
      const [titre, sous, mode] = suite[k++ % suite.length];
      hud(boite, { titre, sous, mode, duree: 1300, garder: 4200 });
    }, 1700);
  })();
})();

(() => {
  const images = [...document.querySelectorAll('image[data-href]')];
  if (!images.length) return;
  const poser = (im) => { im.setAttribute('href', im.getAttribute('data-href')); im.removeAttribute('data-href'); };
  if (!('IntersectionObserver' in window)) { images.forEach(poser); return; }
  const dessins = [...new Set(images.map((im) => im.ownerSVGElement).filter(Boolean))];
  const io = new IntersectionObserver((entrees) => entrees.forEach((en) => {
    if (!en.isIntersecting) return;
    io.unobserve(en.target);
    en.target.querySelectorAll('image[data-href]').forEach(poser);
  }), { rootMargin: '1500px 0px' });
  dessins.forEach((d) => io.observe(d));
})();
