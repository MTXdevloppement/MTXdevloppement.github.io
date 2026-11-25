/* MTX Studio — comportements communs (JavaScript sans dépendance).
   1. Menu mobile.  2. Thème clair / sombre.  3. Adresse e-mail ajustée à la largeur.
   4. Index des réalisations : l’aperçu suit la ligne survolée ou ciblée au clavier.
   5. Lien « Haut de page ».
   Sans JavaScript, tout reste lisible et chaque lien fonctionne. */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const root = document.documentElement;
  const live = $('[data-live]');
  const announce = (msg) => { if (live) { live.textContent = ''; window.setTimeout(() => { live.textContent = msg; }, 60); } };

  /* 1. Menu mobile ------------------------------------------------------ */
  const toggle = $('[data-menu-toggle]');
  const menu = $('[data-menu]');
  if (toggle && menu) {
    const setOpen = (open) => {
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      menu.classList.toggle('is-visible', open);
      document.body.classList.toggle('menu-open', open);
      // Le menu suit la barre : sur les pages de pôle, elle peut avoir défilé.
      if (open) {
        const nav = toggle.closest('[data-navbar]');
        menu.style.top = nav ? Math.max(0, nav.getBoundingClientRect().bottom) + 'px' : '';
      }
    };
    toggle.addEventListener('click', () => setOpen(!toggle.classList.contains('is-open')));
    $$('[data-close-menu]', menu).forEach((a) => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
    });
    window.matchMedia('(min-width: 900px)').addEventListener('change', (m) => { if (m.matches) setOpen(false); });
  }

  /* 2. Thème ----------------------------------------------------------------- */
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const themeButtons = $$('[data-theme-toggle]');
  const current = () => root.dataset.theme || (system.matches ? 'dark' : 'light');
  const syncTheme = () => {
    const dark = current() === 'dark';
    themeButtons.forEach((btn) => {
      const label = $('[data-theme-label]', btn);
      if (label) label.textContent = dark ? 'Thème clair' : 'Thème sombre';
      if (!label) btn.setAttribute('aria-label', dark ? 'Passer au thème clair' : 'Passer au thème sombre');
    });
    $$('meta[name="theme-color"]').forEach((m) => { m.content = dark ? '#121212' : '#ffffff'; });
  };
  themeButtons.forEach((btn) => btn.addEventListener('click', () => {
    const next = current() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('mtx-theme', next); } catch (e) { /* navigation privée */ }
    syncTheme();
    announce(next === 'dark' ? 'Thème sombre activé' : 'Thème clair activé');
  }));
  system.addEventListener('change', syncTheme);
  syncTheme();

  /* 3. Texte ajusté à la largeur (adresse e-mail géante) ------------------- */
  const fits = $$('[data-fit]');
  // Lectures puis écritures groupées, dans une image d’animation : un seul recalcul de mise en page.
  let fitQueued = false;
  const fit = () => {
    if (fitQueued) return;
    fitQueued = true;
    window.requestAnimationFrame(() => {
      fitQueued = false;
      fits.forEach((box) => { box.style.fontSize = ''; });
      const sizes = fits.map((box) => {
        const line = $('[data-fit-line]', box);
        const w = box.clientWidth;
        const lw = line ? line.scrollWidth : 0;
        return w && lw ? Math.min(parseFloat(getComputedStyle(box).fontSize) * (w / lw) * 0.995, 200) : 0;
      });
      fits.forEach((box, i) => { if (sizes[i]) box.style.fontSize = sizes[i] + 'px'; });
    });
  };
  if (fits.length) {
    fit();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    if ('ResizeObserver' in window) {
      let w = 0;
      new ResizeObserver(([en]) => { const nw = Math.round(en.contentRect.width); if (nw !== w) { w = nw; fit(); } }).observe(document.body);
    } else window.addEventListener('resize', fit);
  }

  /* 4. Index des réalisations ------------------------------------------------- */
  const index = $('[data-index]');
  if (index) {
    const rows = $$('.ix-row', index);
    const shots = $$('.ix-p', index);
    const show = (key) => {
      rows.forEach((r) => r.classList.toggle('is-on', r.dataset.key === key));
      shots.forEach((s) => s.classList.toggle('is-on', s.dataset.key === key));
    };
    rows.forEach((r) => {
      r.addEventListener('pointerenter', () => show(r.dataset.key));
      r.addEventListener('focus', () => show(r.dataset.key));
    });
  }

  /* 5. Haut de page ------------------------------------------------------------ */
  $$('[data-top]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    const target = $('#contenu');
    if (target) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
  }));
})();
