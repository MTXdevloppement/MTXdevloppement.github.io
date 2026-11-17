(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const io = (cb, opts) => ('IntersectionObserver' in window ? new IntersectionObserver(cb, opts) : null);

  const vus = io((en, obs) => en.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('est-vu'); obs.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  $$('.apparait, .temps').forEach((el) => (vus ? vus.observe(el) : el.classList.add('est-vu')));

  const liens = $$('.barre-nav a');
  const suivi = io((en) => en.forEach((e) => {
    if (!e.isIntersecting) return;
    liens.forEach((a) => a.classList.toggle('est-ici', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  if (suivi) liens.forEach((a) => { const s = $(a.getAttribute('href')); if (s) suivi.observe(s); });

  const jouer = $('[data-jouer]'), partie = $('#partie');
  if (jouer && partie) jouer.addEventListener('click', (e) => {
    e.preventDefault();
    partie.scrollIntoView({ behavior: calme ? 'auto' : 'smooth', block: 'center' });
    partie.focus({ preventScroll: true });
  });

  const gamme = $('[data-gamme]'), notes = $$('[data-notes] li');
  if (gamme) {
    let audio = null;
    const freq = [523.25, 587.33, 659.25, 783.99, 880];
    gamme.addEventListener('click', () => {
      try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); } catch { audio = null; }
      notes.forEach((n) => n.classList.remove('est-jouee'));
      freq.forEach((f, i) => {
        setTimeout(() => notes[i] && notes[i].classList.add('est-jouee'), i * 260);
        if (!audio) return;
        const t = audio.currentTime + i * 0.26, o = audio.createOscillator(), g = audio.createGain();
        o.type = 'triangle'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.2, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
        o.connect(g).connect(audio.destination); o.start(t); o.stop(t + 0.5);
      });
      setTimeout(() => notes.forEach((n) => n.classList.remove('est-jouee')), 2600);
    });
  }

  const montee = $('[data-montee]'), alti = $('[data-alti]'), altiZone = $('[data-alti-zone]'), jauge = $('[data-alti-jauge]');
  const paliers = $$('.palier');
  if (montee && paliers.length) {
    let affiche = 1, image = 0;
    const compter = (cible) => {
      cancelAnimationFrame(image);
      const depart = affiche, t0 = performance.now(), duree = calme ? 1 : 700;
      const pas = (t) => {
        const k = Math.min(1, (t - t0) / duree), e = 1 - Math.pow(1 - k, 3);
        affiche = Math.round(depart + (cible - depart) * e);
        alti.textContent = String(affiche).padStart(2, '0');
        if (k < 1) image = requestAnimationFrame(pas);
      };
      image = requestAnimationFrame(pas);
    };
    const activer = (p) => {
      paliers.forEach((x) => x.classList.toggle('est-actif', x === p));
      const n = +p.dataset.palier;
      $$('.vignette', montee).forEach((v) => v.classList.toggle('est-actif', v.dataset.v === p.dataset.palier));
      montee.dataset.zone = p.dataset.zone;
      altiZone.textContent = 'Zone ' + (Math.floor((n - 1) / 10) + 1);
      jauge.parentElement.style.setProperty('--p', Math.min(1, n / 60).toFixed(3));
      compter(n);
    };
    const obs = io((en) => en.forEach((e) => { if (e.isIntersecting) activer(e.target); }), { rootMargin: '-48% 0px -48% 0px' });
    if (obs) paliers.forEach((p) => obs.observe(p)); else activer(paliers[0]);
    activer(paliers[0]);
  }

  const niveaux = $('[data-niveaux]');
  if (niveaux) {
    const D = {
      rot: [[0.85, '×0,85'], [1, '×1'], [1.2, '×1,2'], [1.38, '×1,38']], max1: 1.38,
      def: [[0.7, '×0,7'], [1, '×1'], [1.3, '×1,3'], [1.6, '×1,6']],
      tol: [[50, '50 % du rayon'], [40, '40 % du rayon'], [33, '33 % du rayon'], [28, '28 % du rayon']],
      mine: [[13, '13e planète'], [7, '7e planète'], [4, '4e planète'], [3, '3e planète']],
      trou: [[51, '51e planète'], [31, '31e planète'], [18, '18e planète'], [10, '10e planète']],
      max: [[120, '120 planètes'], [60, '60 planètes'], [40, '40 planètes'], [28, '28 planètes']],
    };
    const echelle = { rot: (v) => v / 1.38, def: (v) => v / 1.6, tol: (v) => v / 50, mine: (v) => 3 / v, trou: (v) => 10 / v, max: (v) => 28 / v };
    const boutons = $$('[data-niveau]', niveaux), segments = $('.segments', niveaux);
    const choisir = (i, focus) => {
      boutons.forEach((b, k) => { b.setAttribute('aria-checked', String(k === i)); b.tabIndex = k === i ? 0 : -1; });
      if (focus) boutons[i].focus();
      segments.style.setProperty('--n', i);
      Object.keys(echelle).forEach((k) => {
        const [v, t] = D[k][i];
        $(`[data-j="${k}"]`, niveaux).style.setProperty('--v', echelle[k](v).toFixed(3));
        $(`[data-v="${k}"]`, niveaux).textContent = t;
      });
    };
    boutons.forEach((b, i) => {
      b.addEventListener('click', () => choisir(i));
      b.addEventListener('keydown', (e) => {
        const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
        if (d) { e.preventDefault(); choisir((i + d + boutons.length) % boutons.length, true); }
      });
    });
    choisir(1);
  }

  const defile = $('[data-defile]');
  if (defile) {
    let x0 = 0, s0 = 0, tire = false;
    defile.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; tire = true; x0 = e.clientX; s0 = defile.scrollLeft; defile.classList.add('est-tire'); defile.setPointerCapture(e.pointerId); });
    defile.addEventListener('pointermove', (e) => { if (tire) defile.scrollLeft = s0 - (e.clientX - x0); });
    const lacher = () => { tire = false; defile.classList.remove('est-tire'); };
    defile.addEventListener('pointerup', lacher); defile.addEventListener('pointercancel', lacher);
    if (!calme) {
      const caps = $$('.cap', defile);
      let demande = 0;
      const incliner = () => {
        demande = 0;
        const centre = innerWidth / 2;
        caps.forEach((c) => {
          const r = c.getBoundingClientRect(), d = (r.left + r.width / 2 - centre) / centre;
          c.firstElementChild.style.setProperty('--r', (d * 4).toFixed(2) + 'deg');
          c.firstElementChild.style.setProperty('--y', (Math.abs(d) * 18).toFixed(1) + 'px');
        });
      };
      defile.addEventListener('scroll', () => { if (!demande) demande = requestAnimationFrame(incliner); }, { passive: true });
      addEventListener('resize', incliner);
      incliner();
    }
  }

  const compteurs = $$('[data-compte]');
  const cpt = io((en, obs) => en.forEach((e) => {
    if (!e.isIntersecting) return;
    obs.unobserve(e.target);
    const fin = +e.target.dataset.compte;
    if (calme || !fin) return;
    const t0 = performance.now();
    const pas = (t) => { const k = Math.min(1, (t - t0) / 1100); e.target.textContent = Math.round(fin * (1 - Math.pow(1 - k, 4))); if (k < 1) requestAnimationFrame(pas); };
    e.target.textContent = '0';
    requestAnimationFrame(pas);
  }), { threshold: 0.6 });
  if (cpt) compteurs.forEach((c) => cpt.observe(c));
})();
