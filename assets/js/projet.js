(() => {
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
  let demande = 0;
  const placer = () => {
    demande = 0;
    const bas = Math.max(0, gbar.getBoundingClientRect().bottom);
    fixes.forEach((el) => el.style.setProperty('top', bas + 'px', 'important'));
  };
  const planifier = () => { if (!demande) demande = requestAnimationFrame(placer); };
  addEventListener('scroll', planifier, { passive: true });
  addEventListener('resize', planifier);
  placer();
})();
