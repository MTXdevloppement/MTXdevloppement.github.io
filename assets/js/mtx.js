(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const $ = s => document.querySelector(s), $$ = s => [ ...document.querySelectorAll(s) ];
  window.MTX = {
    reduce: reduce,
    clamp: clamp,
    $: $,
    $$: $$
  };
  const nav = $('#nav');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame((() => {
      ticking = false;
      nav.classList.toggle('scrolled', scrollY > 10);
    }));
  };
  addEventListener('scroll', onScroll, {
    passive: true
  });
  onScroll();
  const burger = $('#burger');
  const setMenu = o => {
    document.body.classList.toggle('menu-open', o);
    burger.setAttribute('aria-expanded', o);
    burger.setAttribute('aria-label', o ? 'Fermer le menu' : 'Ouvrir le menu');
  };
  burger.addEventListener('click', (() => setMenu(!document.body.classList.contains('menu-open'))));
  $$('.mmenu a').forEach((a => a.addEventListener('click', (() => setMenu(false)))));
  addEventListener('keydown', (e => {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
      setMenu(false);
      burger.focus();
    }
  }));
  matchMedia('(min-width: 901px)').addEventListener('change', (e => {
    if (e.matches) setMenu(false);
  }));
  const io = new IntersectionObserver((es => es.forEach((en => {
    if (en.isIntersecting) {
      en.target.classList.remove('pre');
      io.unobserve(en.target);
    }
  }))), {
    rootMargin: '0px 0px -10% 0px'
  });
  if (!reduce) $$('.fade').forEach((el => {
    if (el.getBoundingClientRect().top > innerHeight) {
      el.classList.add('pre');
      io.observe(el);
    }
  }));
  const steps = $('#steps');
  if (steps) {
    const stepIO = new IntersectionObserver((es => es.forEach((en => {
      if (en.isIntersecting) {
        $$('.step').forEach((s => s.classList.add('in')));
        stepIO.disconnect();
      }
    }))), {
      threshold: .4
    });
    stepIO.observe(steps);
  }
})();
