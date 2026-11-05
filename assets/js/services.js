(() => {
  const {$$: $$} = window.MTX;
  const fvs = $$('.fv'), fss = $$('.fs');
  const show = i => {
    fss.forEach(((f, j) => f.classList.toggle('on', j === i)));
    fvs.forEach(((f, j) => f.classList.toggle('on', j === i)));
  };
  const fio = new IntersectionObserver((es => es.forEach((en => {
    if (en.isIntersecting) show(+en.target.dataset.i);
  }))), {
    rootMargin: '-45% 0px -45% 0px'
  });
  fss.forEach((f => fio.observe(f)));
  const target = location.hash && document.getElementById(location.hash.slice(1));
  if (target && target.classList.contains('fs')) show(+target.dataset.i);
})();
