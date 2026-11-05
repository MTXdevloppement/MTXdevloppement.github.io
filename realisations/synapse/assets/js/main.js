(() => {
  'use strict';
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pointeurFin = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const mobile = matchMedia('(max-width: 900px)');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [ ...r.querySelectorAll(s) ];
  const borner = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
  const attendre = ms => new Promise((ok => setTimeout(ok, ms)));
  const echapper = s => s.replace(/[&<>"]/g, (c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  }[c])));
  const texte = (el, s) => {
    if (el && el.textContent !== s) el.textContent = s;
  };
  function parImage(fn) {
    let dernier = null, id = 0;
    const f = e => {
      dernier = e;
      if (!id) id = requestAnimationFrame((() => {
        id = 0;
        fn(dernier);
      }));
    };
    f.annuler = () => {
      if (id) cancelAnimationFrame(id);
      id = 0;
    };
    return f;
  }
  const apparition = new IntersectionObserver((entrees => {
    for (const e of entrees) {
      if (!e.isIntersecting) continue;
      const el = e.target;
      el.classList.add('is-in');
      const delai = parseFloat(getComputedStyle(el).getPropertyValue('--d')) || 0;
      setTimeout((() => el.classList.add('is-done')), 1150 + delai * 1e3);
      el.dispatchEvent(new Event('apparu'));
      apparition.unobserve(el);
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
    rootMargin: '60px 0px'
  });
  $$('[data-scope]').forEach((el => portee.observe(el)));
  const CFG = {
    etapes: [ 1, 10 ],
    reEtapes: [ 10 ],
    passage: 1,
    facile: 4,
    depart: 2.5,
    bonus: 1.3,
    difficile: 1.2
  };
  function planifier(c, note) {
    const n = {
      ...c,
      min: null
    };
    if (c.state === 'new' || c.state === 'learning') {
      const st = CFG.etapes;
      const cur = c.state === 'new' ? 0 : Math.min(c.step || 0, st.length - 1);
      if (c.state === 'new') n.ease = CFG.depart;
      if (note === 1) {
        n.state = 'learning';
        n.step = 0;
        n.min = st[0];
      } else if (note === 2) {
        n.state = 'learning';
        n.step = cur;
        n.min = cur === 0 ? st.length > 1 ? (st[0] + st[1]) / 2 : st[0] * 1.5 : st[cur];
      } else if (note === 3) {
        const k = cur + 1;
        if (k >= st.length) {
          n.state = 'review';
          n.ivl = CFG.passage;
          n.step = 0;
        } else {
          n.state = 'learning';
          n.step = k;
          n.min = st[k];
        }
      } else {
        n.state = 'review';
        n.ivl = CFG.facile;
        n.step = 0;
      }
    } else if (c.state === 'review') {
      const cur = Math.max(1, c.ivl);
      const dur = Math.max(cur + 1, Math.round(cur * CFG.difficile));
      const bon = Math.max(dur + 1, Math.round(cur * c.ease));
      if (note === 1) {
        n.ease = Math.max(1.3, c.ease - .2);
        n.ivl = 1;
        n.state = 'relearning';
        n.step = 0;
        n.min = CFG.reEtapes[0];
      } else if (note === 2) {
        n.ease = Math.max(1.3, c.ease - .15);
        n.ivl = dur;
      } else if (note === 3) {
        n.ivl = bon;
      } else {
        n.ease = c.ease + .15;
        n.ivl = Math.max(bon + 1, Math.round(cur * c.ease * CFG.bonus));
      }
    } else {
      const st = CFG.reEtapes;
      const cur = Math.min(c.step || 0, st.length - 1);
      if (note === 1) {
        n.step = 0;
        n.min = st[0];
      } else if (note === 2) {
        n.min = cur === 0 ? st.length > 1 ? (st[0] + st[1]) / 2 : st[0] * 1.5 : st[cur];
      } else if (note === 3) {
        const k = cur + 1;
        if (k >= st.length) {
          n.state = 'review';
          n.step = 0;
        } else {
          n.step = k;
          n.min = st[k];
        }
      } else {
        n.state = 'review';
        n.ivl = c.ivl + 1;
        n.step = 0;
      }
    }
    return n;
  }
  const fmt = v => {
    const r = Math.round(v * 10) / 10;
    return Number.isInteger(r) ? String(r) : String(r).replace('.', ',');
  };
  function libelleJours(j) {
    if (j < 30) return `${j} j`;
    if (j < 365) return `${fmt(j / 30.4)} mois`;
    const a = j / 365;
    return `${fmt(a)} ${a >= 2 ? 'ans' : 'an'}`;
  }
  function libelle(n) {
    if (n.min != null) {
      const m = Math.max(1, Math.round(n.min));
      return m < 60 ? `${m} min` : `${fmt(m / 60)} h`;
    }
    return libelleJours(n.ivl);
  }
  const CARTES = [ {
    paquet: '🌍 Capitales',
    c: '#22d3ee',
    type: 'basic',
    q: 'Capitale : **Australie**',
    a: 'Canberra',
    state: 'review',
    ivl: 4,
    ease: 2.5
  }, {
    paquet: '🇬🇧 Anglais',
    c: '#f472b6',
    type: 'reversed',
    q: 'the neighbourhood',
    a: 'le quartier',
    state: 'new',
    ease: 2.5
  }, {
    paquet: '🧠 Culture',
    c: '#8b5cf6',
    type: 'cloze',
    texte: 'La Révolution française débute en {{c1::1789}} avec la prise de la Bastille.',
    extra: 'Le 14 juillet 1789.',
    state: 'review',
    ivl: 12,
    ease: 2.6
  }, {
    paquet: '🧪 Chimie',
    c: '#34d399',
    type: 'typeIn',
    q: 'Symbole chimique : **Fer**',
    a: 'Fe',
    state: 'new',
    ease: 2.5
  }, {
    paquet: '⚡️ Électricité',
    c: '#f59e0b',
    type: 'basic',
    q: "Loi d'Ohm",
    a: 'U = R × I',
    extra: 'Tension = résistance × intensité.',
    state: 'review',
    ivl: 30,
    ease: 2.5
  }, {
    paquet: '🌍 Capitales',
    c: '#22d3ee',
    type: 'basic',
    q: 'Capitale : **Canada**',
    a: 'Ottawa',
    state: 'new',
    ease: 2.5
  } ];
  const ETATS = {
    new: [ 'Nouvelle', '#60a5fa' ],
    learning: [ 'Apprentissage', '#f87171' ],
    relearning: [ 'Réapprentissage', '#f87171' ],
    review: [ 'Révision', '#34d399' ]
  };
  const md = s => echapper(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  const trous = (s, montrer) => echapper(s).replace(/\{\{c(\d+)::(.*?)\}\}/g, ((_, n, t) => montrer ? `<span class="cz-on">${t}</span>` : '<span class="cz">[ … ]</span>'));
  const normaliser = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  function badges(c) {
    const [nom, coul] = ETATS[c.state];
    let html = `<div class="rv-badges"><span class="badge" style="--c:${c.c}">${c.paquet}</span><span class="badge" style="--c:${coul}">${nom}</span>`;
    if (c.type === 'reversed') html += '<span class="badge" style="--c:#8b5cf6">Inversée</span>';
    if (c.type === 'cloze') html += '<span class="badge" style="--c:#8b5cf6">Trou 1</span>';
    if (c.type === 'typeIn') html += '<span class="badge" style="--c:#8b5cf6">Saisie</span>';
    return html + '</div>';
  }
  function faceAvant(c) {
    const q = c.type === 'cloze' ? trous(c.texte, false) : md(c.q);
    return `${badges(c)}<p class="rv-q">${q}</p>`;
  }
  function faceArriere(c, saisie) {
    if (c.type === 'cloze') {
      return `${badges(c)}<p class="rv-q">${trous(c.texte, true)}</p>${c.extra ? `<p class="rv-extra">${echapper(c.extra)}</p>` : ''}`;
    }
    let verdict = '';
    if (c.type === 'typeIn') {
      if (!saisie) verdict = '<span class="rv-verdict ko">Aucune réponse saisie</span>'; else if (normaliser(saisie) === normaliser(c.a)) verdict = '<span class="rv-verdict ok"><svg><use href="#i-check"/></svg>Bonne réponse !</span>'; else verdict = `<span class="rv-verdict ko"><svg><use href="#i-x"/></svg>Ta réponse : <s>${echapper(saisie)}</s></span>`;
    }
    return `${badges(c)}<p class="rv-q">${md(c.q)}</p><span class="rv-sep"></span>${verdict}<p class="rv-a">${md(c.a)}</p>${c.extra ? `<p class="rv-extra">${echapper(c.extra)}</p>` : ''}`;
  }
  class Revision {
    constructor(racine, auto) {
      this.racine = racine;
      this.auto = auto;
      racine.append($('#tpl-review').content.cloneNode(true));
      this.scene = $('.rv-stage', racine);
      this.boutonVoir = $('.rv-show', racine);
      this.saisie = $('.rv-input', racine);
      this.notes = $$('.rv-rates button', racine);
      this.barre = $('.rv-prog i', racine);
      this.compteurs = {
        new: $('.c-new', racine),
        learning: $('.c-learn', racine),
        review: $('.c-rev', racine)
      };
      this.pause = false;
      this.reveil = null;
      this.n = 0;
      this.utilise = false;
      if (auto) {
        racine.inert = true;
      } else {
        this.boutonVoir.addEventListener('click', (() => {
          this.utilise = true;
          this.reveler();
        }));
        this.notes.forEach((b => b.addEventListener('click', (() => {
          this.utilise = true;
          this.noter(Number(b.dataset.r));
        }))));
        this.saisie.addEventListener('keydown', (e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            this.utilise = true;
            this.reveler();
          }
        }));
        $('.rv-again', racine).addEventListener('click', (() => this.reinitialiser()));
        racine.addEventListener('click', (e => {
          if (e.target.closest('.rv-card') && !this.revele && this.carte && this.carte.type !== 'typeIn') {
            this.utilise = true;
            this.reveler();
          }
        }));
      }
      this.reinitialiser();
    }
    reinitialiser() {
      this.file = CARTES.map(((c, i) => ({
        ...c,
        id: i
      })));
      this.attente = [];
      this.faites = 0;
      this.reussies = 0;
      this.carte = null;
      this.racine.classList.remove('finished');
      this.suivante();
    }
    restantes() {
      const toutes = [ ...this.file, ...this.attente.map((x => x.carte)), ...this.carte ? [ this.carte ] : [] ];
      const r = {
        new: 0,
        learning: 0,
        review: 0
      };
      toutes.forEach((c => {
        r[c.state === 'relearning' ? 'learning' : c.state] += 1;
      }));
      return r;
    }
    majCompteurs() {
      const r = this.restantes();
      for (const k of Object.keys(r)) {
        const el = this.compteurs[k];
        if (el.textContent !== String(r[k])) {
          el.textContent = String(r[k]);
          el.classList.remove('bump');
          void el.offsetWidth;
          el.classList.add('bump');
          setTimeout((() => el.classList.remove('bump')), 300);
        }
        el.classList.toggle('zero', r[k] === 0);
      }
      const total = r.new + r.learning + r.review;
      this.barre.style.transform = `scaleX(${total + this.faites ? this.faites / (total + this.faites) : 1})`;
    }
    suivante() {
      let prochaine = null;
      if (this.attente.length && this.attente[0].reste <= 0) prochaine = this.attente.shift().carte; else if (this.file.length) prochaine = this.file.shift(); else if (this.attente.length) prochaine = this.attente.shift().carte;
      this.attente.forEach((x => {
        x.reste -= 1;
      }));
      const ancienne = $('.rv-card:not(.leave)', this.scene);
      if (ancienne) {
        ancienne.classList.remove('enter');
        ancienne.classList.add('leave');
        setTimeout((() => ancienne.remove()), 460);
      }
      this.carte = prochaine;
      this.revele = false;
      this.racine.classList.remove('revealed');
      this.saisie.value = '';
      if (!prochaine) {
        this.terminer();
        this.majCompteurs();
        return;
      }
      this.racine.classList.toggle('typing', prochaine.type === 'typeIn');
      const el = document.createElement('div');
      el.className = 'rv-card enter';
      el.innerHTML = `<div class="rv-face rv-front">${faceAvant(prochaine)}</div><div class="rv-face rv-back"></div>`;
      this.scene.append(el);
      this.element = el;
      this.majCompteurs();
      if (!this.auto && prochaine.type === 'typeIn' && this.utilise) {
        setTimeout((() => this.saisie.focus({
          preventScroll: true
        })), 350);
      }
    }
    reveler() {
      if (this.revele || !this.carte) return;
      this.revele = true;
      $('.rv-back', this.element).innerHTML = faceArriere(this.carte, this.saisie.value.trim());
      this.element.classList.remove('enter');
      this.element.classList.add('is-flipped');
      this.notes.forEach((b => {
        $('small', b).textContent = libelle(planifier(this.carte, Number(b.dataset.r)));
      }));
      this.racine.classList.add('revealed');
      if (this.saisie === document.activeElement) this.saisie.blur();
    }
    noter(note) {
      if (!this.revele || !this.carte) return;
      const apres = planifier(this.carte, note);
      this.faites += 1;
      if (note > 1) this.reussies += 1;
      if (apres.min != null) this.attente.push({
        carte: apres,
        reste: 2
      });
      this.carte = null;
      this.suivante();
    }
    terminer() {
      this.racine.classList.add('finished');
      const acc = this.faites ? Math.round(this.reussies / this.faites * 100) : 0;
      $('[data-done-n]', this.racine).textContent = String(this.faites);
      $('[data-done-acc]', this.racine).textContent = `${acc} %`;
      $('[data-done-msg]', this.racine).textContent = acc >= 90 ? 'Excellent travail, ta mémoire est affûtée !' : acc >= 70 ? 'Très bonne session, continue comme ça.' : 'Les cartes difficiles reviendront vite. C\'est comme ça qu\'on progresse.';
    }
    pret() {
      return this.pause ? new Promise((ok => {
        this.reveil = ok;
      })) : Promise.resolve();
    }
    suspendre() {
      this.pause = true;
    }
    reprendre() {
      this.pause = false;
      if (this.reveil) {
        const r = this.reveil;
        this.reveil = null;
        r();
      }
    }
    async presser(el, ms = 240) {
      el.classList.add('press');
      await attendre(ms);
      el.classList.remove('press');
    }
    async boucle() {
      await attendre(1600);
      for (;;) {
        await this.pret();
        if (this.racine.classList.contains('finished')) {
          await attendre(2800);
          await this.pret();
          this.reinitialiser();
          continue;
        }
        await attendre(1500);
        await this.pret();
        const c = this.carte;
        if (!c) continue;
        if (c.type === 'typeIn') {
          for (const ch of 'fe') {
            this.saisie.value += ch;
            await attendre(220);
          }
          await attendre(300);
        }
        await this.presser(this.boutonVoir);
        this.reveler();
        await attendre(1700);
        await this.pret();
        const note = c.state === 'review' ? this.n++ % 3 === 2 ? 4 : 3 : this.n++ % 5 === 4 ? 1 : 3;
        await this.presser(this.notes[note - 1], 300);
        this.noter(note);
      }
    }
  }
  const demoAuto = $('[data-review="auto"]');
  const demoInteractive = $('[data-review="interactive"]');
  const hero = $('.hero');
  let autoRev = null;
  if (demoAuto) {
    autoRev = new Revision(demoAuto, true);
    if (!reduit) {
      hero.addEventListener('portee:sortie', (() => autoRev.suspendre()));
      hero.addEventListener('portee:entree', (() => autoRev.reprendre()));
      document.addEventListener('visibilitychange', (() => {
        if (document.hidden) autoRev.suspendre(); else if (!hero.classList.contains('is-paused')) autoRev.reprendre();
      }));
      autoRev.boucle();
    }
  }
  let interRev = null;
  if (demoInteractive) {
    interRev = new Revision(demoInteractive, false);
    const section = $('#essayer');
    let visible = false;
    section.addEventListener('portee:entree', (() => {
      visible = true;
    }));
    section.addEventListener('portee:sortie', (() => {
      visible = false;
    }));
    document.addEventListener('keydown', (e => {
      if (!visible || e.metaKey || e.ctrlKey || e.altKey) return;
      const dansDemo = demoInteractive.contains(e.target);
      if (dansDemo && e.target.matches('input')) return;
      if (!dansDemo && e.target.closest('input, textarea, select, button, a, summary')) return;
      const r = demoInteractive.getBoundingClientRect();
      if (r.top > innerHeight * .75 || r.bottom < innerHeight * .25) return;
      if ((e.key === ' ' || e.key === 'Enter') && !interRev.revele && !demoInteractive.classList.contains('finished')) {
        e.preventDefault();
        interRev.utilise = true;
        if (interRev.carte && interRev.carte.type === 'typeIn') interRev.saisie.focus({
          preventScroll: true
        }); else interRev.reveler();
      } else if ([ '1', '2', '3', '4' ].includes(e.key) && interRev.revele) {
        e.preventDefault();
        const b = interRev.notes[Number(e.key) - 1];
        interRev.presser(b, 160);
        interRev.noter(Number(e.key));
      }
    }));
  }
  function aleatoire(graine) {
    let s = graine;
    return () => {
      s = s * 16807 % 2147483647;
      return (s - 1) / 2147483646;
    };
  }
  function construireStats(racine, graine) {
    racine.append($('#tpl-stats').content.cloneNode(true));
    const rnd = aleatoire(graine);
    const heat = $('.heat', racine);
    const jourSemaine = ((new Date).getDay() + 6) % 7;
    const total = 26 * 7;
    const aujourdhui = 25 * 7 + jourSemaine;
    let html = '';
    for (let i = 0; i < total; i++) {
      const d = `--d:${i * 4 / 1e3}s`;
      if (i > aujourdhui) {
        html += `<i class="future" style="${d}"></i>`;
        continue;
      }
      const recent = i > aujourdhui - 12;
      const actif = recent || rnd() > .28 + (1 - i / total) * .35;
      if (!actif) {
        html += `<i style="${d}"></i>`;
        continue;
      }
      const a = (.25 + rnd() * .75 * (.55 + i / total * .45)).toFixed(2);
      html += `<i class="${i === aujourdhui ? 'now' : ''}" style="${d};--a:${a}"></i>`;
    }
    heat.innerHTML = html;
    const barres = $('.fbars', racine);
    let b = '';
    for (let i = 0; i < 30; i++) {
      const h = Math.round(18 + 70 * Math.exp(-i / 9) + rnd() * 22 + (i % 7 === 3 ? 10 : 0));
      b += `<i style="--h:${Math.min(h, 100)};--d:${i * 22 / 1e3}s"></i>`;
    }
    barres.innerHTML = b;
  }
  $$('[data-stats-screen]').forEach(((el, i) => {
    construireStats(el, 7 + i * 31);
    if (el.hasAttribute('data-live')) {
      const obs = new IntersectionObserver((e => {
        if (e[0].isIntersecting) {
          el.classList.add('is-live');
          obs.disconnect();
        }
      }), {
        threshold: .3
      });
      obs.observe(el);
    } else {
      setTimeout((() => el.classList.add('is-live')), reduit ? 0 : 1600);
    }
  }));
  function compter(el) {
    const vers = Number(el.dataset.count);
    const suffixe = el.dataset.suffix || '';
    if (reduit) {
      el.textContent = vers + suffixe;
      return;
    }
    const t0 = performance.now();
    const duree = 1400;
    const pas = t => {
      const p = borner((t - t0) / duree);
      const v = Math.round(vers * (1 - Math.pow(1 - p, 3)));
      el.textContent = v + suffixe;
      if (p < 1) requestAnimationFrame(pas);
    };
    requestAnimationFrame(pas);
  }
  $$('[data-count]').forEach((el => {
    const parent = el.closest('[data-reveal]');
    if (parent) parent.addEventListener('apparu', (() => compter(el)), {
      once: true
    }); else compter(el);
  }));
  function initNeurones() {
    const canvas = $('.neurons');
    if (!canvas || reduit) return;
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, dpr = 1, noeuds = [], impulsions = [], raf = 0, actif = true;
    const souris = {
      x: -9999,
      y: -9999,
      t: 0
    };
    const LIEN = 140;
    const LIEN2 = LIEN * LIEN;
    const RUPTURE2 = LIEN * 1.2 * (LIEN * 1.2);
    const IMAGE = 1e3 / 60;
    let origineX = 0, origineY = 0;
    function dimensionner() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const r = canvas.getBoundingClientRect();
      origineX = r.left + scrollX;
      origineY = r.top + scrollY;
      const n = Math.round(borner(w * h / 17e3, 28, mobile.matches ? 40 : 95));
      const rnd = aleatoire(42);
      noeuds = Array.from({
        length: n
      }, (() => ({
        x: rnd() * w,
        y: rnd() * h,
        vx: (rnd() - .5) * .22,
        vy: (rnd() - .5) * .22,
        r: 1 + rnd() * 1.6,
        lueur: 0
      })));
    }
    function voisins(i) {
      const a = noeuds[i];
      const res = [];
      for (let j = 0; j < noeuds.length; j++) {
        if (j === i) continue;
        const dx = a.x - noeuds[j].x, dy = a.y - noeuds[j].y;
        if (dx * dx + dy * dy < LIEN2) res.push(j);
      }
      return res;
    }
    function tirer(depuis) {
      const v = voisins(depuis);
      if (!v.length || impulsions.length > 40) return;
      const vers = v[Math.floor(Math.random() * v.length)];
      impulsions.push({
        a: depuis,
        b: vers,
        t: 0,
        vie: 2 + Math.floor(Math.random() * 2)
      });
      noeuds[depuis].lueur = 1;
    }
    let dernierTir = 0, derniereImage = 0;
    function image(t) {
      raf = 0;
      if (!actif) return;
      if (derniereImage && t - derniereImage < IMAGE - 4.5) {
        raf = requestAnimationFrame(image);
        return;
      }
      let k = derniereImage ? (t - derniereImage) / IMAGE : 1;
      k = Math.abs(k - 1) < .1 ? 1 : Math.min(k, 3);
      derniereImage = t;
      const amorti = k === 1 ? .985 : Math.pow(.985, k);
      const extinction = k === 1 ? .95 : Math.pow(.95, k);
      ctx.clearRect(0, 0, w, h);
      for (const n of noeuds) {
        const dx = souris.x - n.x, dy = souris.y - n.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 32400 && d2 > 1) {
          const d = Math.sqrt(d2);
          n.vx += dx / d * .012 * k;
          n.vy += dy / d * .012 * k;
        }
        n.vx *= amorti;
        n.vy *= amorti;
        if (n.vx * n.vx + n.vy * n.vy < .0064) {
          n.vx += (Math.random() - .5) * .04 * k;
          n.vy += (Math.random() - .5) * .04 * k;
        }
        n.x += n.vx * k;
        n.y += n.vy * k;
        if (n.x < -20) n.x = w + 20;
        if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        if (n.y > h + 20) n.y = -20;
        n.lueur *= extinction;
      }
      ctx.lineWidth = 1;
      const sx = souris.x, sy = souris.y;
      for (let i = 0; i < noeuds.length; i++) {
        const a = noeuds[i];
        const teinte = a.x / w;
        const couleur = `rgba(${Math.round(139 - 105 * teinte)}, ${Math.round(92 + 119 * teinte)}, ${Math.round(246 - 8 * teinte)}, `;
        for (let j = i + 1; j < noeuds.length; j++) {
          const b = noeuds[j];
          const ex = a.x - b.x, ey = a.y - b.y;
          const d2 = ex * ex + ey * ey;
          if (d2 > LIEN2) continue;
          const d = Math.sqrt(d2);
          const mx = sx - (a.x + b.x) / 2, my = sy - (a.y + b.y) / 2;
          const p2 = mx * mx + my * my;
          const boost = p2 < 4e4 ? (1 - Math.sqrt(p2) / 200) * .35 : 0;
          const al = (1 - d / LIEN) * .22 + boost;
          ctx.strokeStyle = couleur + al + ')';
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      for (let q = impulsions.length - 1; q >= 0; q--) {
        const p = impulsions[q];
        const a = noeuds[p.a], b = noeuds[p.b];
        p.t += .022 * k;
        const ex = a.x - b.x, ey = a.y - b.y;
        if (p.t >= 1 || ex * ex + ey * ey > RUPTURE2) {
          impulsions.splice(q, 1);
          b.lueur = 1;
          if (p.vie > 0 && p.t >= 1) {
            const v = voisins(p.b).filter((x => x !== p.a));
            if (v.length) impulsions.push({
              a: p.b,
              b: v[Math.floor(Math.random() * v.length)],
              t: 0,
              vie: p.vie - 1
            });
          }
          continue;
        }
        const x = a.x + (b.x - a.x) * p.t, y = a.y + (b.y - a.y) * p.t;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 10);
        g.addColorStop(0, 'rgba(165, 243, 252, .95)');
        g.addColorStop(1, 'rgba(34, 211, 238, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(167, 139, 250, .5)';
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      for (const n of noeuds) {
        ctx.fillStyle = `rgba(221, 214, 254, ${.45 + n.lueur * .55})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + n.lueur * 2.2, 0, Math.PI * 2);
        ctx.fill();
        if (n.lueur > .1) {
          ctx.fillStyle = `rgba(139, 92, 246, ${n.lueur * .3})`;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 9 * n.lueur + 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (t - dernierTir > 900) {
        dernierTir = t;
        tirer(Math.floor(Math.random() * noeuds.length));
      }
      raf = requestAnimationFrame(image);
    }
    function demarrer() {
      if (!actif) return;
      canvas.style.visibility = '';
      if (!raf) {
        derniereImage = 0;
        raf = requestAnimationFrame(image);
      }
    }
    function arreter() {
      cancelAnimationFrame(raf);
      raf = 0;
      if (hero.classList.contains('is-paused')) canvas.style.visibility = 'hidden';
    }
    hero.addEventListener('pointermove', (e => {
      souris.x = e.pageX - origineX;
      souris.y = e.pageY - origineY;
      const t = performance.now();
      if (t - souris.t > 160) {
        souris.t = t;
        let best = -1, bd = 1e9;
        for (let i = 0; i < noeuds.length; i++) {
          const dx = noeuds[i].x - souris.x, dy = noeuds[i].y - souris.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < bd) {
            bd = d2;
            best = i;
          }
        }
        if (best >= 0 && bd < 14400) tirer(best);
      }
    }));
    hero.addEventListener('pointerleave', (() => {
      souris.x = -9999;
      souris.y = -9999;
    }));
    hero.addEventListener('portee:entree', (() => {
      actif = true;
      demarrer();
    }));
    hero.addEventListener('portee:sortie', (() => {
      actif = false;
      arreter();
    }));
    document.addEventListener('visibilitychange', (() => {
      actif = !document.hidden && !hero.classList.contains('is-paused');
      if (actif) demarrer(); else arreter();
    }));
    new ResizeObserver(dimensionner).observe(canvas);
    dimensionner();
    demarrer();
  }
  const manifeste = $('[data-words]');
  let mots = [];
  if (manifeste) {
    const fragment = document.createDocumentFragment();
    manifeste.childNodes.forEach((noeud => {
      const accent = noeud.nodeType === 1 && noeud.classList.contains('g');
      noeud.textContent.split(/(\s+)/).forEach((morceau => {
        if (!morceau) return;
        if (/^\s+$/.test(morceau)) {
          fragment.append(morceau);
          return;
        }
        const s = document.createElement('span');
        s.className = accent ? 'm g' : 'm';
        s.textContent = morceau;
        fragment.append(s);
      }));
    }));
    manifeste.textContent = '';
    manifeste.append(fragment);
    mots = $$('.m', manifeste);
  }
  const courbe = $('.curve');
  const svg = $('.curve-svg');
  const X0 = 40, X1 = 620, Y0 = 30, Y1 = 330, T = 60;
  const REVISIONS = [ 1, 3, 8, 21, 50 ];
  const STABILITE = [ .83, 3.9, 15.2, 58, 192, 600 ];
  const xJour = t => X0 + (X1 - X0) * Math.sqrt(t / T);
  const yRet = r => Y1 - (Y1 - Y0) * r;
  function retention(t) {
    let derniere = 0, k = 0;
    for (let i = 0; i < REVISIONS.length; i++) if (t >= REVISIONS[i]) {
      derniere = REVISIONS[i];
      k = i + 1;
    }
    return {
      r: Math.exp(-(t - derniere) / STABILITE[k]),
      k: k
    };
  }
  const oubli = t => .08 + .92 * Math.exp(-t / .95);
  let etatCourbe = {
    points: -1,
    etape: -1,
    p: -1
  };
  const elCourbe = svg && {
    ligne: $('[data-line]', svg),
    aire: $('[data-area]', svg),
    oubli: $('[data-forget]', svg),
    tete: $('[data-head]', svg),
    points: $('[data-dots]', svg),
    revisions: $('[data-reviews]'),
    retention: $('[data-retention]'),
    jour: $('[data-day]'),
    etapes: $$('.curve-step'),
    barre: $('.curve-progress i')
  };
  function dessinerCourbe(p) {
    if (!svg || p === etatCourbe.p) return;
    etatCourbe.p = p;
    const tMax = Math.max(.001, T * p * p);
    let d = `M${X0} ${yRet(1)}`;
    let f = `M${X0} ${yRet(1)}`;
    const N = 220;
    let rev = 0;
    for (let i = 1; i <= N; i++) {
      const t = tMax * (i / N) * (i / N);
      while (rev < REVISIONS.length && REVISIONS[rev] <= t) {
        const tr = REVISIONS[rev];
        const avant = Math.exp(-(tr - (rev ? REVISIONS[rev - 1] : 0)) / STABILITE[rev]);
        d += `L${xJour(tr).toFixed(1)} ${yRet(avant).toFixed(1)}L${xJour(tr).toFixed(1)} ${yRet(1).toFixed(1)}`;
        rev += 1;
      }
      const {r: r} = retention(t);
      d += `L${xJour(t).toFixed(1)} ${yRet(r).toFixed(1)}`;
      f += `L${xJour(t).toFixed(1)} ${yRet(oubli(t)).toFixed(1)}`;
    }
    const {r: rFin, k: k} = retention(tMax);
    const el = elCourbe;
    el.ligne.setAttribute('d', d);
    el.aire.setAttribute('d', `${d}L${xJour(tMax).toFixed(1)} ${Y1}L${X0} ${Y1}Z`);
    el.oubli.setAttribute('d', f);
    el.tete.setAttribute('cx', xJour(tMax).toFixed(1));
    el.tete.setAttribute('cy', yRet(rFin).toFixed(1));
    if (k !== etatCourbe.points) {
      etatCourbe.points = k;
      el.points.innerHTML = REVISIONS.slice(0, k).map((t => `<circle class="curve-dot" r="6" cx="${xJour(t).toFixed(1)}" cy="${Y0}"/><text class="curve-dot-label" x="${xJour(t).toFixed(1)}" y="${Y0 - 12}">J${t}</text>`)).join('');
      texte(el.revisions, String(k));
    }
    texte(el.retention, `${Math.round(rFin * 100)} %`);
    texte(el.jour, String(Math.floor(tMax)));
    const etape = p < .08 ? 0 : p < .24 ? 1 : p < .7 ? 2 : 3;
    if (etape !== etatCourbe.etape) {
      etatCourbe.etape = etape;
      el.etapes.forEach(((e, i) => e.classList.toggle('is-active', mobile.matches || i === etape)));
    }
    el.barre.style.transform = `scaleX(${p})`;
  }
  if (svg) {
    $('[data-days]', svg).innerHTML = [ 0, 1, 3, 8, 21, 50, 60 ].map((t => `<line x1="${xJour(t).toFixed(1)}" y1="${Y0}" x2="${xJour(t).toFixed(1)}" y2="${Y1}"/><text x="${xJour(t).toFixed(1)}" y="${Y1 + 20}" text-anchor="middle">J${t}</text>`)).join('');
  }
  let courbeAuto = false;
  function lancerCourbeAuto() {
    if (courbeAuto) return;
    courbeAuto = true;
    if (reduit) {
      dessinerCourbe(1);
      return;
    }
    const t0 = performance.now();
    const pas = t => {
      const p = borner((t - t0) / 4200);
      dessinerCourbe(p);
      if (p < 1) requestAnimationFrame(pas);
    };
    requestAnimationFrame(pas);
  }
  if (svg) {
    new IntersectionObserver(((e, o) => {
      if (e[0].isIntersecting && (mobile.matches || reduit)) {
        lancerCourbeAuto();
        o.disconnect();
      }
    }), {
      threshold: .35
    }).observe($('.curve-fig'));
    dessinerCourbe(reduit ? 1 : 0);
  }
  const types = $('.types');
  const piste = $('[data-track]');
  const panneaux = $$('.type-panel');
  let distanceTypes = 0;
  const etatTypes = {
    tx: 0,
    txTexte: null,
    k: [],
    centres: []
  };
  function mesurerTypes() {
    if (!types) return;
    if (mobile.matches || reduit) {
      types.style.height = '';
      piste.style.transform = '';
      etatTypes.tx = 0;
      etatTypes.txTexte = null;
      etatTypes.k = [];
      panneaux.forEach((p => p.style.setProperty('--k', 1)));
      distanceTypes = 0;
      return;
    }
    distanceTypes = Math.max(0, piste.scrollWidth - innerWidth);
    types.style.height = `${innerHeight + distanceTypes * 1.05}px`;
  }
  function mesurerPanneaux() {
    etatTypes.centres = panneaux.map((el => {
      const b = el.getBoundingClientRect();
      return b.left + b.width / 2 - etatTypes.tx;
    }));
    etatTypes.txTexte = null;
    etatTypes.k = [];
  }
  function majTypes(y, vh, vw) {
    if (!types || !distanceTypes || !geo.types) return;
    const top = geo.types.top - y;
    if (top + geo.types.h < 0 || top > vh) return;
    const p = borner(-top / (geo.types.h - vh));
    const txTexte = (-p * distanceTypes).toFixed(1);
    if (txTexte === etatTypes.txTexte) return;
    etatTypes.txTexte = txTexte;
    etatTypes.tx = Number(txTexte);
    piste.style.transform = `translate3d(${txTexte}px, 0, 0)`;
    const centre = vw / 2;
    panneaux.forEach(((el, i) => {
      const dist = Math.abs(etatTypes.centres[i] + etatTypes.tx - centre) / vw;
      const k = borner(1 - dist * 1.25).toFixed(3);
      if (k !== etatTypes.k[i]) {
        etatTypes.k[i] = k;
        el.style.setProperty('--k', k);
      }
    }));
  }
  function boucleScope(el, etape, intervalle) {
    let id = 0;
    const lancer = () => {
      if (!id) {
        etape();
        id = setInterval(etape, intervalle);
      }
    };
    const arreter = () => {
      clearInterval(id);
      id = 0;
    };
    el.addEventListener('portee:entree', lancer);
    el.addEventListener('portee:sortie', arreter);
  }
  const flip = $('.demo-flip');
  if (flip && !pointeurFin && !reduit) {
    boucleScope(flip.closest('.type-panel'), (() => flip.classList.toggle('is-on')), 2600);
  }
  if (flip) flip.addEventListener('click', (() => flip.classList.toggle('is-on')));
  const cloze = $('.demo-cloze');
  if (cloze) {
    const trousEl = $$('.hole', cloze);
    const tags = $$('.cloze-tags .badge', cloze);
    let i = 0;
    if (reduit) trousEl.forEach((t => t.classList.add('on'))); else boucleScope(cloze.closest('.type-panel'), (() => {
      if (i >= trousEl.length) {
        trousEl.forEach((t => t.classList.remove('on')));
        tags.forEach((t => t.classList.remove('on')));
        i = 0;
        return;
      }
      tags.forEach(((t, k) => t.classList.toggle('on', k === i)));
      trousEl[i].classList.add('on');
      i += 1;
    }), 1300);
  }
  const frappe = $('.demo-type');
  if (frappe) {
    const champ = $('[data-typing]', frappe);
    const res = $('.type-result', frappe);
    let enCours = false;
    const scene = async () => {
      if (enCours) return;
      enCours = true;
      champ.textContent = '';
      res.classList.remove('on');
      await attendre(500);
      for (const ch of 'au') {
        champ.textContent += ch;
        await attendre(260);
      }
      await attendre(400);
      res.classList.add('on');
      enCours = false;
    };
    if (reduit) {
      champ.textContent = 'au';
      res.classList.add('on');
    } else boucleScope(frappe.closest('.type-panel'), scene, 3600);
  }
  if (pointeurFin && !reduit) {
    const tiltsAccueil = $$('.tilt', hero);
    const incliner = (els, ry, rx) => els.forEach((t => {
      t.style.setProperty('--ry', ry);
      t.style.setProperty('--rx', rx);
    }));
    const suivreAccueil = parImage((e => {
      const nx = e.clientX / innerWidth - .5;
      const ny = e.clientY / innerHeight - .5;
      incliner(tiltsAccueil, `${(nx * 10).toFixed(2)}deg`, `${(-ny * 7).toFixed(2)}deg`);
    }));
    hero.addEventListener('pointermove', suivreAccueil);
    hero.addEventListener('pointerleave', (() => {
      suivreAccueil.annuler();
      incliner(tiltsAccueil, '0deg', '0deg');
    }));
    $$('.tilt-soft').forEach((el => {
      const zone = el.parentElement;
      const suivre = parImage((e => {
        const r = zone.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - .5;
        const ny = (e.clientY - r.top) / r.height - .5;
        incliner([ el ], `${(nx * 9).toFixed(2)}deg`, `${(-ny * 6).toFixed(2)}deg`);
      }));
      zone.addEventListener('pointermove', suivre);
      zone.addEventListener('pointerleave', (() => {
        suivre.annuler();
        incliner([ el ], '0deg', '0deg');
      }));
    }));
    $$('.tile').forEach((t => {
      $$('.algo-chips span', t).forEach(((s, i) => s.style.setProperty('--i', i)));
      const suivre = parImage((e => {
        const r = t.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        t.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
        t.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
        t.style.setProperty('--try', `${((x - .5) * 5).toFixed(2)}deg`);
        t.style.setProperty('--trx', `${(-(y - .5) * 5).toFixed(2)}deg`);
      }));
      t.addEventListener('pointermove', suivre);
      t.addEventListener('pointerleave', (() => {
        suivre.annuler();
        t.style.setProperty('--try', '0deg');
        t.style.setProperty('--trx', '0deg');
      }));
    }));
    $$('.magnet').forEach((b => {
      const label = b.firstElementChild;
      const suivre = parImage((e => {
        const r = b.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        b.style.transform = `translate(${(dx * .18).toFixed(1)}px, ${(dy * .28).toFixed(1)}px)`;
        if (label) label.style.transform = `translate(${(dx * .1).toFixed(1)}px, ${(dy * .14).toFixed(1)}px)`;
        b.style.setProperty('--mx', `${e.clientX - r.left}px`);
        b.style.setProperty('--my', `${e.clientY - r.top}px`);
      }));
      b.addEventListener('pointermove', suivre);
      b.addEventListener('pointerleave', (() => {
        suivre.annuler();
        b.style.transform = '';
        if (label) label.style.transform = '';
      }));
    }));
  }
  $$('.faq-list details').forEach((d => {
    const resume = $('summary', d);
    const corps = $('.faq-a', d);
    resume.addEventListener('click', (e => {
      if (reduit) return;
      e.preventDefault();
      if (d.open) {
        const a = corps.animate([ {
          height: `${corps.offsetHeight}px`,
          opacity: 1
        }, {
          height: '0px',
          opacity: 0
        } ], {
          duration: 380,
          easing: 'cubic-bezier(.65,0,.35,1)'
        });
        d.classList.add('closing');
        a.onfinish = () => {
          d.open = false;
          d.classList.remove('closing');
        };
      } else {
        d.open = true;
        const h = corps.offsetHeight;
        corps.animate([ {
          height: '0px',
          opacity: 0
        }, {
          height: `${h}px`,
          opacity: 1
        } ], {
          duration: 480,
          easing: 'cubic-bezier(.22,.8,.24,1)'
        });
      }
    }));
  }));
  const nav = $('.nav');
  const barreLecture = $('.progress i');
  const parallaxe = $$('[data-par]').map((el => ({
    el: el,
    k: Number(el.dataset.par)
  })));
  const liens = $$('.nav-links a');
  const cibles = liens.map((a => $(a.getAttribute('href'))));
  const geo = {
    hautPage: 0,
    hero: null,
    mani: null,
    courbe: null,
    types: null,
    cibles: []
  };
  const boite = el => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      top: r.top + scrollY,
      h: r.height
    };
  };
  const etat = {
    scrolled: null,
    lecture: '',
    courant: null,
    pAccueil: -1,
    mots: -1
  };
  function mesurer() {
    geo.hautPage = document.documentElement.scrollHeight;
    geo.hero = boite(hero);
    geo.mani = boite(manifeste);
    geo.courbe = boite(courbe);
    geo.types = boite(types);
    geo.cibles = cibles.map((c => c ? boite(c).top : null));
    if (panneaux.length) mesurerPanneaux();
    etat.pAccueil = -1;
  }
  function majAccueil(y, vh) {
    if (!geo.hero || reduit) return;
    const top = geo.hero.top - y;
    if (top + geo.hero.h < 0) return;
    const p = borner(-top / vh);
    if (p === etat.pAccueil) return;
    etat.pAccueil = p;
    parallaxe.forEach((({el: el, k: k}) => {
      el.style.transform = k ? `translate3d(${k * p * 90}px, ${-p * 40}px, 0)` : `translate3d(0, ${-p * 90}px, 0) scale(${1 - p * .04})`;
    }));
  }
  function majManifeste(y, vh) {
    if (!manifeste || !geo.mani) return;
    const top = geo.mani.top - y;
    if (top + geo.mani.h < 0 || top > vh) return;
    const p = borner((vh * .85 - top) / (geo.mani.h + vh * .25));
    const n = reduit ? mots.length : Math.round(p * mots.length * 1.08);
    if (n === etat.mots) return;
    etat.mots = n;
    mots.forEach(((m, i) => m.classList.toggle('on', i < n)));
  }
  function majCourbe(y, vh) {
    if (!courbe || !geo.courbe || mobile.matches || reduit) return;
    const top = geo.courbe.top - y;
    if (top + geo.courbe.h < 0 || top > vh) return;
    dessinerCourbe(borner(-top / (geo.courbe.h - vh)));
  }
  function majNav(y, vh) {
    const scrolled = y > 8;
    if (scrolled !== etat.scrolled) {
      etat.scrolled = scrolled;
      nav.classList.toggle('is-scrolled', scrolled);
    }
    const max = geo.hautPage - vh;
    const lecture = `scaleX(${max > 0 ? y / max : 0})`;
    if (lecture !== etat.lecture) {
      etat.lecture = lecture;
      barreLecture.style.transform = lecture;
    }
    let courant = -1;
    geo.cibles.forEach(((top, i) => {
      if (top != null && top - y < vh * .45) courant = i;
    }));
    if (courant !== etat.courant) {
      etat.courant = courant;
      liens.forEach(((a, i) => a.classList.toggle('is-current', i === courant)));
    }
  }
  let enAttente = false;
  function surDefilement() {
    if (enAttente) return;
    enAttente = true;
    requestAnimationFrame((() => {
      enAttente = false;
      const y = scrollY, vh = innerHeight, vw = innerWidth;
      majNav(y, vh);
      majAccueil(y, vh);
      majManifeste(y, vh);
      majCourbe(y, vh);
      majTypes(y, vh, vw);
    }));
  }
  let delaiRedim = 0;
  function surRedim() {
    clearTimeout(delaiRedim);
    delaiRedim = setTimeout((() => {
      mesurerTypes();
      mesurer();
      if (mobile.matches || reduit) lancerCourbeAuto();
      surDefilement();
    }), 120);
  }
  addEventListener('scroll', surDefilement, {
    passive: true
  });
  addEventListener('resize', surRedim);
  addEventListener('load', (() => {
    mesurerTypes();
    mesurer();
    surDefilement();
  }));
  new ResizeObserver((() => {
    mesurer();
    surDefilement();
  })).observe(document.body);
  initNeurones();
  mesurerTypes();
  mesurer();
  surDefilement();
  const annee = $('#annee');
  if (annee) annee.textContent = String((new Date).getFullYear());
})();
