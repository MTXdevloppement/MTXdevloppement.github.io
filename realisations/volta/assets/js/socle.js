(() => {
  'use strict';

  const sansBarreSafari = (fn) => {
    const tactile = matchMedia('(hover: none) and (pointer: coarse)').matches;
    let l = innerWidth, h = innerHeight;
    return (e) => {
      if (tactile && innerWidth === l && Math.abs(innerHeight - h) < 160) return;
      l = innerWidth; h = innerHeight; fn(e);
    };
  };
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tactile = matchMedia('(hover: none)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const borne = (v, a, b) => Math.min(Math.max(v, a), b);
  const plage = (v, a, b) => borne((v - a) / (b - a), 0, 1);
  const sortie = (t) => 1 - (1 - t) ** 3;
  const attendre = (ms) => new Promise((ok) => setTimeout(ok, ms));
  const nombre = new Intl.NumberFormat('fr-FR');

  function decouper(el) {
    let n = 0;
    const mots = [];
    const traiter = (noeud, classe) => {
      for (const enfant of [...noeud.childNodes]) {
        if (enfant.nodeType === 3) {
          const frag = document.createDocumentFragment();
          enfant.textContent.split(/([ \t\n\r]+)/).forEach((morceau) => {
            if (!morceau) return;
            if (/^[ \t\n\r]+$/.test(morceau)) { frag.append(' '); return; }
            const w = document.createElement('span');
            w.className = 'w' + (classe ? ' ' + classe : '');
            const i = document.createElement('i');
            i.textContent = morceau;
            w.style.setProperty('--wi', n++);
            w.append(i);
            frag.append(w);
            mots.push(w);
          });
          enfant.replaceWith(frag);
        } else if (enfant.nodeType === 1) {
          traiter(enfant, enfant.className);
          enfant.replaceWith(...enfant.childNodes);
        }
      }
    };
    traiter(el, '');
    return mots;
  }
  $$('.split').forEach((el) => { el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim()); decouper(el); });
  const manif = $('#manif');
  const motsManif = manif ? decouper(manif) : [];

  const apparition = new IntersectionObserver((entrees) => {
    for (const e of entrees) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('is-in');
      e.target.dispatchEvent(new Event('apparu'));
      apparition.unobserve(e.target);
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
  $$('[data-reveal]').forEach((el) => apparition.observe(el));
  const portee = new IntersectionObserver((entrees) => {
    for (const e of entrees) {
      e.target.classList.toggle('is-paused', !e.isIntersecting);
      e.target.dispatchEvent(new Event(e.isIntersecting ? 'portee:entree' : 'portee:sortie'));
    }
  }, { rootMargin: '100px 0px' });
  $$('[data-scope]').forEach((el) => portee.observe(el));

  function compter(el, vers, duree = 1100, format = (v) => nombre.format(Math.round(v))) {
    if (reduit) { el.textContent = format(vers); return; }
    const t0 = performance.now();
    const pas = (t) => {
      const k = Math.min((t - t0) / duree, 1);
      el.textContent = format(vers * sortie(k));
      if (k < 1) requestAnimationFrame(pas);
    };
    requestAnimationFrame(pas);
  }
  $$('[data-compte]').forEach((el) => {
    const vers = Number(el.dataset.compte);
    if (reduit || !vers) return;
    el.textContent = '0';
    el.closest('[data-reveal]').addEventListener('apparu', () => compter(el, vers), { once: true });
  });

  const nav = $('.nav'), barre = $('.nav-progress'), liens = $$('.nav-links a');
  const sectionActive = new IntersectionObserver((entrees) => {
    for (const e of entrees) {
      if (!e.isIntersecting) continue;
      liens.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === '#' + e.target.id));
    }
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main > section[id]').forEach((s) => sectionActive.observe(s));

  const echelles = $$('.echelle');
  function mesurer() {
    for (const e of echelles) {
      const p = e.firstElementChild;
      e.style.setProperty('--s', e.clientWidth / p.offsetWidth);
    }
  }

  let vh = innerHeight, attendu = false;
  const abonnes = [];
  function surDefilement() {
    attendu = false;
    const y = scrollY;
    if (nav) nav.classList.toggle('is-scrolled', y > 8);
    const max = document.documentElement.scrollHeight - vh;
    if (barre) barre.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    if (motsManif.length) {
      const r = manif.getBoundingClientRect();
      const p = reduit ? 1 : plage(vh * .82 - r.top, 0, r.height + vh * .3);
      const allumes = Math.round(p * motsManif.length);
      motsManif.forEach((w, i) => w.classList.toggle('on', i < allumes));
    }
    abonnes.forEach((f) => f(y, vh));
  }
  addEventListener('scroll', () => { if (!attendu) { attendu = true; requestAnimationFrame(surDefilement); } }, { passive: true });
  addEventListener('resize', sansBarreSafari(() => { vh = innerHeight; mesurer(); surDefilement(); }), { passive: true });
  if ('ResizeObserver' in window) { const ro = new ResizeObserver(mesurer); echelles.forEach((e) => ro.observe(e)); }
  mesurer();

  if (matchMedia('(hover: none)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'touch' || !e.isPrimary) return;
      e.target.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: e.clientX, clientY: e.clientY, pointerId: e.pointerId, pointerType: 'touch', isPrimary: true }));
    }, { passive: true });
  }
  {
    $$('.pan').forEach((p) => p.addEventListener('pointermove', (e) => {
      const r = p.getBoundingClientRect();
      p.style.setProperty('--mx', `${e.clientX - r.left}px`);
      p.style.setProperty('--my', `${e.clientY - r.top}px`);
    }, { passive: true }));
    if (!reduit) $$('.magnet').forEach((b) => {
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        b.style.translate = `${(e.clientX - r.left - r.width / 2) * .18}px ${(e.clientY - r.top - r.height / 2) * .3}px`;
      });
      b.addEventListener('pointerleave', () => { b.style.translate = ''; });
    });
  }
  const annee = $('#annee');
  if (annee) annee.textContent = new Date().getFullYear();

  window.Socle = { $, $$, borne, plage, sortie, attendre, nombre, reduit, tactile, compter, mesurer, surDefile: (f) => abonnes.push(f) };
  requestAnimationFrame(surDefilement);
})();
