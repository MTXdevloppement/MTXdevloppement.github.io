/* MTX Studio — scène du premier écran : l’écran d’accueil du studio.
   Un iPhone et une Apple Watch en HTML ; on ouvre une app, elle déroule ses
   captures réelles. JavaScript sans dépendance. Sans lui, les icônes restent
   des liens vers les sites des réalisations. */
(() => {
  'use strict';

  const scene = document.querySelector('[data-scene]');
  if (!scene) return;

  const $ = (sel, root = scene) => root.querySelector(sel);
  const $$ = (sel, root = scene) => Array.from(root.querySelectorAll(sel));
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover)').matches;
  const narrow = window.matchMedia('(max-width: 767px)');
  const conn = navigator.connection;
  const saveData = !!(conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '')));

  const tilt = $('[data-scene-tilt]');
  const screen = $('[data-screen]');
  const home = $('[data-home]');
  const view = $('[data-appview]');
  const shotsBox = $('[data-shots]');
  const splash = $('[data-splash]');
  const mailBody = $('[data-mail-body]');
  const captions = $$('[data-scene-caption]', document);

  const MAIL = 'mailto:mtxstudio@proton.me?subject=Un%20projet%20pour%20MTX%20Studio';
  const SHOT_MS = 2800;
  const IDLE = {
    name: 'L’écran d’accueil du studio',
    legend: canHover ? 'Cliquez sur une app pour l’ouvrir' : 'Touchez une app pour l’ouvrir',
  };

  // Les captures sont celles des sites des réalisations : rien n’est redessiné.
  const APPS = {
    gorun: {
      name: 'GoRun', site: 'realisations/foulee/index.html', link: ['Ouvrir le site', ' de GoRun'],
      icon: 'assets/img/realisations/icone-gorun.webp', bg: '#000', bar: '#fff',
      base: 'realisations/foulee/assets/img/ecrans/', avif: true,
      shots: [
        ['course-stats-860', 'La course en direct'],
        ['course-carte-860', 'Le tracé sur la carte'],
        ['detail-carte-860', 'Le résumé de la sortie'],
      ],
    },
    viewer: {
      name: 'MTX Viewer', site: 'realisations/viewer/index.html', link: ['Ouvrir le site', ' de MTX Viewer'],
      icon: 'assets/img/realisations/icone-viewer.webp', bg: '#f1ece4', bar: '#000',
      base: 'realisations/viewer/assets/img/ecrans/', avif: false,
      shots: [
        ['site', 'Un site ouvert dans l’app'],
        ['selection', 'Un élément inspecté'],
        ['audit', 'L’audit de la page'],
      ],
    },
    triade: {
      name: 'Triade', site: 'realisations/triade/index.html', link: ['Ouvrir le site', ' de Triade'],
      icon: 'assets/img/realisations/icone-triade.webp', bg: '#f2f2f7', bar: '#000',
      base: 'realisations/triade/assets/img/ecrans/', avif: true,
      shots: [
        ['accueil', 'Texte, tableur, présentation'],
        ['redaction', 'Un courrier rédigé à partir d’une idée'],
        ['tableur', 'Un devis dans le tableur'],
      ],
    },
    mail: {
      name: 'Nouveau message', site: MAIL, link: ['Écrire au studio', ''],
      legend: 'À : mtxstudio@proton.me', shots: [],
    },
  };
  const ORDER = ['gorun', 'viewer', 'triade'];

  let current = null;       // app ouverte
  let source = null;        // icône d’où part le zoom
  let autoOpened = false;   // ouverte par la démonstration ou par la fenêtre Contact
  let shotIndex = 0;
  let shotTimer = 0;
  let cleanTimer = 0;
  let swapTimer = 0;
  let typeTimer = 0;
  let demoTimer = 0;
  let demoIndex = 0;
  let userTook = false;     // le visiteur a pris la main : plus de démonstration
  let visible = true;       // la scène est-elle à l’écran ?
  let inContact = false;
  let contactOpened = false; // le message a été ouvert par la fenêtre Contact
  let started = false;

  /* ---------------------------------------------------------------------
     Heure réelle dans la barre d’état et sur la montre
     --------------------------------------------------------------------- */
  const clocks = $$('[data-clock]');
  const watchDate = $('[data-watch-date]');
  const tick = () => {
    const now = new Date();
    const time = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    clocks.forEach((c) => { c.textContent = time; });
    if (watchDate) watchDate.textContent = now.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  };
  tick();
  window.setInterval(tick, 20000);

  /* ---------------------------------------------------------------------
     Captures : construites à la demande, préchargées au calme
     --------------------------------------------------------------------- */
  const sets = {};
  const buildSet = (id) => {
    if (sets[id]) return sets[id];
    const app = APPS[id];
    const set = document.createElement('span');
    set.dataset.set = id;
    app.shots.forEach(([file]) => {
      const pic = document.createElement('picture');
      if (app.avif) {
        const src = document.createElement('source');
        src.type = 'image/avif';
        src.srcset = app.base + file + '.avif';
        pic.appendChild(src);
      }
      const img = document.createElement('img');
      img.alt = '';
      img.decoding = 'async';
      img.draggable = false;
      img.src = app.base + file + '.webp';
      pic.appendChild(img);
      set.appendChild(pic);
    });
    shotsBox.appendChild(set);
    sets[id] = set;
    return set;
  };
  const preload = () => { if (!saveData) ORDER.forEach(buildSet); };

  /* ---------------------------------------------------------------------
     Légende sous le téléphone
     --------------------------------------------------------------------- */
  const paintBars = () => {
    captions.forEach((c) => {
      $$('[data-sc-bars] i', c).forEach((bar, i) => {
        bar.classList.remove('is-on', 'is-done');
        if (!current || !APPS[current].shots.length) return;
        if (i < shotIndex) bar.classList.add('is-done');
        if (i === shotIndex) { void bar.offsetWidth; bar.classList.add('is-on'); }
      });
    });
  };
  const paintCaption = () => {
    const app = current ? APPS[current] : null;
    captions.forEach((c) => {
      c.classList.toggle('is-app', !!app);
      c.classList.toggle('has-shots', !!app && app.shots.length > 0);
      c.style.setProperty('--shot-ms', SHOT_MS + 'ms');
      const name = $('[data-sc-name]', c);
      const legend = $('[data-sc-legend]', c);
      const link = $('[data-sc-link]', c);
      const close = $('[data-scene-close]', c);
      name.textContent = app ? app.name : IDLE.name;
      legend.textContent = app ? (app.shots.length ? app.shots[shotIndex][1] : app.legend) : IDLE.legend;
      if (app) {
        // « de GoRun » est masqué dans la légende compacte du mobile, où le nom précède déjà le lien.
        const of = document.createElement('span');
        of.className = 'sc-of';
        of.textContent = app.link[1];
        link.setAttribute('href', app.site);
        link.replaceChildren(document.createTextNode(app.link[0]), of);
      }
      if (close) close.hidden = !app;
    });
    paintBars();
  };

  /* ---------------------------------------------------------------------
     Captures qui se poussent, comme une navigation
     --------------------------------------------------------------------- */
  const shotImages = () => (current && sets[current] ? $$('img', sets[current]) : []);
  const showShot = (index, instant) => {
    const imgs = shotImages();
    if (!imgs.length) return;
    const next = (index + imgs.length) % imgs.length;
    window.clearTimeout(cleanTimer);
    if (instant) {
      shotsBox.classList.add('no-anim');
      imgs.forEach((img, i) => { img.classList.remove('is-off'); img.classList.toggle('is-on', i === next); });
      void shotsBox.offsetWidth;
      shotsBox.classList.remove('no-anim');
    } else {
      imgs.forEach((img, i) => {
        if (i === next) { img.classList.remove('is-off'); img.classList.add('is-on'); }
        else if (img.classList.contains('is-on')) { img.classList.remove('is-on'); img.classList.add('is-off'); }
      });
      cleanTimer = window.setTimeout(() => imgs.forEach((img) => img.classList.remove('is-off')), 560);
    }
    shotIndex = next;
    paintCaption();
  };
  const scheduleShots = () => {
    window.clearInterval(shotTimer);
    if (!current || APPS[current].shots.length < 2 || reduceMotion) return;
    shotTimer = window.setInterval(() => { if (visible && !document.hidden) showShot(shotIndex + 1); }, SHOT_MS);
  };

  /* ---------------------------------------------------------------------
     Message qui s’écrit
     --------------------------------------------------------------------- */
  const mailText = mailBody ? mailBody.innerHTML.replace(/<br\s*\/?>/gi, '\n').replace(/&nbsp;/g, ' ').trim() : '';
  const paintMail = (n) => {
    mailBody.textContent = '';
    mailText.slice(0, n).split('\n').forEach((line, i) => {
      if (i) mailBody.appendChild(document.createElement('br'));
      mailBody.appendChild(document.createTextNode(line));
    });
    const caret = document.createElement('span');
    caret.className = 'mail-caret';
    caret.setAttribute('aria-hidden', 'true');
    mailBody.appendChild(caret);
  };
  const typeMail = () => {
    window.clearInterval(typeTimer);
    if (!mailBody) return;
    if (reduceMotion) { paintMail(mailText.length); return; }
    let n = 0;
    paintMail(0);
    typeTimer = window.setInterval(() => {
      if (!visible) return;
      n += 1;
      paintMail(n);
      if (n >= mailText.length) window.clearInterval(typeTimer);
    }, 42);
  };

  /* ---------------------------------------------------------------------
     Ouvrir et refermer une app
     --------------------------------------------------------------------- */
  const iconOf = (id) => $('.ios-grid [data-app="' + id + '"]') || $('.ios-dock [data-app="' + id + '"]');
  // Centre de l’icône dans l’écran, en pixels de mise en page (insensible à la rotation 3D).
  const originOf = (el) => {
    const icon = (el && screen.contains(el) && el.querySelector('img, i')) || el;
    let x = icon.offsetWidth / 2;
    let y = icon.offsetHeight / 2;
    let node = icon;
    while (node && node !== screen) { x += node.offsetLeft; y += node.offsetTop; node = node.offsetParent; }
    return { dx: x - screen.clientWidth / 2, dy: y - screen.clientHeight / 2 };
  };
  const setFocusable = (on) => {
    $$('button, a', view).forEach((el) => { el.tabIndex = on && el.offsetParent !== null ? 0 : -1; });
  };

  const open = (id, from, auto = false) => {
    const app = APPS[id];
    if (!app || current === id) return;
    window.clearTimeout(swapTimer);
    if (current) {           // une autre app est ouverte : on la referme d’abord
      close(true);
      swapTimer = window.setTimeout(() => open(id, from, auto), reduceMotion ? 0 : 460);
      return;
    }
    const hadFocus = from && document.activeElement === from;
    source = from && screen.contains(from) ? from : iconOf(id);
    const o = originOf(source);
    view.style.setProperty('--dx', o.dx.toFixed(1) + 'px');
    view.style.setProperty('--dy', o.dy.toFixed(1) + 'px');
    view.style.setProperty('--bar', app.bar || 'var(--mail-ink)');
    view.dataset.kind = app.shots.length ? 'shots' : 'mail';
    if (app.shots.length) {
      splash.style.setProperty('--app-bg', app.bg);
      splash.style.backgroundImage = 'url("' + app.icon + '")';
      const set = buildSet(id);
      Object.values(sets).forEach((s) => s.classList.toggle('is-set', s === set));
    } else {
      splash.style.backgroundImage = 'none';
      typeMail();
    }
    current = id;
    autoOpened = auto;
    shotIndex = 0;
    showShot(0, true);
    void view.offsetWidth;
    scene.classList.add('is-app');
    scene.dataset.app = id;
    // La course de GoRun continue une fois l’app refermée (île et montre), jusqu’à l’app suivante.
    scene.classList.toggle('is-running', id === 'gorun');
    home.inert = true;
    view.setAttribute('aria-hidden', 'false');
    setFocusable(true);
    if (hadFocus && !auto) (app.shots.length ? shotsBox : $('.mail-send', view)).focus({ preventScroll: true });
    paintCaption();
    scheduleShots();
  };

  const close = (silent = false) => {
    if (!current) return;
    const hadFocus = view.contains(document.activeElement);
    window.clearInterval(shotTimer);
    window.clearInterval(typeTimer);
    scene.classList.remove('is-app');
    delete scene.dataset.app;
    home.inert = false;
    view.setAttribute('aria-hidden', 'true');
    setFocusable(false);
    current = null;
    autoOpened = false;
    contactOpened = false;
    if (hadFocus && source) source.focus({ preventScroll: true });
    if (!silent) paintCaption();
  };

  /* ---------------------------------------------------------------------
     Démonstration : les trois apps s’ouvrent tour à tour tant que le
     visiteur n’a rien touché
     --------------------------------------------------------------------- */
  const canDemo = () => !userTook && visible && !inContact && !document.hidden && window.scrollY < window.innerHeight * 0.3;
  const demo = (delay) => {
    window.clearTimeout(demoTimer);
    if (userTook || reduceMotion || saveData) return;
    demoTimer = window.setTimeout(() => {
      if (!canDemo() || current) { demo(1600); return; }
      const id = ORDER[demoIndex % ORDER.length];
      demoIndex += 1;
      open(id, iconOf(id), true);
      demoTimer = window.setTimeout(() => {
        if (autoOpened && current === id) close();
        demo(1700);
      }, SHOT_MS * APPS[id].shots.length + 300);
    }, delay);
  };
  const takeOver = () => {
    if (userTook) return;
    userTook = true;
    window.clearTimeout(demoTimer);
    autoOpened = false;
  };

  /* ---------------------------------------------------------------------
     Gestes
     --------------------------------------------------------------------- */
  scene.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-app]');
    if (trigger) {
      e.preventDefault();
      takeOver();
      open(trigger.dataset.app, trigger);
      return;
    }
    if (e.target.closest('[data-shots]')) {
      takeOver();
      showShot(shotIndex + 1);
      scheduleShots();
    }
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('[data-scene-close]')) return;
    takeOver();
    close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && current) { takeOver(); close(); }
  });
  scene.addEventListener('keydown', takeOver);
  $$('[data-app]').forEach((el) => {
    const app = APPS[el.dataset.app];
    if (app && app.shots.length && !el.hasAttribute('aria-label')) el.setAttribute('aria-label', 'Ouvrir ' + app.name + ' dans la maquette');
  });

  /* ---------------------------------------------------------------------
     Fréquence cardiaque de la montre pendant la course
     --------------------------------------------------------------------- */
  const bpm = $('[data-bpm]');
  if (bpm && !reduceMotion) {
    let value = 158;
    window.setInterval(() => {
      if (!visible || !scene.classList.contains('is-running')) return;
      value = clamp(value + Math.round(Math.random() * 4 - 2), 154, 162);
      bpm.textContent = String(value);
    }, 1700);
  }

  /* ---------------------------------------------------------------------
     Pose de la maquette : entrée, pivot à la souris, bascule au défilement
     --------------------------------------------------------------------- */
  let p = 0;               // avancée du défilement sur le premier écran (0 à 1)
  let pointerX = 0;
  let pointerY = 0;
  let lastMove = -1e9;
  let rx = 0;
  let ry = 0;
  let face = 1;            // 1 : de trois quarts ; plus bas : tournée vers le visiteur (app ouverte)
  let enterStart = 0;
  let raf = 0;

  const contactWindow = document.querySelector('.contact .window');
  const readScroll = () => {
    const vh = window.innerHeight;
    let near = false;
    if (contactWindow) {
      const r = contactWindow.getBoundingClientRect();
      near = r.top < vh && r.bottom > 0;
    }
    p = near ? 0 : clamp(window.scrollY / Math.max(vh, 1), 0, 1);
  };

  const frame = (now) => {
    raf = 0;
    if (!visible) return;
    if (!enterStart) enterStart = now;
    const e = clamp((now - enterStart) / 1500, 0, 1);
    const enter = 1 - Math.pow(1 - e, 4);
    let tx = pointerX;
    let ty = pointerY;
    if (now - lastMove > 3200) {        // pas de souris : balancement lent
      tx = Math.sin(now / 2700) * 0.42;
      ty = Math.cos(now / 3500) * 0.3;
    }
    rx += (-ty * 5 - rx) * 0.06;
    ry += (tx * 11 - ry) * 0.06;
    face += ((current ? 0.45 : 1) - face) * 0.07;
    const small = narrow.matches;
    const baseX = small ? 7 : 5;
    const baseY = (small ? -9 : -17) * face;
    const vh = window.innerHeight;
    const y = (1 - enter) * 0.1 * vh - p * 0.08 * vh;
    const s = (0.9 + 0.1 * enter) * (1 - p * 0.14);
    tilt.style.transform =
      'translate3d(0,' + y.toFixed(1) + 'px,0) scale(' + s.toFixed(4) + ') ' +
      'rotateX(' + (baseX + rx + p * 26 + (1 - enter) * 10).toFixed(2) + 'deg) ' +
      'rotateY(' + (baseY + ry - (1 - enter) * 38).toFixed(2) + 'deg)';
    tilt.style.setProperty('--gl', (ry * 3.2 + (1 - enter) * 60).toFixed(1));
    raf = window.requestAnimationFrame(frame);
  };
  const run = () => { if (!raf && visible && !reduceMotion) raf = window.requestAnimationFrame(frame); };

  if (!reduceMotion) {
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      pointerX = (e.clientX / Math.max(window.innerWidth, 1)) * 2 - 1;
      pointerY = (e.clientY / Math.max(window.innerHeight, 1)) * 2 - 1;
      lastMove = performance.now();
    }, { passive: true });
    window.addEventListener('scroll', readScroll, { passive: true });
    window.addEventListener('resize', readScroll);
    readScroll();
  }

  /* ---------------------------------------------------------------------
     La scène ne tourne que lorsqu’elle est visible ; dans la fenêtre
     « Contact », le téléphone passe sur un nouveau message
     --------------------------------------------------------------------- */
  const zones = $$('[data-video-zone]', document);
  if (zones.length && 'IntersectionObserver' in window) {
    const seen = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => (en.isIntersecting ? seen.add(en.target) : seen.delete(en.target)));
      visible = seen.size > 0;
      scene.classList.toggle('is-off', !visible);
      run();
    });
    zones.forEach((z) => io.observe(z));
  }
  if (contactWindow && 'IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        inContact = en.isIntersecting;
        if (inContact) {
          if (current !== 'mail') { open('mail', iconOf('mail'), true); contactOpened = true; }
        } else if (current === 'mail' && contactOpened) {
          close();
          demo(2200);
        }
      });
    }, { threshold: 0.3 }).observe(contactWindow);
  }
  document.addEventListener('visibilitychange', run);

  /* ---------------------------------------------------------------------
     Départ
     --------------------------------------------------------------------- */
  paintCaption();
  const start = () => {
    if (started) return;
    started = true;
    scene.classList.add('is-ready');
    run();
    // Les délais d’entrée ne doivent pas retarder les survols ensuite.
    window.setTimeout(() => scene.classList.add('is-live'), reduceMotion ? 0 : 2000);
    window.setTimeout(preload, 900);
    demo(3200);
  };
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
  // Sécurité : la maquette apparaît même si une ressource tarde.
  window.setTimeout(start, 2500);
})();
