// Mue — la roue et le geste « glisser + touche », rejoués dans la page.
// On commence à glisser un fichier du bureau, on touche ⇧ (Convertir), ⌘ (Outils) ou ⌃ (Actions) :
// une roue s'ouvre sous le pointeur. On lâche sur une option, la copie apparaît à côté de l'original.
// Au doigt, la roue s'ouvre quand on garde le fichier appuyé. Au clavier, Entrée sur un fichier.
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ROUES = {
    convertir: { nom: 'Convertir', couleur: '#2f7bf6', options: {
      image: ['PNG', 'JPG', 'WebP', 'TIFF', 'AVIF', 'BMP', 'GIF', 'PDF', 'ICO', 'ICNS'],
      video: ['MP4', 'GIF', 'M4A', 'WebM', 'MKV', 'AVI'],
      doc: ['PDF', 'TXT', 'RTF', 'ODT', 'Markdown', 'HTML', 'EPUB'] } },
    outils: { nom: 'Outils', couleur: '#a14df0', options: {
      image: ['Compresser', 'Recadrer', 'Retoucher', 'Fond', 'Détourer', 'Masquer', 'Pivoter', 'Métadonnées'],
      video: ['Compresser', 'Recadrer', 'Pivoter', 'Métadonnées', 'ZIP'],
      doc: ['Compresser', 'PDF', 'Métadonnées', 'ZIP'] } },
    actions: { nom: 'Actions', couleur: '#f08a24', options: {
      tout: ['AirDrop', 'Étagère', 'Copier', 'Déplacer', 'Copier le chemin', 'Terminal'] } },
  };
  const TOUCHES = { Shift: 'convertir', Meta: 'outils', Control: 'actions' };

  // Petits pictogrammes, dessinés au trait (24 × 24).
  const PICTO = {
    format: 'M5 6h14v12H5zM5 15l4-4 4 4 2-2 4 4',
    Compresser: 'M9 4v5H4M15 20v-5h5M4 4l5 5M20 20l-5-5', Recadrer: 'M7 3v14h14M3 7h14v14', Retoucher: 'M4 8h10M18 8h2M4 16h4M12 16h8M14 5v6M8 13v6',
    Fond: 'M4 5h16v14H4zM4 15l5-5 4 4 3-3 4 4', Détourer: 'M12 4a6 6 0 1 0 0 12 6 6 0 1 0 0-12M4 20h16', Masquer: 'M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6M4 4l16 16',
    Pivoter: 'M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4', Métadonnées: 'M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18M12 11v6M12 7.5v.5', ZIP: 'M7 3h10v18H7zM12 5v2M12 9v2M12 13v2', PDF: 'M7 3h7l4 4v14H7zM14 3v4h4',
    AirDrop: 'M12 13a1.5 1.5 0 1 0 0 .1M8 17a6 6 0 1 1 8 0M5 20a10 10 0 1 1 14 0', Étagère: 'M4 7h16v4H4zM6 11v8h12v-8M10 15h4', Copier: 'M8 8h11v12H8zM5 16V4h11',
    Déplacer: 'M3 7h7l2 2h9v11H3zM12 13h6M15 10l3 3-3 3', 'Copier le chemin': 'M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1', Terminal: 'M3 5h18v14H3zM7 10l3 2-3 2M12 15h5',
  };

  const el = (n, a = {}, parent) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (parent) parent.appendChild(e); return e; };
  const rad = (d) => (d - 90) * Math.PI / 180;
  const pt = (r, a) => [r * Math.cos(rad(a)), r * Math.sin(rad(a))];
  const secteur = (r1, r2, a1, a2) => {
    const [x1, y1] = pt(r2, a1), [x2, y2] = pt(r2, a2), [x3, y3] = pt(r1, a2), [x4, y4] = pt(r1, a1);
    const g = a2 - a1 > 180 ? 1 : 0;
    return `M${x1} ${y1}A${r2} ${r2} 0 ${g} 1 ${x2} ${y2}L${x3} ${y3}A${r1} ${r1} 0 ${g} 0 ${x4} ${y4}Z`;
  };
  const eclaircir = (hex, t) => { const n = parseInt(hex.slice(1), 16); const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (255 - v) * t)); return `rgb(${c.join(',')})`; };

  // Dessine une roue dans un conteneur. Renvoie de quoi la piloter (surbrillance, centre).
  let compteur = 0;
  const dessiner = (boite, { options, couleur, style = 'degrade', centre = '', fichier = 'image', prefixe = '' }) => {
    boite.innerHTML = '';
    const id = 'mue-g' + (++compteur);
    const svg = el('svg', { viewBox: '-150 -150 300 300', class: 'roue-svg' }, boite);
    const defs = el('defs', {}, svg);
    const lg = el('linearGradient', { id, x1: '0', y1: '0', x2: '1', y2: '1' }, defs);
    el('stop', { offset: '0', 'stop-color': eclaircir(couleur, 0.35) }, lg);
    el('stop', { offset: '1', 'stop-color': couleur }, lg);
    el('circle', { r: 146, class: 'roue-disque' }, svg);
    const n = options.length, pas = 360 / n, R1 = 54, R2 = 144;
    const secteurs = options.map((o, i) => {
      const g = el('g', { class: 'roue-secteur' }, svg);
      const a1 = i * pas - pas / 2 + 1.2, a2 = (i + 1) * pas - pas / 2 - 1.2;
      el('path', { d: secteur(R1 + 2, R2 - 2, a1, a2), class: 'roue-fond-s' }, g);
      const [cx, cy] = pt((R1 + R2) / 2, i * pas);
      const p = PICTO[o] || PICTO.format;
      el('path', { d: p, transform: `translate(${cx - 9} ${cy - 18}) scale(.75)`, class: 'roue-picto' }, g);
      const t = el('text', { x: cx, y: cy + 14, class: 'roue-texte' + (o.length > 9 ? ' roue-texte-long' : '') }, g);
      t.textContent = o;
      return g;
    });
    el('circle', { r: R1 - 2, class: 'roue-centre' }, svg);
    const ic = el('g', { class: 'roue-centre-icone fi-' + fichier }, svg);
    el('rect', { x: -13, y: -30, width: 26, height: 22, rx: 4 }, ic);
    const tc = el('text', { x: 0, y: 12, class: 'roue-centre-texte' }, svg);
    const tc2 = el('text', { x: 0, y: 25, class: 'roue-centre-texte roue-centre-fort' }, svg);
    boite.style.setProperty('--c', couleur);
    boite.style.setProperty('--grad', `url(#${id})`);
    boite.dataset.style = style;
    let actif = -1;
    const legende = (i) => {
      if (i < 0) { tc.textContent = centre ? centre.split('|')[0] : ''; tc2.textContent = centre ? centre.split('|')[1] || '' : ''; return; }
      tc.textContent = prefixe; tc2.textContent = options[i];
    };
    const surbriller = (i) => {
      if (i === actif) return;
      actif = i;
      secteurs.forEach((s, k) => s.classList.toggle('est-actif', k === i));
      legende(i);
    };
    legende(-1);
    // Quel secteur se trouve sous un point (coordonnées relatives au centre, en pixels) ?
    const viser = (dx, dy) => {
      const r = boite.getBoundingClientRect().width / 300;
      const d = Math.hypot(dx, dy) / r;
      if (d < R1 || d > R2 + 60) return -1;
      let a = Math.atan2(dy, dx) * 180 / Math.PI + 90;
      a = (a + pas / 2 + 360) % 360;
      return Math.floor(a / pas) % n;
    };
    return { surbriller, viser, options, get actif() { return actif; } };
  };
  window.MueRoue = { dessiner, ROUES };

  // ---------------------------------------------------------------------------------------------
  // Le bureau du premier écran
  const bureau = document.querySelector('[data-bureau]');
  if (!bureau) return;
  const boite = bureau.querySelector('[data-roue]');
  const pointeur = bureau.querySelector('[data-pointeur]');
  const banniere = bureau.querySelector('[data-banniere]');
  const annonce = document.querySelector('[data-annonce]');
  const touches = [...bureau.querySelectorAll('[data-touche]')];
  let fichiers = [...bureau.querySelectorAll('[data-fichier]')];
  let roue = null, typeRoue = '', glisse = null, demoActive = !calme, demoJeton = 0, visible = true, attente = 0;

  const optionsPour = (type, f) => {
    const r = ROUES[type], o = r.options.tout || r.options[f.dataset.type] || [];
    return o.filter((x) => x.toLowerCase() !== f.dataset.ext);
  };
  const posDans = (x, y) => { const b = bureau.getBoundingClientRect(); return [x - b.left, y - b.top]; };

  const ouvrir = (type, f, x, y) => {
    typeRoue = type;
    const R = ROUES[type];
    const b = bureau.getBoundingClientRect(), taille = Math.min(300, b.width * 0.62, b.height * 0.86);
    const cx = Math.max(taille / 2 + 6, Math.min(b.width - taille / 2 - 6, x)), cy = Math.max(taille / 2 + 6, Math.min(b.height - taille / 2 - 6, y));
    boite.style.width = boite.style.height = taille + 'px';
    boite.style.left = cx + 'px'; boite.style.top = cy + 'px';
    roue = dessiner(boite, { options: optionsPour(type, f), couleur: R.couleur, centre: `${f.dataset.nom}.${f.dataset.ext}|${R.nom}`, fichier: f.dataset.type, prefixe: type === 'convertir' ? 'Convertir en' : '' });
    roue.cx = cx; roue.cy = cy;
    boite.dataset.fond = document.documentElement.dataset.theme === 'light' ? 'clair' : 'sombre';
    boite.classList.remove('est-ouverte'); void boite.offsetWidth; boite.classList.add('est-ouverte');
    touches.forEach((t) => t.classList.toggle('est-active', t.dataset.touche === type));
  };
  const fermer = () => {
    boite.classList.remove('est-ouverte'); roue = null; typeRoue = '';
    touches.forEach((t) => t.classList.remove('est-active'));
  };
  const viser = (x, y) => { if (roue) roue.surbriller(roue.viser(x - roue.cx, y - roue.cy)); };

  // Le résultat : une copie qui naît de l'original, et la bannière de l'app.
  const resultat = (f, option) => {
    const type = typeRoue, nom = f.dataset.nom, ext = f.dataset.ext;
    let titre, sous, nouveau = null;
    if (type === 'convertir') {
      const e = option.toLowerCase() === 'markdown' ? 'md' : option.toLowerCase();
      titre = `Convertir en ${option}`; sous = `${nom}.${ext} → ${nom}.${e}`;
      nouveau = { nom, ext: e, type: ['mp4', 'webm', 'mkv', 'avi', 'mov'].includes(e) ? 'video' : ['png', 'jpg', 'webp', 'tiff', 'avif', 'bmp', 'gif', 'ico', 'icns'].includes(e) ? 'image' : e === 'm4a' ? 'audio' : 'doc' };
    } else if (type === 'outils') {
      const suff = { Compresser: '-compresse', Recadrer: '-recadre', Retoucher: '-retouche', Fond: '-fond', Détourer: '-detoure', Masquer: '-masque', Pivoter: '-pivote', Métadonnées: '-sans-meta' }[option];
      titre = option; sous = option === 'ZIP' ? `${nom}.${ext} → ${nom}.zip` : option === 'PDF' ? `${nom}.${ext} → ${nom}.pdf` : `${nom}.${ext} → ${nom}${suff}.${ext}`;
      nouveau = option === 'ZIP' ? { nom, ext: 'zip', type: 'doc' } : option === 'PDF' ? { nom, ext: 'pdf', type: 'doc' } : { nom: nom + suff, ext, type: f.dataset.type };
    } else {
      titre = option; sous = { AirDrop: 'Partage proposé aux appareils proches', 'Étagère': `${nom}.${ext} posé sur l’étagère`, Copier: `${nom}.${ext} copié`, 'Déplacer': 'Choisissez un dossier', 'Copier le chemin': `~/Bureau/${nom}.${ext}`, Terminal: 'Terminal ouvert dans le dossier' }[option];
    }
    banniere.querySelector('[data-banniere-t]').textContent = titre;
    banniere.querySelector('[data-banniere-s]').textContent = sous;
    banniere.style.setProperty('--c', ROUES[type].couleur);
    banniere.classList.remove('est-visible'); void banniere.offsetWidth; banniere.classList.add('est-visible');
    clearTimeout(banniere._t); banniere._t = setTimeout(() => banniere.classList.remove('est-visible'), 2600);
    if (annonce) annonce.textContent = `${titre} : ${sous}.`;
    if (!nouveau) return;
    // La copie apparaît à côté de l'original, en « muant » depuis lui.
    const copie = f.cloneNode(true);
    copie.dataset.nom = nouveau.nom; copie.dataset.ext = nouveau.ext; copie.dataset.type = nouveau.type;
    copie.querySelector('.fichier-nom').textContent = `${nouveau.nom}.${nouveau.ext}`;
    copie.querySelector('.fichier-icone').className = 'fichier-icone fi-' + nouveau.type;
    const x = parseFloat(f.style.getPropertyValue('--x')), y = parseFloat(f.style.getPropertyValue('--y'));
    const libre = (px, py) => !fichiers.some((g) => Math.abs(parseFloat(g.style.getPropertyValue('--x')) - px) < 11 && Math.abs(parseFloat(g.style.getPropertyValue('--y')) - py) < 16);
    let nx = x + 14, ny = y;
    for (let k = 0; k < 10 && !libre(nx, ny); k++) { nx = x + 14 * ((k % 3) + 1); ny = y + (k > 2 ? -18 * Math.ceil((k - 2) / 3) : 0); }
    copie.style.setProperty('--x', Math.min(84, nx) + '%'); copie.style.setProperty('--y', Math.max(10, Math.min(86, ny)) + '%');
    copie.style.setProperty('--dx', (x - nx) * bureau.clientWidth / 100 + 'px');
    copie.style.removeProperty('transform');
    copie.classList.add('est-nouveau');
    copie.classList.remove('est-glisse');
    bureau.insertBefore(copie, boite);
    brancher(copie);
    fichiers.push(copie);
    // Le bureau garde au plus six fichiers créés : les plus anciens s'effacent.
    const crees = fichiers.filter((g) => g.classList.contains('est-nouveau'));
    if (crees.length > 6) { const vieux = crees[0]; vieux.classList.add('est-efface'); fichiers = fichiers.filter((g) => g !== vieux); setTimeout(() => vieux.remove(), 400); }
  };

  const lacher = (f, appliquer) => {
    const option = roue && roue.actif >= 0 ? roue.options[roue.actif] : null;
    if (appliquer && option) resultat(f, option);
    fermer();
    f.classList.remove('est-glisse');
    f.style.transform = '';
  };

  // Geste à la souris ou au doigt.
  const brancher = (f) => {
    f.addEventListener('pointerdown', (e) => {
      if (e.button > 0) return;
      e.preventDefault();
      arreterDemo();
      const [x, y] = posDans(e.clientX, e.clientY);
      glisse = { f, x0: x, y0: y, x, y, id: e.pointerId, tactile: e.pointerType !== 'mouse' };
      f.setPointerCapture(e.pointerId);
      f.classList.add('est-glisse');
      clearTimeout(attente);
      // Sans touche, la roue de conversion s'ouvre d'elle-même (tout de suite au doigt, après un temps à la souris).
      attente = setTimeout(() => { if (glisse && !roue) ouvrir(glisse.preferee || 'convertir', f, glisse.x, glisse.y); }, glisse.tactile ? 380 : 1100);
    });
    f.addEventListener('pointermove', (e) => {
      if (!glisse || glisse.f !== f || e.pointerId !== glisse.id) return;
      const [x, y] = posDans(e.clientX, e.clientY);
      glisse.x = x; glisse.y = y;
      f.style.transform = `translate(${x - glisse.x0}px, ${y - glisse.y0}px)`;
      viser(x, y);
    });
    const fin = (e) => { if (!glisse || glisse.f !== f) return; clearTimeout(attente); lacher(f, e.type === 'pointerup'); glisse = null; };
    f.addEventListener('pointerup', fin);
    f.addEventListener('pointercancel', fin);
    // Au clavier : Entrée ouvre la roue sur le fichier, les flèches choisissent, Entrée applique, Échap annule.
    f.addEventListener('keydown', (e) => {
      const [x, y] = (() => { const b = f.getBoundingClientRect(); return posDans(b.left + b.width / 2, b.top + b.height / 2); })();
      if (!roue && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); arreterDemo(); ouvrir('convertir', f, x, y); roue.surbriller(0); return; }
      if (!roue) return;
      if (e.key === 'Escape') { e.preventDefault(); fermer(); return; }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); roue.surbriller((roue.actif + 1) % roue.options.length); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); roue.surbriller((roue.actif - 1 + roue.options.length) % roue.options.length); }
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const o = roue.options[roue.actif]; if (o) resultat(f, o); fermer(); }
      if (TOUCHES[e.key]) { e.preventDefault(); ouvrir(TOUCHES[e.key], f, x, y); roue.surbriller(0); }
    });
    f.addEventListener('blur', () => { if (roue && !glisse) fermer(); });
  };
  fichiers.forEach(brancher);

  // Les touches ⇧ ⌘ ⌃ pendant le glisser.
  addEventListener('keydown', (e) => {
    if (!glisse || !TOUCHES[e.key] || e.repeat) return;
    e.preventDefault();
    clearTimeout(attente);
    ouvrir(TOUCHES[e.key], glisse.f, glisse.x, glisse.y);
    viser(glisse.x, glisse.y);
  });
  // Au doigt, les étiquettes du bas choisissent la roue qui s'ouvrira.
  touches.forEach((t) => t.addEventListener('pointerdown', (e) => { if (glisse) { e.preventDefault(); ouvrir(t.dataset.touche, glisse.f, glisse.x, glisse.y); } }));

  // ---------------------------------------------------------------------------------------------
  // Démonstration : tant que personne n'a touché au bureau, un pointeur fait le geste tout seul.
  const pause = (ms, j) => new Promise((r, rej) => setTimeout(() => (j === demoJeton ? r() : rej()), ms));
  const allerA = async (x, y, ms, j, f) => {
    pointeur.style.transition = `left ${ms}ms cubic-bezier(.4,0,.2,1), top ${ms}ms cubic-bezier(.4,0,.2,1)`;
    pointeur.style.left = x + 'px'; pointeur.style.top = y + 'px';
    if (f) { f.style.transition = `transform ${ms}ms cubic-bezier(.4,0,.2,1)`; f.style.transform = `translate(${x - f._x0}px, ${y - f._y0}px)`; }
    const t0 = performance.now();
    while (performance.now() - t0 < ms) { await pause(40, j); if (roue) viser(parseFloat(pointeur.style.left), parseFloat(pointeur.style.top)); }
  };
  const scenarios = [
    { i: 0, type: 'convertir', option: 'PNG' },
    { i: 1, type: 'outils', option: 'Compresser' },
    { i: 2, type: 'convertir', option: 'PDF' },
    { i: 0, type: 'actions', option: 'Étagère' },
  ];
  const demo = async () => {
    const j = ++demoJeton;
    bureau.classList.add('est-demo');
    let k = 0;
    try {
      await pause(900, j);
      while (demoActive) {
        if (!visible || document.hidden) { await pause(500, j); continue; }
        const s = scenarios[k++ % scenarios.length];
        const f = fichiers.filter((g) => !g.classList.contains('est-nouveau'))[s.i];
        const b = f.getBoundingClientRect(), [fx, fy] = posDans(b.left + b.width / 2, b.top + b.height * 0.35);
        f._x0 = fx; f._y0 = fy;
        await allerA(fx, fy, 900, j);
        pointeur.classList.add('est-clic'); f.classList.add('est-glisse');
        const W = bureau.clientWidth, H = bureau.clientHeight;
        const cx = W * 0.6, cy = H * 0.5;
        await allerA(cx, cy, 800, j, f);
        const t = touches.find((x) => x.dataset.touche === s.type);
        t.classList.add('est-pressee'); await pause(220, j);
        ouvrir(s.type, f, cx, cy); t.classList.remove('est-pressee');
        await pause(500, j);
        const idx = roue.options.indexOf(s.option), n = roue.options.length;
        const a = rad(idx * (360 / n)), r = boite.getBoundingClientRect().width / 300 * 100;
        await allerA(roue.cx + r * Math.cos(a), roue.cy + r * Math.sin(a), 700, j, f);
        await pause(450, j);
        f.style.transition = '';
        pointeur.classList.remove('est-clic');
        lacher(f, true);
        await pause(1800, j);
      }
    } catch { /* démonstration interrompue */ }
  };
  const arreterDemo = () => {
    if (!demoActive) return;
    demoActive = false; demoJeton++;
    bureau.classList.remove('est-demo');
    fichiers.forEach((f) => { f.style.transition = ''; f.style.transform = ''; f.classList.remove('est-glisse'); });
    fermer();
  };
  if ('IntersectionObserver' in window) new IntersectionObserver((en) => { visible = en[0].isIntersecting; }).observe(bureau);
  if (demoActive) demo();
})();
