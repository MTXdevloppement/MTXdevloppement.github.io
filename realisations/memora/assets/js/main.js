(() => {
  'use strict';
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [ ...r.querySelectorAll(s) ];
  const nombre = new Intl.NumberFormat('fr-FR');
  const decimal = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 1
  });
  const attendre = ms => new Promise((ok => setTimeout(ok, ms)));
  const apparition = new IntersectionObserver((entrees => {
    for (const e of entrees) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('is-in');
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
  const CATEGORIES = {
    cafe: {
      nom: 'Cafés',
      c: '#AC8E68',
      i: 'i-cup'
    },
    resto: {
      nom: 'Restaurants',
      c: '#FF9F0A',
      i: 'i-fork'
    },
    vue: {
      nom: 'Points de vue',
      c: '#0A84FF',
      i: 'i-binoculars'
    },
    nature: {
      nom: 'Nature',
      c: '#30D158',
      i: 'i-leaf'
    },
    culture: {
      nom: 'Culture',
      c: '#BF5AF2',
      i: 'i-columns'
    },
    shop: {
      nom: 'Shopping',
      c: '#FF375F',
      i: 'i-bag'
    },
    sport: {
      nom: 'Sport',
      c: '#40C8E0',
      i: 'i-run'
    },
    plan: {
      nom: 'Bons plans',
      c: '#FFD60A',
      i: 'i-sparkles'
    }
  };
  const PERIODES = {
    7: {
      lib: 'ces 7 derniers jours',
      pass: 23,
      passD: '+12 % vs avant',
      spotsD: '+1 en 7 j',
      unite: 'jour',
      n: 7,
      graine: 3,
      axe: [ 'dim.', 'mar.', 'jeu.', 'sam.' ],
      croises: 6,
      rang: [ [ 'Café Lumière', 'cafe', 6 ], [ 'Boulangerie des Halles', 'plan', 5 ], [ 'Berges du canal', 'nature', 4 ], [ 'Le Petit Zinc', 'resto', 3 ], [ 'Musée des Arts', 'culture', 2 ] ],
      cats: {
        cafe: 8,
        plan: 5,
        nature: 4,
        resto: 3,
        culture: 2,
        vue: 1
      }
    },
    30: {
      lib: 'ces 30 derniers jours',
      pass: 96,
      passD: '+8 % vs avant',
      spotsD: '+3 en 30 j',
      unite: 'jour',
      n: 30,
      graine: 7,
      axe: [ '11 sept.', '21 sept.', '1 oct.', '10 oct.' ],
      croises: 11,
      rang: [ [ 'Café Lumière', 'cafe', 24 ], [ 'Boulangerie des Halles', 'plan', 19 ], [ 'Berges du canal', 'nature', 14 ], [ 'Le Petit Zinc', 'resto', 11 ], [ 'Rooftop 21', 'vue', 8 ] ],
      cats: {
        cafe: 31,
        plan: 22,
        nature: 18,
        resto: 12,
        vue: 7,
        culture: 4,
        shop: 2
      }
    },
    365: {
      lib: 'ces 12 derniers mois',
      pass: 612,
      passD: '+31 % vs avant',
      spotsD: '+9 en 1 an',
      unite: 'semaine',
      n: 52,
      graine: 11,
      axe: [ 'oct. 25', 'janv.', 'mai', 'oct.' ],
      croises: 12,
      rang: [ [ 'Boulangerie des Halles', 'plan', 142 ], [ 'Café Lumière', 'cafe', 131 ], [ 'Berges du canal', 'nature', 88 ], [ 'Le Petit Zinc', 'resto', 71 ], [ 'Jardin secret', 'nature', 52 ] ],
      cats: {
        plan: 158,
        cafe: 149,
        nature: 121,
        resto: 86,
        vue: 44,
        culture: 30,
        shop: 14,
        sport: 10
      }
    },
    tout: {
      lib: 'depuis le début',
      pass: 748,
      passD: '12 spots croisés',
      spotsD: '4 favoris',
      unite: 'mois',
      n: 17,
      graine: 5,
      axe: [ 'juin 25', 'oct. 25', 'févr.', 'oct.' ],
      croises: 12,
      rang: [ [ 'Boulangerie des Halles', 'plan', 168 ], [ 'Café Lumière', 'cafe', 157 ], [ 'Berges du canal', 'nature', 102 ], [ 'Le Petit Zinc', 'resto', 84 ], [ 'Jardin secret', 'nature', 61 ] ],
      cats: {
        plan: 186,
        cafe: 178,
        nature: 146,
        resto: 104,
        vue: 58,
        culture: 41,
        shop: 21,
        sport: 14
      }
    },
    perso: {
      lib: 'du 1 au 30 septembre 2026',
      pass: 88,
      passD: '+5 % vs avant',
      spotsD: '+2 sur la période',
      unite: 'jour',
      n: 30,
      graine: 13,
      axe: [ '1 sept.', '10', '20', '30 sept.' ],
      croises: 10,
      rang: [ [ 'Café Lumière', 'cafe', 21 ], [ 'Boulangerie des Halles', 'plan', 17 ], [ 'Berges du canal', 'nature', 12 ], [ 'Le Petit Zinc', 'resto', 10 ], [ 'Musée des Arts', 'culture', 7 ] ],
      cats: {
        cafe: 27,
        plan: 20,
        nature: 17,
        resto: 12,
        vue: 7,
        culture: 5
      }
    }
  };
  const ORDRE_SEGMENTS = [ '7', '30', '365', 'tout' ];
  function aleatoire(graine) {
    let a = graine * 9301 + 49297;
    return () => {
      a |= 0;
      a = a + 1831565813 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function serie(p) {
    const tirage = aleatoire(p.graine);
    const brut = Array.from({
      length: p.n
    }, ((_, i) => {
      const vague = .45 + .55 * Math.abs(Math.sin(i * .7 + p.graine));
      return Math.max(.06, vague * (.45 + tirage()));
    }));
    const somme = brut.reduce(((a, b) => a + b), 0);
    return brut.map((v => v / somme * p.pass));
  }
  function compter(el, vers, anime) {
    const depart = Number(el.dataset.v ?? (el.textContent.replace(/\D/g, '') || 0));
    el.dataset.v = vers;
    const jeton = el._jeton = {};
    if (!anime || reduit || depart === vers) {
      el.textContent = nombre.format(vers);
      return;
    }
    const t0 = performance.now();
    const pas = t => {
      if (el._jeton !== jeton) return;
      const k = Math.min((t - t0) / 700, 1);
      el.textContent = nombre.format(Math.round(depart + (vers - depart) * (1 - (1 - k) ** 3)));
      if (k < 1) requestAnimationFrame(pas);
    };
    requestAnimationFrame(pas);
  }
  function initStatistiques() {
    const ui = $('#stats-ui');
    if (!ui) return null;
    const section = ui.closest('section');
    const segments = $$('.seg button', ui);
    const curseur = $('.seg-thumb', ui);
    const calendrier = $('.st-cal', ui);
    const libelle = $('.st-lib', ui);
    const champ = k => $(`[data-k="${k}"]`, ui);
    const lignes = $$('.rk', ui);
    const lien = $('[data-sec="classement"] .lien', ui);
    const resumeClassement = $('[data-sec="classement"] .coll-sum', ui);
    const resumeCategories = $('[data-sec="categories"] .coll-sum', ui);
    const barres = $('.bars', ui);
    const graphique = $('.chart', ui);
    const moyenne = $('.bars-avg', ui);
    const axe = $$('.bars-axis span', ui);
    const resumeActivite = $('[data-sec="activite"] .coll-sum', ui);
    const detailActivite = $('[data-sec="activite"] .coll-det', ui);
    const anneau = $$('.seg-d', ui);
    const totalAnneau = $('.donut-total b', ui);
    const legende = $$('.lg', ui);
    const cartes = $$('.coll', ui);
    const plier = $('.st-fold', ui);
    const CIRCONFERENCE = 2 * Math.PI * 46;
    let cle = '30';
    function rendre(nouvelle, anime = true) {
      cle = nouvelle;
      const p = PERIODES[cle];
      const index = ORDRE_SEGMENTS.indexOf(cle);
      ui.classList.toggle('is-perso', cle === 'perso');
      segments.forEach(((b, i) => b.setAttribute('aria-selected', String(i === index))));
      if (index >= 0) curseur.style.transform = `translateX(${index * 100}%)`;
      libelle.textContent = p.lib;
      compter(champ('pass'), p.pass, anime);
      champ('passD').textContent = p.passD;
      champ('spotsD').textContent = p.spotsD;
      const top = Object.entries(p.cats).sort(((a, b) => b[1] - a[1]));
      champ('catsD').textContent = `Top : ${CATEGORIES[top[0][0]].nom}`;
      const max = p.rang[0][2];
      lignes.forEach(((ligne, i) => {
        const [nom, c, n] = p.rang[i];
        const cat = CATEGORIES[c];
        ligne.style.setProperty('--c', cat.c);
        ligne.style.setProperty('--r', (n / max).toFixed(3));
        $('.rk-name', ligne).textContent = nom;
        $('.bub use', ligne).setAttribute('href', `#${cat.i}`);
        compter($('.rk-n', ligne), n, anime);
      }));
      resumeClassement.textContent = `1. ${p.rang[0][0]} · ${nombre.format(p.rang[0][2])} passages`;
      lien.firstChild.textContent = `Voir les ${p.croises} spots croisés`;
      let cumul = 0;
      anneau.forEach(((arc, i) => {
        const part = top[i];
        if (!part) {
          arc.style.strokeDasharray = `0 ${CIRCONFERENCE}`;
          return;
        }
        const longueur = part[1] / p.pass * CIRCONFERENCE;
        arc.style.stroke = CATEGORIES[part[0]].c;
        arc.style.strokeDasharray = `${Math.max(longueur - 2, .01)} ${CIRCONFERENCE}`;
        arc.style.strokeDashoffset = String(-cumul);
        cumul += longueur;
      }));
      compter(totalAnneau, p.pass, anime);
      legende.forEach(((ligne, i) => {
        const [c, n] = top[i];
        const cat = CATEGORIES[c];
        ligne.style.setProperty('--c', cat.c);
        $('.bub use', ligne).setAttribute('href', `#${cat.i}`);
        $('.lg-name', ligne).textContent = cat.nom;
        compter($('.lg-n', ligne), n, anime);
      }));
      resumeCategories.textContent = `${CATEGORIES[top[0][0]].nom} en tête · ${Math.round(top[0][1] / p.pass * 100)} %`;
      const valeurs = serie(p);
      const plusHaut = Math.max(...valeurs);
      if (barres.children.length !== valeurs.length) {
        barres.replaceChildren(...valeurs.map(((_, i) => {
          const b = document.createElement('i');
          b.style.setProperty('--i', i);
          return b;
        })));
        barres.style.setProperty('--gap', valeurs.length > 40 ? '1.5px' : valeurs.length > 20 ? '3px' : '8px');
        void barres.offsetWidth;
      }
      [ ...barres.children ].forEach(((b, i) => b.style.setProperty('--v', (valeurs[i] / plusHaut).toFixed(3))));
      const moy = p.pass / p.n;
      moyenne.style.setProperty('--a', (moy / plusHaut).toFixed(3));
      axe.forEach(((s, i) => {
        s.textContent = p.axe[i];
      }));
      const texteMoyenne = `moy. ${decimal.format(moy)} / ${p.unite}`;
      resumeActivite.textContent = texteMoyenne;
      detailActivite.textContent = texteMoyenne;
    }
    function basculer(carte, ouvrir) {
      const etat = ouvrir ?? carte.dataset.open !== 'true';
      carte.dataset.open = String(etat);
      const unOuvert = cartes.some((c => c.dataset.open === 'true'));
      $('use', plier).setAttribute('href', unOuvert ? '#i-compress' : '#i-expand');
      plier.setAttribute('aria-label', unOuvert ? 'Tout replier' : 'Tout déplier');
    }
    const classement = cartes[0];
    const categories = cartes[1];
    const scenario = [ () => rendre('7'), () => rendre('365'), () => rendre('tout'), () => basculer(classement, false), () => basculer(categories, false), () => rendre('perso'), () => basculer(classement, true), () => basculer(categories, true), () => rendre('30') ];
    let pas = 0;
    let minuterie = null;
    let demo = !reduit;
    const lancer = () => {
      if (demo && !minuterie) minuterie = setInterval((() => scenario[pas++ % scenario.length]()), 2400);
    };
    const suspendre = () => {
      clearInterval(minuterie);
      minuterie = null;
    };
    const arreter = () => {
      demo = false;
      suspendre();
    };
    segments.forEach(((b, i) => b.addEventListener('click', (() => {
      arreter();
      rendre(ORDRE_SEGMENTS[i]);
    }))));
    calendrier.addEventListener('click', (() => {
      arreter();
      rendre(cle === 'perso' ? '30' : 'perso');
    }));
    cartes.forEach((carte => $('.coll-head', carte).addEventListener('click', (() => {
      arreter();
      basculer(carte);
    }))));
    plier.addEventListener('click', (() => {
      arreter();
      const unOuvert = cartes.some((c => c.dataset.open === 'true'));
      cartes.forEach((c => basculer(c, !unOuvert)));
    }));
    const defile = $('.st-scroll', ui);
    const montrer = carte => {
      cartes.forEach((c => basculer(c, c === carte)));
      setTimeout((() => defile.scrollTo({
        top: Math.max(0, carte.offsetTop - 64),
        behavior: reduit ? 'auto' : 'smooth'
      })), 60);
    };
    $$('.tile', ui).forEach((t => {
      const k = $('b[data-k]', t).dataset.k;
      t.setAttribute('role', 'button');
      t.tabIndex = 0;
      const agir = () => {
        arreter();
        if (k === 'photos') {
          $('#photos')?.scrollIntoView({
            behavior: reduit ? 'auto' : 'smooth'
          });
          return;
        }
        montrer(k === 'cats' ? categories : classement);
      };
      t.addEventListener('click', agir);
      t.addEventListener('keydown', (e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          agir();
        }
      }));
    }));
    $('.st-scroll', ui).addEventListener('wheel', arreter, {
      passive: true
    });
    graphique.classList.add('bars-off');
    rendre('30', false);
    let vu = false;
    section.addEventListener('portee:entree', (() => {
      if (!vu) {
        vu = true;
        requestAnimationFrame((() => graphique.classList.remove('bars-off')));
        setTimeout(lancer, 2200);
      } else {
        lancer();
      }
    }));
    section.addEventListener('portee:sortie', suspendre);
    return ui;
  }
  function cloner() {
    $$('[data-clone]').forEach((cible => {
      const source = $(cible.dataset.clone);
      if (!source) return;
      const copie = source.cloneNode(true);
      copie.removeAttribute('id');
      $$('[id]', copie).forEach((n => n.removeAttribute('id')));
      $$('.bars-off', copie).forEach((n => n.classList.remove('bars-off')));
      $$('button', copie).forEach((b => b.setAttribute('tabindex', '-1')));
      copie.setAttribute('inert', '');
      cible.replaceChildren(copie);
      cible.closest('.iphone')?.classList.add('is-ready');
    }));
  }
  function initPhotos() {
    const ui = $('#photos-ui');
    if (!ui) return;
    const section = ui.closest('section');
    const cellules = $$('.pg-cell', ui);
    const vue = $('.vw', ui);
    const photo = $('.vw-photo', ui);
    const image = $('.vw-photo img', ui);
    const compteur = $('.vw-count', ui);
    const titre = $('.vw-leg-t b', ui);
    const detail = $('.vw-leg-t small', ui);
    const pastille = $('.vw-leg .bub', ui);
    const pastilleIcone = $('.vw-leg .bub use', ui);
    const doigt = $('#photos-tap');
    const HAUT = 229.5;
    let ouverte = -1;
    let occupe = false;
    let demo = !reduit;
    let actif = false;
    let boucleEnCours = false;
    const echelle = () => ui.getBoundingClientRect().width / 393;
    function cadre(el) {
      const s = echelle();
      const a = el.getBoundingClientRect();
      const b = ui.getBoundingClientRect();
      return {
        x: (a.left - b.left) / s,
        y: (a.top - b.top) / s,
        w: a.width / s
      };
    }
    const depuis = r => `translate(${r.x}px, ${r.y - HAUT}px) scale(${r.w / 393})`;
    function remplir(i) {
      const c = cellules[i].dataset;
      image.src = `assets/img/photos/${c.ph}.webp`;
      compteur.textContent = `${i + 1} sur 46`;
      titre.textContent = c.spot;
      detail.textContent = `Ajoutée le ${c.date}`;
      pastille.style.setProperty('--c', c.c);
      pastilleIcone.setAttribute('href', `#${c.i}`);
    }
    async function ouvrir(i) {
      if (occupe || ouverte >= 0) return;
      occupe = true;
      ouverte = i;
      remplir(i);
      const r = cadre(cellules[i]);
      photo.style.visibility = 'visible';
      cellules[i].style.visibility = 'hidden';
      vue.classList.add('is-open');
      await photo.animate([ {
        transform: depuis(r)
      }, {
        transform: 'none'
      } ], {
        duration: 480,
        easing: 'cubic-bezier(.22,.8,.24,1)'
      }).finished;
      occupe = false;
    }
    async function fermer() {
      if (occupe || ouverte < 0) return;
      occupe = true;
      const i = ouverte;
      const r = cadre(cellules[i]);
      vue.classList.remove('is-open');
      const a = photo.animate([ {
        transform: 'none'
      }, {
        transform: depuis(r)
      } ], {
        duration: 400,
        easing: 'cubic-bezier(.4,0,.2,1)',
        fill: 'forwards'
      });
      await a.finished;
      cellules[i].style.visibility = '';
      photo.style.visibility = 'hidden';
      a.cancel();
      ouverte = -1;
      occupe = false;
    }
    async function suivante() {
      if (occupe || ouverte < 0) return;
      occupe = true;
      const j = (ouverte + 1) % cellules.length;
      await photo.animate([ {
        transform: 'none'
      }, {
        transform: 'translateX(-393px)'
      } ], {
        duration: 260,
        easing: 'cubic-bezier(.4,0,1,1)'
      }).finished;
      cellules[ouverte].style.visibility = '';
      ouverte = j;
      cellules[j].style.visibility = 'hidden';
      remplir(j);
      await photo.animate([ {
        transform: 'translateX(393px)'
      }, {
        transform: 'none'
      } ], {
        duration: 340,
        easing: 'cubic-bezier(.22,.8,.24,1)'
      }).finished;
      occupe = false;
    }
    async function toucher(el) {
      const r = cadre(el);
      doigt.style.setProperty('--tx', `${r.x + r.w / 2}px`);
      doigt.style.setProperty('--ty', `${r.y + r.w / 2}px`);
      doigt.classList.remove('is-tap');
      void doigt.offsetWidth;
      doigt.classList.add('is-tap');
      await attendre(380);
    }
    const choix = [ 0, 4, 7, 1, 9 ];
    async function boucle() {
      if (boucleEnCours) return;
      boucleEnCours = true;
      let k = 0;
      await attendre(1200);
      while (demo && actif) {
        if (ouverte >= 0) {
          await fermer();
          await attendre(900);
          continue;
        }
        await toucher(cellules[choix[k++ % choix.length]]);
        if (!demo || !actif) break;
        await ouvrir(choix[(k - 1) % choix.length]);
        await attendre(2400);
        if (!demo || !actif) break;
        await suivante();
        await attendre(2200);
        if (!demo || !actif) break;
        await fermer();
        await attendre(2e3);
      }
      boucleEnCours = false;
    }
    const arreter = () => {
      demo = false;
    };
    cellules.forEach(((c, i) => c.addEventListener('click', (() => {
      arreter();
      ouvrir(i);
    }))));
    photo.addEventListener('click', (() => {
      arreter();
      suivante();
    }));
    $('.vw-close', ui).addEventListener('click', (() => {
      arreter();
      fermer();
    }));
    $('.vw-go', ui).addEventListener('click', (() => {
      arreter();
      fermer();
    }));
    addEventListener('keydown', (e => {
      if (e.key === 'Escape' && ouverte >= 0) {
        arreter();
        fermer();
      }
    }));
    const corps = $('.pg-body', ui);
    const seg = $('.seg-2', ui);
    const choixTri = $$('span', seg);
    const parDate = [ ...corps.children ].filter((n => n !== seg));
    let parSpot = null;
    function trier(mode) {
      choixTri.forEach(((b, i) => {
        const on = i === 1 === (mode === 'spot');
        b.setAttribute('aria-selected', String(on));
      }));
      seg.classList.toggle('is-spot', mode === 'spot');
      if (mode === 'spot') {
        if (!parSpot) {
          const groupes = new Map;
          cellules.forEach((c => {
            const k = c.dataset.spot;
            if (!groupes.has(k)) groupes.set(k, []);
            groupes.get(k).push(c);
          }));
          parSpot = [ ...groupes ].sort(((x, y) => y[1].length - x[1].length || x[0].localeCompare(y[0], 'fr'))).flatMap((([nomSpot, liste]) => {
            const h = document.createElement('div');
            h.className = 'pg-h';
            h.innerHTML = '<b></b><small></small>';
            h.firstChild.textContent = nomSpot;
            h.lastChild.textContent = `${liste.length} photo${liste.length > 1 ? 's' : ''}`;
            const g = document.createElement('div');
            g.className = 'pg-grid';
            g.dataset.cellules = liste.map((c => cellules.indexOf(c))).join(',');
            return [ h, g ];
          }));
        }
        parSpot.forEach((n => {
          if (n.dataset.cellules) n.replaceChildren(...n.dataset.cellules.split(',').map((i => cellules[+i])));
        }));
        corps.replaceChildren(seg, ...parSpot);
      } else {
        const grilles = parDate.filter((n => n.classList.contains('pg-grid')));
        let i = 0;
        grilles.forEach((g => {
          const n = +(g.dataset.n ||= g.children.length || 0);
          g.replaceChildren(...cellules.slice(i, i + n));
          i += n;
        }));
        corps.replaceChildren(seg, ...parDate);
      }
      corps.scrollTop = 0;
    }
    $$('.pg-grid', corps).forEach((g => {
      g.dataset.n = g.children.length;
    }));
    choixTri.forEach(((b, i) => {
      b.setAttribute('role', 'tab');
      b.tabIndex = 0;
      const agir = () => {
        arreter();
        if (ouverte < 0) trier(i === 1 ? 'spot' : 'date');
      };
      b.addEventListener('click', agir);
      b.addEventListener('keydown', (e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          agir();
        }
      }));
    }));
    seg.setAttribute('role', 'tablist');
    seg.setAttribute('aria-label', 'Trier les photos');
    section.addEventListener('portee:entree', (() => {
      actif = true;
      if (demo) boucle();
    }));
    section.addEventListener('portee:sortie', (() => {
      actif = false;
    }));
  }
  function initProximite() {
    const carte = $('#prox-map');
    if (!carte) return;
    const section = carte.closest('section');
    const route = $('#prox-route');
    const trace = $('#prox-trail');
    const marcheur = $('#prox-walker');
    const anneau = $('#prox-ring');
    const onde = $('#prox-pulse');
    const champDistance = $('#prox-dist');
    const champEtat = $('#prox-etat');
    const champCompteur = $('#prox-compteur');
    const champRayon = $('#prox-rayon');
    const ecran = $('#lock-ui');
    const distanceNotif = $('#n-dist');
    const boutons = $$('.rayons button');
    const SPOT = {
      x: 392,
      y: 172
    };
    const PX_PAR_M = .36;
    const DUREE = 11e3;
    const PAUSE = 1800;
    const L = route.getTotalLength();
    trace.style.strokeDasharray = `${L} ${L}`;
    trace.style.strokeDashoffset = String(L);
    let rayon = 100;
    let dedans = false;
    let notifie = false;
    let passages = 0;
    let cycle = -1;
    let t0 = null;
    let rafId = 0;
    let minuterieActions = 0;
    function majRayon(m) {
      rayon = m;
      const k = m * PX_PAR_M / 100;
      anneau.style.setProperty('--k', k);
      onde.style.setProperty('--k', k);
      champRayon.textContent = `${m} m`;
      boutons.forEach((b => b.setAttribute('aria-pressed', String(Number(b.dataset.m) === m))));
    }
    function montrer(distance) {
      distanceNotif.textContent = String(distance);
      ecran.classList.add('has-notif');
      clearTimeout(minuterieActions);
      minuterieActions = setTimeout((() => ecran.classList.add('has-actions')), 1600);
      onde.classList.remove('go');
      void onde.getBBox();
      onde.classList.add('go');
    }
    function cacher() {
      clearTimeout(minuterieActions);
      ecran.classList.remove('has-notif', 'has-actions');
    }
    function placer(k) {
      const pt = route.getPointAtLength(k * L);
      marcheur.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
      trace.style.strokeDashoffset = String(L - k * L);
      const dpx = Math.hypot(pt.x - SPOT.x, pt.y - SPOT.y);
      const metres = Math.max(5, Math.round(dpx / PX_PAR_M / 5) * 5);
      champDistance.textContent = metres >= 1e3 ? `${decimal.format(metres / 1e3)} km` : `${metres} m`;
      const interieur = dpx <= rayon * PX_PAR_M;
      if (interieur !== dedans) {
        dedans = interieur;
        carte.classList.toggle('is-inside', interieur);
        champEtat.textContent = interieur ? 'Dans le rayon' : 'Hors du rayon';
        champEtat.classList.toggle('dedans', interieur);
        if (interieur && !notifie) {
          notifie = true;
          champCompteur.textContent = String(++passages);
          montrer(metres);
        }
      }
    }
    function image(t) {
      if (t0 === null) t0 = t;
      const ecoule = t - t0;
      const c = Math.floor(ecoule / (DUREE + PAUSE));
      if (c !== cycle) {
        cycle = c;
        notifie = false;
        cacher();
      }
      placer(Math.min(ecoule % (DUREE + PAUSE) / DUREE, 1));
      rafId = requestAnimationFrame(image);
    }
    boutons.forEach((b => b.addEventListener('click', (() => majRayon(Number(b.dataset.m))))));
    majRayon(100);
    if (reduit) {
      placer(.66);
      return;
    }
    section.addEventListener('portee:entree', (() => {
      if (rafId) return;
      t0 = null;
      cycle = -1;
      rafId = requestAnimationFrame(image);
    }));
    section.addEventListener('portee:sortie', (() => {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }));
  }
  const nav = $('.nav');
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
    const p = Math.min(Math.max(-r.top / vh, 0), 1);
    parallaxe.forEach((el => {
      const k = Number(el.dataset.par);
      el.style.transform = k ? `translate3d(${k * p * 70}px, ${-p * 30}px, 0)` : `translate3d(0, ${-p * 80}px, 0)`;
    }));
  }
  function majManifeste(vh) {
    const r = manifeste.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    const p = Math.min(Math.max((vh * .82 - r.top) / (r.height * .9), 0), 1);
    const n = reduit ? mots.length : Math.round(p * mots.length * 1.05);
    mots.forEach(((m, i) => m.classList.toggle('on', i < n)));
  }
  function majScenario(vh) {
    const r = story.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    const p = Math.min(Math.max(-r.top / (r.height - vh), 0), 1);
    progression.style.transform = mobile.matches ? `scaleX(${p})` : `scaleY(${p})`;
    const etape = p < .06 ? 0 : p < .38 ? 1 : p < .7 ? 2 : 3;
    if (etape === etapeCourante) return;
    etapeCourante = etape;
    storyUi.dataset.step = String(etape);
    etapes.forEach(((e, i) => e.classList.toggle('is-active', i === Math.max(etape - 1, 0))));
  }
  let enAttente = false;
  function surDefilement() {
    if (enAttente) return;
    enAttente = true;
    requestAnimationFrame((() => {
      enAttente = false;
      const vh = innerHeight;
      nav.classList.toggle('is-scrolled', scrollY > 8);
      majAccueil(vh);
      majManifeste(vh);
      majScenario(vh);
    }));
  }
  addEventListener('scroll', surDefilement, {
    passive: true
  });
  addEventListener('resize', surDefilement);
  initStatistiques();
  cloner();
  initPhotos();
  initProximite();
  surDefilement();
  const annee = $('#annee');
  if (annee) annee.textContent = String((new Date).getFullYear());
})();
