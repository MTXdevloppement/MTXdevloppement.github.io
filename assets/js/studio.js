(() => {
  const doc = document.documentElement;
  const anime = doc.classList.contains('anime');
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lisse = (v) => { v = clamp(v); return v * v * (3 - 2 * v); };
  const mix = (a, b, t) => a + (b - a) * t;

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
  let pHeros = 0;
  function majBarre() {
    if (!barre) return;
    const y = 30;
    let theme = barre.dataset.defaut || 'clair';
    for (const s of fonds) {
      const r = s.getBoundingClientRect();
      if (r.top <= y && r.bottom > y) { theme = s.dataset.fond; break; }
    }
    if (heros && theme === 'clair' && heros.getBoundingClientRect().bottom > y && pHeros > 0.5) theme = 'noir';
    barre.dataset.theme = theme;
    barre.classList.toggle('pleine', window.scrollY > 8);
  }

  const scene = $('[data-scene]');
  const icone = $('[data-icone]');
  const fond = $('[data-lance-fond]');
  const lx = $('[data-lance-x]');
  const intro = $('.realisations > .tete');
  let geo = null;
  function mesurerHeros() {
    if (!scene || !icone) return;
    heros.classList.remove('ouvre');
    const s = scene.getBoundingClientRect();
    const i = icone.getBoundingClientRect();
    geo = { W: s.width, H: s.height, x: i.left - s.left, y: i.top - s.top, t: i.width };
    lx.style.width = lx.style.height = geo.t + 'px';
  }
  function majHeros() {
    if (!heros || !geo) return;
    const r = heros.getBoundingClientRect();
    const course = r.height - window.innerHeight;
    pHeros = course > 0 ? clamp(-r.top / course) : 0;
    if (intro) intro.style.opacity = String(lisse((pHeros - 0.66) / 0.3));
    if (pHeros <= 0.001) { heros.classList.remove('ouvre'); return; }
    heros.classList.add('ouvre');
    const e = lisse(pHeros / 0.92);
    const { W, H, x, y, t } = geo;
    const haut = mix(y, 0, e), gauche = mix(x, 0, e);
    const droite = mix(W - x - t, 0, e), bas = mix(H - y - t, 0, e);
    const rayon = mix(t * 0.225, 0, e);
    fond.style.clipPath = `inset(${haut}px ${droite}px ${bas}px ${gauche}px round ${rayon}px)`;
    const k = mix(1, Math.max(1, (Math.min(W, H) * 0.62) / t), e);
    const cx = mix(x + t / 2, W / 2, e), cy = mix(y + t / 2, H / 2, e);
    lx.style.transform = `translate(${cx - (t * k) / 2}px, ${cy - (t * k) / 2}px) scale(${k})`;
    lx.style.opacity = String(1 - lisse((pHeros - 0.42) / 0.3));
  }

  const etats = chaps.map((chap) => ({
    chap,
    cadre: $('.chap-cadre', chap),
    ecran: $('.chap-ecran', chap),
    img: $('.chap-ecran img', chap),
    ic: $('.chap-icone', chap),
    fiche: [$('.chap-num', chap), $('.chap-nom', chap), $('.chap-cat', chap), $('.chap-titre', chap), $('.chap-tech', chap), $('.chap-ouvrir', chap)],
    W: 0, H: 0, I: 0,
  }));
  function mesurerChaps() {
    etats.forEach((c) => {
      c.W = c.cadre.clientWidth; c.H = c.cadre.clientHeight;
      c.I = clamp(Math.min(c.W, c.H) * 0.27, 64, 150);
      c.ic.style.setProperty('--ic', c.I + 'px');
    });
  }
  function majChap(c, vh) {
    const r = c.chap.getBoundingClientRect();
    if (r.bottom < -vh * 0.2 || r.top > vh * 1.2) return;
    const s = (vh - r.top) / r.height;
    const o = lisse((s - 0.42) / 0.36);
    const { W, H, I } = c;
    const bw = mix(I, W, o), bh = mix(I, H, o);
    const iy = (H - bh) / 2, ix = (W - bw) / 2;
    c.ecran.style.clipPath = `inset(${iy}px ${ix}px ${iy}px ${ix}px round ${mix(I * 0.225, 14, o)}px)`;
    c.img.style.transform = `translateY(${((0.62 - clamp(s, 0.3, 1)) * 5).toFixed(2)}%) scale(${(1.22 - 0.16 * o).toFixed(4)})`;
    const k = mix(1, Math.min(W, H) / I, o);
    c.ic.style.transform = `scale(${k.toFixed(4)})`;
    c.ic.style.opacity = String(1 - lisse((o - 0.04) / 0.3));
    c.fiche.forEach((el, n) => {
      if (!el) return;
      const f = lisse((s - 0.5 - n * 0.035) / 0.2);
      el.style.opacity = String(f);
      el.style.transform = f >= 1 ? '' : `translateY(${((1 - f) * 26).toFixed(1)}px)`;
    });
  }

  const dock = $('[data-dockbar]');
  const docks = $$('[data-dock]');
  let actif = -1;
  function majDock(vh) {
    if (!dock || !chaps.length) return;
    const premier = chaps[0].getBoundingClientRect(), dernier = chaps[chaps.length - 1].getBoundingClientRect();
    dock.classList.toggle('visible', premier.top < vh * 0.55 && dernier.bottom > vh * 0.45);
    let n = 0;
    chaps.forEach((c, i) => { if (c.getBoundingClientRect().top <= vh * 0.5) n = i; });
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

  const croix = $('[data-croix]');
  const pistes = $$('[data-piste]');
  function majCroix(vh) {
    if (!croix) return;
    const r = croix.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    const q = clamp((vh - r.top) / (vh + r.height));
    pistes.forEach((p) => (p.style.transform = `translateX(${((q - 0.5) * 34 * Number(p.dataset.piste)).toFixed(2)}vw)`));
  }

  let demande = 0;
  function maj() {
    demande = 0;
    const vh = window.innerHeight;
    if (anime) {
      majHeros();
      etats.forEach((c) => majChap(c, vh));
      majDock(vh);
      majCroix(vh);
    }
    majBarre();
  }
  const planifier = () => { if (!demande) demande = requestAnimationFrame(maj); };
  let largeur = window.innerWidth, hauteur = window.innerHeight;
  function redimensionner(force) {
    const w = window.innerWidth, h = window.innerHeight;
    if (!force && w === largeur && Math.abs(h - hauteur) < 120) { planifier(); return; }
    largeur = w; hauteur = h;
    ajuster();
    if (anime) { mesurerHeros(); mesurerChaps(); }
    maj();
  }
  addEventListener('scroll', planifier, { passive: true });
  addEventListener('resize', () => redimensionner(false));
  redimensionner(true);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => redimensionner(true));
  addEventListener('load', () => redimensionner(true));

  if (anime && location.hash.startsWith('#r-')) {
    const chap = document.getElementById(location.hash.slice(1));
    if (chap) requestAnimationFrame(() => allerA(chap, false));
  }

  $$('[data-ouvrir]').forEach((lien) => lien.addEventListener('click', (ev) => {
    if (!anime || ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    const chap = lien.closest('[data-chap]');
    const ecran = chap && $('.chap-ecran', chap);
    if (!ecran || !Element.prototype.animate) return;
    ev.preventDefault();
    const r = ecran.getBoundingClientRect();
    const W = window.innerWidth, H = window.innerHeight;
    const voile = document.createElement('div');
    voile.className = 'ouverture';
    const img = document.createElement('img');
    img.src = $('img', ecran).currentSrc || $('img', ecran).src;
    img.alt = '';
    voile.append(img);
    document.body.append(voile);
    const depart = `inset(${r.top}px ${W - r.right}px ${H - r.bottom}px ${r.left}px round 14px)`;
    const courbe = 'cubic-bezier(.3,.72,0,1)';
    const duree = 640;
    voile.animate([{ clipPath: depart }, { clipPath: 'inset(0px 0px 0px 0px round 0px)' }], { duration: duree, easing: courbe, fill: 'forwards' });
    img.animate([{ transform: `translate(${r.left}px, ${r.top}px) scale(${r.width / W})` }, { transform: 'translate(0px, 0px) scale(1)' }],
      { duration: duree, easing: courbe, fill: 'forwards' })
      .finished.then(() => { location.href = lien.href; });
  }));
  addEventListener('pageshow', (ev) => { if (ev.persisted) $$('.ouverture').forEach((v) => v.remove()); });
})();
