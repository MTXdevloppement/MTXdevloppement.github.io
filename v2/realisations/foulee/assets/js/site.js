(() => {
  'use strict';

  const mqReduit = matchMedia('(prefers-reduced-motion: reduce)');
  const mqLarge = matchMedia('(min-width: 1000px)');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const NS = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const NNBSP = ' ';
  const pad = (n) => String(n).padStart(2, '0');
  const borne = (v, a, b) => Math.min(b, Math.max(a, v));
  const surInactivite = (fn, delai = 2500) =>
    ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: delai }) : setTimeout(fn, 300));

  const fmt = {
    duree(t) {
      const s = Math.max(0, Math.floor(t));
      const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
      return h > 0 ? `${h}:${pad(m)}:${pad(x)}` : `${m}:${pad(x)}`;
    },
    km(m, dec = 2) { return (m / 1000).toFixed(dec).replace('.', ','); },
    distance(m) { return m < 1000 ? `${Math.floor(m)} m` : `${fmt.km(m)} km`; },
    allure(a) {
      if (!isFinite(a) || a <= 0 || a >= 3600) return '--:--';
      const s = Math.round(a);
      return `${Math.floor(s / 60)}:${pad(s % 60)}`;
    },
    ecart(t) {
      const signe = t >= 0 ? '+' : '−';
      const s = Math.round(Math.abs(t));
      return s >= 3600
        ? `${signe}${Math.floor(s / 3600)}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`
        : `${signe}${Math.floor(s / 60)}:${pad(s % 60)}`;
    },
    entier(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, NNBSP); },
    dureeParlee(t) {
      const s = Math.round(t);
      const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
      const morceaux = [];
      if (h > 0) morceaux.push(`${h} heure${h > 1 ? 's' : ''}`);
      if (m > 0) morceaux.push(`${m} minute${m > 1 ? 's' : ''}`);
      if (x > 0 || morceaux.length === 0) morceaux.push(`${x} seconde${x > 1 ? 's' : ''}`);
      return morceaux.join(' ');
    },
    allureParlee(a) {
      if (!isFinite(a) || a <= 0 || a >= 3600) return 'inconnue';
      const s = Math.round(a);
      return `${Math.floor(s / 60)} minutes ${s % 60} par kilomètre`;
    },
  };

  class Ressort {
    constructor(valeur, o) {
      this.x = valeur; this.v = 0; this.cible = valeur;
      this.o = { reponse: 0.4, amorti: 1, precision: 0.001, ...o };
      this.raf = 0; this.t = 0; this.fin = null;
      this.pas = this.pas.bind(this);
    }
    vers(cible, o = {}) {
      this.cible = cible;
      if (o.vitesse !== undefined) this.v = o.vitesse;
      this.reponse = o.reponse ?? this.o.reponse;
      this.amorti = o.amorti ?? this.o.amorti;
      this.fin = o.fin || null;
      if (mqReduit.matches) { this.fixer(cible, true); return this; }
      if (!this.raf) { this.t = performance.now(); this.raf = requestAnimationFrame(this.pas); }
      return this;
    }
    pas(t) {
      const dt = borne((t - this.t) / 1000, 0, 0.05);
      this.t = t;
      const k = (2 * Math.PI / this.reponse) ** 2, c = 4 * Math.PI * this.amorti / this.reponse;
      let n = Math.max(1, Math.ceil(dt / 0.004));
      const h = dt / n;
      while (n--) { const a = -k * (this.x - this.cible) - c * this.v; this.v += a * h; this.x += this.v * h; }
      const p = this.o.precision;
      const fini = Math.abs(this.x - this.cible) < p && Math.abs(this.v) < p * 12;
      if (fini) { this.x = this.cible; this.v = 0; }
      this.o.surMaj(this.x, this.v);
      if (fini) { this.raf = 0; const f = this.fin; this.fin = null; if (f) f(); }
      else this.raf = requestAnimationFrame(this.pas);
    }
    fixer(x, garderFin = false) {
      cancelAnimationFrame(this.raf); this.raf = 0;
      this.x = this.cible = x; this.v = 0;
      const f = garderFin ? this.fin : null;
      this.fin = null;
      this.o.surMaj(x, 0);
      if (f) f();
    }
  }
  function suiveur() {
    const pts = [];
    return {
      ajouter(x, y, t) { pts.push({ x, y, t }); while (pts.length > 2 && t - pts[0].t > 100) pts.shift(); },
      vider() { pts.length = 0; },
      vitesse() {
        if (pts.length < 2) return { x: 0, y: 0 };
        const a = pts[0], b = pts[pts.length - 1];
        const dt = Math.max(0.008, (b.t - a.t) / 1000);
        return { x: (b.x - a.x) / dt, y: (b.y - a.y) / dt };
      },
    };
  }
  const projeter = (v, d = 0.998) => (v / 1000) * d / (1 - d);
  const elastique = (depasse, dim, c = 0.55) => (depasse * dim * c) / (dim + c * Math.abs(depasse));

  function creerPager({ zone, piste, cadre = zone, nb = 1, index = 0, surChange, surVertical }) {
    const etat = { nb, i: index };
    let W = 1, id = null, x0 = 0, y0 = 0, axe = null, p0 = 0, glisse = false;
    const sv = suiveur();
    const pos = new Ressort(-index, {
      reponse: 0.36, precision: 0.0008,
      surMaj: (x) => { piste.style.transform = `translate3d(${(x * 100).toFixed(3)}%, 0, 0)`; },
    });
    pos.fixer(-index);
    function aller(n, { vitesse = 0, source = 'code' } = {}) {
      n = borne(n, 0, etat.nb - 1);
      const change = n !== etat.i;
      etat.i = n;
      pos.vers(-n, { vitesse });
      if (change && surChange) surChange(n, source);
    }
    zone.addEventListener('pointerdown', (e) => {
      if (e.button > 0 || id !== null || e.target.closest('[data-sans-glisse]')) return;
      id = e.pointerId; x0 = e.clientX; y0 = e.clientY; axe = null;
      W = cadre.clientWidth || 1;
      sv.vider(); sv.ajouter(x0, y0, e.timeStamp);
    });
    zone.addEventListener('pointermove', (e) => {
      if (e.pointerId !== id) return;
      if (!axe) {
        const dx = e.clientX - x0, dy = e.clientY - y0;
        if (Math.hypot(dx, dy) < 8) return;
        axe = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
        if ((axe === 'x' && etat.nb < 2) || (axe === 'y' && !surVertical)) { id = null; return; }
        glisse = true;
        zone.classList.add('glisse');
        try { zone.setPointerCapture(id); } catch {  }
        x0 = e.clientX; y0 = e.clientY;
        if (axe === 'x') { pos.fixer(pos.x); p0 = pos.x; } else surVertical.debut();
      }
      sv.ajouter(e.clientX, e.clientY, e.timeStamp);
      if (axe === 'x') {
        let p = p0 + (e.clientX - x0) / W;
        const min = -(etat.nb - 1);
        if (p > 0) p = elastique(p * W, W) / W;
        else if (p < min) p = min - elastique((min - p) * W, W) / W;
        pos.fixer(p);
      } else surVertical.deplacer(e.clientY - y0);
    });
    const relacher = (e) => {
      if (e.pointerId !== id) return;
      id = null;
      zone.classList.remove('glisse');
      if (!axe) return;
      sv.ajouter(e.clientX, e.clientY, e.timeStamp);
      const v = e.type === 'pointercancel' ? { x: 0, y: 0 } : sv.vitesse();
      if (axe === 'x') {
        const n = Math.round(-(pos.x + projeter(v.x) / W));
        aller(borne(n, etat.i - 1, etat.i + 1), { vitesse: v.x / W, source: 'geste' });
      } else surVertical.relacher(v.y, e.clientY - y0);
      setTimeout(() => { glisse = false; }, 0);
    };
    zone.addEventListener('pointerup', relacher);
    zone.addEventListener('pointercancel', relacher);
    zone.addEventListener('click', (e) => { if (glisse) { e.preventDefault(); e.stopPropagation(); } }, true);
    return {
      aller,
      get index() { return etat.i; },
      reglage({ nb: n, index: i }) { etat.nb = n; etat.i = i; pos.fixer(-i); },
    };
  }

  const DOSSIER = 'assets/img/ecrans/';
  function imageEcran(nom, sizes, alt = '', { prioritaire = false, differe = false } = {}) {
    const pic = document.createElement('picture');
    const source = document.createElement('source');
    source.type = 'image/avif';
    const img = document.createElement('img');
    img.className = 'tel-ecran';
    img.width = 860; img.height = 1870; img.alt = alt; img.decoding = 'async';
    if (prioritaire) img.setAttribute('fetchpriority', 'high');
    pic.append(source, img);
    pic.charger = () => {
      if (img.getAttribute('src')) return;
      source.sizes = sizes; img.sizes = sizes;
      source.srcset = `${DOSSIER}${nom}-520.avif 520w, ${DOSSIER}${nom}-860.avif 860w`;
      img.srcset = `${DOSSIER}${nom}-520.webp 520w, ${DOSSIER}${nom}-860.webp 860w`;
      img.src = `${DOSSIER}${nom}-860.webp`;
    };
    if (!differe) pic.charger();
    return pic;
  }

  const ANNEAU = '<svg class="maintien-anneau" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="43.5" pathLength="1"/></svg>';
  function rendreMaintenable(el, duree, faire) {
    el.classList.add('maintien');
    el.style.setProperty('--duree', `${duree}s`);
    if (!el.querySelector('.maintien-anneau')) el.insertAdjacentHTML('afterbegin', ANNEAU);
    let minuteur = 0, clavier = false;
    const debut = () => {
      clearTimeout(minuteur);
      el.classList.add('tenu');
      minuteur = setTimeout(() => { el.classList.remove('tenu'); faire(); }, duree * 1000);
    };
    const fin = () => { clearTimeout(minuteur); el.classList.remove('tenu'); };
    el.addEventListener('pointerdown', (e) => { if (e.button === 0) debut(); });
    for (const ev of ['pointerup', 'pointerleave', 'pointercancel', 'blur']) el.addEventListener(ev, fin);
    el.addEventListener('keydown', (e) => {
      if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); clavier = true; debut(); }
    });
    el.addEventListener('keyup', (e) => {
      if (e.key === ' ' || e.key === 'Enter') { fin(); setTimeout(() => { clavier = false; }, 0); }
    });
    el.addEventListener('click', (e) => { e.preventDefault(); if (e.detail === 0 && !clavier) faire(); });
    el.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  const barre = $('#barre');
  let barreDefilee = null;
  const majBarre = () => {
    const d = window.scrollY > 8;
    if (d !== barreDefilee && barre) { barreDefilee = d; barre.classList.toggle('defilee', d); }
  };
  majBarre();

  const liensNav = $$('.nav a');
  if ('IntersectionObserver' in window && liensNav.length) {
    const cibles = liensNav.map((a) => $(a.getAttribute('href'))).filter(Boolean);
    const obsNav = new IntersectionObserver((entrees) => {
      for (const e of entrees) {
        if (!e.isIntersecting) continue;
        liensNav.forEach((a) => {
          if (a.getAttribute('href') === `#${e.target.id}`) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      }
    }, { rootMargin: '-45% 0px -50% 0px' });
    cibles.forEach((c) => obsNav.observe(c));
  }

  const aVoir = $$('.expo, .apparait:not(.vu)');
  if ('IntersectionObserver' in window && !mqReduit.matches) {
    const obs = new IntersectionObserver((entrees) => {
      for (const e of entrees) {
        if (e.isIntersecting) { e.target.classList.add('vu'); obs.unobserve(e.target); }
      }
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    aVoir.forEach((el) => obs.observe(el));
  } else {
    aVoir.forEach((el) => el.classList.add('vu'));
  }

  const sectionPendant = $('#pendant');
  const colle = $('.pendant-colle');
  const enfantsColle = colle ? Array.from(colle.children) : [];
  let maxX = 0, xPellicule = -1;
  function poserPellicule(x) {
    if (x === xPellicule) return;
    xPellicule = x;
    const t = x ? `translate3d(${-x}px, 0, 0)` : '';
    for (const el of enfantsColle) el.style.transform = t;
  }
  function mesurerPellicule() {
    if (!sectionPendant || !colle) return;
    const actif = mqLarge.matches && !mqReduit.matches;
    sectionPendant.classList.toggle('epingle', actif);
    poserPellicule(0);
    if (!actif) { sectionPendant.style.height = ''; return; }
    maxX = Math.max(0, colle.scrollWidth - colle.clientWidth);
    sectionPendant.style.height = `${window.innerHeight - (barre ? barre.offsetHeight : 0) + maxX}px`;
    defilerPellicule();
  }
  function defilerPellicule() {
    if (!sectionPendant || !sectionPendant.classList.contains('epingle')) return;
    const barreH = barre ? barre.offsetHeight : 0;
    const haut = sectionPendant.getBoundingClientRect().top - barreH;
    if (haut > window.innerHeight || haut < -maxX - window.innerHeight) return;
    const p = borne(-haut / Math.max(1, maxX), 0, 1);
    poserPellicule(Math.round(p * maxX * 2) / 2);
  }
  if (sectionPendant && colle) {
    mesurerPellicule();
    window.addEventListener('resize', () => { clearTimeout(mesurerPellicule.t); mesurerPellicule.t = setTimeout(mesurerPellicule, 150); });
    mqLarge.addEventListener?.('change', mesurerPellicule);
    mqReduit.addEventListener?.('change', mesurerPellicule);
    window.addEventListener('load', mesurerPellicule);
  }

  let rafDefil = 0;
  window.addEventListener('scroll', () => {
    if (rafDefil) return;
    rafDefil = requestAnimationFrame(() => { rafDefil = 0; majBarre(); defilerPellicule(); });
  }, { passive: true });

  const etapes = $$('.etape');
  const ecransBilan = $$('.bilan-ecran');
  let majLoupeBilan = null;
  if (etapes.length && 'IntersectionObserver' in window) {
    const obsBilan = new IntersectionObserver((entrees) => {
      for (const e of entrees) {
        if (!e.isIntersecting) continue;
        const n = e.target.dataset.ecran;
        etapes.forEach((x) => x.classList.toggle('actif', x === e.target));
        ecransBilan.forEach((img) => img.classList.toggle('actif', img.dataset.ecran === n));
        if (majLoupeBilan) majLoupeBilan();
      }
    }, { rootMargin: '-48% 0px -48% 0px' });
    etapes.forEach((x) => obsBilan.observe(x));
    etapes[0].classList.add('actif');
  }

  // La montre du héros : le cœur bat tant que la course tourne, et s'arrête avec la pause du téléphone.
  (function montreHeros() {
    const montre = $('#heros-montre'), pile = $('#proto');
    if (!montre || !pile) return;
    const fc = $('[data-hm-fc]', montre);
    const suivre = () => montre.classList.toggle('en-pause', !['stats', 'carte'].includes(pile.dataset.ecran));
    new MutationObserver(suivre).observe(pile, { attributes: true, attributeFilter: ['data-ecran'] });
    suivre();
    if (mqReduit.matches) return;
    let n = 158;
    setInterval(() => {
      if (document.hidden || montre.classList.contains('en-pause')) return;
      n = Math.max(155, Math.min(162, n + Math.round(Math.random() * 2 - 1)));
      fc.textContent = n;
    }, 1300);
  })();

  (function prototype() {
    const pile = $('#proto');
    if (!pile) return;
    const aide = $('.proto-aide');
    const annonce = $('#proto-annonce');
    const base = $('img', pile);
    const tailles = base.getAttribute('sizes') || '(max-width: 760px) 64vw, 360px';
    const AIDES = {
      stats: `Écran manipulable, comme dans l’app${NNBSP}: <b>Carte</b>, <b>Pause</b>, <b>Verrouiller</b>.`,
      carte: 'La carte en course. Revenez aux <b>Stats</b>, ou mettez en <b>Pause</b>.',
      verrou: `Verrouillé${NNBSP}: un toucher de travers ne fait rien. <b>Maintenez le cadenas</b> pour rouvrir.`,
      pause: '<b>Maintenez le carré</b> pour terminer (un appui bref n’arrête rien), ou <b>reprenez</b>.',
      fin: `Le bilan à l’arrivée${NNBSP}: ici, la course entière, 8,16${NNBSP}km. Touchez <b>Terminé</b>.`,
      courir: 'Retour à l’onglet Courir. <b>Démarrer</b> lance le décompte.',
      decompte: `Décompte avant le départ${NNBSP}: touchez l’écran pour passer.`,
    };
    let fond = 'stats', ecran = 'stats', verrou = false, interagi = false;

    const couches = {};
    let couchesFaites = false, yPause = null, yFin = null;
    const DEF = [
      ['carte', 'course-carte', 'Carte en course : le tracé orange longe le Rhône au nord du parc ; 6,42 km, 33:24, allure 4:58.'],
      ['pause', 'pause', 'Écran de pause orange : 6,42 kilomètres, 33:24, allure moyenne 5:12 ; boutons Maintenir pour terminer et Reprendre.'],
      ['courir', 'courir', 'Onglet Courir : carte du parc, parcours libre, sans objectif, bouton Démarrer.'],
      ['fin', 'fin', 'Course terminée : 8,16 km en 42:16, allure moyenne 5:11, 591 kcal ; record du parcours Deux tours de la Tête d’Or.'],
    ];
    const glissiere = (cle, opacite) => new Ressort(1, {
      reponse: 0.4, precision: 0.0015,
      surMaj: (y) => {
        const el = couches[cle];
        el.style.transform = y < 0.0005 ? 'none' : `translate3d(0, ${(y * 100).toFixed(2)}%, 0)`;
        if (opacite) el.style.opacity = borne(1 - y, 0, 1).toFixed(3);
        el.style.visibility = y > 0.999 ? 'hidden' : 'visible';
      },
    });
    const images = {};
    function creerCouches(prioritaire, quelles = DEF.map((d) => d[0])) {
      if (!couchesFaites) {
        couchesFaites = true;
        for (const [cle, nom, alt] of DEF) {
          const div = document.createElement('div');
          div.className = `proto-couche proto-${cle}`;
          div.setAttribute('aria-hidden', 'true');
          images[cle] = imageEcran(nom, tailles, alt, { prioritaire, differe: true });
          div.appendChild(images[cle]);
          pile.insertBefore(div, zonesDebut);
          couches[cle] = div;
        }
        yPause = glissiere('pause', true);
        yFin = glissiere('fin', false);
        yPause.fixer(ecran === 'pause' ? 0 : 1);
        yFin.fixer(ecran === 'fin' ? 0 : 1);
      }
      for (const cle of quelles) images[cle].charger();
    }
    const verrouEl = document.createElement('div');
    verrouEl.className = 'proto-couche proto-verrou';
    verrouEl.inert = true;
    verrouEl.innerHTML = '<div class="proto-verrou-panneau"><button class="proto-verrou-btn" type="button" aria-label="Déverrouiller l’écran (maintenir appuyé)"><svg aria-hidden="true"><use href="#i-cadenas-ouvert"/></svg></button><p aria-hidden="true">Maintenez pour déverrouiller</p></div>';
    const decEl = document.createElement('div');
    decEl.className = 'proto-couche proto-decompte';
    decEl.inert = true;
    decEl.innerHTML = '<b aria-hidden="true">3</b><span aria-hidden="true">Touchez pour passer</span><button type="button">Annuler</button>';
    const chiffre = $('b', decEl);
    const zonesDebut = document.createComment(' zones ');
    pile.append(verrouEl, decEl, zonesDebut);

    const echelle = new Ressort(1, { reponse: 0.5, precision: 0.001, surMaj: (s) => { chiffre.style.transform = `scale(${s.toFixed(4)})`; } });
    let minuterieDec = 0, restant = 3;
    function battre() {
      echelle.fixer(1.25);
      echelle.vers(1);
      clearTimeout(minuterieDec);
      minuterieDec = setTimeout(() => {
        restant -= 1;
        if (restant > 0) { chiffre.textContent = String(restant); battre(); } else partir();
      }, 1000);
    }
    function lancerDecompte() { ecran = 'decompte'; restant = 3; chiffre.textContent = '3'; battre(); }
    function partir() { clearTimeout(minuterieDec); fond = 'stats'; ecran = 'stats'; verrou = false; maj(true); }
    decEl.addEventListener('click', (e) => {
      if (e.target.closest('button')) { clearTimeout(minuterieDec); ecran = 'courir'; maj(true); return; }
      partir();
    });
    rendreMaintenable($('button', verrouEl), 0.8, () => { verrou = false; maj(true); });

    const ZONES = [
      { pour: ['carte'], x: 30.5, y: 8.1, w: 19.5, h: 4.4, nom: 'Afficher les statistiques', faire: () => { fond = 'stats'; } },
      { pour: ['stats'], x: 50, y: 8.1, w: 19.5, h: 4.4, nom: 'Afficher la carte', faire: () => { fond = 'carte'; } },
      { pour: ['stats', 'carte'], x: 10.7, y: 85.4, w: 14.6, h: 8.3, forme: 'carre', nom: 'Verrouiller l’écran', faire: () => { verrou = true; } },
      { pour: ['stats', 'carte'], x: 38.6, y: 84.2, w: 22.8, h: 10.5, forme: 'rond', nom: 'Mettre en pause', faire: () => { ecran = 'pause'; } },
      { pour: ['pause'], x: 56.9, y: 73.85, w: 23.95, h: 11.02, forme: 'rond', nom: 'Reprendre', faire: () => { ecran = 'stats'; } },
      { pour: ['pause'], x: 19.1, y: 73.85, w: 23.95, h: 11.02, forme: 'rond', nom: 'Terminer la course (maintenir appuyé)', maintien: 1.2, faire: () => { ecran = 'fin'; } },
      { pour: ['fin'], x: 60.8, y: 7.1, w: 22.9, h: 5, nom: 'Terminé', faire: () => { ecran = 'courir'; } },
      { pour: ['courir'], x: 33.1, y: 71.8, w: 33.8, h: 15.5, forme: 'rond', nom: 'Démarrer une course', faire: lancerDecompte },
    ];
    for (const z of ZONES) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'proto-zone';
      b.setAttribute('aria-label', z.nom);
      if (z.forme) b.dataset.forme = z.forme;
      b.style.cssText = `--x:${z.x};--y:${z.y};--w:${z.w};--h:${z.h}`;
      const agir = () => { creerCouches(true); interagi = true; z.faire(); maj(true); };
      if (z.maintien) rendreMaintenable(b, z.maintien, agir);
      else {
        b.addEventListener('pointerdown', (e) => { if (e.button === 0) b.classList.add('appui'); });
        for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) b.addEventListener(ev, () => b.classList.remove('appui'));
        b.addEventListener('click', agir);
      }
      pile.appendChild(b);
      z.el = b;
    }
    const cle = () => (ecran === 'stats' ? (verrou ? 'verrou' : fond) : ecran);

    function maj(parAction = false) {
      const avaitFocus = parAction && pile.contains(document.activeElement);
      pile.dataset.ecran = ecran;
      pile.dataset.fond = fond;
      pile.toggleAttribute('data-verrou', verrou);
      if (couchesFaites) { yPause.vers(ecran === 'pause' ? 0 : 1); yFin.vers(ecran === 'fin' ? 0 : 1); }
      verrouEl.inert = !(verrou && ecran === 'stats');
      decEl.inert = ecran !== 'decompte';
      const c = cle();
      for (const z of ZONES) z.el.hidden = !z.pour.includes(c);
      if (aide && aide.dataset.cle !== c) {
        aide.dataset.cle = c;
        aide.innerHTML = AIDES[c];
        if (interagi && annonce) annonce.textContent = aide.textContent;
      }
      if (avaitFocus) {
        const actif = document.activeElement;
        if (!pile.contains(actif) || actif.hidden || actif.closest('[inert]')) {
          const suivant = ZONES.find((z) => !z.el.hidden)?.el
            || (!verrouEl.inert && $('button', verrouEl)) || (!decEl.inert && $('button', decEl));
          suivant?.focus({ preventScroll: true });
        }
      }
    }
    maj();
    const interet = () => creerCouches(true);
    pile.addEventListener('pointerenter', interet, { once: true });
    pile.addEventListener('focusin', interet, { once: true });
    pile.addEventListener('touchstart', interet, { once: true, passive: true });
    const co = navigator.connection;
    const econome = co && (co.saveData || /(^|-)2g|3g/.test(co.effectiveType || ''));
    if (!econome) window.addEventListener('load', () => surInactivite(() => creerCouches(false, ['carte', 'pause']), 3000), { once: true });
  })();

  (function ile() {
    const btn = $('#ile');
    if (!btn) return;
    const forme = $('.ile-forme', btn), compacte = $('.ile-compacte', btn), ouverte = $('.ile-ouverte', btn);
    let ouvert = false, W = 0, wc = 0, hc = 0, he = 0, rc = 0, re = 0, mesure = false;
    function mesurer() {
      W = btn.clientWidth; wc = compacte.offsetWidth; hc = compacte.offsetHeight; he = ouverte.offsetHeight;
      rc = hc / 2; re = Math.min(he / 2, parseFloat(getComputedStyle(document.documentElement).fontSize) * 2.2);
      mesure = true;
    }
    const p = new Ressort(0, {
      reponse: 0.45, amorti: 0.8, precision: 0.002,
      surMaj: (x) => {
        if (!mesure) mesurer();
        const q = Math.max(0, x), qq = Math.min(1, q);
        forme.style.width = `${Math.min(W, wc + (W - wc) * q).toFixed(1)}px`;
        btn.style.height = `${Math.max(hc, hc + (he - hc) * qq).toFixed(1)}px`;
        forme.style.borderRadius = `${(rc + (re - rc) * qq).toFixed(1)}px`;
        compacte.style.opacity = borne(1 - q * 3, 0, 1).toFixed(3);
        ouverte.style.opacity = borne((q - 0.3) / 0.6, 0, 1).toFixed(3);
        ouverte.style.transform = `scale(${(0.9 + 0.1 * q).toFixed(4)})`;
      },
    });
    function ouvrir() {
      if (ouvert) return;
      ouvert = true; mesurer();
      btn.setAttribute('aria-expanded', 'true');
      btn.setAttribute('aria-label', 'Dynamic Island ouverte : refermer');
      p.vers(1, { amorti: 0.78, reponse: 0.45 });
    }
    function fermer() {
      if (!ouvert) return;
      ouvert = false;
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Dynamic Island : ouvrir la vue détaillée');
      p.vers(0, {
        amorti: 1, reponse: 0.35,
        fin: () => { for (const el of [forme, btn, compacte, ouverte]) el.removeAttribute('style'); mesure = false; },
      });
    }
    let minuteur = 0, parAppui = false;
    btn.addEventListener('pointerdown', (e) => {
      if (e.button > 0) return;
      btn.classList.add('appui');
      parAppui = false;
      if (!ouvert) minuteur = setTimeout(() => { parAppui = true; btn.classList.remove('appui'); ouvrir(); }, 380);
    });
    const relache = () => { clearTimeout(minuteur); btn.classList.remove('appui'); };
    for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) btn.addEventListener(ev, relache);
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
    btn.addEventListener('click', () => {
      if (parAppui) { parAppui = false; return; }
      if (ouvert) fermer(); else ouvrir();
    });
    btn.addEventListener('keydown', (e) => { if (e.key === 'Escape') fermer(); });
    document.addEventListener('pointerdown', (e) => { if (ouvert && !btn.contains(e.target)) fermer(); });
    window.addEventListener('resize', () => { if (ouvert) { mesurer(); p.o.surMaj(p.x); } });
  })();

  (function loupe() {
    const figures = $$('figure.tel').filter((f) => !f.closest('.heros'));
    if (!figures.length || typeof HTMLDialogElement !== 'function') return;
    const sansBalises = (h) => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.trim(); };
    const nomDe = (img) => (img.getAttribute('src') || '').match(/ecrans\/([a-z-]+)-(?:520|860)\.webp/)?.[1];
    function legende(fig, etape) {
      if (fig.dataset.legende) return fig.dataset.legende;
      const vue = fig.closest('.vue');
      if (vue) return $('.vue-legende', vue).innerHTML;
      const et = etape || fig.closest('.etape');
      if (et) return `<b>${$('h3', et).textContent}</b> ${$('p', et).textContent.split(/(?<=\.)\s/)[0]}`;
      const bloc = fig.closest('.bloc');
      if (bloc) return `<b>${$('h3', bloc).textContent}</b>`;
      return '';
    }
    const etapeActive = () => $('.etape.actif') || $('.etape');
    const boutons = new Map();
    for (const fig of figures) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tel-loupe';
      b.innerHTML = '<span class="tel-loupe-pastille" aria-hidden="true"><svg><use href="#i-agrandir"/></svg></span>';
      const bilan = fig.closest('.bilan-tel');
      b.setAttribute('aria-label', `Agrandir l’écran : ${sansBalises(legende(fig, bilan ? etapeActive() : null))}`);
      b.addEventListener('pointerdown', (e) => { if (e.button === 0) fig.classList.add('appuye'); });
      for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) b.addEventListener(ev, () => fig.classList.remove('appuye'));
      b.addEventListener('click', () => ouvrir(fig));
      fig.appendChild(b);
      boutons.set(fig, b);
    }
    const figBilan = figures.find((f) => f.closest('.bilan-tel'));
    if (figBilan) majLoupeBilan = () => boutons.get(figBilan).setAttribute('aria-label', `Agrandir l’écran : ${sansBalises(legende(figBilan, etapeActive()))}`);

    function collecter() {
      const items = [], vus = new Set();
      for (const fig of figures) {
        if (!fig.getClientRects().length) continue;
        const imgs = fig.closest('.bilan-tel') ? $$('.bilan-ecran', fig) : [$('img.tel-ecran', fig)];
        for (const img of imgs) {
          const nom = nomDe(img);
          if (!nom || vus.has(nom)) continue;
          vus.add(nom);
          const etape = img.dataset.ecran !== undefined ? $(`.etape[data-ecran="${img.dataset.ecran}"]`) : null;
          items.push({ fig, img, nom, legende: legende(fig, etape), alt: img.alt || $('img', etape || document.createElement('i'))?.alt || '' });
        }
      }
      return items;
    }

    let dlg, voile, piste, scene, compte, leg, prec, suiv, chromes, pg;
    let items = [], diapos = [], ouvert = false, ferme = false, cache = null;
    const T = { x: 0, y: 0, s: 1, o: 0 };
    let telActif = null;
    function peindre() {
      if (telActif) telActif.style.transform = `translate3d(${T.x.toFixed(2)}px, ${T.y.toFixed(2)}px, 0) scale(${T.s.toFixed(4)})`;
      const o = borne(T.o, 0, 1).toFixed(3);
      voile.style.opacity = o;
      for (const c of chromes) c.style.opacity = o;
    }
    const rX = new Ressort(0, { reponse: 0.42, precision: 0.3, surMaj: (v) => { T.x = v; peindre(); } });
    const rY = new Ressort(0, { reponse: 0.42, precision: 0.3, surMaj: (v) => { T.y = v; peindre(); } });
    const rS = new Ressort(1, { reponse: 0.42, precision: 0.0005, surMaj: (v) => { T.s = v; peindre(); } });
    const rO = new Ressort(0, { reponse: 0.3, precision: 0.002, surMaj: (v) => { T.o = v; peindre(); } });

    function construire() {
      dlg = document.createElement('dialog');
      dlg.className = 'loupe';
      dlg.setAttribute('aria-label', 'Écrans de GoRun, agrandis');
      dlg.innerHTML = `<div class="loupe-voile"></div>
        <div class="loupe-scene"><div class="loupe-piste"></div></div>
        <div class="loupe-haut loupe-chrome"><p class="loupe-compte" aria-live="polite"></p><button class="loupe-bouton" type="button" data-loupe="fermer" aria-label="Fermer"><svg aria-hidden="true"><use href="#i-croix"/></svg></button></div>
        <div class="loupe-bas loupe-chrome"><button class="loupe-bouton" type="button" data-loupe="-1" aria-label="Écran précédent"><svg aria-hidden="true"><use href="#i-gauche"/></svg></button><p class="loupe-legende"></p><button class="loupe-bouton" type="button" data-loupe="1" aria-label="Écran suivant"><svg aria-hidden="true"><use href="#i-droite"/></svg></button></div>`;
      document.body.appendChild(dlg);
      voile = $('.loupe-voile', dlg); piste = $('.loupe-piste', dlg); scene = $('.loupe-scene', dlg);
      compte = $('.loupe-compte', dlg); leg = $('.loupe-legende', dlg);
      prec = $('[data-loupe="-1"]', dlg); suiv = $('[data-loupe="1"]', dlg);
      chromes = $$('.loupe-chrome', dlg);
      pg = creerPager({
        zone: scene, piste, nb: 1,
        surChange: (n) => changer(n),
        surVertical: {
          debut() { rX.fixer(T.x); rY.fixer(T.y); rS.fixer(T.s); rO.fixer(T.o); },
          deplacer(dy) {
            const H = window.innerHeight;
            const d = dy > 0 ? dy : -elastique(-dy, H);
            rY.fixer(d);
            rS.fixer(1 - Math.min(0.28, Math.max(0, d) / H * 0.55));
            rO.fixer(1 - Math.min(1, Math.max(0, d) / (H * 0.6)));
          },
          relacher(vy, dy) {
            const H = window.innerHeight;
            if (dy > 0 && (vy > 650 || dy + projeter(vy) > H * 0.24)) fermer(vy);
            else { rY.vers(0, { vitesse: vy, amorti: 0.86 }); rS.vers(1); rO.vers(1); rX.vers(0); }
          },
        },
      });
      dlg.addEventListener('cancel', (e) => { e.preventDefault(); fermer(); });
      dlg.addEventListener('click', (e) => {
        const b = e.target.closest('[data-loupe]');
        if (b) { if (b.dataset.loupe === 'fermer') fermer(); else pg.aller(pg.index + Number(b.dataset.loupe)); return; }
        if (e.target.closest('.loupe-scene') && !e.target.closest('.tel')) fermer();
      });
      dlg.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); pg.aller(pg.index + 1); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); pg.aller(pg.index - 1); }
        else if (e.key === 'Home') { e.preventDefault(); pg.aller(0); }
        else if (e.key === 'End') { e.preventDefault(); pg.aller(items.length - 1); }
      });
      let cumul = 0, bloque = 0;
      scene.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || performance.now() < bloque) return;
        cumul += e.deltaX;
        if (Math.abs(cumul) > 40) { pg.aller(pg.index + Math.sign(cumul)); cumul = 0; bloque = performance.now() + 420; }
      }, { passive: false });
    }

    function changer(n) {
      if (telActif && telActif !== diapos[n].tel) telActif.style.transform = '';
      telActif = diapos[n].tel;
      for (let k = n - 1; k <= n + 1; k++) diapos[k]?.charger();
      compte.textContent = `${n + 1} / ${items.length}`;
      leg.innerHTML = `<span>${items[n].legende}</span>`;
      prec.disabled = n === 0;
      suiv.disabled = n === items.length - 1;
      diapos.forEach((d, k) => d.el.setAttribute('aria-hidden', String(k !== n)));
    }

    function ouvrir(fig) {
      if (ouvert) return;
      if (!dlg) construire();
      items = collecter();
      if (!items.length) return;
      let i = items.findIndex((it) => it.fig === fig && (!fig.closest('.bilan-tel') || it.img.classList.contains('actif')));
      if (i < 0) i = 0;
      const marge = parseFloat(getComputedStyle(document.documentElement).fontSize) * 1;
      const l = Math.min(window.innerWidth - 2 * marge, (window.innerHeight - 188) / 2.081, 432);
      const sizes = `${Math.ceil(l)}px`;
      piste.textContent = '';
      diapos = items.map((it) => {
        const el = document.createElement('div');
        el.className = 'loupe-diapo';
        el.setAttribute('role', 'group');
        el.setAttribute('aria-roledescription', 'écran');
        const tel = document.createElement('figure');
        tel.className = 'tel';
        tel.innerHTML = '<div class="tel-corps"><div class="tel-verre"></div></div>';
        const pic = imageEcran(it.nom, sizes, it.alt, { differe: true });
        $('.tel-verre', tel).appendChild(pic);
        el.appendChild(tel);
        piste.appendChild(el);
        return { el, tel, charger: pic.charger };
      });
      ouvert = true; ferme = false;
      pg.reglage({ nb: items.length, index: i });
      telActif = null;
      changer(i);
      document.documentElement.classList.add('loupe-ouverte');
      dlg.showModal();
      const r1 = telActif.getBoundingClientRect();
      const r0 = items[i].fig.getBoundingClientRect();
      cache = items[i].fig;
      cache.style.visibility = 'hidden';
      rX.fixer(r0.left + r0.width / 2 - (r1.left + r1.width / 2));
      rY.fixer(r0.top + r0.height / 2 - (r1.top + r1.height / 2));
      rS.fixer(r0.width / r1.width);
      rO.fixer(0);
      rX.vers(0); rY.vers(0); rS.vers(1); rO.vers(1);
    }

    function fermer(vy = 0) {
      if (!ouvert || ferme) return;
      ferme = true;
      const it = items[pg.index];
      const r = telActif.getBoundingClientRect();
      const cx1 = r.left + r.width / 2 - T.x, cy1 = r.top + r.height / 2 - T.y, w1 = r.width / T.s;
      const r0 = it.fig.getBoundingClientRect();
      const visible = it.fig.getClientRects().length && r0.bottom > 0 && r0.top < window.innerHeight && r0.right > 0 && r0.left < window.innerWidth;
      let restants = 0;
      const un = () => { if (--restants <= 0) terminer(it); };
      if (visible) {
        if (cache && cache !== it.fig) cache.style.visibility = '';
        cache = it.fig;
        cache.style.visibility = 'hidden';
        restants = 4;
        rX.vers(r0.left + r0.width / 2 - cx1, { fin: un });
        rY.vers(r0.top + r0.height / 2 - cy1, { vitesse: vy, fin: un });
        rS.vers(r0.width / w1, { fin: un });
        rO.vers(0, { reponse: 0.36, fin: un });
      } else {
        restants = 2;
        rS.vers(0.86, { fin: un });
        rO.vers(0, { fin: un });
        const tel = telActif;
        const fondu = new Ressort(1, { surMaj: (o) => { tel.style.opacity = o.toFixed(3); } });
        fondu.vers(0, { reponse: 0.28 });
      }
    }
    function terminer(it) {
      dlg.close();
      document.documentElement.classList.remove('loupe-ouverte');
      if (cache) cache.style.visibility = '';
      cache = null; telActif = null; ouvert = false; ferme = false;
      piste.textContent = '';
      boutons.get(it.fig)?.focus({ preventScroll: true });
    }
  })();

  function quandDonnees(fn) {
    if (window.FOULEE_PLAQUE) fn(window.FOULEE_PLAQUE);
    else document.addEventListener('DOMContentLoaded', () => { if (window.FOULEE_PLAQUE) fn(window.FOULEE_PLAQUE); }, { once: true });
  }

  quandDonnees((D) => {
    const PAS = D.pas;
    function preparer(c) {
      c.T = Float64Array.from(c.t, (v) => v / 100);
      c.X = Float64Array.from(c.x, (v) => v / 10);
      c.Y = Float64Array.from(c.y, (v) => v / 10);
      c.n = c.T.length;
      c.dMax = (c.n - 1) * PAS;
      return c;
    }
    const J = preparer(D.jour);
    const R = preparer(D.record);
    const DIST_PARCOURS = Math.round(R.distance);
    const DIST_REGLE = Math.ceil(J.dMax / 10) * 10;

    function tempsA(c, d) {
      const f = Math.min(Math.max(d, 0), c.dMax) / PAS;
      const i = Math.min(Math.floor(f), c.n - 2);
      return c.T[i] + (f - i) * (c.T[i + 1] - c.T[i]);
    }
    function distanceA(c, t) {
      if (t <= c.T[0]) return 0;
      if (t >= c.T[c.n - 1]) return c.dMax;
      let bas = 0, haut = c.n - 1;
      while (haut - bas > 1) {
        const m = (bas + haut) >> 1;
        if (c.T[m] < t) bas = m; else haut = m;
      }
      const f = (t - c.T[bas]) / (c.T[haut] - c.T[bas] || 1);
      return (bas + f) * PAS;
    }
    function position(c, d) {
      const f = Math.min(Math.max(d, 0), c.dMax) / PAS;
      const i = Math.min(Math.floor(f), c.n - 2);
      const r = f - i;
      return [c.X[i] + r * (c.X[i + 1] - c.X[i]), c.Y[i] + r * (c.Y[i + 1] - c.Y[i])];
    }
    function ecartA(d) {
      if (d >= R.dMax) return J.duree - R.duree;
      return tempsA(J, d) - tempsA(R, d);
    }
    function allureRecente(t) {
      const t0 = Math.max(0, t - 20);
      const dd = distanceA(J, t) - distanceA(J, t0);
      return dd > 10 ? (t - t0) / (dd / 1000) : NaN;
    }
    function annonceKm(km) {
      const d = km * 1000;
      const t = tempsA(J, d);
      let texte = `${km} kilomètre${km > 1 ? 's' : ''}. Temps${NNBSP}: ${fmt.dureeParlee(t)}. Allure moyenne${NNBSP}: ${fmt.allureParlee(t / km)}.`;
      const split = J.splits[km - 1];
      if (split) texte += ` Dernier kilomètre en ${fmt.dureeParlee(split)}.`;
      const e = ecartA(d);
      if (Math.abs(e) >= 1) {
        texte += e < 0
          ? ` ${fmt.dureeParlee(-e)} d’avance sur votre record.`
          : ` ${fmt.dureeParlee(e)} de retard sur votre record.`;
      }
      return texte;
    }
    const annonceFin = () =>
      `Course terminée. ${fmt.km(J.distance).replace(',', ' virgule ')} kilomètres en ${fmt.dureeParlee(J.duree)}.`;
    const annonceDepart = () => `C’est parti sur ${D.parcours}.`;

    function cheminCourse(c, jusqua = c.n) {
      let s = `M${c.X[0].toFixed(1)} ${c.Y[0].toFixed(1)}L`;
      for (let i = 1; i < jusqua; i++) s += `${c.X[i].toFixed(1)} ${c.Y[i].toFixed(1)} `;
      return s.trim();
    }
    function expositions(c) {
      const res = [];
      for (let t = 60; t <= c.T[c.n - 1]; t += 60) res.push({ t, d: distanceA(c, t) });
      return res;
    }
    function nbAvant(liste, t) {
      let bas = 0, haut = liste.length;
      while (bas < haut) { const m = (bas + haut) >> 1; if (liste[m].t <= t) bas = m + 1; else haut = m; }
      return bas;
    }
    const T_CAPTURE = 2004;
    const EXPOS_J = expositions(J);
    const EXPOS_R = expositions(R);

    const regles = new Map();
    const ro = 'ResizeObserver' in window ? new ResizeObserver((entrees) => {
      for (const e of entrees) { const r = regles.get(e.target); if (r && e.target.clientWidth !== r.largeur) r.dessiner(); }
    }) : null;
    function construireRegle(boite) {
      if (regles.has(boite)) return regles.get(boite);
      const mode = boite.dataset.regle;
      const etat = { boite, mode, d: mode === 'fin' ? J.dMax : distanceA(J, T_CAPTURE), maj: null, largeur: 0 };
      const id = `r-${mode}`;

      function dessiner() {
        const W = Math.round(boite.clientWidth);
        if (!W) return;
        etat.largeur = W;
        const etroit = W < 560;
        const H = etroit ? 124 : 146;
        const gauche = etroit ? 60 : 78, droite = etroit ? 12 : 20;
        const y0 = etroit ? 44 : 52;
        const ech = etroit ? 2.3 : 2.9;
        const yRec = y0 + (etroit ? 24 : 30), yJour = yRec + (etroit ? 13 : 15), yKm = H - 4;
        const x = (d) => gauche + (d / DIST_REGLE) * (W - gauche - droite);
        boite.textContent = '';
        const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, focusable: 'false' }, boite);
        const defs = svgEl('defs', null, svg);
        const cpHaut = svgEl('clipPath', { id: `${id}-haut` }, defs);
        svgEl('rect', { x: 0, y: -200, width: W, height: y0 + 200 }, cpHaut);
        const cpBas = svgEl('clipPath', { id: `${id}-bas` }, defs);
        svgEl('rect', { x: 0, y: y0, width: W, height: H }, cpBas);
        const cpRev = svgEl('clipPath', { id: `${id}-rev` }, defs);
        const rectRev = svgEl('rect', { x: 0, y: -200, width: x(etat.d), height: H + 400 }, cpRev);

        let gr = '', grKm = '';
        for (let m = 0; m <= DIST_REGLE; m += 100) {
          const km = m % 1000 === 0, xm = x(m).toFixed(1);
          if (km) grKm += `M${xm} ${yKm - 26}V${yKm - 16}`; else gr += `M${xm} ${yKm - 20}V${yKm - 16}`;
        }
        svgEl('path', { class: 'grad', d: gr }, svg);
        svgEl('path', { class: 'grad-km', d: grKm }, svg);
        const pasLib = etroit ? 2 : 1;
        for (let k = 0; k * 1000 <= DIST_REGLE; k += pasLib) {
          const t = svgEl('text', { class: 'lib lib-km', x: x(k * 1000), y: yKm, 'text-anchor': k === 0 ? 'start' : 'middle' }, svg);
          t.textContent = k === 0 ? '0' : `${k}${k === 8 ? ' km' : ''}`;
        }
        svgEl('line', { class: 'axe', x1: gauche, x2: W - droite, y1: yKm - 16, y2: yKm - 16 }, svg);
        svgEl('line', { class: 'zero', x1: gauche, x2: W - droite, y1: y0, y2: y0 }, svg);
        const libs = [['DEVANT', y0 - 10], ['DERRIÈRE', y0 + 14], ['RECORD', yRec + 4], ['VOUS', yJour + 4]];
        for (const [txt, y] of libs) {
          const t = svgEl('text', { class: 'lib', x: 0, y }, svg);
          t.textContent = txt;
          if (txt === 'VOUS') t.setAttribute('fill', 'var(--orange)');
          if (etroit) t.setAttribute('font-size', '9.5');
        }

        let dCourbe = '';
        for (let m = 0; m <= Math.min(DIST_REGLE, R.dMax); m += 20) {
          const y = y0 + ecartA(m) * ech;
          dCourbe += `${m ? 'L' : 'M'}${x(m).toFixed(1)} ${y.toFixed(1)}`;
        }
        const gRev = svgEl('g', { 'clip-path': `url(#${id}-rev)` }, svg);
        svgEl('path', { class: 'courbe courbe-avance', d: dCourbe, 'clip-path': `url(#${id}-haut)` }, gRev);
        svgEl('path', { class: 'courbe courbe-retard', d: dCourbe, 'clip-path': `url(#${id}-bas)` }, gRev);

        const expoR = EXPOS_R.map((e) => svgEl('line', { class: 'expo-rec', x1: x(e.d), x2: x(e.d), y1: yRec - 4, y2: yRec + 4, style: 'opacity:0' }, svg));
        const expoJ = EXPOS_J.map((e) => svgEl('line', { class: 'expo-jour', x1: x(e.d), x2: x(e.d), y1: yJour - 4, y2: yJour + 4, style: 'opacity:0' }, svg));
        let nJ = 0, nR = 0;

        const ligne = svgEl('line', { class: 'curseur-ligne', y1: 4, y2: yJour + 7 }, svg);
        const point = svgEl('circle', { class: 'curseur-point', r: 4.5 }, svg);
        const val = svgEl('text', { class: 'curseur-val', 'text-anchor': 'middle' }, svg);

        etat.maj = (d, t) => {
          etat.d = d;
          const xc = x(d);
          rectRev.setAttribute('width', Math.max(0, xc));
          ligne.setAttribute('x1', xc); ligne.setAttribute('x2', xc);
          const e = ecartA(Math.min(d, R.dMax));
          const yc = y0 + e * ech;
          point.setAttribute('cx', xc); point.setAttribute('cy', yc);
          const couleur = e <= 0 ? 'var(--avance)' : 'var(--retard)';
          point.setAttribute('stroke', couleur);
          val.setAttribute('fill', couleur);
          const xv = Math.min(Math.max(xc, gauche + 22), W - droite - 22);
          val.setAttribute('x', xv);
          val.setAttribute('y', Math.max(13, Math.min(yc, y0) - 9));
          val.textContent = d < 5 ? '0:00' : fmt.ecart(d >= J.dMax - 1 ? J.duree - R.duree : e);
          const tc = t ?? tempsA(J, d);
          const mJ = nbAvant(EXPOS_J, tc), mR = nbAvant(EXPOS_R, tc);
          for (let i = Math.min(nJ, mJ); i < Math.max(nJ, mJ); i++) expoJ[i].style.opacity = i < mJ ? 1 : 0;
          for (let i = Math.min(nR, mR); i < Math.max(nR, mR); i++) expoR[i].style.opacity = i < mR ? 0.75 : 0;
          nJ = mJ; nR = mR;
        };
        etat.maj(etat.d);
      }
      etat.dessiner = dessiner;
      regles.set(boite, etat);
      dessiner();
      if (ro) ro.observe(boite);
      return etat;
    }
    const boitesRegles = $$('[data-regle]');
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entrees) => {
        for (const e of entrees) if (e.isIntersecting) { construireRegle(e.target); io.unobserve(e.target); }
      }, { rootMargin: '400px 0px' });
      boitesRegles.forEach((b) => io.observe(b));
    } else boitesRegles.forEach(construireRegle);
    if (!ro) {
      let largeurFenetre = window.innerWidth;
      window.addEventListener('resize', () => {
        if (window.innerWidth === largeurFenetre) return;
        largeurFenetre = window.innerWidth;
        clearTimeout(construireRegle.t);
        construireRegle.t = setTimeout(() => regles.forEach((r) => r.dessiner()), 120);
      });
    }

    const carte = $('#plaque-carte');
    let plancheFaite = false;
    function initPlanche() {
      if (plancheFaite || !carte) return;
      plancheFaite = true;
      const [VW, VH] = D.vb;
      carte.setAttribute('viewBox', `0 0 ${VW} ${VH}`);
      const proj = (lat, lon) => {
        const p = D.proj, R0 = 6371000;
        const mx = (lon - p.lon0) * Math.PI / 180 * R0 * p.k;
        const my = -(lat - p.lat0) * Math.PI / 180 * R0;
        return [(mx - p.minx) * p.echelle, (my - p.miny) * p.echelle];
      };

      const fond = svgEl('g', { class: 'fond' }, carte);
      svgEl('rect', { width: VW, height: VH, fill: '#0c0c0d' }, fond);
      svgEl('path', { class: 'parc', d: D.carte.parc }, fond);
      svgEl('path', { class: 'eau', d: D.carte.eau, 'fill-rule': 'evenodd' }, fond);
      svgEl('path', { class: 'allees', d: D.carte.allees }, fond);
      for (const k of ['r', 't', 's', 'p']) svgEl('path', { class: `rue rue-${k}`, d: D.carte.rues[k] }, fond);

      const u = 250 / D.metresParUnite;
      let q = '';
      for (let xg = u; xg < VW; xg += u) q += `M${xg.toFixed(1)} 0V${VH}`;
      for (let yg = u; yg < VH; yg += u) q += `M0 ${yg.toFixed(1)}H${VW}`;
      svgEl('path', { class: 'quadrillage', d: q }, fond);
      const L500 = 500 / D.metresParUnite;
      const ex = VW - 40 - L500, ey = VH - 34;
      svgEl('path', { class: 'echelle', d: `M${ex} ${ey - 6}V${ey}H${ex + L500}V${ey - 6}M${ex + L500 / 2} ${ey - 4}V${ey}`, fill: 'none' }, fond);
      const libEch = svgEl('text', { class: 'echelle-lib', x: ex + L500, y: ey - 12, 'text-anchor': 'end' }, fond);
      libEch.textContent = '500 m';
      const [lx, ly] = proj(45.7805, 4.8522);
      svgEl('text', { class: 'nom-lieu', x: lx.toFixed(1), y: ly.toFixed(1), 'text-anchor': 'middle' }, fond).textContent = 'Lac';

      const dRec = cheminCourse(R), dJour = cheminCourse(J);
      svgEl('path', { class: 'parcours', d: dRec }, carte);
      const traceR = svgEl('path', { class: 'trace-record', d: dRec, pathLength: Math.round(R.dMax) }, carte);
      const traceJ = svgEl('path', { class: 'trace-jour', d: dJour, pathLength: Math.round(J.dMax) }, carte);
      traceR.style.strokeDasharray = `${Math.round(R.dMax)} ${Math.round(R.dMax)}`;
      traceJ.style.strokeDasharray = `${Math.round(J.dMax)} ${Math.round(J.dMax)}`;
      const gExpo = svgEl('g', null, carte);
      const marquesR = EXPOS_R.map((e) => { const [px, py] = position(R, e.d); return svgEl('circle', { class: 'm-rec', cx: px.toFixed(1), cy: py.toFixed(1), r: 4.4 }, gExpo); });
      const marquesJ = EXPOS_J.map((e) => { const [px, py] = position(J, e.d); return svgEl('circle', { class: 'm-jour', cx: px.toFixed(1), cy: py.toFixed(1), r: 3.9 }, gExpo); });
      let nMJ = 0, nMR = 0;
      const [sx, sy] = [J.X[0], J.Y[0]];
      svgEl('circle', { class: 'depart', cx: sx, cy: sy, r: 13 }, carte);
      svgEl('text', { class: 'depart-lib', x: sx + 20, y: sy + 30 }, carte).textContent = 'DÉPART';
      const coureurR = svgEl('circle', { class: 'coureur-rec', r: 9.5 }, carte);
      const gJour = svgEl('g', null, carte);
      svgEl('circle', { class: 'coureur-jour-halo', r: 12 }, gJour);
      svgEl('circle', { class: 'coureur-jour', r: 8.5 }, gJour);

      const plaque = $('#plaque');
      const hud = document.createElement('div');
      hud.className = 'plaque-hud';
      hud.setAttribute('aria-hidden', 'true');
      hud.innerHTML = '<p><b class="chiffre" data-v="km">6,42</b><small>km</small></p><p><b class="chiffre" data-v="temps">33:24</b></p><p><b class="chiffre avance" data-v="ecartCourt">−0:08</b></p>';
      plaque.appendChild(hud);

      const champs = {};
      $$('[data-v]').forEach((n) => { (champs[n.dataset.v] ||= []).push(n); });
      const ecrire = (cle, texte) => { for (const n of champs[cle] || []) if (n.textContent !== texte) n.textContent = texte; };
      const etat = (cle, avance) => { for (const n of champs[cle] || []) { n.classList.toggle('avance', avance); n.classList.toggle('retard', !avance); } };

      const curseur = $('#curseur');
      const annonce = $('#annonce-texte');
      const activite = $('.activite');
      const regleP = construireRegle($('[data-regle="planche"]'));
      let T = T_CAPTURE;
      let dernierKm = 6;

      function rendre() {
        const dJ = distanceA(J, T);
        const dR = distanceA(R, T);
        const fini = T >= J.duree - 0.01;
        traceJ.style.strokeDashoffset = Math.round(J.dMax) - dJ;
        traceR.style.strokeDashoffset = Math.round(R.dMax) - dR;
        const [jx, jy] = position(J, dJ);
        gJour.setAttribute('transform', `translate(${jx.toFixed(1)} ${jy.toFixed(1)})`);
        const [rx, ry] = position(R, dR);
        coureurR.setAttribute('cx', rx.toFixed(1)); coureurR.setAttribute('cy', ry.toFixed(1));
        const mJ = nbAvant(EXPOS_J, T), mR = nbAvant(EXPOS_R, T);
        for (let i = Math.min(nMJ, mJ); i < Math.max(nMJ, mJ); i++) marquesJ[i].classList.toggle('on', i < mJ);
        for (let i = Math.min(nMR, mR); i < Math.max(nMR, mR); i++) marquesR[i].classList.toggle('on', i < mR);
        nMJ = mJ; nMR = mR;
        const e = fini ? J.duree - R.duree : ecartA(dJ);
        const montre = dJ > 20;
        ecrire('km', fmt.km(dJ)); ecrire('km2', fmt.km(dJ));
        ecrire('ile', `${fmt.km(dJ, dJ >= 10000 ? 1 : 2)} km`);
        ecrire('temps', fmt.duree(T)); ecrire('temps2', fmt.duree(T));
        const moy = montre ? fmt.allure(T / (dJ / 1000)) : '--:--';
        ecrire('moyenne', moy); ecrire('moyenne2', moy);
        ecrire('allure', fmt.allure(allureRecente(T)));
        const reste = `Reste ${fmt.distance(Math.max(0, DIST_PARCOURS - dJ))}`;
        ecrire('reste', reste); ecrire('reste2', reste);
        const txtEcart = montre ? `${fmt.ecart(e)} vs record` : `Record ${fmt.duree(R.duree)}`;
        ecrire('ecart', txtEcart); ecrire('ecart2', txtEcart);
        ecrire('ecartCourt', montre ? fmt.ecart(e) : '0:00');
        etat('ecart', e <= 0); etat('ecart2', e <= 0); etat('ecartCourt', e <= 0);
        for (const n of champs.prog || []) n.style.setProperty('--p', Math.min(1, dJ / DIST_PARCOURS).toFixed(4));
        const k = Math.min(Math.floor(dJ / 1000), J.splits.length);
        if (k >= 1 && J.splits[k - 1] && (k < J.splits.length || dJ >= J.dMax - 1)) {
          const s = J.splits[k - 1];
          const estComplet = k < J.splits.length || J.distance - (J.splits.length - 1) * 1000 >= 999;
          ecrire('kmNom', `Km ${k}`);
          ecrire('kmAllure', `${fmt.allure(estComplet ? s : s / ((J.distance % 1000) / 1000))} /km`);
          if (k >= 2) {
            const delta = s - J.splits[k - 2];
            ecrire('kmDelta', fmt.ecart(delta)); etat('kmDelta', delta <= 0);
          } else ecrire('kmDelta', '');
        } else { ecrire('kmNom', 'Km —'); ecrire('kmAllure', '--:-- /km'); ecrire('kmDelta', ''); }
        if (activite && activite.classList.contains('fini') !== fini) activite.classList.toggle('fini', fini);
        for (const n of champs.statut || []) {
          if (n.classList.contains('termine') === fini) continue;
          n.classList.toggle('termine', fini);
          n.lastChild.textContent = fini ? 'TERMINÉE' : 'EN COURS';
        }
        if (curseur && document.activeElement !== curseur) curseur.value = Math.round(Math.min(dJ, J.dMax) / 10) * 10;
        if (curseur) {
          curseur.style.setProperty('--rempli', `${(dJ / J.dMax * 100).toFixed(2)}%`);
          curseur.setAttribute('aria-valuetext', `${fmt.km(dJ)} kilomètres, ${fmt.duree(T)}, ${montre ? fmt.ecart(e).replace('−', 'moins ') + ' sur le record' : 'départ'}`);
        }
        if (regleP && regleP.maj) regleP.maj(Math.min(dJ, J.dMax), T);
      }

      const synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
      const boutonVoix = $('#voix');
      let voixActive = false;
      let voixFr = null;
      const choisirVoix = () => {
        if (!synth) return;
        const v = synth.getVoices();
        voixFr = v.find((x) => /^fr[-_]FR/i.test(x.lang)) || v.find((x) => /^fr/i.test(x.lang)) || null;
      };
      if (synth) { choisirVoix(); synth.addEventListener?.('voiceschanged', choisirVoix); }
      else if (boutonVoix) { boutonVoix.disabled = true; boutonVoix.title = 'Synthèse vocale indisponible dans ce navigateur'; }
      function dire(texte, fin) {
        if (annonce) annonce.textContent = `«${NNBSP}${texte}${NNBSP}»`;
        if (!voixActive || !synth) { if (fin) fin(); return; }
        synth.cancel();
        const u = new SpeechSynthesisUtterance(texte);
        u.lang = 'fr-FR';
        if (voixFr) u.voice = voixFr;
        u.rate = 1.02;
        let fait = false;
        const finir = () => { if (!fait) { fait = true; if (fin) fin(); } };
        u.onend = finir; u.onerror = finir;
        setTimeout(finir, 9000);
        synth.speak(u);
      }
      boutonVoix?.addEventListener('click', () => {
        voixActive = !voixActive;
        boutonVoix.setAttribute('aria-pressed', String(voixActive));
        boutonVoix.querySelector('use').setAttribute('href', voixActive ? '#i-voix' : '#i-muet');
        if (synth) {
          synth.cancel();
          if (voixActive) { const u = new SpeechSynthesisUtterance(''); u.lang = 'fr-FR'; synth.speak(u); }
        }
      });

      const boutonDepart = $('#depart');
      const decompte = $('#decompte');
      const VITESSE = 100;
      let mode = 'arret';
      let precedent = 0;
      let raf = 0;
      let minuteries = [];

      function libelleBouton(txt, icone) {
        if (!boutonDepart) return;
        boutonDepart.querySelector('span').textContent = txt;
        boutonDepart.querySelector('use').setAttribute('href', icone);
      }
      function boucle(maintenant) {
        if (mode !== 'course') { raf = 0; return; }
        const dt = Math.min(0.1, (maintenant - precedent) / 1000);
        precedent = maintenant;
        T = Math.min(J.duree, T + dt * VITESSE);
        const dJ = distanceA(J, T);
        const km = Math.floor(dJ / 1000);
        if (km > dernierKm && km <= 8) {
          dernierKm = km;
          T = tempsA(J, km * 1000);
          rendre();
          mode = 'attente';
          dire(annonceKm(km), () => { if (mode === 'attente') { mode = 'course'; precedent = performance.now(); raf = requestAnimationFrame(boucle); } });
          if (!voixActive) { mode = 'course'; }
          else { raf = 0; return; }
        }
        rendre();
        if (T >= J.duree) {
          mode = 'fini';
          libelleBouton('Rejouer', '#i-rejouer');
          dire(annonceFin());
          raf = 0;
          return;
        }
        raf = requestAnimationFrame(boucle);
      }
      function lancer() {
        mode = 'course';
        libelleBouton('Pause', '#i-pause');
        precedent = performance.now();
        if (!raf) raf = requestAnimationFrame(boucle);
      }
      function arreter(libelle = 'Reprendre') {
        minuteries.forEach(clearTimeout); minuteries = [];
        decompte?.classList.remove('on');
        if (mode === 'course' || mode === 'attente' || mode === 'decompte') mode = 'arret';
        cancelAnimationFrame(raf); raf = 0;
        synth?.cancel();
        libelleBouton(libelle, '#i-lecture');
      }
      function depart() {
        T = 0; dernierKm = 0;
        rendre();
        if (mqReduit.matches) {
          T = J.duree; dernierKm = 8; mode = 'fini';
          rendre(); dire(annonceFin()); libelleBouton('Rejouer', '#i-rejouer');
          return;
        }
        if (!decompte) { dire(annonceDepart()); lancer(); return; }
        mode = 'decompte';
        libelleBouton('Prêt…', '#i-lecture');
        decompte.classList.add('on');
        ['3', '2', '1'].forEach((n, i) => minuteries.push(setTimeout(() => {
          decompte.innerHTML = `<span>${n}</span>`;
        }, i * 720)));
        minuteries.push(setTimeout(() => {
          decompte.classList.remove('on');
          decompte.textContent = '';
          dire(annonceDepart());
          lancer();
        }, 3 * 720));
      }
      boutonDepart?.addEventListener('click', () => {
        if (mode === 'course' || mode === 'attente') arreter('Reprendre');
        else if (mode === 'decompte') arreter('Départ');
        else if (mode === 'arret' && boutonDepart.querySelector('span').textContent === 'Reprendre' && T > 0 && T < J.duree) lancer();
        else depart();
      });
      curseur?.addEventListener('input', () => {
        if (mode !== 'arret' && mode !== 'fini') arreter(T > 0 ? 'Reprendre' : 'Départ');
        const d = Math.min(Number(curseur.value), J.dMax);
        T = tempsA(J, d);
        dernierKm = Math.floor(d / 1000);
        if (mode === 'fini' && T < J.duree) mode = 'arret';
        libelleBouton(T >= J.duree - 0.01 ? 'Rejouer' : 'Reprendre', T >= J.duree - 0.01 ? '#i-rejouer' : '#i-lecture');
        if (annonce) annonce.textContent = dernierKm >= 1 ? `«${NNBSP}${annonceKm(Math.min(dernierKm, 8))}${NNBSP}»` : `«${NNBSP}${annonceDepart()}${NNBSP}»`;
        rendre();
      });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver((e) => { if (!e[0].isIntersecting && (mode === 'course' || mode === 'attente')) arreter('Reprendre'); }, { threshold: 0 }).observe(plaque);
      }
      document.addEventListener('visibilitychange', () => { if (document.hidden && (mode === 'course' || mode === 'attente')) arreter('Reprendre'); });

      rendre();
      if (annonce) annonce.textContent = `«${NNBSP}${annonceKm(6)}${NNBSP}»`;
    }
    if (carte) {
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((e) => { if (e[0].isIntersecting) { io.disconnect(); initPlanche(); } }, { rootMargin: '60% 0px' });
        io.observe($('#planche'));
      } else initPlanche();
      const auRepos = () => surInactivite(initPlanche, 4000);
      if (document.readyState === 'complete') auRepos(); else window.addEventListener('load', auRepos, { once: true });
    }

    (function montre() {
      const el = $('#montre');
      if (!el) return;
      const piste = $('#m-piste');
      const pages = $$('.m-page', piste);
      const points = $('#m-points');
      const dialogue = $('#m-dialogue'), resume = $('#m-resume');
      const btnPause = $('[data-m="pause"]', el), libPause = $('[data-m="pause-lib"]', el), titre = $('#m-titre');
      const champ = (id) => $(`#m-${id}`);
      const C = { chrono: champ('chrono'), km: champ('km'), moy: champ('moy'), allure: champ('allure'), fc: champ('fc'), reste: champ('reste'), pas: champ('pas'), kcal: champ('kcal') };
      const NOMS = ['Commandes', 'Mesures', 'Détails', 'Carte'];
      const TITRE = titre.textContent;
      let tM = T_CAPTURE, enPause = false, termine = false, enVue = false, minuterie = 0;

      [dialogue, resume].forEach((c) => c.setAttribute('data-sans-glisse', ''));
      const boutonsPoints = NOMS.map((nom, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'm-point';
        b.setAttribute('aria-label', `${nom}, page ${i + 1} sur ${NOMS.length}`);
        b.addEventListener('click', () => pg.aller(i));
        points.appendChild(b);
        return b;
      });
      function majPages(i) {
        pages.forEach((p, k) => { p.inert = k !== i; });
        boutonsPoints.forEach((b, k) => { if (k === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
        if (i === 3) carteMontre();
      }
      const pg = creerPager({ zone: el, piste, cadre: $('.montre-ecran', el), nb: 4, index: 1, surChange: majPages });
      majPages(1);
      el.addEventListener('keydown', (e) => {
        if (!dialogue.hidden || !resume.hidden) return;
        if (e.key === 'ArrowRight') { e.preventDefault(); pg.aller(pg.index + 1); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); pg.aller(pg.index - 1); }
      });

      let carteFaite = false, mcTrace = null, mcMoi = null;
      function carteMontre() {
        if (!carteFaite) {
          carteFaite = true;
          const svg = $('#m-carte');
          let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
          for (let i = 0; i < R.n; i++) { x0 = Math.min(x0, R.X[i]); x1 = Math.max(x1, R.X[i]); y0 = Math.min(y0, R.Y[i]); y1 = Math.max(y1, R.Y[i]); }
          const m = Math.max(x1 - x0, y1 - y0) * 0.12;
          svg.setAttribute('viewBox', `${(x0 - m).toFixed(1)} ${(y0 - m).toFixed(1)} ${(x1 - x0 + 2 * m).toFixed(1)} ${(y1 - y0 + 2 * m).toFixed(1)}`);
          svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
          svgEl('rect', { x: -2000, y: -2000, width: 6000, height: 6000, fill: '#101112' }, svg);
          svgEl('path', { class: 'mc-parc', d: D.carte.parc }, svg);
          svgEl('path', { class: 'mc-eau', d: D.carte.eau, 'fill-rule': 'evenodd' }, svg);
          svgEl('path', { class: 'mc-parcours', d: cheminCourse(R) }, svg);
          mcTrace = svgEl('path', { class: 'mc-trace', d: cheminCourse(J), pathLength: Math.round(J.dMax) }, svg);
          mcTrace.style.strokeDasharray = `${Math.round(J.dMax)} ${Math.round(J.dMax)}`;
          mcMoi = svgEl('circle', { class: 'mc-moi', r: 11 }, svg);
        }
        const d = distanceA(J, tM);
        mcTrace.style.strokeDashoffset = Math.round(J.dMax) - d;
        const [x, y] = position(J, d);
        mcMoi.setAttribute('cx', x.toFixed(1)); mcMoi.setAttribute('cy', y.toFixed(1));
      }

      function maj() {
        const d = distanceA(J, tM);
        C.chrono.textContent = fmt.duree(tM);
        C.km.textContent = fmt.km(d);
        C.moy.textContent = fmt.allure(tM / (d / 1000));
        C.allure.textContent = enPause ? '--:--' : fmt.allure(allureRecente(tM));
        const fc = D.fcJour?.[Math.min(D.fcJour.length - 1, Math.floor(tM / 30))];
        if (fc) C.fc.textContent = String(fc);
        C.reste.textContent = `−${fmt.distance(Math.max(0, DIST_PARCOURS - d))}`;
        C.pas.textContent = fmt.entier(5744 + (tM - T_CAPTURE) * 174 / 60);
        C.kcal.textContent = String(Math.floor(1.036 * 70 * d / 1000));
        if (pg.index === 3) carteMontre();
      }
      const tic = () => {
        if (enPause || termine) return;
        tM += 1;
        if (tM >= J.duree) { tM = J.duree; maj(); afficherResume(true); return; }
        maj();
      };
      const demarrerTic = () => { if (!minuterie && enVue) minuterie = setInterval(tic, 1000); };
      const arreterTic = () => { clearInterval(minuterie); minuterie = 0; };

      function basculerPause() {
        enPause = !enPause;
        el.classList.toggle('en-pause', enPause);
        btnPause.classList.toggle('reprendre', enPause);
        btnPause.setAttribute('aria-label', enPause ? 'Reprendre' : 'Mettre en pause');
        $('use', btnPause).setAttribute('href', enPause ? '#i-lecture' : '#i-pause');
        libPause.textContent = enPause ? 'Reprendre' : 'Pause';
        titre.innerHTML = enPause ? '<svg aria-hidden="true"><use href="#i-pause"/></svg>PAUSE' : TITRE;
        maj();
        pg.aller(1);
      }
      function afficherResume(complet) {
        termine = true; arreterTic();
        const d = complet ? J.distance : distanceA(J, tM);
        const t = complet ? J.duree : tM;
        const n = Math.min(D.fcJour.length, Math.floor(t / 30) + 1);
        const fcMoy = Math.floor(D.fcJour.slice(0, n).reduce((a, b) => a + b, 0) / n);
        const lignes = [
          ['Distance', `${fmt.km(d)} km`], ['Temps', fmt.duree(t)], ['Allure moy.', `${fmt.allure(t / (d / 1000))} /km`],
          ['FC moy.', `${fcMoy} bpm`], ['Cadence', `${complet ? 175 : 174} pas/min`],
          ['Calories', `${Math.floor(1.036 * 70 * d / 1000)} kcal`], ['Dénivelé +', `${complet ? 6 : 3} m`],
        ];
        if (complet) lignes.push(['vs record', fmt.ecart(J.duree - R.duree)]);
        $('#m-stats').innerHTML = lignes.map(([a, b]) => `<div><dt>${a}</dt><dd${a === 'vs record' ? ' class="avance"' : ''}>${b}</dd></div>`).join('');
        const forme = $('#m-forme');
        const k = Math.max(2, Math.min(J.n, Math.floor(d / PAS) + 1));
        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        for (let i = 0; i < k; i++) { x0 = Math.min(x0, J.X[i]); x1 = Math.max(x1, J.X[i]); y0 = Math.min(y0, J.Y[i]); y1 = Math.max(y1, J.Y[i]); }
        forme.setAttribute('viewBox', `${x0.toFixed(1)} ${y0.toFixed(1)} ${Math.max(1, x1 - x0).toFixed(1)} ${Math.max(1, y1 - y0).toFixed(1)}`);
        forme.innerHTML = '';
        svgEl('path', { d: cheminCourse(J, k) }, forme);
        dialogue.hidden = true;
        resume.hidden = false;
        resume.scrollTop = 0;
        piste.inert = true;
        $('.m-ok', resume).focus({ preventScroll: true });
      }
      function recommencer() {
        tM = T_CAPTURE; termine = false;
        if (enPause) basculerPause();
        resume.hidden = true; piste.inert = false;
        maj(); pg.aller(1); demarrerTic();
        el.focus({ preventScroll: true });
      }
      el.addEventListener('click', (e) => {
        const b = e.target.closest('[data-m]');
        if (!b) return;
        const a = b.dataset.m;
        if (a === 'pause') basculerPause();
        else if (a === 'terminer') { dialogue.hidden = false; piste.inert = true; $('.m-choix-rouge', dialogue).focus({ preventScroll: true }); }
        else if (a === 'continuer') { dialogue.hidden = true; piste.inert = false; $('[data-m="terminer"]', el).focus({ preventScroll: true }); }
        else if (a === 'confirmer') afficherResume(false);
        else if (a === 'ok') recommencer();
      });

      maj();
      if (!('IntersectionObserver' in window)) return;
      new IntersectionObserver((e) => {
        enVue = e[0].isIntersecting;
        el.classList.toggle('en-vue', enVue);
        if (enVue && !mqReduit.matches) demarrerTic(); else arreterTic();
      }).observe(el);
    })();
  });
})();
