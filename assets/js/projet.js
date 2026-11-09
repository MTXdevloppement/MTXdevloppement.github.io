(() => {
  const pf = document.querySelector('.mtx-pf');
  const script = document.querySelector('script[src*="assets/js/projet.js"]');
  if (pf && script && 'FontFace' in window && document.fonts) {
    const dossier = new URL('../fonts/', script.src);
    const latin = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
    const etendu = 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C4,U+2113,U+2C60-2C7F,U+A720-A7FF';
    const polices = [['MTX Geist', 'geist-latin.woff2', latin], ['MTX Geist', 'geist-latin-ext.woff2', etendu], ['MTX Geist Mono', 'geist-mono-latin.woff2', latin]];
    const charger = () => polices.forEach(([famille, fichier, plage]) => {
      const f = new FontFace(famille, `url(${new URL(fichier, dossier)}) format("woff2")`, { weight: '100 900', display: 'swap', unicodeRange: plage });
      document.fonts.add(f);
      if (plage === latin) f.load().catch(() => {});
    });
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entrees) => {
        if (entrees.some((e) => e.isIntersecting)) { io.disconnect(); charger(); }
      }, { rootMargin: '1200px 0px' });
      io.observe(pf);
    } else charger();
  }

  const gbar = document.querySelector('.mtx-gbar');
  const nav = document.querySelector('body > .nav');
  if (nav) {
    if (new DOMMatrix(getComputedStyle(nav).transform).m41 < 0) nav.classList.add('mtx-centree');
    const set = () => document.documentElement.style.setProperty('--mtx-nav-h', nav.offsetHeight + 'px');
    set();
    if ('ResizeObserver' in window) new ResizeObserver(set).observe(nav);
    else addEventListener('resize', set);
    return;
  }
  if (!gbar) return;
  const fixes = [...document.body.children].filter((el) => {
    if (el === gbar || el.classList.contains('mtx-pf')) return false;
    const st = getComputedStyle(el);
    return st.position === 'fixed' && parseFloat(st.top) === 0 && el.offsetHeight > 0 && el.offsetHeight < 160 &&
      el.getBoundingClientRect().width >= window.innerWidth * 0.9;
  });
  if (!fixes.length) return;
  let demande = 0, dernier = -1;
  const hauteur = () => gbar.getBoundingClientRect().bottom + window.scrollY;
  let bas0 = hauteur();
  const placer = () => {
    demande = 0;
    const bas = Math.round(Math.max(0, bas0 - window.scrollY));
    if (bas === dernier) return;
    dernier = bas;
    fixes.forEach((el) => el.style.setProperty('top', bas + 'px', 'important'));
  };
  const planifier = () => { if (!demande) demande = requestAnimationFrame(placer); };
  addEventListener('scroll', planifier, { passive: true });
  addEventListener('resize', () => { bas0 = hauteur(); planifier(); });
  placer();
})();
