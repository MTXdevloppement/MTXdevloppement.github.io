(() => {
  const {$: $} = window.MTX;
  const seg = $('#seg'), thumb = seg.querySelector('.thumb'), segBtns = [ ...seg.querySelectorAll('button') ], cmp = $('#cmp');
  const devis = [ ...cmp.querySelectorAll('[data-besoin]') ];
  function fill(k) {
    cmp.querySelectorAll('[data-pro]').forEach((el => {
      const v = el.dataset[k];
      if (el.tagName === 'UL') el.innerHTML = v.split('|').map((x => `<li>${x}</li>`)).join(''); else el.textContent = v;
    }));
    devis.forEach((a => {
      a.href = `contact.html?profil=${k}&besoin=${a.dataset.besoin}`;
    }));
  }
  function moveThumb(b) {
    thumb.style.width = b.offsetWidth + 'px';
    thumb.style.transform = `translateX(${b.offsetLeft - 4}px)`;
  }
  const current = () => segBtns.find((b => b.getAttribute('aria-pressed') === 'true'));
  segBtns.forEach((b => b.addEventListener('click', (() => {
    if (b.getAttribute('aria-pressed') === 'true') return;
    segBtns.forEach((x => x.setAttribute('aria-pressed', x === b)));
    moveThumb(b);
    cmp.classList.add('swap');
    setTimeout((() => {
      fill(b.dataset.k);
      cmp.classList.remove('swap');
    }), 250);
  }))));
  fill('pro');
  moveThumb(segBtns[0]);
  if (new URLSearchParams(location.search).get('profil') === 'part') {
    segBtns.forEach((x => x.setAttribute('aria-pressed', x.dataset.k === 'part')));
    fill('part');
    moveThumb(current());
  }
  addEventListener('resize', (() => moveThumb(current())));
  document.fonts && document.fonts.ready.then((() => moveThumb(current())));
})();
