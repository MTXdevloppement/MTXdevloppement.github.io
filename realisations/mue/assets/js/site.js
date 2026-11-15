// Mue — interactions de la page (le geste du premier écran est dans roue.js).
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const io = (cb, opts) => ('IntersectionObserver' in window ? new IntersectionObserver(cb, opts) : null);

  const vus = io((en, obs) => en.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('est-vu'); obs.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  $$('.apparait').forEach((el) => (vus ? vus.observe(el) : el.classList.add('est-vu')));

  const liens = $$('.barre-nav a');
  const suivi = io((en) => en.forEach((e) => {
    if (e.isIntersecting) liens.forEach((a) => a.classList.toggle('est-ici', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  if (suivi) liens.forEach((a) => { const s = $(a.getAttribute('href')); if (s) suivi.observe(s); });

  // Onglets génériques (flèches gauche/droite, focus suivi).
  const onglets = (boutons, montrer) => {
    const choisir = (i, focus) => {
      boutons.forEach((b, k) => { b.setAttribute('aria-selected', String(k === i)); b.tabIndex = k === i ? 0 : -1; });
      if (focus) boutons[i].focus();
      montrer(i);
    };
    boutons.forEach((b, i) => {
      b.addEventListener('click', () => choisir(i));
      b.addEventListener('keydown', (e) => {
        const d = ['ArrowRight', 'ArrowDown'].includes(e.key) ? 1 : ['ArrowLeft', 'ArrowUp'].includes(e.key) ? -1 : 0;
        if (d) { e.preventDefault(); choisir((i + d + boutons.length) % boutons.length, true); }
      });
    });
    return choisir;
  };

  // Les trois roues : aussi au clavier, avec ⇧, ⌘ ou ⌃ seuls (le geste réel de Mue).
  const trio = $('[data-trio]');
  if (trio) {
    const panneaux = $$('.trio-panneau', trio);
    const choisir = onglets($$('[data-onglet]', trio), (i) => panneaux.forEach((p, k) => p.classList.toggle('est-actif', k === i)));
    let visible = false;
    const obs = io((en) => { visible = en[0].isIntersecting; }, { threshold: 0.4 });
    if (obs) obs.observe(trio);
    const touches = { Shift: 0, Meta: 1, Control: 2 };
    addEventListener('keydown', (e) => {
      if (!visible || e.repeat || !(e.key in touches)) return;
      if (document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
      choisir(touches[e.key]);
    });
  }

  // L'Atelier : trois vues de la fenêtre.
  const atelier = $('[data-atelier]');
  if (atelier) {
    const vues = $$('.vue', atelier);
    let courant = 0;
    const ajuster = () => { atelier.style.height = vues[courant].offsetHeight + 'px'; };
    onglets($$('[data-vue]'), (i) => { courant = i; vues.forEach((v, k) => v.classList.toggle('est-actif', k === i)); ajuster(); });
    if ('ResizeObserver' in window) new ResizeObserver(ajuster).observe(vues[0]);
    addEventListener('resize', ajuster);
    vues.forEach((v) => v.querySelectorAll('img').forEach((im) => im.addEventListener('load', ajuster)));
  }

  // Réglages › Roue : l'aperçu suit les choix, comme dans l'app.
  const form = $('[data-reglages]'), apercu = $('[data-roue-apercu]');
  if (form && apercu && window.MueRoue) {
    const sombre = () => document.documentElement.dataset.theme !== 'light';
    let roue = null, tour = 0, minuteur = 0;
    const dessiner = () => {
      const v = (n) => form.querySelector(`[name="${n}"]:checked`).value;
      roue = window.MueRoue.dessiner(apercu, { options: ['PNG', 'JPG', 'WebP', 'HEIC', 'TIFF', 'AVIF', 'GIF', 'PDF'], couleur: v('couleur'), style: v('style'), centre: 'photo.heic|Convertir', fichier: 'image', prefixe: 'Convertir en' });
      const fond = v('fond');
      apercu.dataset.fond = fond === 'auto' ? (sombre() ? 'sombre' : 'clair') : fond;
      apercu.style.setProperty('--taille', v('taille'));
      roue.surbriller(tour % 8);
    };
    form.addEventListener('change', dessiner);
    new MutationObserver(dessiner).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    dessiner();
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      let visible = false;
      const obs = io((en) => { visible = en[0].isIntersecting; }, { threshold: 0.3 });
      if (obs) obs.observe(apercu);
      const pas = () => { if (visible && !document.hidden) { tour += 1; roue.surbriller(tour % 8); } minuteur = setTimeout(pas, 900); };
      minuteur = setTimeout(pas, 900);
    }
  }
})();
