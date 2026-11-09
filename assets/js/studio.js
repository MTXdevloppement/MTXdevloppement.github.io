(() => {
  const doc = document.documentElement;
  const anime = doc.classList.contains('anime');
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lisse = (v) => { v = clamp(v); return v * v * (3 - 2 * v); };
  const mix = (a, b, t) => a + (b - a) * t;
  const px = (v) => v.toFixed(1) + 'px';
  const poser = (el, prop, val) => {
    if (!el || el['_mtx_' + prop] === val) return;
    el['_mtx_' + prop] = val;
    el.style[prop] = val;
  };
  const basculer = (el, classe, oui) => {
    if (!el || el['_mtx_' + classe] === oui) return;
    el['_mtx_' + classe] = oui;
    el.classList.toggle(classe, oui);
  };

  const titre = $('[data-ajuste]');
  const adresse = $('[data-ajuste-ligne]');
  function ajuster() {
    if (titre) {
      titre.style.fontSize = '';
      const lignes = $$('.ligne', titre);
      const dispo = titre.clientWidth;
      const fs = parseFloat(getComputedStyle(titre).fontSize);
      lignes.forEach((l) => (l.style.display = 'inline-block'));
      const large = Math.max(...lignes.map((l) => l.getBoundingClientRect().width));
      lignes.forEach((l) => (l.style.display = ''));
      const zone = titre.parentElement.getBoundingClientRect().height;
      let cible = fs * (dispo / large) * 0.995;
      const parHauteur = window.innerWidth > 760 ? (zone * 0.98) / (lignes.length * 0.9) : Infinity;
      cible = Math.min(cible, parHauteur, 236);
      titre.style.fontSize = cible.toFixed(1) + 'px';
    }
    if (adresse) {
      const boite = adresse.parentElement;
      const st = getComputedStyle(boite);
      const dispo = boite.clientWidth - parseFloat(st.paddingLeft) - parseFloat(st.paddingRight);
      boite.style.fontSize = '100px';
      const w = adresse.getBoundingClientRect().width;
      boite.style.fontSize = Math.min(200, (100 * dispo) / w * 0.985).toFixed(1) + 'px';
    }
  }

  const chaps = $$('[data-chap]');
  $$('[data-total]').forEach((el) => (el.textContent = '/ ' + String(chaps.length).padStart(2, '0')));

  const copier = $('[data-copier]');
  if (copier && navigator.clipboard) {
    copier.hidden = false;
    const etat = $('[data-copier-etat]');
    const txt = $('[data-copier-texte]', copier);
    let minuterie;
    copier.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(copier.dataset.copier);
        txt.textContent = 'Adresse copiée';
        etat.textContent = 'mtxstudio@proton.me est dans le presse-papiers.';
      } catch {
        etat.textContent = 'Copie impossible ici : sélectionnez l’adresse ci-dessus.';
      }
      clearTimeout(minuterie);
      minuterie = setTimeout(() => { txt.textContent = 'Copier l’adresse'; etat.textContent = ''; }, 2600);
    });
  }

  const barre = $('[data-barre]');
  const fonds = $$('[data-fond]');
  const heros = $('[data-heros]');
  const scene = $('[data-scene]');
  const icone = $('[data-icone]');
  const fond = $('[data-lance-fond]');
  const lx = $('[data-lance-x]');
  const intro = $('.realisations > .tete');
  const etats = chaps.map((chap) => ({
    chap,
    cadre: $('.chap-cadre', chap),
    ecran: $('.chap-ecran', chap),
    img: $('.chap-ecran img', chap),
    ic: $('.chap-icone', chap),
    fiche: [$('.chap-num', chap), $('.chap-nom', chap), $('.chap-cat', chap), $('.chap-titre', chap), $('.chap-tech', chap), $('.chap-ouvrir', chap)].filter(Boolean),
    top: 0, h: 1, W: 0, H: 0, I: 0, clip: null,
  }));
  const dock = $('[data-dockbar]');
  const docks = $$('[data-dock]');
  const croix = $('[data-croix]');
  const pistes = $$('[data-piste]');

  let G = null;
  let geo = null;
  function mesurer() {
    const y = window.scrollY;
    const haut = (el) => el.getBoundingClientRect().top + y;
    G = {
      heros: heros ? { top: haut(heros), h: heros.offsetHeight } : null,
      fonds: fonds.map((s) => { const t = haut(s); return { t, b: t + s.offsetHeight, theme: s.dataset.fond }; }),
      croix: croix ? { top: haut(croix), h: croix.offsetHeight } : null,
    };
    etats.forEach((c) => { c.top = haut(c.chap); c.h = c.chap.offsetHeight || 1; });
    if (!anime) return;
    if (scene && icone && lx) {
      const s = scene.getBoundingClientRect();
      const i = icone.getBoundingClientRect();
      const t = i.width;
      const K = Math.max(1, (Math.min(s.width, s.height) * 0.62) / t);
      geo = { W: s.width, H: s.height, x: i.left - s.left, y: i.top - s.top, t, K };
      lx.style.width = lx.style.height = t * K + 'px';
      lx._mtx_transform = lx._mtx_opacity = null;
    }
    etats.forEach((c) => {
      c.W = c.cadre.clientWidth; c.H = c.cadre.clientHeight;
      c.I = clamp(Math.min(c.W, c.H) * 0.27, 64, 150);
      c.ic.style.setProperty('--ic', c.I + 'px');
      c.ecran._mtx_clipPath = c.img._mtx_transform = c.ic._mtx_transform = null;
    });
  }

  let pHeros = 0;
  function majHeros(y, vh) {
    if (!G.heros || !geo) return;
    const course = G.heros.h - vh;
    pHeros = course > 0 ? clamp((y - G.heros.top) / course) : 0;
    if (intro) poser(intro, 'opacity', lisse((pHeros - 0.66) / 0.3).toFixed(3));
    const ouvre = pHeros > 0.001;
    basculer(heros, 'ouvre', ouvre);
    if (!ouvre) return;
    const e = lisse(pHeros / 0.92);
    const { W, H, x, y: iy, t, K } = geo;
    const haut = mix(iy, 0, e), gauche = mix(x, 0, e);
    const droite = mix(W - x - t, 0, e), bas = mix(H - iy - t, 0, e);
    poser(fond, 'clipPath', `inset(${px(haut)} ${px(droite)} ${px(bas)} ${px(gauche)} round ${px(mix(t * 0.225, 0, e))})`);
    const k = mix(1, K, e);
    const cx = mix(x + t / 2, W / 2, e), cy = mix(iy + t / 2, H / 2, e);
    poser(lx, 'transform', `translate(${px(cx - (t * k) / 2)}, ${px(cy - (t * k) / 2)}) scale(${(k / K).toFixed(4)})`);
    poser(lx, 'opacity', (1 - lisse((pHeros - 0.42) / 0.3)).toFixed(3));
  }

  function majChap(c, y, vh) {
    const top = c.top - y;
    const proche = top + c.h > -vh * 0.5 && top < vh * 1.5;
    basculer(c.chap, 'proche', proche);
    if (!proche || top + c.h < -vh * 0.2 || top > vh * 1.2) return;
    const s = (vh - top) / c.h;
    const o = lisse((s - 0.42) / 0.36);
    const { W, H, I } = c;
    const bw = mix(I, W, o), bh = mix(I, H, o);
    const iy = (H - bh) / 2, ix = (W - bw) / 2, rayon = mix(I * 0.225, 14, o);
    c.clip = { ix, iy, rayon };
    poser(c.ecran, 'clipPath', `inset(${px(iy)} ${px(ix)} ${px(iy)} ${px(ix)} round ${px(rayon)})`);
    poser(c.img, 'transform', `translateY(${((0.62 - clamp(s, 0.3, 1)) * 5).toFixed(2)}%) scale(${(1.22 - 0.16 * o).toFixed(4)})`);
    poser(c.ic, 'transform', `scale(${mix(1, Math.min(W, H) / I, o).toFixed(4)})`);
    poser(c.ic, 'opacity', (1 - lisse((o - 0.04) / 0.3)).toFixed(3));
    c.fiche.forEach((el, n) => {
      const f = lisse((s - 0.5 - n * 0.035) / 0.2);
      poser(el, 'opacity', f.toFixed(3));
      poser(el, 'transform', f >= 1 ? '' : `translateY(${((1 - f) * 26).toFixed(1)}px)`);
    });
  }

  let actif = -1;
  function majDock(y, vh) {
    if (!dock || !etats.length) return;
    const premier = etats[0], dernier = etats[etats.length - 1];
    basculer(dock, 'visible', premier.top - y < vh * 0.55 && dernier.top + dernier.h - y > vh - 2);
    let n = 0;
    etats.forEach((c, i) => { if (c.top - y <= vh * 0.5) n = i; });
    if (n !== actif) {
      actif = n;
      docks.forEach((d, i) => (i === n ? d.setAttribute('aria-current', 'true') : d.removeAttribute('aria-current')));
    }
  }
  function allerA(chap, doux = true) {
    const top = chap.getBoundingClientRect().top + window.scrollY;
    const y = anime ? top + chap.offsetHeight * 0.84 - window.innerHeight : top;
    window.scrollTo({ top: y, behavior: doux && anime ? 'smooth' : 'auto' });
  }
  docks.forEach((d) => d.addEventListener('click', (ev) => {
    const chap = document.getElementById(d.getAttribute('href').slice(1));
    if (!chap) return;
    ev.preventDefault();
    allerA(chap);
    history.replaceState(null, '', d.getAttribute('href'));
  }));

  function majCroix(y, vh) {
    if (!G.croix) return;
    const top = G.croix.top - y;
    if (top + G.croix.h < 0 || top > vh) return;
    const q = clamp((vh - top) / (vh + G.croix.h));
    pistes.forEach((p) => poser(p, 'transform', `translateX(${((q - 0.5) * 34 * Number(p.dataset.piste)).toFixed(2)}vw)`));
  }

  function majBarre(y) {
    if (!barre) return;
    const ligne = 30;
    let theme = barre.dataset.defaut || 'clair';
    for (const f of G.fonds) {
      if (f.t - y <= ligne && f.b - y > ligne) { theme = f.theme; break; }
    }
    if (G.heros && theme === 'clair' && G.heros.top + G.heros.h - y > ligne && pHeros > 0.5) theme = 'noir';
    if (barre.dataset.theme !== theme) barre.dataset.theme = theme;
    basculer(barre, 'pleine', y > 8);
  }

  let demande = 0;
  function maj() {
    demande = 0;
    if (!G) return;
    const y = window.scrollY, vh = window.innerHeight;
    if (anime) {
      majHeros(y, vh);
      for (const c of etats) majChap(c, y, vh);
      majDock(y, vh);
      majCroix(y, vh);
    }
    majBarre(y);
  }
  const planifier = () => { if (!demande) demande = requestAnimationFrame(maj); };
  let largeur = window.innerWidth, hauteur = window.innerHeight;
  function redimensionner(force) {
    const w = window.innerWidth, h = window.innerHeight;
    if (!force && w === largeur && Math.abs(h - hauteur) < 120) { planifier(); return; }
    largeur = w; hauteur = h;
    ajuster();
    mesurer();
    maj();
  }
  addEventListener('scroll', planifier, { passive: true });
  addEventListener('resize', () => redimensionner(false));
  redimensionner(true);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => redimensionner(true));
  addEventListener('load', () => redimensionner(true));
  if ('ResizeObserver' in window) {
    let attente = 0;
    new ResizeObserver(() => {
      if (attente) return;
      attente = requestAnimationFrame(() => { attente = 0; mesurer(); maj(); });
    }).observe(document.body);
  }

  if (anime && location.hash.startsWith('#r-')) {
    const chap = document.getElementById(location.hash.slice(1));
    if (chap) {
      let touche = false;
      const main = () => { touche = true; };
      ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach((t) => addEventListener(t, main, { once: true, passive: true }));
      requestAnimationFrame(() => allerA(chap, false));
      addEventListener('load', () => { if (!touche) allerA(chap, false); }, { once: true });
    }
  }
  addEventListener('hashchange', () => {
    if (!anime || !location.hash.startsWith('#r-')) return;
    const chap = document.getElementById(location.hash.slice(1));
    if (chap) requestAnimationFrame(() => allerA(chap, false));
  });

  $$('[data-ouvrir]').forEach((lien) => lien.addEventListener('click', async (ev) => {
    if (!anime || ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    const chap = lien.closest('[data-chap]');
    const c = etats.find((e) => e.chap === chap);
    if (!c || !c.img || !Element.prototype.animate) return;
    ev.preventDefault();
    const W = window.innerWidth, H = window.innerHeight;
    const r = c.ecran.getBoundingClientRect();
    const ri = c.img.getBoundingClientRect();
    const k = c.clip || { ix: 0, iy: 0, rayon: 14 };
    const voile = document.createElement('div');
    voile.className = 'ouverture';
    const img = new Image();
    img.alt = '';
    img.src = c.img.currentSrc || c.img.src;
    try { await img.decode(); } catch {  }
    voile.append(img);
    document.body.append(voile);
    const depart = `inset(${px(r.top + k.iy)} ${px(W - r.right + k.ix)} ${px(H - r.bottom + k.iy)} ${px(r.left + k.ix)} round ${px(k.rayon)})`;
    const courbe = 'cubic-bezier(.3,.72,0,1)';
    const duree = 640;
    voile.animate([{ clipPath: depart }, { clipPath: 'inset(0px 0px 0px 0px round 0px)' }], { duration: duree, easing: courbe, fill: 'forwards' });
    img.animate([{ transform: `translate(${px(ri.left)}, ${px(ri.top)}) scale(${(ri.width / W).toFixed(4)})` }, { transform: 'translate(0px, 0px) scale(1)' }],
      { duration: duree, easing: courbe, fill: 'forwards' })
      .finished.then(() => { location.href = lien.href; });
  }));
  addEventListener('pageshow', (ev) => {
    if (!ev.persisted) return;
    $$('.ouverture').forEach((v) => v.remove());
    planifier();
  });
})();
