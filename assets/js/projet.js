(() => {
  const nav = document.querySelector('body > .nav');
  if (!nav) return;
  if (new DOMMatrix(getComputedStyle(nav).transform).m41 < 0) nav.classList.add('mtx-centree');
  const set = () => document.documentElement.style.setProperty('--mtx-nav-h', nav.offsetHeight + 'px');
  set();
  if ('ResizeObserver' in window) new ResizeObserver(set).observe(nav); else addEventListener('resize', set);
})();
