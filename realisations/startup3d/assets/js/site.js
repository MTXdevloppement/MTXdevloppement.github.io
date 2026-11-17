(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const racine = document.documentElement;
  const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const io = (cb, opts) => ('IntersectionObserver' in window ? new IntersectionObserver(cb, opts) : null);

  const vus = io((en, obs) => en.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('est-vu'); obs.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
  $$('.apparait').forEach((el) => (vus ? vus.observe(el) : el.classList.add('est-vu')));

  const liens = $$('.barre-nav a');
  const suivi = io((en) => en.forEach((e) => {
    if (e.isIntersecting) liens.forEach((a) => a.classList.toggle('est-ici', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  if (suivi) liens.forEach((a) => { const s = $(a.getAttribute('href')); if (s) suivi.observe(s); });

  const scene = $('[data-scene]');
  if (scene) {
    const curseur = $('[data-heure]', scene), sortie = $('[data-heure-sortie]', scene), cadre = $('[data-scene-cadre]', scene);
    const nuitPour = (h) => (h <= 6 ? 1 : h < 8 ? (8 - h) / 2 : h <= 18 ? 0 : h < 21 ? (h - 18) / 3 : 1);
    const poser = (h) => {
      curseur.value = h; sortie.textContent = h + ' h';
      const n = nuitPour(+h);
      cadre.style.setProperty('--nuit', n.toFixed(3));
      scene.classList.toggle('est-nuit', n > 0.5);
    };
    let anim = 0;
    const glisser = (cible) => {
      cancelAnimationFrame(anim);
      if (calme) return poser(cible);
      const depart = +curseur.value, t0 = performance.now();
      const pas = (t) => { const k = Math.min(1, (t - t0) / 1200), e = 1 - Math.pow(1 - k, 3); poser(Math.round(depart + (cible - depart) * e)); if (k < 1) anim = requestAnimationFrame(pas); };
      anim = requestAnimationFrame(pas);
    };
    curseur.addEventListener('input', () => { cancelAnimationFrame(anim); poser(curseur.value); });
    const selonTheme = () => glisser(racine.dataset.theme === 'dark' ? 22 : 14);
    new MutationObserver(selonTheme).observe(racine, { attributes: true, attributeFilter: ['data-theme'] });
    poser(racine.dataset.theme === 'dark' ? 22 : 14);

    const bulle = $('[data-bulle]', scene), reperes = $$('.repere', scene);
    let minuteur = 0;
    const montrer = (r) => {
      const [t, d] = r.dataset.info.split('|');
      reperes.forEach((x) => x.classList.toggle('est-actif', x === r));
      bulle.innerHTML = `<b>${t}</b>${d}`;
      bulle.classList.add('est-visible');
      clearTimeout(minuteur); minuteur = setTimeout(() => { bulle.classList.remove('est-visible'); reperes.forEach((x) => x.classList.remove('est-actif')); }, 5200);
    };
    reperes.forEach((r) => { r.addEventListener('click', () => montrer(r)); r.addEventListener('mouseenter', () => montrer(r)); });

    if (!calme) {
      let demande = 0;
      const reculer = () => { demande = 0; const r = cadre.getBoundingClientRect(); const p = Math.max(0, Math.min(1, -r.top / r.height)); cadre.style.setProperty('--zoom', (1 - p * 0.06).toFixed(4)); };
      addEventListener('scroll', () => { if (!demande) demande = requestAnimationFrame(reculer); }, { passive: true });
    }
  }

  const panneaux = $('[data-panneaux]');
  if (panneaux) {
    const boutons = $$('[data-panneau]', panneaux), vues = $$('.vue', panneaux);
    const choisir = (i, focus) => {
      boutons.forEach((b, k) => { b.setAttribute('aria-selected', String(k === i)); b.tabIndex = k === i ? 0 : -1; });
      vues.forEach((v, k) => v.classList.toggle('est-actif', k === i));
      if (focus) boutons[i].focus();
    };
    boutons.forEach((b, i) => {
      b.addEventListener('click', () => choisir(i));
      b.addEventListener('keydown', (e) => {
        const d = ['ArrowDown', 'ArrowRight'].includes(e.key) ? 1 : ['ArrowUp', 'ArrowLeft'].includes(e.key) ? -1 : 0;
        if (d) { e.preventDefault(); choisir((i + d + boutons.length) % boutons.length, true); }
      });
    });
  }

  const mission = $('[data-mission]');
  if (mission) {
    const li = $$('li', mission);
    let k = 0, visible = false;
    const obs = io((en) => { visible = en[0].isIntersecting; }, { threshold: 0.4 });
    if (obs) obs.observe(mission);
    li[0].classList.add('est-actif');
    if (!calme) setInterval(() => { if (!visible) return; k = (k + 1) % li.length; li.forEach((x, n) => x.classList.toggle('est-actif', n === k)); }, 2200);
  }

  const sol = $('[data-plan-sol]'), plan = $('[data-plan]'), etat = $('[data-etat-plan]');
  if (sol) {
    const NS = 'http://www.w3.org/2000/svg';
    const W = 12, D = 9, TW = 40, TH = 20, OX = 9 * TW / 2 + 30, OY = 70;
    const P = (i, j, z = 0) => [OX + (i - j) * TW / 2, OY + (i + j) * TH / 2 - z];
    const pts = (...a) => a.map((p) => p.join(',')).join(' ');
    const FIXES = [
      { id: 'cafe', nom: 'Machine à café', i: 10, j: 0, w: 2, d: 1, h: 18, cl: 'o-cafe', acces: [10, 1] },
      { id: 'reunion', nom: 'Réunion', i: 2, j: 5, w: 3, d: 2, h: 10, cl: '', acces: [3, 4] },
      { id: 'canape', nom: 'Détente', i: 8, j: 7, w: 3, d: 1, h: 10, cl: 'o-canape', acces: [9, 6] },
      { id: 'dirigeant', nom: 'Dirigeant', i: 3, j: 0, w: 2, d: 1, h: 12, cl: '', acces: [3, 1] },
      { id: 'plante', nom: '', i: 0, j: 0, w: 1, d: 1, h: 22, cl: 'o-plante' },
      { id: 'plante2', nom: '', i: 11, j: 8, w: 1, d: 1, h: 22, cl: 'o-plante' },
    ];
    const PORTE = [0, 4];
    const bureau = { i: 6, j: 3, w: 2, d: 1, h: 12 };
    const svg = document.createElementNS(NS, 'svg');
    const [minX] = P(0, D); const [maxX] = P(W, 0);
    svg.setAttribute('viewBox', `${minX - 20} 0 ${maxX - minX + 40} ${P(W, D)[1] + 30}`);
    sol.appendChild(svg);
    const el = (n, a, parent = svg) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); parent.appendChild(e); return e; };
    const boite = (o, parent) => {
      const g = el('g', { class: o.cl || '' }, parent);
      const { i, j, w, d, h } = o;
      el('polygon', { class: 't-gauche', points: pts(P(i, j + d, h), P(i + w, j + d, h), P(i + w, j + d), P(i, j + d)) }, g);
      el('polygon', { class: 't-droite', points: pts(P(i + w, j, h), P(i + w, j + d, h), P(i + w, j + d), P(i + w, j)) }, g);
      el('polygon', { class: 't-haut', points: pts(P(i, j, h), P(i + w, j, h), P(i + w, j + d, h), P(i, j + d, h)) }, g);
      return g;
    };
    el('polygon', { class: 't-mur-g', points: pts(P(0, 0), P(0, D), P(0, D, 70), P(0, 0, 70)) });
    el('polygon', { class: 't-mur-d', points: pts(P(0, 0), P(W, 0), P(W, 0, 70), P(0, 0, 70)) });
    el('polygon', { class: 't-porte', points: pts(P(0, PORTE[1]), P(0, PORTE[1] + 1), P(0, PORTE[1] + 1, 46), P(0, PORTE[1], 46)) });
    for (let i = 0; i < W; i++) for (let j = 0; j < D; j++) el('polygon', { class: 't-sol ' + ((i + j) % 2 ? 'b' : 'a'), points: pts(P(i, j), P(i + 1, j), P(i + 1, j + 1), P(i, j + 1)) });
    const gChemin = el('g', {});
    const gObjets = el('g', {});
    const gCibles = el('g', {});
    const centre = (c) => P(c[0] + 0.5, c[1] + 0.5);

    const occupe = () => {
      const g = Array.from({ length: W }, () => Array(D).fill(null));
      FIXES.forEach((o) => { for (let a = o.i; a < o.i + o.w; a++) for (let b = o.j; b < o.j + o.d; b++) if (g[a]) g[a][b] = o.id; });
      return g;
    };
    const chemin = (grille, cible) => {
      const vu = new Map([[PORTE.join(), null]]), file = [PORTE];
      while (file.length) {
        const c = file.shift();
        if (c[0] === cible[0] && c[1] === cible[1]) { const r = []; let k = c.join(); while (k) { r.unshift(k.split(',').map(Number)); k = vu.get(k); } return r; }
        for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const n = [c[0] + di, c[1] + dj], k = n.join();
          if (n[0] < 0 || n[1] < 0 || n[0] >= W || n[1] >= D || vu.has(k) || grille[n[0]][n[1]]) continue;
          vu.set(k, c.join()); file.push(n);
        }
      }
      return null;
    };
    const dessiner = () => {
      gObjets.innerHTML = ''; gChemin.innerHTML = ''; gCibles.innerHTML = '';
      const grille = occupe();
      let probleme = '';
      const dedans = bureau.i >= 0 && bureau.j >= 0 && bureau.i + bureau.w <= W && bureau.j + bureau.d <= D;
      if (!dedans) probleme = 'Le bureau sort des murs.';
      else {
        for (let a = bureau.i; a < bureau.i + bureau.w; a++) for (let b = bureau.j; b < bureau.j + bureau.d; b++) {
          if (grille[a][b] && !probleme) probleme = `Le bureau chevauche : ${FIXES.find((o) => o.id === grille[a][b]).nom || 'une plante'}.`;
          if (a === PORTE[0] && b === PORTE[1] && !probleme) probleme = 'Le bureau bloque la porte.';
          grille[a][b] = 'bureau';
        }
      }
      const bloques = [];
      FIXES.filter((o) => o.acces).forEach((o) => {
        const r = chemin(grille, o.acces);
        const [x, y] = centre(o.acces);
        el('circle', { class: 'cible-onde' + (r ? '' : ' est-bloquee'), cx: x, cy: y, r: 7 }, gCibles);
        el('circle', { class: 'cible' + (r ? '' : ' est-bloquee'), cx: x, cy: y, r: 3.5 }, gCibles);
        if (!r) bloques.push(o.nom);
        if (r && o.id === 'cafe') el('polyline', { class: 'chemin', points: pts(...r.map(centre)) }, gChemin);
      });
      if (!probleme && bloques.length) probleme = `Inaccessible depuis la porte : ${bloques.join(', ')}.`;
      [...FIXES.map((o) => ({ ...o })), { ...bureau, cl: 'o-bureau', id: 'bureau' }]
        .sort((a, b) => (a.i + a.j + (a.w + a.d) / 2) - (b.i + b.j + (b.w + b.d) / 2))
        .forEach((o) => { const g = boite(o, gObjets); if (o.id === 'bureau') g.dataset.bureau = ''; });
      FIXES.filter((o) => o.nom).forEach((o) => { const [x, y] = P(o.i + o.w / 2, o.j + o.d / 2, o.h + 12); el('text', { class: 'plan-etiquette', x, y }, gObjets).textContent = o.nom; });
      plan.classList.toggle('est-invalide', !!probleme);
      etat.textContent = probleme || 'Plan valide : tout reste accessible.';
      etat.style.setProperty('--c', probleme ? 'var(--rouge)' : 'var(--vert)');
    };
    dessiner();

    const versCase = (e) => {
      const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      const p = pt.matrixTransform(svg.getScreenCTM().inverse());
      const a = (p.x - OX) / (TW / 2), b = (p.y - OY) / (TH / 2);
      return [(a + b) / 2, (b - a) / 2];
    };
    let prise = null;
    sol.addEventListener('pointerdown', (e) => {
      if (!e.target.closest('[data-bureau]')) return;
      e.preventDefault();
      const [ci, cj] = versCase(e);
      prise = { di: ci - bureau.i, dj: cj - bureau.j };
      sol.setPointerCapture(e.pointerId); plan.classList.add('est-tire');
    });
    sol.addEventListener('pointermove', (e) => {
      if (!prise) return;
      const [ci, cj] = versCase(e);
      const ni = Math.round(ci - prise.di), nj = Math.round(cj - prise.dj);
      if (ni !== bureau.i || nj !== bureau.j) { bureau.i = Math.max(-1, Math.min(W - bureau.w + 1, ni)); bureau.j = Math.max(-1, Math.min(D - bureau.d + 1, nj)); dessiner(); }
    });
    const lacher = () => { prise = null; plan.classList.remove('est-tire'); };
    sol.addEventListener('pointerup', lacher); sol.addEventListener('pointercancel', lacher);
    sol.addEventListener('keydown', (e) => {
      const m = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] }[e.key];
      if (m) { e.preventDefault(); bureau.i = Math.max(-1, Math.min(W - bureau.w + 1, bureau.i + m[0])); bureau.j = Math.max(-1, Math.min(D - bureau.d + 1, bureau.j + m[1])); dessiner(); }
      if (e.key === 'r' || e.key === 'R') { e.preventDefault(); [bureau.w, bureau.d] = [bureau.d, bureau.w]; dessiner(); }
    });
  }
})();
