/* MTX Studio — interactions du site (JavaScript sans dépendance). */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const liveRegion = $('[data-live]');
  const announce = (msg) => {
    if (!liveRegion) return;
    liveRegion.textContent = '';
    window.setTimeout(() => { liveRegion.textContent = msg; }, 40);
  };

  /* ---------------------------------------------------------------------
     Vidéo d’arrière-plan pilotée par le mouvement horizontal de la souris
     --------------------------------------------------------------------- */
  const video = $('[data-scrub]');
  if (video) {
    const SENSITIVITY = 0.8;
    let targetTime = 0;
    let prevX = null;
    let seeking = false;
    let ready = false;
    let visible = true;

    // La page s’affiche d’abord sur l’image d’attente (la première image du film).
    // La vidéo n’est demandée qu’une fois la page chargée, ou au premier geste,
    // et jamais si le visiteur économise ses données. Elle est gardée entière en
    // mémoire : chaque position répond alors tout de suite, quel que soit le serveur.
    const conn = navigator.connection;
    const saveData = !!(conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '')));
    let warmed = false;
    const pickSource = () => {
      const match = $$('source', video).find((s) => !s.media || window.matchMedia(s.media).matches);
      return match ? match.getAttribute('src') : video.getAttribute('src');
    };
    const loadDirect = () => {
      video.preload = 'auto';
      if (video.readyState === 0) video.load();
    };
    const warm = () => {
      if (warmed || saveData) return;
      warmed = true;
      const src = pickSource();
      if (!src || !window.fetch || window.location.protocol === 'file:') { loadDirect(); return; }
      fetch(src.split('#')[0])
        .then((res) => { if (!res.ok) throw new Error(String(res.status)); return res.blob(); })
        .then((blob) => {
          video.preload = 'auto';
          video.src = URL.createObjectURL(blob);
          video.load();
        })
        .catch(loadDirect);
    };
    if (document.readyState === 'complete') window.setTimeout(warm, 200);
    else window.addEventListener('load', () => window.setTimeout(warm, 200), { once: true });

    const seek = () => {
      if (!ready || seeking || !visible) return;
      const duration = video.duration;
      if (!Number.isFinite(duration)) return;
      targetTime = clamp(targetTime, 0, duration);
      if (Math.abs(video.currentTime - targetTime) < 0.02) return;
      seeking = true;
      video.currentTime = targetTime;
    };

    const onReady = () => {
      ready = true;
      targetTime = video.currentTime || 0;
    };

    // Une seule recherche à la fois : la suivante part quand la précédente est terminée.
    video.addEventListener('seeked', () => {
      seeking = false;
      if (Math.abs(video.currentTime - targetTime) >= 0.02) seek();
    });
    video.addEventListener('loadedmetadata', onReady);
    if (video.readyState >= 1) onReady();

    const move = (x) => {
      warm();
      if (prevX !== null && Number.isFinite(video.duration)) {
        const delta = x - prevX;
        targetTime += (delta / Math.max(window.innerWidth, 1)) * SENSITIVITY * video.duration;
        targetTime = clamp(targetTime, 0, video.duration);
        seek();
      }
      prevX = x;
    };

    window.addEventListener('mousemove', (e) => move(e.clientX), { passive: true });
    // Sur écran tactile, un glissé horizontal fait aussi défiler la vidéo.
    window.addEventListener('touchstart', (e) => { prevX = e.touches[0].clientX; }, { passive: true });
    window.addEventListener('touchmove', (e) => move(e.touches[0].clientX), { passive: true });

    // Inutile de décoder des images quand la vidéo est cachée par le contenu.
    const zones = $$('[data-video-zone]');
    if (zones.length && 'IntersectionObserver' in window) {
      const seen = new Set();
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => (en.isIntersecting ? seen.add(en.target) : seen.delete(en.target)));
        visible = seen.size > 0;
        if (visible) seek();
      });
      zones.forEach((z) => io.observe(z));
    }
  }

  /* ---------------------------------------------------------------------
     Machine à écrire
     --------------------------------------------------------------------- */
  const useTypewriter = (text, onUpdate, speed = 38, startDelay = 600) => {
    let index = 0;
    let interval = 0;
    onUpdate({ displayed: '', done: false });
    const delay = window.setTimeout(() => {
      interval = window.setInterval(() => {
        index += 1;
        const done = index >= text.length;
        onUpdate({ displayed: text.slice(0, index), done });
        if (done) window.clearInterval(interval);
      }, speed);
    }, startDelay);
    return () => { window.clearTimeout(delay); window.clearInterval(interval); };
  };

  // Le texte reste entier dans la page, une seule fois : la partie pas encore
  // « tapée » est seulement transparente, ce qui réserve aussi sa place.
  const typewriter = $('[data-typewriter]');
  if (typewriter && !reduceMotion) {
    const text = typewriter.textContent.trim();
    const typed = document.createElement('span');
    const cursor = document.createElement('span');
    const rest = document.createElement('span');
    cursor.className = 'type-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    rest.className = 'tw-rest';
    rest.textContent = text;
    typewriter.replaceChildren(typed, cursor, rest);
    useTypewriter(text, ({ displayed, done }) => {
      typed.textContent = displayed;
      rest.textContent = text.slice(displayed.length);
      cursor.classList.toggle('is-done', done);
    });
  }

  // Les pilules apparaissent 400 ms après le chargement, sans attendre la frappe.
  const actions = $('[data-actions]');
  if (actions) window.setTimeout(() => actions.classList.add('is-visible'), 400);

  /* ---------------------------------------------------------------------
     Barre de navigation : fond au défilement, section active
     --------------------------------------------------------------------- */
  const navbar = $('[data-navbar]');
  if (navbar && !navbar.classList.contains('is-solid')) {
    let ticking = false;
    const update = () => {
      ticking = false;
      navbar.classList.toggle('is-scrolled', window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  const navLinks = $$('[data-nav]');
  const sections = $$('[data-section]');
  if (navLinks.length && sections.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        navLinks.forEach((a) => {
          if (a.dataset.nav === en.target.id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => io.observe(s));
  }

  /* ---------------------------------------------------------------------
     Menu mobile
     --------------------------------------------------------------------- */
  const toggle = $('[data-menu-toggle]');
  const menu = $('[data-menu]');
  if (toggle && menu) {
    const setOpen = (open) => {
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      menu.classList.toggle('is-visible', open);
      document.body.classList.toggle('menu-open', open);
      if (open) { const first = $('a', menu); if (first) first.focus({ preventScroll: true }); }
    };
    toggle.addEventListener('click', () => setOpen(!toggle.classList.contains('is-open')));
    $$('[data-close-menu]', menu).forEach((a) => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
    });
    window.matchMedia('(min-width: 900px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
  }

  /* ---------------------------------------------------------------------
     Copier l’adresse e-mail
     --------------------------------------------------------------------- */
  const status = $('[data-copy-status]');
  $$('[data-copy]').forEach((btn) => {
    const label = $('[data-copy-text]', btn);
    const original = label ? label.textContent : '';
    let timer = 0;
    btn.addEventListener('click', async () => {
      const value = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(value);
        if (label) label.textContent = 'Adresse copiée';
        if (status) status.textContent = value + ' est dans le presse-papiers.';
        announce(value + ' copiée dans le presse-papiers.');
      } catch {
        window.location.href = 'mailto:' + value;
        return;
      }
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (label) label.textContent = original;
        if (status) status.textContent = '';
      }, 2200);
    });
  });

  /* ---------------------------------------------------------------------
     Filtres des réalisations
     --------------------------------------------------------------------- */
  const filters = $('[data-filters]');
  const works = $$('.work');
  if (filters && works.length) {
    const statusEl = $('[data-filter-status]', filters);
    const buttons = $$('[data-filter]', filters);
    const labels = { all: '', iphone: ' pour iPhone', ipad: ' pour iPad', watch: ' pour Apple Watch', mac: ' pour Mac' };
    buttons.forEach((btn) => btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      let count = 0;
      works.forEach((w) => {
        const show = f === 'all' || w.dataset.platforms.split(' ').includes(f);
        w.hidden = !show;
        w.classList.remove('is-entering');
        if (show) {
          count += 1;
          w.classList.add('is-in');
          if (!reduceMotion) { void w.offsetWidth; w.classList.add('is-entering'); }
        }
      });
      statusEl.textContent = count + (count > 1 ? ' réalisations' : ' réalisation') + labels[f];
    }));
  }

  /* ---------------------------------------------------------------------
     Apparition au défilement
     --------------------------------------------------------------------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------------------------------------------------------------------
     Phrase qui se précise mot à mot au défilement
     --------------------------------------------------------------------- */
  const unblur = $('[data-unblur]');
  if (unblur && !reduceMotion) {
    const words = [];
    const split = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const span = document.createElement('span');
            span.className = 'w';
            span.textContent = part;
            words.push(span);
            frag.appendChild(span);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.classList.contains('w-accent')) {
          // Le groupe en dégradé reste d’un seul tenant pour garder un dégradé continu.
          child.classList.add('w');
          words.push(child);
        } else if (child.nodeType === 1) {
          split(child);
        }
      });
    };
    split(unblur);

    let last = -1;
    let ticking = false;
    const paint = () => {
      ticking = false;
      const r = unblur.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = clamp((vh * 0.9 - r.top) / (r.height + vh * 0.35), 0, 1);
      const k = Math.round(p * words.length * 1.15 * 20) / 20;
      if (k === last) return;
      last = k;
      words.forEach((w, i) => {
        const t = clamp(k - i, 0, 1);
        w.style.setProperty('--b', ((1 - t) * 6).toFixed(2) + 'px');
        w.style.setProperty('--o', (0.3 + 0.7 * t).toFixed(3));
      });
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(paint); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    paint();
  }

  /* ---------------------------------------------------------------------
     Texte ajusté à la largeur (adresse e-mail, signature du pied de page)
     --------------------------------------------------------------------- */
  const fits = $$('[data-fit]');
  const fit = () => {
    fits.forEach((box) => {
      const line = $('[data-fit-line]', box);
      if (!line) return;
      const st = getComputedStyle(box);
      const avail = box.clientWidth - parseFloat(st.paddingLeft) - parseFloat(st.paddingRight);
      box.style.fontSize = '100px';
      const w = line.getBoundingClientRect().width;
      if (w > 0) box.style.fontSize = Math.min(320, (100 * avail) / w * 0.995).toFixed(2) + 'px';
    });
  };
  if (fits.length) {
    fit();
    let rt = 0;
    window.addEventListener('resize', () => { window.cancelAnimationFrame(rt); rt = window.requestAnimationFrame(fit); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    window.addEventListener('load', fit);
  }

  /* ---------------------------------------------------------------------
     Thème clair / sombre
     --------------------------------------------------------------------- */
  const root = document.documentElement;
  const themeButtons = $$('[data-theme-toggle]');
  if (themeButtons.length) {
    const system = window.matchMedia('(prefers-color-scheme: dark)');
    const current = () => root.dataset.theme || (system.matches ? 'dark' : 'light');
    const sync = () => {
      const dark = current() === 'dark';
      themeButtons.forEach((btn) => {
        const label = dark ? 'Passer au thème clair' : 'Passer au thème sombre';
        const text = $('[data-theme-label]', btn);
        if (text) text.textContent = dark ? 'Thème clair' : 'Thème sombre';
        else { btn.setAttribute('aria-label', label); btn.title = label; }
      });
      // La couleur de la barre du navigateur suit le thème choisi.
      $$('meta[name="theme-color"]').forEach((m) => { m.content = dark ? '#0b0b0c' : '#f4f4f2'; });
    };
    const apply = (theme) => {
      root.dataset.theme = theme;
      try { localStorage.setItem('mtx-theme', theme); } catch { /* stockage indisponible : le choix vaut pour cette page */ }
      sync();
    };
    themeButtons.forEach((btn) => btn.addEventListener('click', () => {
      const next = current() === 'dark' ? 'light' : 'dark';
      if (document.startViewTransition && !reduceMotion) document.startViewTransition(() => apply(next));
      else apply(next);
      announce(next === 'dark' ? 'Thème sombre activé.' : 'Thème clair activé.');
    }));
    system.addEventListener('change', sync);
    sync();
  }

  /* ---------------------------------------------------------------------
     Bandeau des outils : à l’arrêt quand il est hors de l’écran
     --------------------------------------------------------------------- */
  const marquee = $('.marquee');
  if (marquee && 'IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((en) => marquee.classList.toggle('is-paused', !en.isIntersecting));
    }).observe(marquee);
  }

  /* ---------------------------------------------------------------------
     Retour en haut
     --------------------------------------------------------------------- */
  $$('[data-top]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    const target = $('#contenu');
    if (target) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
  }));
})();
