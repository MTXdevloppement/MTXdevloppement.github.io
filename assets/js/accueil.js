(() => {
  const {reduce: reduce, clamp: clamp, $: $, $$: $$} = window.MTX;
  const ICO = {
    pause: '<svg viewBox="0 0 16 16" fill="#f5f5f7" aria-hidden="true"><rect x="3" y="2" width="3.5" height="12" rx="1"/><rect x="9.5" y="2" width="3.5" height="12" rx="1"/></svg>',
    play: '<svg viewBox="0 0 16 16" fill="#f5f5f7" aria-hidden="true"><path d="M4 2.5v11a1 1 0 0 0 1.5.86l9-5.5a1 1 0 0 0 0-1.72l-9-5.5A1 1 0 0 0 4 2.5z"/></svg>'
  };
  const wordsEl = $('#words');
  wordsEl.innerHTML = wordsEl.textContent.trim().split(/\s+/).map((w => {
    const hl = w.startsWith('*');
    w = w.replace(/\*/g, '');
    return `<span${hl ? ' class="hl"' : ''}>${w}</span>`;
  })).join(' ');
  const words = [ ...wordsEl.children ];
  const EXEMPLES = [ {
    metier: 'boutique',
    resultat: 'ventes 24 h/24.',
    membre: 'Matheo',
    ecran: 'site',
    variante: 'arlette'
  }, {
    metier: 'cabinet',
    resultat: 'agenda rempli.',
    membre: 'Matheo',
    ecran: 'app'
  }, {
    metier: 'atelier',
    resultat: 'devis en 2 min.',
    membre: 'Matheo',
    ecran: 'ai'
  }, {
    metier: 'talent',
    resultat: 'vous, en ligne.',
    membre: 'Matheo',
    ecran: 'site',
    variante: 'sarah'
  } ];
  const EQUIPE = {
    Matheo: '#ffb86b'
  };
  const CYCLE = 5600;
  const ANIM = 3150;
  const eqn = (() => {
    const root = $('#eqn');
    if (!root) return null;
    if (!root.animate) {
      root.querySelector('.eq-ctrl').remove();
      return null;
    }
    const slots = {
      metier: root.querySelector('[data-slot="metier"]'),
      resultat: root.querySelector('[data-slot="resultat"]')
    };
    const sel = $('#eqnSel'), cur = $('#eqnCur'), who = $('#eqnName');
    const opX = root.querySelector('.eq-x'), mtx = root.querySelector('.eq-mtx'), ctrl = root.querySelector('.eq-ctrl');
    const playBtn = $('#eqnPlay'), dotsBox = $('#eqnDots');
    const dev = $('#device'), panes = {
      site: $('.p-site'),
      app: $('.p-app'),
      ai: $('.p-ai')
    };
    const toasts = $$('[data-toast]'), variants = $$('.ps-v');
    const api = {
      onLayout: null
    };
    root.classList.add('is-live');
    let index = 0, playing = !reduce, active = true, started = false, tl = null, hold = null;
    const E = {
      out: 'cubic-bezier(.16,1,.3,1)',
      in: 'cubic-bezier(.55,0,.75,.2)',
      io: 'cubic-bezier(.65,0,.35,1)',
      io4: 'cubic-bezier(.87,0,.13,1)'
    };
    const esc = t => t.replace(/[&<>"]/g, (c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    }[c])));
    const chars = t => [ ...t ].map((c => `<span class="ch">${c === ' ' ? '&nbsp;' : esc(c)}</span>`)).join('');
    const box = el => {
      let x = 0, y = 0, n = el;
      while (n && n !== root) {
        x += n.offsetLeft;
        y += n.offsetTop;
        n = n.offsetParent;
      }
      return {
        x: x,
        y: y,
        w: el.offsetWidth,
        h: el.offsetHeight
      };
    };
    function paint(word) {
      if (!word.parentNode || !word.parentNode.classList.contains('eq-res')) return;
      const w = word.offsetWidth;
      word.querySelectorAll('.ch').forEach((c => {
        c.style.backgroundSize = `${w}px 100%`;
        c.style.backgroundPosition = `${-c.offsetLeft}px 0`;
      }));
    }
    function setWord(slot, text) {
      slot.innerHTML = `<span class="eq-word">${chars(text)}</span>`;
      paint(slot.firstChild);
    }
    Object.values(slots).forEach((s => setWord(s, s.textContent.trim())));
    const meas = document.createElement('div');
    meas.className = 'eq eq-meas';
    meas.setAttribute('aria-hidden', 'true');
    root.appendChild(meas);
    function widest() {
      return Math.max(...EXEMPLES.map((ex => {
        meas.innerHTML = `<p class="eq-row">Votre <span class="eq-slot"><span class="eq-word">${chars(ex.metier)}</span></span></p>` + '<p class="eq-row eq-brand"><span class="eq-op">×</span><span class="eq-mtx">MTX</span></p>' + `<p class="eq-row"><span class="eq-op">=</span> <span class="eq-slot"><span class="eq-word">${chars(ex.resultat)}</span></span></p>`;
        return meas.offsetWidth;
      })));
    }
    function fit() {
      root.style.removeProperty('--eq-fs');
      root.style.width = '';
      const host = root.parentElement, cs = getComputedStyle(host);
      const avail = host.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      let fs = parseFloat(getComputedStyle(root).fontSize), w = widest();
      if (w > avail) {
        fs = Math.floor(fs * avail / w * 2) / 2;
        root.style.setProperty('--eq-fs', fs + 'px');
        w = widest();
      }
      root.style.setProperty('--eq-fs', fs + 'px');
      root.style.width = Math.ceil(w + 2) + 'px';
      root.classList.toggle('eq-ctrl-below', innerWidth <= 560 || mtx.offsetLeft + mtx.offsetWidth + 24 + ctrl.offsetWidth > w);
      Object.values(slots).forEach((s => s.querySelectorAll('.eq-word').forEach(paint)));
      if (api.onLayout) api.onLayout();
    }
    function timeline(onEnd) {
      const steps = [], anims = [], timers = [];
      let over = false;
      const end = () => {
        if (!over) {
          over = true;
          onEnd();
        }
      };
      const run = (st, now) => {
        if (st.done) return;
        st.done = true;
        st.fn(now);
        if (!now && steps.every((x => x.done))) end();
      };
      return {
        at(ms, fn) {
          const st = {
            ms: ms,
            fn: fn,
            done: false
          };
          steps.push(st);
          timers.push(setTimeout((() => run(st, false)), ms));
          return this;
        },
        anim(el, kf, o, now) {
          const a = el.animate(kf, Object.assign({
            fill: 'forwards'
          }, o, now ? {
            duration: 0,
            delay: 0
          } : null));
          anims.push(a);
          return a;
        },
        skip() {
          timers.forEach(clearTimeout);
          anims.forEach((a => {
            try {
              a.finish();
            } catch (e) {}
          }));
          steps.slice().sort(((a, b) => a.ms - b.ms)).forEach((st => run(st, true)));
          end();
        }
      };
    }
    function prepare(slot, text) {
      const neu = document.createElement('span');
      neu.className = 'eq-word eq-new';
      neu.innerHTML = chars(text);
      slot.appendChild(neu);
      paint(neu);
      return {
        slot: slot,
        neu: neu,
        w: neu.offsetWidth + parseFloat(getComputedStyle(slot).paddingRight)
      };
    }
    function roll(t, pr, at) {
      t.at(at, (now => {
        const old = pr.slot.querySelector('.eq-word:not(.eq-new)');
        pr.slot.style.width = Math.max(pr.slot.offsetWidth, pr.w) + 'px';
        if (old) old.querySelectorAll('.ch').forEach(((c, k) => t.anim(c, [ {
          transform: 'none',
          opacity: 1
        }, {
          transform: 'translateY(-110%)',
          opacity: 0
        } ], {
          duration: 380,
          delay: k * 12,
          easing: E.in
        }, now)));
        pr.neu.querySelectorAll('.ch').forEach(((c, k) => t.anim(c, [ {
          transform: 'translateY(110%)',
          opacity: 0
        }, {
          transform: 'none',
          opacity: 1
        } ], {
          duration: 620,
          delay: 110 + k * 14,
          easing: E.out
        }, now)));
      })).at(at + 1e3, (() => {
        pr.slot.querySelectorAll('.eq-word:not(.eq-new)').forEach((o => o.remove()));
        pr.neu.classList.remove('eq-new');
        pr.slot.style.width = '';
        pr.neu.querySelectorAll('.ch').forEach((el => el.getAnimations().forEach((a => a.cancel()))));
      }));
    }
    function sync(i) {
      const ex = EXEMPLES[i], pane = panes[ex.ecran];
      if (ex.ecran === 'site') variants.forEach((v => v.classList.toggle('on', v.dataset.v === (ex.variante || 'arlette'))));
      const shown = active && started && !!pane && pane.offsetParent !== null;
      Object.values(panes).forEach((p => p && p.classList.toggle('is-focus', shown && p === pane)));
      dev.toggleAttribute('data-focus', shown);
      toasts.forEach((el => el.classList.toggle('on', shown && +el.dataset.toast === i)));
    }
    function change(next) {
      const ex = EXEMPLES[next];
      setDots(next);
      if (reduce) {
        swap(next);
        return;
      }
      cur.style.setProperty('--c', EQUIPE[ex.membre] || '#2997ff');
      who.textContent = ex.membre;
      const b1 = box(slots.metier), b3 = box(slots.resultat);
      const p1 = prepare(slots.metier, ex.metier), p3 = prepare(slots.resultat, ex.resultat);
      const fs = parseFloat(getComputedStyle(root).fontSize), px = Math.max(6, fs * .08);
      const zone = (b, w) => ({
        x: b.x - px,
        y: b.y + fs * .16,
        w: w + px,
        h: fs * 1.08
      });
      const z1 = zone(b1, b1.w), z3 = zone(b3, b3.w);
      const tip = (z, w) => `translate(${z.x + w + px - 4}px, ${z.y + z.h * .55}px)`;
      const on1 = w => tip(z1, w), on3 = w => tip(z3, w);
      const away = `translate(${z3.x + p3.w + px + 36}px, ${z3.y + z3.h * .55 + 28}px)`;
      const t = tl = timeline((() => {
        index = next;
        tl = null;
        schedule();
      }));
      t.at(0, (now => {
        t.anim(cur, {
          opacity: 1
        }, {
          duration: 250
        }, now);
        t.anim(cur, {
          transform: on1(b1.w)
        }, {
          duration: 600,
          easing: E.out
        }, now);
      })).at(380, (now => {
        Object.assign(sel.style, {
          transform: `translate(${z1.x}px, ${z1.y}px)`,
          width: `${z1.w}px`,
          height: `${z1.h}px`
        });
        t.anim(sel, [ {
          opacity: 0,
          scale: .97
        }, {
          opacity: 1,
          scale: 1
        } ], {
          duration: 260,
          easing: E.out
        }, now);
      }));
      roll(t, p1, 560);
      t.at(600, (now => {
        t.anim(sel, {
          width: `${p1.w + px}px`
        }, {
          duration: 620,
          easing: E.io
        }, now);
        t.anim(cur, {
          transform: on1(p1.w)
        }, {
          duration: 620,
          easing: E.io
        }, now);
      })).at(1200, (now => {
        t.anim(sel, {
          transform: `translate(${z3.x}px, ${z3.y}px)`,
          width: `${z3.w}px`,
          height: `${z3.h}px`
        }, {
          duration: 480,
          easing: E.io
        }, now);
        t.anim(cur, {
          transform: on3(b3.w)
        }, {
          duration: 520,
          easing: E.io
        }, now);
      }));
      roll(t, p3, 1600);
      t.at(1640, (now => {
        t.anim(sel, {
          width: `${p3.w + px}px`
        }, {
          duration: 620,
          easing: E.io
        }, now);
        t.anim(cur, {
          transform: on3(p3.w)
        }, {
          duration: 620,
          easing: E.io
        }, now);
      })).at(1650, (() => sync(next))).at(2450, (now => t.anim(sel, {
        opacity: 0
      }, {
        duration: 280
      }, now))).at(2500, (now => t.anim(cur, {
        opacity: 0,
        transform: away
      }, {
        duration: 650,
        easing: E.io
      }, now))).at(ANIM, (() => {
        sel.style.opacity = '0';
        Object.assign(cur.style, {
          opacity: '0',
          transform: away
        });
        [ sel, cur ].forEach((el => el.getAnimations().forEach((a => a.cancel()))));
      }));
    }
    function swap(i) {
      const ex = EXEMPLES[i];
      setWord(slots.metier, ex.metier);
      setWord(slots.resultat, ex.resultat);
      index = i;
      sync(i);
      schedule();
    }
    const dots = EXEMPLES.map(((ex, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `Exemple ${i + 1} sur ${EXEMPLES.length} : votre ${ex.metier}, ${ex.resultat.replace(/\.$/, '')}`);
      b.addEventListener('click', (() => go(i)));
      dotsBox.appendChild(b);
      return b;
    }));
    function setDots(i) {
      dots.forEach(((b, j) => j === i ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current')));
    }
    function clearHold() {
      if (hold) cancelAnimationFrame(hold);
      hold = null;
      dots.forEach((b => b.style.removeProperty('--p')));
    }
    function schedule() {
      clearHold();
      if (!playing || !active || !started || tl || document.hidden) return;
      const wait = reduce ? CYCLE : Math.max(1500, CYCLE - ANIM), dot = dots[index], t0 = performance.now();
      const step = now => {
        const k = clamp((now - t0) / wait);
        dot.style.setProperty('--p', k.toFixed(3));
        if (k < 1) hold = requestAnimationFrame(step); else {
          hold = null;
          go((index + 1) % EXEMPLES.length);
        }
      };
      hold = requestAnimationFrame(step);
    }
    function go(i) {
      if (tl) tl.skip();
      clearHold();
      if (i === index) {
        schedule();
        return;
      }
      change(i);
    }
    function setPlaying(v) {
      playing = v;
      playBtn.innerHTML = v ? ICO.pause : ICO.play;
      playBtn.setAttribute('aria-label', v ? 'Mettre en pause les exemples' : 'Faire défiler les exemples');
      if (v) schedule(); else clearHold();
    }
    playBtn.addEventListener('click', (() => setPlaying(!playing)));
    document.addEventListener('visibilitychange', (() => document.hidden ? clearHold() : schedule()));
    api.setActive = v => {
      if (v === active) return;
      active = v;
      sync(index);
      if (v) schedule(); else clearHold();
    };
    api.tilt = k => {
      if (!reduce) opX.style.transform = k > 0 ? `rotate(${(k * 45).toFixed(2)}deg)` : '';
    };
    let rz;
    addEventListener('resize', (() => {
      clearTimeout(rz);
      rz = setTimeout(fit, 150);
    }));
    fit();
    if (document.fonts) document.fonts.ready.then(fit);
    setDots(0);
    setPlaying(playing);
    setTimeout((() => {
      started = true;
      sync(index);
      schedule();
    }), reduce ? 0 : 1200);
    return api;
  })();
  const hero = $('#hero'), copy = $('#heroCopy'), stage = $('#stage'), device = $('#device'), cap = $('#stageCap');
  let ticking = false, lastP = -1, lastW = 0;
  function frame() {
    ticking = false;
    const vh = innerHeight, vw = innerWidth;
    const r = hero.getBoundingClientRect();
    const p = clamp(-r.top / (r.height - vh));
    if (p !== lastP || vw !== lastW) {
      lastP = p;
      lastW = vw;
      const copyH = copy.offsetHeight + copy.offsetTop;
      const s0 = vw < 560 ? .86 : vw < 900 ? .74 : .62;
      const e = reduce ? p > .5 ? 1 : 0 : 1 - Math.pow(1 - clamp(p / .75), 3);
      const s = s0 + (1 - s0) * e;
      const top0 = copyH + 36;
      stage.style.transform = `translate(-50%, ${(1 - e) * top0}px) scale(${s})`;
      device.style.setProperty('--r', `${(1 - e) * 32 / s}px`);
      const cp = clamp(p / .3);
      copy.style.opacity = 1 - cp;
      copy.style.transform = `translateY(${-cp * 60}px) scale(${1 - cp * .06})`;
      copy.style.pointerEvents = cp > .5 ? 'none' : '';
      if (eqn) {
        eqn.setActive(cp < .55);
        eqn.tilt(cp);
      }
      const k = clamp((p - .7) / .2);
      cap.style.opacity = k;
      cap.style.transform = `translateY(${(1 - k) * 30}px)`;
      device.style.setProperty('--dim', (k * .45).toFixed(3));
    }
    const wr = wordsEl.getBoundingClientRect();
    if (wr.top < vh * 1.5 && wr.bottom > -vh * .5) {
      const wp = clamp((vh * .85 - wr.top) / (wr.height + vh * .35));
      const n = Math.round(wp * words.length);
      words.forEach(((w, i) => w.classList.toggle('lit', i < n)));
    }
  }
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(frame);
    }
  };
  const relayout = () => {
    lastP = -1;
    onScroll();
  };
  if (eqn) eqn.onLayout = relayout;
  addEventListener('scroll', onScroll, {
    passive: true
  });
  addEventListener('resize', relayout);
  frame();
  function cycler({root: root, btn: btn, n: n, ms: ms, step: step, progress: progress, labels: labels}) {
    let i = 0, playing = !reduce, seen = false, raf = 0, last = 0, el = 0;
    const running = () => playing && seen && !document.hidden;
    const loop = now => {
      raf = 0;
      if (!running()) return;
      el += last ? Math.min(now - last, 100) : 0;
      last = now;
      if (el >= ms) {
        el = 0;
        i = (i + 1) % n;
        step(i, false);
      }
      if (progress) progress(el / ms);
      raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      if (running() && !raf) {
        last = 0;
        raf = requestAnimationFrame(loop);
      }
    };
    const setBtn = () => {
      btn.innerHTML = playing ? ICO.pause : ICO.play;
      btn.setAttribute('aria-label', playing ? labels[0] : labels[1]);
      root.classList.toggle('paused', !playing);
    };
    btn.addEventListener('click', (() => {
      playing = !playing;
      setBtn();
      kick();
    }));
    new IntersectionObserver((es => {
      seen = es[0].isIntersecting;
      kick();
    }), {
      threshold: .3
    }).observe(root);
    document.addEventListener('visibilitychange', kick);
    setBtn();
    step(0, true);
    return {
      go(k) {
        el = 0;
        if (progress) progress(0);
        if (k !== i) {
          i = k;
          step(k, false);
        }
      }
    };
  }
  (() => {
    const root = $('#sites');
    if (!root) return;
    const stage = $('#sitesStage'), link = $('#sitesLink'), name = $('#sitesName'), url = $('#sitesUrl'), prog = $('#sitesProg');
    const btns = $$('#sites .sx'), shots = {};
    let cur = stage.querySelector('img');
    shots[btns[0].dataset.slug] = cur;
    const de = nom => (/^[aeiouyéèêàâîïôûh]/i.test(nom) ? 'd’' : 'de ') + nom;
    function shot(slug) {
      if (!shots[slug]) {
        const im = new Image(1440, 900);
        im.alt = '';
        im.className = 'bshot';
        im.decoding = 'async';
        im.src = `assets/img/realisations/site-${slug}.webp`;
        stage.appendChild(im);
        shots[slug] = im;
      }
      return shots[slug];
    }
    const show = im => {
      if (im !== cur) return;
      im.classList.remove('pan');
      void im.offsetWidth;
      im.classList.add('on');
      if (!reduce) im.classList.add('pan');
    };
    const cyc = cycler({
      root: root,
      btn: $('#sitesPlay'),
      n: btns.length,
      ms: 4200,
      labels: [ 'Mettre en pause le défilement des sites', 'Faire défiler les sites' ],
      progress: p => {
        prog.style.transform = `scaleX(${p.toFixed(3)})`;
      },
      step(k, first) {
        const b = btns[k], slug = b.dataset.slug, nom = b.dataset.nom, href = `realisations/${slug}/index.html`;
        btns.forEach(((x, j) => x.setAttribute('aria-current', j === k ? 'true' : 'false')));
        link.href = stage.href = href;
        name.textContent = de(nom);
        url.textContent = `${nom} · site vitrine`;
        const im = shot(slug);
        shot(btns[(k + 1) % btns.length].dataset.slug);
        if (im !== cur) {
          const old = cur;
          old.classList.remove('on');
          setTimeout((() => {
            if (old !== cur) old.classList.remove('pan');
          }), 1e3);
        }
        cur = im;
        if (first) {
          if (!reduce) new IntersectionObserver(((es, o) => {
            if (es[0].isIntersecting) {
              o.disconnect();
              show(im);
            }
          }), {
            threshold: .3
          }).observe(root);
          return;
        }
        if (im.complete && im.naturalWidth) show(im); else im.addEventListener('load', (() => show(im)), {
          once: true
        });
      }
    });
    btns.forEach(((b, k) => b.addEventListener('click', (() => cyc.go(k)))));
  })();
  const EXEMPLES_IA = [ [ 'Vous êtes ouverts dimanche ?', 'Oui, de 8 h à 13 h. Je vous mets une baguette de côté ?' ], [ 'Prépare le devis de la cuisine Martin.', 'C’est prêt : trois options, de 6 940 € à 11 280 €.' ], [ 'Quoi de neuf ce matin ?', '14 e-mails triés : 3 devis, 2 factures, 1 paiement reçu.' ], [ 'Relance les factures en retard.', 'Trois relances envoyées. M. Roux a déjà réglé.' ], [ 'Trouve des restaurants à Lyon.', '42 contacts ciblés, premier message prêt à partir.' ], [ 'Où est-ce que je perds du temps ?', 'La saisie des factures : environ 4 h par semaine.' ], [ 'L’IA, ça vaut le coup chez nous ?', 'D’après vos chiffres, l’outil est rentabilisé en 3 mois.' ], [ 'Retrouve le contrat Leroy de 2024.', 'Trouvé : Contrats › 2024 › Leroy.pdf' ], [ 'Comment j’envoie un devis ?', 'Je vous guide : trois étapes, cinq minutes.' ] ];
  (() => {
    const list = $('#aiList'), chat = $('#aiChat');
    if (!list) return;
    const items = [ ...list.children ];
    let tm = 0;
    const esc = t => t.replace(/[&<>]/g, (c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;'
    }[c])));
    const cyc = cycler({
      root: list.closest('.tile'),
      btn: $('#aiPlay'),
      n: items.length,
      ms: 3600,
      labels: [ 'Mettre en pause les exemples', 'Faire défiler les exemples' ],
      step(k, first) {
        const [q, a] = EXEMPLES_IA[k] || EXEMPLES_IA[0];
        items.forEach(((li, j) => li.classList.toggle('on', j === k)));
        clearTimeout(tm);
        if (first || reduce) {
          chat.innerHTML = `<span class="ai-q">${esc(q)}</span><span class="ai-a">${esc(a)}</span>`;
          return;
        }
        chat.innerHTML = `<span class="ai-q in">${esc(q)}</span><span class="ai-a wait in"><i></i><i></i><i></i></span>`;
        tm = setTimeout((() => {
          chat.lastChild.outerHTML = `<span class="ai-a in">${esc(a)}</span>`;
        }), 900);
      }
    });
    items.forEach(((li, k) => li.addEventListener('mouseenter', (() => cyc.go(k)))));
  })();
  const MARQUES = [ {
    nom: 'Maison Arlette',
    logo: 'A',
    titre: 'Maison Arlette',
    sous: 'Boulangerie depuis 1987',
    bouton: 'Commander',
    police: 'Serif · Italique'
  }, {
    nom: 'Kiné Lumière',
    logo: 'K',
    titre: 'Kiné Lumière',
    sous: 'Cabinet de kinésithérapie',
    bouton: 'Prendre rendez-vous',
    police: 'Sans · Semibold'
  }, {
    nom: 'Atelier Rivière',
    logo: 'R',
    titre: 'Atelier Rivière',
    sous: 'Menuiserie sur mesure',
    bouton: 'Demander un devis',
    police: 'Sans · Extra Bold'
  }, {
    nom: 'Sarah',
    logo: 'S',
    titre: 'Sarah',
    sous: 'Photographe · carnets de voyage',
    bouton: 'Voir les séries',
    police: 'Sans · Light'
  } ];
  (() => {
    const kit = $('#kit');
    if (!kit) return;
    const ui = kit.querySelector('.kit-ui'), btn = $('#kitBtn'), dim = $('#kitDim');
    const set = (id, v) => {
      $(id).textContent = v;
    };
    const measure = () => {
      dim.textContent = `${btn.offsetWidth} × ${btn.offsetHeight}`;
    };
    cycler({
      root: kit,
      btn: $('#kitPlay'),
      n: MARQUES.length,
      ms: 3200,
      labels: [ 'Mettre en pause les exemples de marques', 'Faire défiler les exemples de marques' ],
      step(k, first) {
        const m = MARQUES[k];
        kit.dataset.t = k;
        set('#kitName', m.nom);
        set('#kitLogo', m.logo);
        set('#kitTitle', m.titre);
        set('#kitSub', m.sous);
        set('#kitFont', m.police);
        btn.textContent = m.bouton;
        if (!first && !reduce) {
          ui.classList.remove('sw');
          void ui.offsetWidth;
          ui.classList.add('sw');
        }
        measure();
      }
    });
    if (document.fonts) document.fonts.ready.then(measure);
  })();
  (() => {
    const rs = $('#rs');
    if (!rs) return;
    const tabs = [ ...rs.querySelectorAll('.rs-seg span') ], w = $('#rsW'), LARGEURS = [ '1440 px', '820 px', '390 px' ];
    cycler({
      root: rs,
      btn: $('#rsPlay'),
      n: 3,
      ms: 2600,
      labels: [ 'Mettre en pause la démonstration des écrans', 'Lancer la démonstration des écrans' ],
      step(k) {
        rs.dataset.d = k;
        tabs.forEach(((t, j) => t.classList.toggle('on', j === k)));
        w.textContent = LARGEURS[k];
      }
    });
  })();
  const gal = $('#gallery'), cards = [ ...gal.children ], dotsEl = $('#dots'), track = $('#dotsTrack'), playBtn = $('#play'), playIc = $('#playIc');
  let cur = 0, playing = !reduce, t = 0, last = 0, raf = 0;
  const FENETRE = 7, PAS = 14, ACTIF = 36;
  const n = cards.length, win = Math.min(FENETRE, n);
  $('#dotsTot').textContent = n;
  dotsEl.querySelector('.dots-win').style.width = `${(win - 1) * PAS + ACTIF}px`;
  const dots = cards.map(((c, i) => {
    const nom = (c.getAttribute('aria-label') || '').split(/,| :/)[0];
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', `Réalisation ${i + 1} sur ${n}${nom ? ` : ${nom}` : ''}`);
    b.addEventListener('click', (() => {
      go(i);
      t = 0;
    }));
    track.appendChild(b);
    return b;
  }));
  function setDot(i) {
    cur = i;
    const s = clamp(i - Math.floor(win / 2), 0, n - win);
    dots.forEach(((d, j) => {
      const off = j < s || j >= s + win;
      const edge = j === s && s > 0 || j === s + win - 1 && s + win < n;
      d.classList.toggle('on', j === i);
      d.classList.toggle('off', off);
      d.classList.toggle('sm', edge && j !== i);
      d.tabIndex = off ? -1 : 0;
      off ? d.setAttribute('aria-hidden', 'true') : d.removeAttribute('aria-hidden');
      j === i ? d.setAttribute('aria-current', 'true') : d.removeAttribute('aria-current');
      if (j !== i) d.style.setProperty('--p', 0);
    }));
    track.style.transform = `translateX(${-s * PAS}px)`;
    $('#dotsCur').textContent = i + 1;
  }
  dotsEl.addEventListener('keydown', (e => {
    const k = {
      ArrowLeft: -1,
      ArrowRight: 1
    }[e.key];
    if (!k) return;
    e.preventDefault();
    go((cur + k + n) % n);
    t = 0;
    dots[cur].focus();
  }));
  function go(i) {
    gal.scrollTo({
      left: cards[i].offsetLeft - cards[0].offsetLeft,
      behavior: reduce ? 'auto' : 'smooth'
    });
    setDot(i);
  }
  setDot(0);
  let st;
  gal.addEventListener('scroll', (() => {
    clearTimeout(st);
    st = setTimeout((() => {
      const x = gal.scrollLeft;
      let best = 0, bd = 1e9;
      cards.forEach(((c, i) => {
        const d = Math.abs(c.offsetLeft - cards[0].offsetLeft - x);
        if (d < bd) {
          bd = d;
          best = i;
        }
      }));
      if (best !== cur) {
        setDot(best);
        t = 0;
      }
    }), 80);
  }), {
    passive: true
  });
  const setPlay = v => {
    playing = v;
    playBtn.setAttribute('aria-label', v ? 'Mettre en pause' : 'Lire');
    playIc.innerHTML = v ? '<rect x="3" y="2" width="3.5" height="12" rx="1"/><rect x="9.5" y="2" width="3.5" height="12" rx="1"/>' : '<path d="M4 2.5v11a1 1 0 0 0 1.5.86l9-5.5a1 1 0 0 0 0-1.72l-9-5.5A1 1 0 0 0 4 2.5z"/>';
  };
  setPlay(playing);
  playBtn.addEventListener('click', (() => setPlay(!playing)));
  gal.addEventListener('pointerdown', (() => setPlay(false)));
  function tick(now) {
    const dt = last ? Math.min(now - last, 100) : 0;
    last = now;
    if (playing && !document.hidden) {
      t += dt / 5e3;
      if (t >= 1) {
        t = 0;
        go((cur + 1) % cards.length);
      }
    }
    dots[cur].style.setProperty('--p', t);
    raf = requestAnimationFrame(tick);
  }
  new IntersectionObserver((es => {
    if (es[0].isIntersecting && !raf) {
      last = 0;
      raf = requestAnimationFrame(tick);
    } else if (!es[0].isIntersecting && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }), {
    threshold: .4
  }).observe(gal);
})();
