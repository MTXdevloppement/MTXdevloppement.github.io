(() => {
  'use strict';
  const sansBarreSafari = fn => {
    const tactile = matchMedia('(hover: none) and (pointer: coarse)').matches;
    let l = innerWidth, h = innerHeight;
    return e => {
      if (tactile && innerWidth === l && Math.abs(innerHeight - h) < 160) return;
      l = innerWidth;
      h = innerHeight;
      fn(e);
    };
  };
  const racine = document.documentElement;
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tactile = matchMedia('(hover: none)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [ ...r.querySelectorAll(s) ];
  const borne = (v, a, b) => Math.min(Math.max(v, a), b);
  const lerp = (a, b, t) => a + (b - a) * t;
  const plage = (v, a, b) => borne((v - a) / (b - a), 0, 1);
  const douce = t => t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
  const sortie = t => 1 - (1 - t) ** 3;
  const attendre = ms => new Promise((ok => setTimeout(ok, ms)));
  const nombre = new Intl.NumberFormat('fr-FR');
  function decouper(el) {
    let n = 0;
    const mots = [];
    const traiter = (noeud, classe) => {
      for (const enfant of [ ...noeud.childNodes ]) {
        if (enfant.nodeType === 3) {
          const frag = document.createDocumentFragment();
          enfant.textContent.split(/([ \t\n\r]+)/).forEach((morceau => {
            if (!morceau) return;
            if (/^[ \t\n\r]+$/.test(morceau)) {
              frag.append(' ');
              return;
            }
            const w = document.createElement('span');
            w.className = 'w' + (classe ? ' ' + classe : '');
            const i = document.createElement('i');
            i.textContent = morceau;
            w.style.setProperty('--wi', n++);
            w.append(i);
            frag.append(w);
            mots.push(w);
          }));
          enfant.replaceWith(frag);
        } else if (enfant.nodeType === 1) {
          const c = enfant.className;
          traiter(enfant, c);
          enfant.replaceWith(...enfant.childNodes);
        }
      }
    };
    traiter(el, '');
    return mots;
  }
  $$('.split').forEach((el => {
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    decouper(el);
  }));
  const motsManif = $('#manif') ? decouper($('#manif')) : [];
  const apparition = new IntersectionObserver((entrees => {
    for (const e of entrees) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('is-in');
      e.target.dispatchEvent(new Event('apparu'));
      apparition.unobserve(e.target);
    }
  }), {
    rootMargin: '0px 0px -8% 0px',
    threshold: .1
  });
  $$('[data-reveal]').forEach((el => apparition.observe(el)));
  const portee = new IntersectionObserver((entrees => {
    for (const e of entrees) {
      e.target.classList.toggle('is-paused', !e.isIntersecting);
      e.target.dispatchEvent(new Event(e.isIntersecting ? 'portee:entree' : 'portee:sortie'));
    }
  }), {
    rootMargin: '100px 0px'
  });
  $$('[data-scope]').forEach((el => portee.observe(el)));
  $$('[data-compte]').forEach((el => {
    const vers = Number(el.dataset.compte);
    if (reduit || !vers) return;
    el.textContent = '0';
    el.closest('[data-reveal]').addEventListener('apparu', (() => {
      const t0 = performance.now();
      const pas = t => {
        const k = Math.min((t - t0) / 1100, 1);
        el.textContent = nombre.format(Math.round(vers * sortie(k)));
        if (k < 1) requestAnimationFrame(pas);
      };
      requestAnimationFrame(pas);
    }), {
      once: true
    });
  }));
  const nav = $('.nav');
  const barre = $('.nav-progress');
  const liens = $$('.nav-links a');
  const teintes = {
    texte: 'var(--bleu-hi)',
    tableur: 'var(--vert-hi)',
    presentation: 'var(--orange-hi)'
  };
  const sectionActive = new IntersectionObserver((entrees => {
    for (const e of entrees) {
      if (!e.isIntersecting) continue;
      const id = e.target.id;
      liens.forEach((a => a.classList.toggle('is-current', a.getAttribute('href') === '#' + id)));
      racine.style.setProperty('--tint', teintes[id] || 'var(--bleu-hi)');
    }
  }), {
    rootMargin: '-45% 0px -50% 0px'
  });
  $$('main > section[id]').forEach((s => sectionActive.observe(s)));
  let vh = innerHeight;
  let defilAttendu = false;
  let dernierY = scrollY;
  let vitesse = 0;
  function surDefilement() {
    defilAttendu = false;
    const y = scrollY;
    vitesse = lerp(vitesse, y - dernierY, .5);
    dernierY = y;
    nav.classList.toggle('is-scrolled', y > 8);
    const max = document.documentElement.scrollHeight - vh;
    barre.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    if (motsManif.length) {
      const r = $('#manif').getBoundingClientRect();
      const p = reduit ? 1 : plage(vh * .82 - r.top, 0, r.height + vh * .3);
      const allumes = Math.round(p * motsManif.length);
      motsManif.forEach(((w, i) => w.classList.toggle('on', i < allumes)));
    }
    heros.defile();
  }
  addEventListener('scroll', (() => {
    if (!defilAttendu) {
      defilAttendu = true;
      requestAnimationFrame(surDefilement);
    }
  }), {
    passive: true
  });
  addEventListener('resize', sansBarreSafari((() => {
    vh = innerHeight;
    heros.mesurer();
    surDefilement();
  })), {
    passive: true
  });
  const heros = (() => {
    const hero = $('#accueil');
    const pin = $('.hero-pin', hero);
    const copie = $('.hero-copy', hero);
    const fan = $('#fan');
    const feuilles = $$('.sheet', fan);
    const contenus = feuilles.map((f => $('.sh-in', f)));
    const appareil = $('#hero-device');
    const outils = $$('#home-tools .tool');
    const defilApp = $('.h-scroll', hero);
    const accueil = $('#home');
    const indice = $('.hero-hint', hero);
    const POSES = [ [ -.34, .06, -14 ], [ 0, -.05, 0 ], [ .34, .03, 14 ] ];
    const ECARTS = [ [ -.46, .09, -19 ], [ 0, -.1, 0 ], [ .46, .06, 19 ] ];
    const PROF = [ 16, 9, 5 ];
    let m = null;
    let actif = false;
    let p = 0;
    let survol = 0, survolCible = 0;
    let sx = 0, sy = 0, sxC = 0, syC = 0;
    const t0 = performance.now();
    function decalage(el, jusqua) {
      let x = 0, y = 0;
      while (el && el !== jusqua) {
        x += el.offsetLeft;
        y += el.offsetTop;
        el = el.offsetParent;
      }
      return [ x, y ];
    }
    const telephone = matchMedia('(max-width: 699px)');
    function placerEventail() {
      fan.style.top = fan.style.bottom = fan.style.width = fan.style.marginLeft = '';
      pin.classList.remove('hero-serre');
      if (!telephone.matches) return;
      let bas = copie.offsetTop + copie.offsetHeight + 14;
      let place = Math.min(pin.clientHeight, innerHeight) - bas - 24;
      if (place < 170) {
        pin.classList.add('hero-serre');
        bas = copie.offsetTop + copie.offsetHeight + 14;
        place = Math.min(pin.clientHeight, innerHeight) - bas - 24;
      }
      const l = Math.round(Math.max(130, Math.min(fan.offsetWidth, place)));
      Object.assign(fan.style, {
        top: bas + 'px',
        bottom: 'auto',
        width: l + 'px',
        marginLeft: -l / 2 + 'px'
      });
    }
    function mesurer() {
      if (reduit) return;
      placerEventail();
      const fw = fan.offsetWidth;
      const [fx, fy] = decalage(fan, pin);
      const [dx, dy] = decalage(appareil, pin);
      m = {
        hauteur: pin.offsetHeight,
        course: Math.max(1, hero.offsetHeight - pin.offsetHeight),
        haut: hero.offsetTop,
        fx: fx,
        fy: fy,
        bw: fw * .5,
        bh: fw * .7,
        bx: fw * .25,
        by: fw * .15,
        dx: dx,
        dy: dy,
        dw: appareil.offsetWidth,
        dh: appareil.offsetHeight,
        cibles: outils.map((o => {
          const [ox, oy] = decalage(o, appareil);
          return {
            x: ox,
            y: oy,
            w: o.offsetWidth,
            h: o.offsetHeight
          };
        }))
      };
    }
    function rendre() {
      if (!m) return;
      const now = performance.now();
      survol = lerp(survol, survolCible, .12);
      sx = lerp(sx, sxC, .08);
      sy = lerp(sy, syC, .08);
      const dp = douce(plage(p, .06, .6));
      const dY = lerp(m.hauteur - m.dy + 30, 0, dp);
      const dS = lerp(.86, 1, dp);
      appareil.style.transform = `translate3d(0, ${dY}px, 0) scale(${dS})`;
      const cx = m.dx + m.dw / 2, cy = m.dy + m.dh / 2;
      const defil = defilApp ? defilApp.scrollTop : 0;
      const cp = plage(p, 0, .26);
      copie.style.opacity = 1 - cp;
      copie.style.translate = `0 ${-70 * douce(cp)}px`;
      copie.style.pointerEvents = cp > .6 ? 'none' : '';
      if (indice) indice.style.opacity = 1 - plage(p, 0, .06);
      const mp = douce(plage(p, .2, .62));
      const fondu = plage(p, .55, .66);
      feuilles.forEach(((f, i) => {
        const intro = reduit ? 1 : sortie(plage(now - t0 - 250 - i * 110, 0, 900));
        const pose = POSES[i], ecart = ECARTS[i];
        const libre = 1 - plage(p, 0, .2);
        const x0 = lerp(pose[0], ecart[0], survol) * m.bw + sx * PROF[i] * libre;
        const y0 = lerp(pose[1], ecart[1], survol) * m.bh + sy * PROF[i] * libre + (1 - intro) * 260;
        const r0 = lerp(pose[2], ecart[2], survol) + sx * 2 * libre + (1 - intro) * (i - 1) * 25;
        const c = m.cibles[i];
        const tcx = cx + (m.dx + c.x + c.w / 2 - cx) * dS;
        const tcy = cy + (m.dy + c.y - defil + c.h / 2 - cy) * dS + dY;
        const nx = m.fx + m.bx + m.bw / 2, ny = m.fy + m.by + m.bh / 2;
        const x = lerp(x0, tcx - nx, mp), y = lerp(y0, tcy - ny, mp);
        const r = lerp(r0, 0, mp);
        const ex = lerp(1, c.w * dS / m.bw, mp), ey = lerp(1, c.h * dS / m.bh, mp);
        f.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${r}deg) scale(${ex}, ${ey})`;
        f.style.opacity = intro * (1 - fondu);
        f.style.borderRadius = `${lerp(26, 22 / ((ex + ey) / 2), mp)}px`;
        f.style.visibility = fondu >= 1 ? 'hidden' : '';
        f.style.pointerEvents = mp > .05 ? 'none' : '';
        contenus[i].style.opacity = 1 - plage(mp, .45, .8);
      }));
      accueil.style.setProperty('--tools-o', fondu);
      accueil.style.setProperty('--ui-o', plage(p, .64, .8));
      hero.classList.toggle('done', p >= .99);
      appareil.style.pointerEvents = p > .55 ? '' : 'none';
    }
    function boucle() {
      if (!actif) return;
      rendre();
      requestAnimationFrame(boucle);
    }
    if (!reduit) {
      new IntersectionObserver((([e]) => {
        const etait = actif;
        actif = e.isIntersecting;
        if (actif && !etait) requestAnimationFrame(boucle);
      })).observe(hero);
      const tactile = matchMedia('(hover: none)').matches;
      if (tactile) survolCible = 1;
      fan.addEventListener('pointerenter', (e => {
        if (e.pointerType === 'mouse') survolCible = 1;
      }));
      fan.addEventListener('pointerleave', (() => {
        if (!tactile) survolCible = 0;
      }));
      pin.addEventListener('pointermove', (e => {
        if (e.pointerType !== 'mouse') return;
        sxC = (e.clientX / innerWidth - .5) * 2;
        syC = (e.clientY / innerHeight - .5) * 2;
      }), {
        passive: true
      });
      new ResizeObserver((() => mesurer())).observe(pin);
      addEventListener('load', mesurer);
      mesurer();
    }
    return {
      mesurer: mesurer,
      defile() {
        if (!m || reduit) return;
        p = plage(scrollY - m.haut, 0, m.course * .8);
      }
    };
  })();
  (() => {
    const docs = $$('#home-docs .doc');
    const puces = $$('#home .chip');
    const recherche = $('#home-search');
    const compte = $('#home-count');
    const vide = $('#home-empty');
    let filtre = 'all';
    const plier = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    function appliquer() {
      const q = plier(recherche.value.trim());
      let n = 0;
      docs.forEach((d => {
        const ok = (filtre === 'all' || (filtre === 'fav' ? d.dataset.fav === '1' : d.dataset.k === filtre)) && (!q || plier(d.dataset.n).includes(q));
        d.classList.toggle('out', !ok);
        d.classList.remove('pop-in');
        if (ok) {
          d.style.setProperty('--n', n++);
          void d.offsetWidth;
          d.classList.add('pop-in');
        }
      }));
      compte.textContent = n;
      vide.hidden = n > 0;
      $('#home-tools-sec').hidden = $('#home-tpl-sec').hidden = !!q;
    }
    puces.forEach((b => {
      b.setAttribute('aria-pressed', b.classList.contains('on'));
      b.addEventListener('click', (() => {
        filtre = b.dataset.f;
        puces.forEach((x => {
          x.classList.toggle('on', x === b);
          x.setAttribute('aria-pressed', x === b);
        }));
        appliquer();
      }));
    }));
    recherche.addEventListener('input', appliquer);
    $$('#home-docs .fav').forEach((b => {
      b.setAttribute('aria-pressed', b.classList.contains('on'));
      b.addEventListener('click', (e => {
        e.stopPropagation();
        const d = b.closest('.doc');
        const on = d.dataset.fav !== '1';
        d.dataset.fav = on ? '1' : '0';
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', on);
        if (filtre === 'fav') appliquer();
      }));
    }));
    const OUTIL = {
      texte: 'texte',
      tableur: 'tableur',
      presentation: 'presentation',
      bleu: 'texte',
      vert: 'tableur',
      orange: 'presentation'
    };
    const NOM_OUTIL = {
      texte: 'Texte',
      tableur: 'Tableur',
      presentation: 'Présentation'
    };
    const nomDe = el => [ ...el.querySelectorAll('b') ].at(-1).textContent;
    function ouvrirDans(el, cle) {
      const id = OUTIL[cle];
      el.tabIndex = 0;
      el.setAttribute('role', 'link');
      el.setAttribute('aria-label', `${nomDe(el)}, ouvrir dans ${NOM_OUTIL[id]}`);
      const aller = () => document.getElementById(id)?.scrollIntoView({
        behavior: reduit ? 'auto' : 'smooth',
        block: 'start'
      });
      el.addEventListener('click', (e => {
        if (!e.target.closest('.fav')) aller();
      }));
      el.addEventListener('keydown', (e => {
        if (e.target === el && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          aller();
        }
      }));
    }
    docs.forEach((d => ouvrirDans(d, d.dataset.k)));
    $$('#home-tpls .tpl').forEach((t => ouvrirDans(t, (/k-(\w+)/.exec(t.className) || [])[1] || 'bleu')));
    const conteneur = $('#home-docs'), trier = $('#home-sort');
    const ordreDate = [ ...docs ];
    let parNom = false;
    trier?.addEventListener('click', (() => {
      parNom = !parNom;
      const liste = parNom ? [ ...docs ].sort(((a, b) => nomDe(a).localeCompare(nomDe(b), 'fr'))) : ordreDate;
      conteneur.append(...liste);
      $('span', trier).textContent = parNom ? 'Nom' : 'Trier';
      trier.setAttribute('aria-label', parNom ? 'Trier les documents par date' : 'Trier les documents par nom');
      appliquer();
    }));
    const tout = $('#home-tpl-all');
    tout?.addEventListener('click', (() => {
      const ouvert = $('#home-tpls').classList.toggle('tout');
      tout.textContent = ouvert ? 'Réduire' : 'Tout voir';
      tout.setAttribute('aria-expanded', ouvert);
    }));
  })();
  const popovers = [];
  function popover(bouton, pop) {
    const app = bouton.closest('.app');
    app.append(pop);
    const fermer = () => {
      pop.classList.remove('open');
      bouton.setAttribute('aria-expanded', 'false');
    };
    const ouvrir = () => {
      popovers.forEach((f => f !== fermer && f()));
      const rb = bouton.getBoundingClientRect(), ra = app.getBoundingClientRect();
      pop.classList.add('open');
      const w = pop.offsetWidth;
      const ech = ra.width / app.offsetWidth || 1;
      let x = (rb.left - ra.left) / ech;
      x = borne(x, 8, app.offsetWidth - w - 8);
      const bas = rb.top - ra.top > ra.height * .6;
      pop.style.left = x + 'px';
      if (bas) {
        pop.style.top = '';
        pop.style.bottom = (ra.bottom - rb.top) / ech + 6 + 'px';
        pop.style.transformOrigin = 'bottom left';
      } else {
        pop.style.bottom = '';
        pop.style.top = (rb.bottom - ra.top) / ech + 6 + 'px';
        pop.style.transformOrigin = 'top left';
      }
      bouton.setAttribute('aria-expanded', 'true');
    };
    const items = () => $$('button', pop);
    bouton.addEventListener('mousedown', (e => e.preventDefault()));
    bouton.addEventListener('click', (e => {
      e.stopPropagation();
      if (pop.classList.contains('open')) {
        fermer();
        return;
      }
      ouvrir();
      if (e.detail === 0) items()[0]?.focus({
        preventScroll: true
      });
    }));
    pop.addEventListener('mousedown', (e => e.preventDefault()));
    pop.addEventListener('click', (e => {
      if (e.target.closest('button')) {
        const focusDedans = pop.contains(document.activeElement);
        fermer();
        if (focusDedans) bouton.focus({
          preventScroll: true
        });
      }
      e.stopPropagation();
    }));
    pop.addEventListener('keydown', (e => {
      const liste = items();
      const i = liste.indexOf(document.activeElement);
      const pas = {
        ArrowDown: 1,
        ArrowRight: 1,
        ArrowUp: -1,
        ArrowLeft: -1
      }[e.key];
      if (pas) {
        e.preventDefault();
        liste[(i + pas + liste.length) % liste.length].focus({
          preventScroll: true
        });
      } else if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault();
        liste[e.key === 'Home' ? 0 : liste.length - 1].focus({
          preventScroll: true
        });
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        fermer();
        bouton.focus({
          preventScroll: true
        });
      } else if (e.key === 'Tab') {
        fermer();
        bouton.focus({
          preventScroll: true
        });
      }
    }));
    popovers.push(fermer);
    return {
      fermer: fermer
    };
  }
  document.addEventListener('click', (() => popovers.forEach((f => f()))));
  document.addEventListener('keydown', (e => {
    if (e.key === 'Escape') popovers.forEach((f => f()));
  }));
  const texte = (() => {
    const page = $('#tx-page');
    if (!page) return {};
    const app = $('#tx');
    const etiquette = $('#tx-style span');
    const taille = $('#tx-size');
    const compte = $('#tx-count');
    const barreCouleur = $('#tx-color-bar');
    let plageSauvee = null;
    const NOMS = {
      H1: 'Titre',
      H6: 'Sous-titre',
      H2: 'Titre 1',
      H3: 'Titre 2',
      H4: 'Titre 3',
      BLOCKQUOTE: 'Citation',
      PRE: 'Code',
      P: 'Corps',
      LI: 'Corps',
      DIV: 'Corps'
    };
    const TAILLES = [ 8, 10, 12, 14, 18, 24, 36 ];
    const commande = (c, v = null) => {
      try {
        return document.execCommand(c, false, v);
      } catch {
        return false;
      }
    };
    try {
      document.execCommand('defaultParagraphSeparator', false, 'p');
    } catch {}
    function dansPage(n) {
      return n && (n === page || page.contains(n));
    }
    document.addEventListener('selectionchange', (() => {
      const s = getSelection();
      if (s.rangeCount && dansPage(s.anchorNode)) {
        plageSauvee = s.getRangeAt(0).cloneRange();
        etat();
      }
    }));
    function restaurer() {
      page.focus({
        preventScroll: true
      });
      const s = getSelection();
      if (!plageSauvee) {
        const cible = page.querySelector('p:last-of-type') || page;
        plageSauvee = document.createRange();
        plageSauvee.selectNodeContents(cible);
      }
      s.removeAllRanges();
      s.addRange(plageSauvee);
    }
    function bloc() {
      const s = getSelection();
      let n = s.anchorNode;
      if (!dansPage(n)) return null;
      if (n.nodeType === 3) n = n.parentElement;
      return n.closest('h1,h2,h3,h4,h6,p,blockquote,pre,li,div') || page;
    }
    function etat() {
      $$('.fb[data-cmd]', app).forEach((b => {
        let on = false;
        try {
          on = document.queryCommandState(b.dataset.cmd);
        } catch {
          on = false;
        }
        b.setAttribute('aria-pressed', on);
      }));
      const b = bloc();
      if (b) {
        const nom = NOMS[b.tagName] || 'Corps';
        etiquette.textContent = nom;
        $$('#tx-styles button').forEach((x => x.classList.toggle('cur', x.textContent === nom)));
        const n = getSelection().anchorNode;
        const el = n && n.nodeType === 3 ? n.parentElement : n;
        if (el) taille.textContent = Math.round(parseFloat(getComputedStyle(el).fontSize) / pxParPoint());
      }
    }
    const pxParPoint = () => parseFloat(getComputedStyle(page).getPropertyValue('--pt')) || 1.125;
    function compter() {
      const t = page.innerText || '';
      const mots = (t.match(/[\p{L}\p{N}][\p{L}\p{N}’'\-]*/gu) || []).length;
      const car = t.replace(/\n/g, '').length;
      compte.textContent = `${nombre.format(mots)} mot${mots > 1 ? 's' : ''} · ${nombre.format(car)} caractère${car > 1 ? 's' : ''}`;
    }
    page.addEventListener('input', (() => {
      compter();
      etat();
    }));
    compter();
    $$('[data-cmd]', app).forEach((b => {
      b.addEventListener('mousedown', (e => e.preventDefault()));
      b.addEventListener('click', (() => {
        restaurer();
        commande('styleWithCSS', false);
        commande(b.dataset.cmd);
        compter();
        etat();
      }));
    }));
    popover($('#tx-style'), $('#tx-styles'));
    $$('#tx-styles button').forEach((b => b.addEventListener('click', (() => {
      restaurer();
      commande('formatBlock', `<${b.dataset.block}>`);
      etat();
      compter();
    }))));
    $$('.fb-size button', app).forEach((b => {
      b.addEventListener('mousedown', (e => e.preventDefault()));
      b.addEventListener('click', (() => {
        restaurer();
        const actuel = Number(taille.textContent) || 12;
        let i;
        if (Number(b.dataset.size) > 0) {
          i = TAILLES.findIndex((t => t > actuel));
          if (i < 0) i = TAILLES.length - 1;
        } else {
          i = -1;
          TAILLES.forEach(((t, j) => {
            if (t < actuel) i = j;
          }));
          if (i < 0) i = 0;
        }
        commande('styleWithCSS', false);
        commande('fontSize', String(i + 1));
        taille.textContent = TAILLES[i];
      }));
    }));
    popover($('#tx-color'), $('#tx-colors'));
    $$('#tx-colors [data-col]').forEach((b => b.addEventListener('click', (() => {
      restaurer();
      commande('styleWithCSS', true);
      commande('foreColor', b.dataset.col);
      barreCouleur.style.background = b.dataset.col;
    }))));
    $$('#tx-colors [data-hl]').forEach((b => b.addEventListener('click', (() => {
      restaurer();
      commande('styleWithCSS', true);
      if (!commande('hiliteColor', b.dataset.hl)) commande('backColor', b.dataset.hl);
    }))));
    popover($('#tx-ins'), $('#tx-insert'));
    const dateLongue = new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    function apresLeBloc() {
      const s = getSelection();
      let haut = s.rangeCount ? s.getRangeAt(0).endContainer : page;
      while (haut && haut.parentNode !== page) haut = haut.parentNode;
      if (!haut || haut === page) haut = page.lastElementChild;
      const r = document.createRange();
      if (haut && /^(P|H[1-6]|DIV)$/.test(haut.tagName)) {
        r.selectNodeContents(haut);
        r.collapse(false);
        s.removeAllRanges();
        s.addRange(r);
        if (!(haut.tagName === 'P' && !haut.textContent.trim() && !haut.querySelector('img, table, hr'))) commande('insertParagraph');
        return;
      }
      const vide = document.createElement('p');
      vide.append(document.createElement('br'));
      if (haut) haut.after(vide); else page.append(vide);
      r.setStart(vide, 0);
      r.collapse(true);
      s.removeAllRanges();
      s.addRange(r);
    }
    $$('#tx-insert button').forEach((b => b.addEventListener('click', (() => {
      restaurer();
      const quoi = b.dataset.ins;
      if (quoi === 'date') commande('insertText', dateLongue.format(new Date)); else {
        apresLeBloc();
        if (quoi === 'table') commande('insertHTML', '<table><tbody><tr><td>Tâche</td><td>Responsable</td><td>Échéance</td></tr><tr><td><br></td><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td><td><br></td></tr></tbody></table><p><br></p>');
        if (quoi === 'hr') commande('insertHTML', '<hr><p><br></p>');
        if (quoi === 'scan') commande('insertHTML', `<p class="ocr-in">${OCR_TEXTE.replace(/\n/g, '<br>')}</p>`);
      }
      compter();
      etat();
    }))));
    return {
      page: page
    };
  })();
  const OCR_TEXTE = 'Atelier Lumière\n12 rue des Lilas, 69003 Lyon\nLyon, le 13 octobre\nMadame, Monsieur,\nNous avons le plaisir de vous confirmer votre inscription à l’atelier du 3 novembre.\nBien cordialement.';
  (() => {
    const ocr = $('#ocr'), go = $('#ocr-go'), sortieTx = $('#ocr-text');
    if (!ocr) return;
    $$('.op-l', ocr).forEach(((l, i) => l.style.setProperty('--li', i)));
    let occupe = false;
    go.addEventListener('click', (async () => {
      if (occupe) return;
      occupe = true;
      go.disabled = true;
      sortieTx.textContent = '';
      ocr.dataset.etat = '1';
      await attendre(reduit ? 0 : 1250);
      ocr.dataset.etat = '2';
      const total = OCR_TEXTE.length;
      const duree = reduit ? 0 : 1700;
      const t0 = performance.now();
      await new Promise((fin => {
        const pas = t => {
          const k = duree ? Math.min((t - t0) / duree, 1) : 1;
          sortieTx.textContent = OCR_TEXTE.slice(0, Math.round(total * k));
          k < 1 ? requestAnimationFrame(pas) : fin();
        };
        requestAnimationFrame(pas);
      }));
      await attendre(400);
      ocr.dataset.etat = '3';
      go.lastChild.textContent = 'Recommencer';
      go.disabled = false;
      occupe = false;
    }));
  })();
  (() => {
    const pageEl = $('#mep-page');
    if (!pageEl) return;
    const PAPIERS = {
      A4: [ 210, 297 ],
      A5: [ 148, 210 ],
      A3: [ 297, 420 ],
      Letter: [ 216, 279, '8,5', '11' ],
      Legal: [ 216, 356, '8,5', '14' ]
    };
    let papier = 'A4', orient = 'portrait';
    const K = 205 / 420;
    function maj() {
      const [w, h, pw, ph] = PAPIERS[papier];
      const tourne = orient !== 'portrait';
      const [lw, lh] = tourne ? [ h, w ] : [ w, h ];
      pageEl.style.setProperty('--h', `${lh * K}px`);
      pageEl.style.setProperty('--r', lw / lh);
      const mm = `${lw} × ${lh} mm`;
      $('#mep-dim').textContent = pw ? `${tourne ? ph : pw} × ${tourne ? pw : ph} in · ${mm}` : mm;
    }
    function radio(groupe, attr, fixer) {
      $$(`#${groupe} button`).forEach((b => b.addEventListener('click', (() => {
        $$(`#${groupe} button`).forEach((x => x.setAttribute('aria-checked', x === b)));
        fixer(b.dataset[attr]);
        maj();
      }))));
    }
    radio('mep-papier', 'p', (v => {
      papier = v;
    }));
    radio('mep-orient', 'o', (v => {
      orient = v;
    }));
    maj();
  })();
  const eur = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const pct = new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });
  const general = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 6
  });
  class Erreur {
    constructor(code) {
      this.err = code;
    }
    toString() {
      return this.err;
    }
  }
  const ERR = c => {
    throw new Erreur(c);
  };
  const colNum = s => [ ...s.toUpperCase() ].reduce(((n, ch) => n * 26 + ch.charCodeAt(0) - 64), 0) - 1;
  const colNom = i => {
    let s = '';
    i++;
    while (i > 0) {
      const r = (i - 1) % 26;
      s = String.fromCharCode(65 + r) + s;
      i = Math.floor((i - 1) / 26);
    }
    return s;
  };
  const refNom = (c, r) => colNom(c) + (r + 1);
  const lireRef = s => {
    const m = /^\$?([A-Z]{1,2})\$?(\d+)$/i.exec(s);
    return m ? [ colNum(m[1]), Number(m[2]) - 1 ] : null;
  };
  function jetons(src) {
    const t = [];
    let i = 0;
    while (i < src.length) {
      const c = src[i];
      if (/\s/.test(c)) {
        i++;
        continue;
      }
      if (c === '"') {
        let j = i + 1, v = '';
        for (;;) {
          if (j >= src.length) ERR('#VALEUR!');
          if (src[j] === '"') {
            if (src[j + 1] === '"') {
              v += '"';
              j += 2;
              continue;
            }
            break;
          }
          v += src[j++];
        }
        t.push({
          t: 'str',
          v: v
        });
        i = j + 1;
        continue;
      }
      const n = /^(\d+(?:[.,]\d+)?|[.,]\d+)(?:[eE][+-]?\d+)?/.exec(src.slice(i));
      if (n && /[\d.,]/.test(c) && (c !== ',' || /\d/.test(src[i + 1] || ''))) {
        t.push({
          t: 'num',
          v: parseFloat(n[0].replace(',', '.'))
        });
        i += n[0].length;
        continue;
      }
      const id = /^\$?[A-Za-zÀ-ÿ_][A-Za-zÀ-ÿ0-9_.$]*/.exec(src.slice(i));
      if (id) {
        const mot = id[0];
        i += mot.length;
        if (src[i] === '(') t.push({
          t: 'fn',
          v: mot.toUpperCase()
        }); else if (lireRef(mot)) t.push({
          t: 'ref',
          v: lireRef(mot)
        }); else if (/^(VRAI|TRUE)$/i.test(mot)) t.push({
          t: 'bool',
          v: true
        }); else if (/^(FAUX|FALSE)$/i.test(mot)) t.push({
          t: 'bool',
          v: false
        }); else ERR('#NOM?');
        continue;
      }
      const deux = src.slice(i, i + 2);
      if ([ '<=', '>=', '<>' ].includes(deux)) {
        t.push({
          t: 'op',
          v: deux
        });
        i += 2;
        continue;
      }
      if ('+-*/^&=<>();:%,'.includes(c)) {
        t.push({
          t: 'op',
          v: c === ',' ? ';' : c
        });
        i++;
        continue;
      }
      ERR('#NOM?');
    }
    return t;
  }
  function analyser(src) {
    const t = jetons(src);
    let i = 0;
    const vu = () => t[i];
    const est = v => t[i] && t[i].t === 'op' && t[i].v === v;
    const prendre = v => {
      if (!est(v)) ERR('#VALEUR!');
      i++;
    };
    const comparaison = () => {
      let a = concat();
      while (t[i] && t[i].t === 'op' && [ '=', '<>', '<', '>', '<=', '>=' ].includes(t[i].v)) {
        const op = t[i++].v;
        a = {
          k: 'bin',
          op: op,
          a: a,
          b: concat()
        };
      }
      return a;
    };
    const concat = () => {
      let a = somme();
      while (est('&')) {
        i++;
        a = {
          k: 'bin',
          op: '&',
          a: a,
          b: somme()
        };
      }
      return a;
    };
    const somme = () => {
      let a = produit();
      while (est('+') || est('-')) {
        const op = t[i++].v;
        a = {
          k: 'bin',
          op: op,
          a: a,
          b: produit()
        };
      }
      return a;
    };
    const produit = () => {
      let a = puissance();
      while (est('*') || est('/')) {
        const op = t[i++].v;
        a = {
          k: 'bin',
          op: op,
          a: a,
          b: puissance()
        };
      }
      return a;
    };
    const puissance = () => {
      let a = unaire();
      while (est('^')) {
        i++;
        a = {
          k: 'bin',
          op: '^',
          a: a,
          b: unaire()
        };
      }
      return a;
    };
    const unaire = () => {
      if (est('-')) {
        i++;
        return {
          k: 'neg',
          a: unaire()
        };
      }
      if (est('+')) {
        i++;
        return unaire();
      }
      let a = primaire();
      while (est('%')) {
        i++;
        a = {
          k: 'pct',
          a: a
        };
      }
      return a;
    };
    const primaire = () => {
      const j = vu();
      if (!j) ERR('#VALEUR!');
      i++;
      if (j.t === 'num') return {
        k: 'v',
        v: j.v
      };
      if (j.t === 'str') return {
        k: 'v',
        v: j.v
      };
      if (j.t === 'bool') return {
        k: 'v',
        v: j.v
      };
      if (j.t === 'ref') {
        if (est(':')) {
          i++;
          const f = vu();
          if (!f || f.t !== 'ref') ERR('#REF!');
          i++;
          return {
            k: 'plage',
            a: j.v,
            b: f.v
          };
        }
        return {
          k: 'ref',
          c: j.v[0],
          r: j.v[1]
        };
      }
      if (j.t === 'fn') {
        prendre('(');
        const args = [];
        if (!est(')')) {
          for (;;) {
            args.push(est(';') || est(')') ? {
              k: 'v',
              v: null
            } : comparaison());
            if (est(';')) {
              i++;
              continue;
            }
            break;
          }
        }
        prendre(')');
        return {
          k: 'fn',
          n: j.v,
          args: args
        };
      }
      if (j.t === 'op' && j.v === '(') {
        const e = comparaison();
        prendre(')');
        return e;
      }
      return ERR('#VALEUR!');
    };
    const arbre = comparaison();
    if (i < t.length) ERR('#VALEUR!');
    return arbre;
  }
  const enNombre = v => {
    if (v instanceof Erreur) throw v;
    if (v === null || v === undefined || v === '') return 0;
    if (typeof v === 'number') return v;
    if (typeof v === 'boolean') return v ? 1 : 0;
    const n = litNombre(String(v));
    if (n === null) ERR('#VALEUR!');
    return n;
  };
  const enTexte = v => {
    if (v instanceof Erreur) throw v;
    if (v === null || v === undefined) return '';
    if (typeof v === 'boolean') return v ? 'VRAI' : 'FAUX';
    if (typeof v === 'number') return String(Math.round(v * 1e10) / 1e10).replace('.', ',');
    return String(v);
  };
  const enBool = v => typeof v === 'string' ? /^(vrai|true)$/i.test(v) ? true : /^(faux|false)$/i.test(v) ? false : ERR('#VALEUR!') : !!enNombre(v);
  function litNombre(s) {
    let x = s.replace(/[\s  ]/g, '');
    let f = 1;
    if (x.endsWith('%')) {
      f = .01;
      x = x.slice(0, -1);
    }
    if (x.endsWith('€')) x = x.slice(0, -1);
    if (!/^[-+]?(\d+([.,]\d*)?|[.,]\d+)([eE][-+]?\d+)?$/.test(x)) return null;
    return parseFloat(x.replace(',', '.')) * f;
  }
  function comparer(a, b) {
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    if (a === null) a = typeof b === 'number' ? 0 : '';
    if (b === null) b = typeof a === 'number' ? 0 : '';
    if (typeof a === typeof b) return typeof a === 'string' ? a.localeCompare(b, 'fr', {
      sensitivity: 'base'
    }) : a === b ? 0 : a ? 1 : -1;
    const rang = v => typeof v === 'number' ? 0 : typeof v === 'string' ? 1 : 2;
    return rang(a) - rang(b);
  }
  function critere(c) {
    const s = typeof c === 'string' ? c : null;
    if (s === null) return v => comparer(v, c) === 0;
    const m = /^(<=|>=|<>|<|>|=)?(.*)$/.exec(s);
    const op = m[1] || '=';
    const n = litNombre(m[2]);
    const val = n !== null ? n : m[2];
    if (typeof val === 'string' && /[*?]/.test(val) && (op === '=' || op === '<>')) {
      const re = new RegExp('^' + val.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$', 'i');
      return v => op === '=' === re.test(enTexte(v));
    }
    return v => {
      if (v instanceof Erreur) return false;
      const d = comparer(typeof val === 'number' && typeof v === 'string' && litNombre(v) !== null ? litNombre(v) : v, val);
      return {
        '=': d === 0,
        '<>': d !== 0,
        '<': d < 0,
        '>': d > 0,
        '<=': d <= 0,
        '>=': d >= 0
      }[op];
    };
  }
  class Classeur {
    constructor() {
      this.brut = new Map;
      this.cache = new Map;
      this.pile = new Set;
    }
    lire(ref) {
      return this.brut.get(ref) || '';
    }
    ecrire(ref, v) {
      v ? this.brut.set(ref, v) : this.brut.delete(ref);
      this.cache.clear();
    }
    valeur(c, r) {
      const ref = refNom(c, r);
      if (this.cache.has(ref)) return this.cache.get(ref);
      if (this.pile.has(ref)) return new Erreur('#CIRC!');
      const brut = this.lire(ref);
      let v;
      if (!brut) v = null; else if (brut[0] === '=') {
        this.pile.add(ref);
        try {
          v = this.eval(analyser(brut.slice(1)));
          if (Array.isArray(v)) v = v[0]?.[0] ?? null;
          if (v === null) v = 0;
        } catch (e) {
          v = e instanceof Erreur ? e : new Erreur('#VALEUR!');
        }
        this.pile.delete(ref);
      } else {
        const n = litNombre(brut);
        v = n !== null ? n : /^(vrai|faux)$/i.test(brut) ? /^vrai$/i.test(brut) : brut;
      }
      this.cache.set(ref, v);
      return v;
    }
    eval(n) {
      switch (n.k) {
       case 'v':
        return n.v;

       case 'ref':
        {
          const v = this.valeur(n.c, n.r);
          if (v instanceof Erreur) throw v;
          return v;
        }

       case 'plage':
        {
          const [c1, r1] = n.a, [c2, r2] = n.b;
          const lignes = [];
          for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++) {
            const l = [];
            for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++) l.push(this.valeur(c, r));
            lignes.push(l);
          }
          return lignes;
        }

       case 'neg':
        return -enNombre(this.scal(n.a));

       case 'pct':
        return enNombre(this.scal(n.a)) / 100;

       case 'bin':
        {
          const a = this.scal(n.a), b = this.scal(n.b);
          switch (n.op) {
           case '+':
            return enNombre(a) + enNombre(b);

           case '-':
            return enNombre(a) - enNombre(b);

           case '*':
            return enNombre(a) * enNombre(b);

           case '/':
            {
              const d = enNombre(b);
              if (d === 0) ERR('#DIV/0!');
              return enNombre(a) / d;
            }

           case '^':
            return enNombre(a) ** enNombre(b);

           case '&':
            return enTexte(a) + enTexte(b);

           default:
            {
              if (a instanceof Erreur) throw a;
              if (b instanceof Erreur) throw b;
              const d = comparer(a, b);
              return {
                '=': d === 0,
                '<>': d !== 0,
                '<': d < 0,
                '>': d > 0,
                '<=': d <= 0,
                '>=': d >= 0
              }[n.op];
            }
          }
        }

       case 'fn':
        {
          const f = FONCTIONS[n.n];
          if (!f) ERR('#NOM?');
          return f(n.args, this);
        }
      }
      return ERR('#VALEUR!');
    }
    scal(n) {
      const v = this.eval(n);
      return Array.isArray(v) ? v.length === 1 && v[0].length === 1 ? v[0][0] : ERR('#VALEUR!') : v;
    }
    plat(args, nombresSeuls = true) {
      const out = [];
      for (const a of args) {
        const v = this.eval(a);
        if (Array.isArray(v)) {
          for (const l of v) for (const x of l) {
            if (x instanceof Erreur) throw x;
            if (!nombresSeuls || typeof x === 'number') out.push(x);
          }
        } else out.push(nombresSeuls ? enNombre(v) : v);
      }
      return out;
    }
  }
  const FN = {};
  const def = (noms, f) => noms.split(' ').forEach((n => {
    FN[n] = f;
  }));
  const nums = (a, s) => s.plat(a);
  def('SOMME SUM', ((a, s) => nums(a, s).reduce(((x, y) => x + y), 0)));
  def('MOYENNE AVERAGE', ((a, s) => {
    const v = nums(a, s);
    return v.length ? v.reduce(((x, y) => x + y), 0) / v.length : ERR('#DIV/0!');
  }));
  def('MIN', ((a, s) => {
    const v = nums(a, s);
    return v.length ? Math.min(...v) : 0;
  }));
  def('MAX', ((a, s) => {
    const v = nums(a, s);
    return v.length ? Math.max(...v) : 0;
  }));
  def('NB COUNT', ((a, s) => nums(a, s).length));
  def('NBVAL COUNTA', ((a, s) => s.plat(a, false).filter((x => x !== null && x !== '')).length));
  def('NB.VIDE COUNTBLANK', ((a, s) => s.plat(a, false).filter((x => x === null || x === '')).length));
  def('PRODUIT PRODUCT', ((a, s) => nums(a, s).reduce(((x, y) => x * y), 1)));
  def('MEDIANE MEDIAN', ((a, s) => {
    const v = nums(a, s).sort(((x, y) => x - y));
    if (!v.length) ERR('#NOMBRE!');
    const m = v.length >> 1;
    return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
  }));
  const arrondir = mode => (a, s) => {
    const n = enNombre(s.scal(a[0])), d = a[1] ? enNombre(s.scal(a[1])) : 0, f = 10 ** d;
    const x = n * f;
    return (mode === 0 ? Math.sign(x) * Math.round(Math.abs(x) + 1e-9) : mode > 0 ? Math.sign(x) * Math.ceil(Math.abs(x) - 1e-9) : Math.trunc(x)) / f;
  };
  def('ARRONDI ROUND', arrondir(0));
  def('ARRONDI.SUP ROUNDUP', arrondir(1));
  def('ARRONDI.INF ROUNDDOWN', arrondir(-1));
  def('ENT INT', ((a, s) => Math.floor(enNombre(s.scal(a[0])))));
  def('ABS', ((a, s) => Math.abs(enNombre(s.scal(a[0])))));
  def('RACINE SQRT', ((a, s) => {
    const n = enNombre(s.scal(a[0]));
    return n < 0 ? ERR('#NOMBRE!') : Math.sqrt(n);
  }));
  def('PUISSANCE POWER', ((a, s) => enNombre(s.scal(a[0])) ** enNombre(s.scal(a[1]))));
  def('MOD', ((a, s) => {
    const n = enNombre(s.scal(a[0])), d = enNombre(s.scal(a[1]));
    if (!d) ERR('#DIV/0!');
    return n - d * Math.floor(n / d);
  }));
  def('PI', (() => Math.PI));
  def('ALEA RAND', (() => Math.random()));
  def('SI IF', ((a, s) => enBool(s.scal(a[0])) ? a[1] ? s.scal(a[1]) : true : a[2] ? s.scal(a[2]) : false));
  def('SIERREUR IFERROR', ((a, s) => {
    try {
      const v = s.scal(a[0]);
      if (v instanceof Erreur) throw v;
      return v;
    } catch (e) {
      if (e instanceof Erreur) return s.scal(a[1]);
      throw e;
    }
  }));
  def('ET AND', ((a, s) => s.plat(a, false).every((v => enBool(v)))));
  def('OU OR', ((a, s) => s.plat(a, false).some((v => enBool(v)))));
  def('NON NOT', ((a, s) => !enBool(s.scal(a[0]))));
  def('CONCATENER CONCAT CONCATENATE', ((a, s) => s.plat(a, false).map(enTexte).join('')));
  def('MAJUSCULE UPPER', ((a, s) => enTexte(s.scal(a[0])).toLocaleUpperCase('fr')));
  def('MINUSCULE LOWER', ((a, s) => enTexte(s.scal(a[0])).toLocaleLowerCase('fr')));
  def('NBCAR LEN', ((a, s) => enTexte(s.scal(a[0])).length));
  def('GAUCHE LEFT', ((a, s) => enTexte(s.scal(a[0])).slice(0, a[1] ? enNombre(s.scal(a[1])) : 1)));
  def('DROITE RIGHT', ((a, s) => {
    const t = enTexte(s.scal(a[0])), n = a[1] ? enNombre(s.scal(a[1])) : 1;
    return n ? t.slice(-n) : '';
  }));
  def('AUJOURDHUI TODAY', (() => new Intl.DateTimeFormat('fr-FR').format(new Date)));
  const siPlage = moyenne => (a, s) => {
    const p = s.eval(a[0]), test = critere(s.scal(a[1]));
    const cible = a[2] ? s.eval(a[2]) : p;
    if (!Array.isArray(p) || !Array.isArray(cible)) ERR('#VALEUR!');
    let total = 0, n = 0;
    p.forEach(((l, r) => l.forEach(((v, c) => {
      if (test(v)) {
        const x = cible[r]?.[c];
        if (typeof x === 'number') {
          total += x;
          n++;
        }
      }
    }))));
    return moyenne ? n ? total / n : ERR('#DIV/0!') : total;
  };
  def('SOMME.SI SUMIF', siPlage(false));
  def('MOYENNE.SI AVERAGEIF', siPlage(true));
  def('NB.SI COUNTIF', ((a, s) => {
    const p = s.eval(a[0]), test = critere(s.scal(a[1]));
    if (!Array.isArray(p)) ERR('#VALEUR!');
    return p.flat().filter(test).length;
  }));
  def('RECHERCHEV VLOOKUP', ((a, s) => {
    const v = s.scal(a[0]), t = s.eval(a[1]), col = enNombre(s.scal(a[2]));
    const exact = a[3] ? !enBool(s.scal(a[3])) : false;
    if (!Array.isArray(t) || col < 1 || col > t[0].length) ERR('#REF!');
    let trouve = -1;
    for (let r = 0; r < t.length; r++) {
      const d = comparer(t[r][0], v);
      if (d === 0) {
        trouve = r;
        break;
      }
      if (!exact && d < 0) trouve = r;
      if (!exact && d > 0) break;
    }
    if (trouve < 0) ERR('#N/A');
    return t[trouve][col - 1];
  }));
  def('VPM PMT', ((a, s) => {
    const taux = enNombre(s.scal(a[0])), n = enNombre(s.scal(a[1])), va = enNombre(s.scal(a[2]));
    if (!n) ERR('#NOMBRE!');
    return taux === 0 ? -va / n : -va * taux / (1 - (1 + taux) ** -n);
  }));
  const FONCTIONS = FN;
  const CATALOGUE = [ [ 'SOMME', 'SOMME(plage)', 'Additionne les nombres', 'SUM' ], [ 'MOYENNE', 'MOYENNE(plage)', 'Moyenne arithmétique', 'AVERAGE' ], [ 'MIN', 'MIN(plage)', 'Plus petite valeur', 'MIN' ], [ 'MAX', 'MAX(plage)', 'Plus grande valeur', 'MAX' ], [ 'NB', 'NB(plage)', 'Compte les nombres', 'COUNT' ], [ 'SI', 'SI(test; si_vrai; si_faux)', 'Renvoie une valeur selon une condition', 'IF' ], [ 'ARRONDI', 'ARRONDI(nombre; décimales)', 'Arrondit un nombre', 'ROUND' ], [ 'RECHERCHEV', 'RECHERCHEV(valeur; table; colonne; FAUX)', 'Recherche verticale', 'VLOOKUP' ], [ 'PRODUIT', 'PRODUIT(plage)', 'Multiplie les nombres', 'PRODUCT' ], [ 'SOMME.SI', 'SOMME.SI(plage; critère; [plage_somme])', 'Somme conditionnelle', 'SUMIF' ], [ 'SOMME.SI.ENS', 'SOMME.SI.ENS(plage_somme; plage1; critère1; …)', 'Somme multicritère', 'SUMIFS' ], [ 'SOMMEPROD', 'SOMMEPROD(plage1; plage2)', 'Somme des produits', 'SUMPRODUCT' ], [ 'ARRONDI.SUP', 'ARRONDI.SUP(nombre; décimales)', 'Arrondit vers le haut', 'ROUNDUP' ], [ 'ARRONDI.INF', 'ARRONDI.INF(nombre; décimales)', 'Arrondit vers le bas', 'ROUNDDOWN' ], [ 'ENT', 'ENT(nombre)', 'Partie entière', 'INT' ], [ 'ABS', 'ABS(nombre)', 'Valeur absolue', 'ABS' ], [ 'RACINE', 'RACINE(nombre)', 'Racine carrée', 'SQRT' ], [ 'PUISSANCE', 'PUISSANCE(nombre; exposant)', 'Élève à une puissance', 'POWER' ], [ 'MOD', 'MOD(nombre; diviseur)', 'Reste de la division', 'MOD' ], [ 'ALEA', 'ALEA()', 'Nombre aléatoire entre 0 et 1', 'RAND' ], [ 'ALEA.ENTRE.BORNES', 'ALEA.ENTRE.BORNES(min; max)', 'Entier aléatoire', 'RANDBETWEEN' ], [ 'PI', 'PI()', 'Valeur de π', 'PI' ], [ 'PLAFOND', 'PLAFOND(nombre; multiple)', 'Arrondit au multiple supérieur', 'CEILING' ], [ 'PLANCHER', 'PLANCHER(nombre; multiple)', 'Arrondit au multiple inférieur', 'FLOOR' ], [ 'NBVAL', 'NBVAL(plage)', 'Compte les cellules non vides', 'COUNTA' ], [ 'NB.VIDE', 'NB.VIDE(plage)', 'Compte les cellules vides', 'COUNTBLANK' ], [ 'NB.SI', 'NB.SI(plage; critère)', 'Compte selon un critère', 'COUNTIF' ], [ 'NB.SI.ENS', 'NB.SI.ENS(plage1; critère1; …)', 'Compte multicritère', 'COUNTIFS' ], [ 'MOYENNE.SI', 'MOYENNE.SI(plage; critère; [plage_moyenne])', 'Moyenne conditionnelle', 'AVERAGEIF' ], [ 'MEDIANE', 'MEDIANE(plage)', 'Valeur médiane', 'MEDIAN' ], [ 'ECARTYPE', 'ECARTYPE(plage)', 'Écart type (échantillon)', 'STDEV' ], [ 'GRANDE.VALEUR', 'GRANDE.VALEUR(plage; k)', 'k-ième plus grande valeur', 'LARGE' ], [ 'PETITE.VALEUR', 'PETITE.VALEUR(plage; k)', 'k-ième plus petite valeur', 'SMALL' ], [ 'RANG', 'RANG(nombre; plage; [ordre])', 'Rang d’une valeur', 'RANK' ], [ 'MAX.SI.ENS', 'MAX.SI.ENS(plage_max; plage1; critère1)', 'Maximum conditionnel', 'MAXIFS' ], [ 'MIN.SI.ENS', 'MIN.SI.ENS(plage_min; plage1; critère1)', 'Minimum conditionnel', 'MINIFS' ], [ 'ET', 'ET(test1; test2; …)', 'VRAI si tous les tests sont vrais', 'AND' ], [ 'OU', 'OU(test1; test2; …)', 'VRAI si au moins un test est vrai', 'OR' ], [ 'NON', 'NON(test)', 'Inverse un test', 'NOT' ], [ 'SIERREUR', 'SIERREUR(valeur; si_erreur)', 'Valeur de remplacement en cas d’erreur', 'IFERROR' ], [ 'SI.CONDITIONS', 'SI.CONDITIONS(test1; valeur1; …)', 'Plusieurs conditions', 'IFS' ], [ 'ESTVIDE', 'ESTVIDE(cellule)', 'VRAI si la cellule est vide', 'ISBLANK' ], [ 'ESTNUM', 'ESTNUM(valeur)', 'VRAI si c’est un nombre', 'ISNUMBER' ], [ 'ESTERREUR', 'ESTERREUR(valeur)', 'VRAI si c’est une erreur', 'ISERROR' ], [ 'CONCATENER', 'CONCATENER(texte1; texte2; …)', 'Assemble des textes', 'CONCATENATE' ], [ 'JOINDRE.TEXTE', 'JOINDRE.TEXTE(séparateur; ignorer_vides; plage)', 'Assemble avec séparateur', 'TEXTJOIN' ], [ 'GAUCHE', 'GAUCHE(texte; n)', 'Premiers caractères', 'LEFT' ], [ 'DROITE', 'DROITE(texte; n)', 'Derniers caractères', 'RIGHT' ], [ 'STXT', 'STXT(texte; début; n)', 'Extrait une partie du texte', 'MID' ], [ 'NBCAR', 'NBCAR(texte)', 'Nombre de caractères', 'LEN' ], [ 'MAJUSCULE', 'MAJUSCULE(texte)', 'Met en majuscules', 'UPPER' ], [ 'MINUSCULE', 'MINUSCULE(texte)', 'Met en minuscules', 'LOWER' ], [ 'NOMPROPRE', 'NOMPROPRE(texte)', 'Première lettre en majuscule', 'PROPER' ], [ 'SUPPRESPACE', 'SUPPRESPACE(texte)', 'Supprime les espaces superflus', 'TRIM' ], [ 'SUBSTITUE', 'SUBSTITUE(texte; ancien; nouveau)', 'Remplace un texte', 'SUBSTITUTE' ], [ 'TROUVE', 'TROUVE(cherché; texte)', 'Position (sensible à la casse)', 'FIND' ], [ 'CHERCHE', 'CHERCHE(cherché; texte)', 'Position (insensible à la casse)', 'SEARCH' ], [ 'TEXTE', 'TEXTE(valeur; "format")', 'Met en forme un nombre', 'TEXT' ], [ 'CNUM', 'CNUM(texte)', 'Convertit un texte en nombre', 'VALUE' ], [ 'AUJOURDHUI', 'AUJOURDHUI()', 'Date du jour', 'TODAY' ], [ 'MAINTENANT', 'MAINTENANT()', 'Date et heure actuelles', 'NOW' ], [ 'DATE', 'DATE(année; mois; jour)', 'Construit une date', 'DATE' ], [ 'ANNEE', 'ANNEE(date)', 'Année d’une date', 'YEAR' ], [ 'MOIS', 'MOIS(date)', 'Mois d’une date', 'MONTH' ], [ 'JOUR', 'JOUR(date)', 'Jour d’une date', 'DAY' ], [ 'JOURSEM', 'JOURSEM(date; [type])', 'Jour de la semaine', 'WEEKDAY' ], [ 'DATEDIF', 'DATEDIF(début; fin; "Y")', 'Écart entre deux dates', 'DATEDIF' ], [ 'MOIS.DECALER', 'MOIS.DECALER(date; mois)', 'Ajoute des mois', 'EDATE' ], [ 'FIN.MOIS', 'FIN.MOIS(date; mois)', 'Dernier jour du mois', 'EOMONTH' ], [ 'NB.JOURS.OUVRES', 'NB.JOURS.OUVRES(début; fin)', 'Jours ouvrés', 'NETWORKDAYS' ], [ 'NO.SEMAINE', 'NO.SEMAINE(date)', 'Numéro de semaine', 'WEEKNUM' ], [ 'RECHERCHEH', 'RECHERCHEH(valeur; table; ligne; FAUX)', 'Recherche horizontale', 'HLOOKUP' ], [ 'RECHERCHEX', 'RECHERCHEX(valeur; plage_cherchée; plage_résultat)', 'Recherche moderne', 'XLOOKUP' ], [ 'INDEX', 'INDEX(plage; ligne; colonne)', 'Valeur à une position', 'INDEX' ], [ 'EQUIV', 'EQUIV(valeur; plage; 0)', 'Position d’une valeur', 'MATCH' ], [ 'CHOISIR', 'CHOISIR(index; valeur1; valeur2; …)', 'Choisit parmi une liste', 'CHOOSE' ], [ 'LIGNE', 'LIGNE([cellule])', 'Numéro de ligne', 'ROW' ], [ 'COLONNE', 'COLONNE([cellule])', 'Numéro de colonne', 'COLUMN' ], [ 'VPM', 'VPM(taux; nb_périodes; va)', 'Mensualité d’un emprunt', 'PMT' ], [ 'VC', 'VC(taux; nb_périodes; vpm)', 'Valeur future', 'FV' ], [ 'VA', 'VA(taux; nb_périodes; vpm)', 'Valeur actuelle', 'PV' ], [ 'VAN', 'VAN(taux; flux1; flux2; …)', 'Valeur actuelle nette', 'NPV' ], [ 'TAUX', 'TAUX(nb_périodes; vpm; va)', 'Taux d’intérêt', 'RATE' ] ];
  const SUGGESTIONS = [];
  CATALOGUE.forEach((([fr, syn, info, en]) => {
    if (FONCTIONS[fr]) SUGGESTIONS.push({
      nom: fr,
      syn: syn,
      info: info
    });
    if (en && en !== fr && FONCTIONS[en]) SUGGESTIONS.push({
      nom: en,
      syn: syn.replace(fr, en),
      info: info
    });
  }));
  let graphiques = {
    maj() {}
  };
  const tableur = (() => {
    const grille = $('#ss-grid');
    if (!grille) return null;
    const enveloppe = $('#ss-wrap');
    const selBoite = $('#ss-sel');
    const editeur = $('#ss-ed');
    const entree = $('#ss-input');
    const refEl = $('#ss-ref');
    const ac = $('#ss-ac');
    const stat = $('#ss-stat');
    const graph = $('#ss-chart');
    const NC = 8, NL = 18;
    const LARG = [ 168, 96, 96, 96, 34, 128, 100, 90 ];
    const wb = new Classeur;
    const formats = {};
    const classes = {};
    const lignes = [ [ 'Logement', 750, 750 ], [ 'Courses', 350, 382 ], [ 'Transports', 120, 96 ], [ 'Énergie', 90, 104 ], [ 'Téléphone et internet', 45, 45 ], [ 'Loisirs', 150, 172 ], [ 'Épargne', 200, 200 ], [ 'Divers', 80, 61 ] ];
    const pose = (ref, v, cl = '', fmt = null) => {
      wb.brut.set(ref, String(v));
      if (cl) classes[ref] = cl;
      if (fmt) formats[ref] = fmt;
    };
    pose('A1', 'Budget mensuel', 'big');
    pose('A3', 'Catégorie', 'hdr');
    pose('B3', 'Prévu', 'hdr r');
    pose('C3', 'Réel', 'hdr r');
    pose('D3', 'Écart', 'hdr r');
    lignes.forEach((([nom, p, r], i) => {
      const l = 4 + i, alt = i % 2 ? ' alt' : '';
      pose('A' + l, nom, alt);
      pose('B' + l, p, 'r' + alt, 'eur');
      pose('C' + l, r, 'r' + alt, 'eur');
      pose('D' + l, `=B${l}-C${l}`, 'r' + alt, 'eur');
    }));
    pose('A12', 'Total', 'b tot');
    pose('B12', '=SOMME(B4:B11)', 'b tot r', 'eur');
    pose('C12', '=SOMME(C4:C11)', 'b tot r', 'eur');
    pose('D12', '=B12-C12', 'b tot r', 'eur');
    pose('F3', 'Revenus', 'b');
    pose('G3', 2100, 'r', 'eur');
    pose('F4', 'Reste à vivre', 'b');
    pose('G4', '=G3-C12', 'b r pos', 'eur');
    pose('F5', 'Taux d’épargne', 'b');
    pose('G5', '=C10/G3', 'r', 'pct');
    const original = new Map(wb.brut);
    const cg = document.createElement('colgroup');
    cg.innerHTML = `<col style="width:36px">` + LARG.map((w => `<col style="width:${w}px">`)).join('');
    const tete = document.createElement('thead');
    tete.innerHTML = '<tr><th></th>' + LARG.map(((_, c) => `<th>${colNom(c)}</th>`)).join('') + '</tr>';
    const corps = document.createElement('tbody');
    const cellules = [];
    for (let r = 0; r < NL; r++) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<th>${r + 1}</th>`;
      const l = [];
      for (let c = 0; c < NC; c++) {
        const td = document.createElement('td');
        td.dataset.c = c;
        td.dataset.r = r;
        tr.append(td);
        l.push(td);
      }
      corps.append(tr);
      cellules.push(l);
    }
    grille.append(cg, tete, corps);
    grille.style.width = 36 + LARG.reduce(((a, b) => a + b), 0) + 'px';
    const tetesCol = $$('thead th', grille).slice(1);
    const tetesLig = $$('tbody th', grille);
    function afficher(v, fmt) {
      if (v instanceof Erreur) return v.err;
      if (v === null || v === undefined) return '';
      if (typeof v === 'boolean') return v ? 'VRAI' : 'FAUX';
      if (typeof v === 'number') {
        if (!isFinite(v)) return '#NOMBRE!';
        if (fmt === 'eur') return eur.format(v);
        if (fmt === 'pct') return pct.format(v);
        return general.format(v);
      }
      return v;
    }
    const precedent = new Map;
    function recalculer(eclair = true) {
      const t0 = performance.now();
      wb.cache.clear();
      for (let r = 0; r < NL; r++) for (let c = 0; c < NC; c++) {
        const ref = refNom(c, r), td = cellules[r][c];
        const v = wb.valeur(c, r);
        const brut = wb.lire(ref);
        let fmt = formats[ref];
        if (!fmt && brut && brut[0] !== '=') fmt = /%\s*$/.test(brut) ? 'pct' : /€\s*$/.test(brut) ? 'eur' : null;
        const txt = afficher(v, fmt);
        let cl = classes[ref] || '';
        if (typeof v === 'number' && !/\br\b/.test(cl)) cl += ' r';
        if (v instanceof Erreur) cl += ' err';
        if (ref[0] === 'D' && ref !== 'D3' && typeof v === 'number' && v < 0) cl += ' neg';
        if (ref === 'G4' && typeof v === 'number' && v < 0) cl = cl.replace('pos', 'neg');
        td.className = cl.trim();
        if (td.textContent !== txt) {
          td.textContent = txt;
          if (eclair && precedent.has(ref) && !reduit) {
            td.classList.remove('flash');
            void td.offsetWidth;
            td.classList.add('flash');
          }
        }
        precedent.set(ref, txt);
      }
      const ms = performance.now() - t0;
      stat.textContent = `Recalculé en ${general.format(Math.max(.1, Math.round(ms * 10) / 10))} ms`;
      majGraphique();
      graphiques.maj();
    }
    const plot = $('#ss-chart-plot');
    plot.innerHTML = lignes.map((([nom]) => `<div class="sc-g"><i class="p"></i><i class="r"></i><span>${nom.split(' ')[0].slice(0, 9)}</span></div>`)).join('');
    const barres = $$('.sc-g', plot);
    function majGraphique() {
      const vals = lignes.map(((_, i) => [ wb.valeur(1, 3 + i), wb.valeur(2, 3 + i) ].map((v => typeof v === 'number' ? Math.max(0, v) : 0))));
      const max = Math.max(1, ...vals.flat());
      barres.forEach(((g, i) => {
        g.children[0].style.setProperty('--v', vals[i][0] / max);
        g.children[1].style.setProperty('--v', vals[i][1] / max);
      }));
    }
    function placerGraphique() {
      const td = cellules[6][5];
      graph.style.left = grille.offsetLeft + td.offsetLeft + 6 + 'px';
      graph.style.top = grille.offsetTop + td.offsetTop + 4 + 'px';
      graph.style.width = LARG[5] + LARG[6] + LARG[7] - 12 + 'px';
    }
    let sel = [ 2, 4 ];
    let edition = null;
    const historique = [];
    const refaire = [];
    function placerSelection(defiler = true) {
      const [c, r] = sel, td = cellules[r][c];
      const x = grille.offsetLeft + td.offsetLeft, y = grille.offsetTop + td.offsetTop;
      selBoite.style.transform = `translate(${x - 1}px, ${y - 1}px)`;
      selBoite.style.width = td.offsetWidth + 1 + 'px';
      selBoite.style.height = td.offsetHeight + 1 + 'px';
      tetesCol.forEach(((h, i) => h.classList.toggle('hl', i === c)));
      tetesLig.forEach(((h, i) => h.classList.toggle('hl', i === r)));
      refEl.textContent = refNom(c, r);
      if (document.activeElement !== entree) entree.value = wb.lire(refNom(c, r));
      if (defiler) {
        const gauche = x - 36, droite = x + td.offsetWidth, haut = y - 24, bas = y + td.offsetHeight;
        if (gauche < enveloppe.scrollLeft) enveloppe.scrollLeft = gauche; else if (droite > enveloppe.scrollLeft + enveloppe.clientWidth) enveloppe.scrollLeft = droite - enveloppe.clientWidth;
        if (haut < enveloppe.scrollTop) enveloppe.scrollTop = haut; else if (bas > enveloppe.scrollTop + enveloppe.clientHeight) enveloppe.scrollTop = bas - enveloppe.clientHeight;
      }
    }
    function choisir(c, r) {
      if (edition) valider(false);
      sel = [ borne(c, 0, NC - 1), borne(r, 0, NL - 1) ];
      placerSelection();
    }
    function ouvrir(initial = null) {
      const [c, r] = sel, td = cellules[r][c];
      edition = {
        ref: refNom(c, r),
        avant: wb.lire(refNom(c, r))
      };
      editeur.hidden = false;
      editeur.style.left = grille.offsetLeft + td.offsetLeft - 1 + 'px';
      editeur.style.top = grille.offsetTop + td.offsetTop - 1 + 'px';
      editeur.style.width = Math.max(td.offsetWidth + 2, 140) + 'px';
      editeur.style.height = td.offsetHeight + 2 + 'px';
      editeur.value = initial !== null ? initial : edition.avant;
      entree.value = editeur.value;
      editeur.focus({
        preventScroll: true
      });
      editeur.setSelectionRange(editeur.value.length, editeur.value.length);
      suggerer(editeur);
    }
    function valider(deplacer = true, dc = 0, dr = 1, source = editeur) {
      if (!edition) return;
      const v = source.value.trim();
      if (v !== edition.avant) {
        historique.push({
          ref: edition.ref,
          avant: edition.avant
        });
        refaire.length = 0;
        wb.ecrire(edition.ref, v);
      }
      edition = null;
      editeur.hidden = true;
      ac.hidden = true;
      recalculer();
      enveloppe.focus({
        preventScroll: true
      });
      if (deplacer) {
        sel = [ borne(sel[0] + dc, 0, NC - 1), borne(sel[1] + dr, 0, NL - 1) ];
      }
      placerSelection();
    }
    function annulerEdition() {
      if (!edition) return;
      edition = null;
      editeur.hidden = true;
      ac.hidden = true;
      entree.value = wb.lire(refNom(...sel));
      enveloppe.focus({
        preventScroll: true
      });
    }
    let choixAc = 0, listeAc = [], champAc = null;
    function suggerer(champ) {
      const v = champ.value.slice(0, champ.selectionEnd ?? champ.value.length);
      const m = v[0] === '=' ? /(?:^=|[(;+\-*/^&=<>:,\s])([A-Za-zÀ-ÿ.]{1,})$/.exec(v) : null;
      if (!m) {
        ac.hidden = true;
        listeAc = [];
        return;
      }
      const q = m[1].toUpperCase();
      listeAc = SUGGESTIONS.filter((s => s.nom.startsWith(q))).slice(0, 7);
      if (!listeAc.length) {
        ac.hidden = true;
        return;
      }
      champAc = champ;
      choixAc = 0;
      ac.innerHTML = listeAc.map(((s, i) => `<li role="option" aria-selected="${i === 0}" data-i="${i}"><b>${s.syn}</b><small>${s.info}</small></li>`)).join('');
      ac.hidden = false;
    }
    function accepter() {
      const s = listeAc[choixAc];
      const champ = champAc;
      const fin = champ.selectionEnd ?? champ.value.length;
      const avant = champ.value.slice(0, fin).replace(/[A-Za-zÀ-ÿ.]+$/, s.nom + '(');
      champ.value = avant + champ.value.slice(fin);
      champ.setSelectionRange(avant.length, avant.length);
      ac.hidden = true;
      (champ === editeur ? entree : editeur).value = champ.value;
    }
    ac.addEventListener('mousedown', (e => {
      e.preventDefault();
      const li = e.target.closest('li');
      if (li) {
        choixAc = Number(li.dataset.i);
        accepter();
      }
    }));
    function clavierAc(e) {
      if (ac.hidden) return false;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        choixAc = (choixAc + (e.key === 'ArrowDown' ? 1 : -1) + listeAc.length) % listeAc.length;
        $$('li', ac).forEach(((li, i) => li.setAttribute('aria-selected', i === choixAc)));
        return true;
      }
      if (e.key === 'Tab' || e.key === 'Enter' && listeAc.length) {
        e.preventDefault();
        accepter();
        return true;
      }
      if (e.key === 'Escape') {
        ac.hidden = true;
        e.stopPropagation();
        return true;
      }
      return false;
    }
    editeur.addEventListener('input', (() => {
      entree.value = editeur.value;
      suggerer(editeur);
    }));
    editeur.addEventListener('keydown', (e => {
      if (clavierAc(e)) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        valider(true, 0, e.shiftKey ? -1 : 1);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        valider(true, e.shiftKey ? -1 : 1, 0);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        annulerEdition();
      }
    }));
    editeur.addEventListener('blur', (() => setTimeout((() => {
      if (edition && document.activeElement !== entree && document.activeElement !== editeur) valider(false);
    }), 120)));
    entree.addEventListener('focus', (() => {
      if (!edition) {
        edition = {
          ref: refNom(...sel),
          avant: wb.lire(refNom(...sel))
        };
        editeur.value = entree.value;
      }
    }));
    entree.addEventListener('input', (() => {
      editeur.value = entree.value;
      suggerer(entree);
    }));
    entree.addEventListener('keydown', (e => {
      if (clavierAc(e)) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        valider(true, 0, 1, entree);
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        annulerEdition();
      }
    }));
    entree.addEventListener('blur', (() => setTimeout((() => {
      if (edition && document.activeElement !== editeur && document.activeElement !== entree) valider(false, 0, 0, entree);
    }), 120)));
    $('#ss-ok').addEventListener('mousedown', (e => e.preventDefault()));
    $('#ss-ok').addEventListener('click', (() => {
      if (edition) valider(false, 0, 0, document.activeElement === entree ? entree : editeur);
    }));
    $('#ss-sum').addEventListener('mousedown', (e => e.preventDefault()));
    $('#ss-sum').addEventListener('click', (() => {
      const [c, r] = sel;
      if (!wb.lire(refNom(c, r))) {
        let h = r - 1;
        while (h >= 0 && typeof wb.valeur(c, h) === 'number') h--;
        if (h < r - 1) {
          ouvrir(`=SOMME(${refNom(c, h + 1)}:${refNom(c, r - 1)})`);
          return;
        }
        let g = c - 1;
        while (g >= 0 && typeof wb.valeur(g, r) === 'number') g--;
        if (g < c - 1) {
          ouvrir(`=SOMME(${refNom(g + 1, r)}:${refNom(c - 1, r)})`);
          return;
        }
      }
      ouvrir('=SOMME(');
    }));
    function rejouer(depuis, vers) {
      if (edition) annulerEdition();
      const h = depuis.pop();
      if (!h) return;
      vers.push({
        ref: h.ref,
        avant: wb.lire(h.ref)
      });
      wb.ecrire(h.ref, h.avant);
      sel = lireRef(h.ref);
      recalculer();
      placerSelection();
    }
    $('#ss-undo').addEventListener('click', (() => rejouer(historique, refaire)));
    $('#ss-redo')?.addEventListener('click', (() => rejouer(refaire, historique)));
    let derniereTouche = null;
    enveloppe.addEventListener('pointerdown', (e => {
      const td = e.target.closest('td');
      if (!td) return;
      const c = Number(td.dataset.c), r = Number(td.dataset.r);
      if (e.pointerType !== 'mouse' && derniereTouche === `${c},${r}` && !edition) {
        ouvrir();
        e.preventDefault();
        return;
      }
      derniereTouche = `${c},${r}`;
      choisir(c, r);
      if (e.pointerType === 'mouse') {
        e.preventDefault();
        enveloppe.focus({
          preventScroll: true
        });
      }
    }));
    enveloppe.addEventListener('dblclick', (e => {
      if (e.target.closest('td')) ouvrir();
    }));
    enveloppe.addEventListener('keydown', (e => {
      if (edition || e.target !== enveloppe) return;
      const [c, r] = sel;
      const fl = {
        ArrowUp: [ 0, -1 ],
        ArrowDown: [ 0, 1 ],
        ArrowLeft: [ -1, 0 ],
        ArrowRight: [ 1, 0 ],
        Tab: [ e.shiftKey ? -1 : 1, 0 ]
      }[e.key];
      if (fl) {
        e.preventDefault();
        choisir(c + fl[0], r + fl[1]);
        return;
      }
      if (e.key === 'Enter' || e.key === 'F2') {
        e.preventDefault();
        ouvrir();
        return;
      }
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        const ref = refNom(c, r);
        if (wb.lire(ref)) {
          historique.push({
            ref: ref,
            avant: wb.lire(ref)
          });
          refaire.length = 0;
          wb.ecrire(ref, '');
          recalculer();
          placerSelection();
        }
        return;
      }
      if ((e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === 'y' || e.key.toLowerCase() === 'z' && e.shiftKey)) {
        e.preventDefault();
        rejouer(refaire, historique);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        rejouer(historique, refaire);
        return;
      }
      if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        ouvrir(e.key);
      }
    }));
    recalculer(false);
    const relayout = () => {
      placerGraphique();
      placerSelection(false);
    };
    new ResizeObserver(relayout).observe(enveloppe);
    relayout();
    return {
      reels: () => lignes.map(((l, i) => ({
        nom: l[0],
        prevu: wb.valeur(1, 3 + i),
        reel: wb.valeur(2, 3 + i)
      }))),
      reinitialiser() {
        wb.brut = new Map(original);
        recalculer(false);
      }
    };
  })();
  (() => {
    const r1 = $('#ruban-1'), r2 = $('#ruban-2'), tip = $('#fn-tip');
    if (!r1) return;
    const moitie = Math.ceil(CATALOGUE.length / 2);
    const puce = ([fr, , , en], focus) => `<button type="button" class="fn" data-fr="${fr}"${focus ? '' : ' tabindex="-1"'}>${fr}${en && en !== fr ? `<small>${en}</small>` : ''}</button>`;
    const remplir = (el, liste, focus) => {
      el.innerHTML = liste.map((x => puce(x, focus))).join('') + liste.map((x => puce(x, false))).join('');
    };
    remplir(r1, CATALOGUE.slice(0, moitie), true);
    remplir(r2, CATALOGUE.slice(moitie), false);
    const info = Object.fromEntries(CATALOGUE.map((([fr, syn, txt]) => [ fr, [ syn, txt ] ])));
    const montrer = b => {
      const [syn, txt] = info[b.dataset.fr];
      tip.innerHTML = `<b>${syn}</b> — ${txt}`;
    };
    const rubans = [ {
      el: r1,
      x: 0,
      dir: -1,
      pause: 0,
      cible: 1
    }, {
      el: r2,
      x: 0,
      dir: 1,
      pause: 0,
      cible: 1
    } ];
    rubans.forEach((rb => {
      rb.el.addEventListener('pointerover', (e => {
        const b = e.target.closest('.fn');
        if (b) {
          rb.cible = 0;
          montrer(b);
        }
      }));
      rb.el.addEventListener('pointerleave', (() => {
        rb.cible = 1;
      }));
      rb.el.addEventListener('focusin', (e => {
        const b = e.target.closest('.fn');
        if (!b) return;
        rb.cible = 0;
        rb.pause = 0;
        montrer(b);
        const vue = rb.el.parentElement.clientWidth, pos = rb.x + b.offsetLeft;
        if (pos < 16 || pos + b.offsetWidth > vue - 16) {
          rb.x = borne(vue / 2 - b.offsetWidth / 2 - b.offsetLeft, -rb.el.scrollWidth / 2, 0);
          rb.el.style.transform = `translate3d(${rb.x}px, 0, 0)`;
        }
      }));
      rb.el.addEventListener('focusout', (() => {
        rb.cible = 1;
      }));
      rb.el.addEventListener('click', (e => {
        const b = e.target.closest('.fn');
        if (b) montrer(b);
      }));
    }));
    tip.innerHTML = '<b>SOMME(plage)</b> — Additionne les nombres';
    if (reduit) return;
    let actif = false, t0 = 0;
    const zone = r1.closest('.fonctions');
    const boucle = t => {
      if (!actif) return;
      const dt = Math.min(50, t - (t0 || t)) / 1e3;
      t0 = t;
      for (const rb of rubans) {
        rb.pause = lerp(rb.pause, rb.cible, .08);
        const largeur = rb.el.scrollWidth / 2;
        rb.x += rb.dir * (34 + Math.min(600, Math.abs(vitesse) * 18)) * rb.pause * dt;
        if (rb.x <= -largeur) rb.x += largeur;
        if (rb.x > 0) rb.x -= largeur;
        rb.el.style.transform = `translate3d(${rb.x}px, 0, 0)`;
      }
      vitesse *= .94;
      requestAnimationFrame(boucle);
    };
    rubans[1].x = -r2.scrollWidth / 4;
    zone.addEventListener('portee:entree', (() => {
      if (!actif) {
        actif = true;
        t0 = 0;
        requestAnimationFrame(boucle);
      }
    }));
    zone.addEventListener('portee:sortie', (() => {
      actif = false;
    }));
  })();
  graphiques = (() => {
    const svg = $('#ch-svg');
    if (!svg) return {
      maj() {}
    };
    const COUL = [ '#2e70eb', '#1a9e5c', '#e86b2b', '#8e44ad', '#f2b134', '#0b8bb5', '#e5484d', '#7f8c8d' ];
    const W = 520, H = 300, G = 46, D = 16, HT = 16, B = 40;
    let type = 'colonnes';
    let signature = '';
    const court = s => s.length > 9 ? s.split(' ')[0].slice(0, 9) : s;
    function dessiner() {
      const data = (tableur ? tableur.reels() : []).map((d => ({
        nom: d.nom,
        p: typeof d.prevu === 'number' ? d.prevu : 0,
        v: typeof d.reel === 'number' ? Math.max(0, d.reel) : 0
      })));
      const sig = type + JSON.stringify(data);
      if (sig === signature) return;
      signature = sig;
      const max = Math.max(1, ...data.map((d => Math.max(d.v, d.p))));
      const pas = max > 500 ? 200 : max > 200 ? 100 : 50;
      const haut = Math.ceil(max / pas) * pas;
      const pw = W - G - D, ph = H - HT - B;
      const yv = v => HT + ph - v / haut * ph;
      let s = '';
      const axesY = () => {
        let a = '';
        for (let v = 0; v <= haut; v += pas) a += `<line class="cg-axis" x1="${G}" x2="${W - D}" y1="${yv(v)}" y2="${yv(v)}"/><text x="${G - 8}" y="${yv(v) + 4}" text-anchor="end">${nombre.format(v)}</text>`;
        return a;
      };
      if (type === 'colonnes' || type === 'lignes' || type === 'aires') {
        s += axesY();
        const bw = pw / data.length;
        data.forEach(((d, i) => {
          s += `<text x="${G + bw * i + bw / 2}" y="${H - B + 18}" text-anchor="middle">${court(d.nom)}</text>`;
        }));
        if (type === 'colonnes') {
          data.forEach(((d, i) => {
            const h = ph - (yv(d.v) - HT);
            s += `<rect class="cg-bar v" style="--i:${i}" x="${G + bw * i + bw * .2}" y="${yv(d.v)}" width="${bw * .6}" height="${Math.max(0, h)}" rx="4" fill="${COUL[i]}"><title>${d.nom} : ${eur.format(d.v)}</title></rect>`;
          }));
        } else {
          const pts = data.map(((d, i) => [ G + bw * i + bw / 2, yv(d.v) ]));
          const ligne = pts.map(((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1))).join('');
          if (type === 'aires') s += `<defs><linearGradient id="cgA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a9e5c" stop-opacity=".45"/><stop offset="1" stop-color="#1a9e5c" stop-opacity="0"/></linearGradient></defs><path class="cg-area" d="${ligne}L${pts.at(-1)[0]} ${yv(0)}L${pts[0][0]} ${yv(0)}Z" fill="url(#cgA)"/>`;
          s += `<path class="cg-line" pathLength="1" d="${ligne}" stroke="${type === 'aires' ? '#1a9e5c' : '#2e70eb'}"/>`;
          pts.forEach(((p, i) => {
            s += `<circle class="cg-dot" style="--i:${i}" cx="${p[0]}" cy="${p[1]}" r="5" fill="#fff" stroke="${type === 'aires' ? '#1a9e5c' : '#2e70eb'}" stroke-width="3"><title>${data[i].nom} : ${eur.format(data[i].v)}</title></circle>`;
          }));
        }
      } else if (type === 'barres') {
        const lg = 120, bh = (H - HT - 20) / data.length;
        const xv = v => lg + v / haut * (W - lg - D - 50);
        data.forEach(((d, i) => {
          const y = HT + bh * i;
          s += `<text x="${lg - 10}" y="${y + bh / 2 + 4}" text-anchor="end">${d.nom.length > 16 ? d.nom.slice(0, 15) + '…' : d.nom}</text>`;
          s += `<rect class="cg-bar h" style="--i:${i}" x="${lg}" y="${y + bh * .18}" width="${Math.max(0, xv(d.v) - lg)}" height="${bh * .64}" rx="4" fill="${COUL[i]}"><title>${d.nom} : ${eur.format(d.v)}</title></rect>`;
          s += `<text x="${xv(d.v) + 6}" y="${y + bh / 2 + 4}" style="font-weight:600;fill:#30343f">${nombre.format(d.v)}</text>`;
        }));
      } else if (type === 'secteurs') {
        const total = data.reduce(((a, d) => a + d.v), 0) || 1;
        const cx = 150, cy = H / 2, r = 118;
        let a0 = -Math.PI / 2;
        data.forEach(((d, i) => {
          const a1 = a0 + d.v / total * Math.PI * 2;
          const grand = a1 - a0 > Math.PI ? 1 : 0;
          const p0 = [ cx + r * Math.cos(a0), cy + r * Math.sin(a0) ], p1 = [ cx + r * Math.cos(a1), cy + r * Math.sin(a1) ];
          if (d.v > 0) s += `<path class="cg-pie" style="--i:${i}" d="M${cx} ${cy}L${p0[0].toFixed(2)} ${p0[1].toFixed(2)}A${r} ${r} 0 ${grand} 1 ${p1[0].toFixed(2)} ${p1[1].toFixed(2)}Z" fill="${COUL[i]}" stroke="#fff" stroke-width="2"><title>${d.nom} : ${pct.format(d.v / total)}</title></path>`;
          a0 = a1;
        }));
        data.forEach(((d, i) => {
          s += `<rect x="310" y="${40 + i * 28}" width="12" height="12" rx="3" fill="${COUL[i]}"/><text x="330" y="${50 + i * 28}" style="fill:#30343f">${d.nom.length > 14 ? d.nom.slice(0, 13) + '…' : d.nom}</text><text x="505" y="${50 + i * 28}" text-anchor="end">${pct.format(d.v / total)}</text>`;
        }));
      } else {
        const xmax = Math.ceil(Math.max(...data.map((d => d.p)), 1) / pas) * pas;
        const xv = v => G + v / xmax * pw;
        s += axesY();
        for (let v = 0; v <= xmax; v += pas) s += `<text x="${xv(v)}" y="${H - B + 18}" text-anchor="middle">${nombre.format(v)}</text>`;
        s += `<line x1="${xv(0)}" y1="${yv(0)}" x2="${xv(Math.min(xmax, haut))}" y2="${yv(Math.min(xmax, haut))}" stroke="#b9bdc8" stroke-dasharray="5 5"/>`;
        s += `<text x="${W - D}" y="${H - 6}" text-anchor="end">Prévu →</text><text x="${G}" y="10">↑ Réel</text>`;
        data.forEach(((d, i) => {
          s += `<circle class="cg-dot" style="--i:${i}" cx="${xv(d.p)}" cy="${yv(d.v)}" r="8" fill="${COUL[i]}" fill-opacity=".85" stroke="#fff" stroke-width="2"><title>${d.nom} : prévu ${eur.format(d.p)}, réel ${eur.format(d.v)}</title></circle>`;
        }));
      }
      svg.innerHTML = s;
    }
    $$('#ch-type button').forEach((b => b.addEventListener('click', (() => {
      type = b.dataset.t;
      $$('#ch-type button').forEach((x => x.setAttribute('aria-checked', x === b)));
      dessiner();
    }))));
    let attente = 0;
    dessiner();
    return {
      maj() {
        clearTimeout(attente);
        attente = setTimeout(dessiner, 120);
      }
    };
  })();
  graphiques.maj();
  const THEMES = [ [ 'classique', 'Classique', 'FFFFFF', null, '1F2A44', '333B4D', '2F6FEB', 'E8692C', 'Avenir Next', 'Avenir Next' ], [ 'nuit', 'Nuit', '0F1424', '1C2540', 'FFFFFF', 'D5DBEA', '5B8CFF', 'FFB547', 'Avenir Next', 'Avenir Next' ], [ 'ocean', 'Océan', 'E8F4FA', 'C9E6F2', '08415C', '1F4E63', '0B8BB5', 'F25F5C', 'Gill Sans', 'Gill Sans' ], [ 'corail', 'Corail', 'FFF5F0', null, '7A2E1F', '4A3530', 'F2674A', '2A9D8F', 'Georgia', 'Helvetica Neue' ], [ 'foret', 'Forêt', '1E3B2F', '2C5242', 'F2EFE6', 'D9E4DC', 'A3C77D', 'F2C14E', 'Optima', 'Optima' ], [ 'minimal', 'Minimal', 'F7F7F5', null, '111111', '444444', '111111', 'B5B5B5', 'Helvetica Neue', 'Helvetica Neue' ], [ 'aurore', 'Aurore', '3A1C71', 'D76D77', 'FFFFFF', 'F6E9F2', 'FFAF7B', 'FFFFFF', 'Futura', 'Avenir Next' ], [ 'ardoise', 'Ardoise', '2B2D33', null, 'F5F5F5', 'C9CBD1', '1E9E5A', 'F0B429', 'Helvetica Neue', 'Helvetica Neue' ], [ 'papier', 'Papier', 'FBF7EF', null, '2D2A26', '4B463F', 'B5651D', '5C7A5C', 'Baskerville', 'Palatino' ], [ 'pop', 'Pop', 'FFE45E', null, '1B1B1B', '2B2B2B', 'FF5E78', '3A86FF', 'Futura', 'Avenir Next' ] ].map((([id, nom, bg, bg2, tt, tx, ac, ac2, ft, fb]) => ({
    id: id,
    nom: nom,
    bg: '#' + bg,
    bg2: '#' + (bg2 || bg),
    tt: '#' + tt,
    tx: '#' + tx,
    ac: '#' + ac,
    ac2: '#' + ac2,
    ft: ft,
    fb: fb
  })));
  const FORMES = {
    rect: '<rect x="0" y="0" width="100" height="100" rx="8"/>',
    barre: '<rect x="0" y="0" width="100" height="100" rx="50"/>',
    ellipse: '<ellipse cx="50" cy="50" rx="50" ry="50"/>',
    triangle: '<path d="M50 0 100 100H0z"/>',
    etoile: '<path d="m50 0 12 33 36 1-28 22 10 35-30-20-30 20 10-35L2 34l36-1z"/>',
    fleche: '<path d="M0 32h60V5l40 45-40 45V68H0z"/>',
    coeur: '<path d="M50 96 9 56C-6 41 3 12 26 10c11-1 19 5 24 13 5-8 13-14 24-13 23 2 32 31 17 46z"/>',
    bulle: '<path d="M10 0h80a10 10 0 0 1 10 10v56a10 10 0 0 1-10 10H40L16 98V76h-6A10 10 0 0 1 0 66V10A10 10 0 0 1 10 0z"/>'
  };
  const presentation = (() => {
    const app = $('#pr');
    if (!app) return;
    const navEl = $('#pr-nav'), canvas = $('#pr-canvas'), fit = $('#pr-fit'), slideEl = $('#pr-slide');
    const themesEl = $('#pr-themes'), notesEd = $('#pr-notes-ed'), suppr = $('#pr-del');
    let theme = THEMES[1];
    let transition = 'fondu';
    let courant = 0;
    let choisi = null;
    let uid = 0;
    const ob = (type, x, y, w, h, extra = {}) => ({
      id: ++uid,
      type: type,
      x: x,
      y: y,
      w: w,
      h: h,
      rot: 0,
      ...extra
    });
    const puces = l => `<ul>${l.map((t => `<li>${t}</li>`)).join('')}</ul>`;
    const diapos = [ {
      notes: 'Bonjour à tous. En une phrase : des ateliers du soir pour apprendre de ses mains, en petit groupe.',
      objets: [ ob('s', 80, 196, 96, 12, {
        forme: 'barre',
        fill: 'ac'
      }), ob('t', 80, 222, 760, 96, {
        html: 'Atelier Lumière',
        taille: 84
      }), ob('b', 80, 330, 760, 60, {
        html: 'Ateliers créatifs à Lyon, dès le 3 novembre',
        taille: 30
      }), ob('s', 700, 70, 170, 170, {
        forme: 'ellipse',
        fill: 'ac2',
        op: .9
      }) ]
    }, {
      notes: 'Ce que nous entendons depuis l’ouverture de la liste d’attente.',
      objets: [ ob('s', 80, 74, 64, 8, {
        forme: 'barre',
        fill: 'ac'
      }), ob('t', 80, 92, 800, 70, {
        html: 'Le constat',
        taille: 52
      }), ob('b', 80, 190, 760, 280, {
        html: puces([ 'Des cours complets des semaines à l’avance', 'Peu de créneaux après 19 h', 'Des groupes trop grands pour débuter' ]),
        taille: 30
      }) ]
    }, {
      notes: 'Montrer le planning de la première saison et le budget prévu.',
      objets: [ ob('s', 80, 74, 64, 8, {
        forme: 'barre',
        fill: 'ac'
      }), ob('t', 80, 92, 800, 70, {
        html: 'Notre offre',
        taille: 52
      }), ob('b', 80, 190, 560, 280, {
        html: puces([ 'Céramique, gravure et reliure', 'Groupes de 8, le soir et le samedi', 'Matériel et cuissons compris' ]),
        taille: 30
      }), ob('s', 690, 230, 190, 190, {
        forme: 'etoile',
        fill: 'ac2',
        rot: 12
      }) ]
    }, {
      notes: 'Insister sur les cycles : ils remplissent la saison à l’avance.',
      objets: [ ob('s', 80, 74, 64, 8, {
        forme: 'barre',
        fill: 'ac'
      }), ob('t', 80, 92, 800, 70, {
        html: 'Marché et modèle',
        taille: 52
      }), ob('h', 80, 190, 370, 44, {
        html: 'Marché',
        taille: 32
      }), ob('b', 80, 240, 370, 220, {
        html: puces([ 'Actifs de 25 à 45 ans', 'Comités d’entreprise' ]),
        taille: 26
      }), ob('h', 510, 190, 370, 44, {
        html: 'Modèle',
        taille: 32
      }), ob('b', 510, 240, 370, 220, {
        html: puces([ 'Cycles de 6 séances', 'Ateliers à la carte' ]),
        taille: 26
      }) ]
    }, {
      notes: 'Remercier, laisser l’adresse à l’écran pendant les questions.',
      objets: [ ob('t', 80, 190, 800, 110, {
        html: 'Merci&#8239;!',
        taille: 96,
        align: 'center'
      }), ob('b', 80, 316, 800, 50, {
        html: '12 rue des Lilas, Lyon 3e',
        taille: 30,
        align: 'center'
      }), ob('s', 452, 150, 56, 8, {
        forme: 'barre',
        fill: 'ac'
      }) ]
    } ];
    function appliquerTheme(el, th = theme) {
      el.style.setProperty('--bg', th.bg);
      el.style.setProperty('--bg2', th.bg2);
      el.style.setProperty('--tt', th.tt);
      el.style.setProperty('--tx', th.tx);
      el.style.setProperty('--ac', th.ac);
      el.style.setProperty('--ac2', th.ac2);
      el.style.setProperty('--ft', `"${th.ft}"`);
      el.style.setProperty('--fb', `"${th.fb}"`);
    }
    function objetHTML(o, edit) {
      const style = `left:${o.x}px;top:${o.y}px;width:${o.w}px;height:${o.h}px;--rot:${o.rot}deg;${o.taille ? `font-size:${o.taille}px;` : ''}${o.align ? `text-align:${o.align};` : ''}${o.op ? `opacity:${o.op};` : ''}`;
      const cls = {
        t: 'ob-t',
        b: 'ob-b',
        h: 'ob-h',
        s: 'ob-s'
      }[o.type];
      const contenu = o.type === 's' ? `<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="fill:var(--${o.fill})">${FORMES[o.forme]}</svg>` : o.html;
      const poignees = edit && choisi === o.id ? '<i class="hd nw" data-h="nw"></i><i class="hd ne" data-h="ne"></i><i class="hd sw" data-h="sw"></i><i class="hd se" data-h="se"></i><i class="hd rot" data-h="rot"></i>' : '';
      return `<div class="ob ${cls}${edit && choisi === o.id ? ' sel' : ''}" data-id="${o.id}" style="${style}">${contenu}${poignees}</div>`;
    }
    const rendreDiapo = (el, d, edit = false) => {
      appliquerTheme(el);
      el.innerHTML = d.objets.map((o => objetHTML(o, edit))).join('');
    };
    function vignettes() {
      navEl.innerHTML = diapos.map(((_, i) => `<li class="${i === courant ? 'on' : ''}"><button type="button" aria-label="Diapositive ${i + 1}"><span class="slide-fit"><span class="slide"></span></span></button></li>`)).join('');
      $$('li', navEl).forEach(((li, i) => {
        const b = $('button', li);
        b.addEventListener('click', (() => aller(i)));
        rendreVignette(i);
      }));
    }
    function rendreVignette(i) {
      const li = navEl.children[i];
      if (!li) return;
      const b = $('button', li), f = $('.slide-fit', li), s = $('.slide', li);
      const w = b.clientWidth || 96;
      const k = w / 960;
      f.style.width = w + 'px';
      f.style.height = 540 * k + 'px';
      s.style.setProperty('--k', k);
      rendreDiapo(s, diapos[i]);
    }
    let attenteVignette = 0;
    const majVignette = () => {
      clearTimeout(attenteVignette);
      attenteVignette = setTimeout((() => rendreVignette(courant)), 120);
    };
    themesEl.innerHTML = THEMES.map((t => `<button type="button" role="radio" class="th-b" aria-checked="${t === theme}" data-id="${t.id}" style="--tb:linear-gradient(135deg,${t.bg},${t.bg2});--tt:${t.tt};--ta:${t.ac};--ta2:${t.ac2};--tf:'${t.ft}',sans-serif"><span></span>${t.nom}</button>`)).join('');
    $$('.th-b', themesEl).forEach((b => b.addEventListener('click', (() => {
      theme = THEMES.find((t => t.id === b.dataset.id));
      $$('.th-b', themesEl).forEach((x => x.setAttribute('aria-checked', x === b)));
      appliquerTheme(slideEl);
      diapos.forEach(((_, i) => rendreVignette(i)));
    }))));
    $$('#pr-trans button').forEach((b => b.addEventListener('click', (() => {
      transition = b.dataset.tr;
      $$('#pr-trans button').forEach((x => x.setAttribute('aria-checked', x === b)));
    }))));
    let k = 1;
    function ajuster() {
      const cw = canvas.clientWidth - 2 * parseFloat(getComputedStyle(canvas).paddingLeft), ch = canvas.clientHeight - 2 * parseFloat(getComputedStyle(canvas).paddingTop);
      k = Math.max(.1, Math.min(cw / 960, ch / 540));
      fit.style.width = 960 * k + 'px';
      fit.style.height = 540 * k + 'px';
      slideEl.style.setProperty('--k', k);
      slideEl.style.setProperty('--ik', 1 / k);
    }
    function rendre() {
      rendreDiapo(slideEl, diapos[courant], true);
      suppr.disabled = !choisi;
    }
    function aller(i) {
      courant = i;
      choisi = null;
      $$('li', navEl).forEach(((li, j) => li.classList.toggle('on', j === i)));
      notesEd.textContent = diapos[i].notes;
      rendre();
      if (!reduit) {
        slideEl.animate([ {
          opacity: 0,
          transform: `scale(${k}) translateY(10px)`
        }, {
          opacity: 1,
          transform: `scale(${k})`
        } ], {
          duration: 380,
          easing: 'cubic-bezier(.22,.8,.24,1)'
        });
      }
    }
    slideEl.classList.add('ed');
    notesEd.contentEditable = 'true';
    notesEd.addEventListener('input', (() => {
      diapos[courant].notes = notesEd.textContent;
    }));
    let geste = null;
    let toucher = {
      id: 0,
      t: 0
    };
    const trouver = id => diapos[courant].objets.find((o => o.id === id));
    slideEl.addEventListener('pointerdown', (e => {
      const el = e.target.closest('.ob');
      if (el && el.isContentEditable) return;
      if (!el) {
        if (choisi) {
          choisi = null;
          rendre();
        }
        return;
      }
      const o = trouver(Number(el.dataset.id));
      const poignee = e.target.dataset.h;
      if (e.pointerType !== 'mouse' && !poignee) {
        const t = performance.now();
        if (toucher.id === o.id && t - toucher.t < 400 && editer(el)) {
          toucher = {
            id: 0,
            t: 0
          };
          e.preventDefault();
          return;
        }
        toucher = {
          id: o.id,
          t: t
        };
      }
      if (choisi !== o.id) {
        choisi = o.id;
        rendre();
      }
      const elNouveau = $(`.ob[data-id="${o.id}"]`, slideEl);
      e.preventDefault();
      slideEl.focus({
        preventScroll: true
      });
      try {
        slideEl.setPointerCapture(e.pointerId);
      } catch {}
      const rs = slideEl.getBoundingClientRect();
      const ech = rs.width / 960;
      geste = {
        o: o,
        el: elNouveau,
        poignee: poignee,
        x0: e.clientX,
        y0: e.clientY,
        depart: {
          ...o
        },
        ech: ech,
        rs: rs
      };
    }));
    slideEl.addEventListener('pointermove', (e => {
      if (!geste) return;
      const {o: o, depart: depart, ech: ech, poignee: poignee, rs: rs} = geste;
      const dx = (e.clientX - geste.x0) / ech, dy = (e.clientY - geste.y0) / ech;
      if (!poignee) {
        let x = depart.x + dx, y = depart.y + dy;
        if (Math.abs(x + o.w / 2 - 480) < 8) x = 480 - o.w / 2;
        if (Math.abs(y + o.h / 2 - 270) < 8) y = 270 - o.h / 2;
        o.x = Math.round(x);
        o.y = Math.round(y);
      } else if (poignee === 'rot') {
        const cx = rs.left + (o.x + o.w / 2) * ech, cy = rs.top + (o.y + o.h / 2) * ech;
        let a = Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI + 90;
        a = (a % 360 + 360) % 360;
        for (const v of [ 0, 90, 180, 270, 360 ]) if (Math.abs(a - v) < 5) a = v % 360;
        o.rot = Math.round(a);
      } else {
        const g = poignee.includes('w'), h = poignee.includes('n');
        const w = Math.max(30, depart.w + (g ? -dx : dx)), hh = Math.max(20, depart.h + (h ? -dy : dy));
        o.x = Math.round(g ? depart.x + depart.w - w : depart.x);
        o.y = Math.round(h ? depart.y + depart.h - hh : depart.y);
        o.w = Math.round(w);
        o.h = Math.round(hh);
      }
      Object.assign(geste.el.style, {
        left: o.x + 'px',
        top: o.y + 'px',
        width: o.w + 'px',
        height: o.h + 'px'
      });
      geste.el.style.setProperty('--rot', o.rot + 'deg');
    }));
    const finGeste = () => {
      if (geste) {
        geste = null;
        majVignette();
      }
    };
    slideEl.addEventListener('pointerup', finGeste);
    slideEl.addEventListener('pointercancel', finGeste);
    function editer(cible) {
      const o = trouver(Number(cible.dataset.id));
      if (!o || o.type === 's') return false;
      if (choisi !== o.id) {
        choisi = o.id;
        rendre();
      }
      const el = $(`.ob[data-id="${o.id}"]`, slideEl);
      $$('.hd', el).forEach((h => h.remove()));
      el.contentEditable = 'true';
      el.focus({
        preventScroll: true
      });
      const r = document.createRange();
      r.selectNodeContents(el);
      const s = getSelection();
      s.removeAllRanges();
      s.addRange(r);
      el.addEventListener('keydown', (e => {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          slideEl.focus({
            preventScroll: true
          });
        }
      }));
      el.addEventListener('blur', (() => {
        o.html = el.innerHTML;
        el.contentEditable = 'false';
        rendre();
        majVignette();
      }), {
        once: true
      });
      return true;
    }
    slideEl.addEventListener('dblclick', (e => {
      const sous = e.target.closest('.ob') || document.elementsFromPoint(e.clientX, e.clientY).find((x => x.classList?.contains('ob') && slideEl.contains(x)));
      if (sous && !sous.isContentEditable) editer(sous);
    }));
    app.addEventListener('keydown', (e => {
      if (!choisi || e.target !== slideEl) return;
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        supprimer();
      }
      const fl = {
        ArrowLeft: [ -1, 0 ],
        ArrowRight: [ 1, 0 ],
        ArrowUp: [ 0, -1 ],
        ArrowDown: [ 0, 1 ]
      }[e.key];
      if (fl) {
        e.preventDefault();
        const o = trouver(choisi);
        o.x += fl[0] * (e.shiftKey ? 10 : 2);
        o.y += fl[1] * (e.shiftKey ? 10 : 2);
        rendre();
        majVignette();
      }
    }));
    slideEl.tabIndex = 0;
    function supprimer() {
      const d = diapos[courant];
      const surBouton = document.activeElement === suppr;
      d.objets = d.objets.filter((o => o.id !== choisi));
      choisi = null;
      rendre();
      majVignette();
      if (surBouton) slideEl.focus({
        preventScroll: true
      });
    }
    suppr.addEventListener('click', supprimer);
    function ajouter(o) {
      diapos[courant].objets.push(o);
      choisi = o.id;
      rendre();
      $(`.ob[data-id="${o.id}"]`, slideEl)?.classList.add('pop-in');
      majVignette();
      slideEl.focus({
        preventScroll: true
      });
    }
    $('[data-add="texte"]', app).addEventListener('click', (() => ajouter(ob('b', 330, 240, 300, 60, {
      html: 'Nouveau texte',
      taille: 32,
      align: 'center'
    }))));
    popover($('#pr-shape-btn'), $('#pr-shapes'));
    $$('#pr-shapes [data-shape]').forEach(((b, i) => b.addEventListener('click', (() => {
      const f = b.dataset.shape;
      const [w, h] = f === 'fleche' ? [ 220, 120 ] : f === 'rect' ? [ 220, 150 ] : [ 170, 170 ];
      ajouter(ob('s', 480 - w / 2 + i % 3 * 14, 270 - h / 2, w, h, {
        forme: f,
        fill: i % 2 ? 'ac' : 'ac2'
      }));
    }))));
    new ResizeObserver((() => {
      ajuster();
    })).observe(canvas);
    new ResizeObserver((() => diapos.forEach(((_, i) => rendreVignette(i))))).observe(navEl);
    vignettes();
    ajuster();
    aller(0);
    const pres = $('#presenter'), scene = $('#ps-stage'), laser = $('#ps-laser'), numero = $('#ps-n'), chrono = $('#ps-time'), notesP = $('#ps-notes');
    let i = 0, ouvert = false, minuteur = 0, debut = 0, laserOn = false, revenir = null, actuelle = null;
    function taillePres() {
      const w = scene.clientWidth - 40, h = scene.clientHeight - 40;
      return Math.min(w / 960, h / 540);
    }
    function creer(n) {
      const f = document.createElement('div');
      f.className = 'slide-fit';
      const s = document.createElement('div');
      s.className = 'slide';
      f.append(s);
      const kk = taillePres();
      f.style.width = 960 * kk + 'px';
      f.style.height = 540 * kk + 'px';
      s.style.setProperty('--k', kk);
      rendreDiapo(s, diapos[n]);
      return f;
    }
    const ANIMS = {
      fondu: [ 'trFonduIn', 'trFonduOut' ],
      glisser: [ 'trGlisserIn', 'trGlisserOut' ],
      zoom: [ 'trZoomIn', 'trZoomOut' ]
    };
    function montrer(n, dir = 1) {
      n = borne(n, 0, diapos.length - 1);
      if (n === i && actuelle) return;
      const nouvelle = creer(n);
      const [ain, aout] = ANIMS[transition];
      if (actuelle && !reduit) {
        const ancienne = actuelle;
        ancienne.style.setProperty('--anim-out', aout);
        ancienne.style.setProperty('--dir', dir);
        ancienne.classList.add('out');
        ancienne.addEventListener('animationend', (() => ancienne.remove()), {
          once: true
        });
        nouvelle.style.setProperty('--anim', ain);
        nouvelle.style.setProperty('--dir', dir);
        nouvelle.classList.add('in');
      } else if (actuelle) actuelle.remove();
      scene.insertBefore(nouvelle, laser);
      actuelle = nouvelle;
      i = n;
      numero.textContent = `${i + 1} / ${diapos.length}`;
      notesP.textContent = diapos[i].notes;
    }
    function ouvrirPres() {
      revenir = document.activeElement;
      pres.hidden = false;
      ouvert = true;
      document.body.style.overflow = 'hidden';
      actuelle = null;
      $$('.slide-fit', scene).forEach((x => x.remove()));
      i = -1;
      montrer(courant);
      debut = Date.now();
      chrono.textContent = '0:00';
      minuteur = setInterval((() => {
        const s = Math.floor((Date.now() - debut) / 1e3);
        chrono.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
      }), 1e3);
      if (pres.requestFullscreen && !tactile) pres.requestFullscreen().catch((() => {}));
      $('#ps-next').focus();
    }
    function fermerPres() {
      if (!ouvert) return;
      ouvert = false;
      clearInterval(minuteur);
      if (document.fullscreenElement) document.exitFullscreen().catch((() => {}));
      pres.hidden = true;
      document.body.style.overflow = '';
      if (i >= 0) aller(i);
      revenir?.focus?.();
    }
    const basculerLaser = (v = !laserOn) => {
      laserOn = v;
      scene.classList.toggle('laser-on', v);
      $('#ps-laser-b').setAttribute('aria-pressed', v);
    };
    const basculerNotes = () => {
      const v = !pres.classList.contains('notes');
      pres.classList.toggle('notes', v);
      $('#ps-notes-b').setAttribute('aria-pressed', v);
      requestAnimationFrame(redim);
    };
    function redim() {
      if (!ouvert || !actuelle) return;
      const kk = taillePres();
      actuelle.style.width = 960 * kk + 'px';
      actuelle.style.height = 540 * kk + 'px';
      $('.slide', actuelle).style.setProperty('--k', kk);
    }
    $('#pr-play').addEventListener('click', ouvrirPres);
    $('#ps-close').addEventListener('click', fermerPres);
    $('#ps-prev').addEventListener('click', (() => montrer(i - 1, -1)));
    $('#ps-next').addEventListener('click', (() => montrer(i + 1, 1)));
    $('#ps-laser-b').addEventListener('click', (() => basculerLaser()));
    $('#ps-notes-b').addEventListener('click', basculerNotes);
    document.addEventListener('fullscreenchange', (() => {
      if (!document.fullscreenElement && ouvert && !tactile) fermerPres(); else redim();
    }));
    addEventListener('resize', redim);
    document.addEventListener('keydown', (e => {
      if (!ouvert) return;
      const surBouton = !!e.target.closest?.('button');
      if ([ 'ArrowRight', 'ArrowDown', 'PageDown' ].includes(e.key) || [ ' ', 'Enter' ].includes(e.key) && !surBouton) {
        e.preventDefault();
        montrer(i + 1, 1);
      } else if ([ 'ArrowLeft', 'ArrowUp', 'PageUp' ].includes(e.key)) {
        e.preventDefault();
        montrer(i - 1, -1);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        fermerPres();
      } else if (e.key.toLowerCase() === 'l') basculerLaser(); else if (e.key.toLowerCase() === 'n') basculerNotes(); else if (e.key === 'Tab') {
        const f = $$('button', pres);
        const idx = f.indexOf(document.activeElement);
        if (e.shiftKey && idx <= 0) {
          e.preventDefault();
          f.at(-1).focus();
        } else if (!e.shiftKey && idx === f.length - 1) {
          e.preventDefault();
          f[0].focus();
        }
      }
    }));
    let xDown = null;
    scene.addEventListener('pointermove', (e => {
      if (!laserOn) return;
      const r = scene.getBoundingClientRect();
      laser.style.transform = `translate3d(${e.clientX - r.left}px, ${e.clientY - r.top}px, 0)`;
    }));
    scene.addEventListener('pointerdown', (e => {
      xDown = [ e.clientX, e.clientY ];
    }));
    scene.addEventListener('pointerup', (e => {
      if (!xDown) return;
      const dx = e.clientX - xDown[0], dy = e.clientY - xDown[1];
      xDown = null;
      if (laserOn && e.pointerType === 'mouse') return;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) montrer(i + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1); else if (Math.abs(dx) < 8 && Math.abs(dy) < 8 && !laserOn) montrer(i + 1, 1);
    }));
  })();
  (() => {
    const boutons = $$('#ui-theme button');
    const fixer = v => {
      racine.dataset.ui = v;
      boutons.forEach((b => b.setAttribute('aria-checked', b.dataset.ui === v)));
      try {
        localStorage.setItem('triade.apercu', v);
      } catch {}
    };
    boutons.forEach((b => b.addEventListener('click', (() => fixer(b.dataset.ui)))));
    fixer(racine.dataset.ui || 'clair');
  })();
  (() => {
    const touches = Object.fromEntries($$('#keys .kc').map((k => [ k.dataset.k, k ])));
    const minuteurs = {};
    document.addEventListener('keydown', (e => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const k = touches[e.key.toLowerCase()];
      if (!k) return;
      k.classList.add('on');
      clearTimeout(minuteurs[e.key]);
      minuteurs[e.key] = setTimeout((() => k.classList.remove('on')), 450);
    }));
    $$('#keys .kc').forEach((k => k.addEventListener('pointerdown', (() => {
      k.classList.add('on');
      setTimeout((() => k.classList.remove('on')), 300);
    }))));
  })();
  (() => {
    const zoneFichiers = $('#fichiers'), zone = $('#depot-zone'), msg = $('#depot-msg');
    if (!zoneFichiers) return;
    const FICHIERS = [ [ 'Rapport annuel', 'docx' ], [ 'Budget 2027', 'xlsx' ], [ 'Pitch investisseurs', 'pptx' ], [ 'Compte rendu', 'odt' ], [ 'Ventes T3', 'ods' ], [ 'Formation', 'odp' ], [ 'Contrat signé', 'pdf' ], [ 'Relevé bancaire', 'csv' ], [ 'Mémoire', 'doc' ], [ 'Stocks 2004', 'xls' ], [ 'Notes', 'md' ], [ 'Lettre', 'rtf' ], [ 'Mesures', 'tsv' ], [ 'Article', 'html' ], [ 'Lisez-moi', 'txt' ], [ 'Budget privé', 'tlock' ] ];
    const TEXTE = [ 'docx', 'doc', 'odt', 'rtf', 'txt', 'md', 'html', 'pdf' ], TABLEUR = [ 'xlsx', 'xls', 'ods', 'csv', 'tsv', 'tlock' ];
    const genre = e => TEXTE.includes(e) ? 'texte' : TABLEUR.includes(e) ? 'tableur' : 'presentation';
    const COUL = {
      texte: '',
      tableur: 'vert',
      presentation: 'orange'
    };
    const NOM = {
      texte: 'Texte',
      tableur: 'Tableur',
      presentation: 'Présentation'
    };
    let restants = FICHIERS.length;
    function construire() {
      zoneFichiers.innerHTML = FICHIERS.map((([n, e]) => `<button type="button" class="fichier ${e === 'tlock' ? 'gris' : COUL[genre(e)]}" data-e="${e}" data-n="${n}"><i>.${e}</i>${n}</button>`)).join('');
      $$('.voie').forEach((v => {
        $('ul', v).innerHTML = '';
        $('em', v).textContent = '0';
      }));
      restants = FICHIERS.length;
      msg.textContent = 'ou cliquez un fichier';
      $$('.fichier', zoneFichiers).forEach(brancher);
    }
    function voler(depuis, vers, gabarit, fin) {
      const g = gabarit.cloneNode(true);
      g.classList.add('ghost');
      g.classList.remove('used');
      document.body.append(g);
      const a = depuis, b = vers.getBoundingClientRect();
      g.style.width = a.width + 'px';
      g.style.transform = `translate(${a.left}px, ${a.top}px)`;
      if (reduit) {
        g.remove();
        fin();
        return;
      }
      const anim = g.animate([ {
        transform: `translate(${a.left}px, ${a.top}px) scale(1)`,
        opacity: 1
      }, {
        transform: `translate(${(a.left + b.left) / 2}px, ${Math.min(a.top, b.top) - 60}px) scale(1.05)`,
        opacity: 1,
        offset: .45
      }, {
        transform: `translate(${b.left + 8}px, ${b.top + 30}px) scale(.6)`,
        opacity: 0
      } ], {
        duration: 750,
        easing: 'cubic-bezier(.65,0,.35,1)'
      });
      anim.onfinish = () => {
        g.remove();
        fin();
      };
    }
    async function router(btn, rect) {
      if (btn.classList.contains('used')) return;
      btn.classList.add('used');
      const e = btn.dataset.e, k = genre(e);
      const voie = $(`.voie[data-k="${k}"]`);
      if (e === 'tlock') {
        msg.textContent = 'Fichier chiffré : mot de passe demandé…';
        await attendre(reduit ? 0 : 700);
        msg.textContent = 'Mot de passe correct, déchiffrement…';
        await attendre(reduit ? 0 : 500);
      } else msg.textContent = `Ouverture dans ${NOM[k]}…`;
      voler(rect || btn.getBoundingClientRect(), voie, btn, (() => {
        const li = document.createElement('li');
        li.innerHTML = `${btn.dataset.n}.${e}<small>${e === 'pdf' ? 'Texte extrait du PDF' : e === 'tlock' ? 'Déchiffré, AES-256' : e === 'doc' || e === 'xls' ? 'Format Office 97-2003' : 'Ouvert dans ' + NOM[k]}</small>`;
        $('ul', voie).prepend(li);
        while ($('ul', voie).children.length > 4) $('ul', voie).lastChild.remove();
        const em = $('em', voie);
        em.textContent = Number(em.textContent) + 1;
        voie.classList.add('hit');
        setTimeout((() => voie.classList.remove('hit')), 700);
        restants--;
        if (!restants) {
          msg.innerHTML = 'Tout est ouvert. <button type="button" class="relancer">Recommencer</button>';
          $('.relancer', msg).addEventListener('click', construire);
        } else msg.textContent = `${btn.dataset.n}.${e} → ${NOM[k]}`;
      }));
    }
    function brancher(btn) {
      let depart = null, fantome = null, dx = 0, dy = 0, tenu = false, appui = 0;
      const lever = (x, y) => {
        fantome = btn.cloneNode(true);
        fantome.classList.add('ghost');
        fantome.style.width = btn.offsetWidth + 'px';
        document.body.append(fantome);
        btn.style.opacity = '.3';
        suivre(x, y);
      };
      const suivre = (x, y) => {
        fantome.style.transform = `translate(${x - dx}px, ${y - dy}px) rotate(-3deg) scale(1.06)`;
        const rz = zone.getBoundingClientRect();
        zone.classList.toggle('over', x > rz.left && x < rz.right && y > rz.top - 40 && y < rz.bottom + 260);
      };
      btn.addEventListener('pointerdown', (e => {
        if (btn.classList.contains('used') || e.button > 0) return;
        depart = [ e.clientX, e.clientY ];
        const r = btn.getBoundingClientRect();
        dx = e.clientX - r.left;
        dy = e.clientY - r.top;
        clearTimeout(appui);
        if (e.pointerType === 'mouse') {
          tenu = true;
          try {
            btn.setPointerCapture(e.pointerId);
          } catch {}
          return;
        }
        tenu = false;
        appui = setTimeout((() => {
          if (!depart) return;
          tenu = true;
          lever(depart[0], depart[1]);
          navigator.vibrate?.(8);
        }), 260);
      }));
      btn.addEventListener('touchmove', (e => {
        if (tenu && depart) e.preventDefault();
      }), {
        passive: false
      });
      btn.addEventListener('pointermove', (e => {
        if (!depart) return;
        if (!tenu) {
          if (Math.hypot(e.clientX - depart[0], e.clientY - depart[1]) > 8) {
            clearTimeout(appui);
            depart = null;
          }
          return;
        }
        if (!fantome && Math.hypot(e.clientX - depart[0], e.clientY - depart[1]) > 6) lever(e.clientX, e.clientY); else if (fantome) suivre(e.clientX, e.clientY);
      }));
      btn.addEventListener('contextmenu', (e => {
        if (tenu) e.preventDefault();
      }));
      const fin = e => {
        clearTimeout(appui);
        tenu = false;
        if (!depart) return;
        depart = null;
        if (!fantome) return;
        const dedans = zone.classList.contains('over');
        zone.classList.remove('over');
        const r = fantome.getBoundingClientRect();
        fantome.remove();
        fantome = null;
        btn.style.opacity = '';
        btn.dataset.glisse = '1';
        setTimeout((() => delete btn.dataset.glisse), 50);
        if (dedans) router(btn, r); else if (!reduit && e.type !== 'pointercancel') btn.animate([ {
          transform: `translate(${r.left - btn.getBoundingClientRect().left}px, ${r.top - btn.getBoundingClientRect().top}px)`
        }, {
          transform: 'none'
        } ], {
          duration: 450,
          easing: 'cubic-bezier(.34,1.45,.64,1)'
        });
      };
      btn.addEventListener('pointerup', fin);
      btn.addEventListener('pointercancel', fin);
      btn.addEventListener('click', (() => {
        if (!btn.dataset.glisse) router(btn);
      }));
    }
    construire();
  })();
  (() => {
    const coffre = $('#coffre'), form = $('#cf-form'), pw = $('#cf-pw'), go = $('#cf-go'), data = $('#cf-data'), info = $('#cf-info');
    if (!coffre) return;
    const CLAIR = data.textContent;
    const sub = window.crypto && crypto.subtle;
    const NOMS = {
      pdf: [ 'Budget mensuel.pdf', 'PDF protégé : AES-256, comme dans l’app' ],
      zip: [ 'Budget mensuel.zip', 'Archive WinZip AE-2 : AES-256' ],
      tlock: [ 'Budget mensuel.tlock', 'Format Triade : AES-256-GCM' ]
    };
    let sel = null, iv = null, chiffre = null, occupe = false;
    $$('#prot button').forEach((b => b.addEventListener('click', (() => {
      $$('#prot button').forEach((x => x.setAttribute('aria-checked', x === b)));
      const [n, s] = NOMS[b.dataset.p];
      $('#cf-name').textContent = n;
      $('#cf-sub').textContent = s + ' · démonstration réelle';
    }))));
    const hex = u8 => [ ...u8 ].map((x => x.toString(16).padStart(2, '0'))).join('');
    function brouiller(vers, duree = 800) {
      return new Promise((ok => {
        if (reduit) {
          data.textContent = vers;
          ok();
          return;
        }
        const de = data.textContent;
        const n = Math.max(de.length, vers.length);
        const signes = '0123456789abcdef';
        const t0 = performance.now();
        const pas = t => {
          const k = Math.min((t - t0) / duree, 1);
          let s = '';
          for (let j = 0; j < n; j++) {
            const seuil = j / n;
            if (k > seuil + .25) s += vers[j] ?? ''; else if (k > seuil) s += vers[j] === '\n' ? '\n' : signes[Math.random() * 16 | 0]; else s += de[j] ?? '';
          }
          data.textContent = s;
          k < 1 ? requestAnimationFrame(pas) : (data.textContent = vers, ok());
        };
        requestAnimationFrame(pas);
      }));
    }
    async function cle(mdp, s) {
      const base = await sub.importKey('raw', (new TextEncoder).encode(mdp), 'PBKDF2', false, [ 'deriveKey' ]);
      return sub.deriveKey({
        name: 'PBKDF2',
        salt: s,
        iterations: 31e4,
        hash: 'SHA-256'
      }, base, {
        name: 'AES-GCM',
        length: 256
      }, false, [ 'encrypt', 'decrypt' ]);
    }
    form.addEventListener('submit', (async e => {
      e.preventDefault();
      if (occupe) return;
      if (!sub) {
        info.className = 'cf-info err';
        info.textContent = 'Le chiffrement du navigateur n’est pas disponible ici (connexion non sécurisée).';
        return;
      }
      const mdp = pw.value;
      if (!mdp) {
        pw.focus();
        form.classList.remove('shake');
        void form.offsetWidth;
        form.classList.add('shake');
        return;
      }
      occupe = true;
      go.disabled = true;
      try {
        if (coffre.dataset.etat === 'clair') {
          info.className = 'cf-info';
          info.textContent = 'Dérivation de la clé…';
          sel = crypto.getRandomValues(new Uint8Array(16));
          iv = crypto.getRandomValues(new Uint8Array(12));
          const t0 = performance.now();
          const k = await cle(mdp, sel);
          chiffre = new Uint8Array(await sub.encrypt({
            name: 'AES-GCM',
            iv: iv
          }, k, (new TextEncoder).encode(CLAIR)));
          const ms = Math.round(performance.now() - t0);
          const brut = hex((new TextEncoder).encode('TLOCK1')) + hex(sel) + hex(iv) + hex(chiffre);
          coffre.dataset.etat = 'chiffre';
          await brouiller(brut.match(/.{1,8}/g).join(' '));
          info.className = 'cf-info ok';
          info.textContent = `Chiffré en ${ms} ms. Saisissez le mot de passe pour rouvrir le fichier.`;
          pw.value = '';
          pw.placeholder = 'Mot de passe';
          pw.autocomplete = 'current-password';
          go.textContent = 'Déchiffrer';
        } else {
          info.className = 'cf-info';
          info.textContent = 'Vérification…';
          const k = await cle(mdp, sel);
          try {
            const clair = (new TextDecoder).decode(await sub.decrypt({
              name: 'AES-GCM',
              iv: iv
            }, k, chiffre));
            coffre.dataset.etat = 'clair';
            await brouiller(clair);
            info.className = 'cf-info ok';
            info.textContent = 'Déchiffré. Le mot de passe n’a été enregistré nulle part.';
            pw.value = '';
            pw.placeholder = 'Choisissez un mot de passe';
            pw.autocomplete = 'new-password';
            go.textContent = 'Chiffrer';
          } catch {
            info.className = 'cf-info err';
            info.textContent = 'Mot de passe incorrect. Sans lui, le fichier reste illisible.';
            form.classList.remove('shake');
            void form.offsetWidth;
            form.classList.add('shake');
            pw.select();
          }
        }
      } finally {
        occupe = false;
        go.disabled = false;
      }
    }));
  })();
  (() => {
    const sig = $('#sig'), go = $('#sig-go'), qr = $('#sig-qr');
    if (!sig) return;
    let graine = 7, cases = '';
    const hasard = () => {
      graine = graine * 16807 % 2147483647;
      return graine / 2147483647;
    };
    for (let y = 0; y < 21; y++) for (let x = 0; x < 21; x++) {
      let plein;
      if (x < 7 && y < 7 || x > 13 && y < 7 || x < 7 && y > 13) {
        const cx = x > 13 ? x - 14 : x, cy = y > 13 ? y - 14 : y;
        plein = cx === 0 || cx === 6 || cy === 0 || cy === 6 || cx > 1 && cx < 5 && cy > 1 && cy < 5;
      } else plein = (x > 7 || y > 7) && hasard() > .52;
      if (plein) cases += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
    }
    qr.innerHTML = `<svg viewBox="0 0 21 21" shape-rendering="crispEdges">${cases}</svg>`;
    let occupe = false;
    const signer = async () => {
      if (occupe) return;
      occupe = true;
      go.disabled = true;
      sig.dataset.etat = '0';
      void sig.offsetWidth;
      sig.dataset.etat = '1';
      await attendre(reduit ? 60 : 2300);
      sig.dataset.etat = '2';
      await attendre(1800);
      occupe = false;
      go.disabled = false;
    };
    go.addEventListener('click', signer);
    sig.closest('[data-reveal]').addEventListener('apparu', (() => setTimeout(signer, 600)), {
      once: true
    });
  })();
  (() => {
    const barre = $('#mbar'), scene = $('#mbar-scene');
    if (!barre) return;
    const menus = $$('.mb-m', barre);
    const surMac = /Mac/.test(navigator.platform || navigator.userAgent);
    let ouvert = null, demoFinie = false;
    const fermer = () => {
      if (!ouvert) return;
      ouvert.classList.remove('open', 'flash');
      $('.mb-t', ouvert).setAttribute('aria-expanded', 'false');
      $$('.open, .on', ouvert).forEach((e => e.classList.remove('open', 'on')));
      ouvert = null;
    };
    const ouvrir = m => {
      if (ouvert === m) return;
      fermer();
      ouvert = m;
      m.classList.add('open');
      $('.mb-t', m).setAttribute('aria-expanded', 'true');
    };
    const elements = m => [ ...$('.mb-pop', m).children ].map((e => e.classList.contains('mi-wrap') ? e.firstElementChild : e)).filter((e => e.classList.contains('mi')));
    async function clignoter(m, mi) {
      for (let k = 0; k < 2; k++) {
        mi.classList.add('on');
        await attendre(110);
        mi.classList.remove('on');
        await attendre(70);
      }
      mi.classList.add('on');
      await attendre(260);
      if (ouvert === m) fermer();
    }
    menus.forEach((m => {
      const t = $('.mb-t', m);
      t.addEventListener('click', (e => {
        demoFinie = true;
        e.stopPropagation();
        if (ouvert === m) fermer(); else ouvrir(m);
      }));
      t.addEventListener('pointerenter', (() => {
        if (ouvert && ouvert !== m) ouvrir(m);
      }));
    }));
    $$('.mi-wrap', barre).forEach((w => {
      w.addEventListener('pointerenter', (() => w.classList.add('open')));
      w.addEventListener('pointerleave', (() => w.classList.remove('open')));
    }));
    $$('.mi', barre).forEach((mi => mi.addEventListener('click', (e => {
      e.stopPropagation();
      if (mi.getAttribute('aria-haspopup')) {
        mi.parentElement.classList.toggle('open');
        return;
      }
      demoFinie = true;
      clignoter(mi.closest('.mb-m'), mi);
    }))));
    document.addEventListener('click', fermer);
    const raccourcis = Object.fromEntries($$('.mi[data-r]', barre).map((mi => [ mi.dataset.r, mi ])));
    document.addEventListener('keydown', (e => {
      if (e.key === 'Escape') {
        fermer();
        return;
      }
      const cmd = e.metaKey || !surMac && e.ctrlKey;
      if (!cmd) return;
      const code = e.code || '';
      const t = code.startsWith('Key') ? code.slice(3) : code.startsWith('Digit') ? code.slice(5) : '';
      const mi = raccourcis[(e.ctrlKey && e.metaKey ? '⌃' : '') + (e.altKey ? '⌥' : '') + (e.shiftKey ? '⇧' : '') + '⌘' + t];
      if (!mi) return;
      const r = scene.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      demoFinie = true;
      const m = mi.closest('.mb-m');
      ouvrir(m);
      clignoter(m, mi);
    }));
    scene.addEventListener('apparu', (async () => {
      if (reduit) return;
      await attendre(1100);
      for (const [cle, cible, sous] of [ [ 'fichier', 'Exporter vers', 'PDF…' ], [ 'format', 'Inspecteur' ] ]) {
        if (demoFinie) return;
        const m = $(`.mb-m[data-m="${cle}"]`, barre);
        ouvrir(m);
        await attendre(250);
        let atteint = null;
        for (const mi of elements(m)) {
          if (demoFinie) {
            fermer();
            return;
          }
          mi.classList.add('on');
          await attendre(95);
          if (mi.textContent.trim().startsWith(cible)) {
            atteint = mi;
            break;
          }
          mi.classList.remove('on');
        }
        if (sous && atteint) {
          const w = atteint.parentElement;
          w.classList.add('open');
          await attendre(380);
          const s = $$('.mb-sous .mi', w).find((x => x.textContent.trim() === sous));
          if (s) s.classList.add('on');
          await attendre(1100);
        } else await attendre(1100);
        if (demoFinie) return;
        fermer();
        await attendre(650);
      }
    }), {
      once: true
    });
  })();
  (() => {
    const face = $('#face');
    if (!face) return;
    let occupe = false;
    face.addEventListener('click', (async () => {
      if (occupe) return;
      occupe = true;
      face.classList.add('scan');
      await attendre(reduit ? 50 : 950);
      face.classList.remove('scan');
      face.classList.add('ok');
      await attendre(1800);
      face.classList.remove('ok');
      occupe = false;
    }));
  })();
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
  {
    $$('.pan').forEach((p => p.addEventListener('pointermove', (e => {
      const r = p.getBoundingClientRect();
      p.style.setProperty('--mx', `${e.clientX - r.left}px`);
      p.style.setProperty('--my', `${e.clientY - r.top}px`);
    }), {
      passive: true
    })));
    if (!reduit) $$('.magnet').forEach((b => {
      b.addEventListener('pointermove', (e => {
        const r = b.getBoundingClientRect();
        b.style.translate = `${(e.clientX - r.left - r.width / 2) * .18}px ${(e.clientY - r.top - r.height / 2) * .3}px`;
      }));
      b.addEventListener('pointerleave', (() => {
        b.style.translate = '';
      }));
    }));
  }
  $('#annee').textContent = (new Date).getFullYear();
  surDefilement();
})();
