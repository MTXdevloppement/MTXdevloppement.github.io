(() => {
  'use strict';
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [ ...r.querySelectorAll(s) ];
  const nombre = new Intl.NumberFormat('fr-FR');
  const deuxDec = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const attendre = ms => new Promise((ok => setTimeout(ok, ms)));
  const borne = (v, a, b) => Math.min(Math.max(v, a), b);
  const fmt = {
    km: m => deuxDec.format(m / 1e3),
    distance: m => m < 1e3 ? `${Math.round(m)} m` : `${deuxDec.format(m / 1e3)} km`,
    duree(t) {
      const s = Math.max(0, Math.floor(t));
      const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
      return h ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`;
    },
    allure(a) {
      if (!isFinite(a) || a <= 0) return '--:--';
      const s = Math.round(a);
      return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    },
    ecart(t) {
      const s = Math.round(Math.abs(t));
      return `${t < 0 ? '−' : '+'}${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    }
  };
  const apparition = new IntersectionObserver((entrees => {
    for (const e of entrees) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('is-in');
      e.target.dispatchEvent(new Event('apparu'));
      apparition.unobserve(e.target);
    }
  }), {
    rootMargin: '0px 0px -8% 0px',
    threshold: .12
  });
  $$('[data-reveal]').forEach((el => apparition.observe(el)));
  const portee = new IntersectionObserver((entrees => {
    for (const e of entrees) {
      e.target.classList.toggle('is-paused', !e.isIntersecting);
      e.target.dispatchEvent(new Event(e.isIntersecting ? 'portee:entree' : 'portee:sortie'));
    }
  }), {
    rootMargin: '80px 0px'
  });
  $$('[data-scope]').forEach((el => portee.observe(el)));
  function compter(el, vers, duree = 1200) {
    const format = v => nombre.format(Math.round(v));
    if (reduit) {
      el.textContent = format(vers);
      return;
    }
    const t0 = performance.now();
    const pas = t => {
      const k = Math.min((t - t0) / duree, 1);
      el.textContent = format(vers * (1 - (1 - k) ** 3));
      if (k < 1) requestAnimationFrame(pas);
    };
    requestAnimationFrame(pas);
  }
  $$('.chiffres [data-compte]').forEach((el => {
    const bloc = el.closest('[data-reveal]');
    const vers = Number(el.dataset.compte);
    el.textContent = '0';
    bloc.addEventListener('apparu', (() => compter(el, vers, 900)), {
      once: true
    });
  }));
  $$('[data-clone]').forEach((cible => {
    const source = $(cible.dataset.clone);
    if (!source) return;
    const copie = source.cloneNode(true);
    copie.removeAttribute('id');
    $$('[id]', copie).forEach((n => n.removeAttribute('id')));
    copie.setAttribute('inert', '');
    cible.replaceChildren(copie);
    cible.closest('.iphone')?.classList.add('is-ready');
  }));
  const DIST_PARCOURS = 10340;
  const routeParc = $('#r-parc');
  const L_PARC = routeParc ? routeParc.getTotalLength() : 0;
  const SPLITS_RECORD = [ 334, 321, 315, 311, 325, 318, 307, 312, 302, 292, 127 / .34 ];
  const VARIATIONS = [ 7, 2, -1, -2, 5, 1, -3, 2, -3, -6, -4 ];
  const tronconKm = k => Math.min(1e3, DIST_PARCOURS - k * 1e3);
  function cumuls(allures) {
    const t = [ 0 ];
    allures.forEach(((a, k) => t.push(t[k] + a * tronconKm(k) / 1e3)));
    return t;
  }
  function profilCoureur(allure) {
    const moyenne = VARIATIONS.reduce(((s, v, k) => s + v * tronconKm(k)), 0) / DIST_PARCOURS;
    return cumuls(VARIATIONS.map((v => allure + v - moyenne)));
  }
  function tempsA(t, d) {
    const k = borne(Math.floor(d / 1e3), 0, t.length - 2);
    return t[k] + (t[k + 1] - t[k]) * (d - k * 1e3) / tronconKm(k);
  }
  function distanceA(t, s) {
    if (s <= 0) return 0;
    if (s >= t[t.length - 1]) return DIST_PARCOURS;
    let k = 0;
    while (t[k + 1] < s) k++;
    return k * 1e3 + tronconKm(k) * (s - t[k]) / (t[k + 1] - t[k]);
  }
  const RECORD = cumuls(SPLITS_RECORD);
  const fraction = d => (borne(d, 0, DIST_PARCOURS) / DIST_PARCOURS).toFixed(4);
  function placerSurParc(el, d) {
    if (!L_PARC) return;
    const p = routeParc.getPointAtLength(borne(d, 0, DIST_PARCOURS) / DIST_PARCOURS * L_PARC);
    el.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
  }
  const champsLive = {};
  $$('[data-live]').forEach((el => (champsLive[el.dataset.live] ||= []).push(el)));
  const barresLive = $$('[data-live-prog]');
  const traceMontre = $('.w-fait');
  const moiMontre = $('#w-moi');
  const depart = {
    t: 2041,
    d: 6420,
    pas: 5727,
    deniv: 46,
    kcal: 412,
    phase: 0
  };
  let course, dernierKm, debutKm, splitPrec, ecartSplit;
  function repartir() {
    course = {
      ...depart
    };
    dernierKm = Math.floor(depart.d / 1e3);
    debutKm = {
      t: depart.t - (depart.d - dernierKm * 1e3) / 1e3 * 305,
      d: dernierKm * 1e3
    };
    splitPrec = 312;
    ecartSplit = -6;
  }
  repartir();
  function ecrire(cle, texte) {
    const els = champsLive[cle];
    if (!els) return;
    for (const el of els) if (el.textContent !== texte) el.textContent = texte;
  }
  function afficherCourse() {
    const c = course;
    const moy = c.t / (c.d / 1e3);
    const ecart = c.t - tempsA(RECORD, c.d);
    ecrire('distance', fmt.km(c.d));
    ecrire('temps', fmt.duree(c.t));
    ecrire('moy', fmt.allure(moy));
    ecrire('allure', fmt.allure(c.allure ?? 305));
    ecrire('cadence', String(Math.round(c.cadence ?? 174)));
    ecrire('fc', String(Math.round(c.fc ?? 156)));
    ecrire('pas', nombre.format(Math.round(c.pas)));
    ecrire('deniv', String(Math.round(c.deniv)));
    ecrire('kcal', String(Math.round(c.kcal)));
    ecrire('reste', fmt.distance(Math.max(0, DIST_PARCOURS - c.d)));
    ecrire('km', String(dernierKm));
    ecrire('split', fmt.allure(splitPrec));
    const texteSplit = fmt.ecart(ecartSplit);
    for (const el of champsLive.splitEcart || []) {
      if (el.textContent !== texteSplit) el.textContent = texteSplit;
      el.classList.toggle('avance', ecartSplit <= 0);
      el.classList.toggle('retard', ecartSplit > 0);
    }
    const texteEcart = `${fmt.ecart(ecart)} vs record`;
    for (const el of champsLive.ecart || []) {
      if (el.textContent !== texteEcart) el.textContent = texteEcart;
      el.classList.toggle('avance', ecart <= 0);
      el.classList.toggle('retard', ecart > 0);
    }
    const p = (c.d / DIST_PARCOURS).toFixed(3);
    for (const b of barresLive) b.style.setProperty('--p', p);
    traceMontre?.style.setProperty('--reste', (1 - c.d / DIST_PARCOURS).toFixed(4));
    if (moiMontre) placerSurParc(moiMontre, c.d);
  }
  function tic() {
    const c = course;
    c.phase += 1;
    c.allure = 304 + 7 * Math.sin(c.phase / 9) + (Math.random() - .5) * 4;
    c.cadence = 173 + 2.5 * Math.sin(c.phase / 7) + (Math.random() - .5) * 2;
    c.fc = 156 + 3 * Math.sin(c.phase / 13) + (Math.random() - .5) * 1.5;
    c.d += 1e3 / c.allure;
    c.t += 1;
    c.pas += c.cadence / 60;
    c.kcal += .22;
    if (c.phase % 23 === 0) c.deniv += 1;
    const km = Math.floor(c.d / 1e3);
    if (km > dernierKm) {
      const split = (c.t - debutKm.t) / ((c.d - debutKm.d) / 1e3);
      ecartSplit = split - splitPrec;
      splitPrec = split;
      debutKm = {
        t: c.t,
        d: c.d
      };
      dernierKm = km;
    }
    if (c.d >= 10150) repartir();
    afficherCourse();
  }
  const scopesLive = new Set;
  let minuterieLive = 0;
  function majMinuterieLive() {
    const doit = !reduit && scopesLive.size > 0 && document.visibilityState === 'visible';
    if (doit && !minuterieLive) minuterieLive = setInterval(tic, 1e3);
    if (!doit && minuterieLive) {
      clearInterval(minuterieLive);
      minuterieLive = 0;
    }
  }
  const obsLive = new IntersectionObserver((entrees => {
    for (const e of entrees) e.isIntersecting ? scopesLive.add(e.target) : scopesLive.delete(e.target);
    majMinuterieLive();
  }), {
    rootMargin: '60px 0px'
  });
  [ $('.hero-stage'), $('#story-ui'), $('#montre') ].forEach((el => el && obsLive.observe(el)));
  document.addEventListener('visibilitychange', majMinuterieLive);
  afficherCourse();
  function initDuel() {
    const carte = $('#duel');
    if (!carte || !L_PARC) return;
    const section = carte.closest('section');
    const trace = $('#duel-trace');
    const ecartTrace = $('#duel-gap');
    const vous = $('#duel-vous');
    const fantome = $('#duel-fantome');
    const champDist = $('#duel-dist');
    const champEcart = $('#duel-ecart');
    const champTemps = $('#duel-temps');
    const fin = $('#duel-fin');
    const finTexte = $('span', fin);
    const finIcone = $('use', fin);
    const boutons = $$('.allures button');
    const liste = $('#parc-list');
    const listeInitiale = liste.innerHTML;
    const nbPassages = $('#parc-nb');
    const record = $('#parc-record');
    const DUREE_RECORD = RECORD[RECORD.length - 1];
    const ECHELLE = DUREE_RECORD / 13;
    let allure = 305;
    let coureur = profilCoureur(allure);
    let t0 = null;
    let rafId = 0;
    let termine = false;
    let relance = 0;
    function dessiner(dv, dg) {
      placerSurParc(vous, dv);
      placerSurParc(fantome, dg);
      trace.style.strokeDasharray = `${fraction(dv)} 2`;
      ecartTrace.style.strokeDasharray = `${fraction(Math.abs(dv - dg))} 2`;
      ecartTrace.style.strokeDashoffset = `-${fraction(Math.min(dv, dg))}`;
      ecartTrace.classList.toggle('retard', dv < dg);
    }
    function afficher(dv, s) {
      const ecart = tempsA(coureur, dv) - tempsA(RECORD, dv);
      champDist.textContent = `${fmt.km(dv)} km`;
      champTemps.textContent = fmt.duree(Math.min(s, coureur[coureur.length - 1]));
      champEcart.textContent = Math.abs(ecart) < .5 ? '0:00' : fmt.ecart(ecart);
      champEcart.className = ecart < -.5 ? 'avance' : ecart > .5 ? 'retard' : '';
      ecartTrace.classList.toggle('neutre', Math.abs(ecart) < 1);
    }
    function reinitialiser() {
      t0 = null;
      termine = false;
      fin.classList.remove('is-on', 'lent');
      liste.innerHTML = listeInitiale;
      nbPassages.textContent = '3';
      record.textContent = fmt.duree(DUREE_RECORD);
    }
    function arrivee() {
      termine = true;
      const total = coureur[coureur.length - 1];
      const ecart = total - DUREE_RECORD;
      const nouveau = ecart < 0;
      finTexte.textContent = nouveau ? `Nouveau record ! ${fmt.duree(total)}` : `${fmt.duree(total)} · ${fmt.ecart(ecart)} vs record`;
      finIcone.setAttribute('href', nouveau ? '#i-trophee' : '#i-drapeau');
      fin.classList.toggle('lent', !nouveau);
      fin.classList.add('is-on');
      const lignes = [ ...liste.children ];
      const rang = lignes.filter((li => Number(li.dataset.t) < total)).length;
      const li = document.createElement('li');
      li.className = 'nouveau';
      li.dataset.t = String(Math.round(total));
      li.innerHTML = `<span class="rang">${rang === 0 ? '<svg><use href="#i-trophee"/></svg>' : rang + 1}</span><span class="p-tx"><b>Aujourd’hui</b><small>${fmt.allure(allure)} /km · simulation</small></span><span class="p-t"><b>${fmt.duree(total)}</b><em class="${nouveau ? '' : 'retard'}">${nouveau ? 'Record' : fmt.ecart(ecart)}</em></span>`;
      liste.insertBefore(li, lignes[rang] ?? null);
      const meilleur = Math.min(DUREE_RECORD, total);
      [ ...liste.children ].forEach(((ligne, i) => {
        const r = $('.rang', ligne);
        r.innerHTML = i === 0 ? '<svg><use href="#i-trophee"/></svg>' : String(i + 1);
        const em = $('.p-t em', ligne);
        const t = Number(ligne.dataset.t);
        if (i === 0) {
          em.textContent = 'Record';
          em.className = '';
        } else {
          em.textContent = fmt.ecart(t - meilleur);
          em.className = 'retard';
        }
      }));
      while (liste.children.length > 4) liste.lastElementChild.remove();
      nbPassages.textContent = '4';
      record.textContent = fmt.duree(meilleur);
      relance = setTimeout((() => {
        reinitialiser();
      }), 4200);
    }
    function image(t) {
      if (t0 === null) t0 = t;
      const s = (t - t0) / 1e3 * ECHELLE;
      const dv = distanceA(coureur, s);
      const dg = distanceA(RECORD, s);
      dessiner(dv, dg);
      if (!termine) {
        afficher(dv, s);
        if (dv >= DIST_PARCOURS) arrivee();
      } else if (dg >= DIST_PARCOURS) {
        ecartTrace.classList.add('neutre');
      }
      rafId = requestAnimationFrame(image);
    }
    function figer() {
      const s = tempsA(coureur, 6600);
      dessiner(6600, distanceA(RECORD, s));
      afficher(6600, s);
    }
    boutons.forEach((b => b.addEventListener('click', (() => {
      allure = Number(b.dataset.allure);
      coureur = profilCoureur(allure);
      boutons.forEach((x => x.setAttribute('aria-pressed', String(x === b))));
      clearTimeout(relance);
      reinitialiser();
      if (reduit) figer();
    }))));
    if (reduit) {
      figer();
      return;
    }
    section.addEventListener('portee:entree', (() => {
      if (!rafId) {
        t0 = null;
        rafId = requestAnimationFrame(image);
      }
    }));
    section.addEventListener('portee:sortie', (() => {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }));
  }
  function initPlanificateur() {
    const svg = $('#pl-svg');
    if (!svg) return;
    const section = svg.closest('section');
    const route = $('#pl-route');
    const ombre = $('#pl-route-ombre');
    const groupe = $('#pl-etapes');
    const fantome = $('#pl-fantome');
    const astuce = $('#pl-astuce');
    const champDist = $('#pl-dist');
    const champDuree = $('#pl-duree');
    const champNb = $('#pl-nb');
    const curseur = $('#pl-allure');
    const champAllure = $('#pl-allure-txt');
    const rues = $('#pl-rues');
    const enregistrer = $('#pl-save');
    const message = $('#pl-ok');
    const outils = Object.fromEntries($$('[data-outil]').map((b => [ b.dataset.outil, b ])));
    const NS = 'http://www.w3.org/2000/svg';
    const METRES_PAR_PX = 6;
    const PAS_RUES = 60;
    let etapes = [];
    let troncons = [];
    let touche = false;
    const accrocher = p => rues.checked ? {
      x: borne(Math.round(p.x / PAS_RUES) * PAS_RUES, 60, 540),
      y: borne(Math.round(p.y / PAS_RUES) * PAS_RUES, 60, 360)
    } : {
      x: borne(p.x, 12, 588),
      y: borne(p.y, 12, 368)
    };
    function versSvg(e) {
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      return pt.matrixTransform(svg.getScreenCTM().inverse());
    }
    function troncon(a, b) {
      if (!rues.checked || a.x === b.x || a.y === b.y) return [ b ];
      return [ {
        x: b.x,
        y: a.y
      }, b ];
    }
    function points() {
      if (!etapes.length) return [];
      return [ etapes[0], ...troncons.flat() ];
    }
    function rendre() {
      const pts = points();
      const d = pts.map(((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`)).join('');
      route.setAttribute('d', d);
      ombre.setAttribute('d', d);
      let px = 0;
      for (let i = 1; i < pts.length; i++) px += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
      const metres = px * METRES_PAR_PX;
      champDist.textContent = fmt.km(metres);
      champDuree.textContent = fmt.duree(metres / 1e3 * Number(curseur.value));
      champNb.textContent = String(etapes.length);
      outils.annuler.disabled = !etapes.length;
      outils.effacer.disabled = !etapes.length;
      outils.boucler.disabled = etapes.length < 2;
      outils.aller.disabled = etapes.length < 2;
      enregistrer.disabled = etapes.length < 2;
      astuce.classList.toggle('is-off', etapes.length > 0);
    }
    function marqueur(p, i, nouveau) {
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('transform', `translate(${p.x} ${p.y})`);
      const inner = document.createElementNS(NS, 'g');
      if (nouveau) inner.setAttribute('class', 'pl-etape');
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('r', '11');
      c.setAttribute('fill', i === 0 ? '#2ecc71' : '#ff5c1f');
      c.setAttribute('stroke', '#fff');
      c.setAttribute('stroke-width', '2.5');
      const t = document.createElementNS(NS, 'text');
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('dy', '4');
      t.setAttribute('font-size', '11');
      t.setAttribute('font-weight', '800');
      t.setAttribute('fill', '#fff');
      t.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, sans-serif');
      t.textContent = i === 0 ? 'D' : String(i);
      inner.append(c, t);
      g.append(inner);
      return g;
    }
    function redessinerMarqueurs(dernierNouveau) {
      if (!etapes.length) {
        groupe.replaceChildren();
        return;
      }
      const d = etapes[0];
      const autres = [];
      etapes.forEach(((p, i) => {
        if (i === 0 || p.x === d.x && p.y === d.y) return;
        autres.push(marqueur(p, i, dernierNouveau && i === etapes.length - 1));
      }));
      groupe.replaceChildren(...autres, marqueur(d, 0, dernierNouveau && etapes.length === 1));
    }
    function ajouter(p) {
      const q = accrocher(p);
      const prec = etapes[etapes.length - 1];
      if (prec && prec.x === q.x && prec.y === q.y) return;
      if (prec) troncons.push(troncon(prec, q));
      etapes.push(q);
      message.textContent = '';
      redessinerMarqueurs(true);
      rendre();
    }
    function recalculer() {
      troncons = etapes.slice(1).map(((p, i) => troncon(etapes[i], p)));
      rendre();
    }
    svg.addEventListener('click', (e => {
      touche = true;
      ajouter(versSvg(e));
    }));
    let rafFantome = 0;
    let dernierePos = null;
    svg.addEventListener('pointermove', (e => {
      dernierePos = e;
      if (rafFantome) return;
      rafFantome = requestAnimationFrame((() => {
        rafFantome = 0;
        const q = accrocher(versSvg(dernierePos));
        fantome.setAttribute('cx', q.x);
        fantome.setAttribute('cy', q.y);
      }));
    }));
    outils.annuler.addEventListener('click', (() => {
      etapes.pop();
      troncons.pop();
      redessinerMarqueurs(false);
      rendre();
    }));
    outils.effacer.addEventListener('click', (() => {
      etapes = [];
      troncons = [];
      message.textContent = '';
      redessinerMarqueurs(false);
      rendre();
    }));
    outils.boucler.addEventListener('click', (() => {
      if (etapes.length > 1) ajouter(etapes[0]);
    }));
    outils.aller.addEventListener('click', (() => {
      if (etapes.length < 2) return;
      const retour = etapes.slice(0, -1).reverse();
      for (const p of retour) {
        troncons.push(troncon(etapes[etapes.length - 1], p));
        etapes.push(p);
      }
      redessinerMarqueurs(true);
      rendre();
    }));
    rues.addEventListener('change', (() => {
      etapes = etapes.map(accrocher);
      redessinerMarqueurs(false);
      recalculer();
    }));
    const majCurseur = () => {
      const v = Number(curseur.value);
      champAllure.textContent = `${fmt.allure(v)} /km`;
      curseur.style.setProperty('--r', `${(v - curseur.min) / (curseur.max - curseur.min) * 100}%`);
      rendre();
    };
    curseur.addEventListener('input', majCurseur);
    enregistrer.addEventListener('click', (() => {
      message.textContent = `« Parcours ${champDist.textContent} km » ajouté à vos favoris ✓`;
      enregistrer.disabled = true;
    }));
    majCurseur();
    let demoFaite = false;
    section.addEventListener('portee:entree', (async () => {
      if (demoFaite || touche) return;
      demoFaite = true;
      const demo = [ {
        x: 120,
        y: 300
      }, {
        x: 120,
        y: 120
      }, {
        x: 360,
        y: 120
      }, {
        x: 420,
        y: 240
      } ];
      for (const p of demo) {
        if (touche) return;
        await attendre(reduit ? 0 : 420);
        if (!touche) ajouter(p);
      }
    }));
  }
  function initPartage() {
    const carte = $('#pt-carte');
    if (!carte) return;
    const scene = carte.parentElement;
    const plan = $('.pt-plan', carte);
    const seule = $('.pt-trace', carte);
    const entete = $('.pt-h', carte);
    const stats = $('.pt-b', carte);
    const flou = $('#fLueur-flou');
    const pointsPlan = $$('.pt-route circle', plan);
    const pointsSeuls = $$('circle', seule);
    const B = {
      x: 130.7,
      y: 106.6,
      w: 363.2,
      h: 274.7
    };
    const VB_SEULE = {
      w: 383.2,
      h: 294.7
    };
    function cadrer() {
      const W = carte.clientWidth;
      const H = carte.clientHeight;
      if (!W || !H) return;
      const k = W / 360;
      const hautTexte = entete.offsetTop + entete.offsetHeight;
      const zone = {
        x: .1 * W,
        y: hautTexte + 10 * k,
        w: .8 * W,
        h: Math.max(60, stats.offsetTop - hautTexte - 20 * k)
      };
      const m = 8 * k;
      const s = Math.max(B.w / Math.max(20, zone.w - 2 * m), B.h / Math.max(20, zone.h - 2 * m));
      const x0 = B.x + B.w / 2 - (zone.x + zone.w / 2) * s;
      const y0 = B.y + B.h / 2 - (zone.y + zone.h / 2) * s;
      plan.setAttribute('viewBox', `${x0.toFixed(1)} ${y0.toFixed(1)} ${(W * s).toFixed(1)} ${(H * s).toFixed(1)}`);
      const u = s * k;
      plan.style.setProperty('--u', u.toFixed(3));
      pointsPlan.forEach((c => c.setAttribute('r', ((c.classList.contains('bl') ? 8 : 6) * u).toFixed(2))));
      const boite = {
        w: Math.max(40, W - 40),
        h: Math.max(40, stats.offsetTop - hautTexte - 20)
      };
      const u2 = k / Math.min(boite.w / VB_SEULE.w, boite.h / VB_SEULE.h);
      seule.style.setProperty('--u', u2.toFixed(3));
      pointsSeuls[0]?.setAttribute('r', (5.5 * u2).toFixed(2));
      pointsSeuls[1]?.setAttribute('r', (6.5 * u2).toFixed(2));
      flou?.setAttribute('stdDeviation', (8 * u2).toFixed(1));
    }
    if ('ResizeObserver' in window) new ResizeObserver(cadrer).observe(carte);
    cadrer();
    $$('[data-style]', $('.pt-choix')).forEach(((b, _, tous) => b.addEventListener('click', (() => {
      tous.forEach((x => x.setAttribute('aria-pressed', String(x === b))));
      carte.dataset.style = b.dataset.style;
      carte.classList.remove('redessine');
      void carte.offsetWidth;
      carte.classList.add('redessine');
    }))));
    $$('[data-format]', $('.pt-choix')).forEach(((b, _, tous) => b.addEventListener('click', (() => {
      tous.forEach((x => x.setAttribute('aria-pressed', String(x === b))));
      carte.dataset.format = b.dataset.format;
    }))));
    if (reduit) return;
    let raf = 0;
    let evt = null;
    scene.addEventListener('pointermove', (e => {
      evt = e;
      if (raf) return;
      raf = requestAnimationFrame((() => {
        raf = 0;
        const r = carte.getBoundingClientRect();
        const x = borne((evt.clientX - r.left) / r.width, 0, 1);
        const y = borne((evt.clientY - r.top) / r.height, 0, 1);
        carte.classList.add('is-tilt');
        carte.style.setProperty('--ry', `${((x - .5) * 14).toFixed(2)}deg`);
        carte.style.setProperty('--rx', `${((.5 - y) * 12).toFixed(2)}deg`);
        carte.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`);
        carte.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`);
      }));
    }));
    scene.addEventListener('pointerleave', (() => {
      cancelAnimationFrame(raf);
      raf = 0;
      carte.classList.remove('is-tilt');
      carte.style.setProperty('--rx', '0deg');
      carte.style.setProperty('--ry', '0deg');
    }));
  }
  function initSante() {
    const ui = $('#sante-ui');
    if (!ui) return;
    const section = ui.closest('section');
    $$('.s-bars i', ui).forEach(((b, i) => b.style.setProperty('--k', i)));
    const nb = $('[data-compte]', ui);
    const vers = Number(nb.dataset.compte);
    let fait = false;
    section.addEventListener('portee:entree', (() => {
      if (fait) return;
      fait = true;
      requestAnimationFrame((() => section.classList.add('is-vu')));
      nb.textContent = '0';
      setTimeout((() => compter(nb, vers, 1600)), 200);
    }));
  }
  function initMontre() {
    const ecran = $('#w-ecran');
    if (!ecran) return;
    const section = ecran.closest('section');
    const points = $$('.w-points button', ecran);
    let page = 0;
    let minuterie = 0;
    let repos = 0;
    const aller = i => {
      page = i;
      ecran.dataset.page = String(i);
      points.forEach(((b, j) => b.setAttribute('aria-pressed', String(j === i))));
    };
    const lancer = () => {
      if (!reduit && !minuterie) minuterie = setInterval((() => aller((page + 1) % 3)), 3400);
    };
    const arreter = () => {
      clearInterval(minuterie);
      minuterie = 0;
    };
    points.forEach(((b, i) => b.addEventListener('click', (() => {
      arreter();
      aller(i);
      clearTimeout(repos);
      repos = setTimeout(lancer, 9e3);
    }))));
    section.addEventListener('portee:entree', lancer);
    section.addEventListener('portee:sortie', (() => {
      arreter();
      clearTimeout(repos);
    }));
  }
  function initBento() {
    const cartes = $$('.b-card');
    if (!cartes.length) return;
    $$('.sp i').forEach(((b, i) => b.style.setProperty('--k', i)));
    {
      for (const carte of cartes) {
        let raf = 0;
        let evt = null;
        carte.addEventListener('pointermove', (e => {
          evt = e;
          if (raf) return;
          raf = requestAnimationFrame((() => {
            raf = 0;
            const r = carte.getBoundingClientRect();
            carte.style.setProperty('--mx', `${evt.clientX - r.left}px`);
            carte.style.setProperty('--my', `${evt.clientY - r.top}px`);
          }));
        }));
      }
    }
    const annonce = $('#annonce');
    const section = annonce?.closest('section');
    const textes = [ '« 5 kilomètres. Temps : 26 minutes 30. »', '« Allure moyenne : 5 minutes 18 par kilomètre. »', '« 12 secondes d’avance sur votre record. »', '« Bravo, objectif atteint ! »' ];
    let i = 0;
    let minuterie = 0;
    const suivante = async () => {
      annonce.classList.add('is-out');
      await attendre(350);
      i = (i + 1) % textes.length;
      annonce.textContent = textes[i];
      annonce.classList.remove('is-out');
    };
    if (annonce && !reduit) {
      section.addEventListener('portee:entree', (() => {
        if (!minuterie) minuterie = setInterval(suivante, 3200);
      }));
      section.addEventListener('portee:sortie', (() => {
        clearInterval(minuterie);
        minuterie = 0;
      }));
    }
    const mini = $('#mini-theme');
    const clairSysteme = matchMedia('(prefers-color-scheme: light)');
    $$('.theme-seg button').forEach(((b, _, tous) => b.addEventListener('click', (() => {
      tous.forEach((x => x.setAttribute('aria-pressed', String(x === b))));
      const t = b.dataset.t;
      mini.dataset.theme = t === 'systeme' ? clairSysteme.matches ? 'clair' : 'sombre' : t;
    }))));
  }
  function initHorsParcours() {
    const scene = $('#hors');
    if (!scene || reduit) return;
    const trace = $('#hors-trace');
    const rouge = $('#hors-rouge');
    const prevu = $('#hors-prevu');
    const moi = $('#hors-moi');
    const ondes = $('#hors-ondes');
    const voix = $('#hors-voix');
    const voixTexte = $('span', voix);
    const L = trace.getTotalLength();
    const SORTIE = 40;
    const RETOUR = 26.7;
    const VITESSE = 80;
    const POSE = 1.5;
    const repere = [];
    for (let s = 0, Lp = prevu.getTotalLength(); s <= Lp; s += 2) {
      const p = prevu.getPointAtLength(s);
      repere.push([ p.x, p.y ]);
    }
    const ecartAuPrevu = (x, y) => repere.reduce(((m, [a, b]) => Math.min(m, Math.hypot(a - x, b - y))), Infinity);
    let t0 = null;
    let raf = 0;
    let hors = false;
    let sAlerte = 0;
    let sRetour = 0;
    function onde(p, ok) {
      ondes.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
      ondes.classList.toggle('ok', ok);
      ondes.classList.remove('on');
      void ondes.getBoundingClientRect();
      ondes.classList.add('on');
    }
    function dire(texte) {
      voixTexte.textContent = texte;
      voix.classList.remove('muet');
    }
    function remettre() {
      hors = false;
      sAlerte = 0;
      sRetour = 0;
      scene.dataset.etat = 'route';
      scene.classList.remove('fin');
      trace.style.strokeDasharray = `0 ${L + 20}`;
      rouge.style.visibility = 'hidden';
      rouge.style.strokeDasharray = `0 ${L + 20}`;
      rouge.style.strokeDashoffset = '0';
      voix.classList.add('muet');
      ondes.classList.remove('on');
      moi.setAttribute('transform', 'translate(0 120)');
    }
    function image(t) {
      if (t0 === null) {
        t0 = t;
        remettre();
      }
      const ecoule = (t - t0) / 1e3;
      const s = Math.min(L, ecoule * VITESSE);
      const p = trace.getPointAtLength(s);
      moi.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
      trace.style.strokeDasharray = `${s.toFixed(1)} ${L + 20}`;
      const ecart = ecartAuPrevu(p.x, p.y);
      const dehors = hors ? ecart > RETOUR : ecart > SORTIE;
      if (dehors !== hors) {
        hors = dehors;
        if (hors) {
          sAlerte = s;
          rouge.style.visibility = '';
          scene.dataset.etat = 'hors';
          onde(p, false);
          dire('« Attention, vous quittez le parcours. »');
        } else {
          sRetour = s;
          scene.dataset.etat = 'retour';
          onde(p, true);
          dire('« De retour sur le parcours. »');
        }
      }
      if (sAlerte) {
        rouge.style.strokeDasharray = `${((hors ? s : sRetour) - sAlerte).toFixed(1)} ${L + 20}`;
        rouge.style.strokeDashoffset = `-${sAlerte.toFixed(1)}`;
      }
      const duree = L / VITESSE;
      if (ecoule > duree + POSE) {
        scene.classList.add('fin');
        voix.classList.add('muet');
      }
      if (ecoule > duree + POSE + .7) t0 = null;
      raf = requestAnimationFrame(image);
    }
    scene.classList.add('anime');
    remettre();
    new IntersectionObserver((([e]) => {
      if (e.isIntersecting && !raf) {
        t0 = null;
        raf = requestAnimationFrame(image);
      }
      if (!e.isIntersecting && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }), {
      rootMargin: '40px 0px'
    }).observe(scene);
  }
  const nav = $('.nav');
  const barreNav = $('.nav-progress');
  const hero = $('.hero');
  const parallaxe = $$('[data-par]');
  const manifeste = $('.manifeste');
  const mots = $$('.manifeste .m');
  const story = $('.story');
  const storyUi = $('#story-ui');
  const etapes = $$('.story-step');
  const progression = $('.story-progress i');
  const mobile = matchMedia('(max-width: 900px)');
  let etapeCourante = -1;
  function majAccueil(vh) {
    const r = hero.getBoundingClientRect();
    if (r.bottom < 0 || reduit) return;
    const p = borne(-r.top / vh, 0, 1);
    parallaxe.forEach((el => {
      const k = Number(el.dataset.par);
      el.style.transform = k ? `translate3d(${k * p * 70}px, ${-p * 30}px, 0)` : `translate3d(0, ${-p * 80}px, 0)`;
    }));
  }
  function majManifeste(vh) {
    const r = manifeste.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    const p = borne((vh * .82 - r.top) / (r.height * .75), 0, 1);
    const n = reduit ? mots.length : Math.round(p * mots.length * 1.05);
    mots.forEach(((m, i) => m.classList.toggle('on', i < n)));
  }
  function majScenario(vh) {
    const r = story.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    const p = borne(-r.top / (r.height - vh), 0, 1);
    progression.style.transform = mobile.matches ? `scaleX(${p})` : `scaleY(${p})`;
    const etape = p < .05 ? 0 : p < .33 ? 1 : p < .68 ? 2 : 3;
    if (etape === etapeCourante) return;
    storyUi.toggleAttribute('data-cd', etape === 2 && etapeCourante >= 0 && etapeCourante < 2);
    etapeCourante = etape;
    storyUi.dataset.step = String(etape);
    story.dataset.step = String(etape);
    etapes.forEach(((e, i) => e.classList.toggle('is-active', i === Math.max(etape - 1, 0))));
  }
  let enAttente = false;
  function surDefilement() {
    if (enAttente) return;
    enAttente = true;
    requestAnimationFrame((() => {
      enAttente = false;
      const vh = innerHeight;
      const max = document.documentElement.scrollHeight - vh;
      nav.classList.toggle('is-scrolled', scrollY > 8);
      barreNav.style.transform = `scaleX(${max > 0 ? (scrollY / max).toFixed(4) : 0})`;
      majAccueil(vh);
      majManifeste(vh);
      majScenario(vh);
    }));
  }
  addEventListener('scroll', surDefilement, {
    passive: true
  });
  addEventListener('resize', surDefilement);
  const liens = new Map($$('.nav-links a').map((a => [ a.getAttribute('href').slice(1), a ])));
  const sectionsVisibles = new Set;
  const obsSections = new IntersectionObserver((entrees => {
    for (const e of entrees) e.isIntersecting ? sectionsVisibles.add(e.target.id) : sectionsVisibles.delete(e.target.id);
    liens.forEach(((a, id) => a.classList.toggle('is-current', sectionsVisibles.has(id))));
  }), {
    rootMargin: '-45% 0px -50% 0px'
  });
  liens.forEach(((_, id) => {
    const s = document.getElementById(id);
    if (s) obsSections.observe(s);
  }));
  if (matchMedia('(hover: none)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    addEventListener('pointerdown', (e => {
      if (e.pointerType !== 'touch' || !e.isPrimary) return;
      e.target.dispatchEvent(new PointerEvent('pointermove', {
        bubbles: true,
        clientX: e.clientX,
        clientY: e.clientY,
        pointerId: e.pointerId,
        pointerType: 'touch',
        isPrimary: true
      }));
    }), {
      passive: true
    });
  }
  initDuel();
  initPlanificateur();
  initPartage();
  initSante();
  initMontre();
  initBento();
  initHorsParcours();
  surDefilement();
  const annee = $('#annee');
  if (annee) annee.textContent = String((new Date).getFullYear());
})();
