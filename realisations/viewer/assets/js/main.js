
(() => {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const mqReduit = matchMedia('(prefers-reduced-motion: reduce)');
  const mqSurvol = matchMedia('(hover: hover) and (pointer: fine)');
  const reduit = () => mqReduit.matches;
  const nf = new Intl.NumberFormat('fr-FR');


  const titres = $$('[data-fit]');
  titres.forEach((t) => $$('.ligne > span', t).forEach((s, i) => s.style.setProperty('--i', i)));

  function ajusterTitres() {
    titres.forEach((t) => {
      if (innerWidth < 900) { t.style.removeProperty('--fit'); return; }
      const spans = $$('.ligne > span', t);
      t.style.setProperty('--fit', '100px');
      const plusLarge = Math.max(...spans.map((s) => s.getBoundingClientRect().width));
      const dispo = t.clientWidth;
      if (!plusLarge || !dispo) return;
      let taille = (100 * dispo) / plusLarge;
      const zone = t.closest('[data-surface]');
      if (zone) {
        const cs = getComputedStyle(zone);
        const pied = $('.heros-pied', zone);
        const reserve = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom)
          + parseFloat(getComputedStyle(t).paddingBottom) + (pied ? pied.offsetHeight : 0) + 16;
        const parHauteur = (innerHeight - reserve) / (spans.length * 0.84 + 0.09);
        taille = Math.min(taille, Math.max(parHauteur, 56));
      }
      t.style.setProperty('--fit', `${Math.floor(Math.max(40, taille) * 0.995)}px`);
    });
  }

  const policesPretes = Promise.race([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    new Promise((r) => setTimeout(r, 1100)),
  ]);


  const heros = $('[data-heros]');
  const surface = $('[data-surface]');
  const envers = $('[data-envers]');
  const bascule = $('[data-envers-bascule]');
  const titreHeros = $('#titre-heros');
  let ouvert = false;
  let finBalayage = 0;

  function relatif(el) {
    const h = heros.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: r.left - h.left, y: r.top - h.top, w: r.width, h: r.height };
  }

  const classesEtat = ['pret', 'actif', 'scanne', 'attente'];
  function nomElement(el) {
    const classe = [...el.classList].find((c) => !classesEtat.includes(c));
    return el.tagName.toLowerCase() + (classe ? `.${classe}` : '');
  }

  function annot(parent, box, texte, mod = '') {
    const d = document.createElement('div');
    d.className = `annot ${mod}`.trim();
    d.style.cssText = `left:${box.x}px;top:${box.y}px;width:${box.w}px;height:${box.h}px`;
    if (texte) {
      const e = document.createElement('span');
      e.className = 'annot-etiquette';
      e.innerHTML = texte;
      d.append(e);
    }
    parent.append(d);
    return d;
  }

  const dim = (b) => `${Math.round(b.w)} × ${Math.round(b.h)}`;

  function construireEnvers() {
    if (!heros || !envers) return;
    const clone = surface.cloneNode(true);
    clone.removeAttribute('data-surface');
    $$('[id]', clone).forEach((n) => n.removeAttribute('id'));
    $$('[data-fit]', clone).forEach((n) => n.removeAttribute('data-fit'));
    $$('a, button', clone).forEach((n) => n.setAttribute('tabindex', '-1'));
    clone.setAttribute('inert', '');
    const calque = document.createElement('div');
    envers.replaceChildren(clone, calque);

    const etroit = innerWidth < 600;
    const largeurHeros = heros.clientWidth;
    const h1 = relatif(titreHeros);
    annot(calque, h1, `<b>h1</b>.titre-geant · ${dim(h1)}`, etroit ? 'annot-fond' : 'annot-droite');
    const marge = parseFloat(getComputedStyle(titreHeros).marginBottom) || 0;
    if (marge > 24) {
      annot(calque, { x: h1.x, y: h1.y + h1.h, w: h1.w, h: marge }, `margin-bottom · auto (${Math.round(marge)})`, 'annot-marge annot-interne');
    }
    if (innerWidth >= 900) {
      $$('.ligne', titreHeros).forEach((l) => annot(calque, relatif(l.firstElementChild), '', 'annot-ligne'));
    }
    const accroche = $('.accroche', surface);
    if (accroche) { const b = relatif(accroche); annot(calque, b, etroit ? '' : `<b>p</b>.accroche · ${dim(b)}`); }
    const fiche = $('.heros-fiche', surface);
    if (fiche && !etroit) { const b = relatif(fiche); annot(calque, b, `<b>div</b>.heros-fiche · ${dim(b)}`); }
    $$('.actions .bouton', surface).forEach((btn, i) => {
      if (etroit && i > 0) return;
      const b = relatif(btn);
      const cs = getComputedStyle(btn);
      const pl = parseFloat(cs.paddingLeft) || 0;
      const pr = parseFloat(cs.paddingRight) || 0;
      annot(calque, b, '', 'annot-padding');
      annot(calque, { x: b.x + pl, y: b.y + 4, w: b.w - pl - pr, h: b.h - 8 }, '', '');
      const cible = Math.min(b.w, b.h) >= 44 ? ' ✓' : '';
      const cote = b.x + 170 > largeurHeros ? 'annot-droite' : '';
      const e = annot(calque, b, `<b>${btn.tagName.toLowerCase()}</b> · ${dim(b)}${cible}`, `annot-ok annot-bas ${cote}`);
      e.style.background = 'none';
      e.style.border = '0';
    });
  }

  function basculerEnvers(forcer) {
    const ouvrir = typeof forcer === 'boolean' ? forcer : !ouvert;
    if (ouvrir === ouvert || !heros) return;
    ouvert = ouvrir;
    bascule.setAttribute('aria-pressed', String(ouvrir));
    const libelle = ouvrir ? 'Revenir à l’affichage normal' : 'Voir comment cette page est construite';
    $$('[data-libelle]', heros).forEach((n) => { n.textContent = libelle; });
    construireEnvers();
    heros.toggleAttribute('data-envers-ouvert', ouvrir);
    if (!reduit()) {
      heros.setAttribute('data-scan', '');
      clearTimeout(finBalayage);
      finBalayage = setTimeout(() => heros.removeAttribute('data-scan'), 950);
    }
    majBarre();
  }


  const barre = $('[data-barre]');
  const champs = $$('main [data-champ], footer');
  function majBarre() {
    const y = 32;
    let champ = 'bleu';
    for (const s of champs) {
      const r = s.getBoundingClientRect();
      if (r.top <= y && r.bottom > y) {
        champ = s.dataset.champ || (s.classList.contains('champ-graphite') ? 'graphite' : 'rendu');
        break;
      }
    }
    if (ouvert && champ === 'bleu' && scrollY < (heros ? heros.offsetHeight - y : 0)) champ = 'graphite';
    barre.dataset.champ = champ;
    barre.toggleAttribute('data-colle', scrollY > 8);
  }


  const cadre = $('[data-cadre-inspection]');
  let cible = null;
  function placerCadre() {
    if (!cible) return;
    const r = cible.getBoundingClientRect();
    cadre.style.transform = `translate3d(${r.left}px, ${r.top}px, 0)`;
    cadre.style.width = `${r.width}px`;
    cadre.style.height = `${r.height}px`;
    const nom = cible.dataset.nom || nomElement(cible);
    cadre.firstElementChild.textContent = `${nom} · ${nf.format(Math.round(r.width))} × ${nf.format(Math.round(r.height))}`;
    cadre.toggleAttribute('data-dessous', r.top < 96);
    cadre.toggleAttribute('data-sombre', !!cible.closest('.champ-graphite, .champ-bleu'));
  }
  function brancherInspection() {
    $$('main [data-inspecter]').forEach((el) => {
      el.addEventListener('pointerenter', (e) => {
        if (!mqSurvol.matches || e.pointerType !== 'mouse') return;
        cible = el;
        placerCadre();
        cadre.setAttribute('data-actif', '');
      });
      el.addEventListener('pointerleave', () => {
        cible = null;
        cadre.removeAttribute('data-actif');
      });
    });
  }

  function observerUneFois(elements, rappel, options) {
    if (!('IntersectionObserver' in window)) { elements.forEach(rappel); return; }
    const io = new IntersectionObserver((entrees) => {
      entrees.forEach((en) => { if (en.isIntersecting) { rappel(en.target); io.unobserve(en.target); } });
    }, options);
    elements.forEach((el) => io.observe(el));
  }


  function brancherHistoire() {
    const etapes = $$('.etape');
    const ecrans = $$('[data-ecran]');
    const compteur = $('[data-compteur]');
    if (!etapes.length) return;
    const activer = (etape) => {
      etapes.forEach((e) => e.classList.toggle('actif', e === etape));
      ecrans.forEach((img) => img.classList.toggle('actif', img.dataset.ecran === etape.dataset.etape));
      if (compteur) compteur.textContent = `${etapes.indexOf(etape) + 1} / ${etapes.length}`;
    };
    activer(etapes[0]);
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entrees) => {
      entrees.forEach((en) => { if (en.isIntersecting) activer(en.target); });
    }, { rootMargin: '-46% 0px -46% 0px' });
    etapes.forEach((e) => io.observe(e));
  }


  const fenetre = $('[data-fenetre]');
  const iframe = $('[data-cadre]');
  let largeur = 402;
  function appliquerLargeur() {
    if (!fenetre || !iframe) return;
    const s = fenetre.clientWidth / largeur;
    iframe.style.width = `${largeur}px`;
    iframe.style.height = `${Math.ceil(fenetre.clientHeight / s)}px`;
    iframe.style.setProperty('--s', s.toFixed(4));
  }
  function brancherTailles() {
    const choix = $$('.regle-choix');
    const lecture = $('[data-lecture]');
    const affichee = $('[data-largeur-affichee]');
    const curseur = $('[data-regle-curseur]');
    choix.forEach((btn) => btn.addEventListener('click', () => {
      if (iframe && iframe.loading === 'lazy') iframe.loading = 'eager';
      largeur = Number(btn.dataset.largeur);
      choix.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      const nom = btn.querySelector('span').textContent;
      if (largeur === 402) {
        lecture.innerHTML = `<strong>${nom}</strong>&nbsp;: la page s’affiche à la largeur de l’iPhone, 402&nbsp;points.`;
        affichee.innerHTML = '402&nbsp;pt';
      } else {
        const pct = Math.round((402 / largeur) * 100);
        lecture.innerHTML = `<strong>${nom} · ${nf.format(largeur)}&nbsp;px</strong>&nbsp;: le site est affiché à cette largeur, puis réduit pour tenir sur l’écran de votre iPhone.`;
        affichee.innerHTML = `${nf.format(largeur)}&nbsp;px`;
      }
      curseur.style.setProperty('--x', (largeur / 1920).toFixed(4));
      if (reduit()) { appliquerLargeur(); return; }
      fenetre.setAttribute('data-change', '');
      setTimeout(() => { appliquerLargeur(); fenetre.removeAttribute('data-change'); }, 180);
    }));
    if (iframe) iframe.addEventListener('load', appliquerLargeur);
    appliquerLargeur();
  }


  function brancherAudit() {
    const rapport = $('[data-rapport]');
    const bloc = $('[data-score-bloc]');
    if (!rapport || !bloc || reduit()) return;
    const items = $$('li[data-s]', rapport);
    const valeur = $('[data-score]', bloc);
    const arc = $('[data-score-arc]', bloc);
    const cibleScore = Number(valeur.dataset.cible) || 0;
    rapport.classList.add('attente');
    valeur.textContent = '0';
    arc.style.setProperty('--p', '0');
    observerUneFois([rapport], () => {
      items.forEach((li, i) => setTimeout(() => li.classList.add('scanne'), 140 + i * 95));
      setTimeout(() => rapport.classList.remove('attente'), 260 + items.length * 95);
    }, { threshold: 0.2 });
    observerUneFois([bloc], () => {
      arc.style.setProperty('--p', String(cibleScore));
      const debut = performance.now();
      const duree = 1400;
      const pas = () => {
        const k = Math.min(1, (performance.now() - debut) / duree);
        valeur.textContent = String(Math.round(cibleScore * (1 - (1 - k) ** 3)));
        if (k < 1) setTimeout(pas, 30);
      };
      pas();
    }, { threshold: 0.5 });
  }


  function affichesVideos() {
    const videos = $$('video[data-poster]');
    const poser = (v) => { v.poster = v.dataset.poster; delete v.dataset.poster; };
    if (!('IntersectionObserver' in window)) { videos.forEach(poser); return; }
    const io = new IntersectionObserver((entrees) => entrees.forEach((en) => {
      if (en.isIntersecting) { io.unobserve(en.target); poser(en.target); }
    }), { rootMargin: '1500px 0px' });
    videos.forEach((v) => io.observe(v));
  }

  function brancherVideos() {
    const videos = $$('[data-video]');
    if (reduit() || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entrees) => {
      entrees.forEach((en) => {
        const v = en.target;
        if (en.isIntersecting && !v.dataset.pauseVoulue) v.play().catch(() => {});
        else v.pause();
      });
    }, { threshold: 0.55 });
    videos.forEach((v) => {
      const btn = v.parentElement.querySelector('[data-film-bouton]');
      v.controls = false;
      if (btn) {
        btn.hidden = false;
        const maj = () => {
          const enPause = v.paused;
          btn.toggleAttribute('data-en-pause', enPause);
          btn.firstElementChild.textContent = enPause ? 'Lire la vidéo' : 'Mettre la vidéo en pause';
        };
        btn.addEventListener('click', () => {
          if (v.paused) { delete v.dataset.pauseVoulue; v.play().catch(() => {}); }
          else { v.dataset.pauseVoulue = '1'; v.pause(); }
        });
        v.addEventListener('play', maj);
        v.addEventListener('pause', maj);
        maj();
      }
      io.observe(v);
    });
  }


  let largeurPrecedente = innerWidth;
  let hauteurPrecedente = innerHeight;
  let redim = 0;
  function surRedimension() {
    clearTimeout(redim);
    redim = setTimeout(() => {
      const largeurChange = innerWidth !== largeurPrecedente;
      const hauteurChange = Math.abs(innerHeight - hauteurPrecedente) > 140;
      if (largeurChange || hauteurChange) {
        largeurPrecedente = innerWidth;
        hauteurPrecedente = innerHeight;
        ajusterTitres();
        if (ouvert) construireEnvers();
      }
      appliquerLargeur();
      majBarre();
    }, 150);
  }

  addEventListener('scroll', () => { majBarre(); placerCadre(); }, { passive: true });
  addEventListener('resize', surRedimension);

  majBarre();
  brancherInspection();
  brancherHistoire();
  brancherTailles();
  brancherAudit();
  affichesVideos();
  brancherVideos();

  const frappe = $('[data-frappe]');
  if (frappe) {
    $$('span', frappe).forEach((s, i) => s.style.setProperty('--i', i));
    observerUneFois([frappe], (el) => el.classList.add('vu'), { threshold: 0.8 });
  }
  observerUneFois(titres.filter((t) => !t.closest('[data-heros]')), (el) => el.classList.add('pret'), { threshold: 0.35 });

  if (heros && bascule) bascule.addEventListener('click', () => basculerEnvers());

  const revoir = $('[data-revoir-envers]');
  if (revoir) {
    revoir.addEventListener('click', () => {
      const debut = performance.now();
      const attendre = () => {
        if (scrollY < 4 || performance.now() - debut > 1800) basculerEnvers(true);
        else setTimeout(attendre, 60);
      };
      setTimeout(attendre, 60);
    });
  }

  ajusterTitres();
  policesPretes.then(() => {
    ajusterTitres();
    if (titreHeros) titreHeros.classList.add('pret');
  });
})();
