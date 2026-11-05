(() => {
  'use strict';
  const racine = document.documentElement;
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const survolable = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [ ...r.querySelectorAll(s) ];
  const borne = (v, a, b) => Math.min(Math.max(v, a), b);
  const lerp = (a, b, t) => a + (b - a) * t;
  const plage = (v, a, b) => borne((v - a) / (b - a), 0, 1);
  const douce = t => t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
  const sortie = t => 1 - (1 - t) ** 3;
  const nombre = new Intl.NumberFormat('fr-FR');
  const euros = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  });
  const euro = v => euros.format(Math.round(v * 100) / 100);
  const html = s => String(s).replace(/[&<>"]/g, (c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  }[c])));
  const ico = id => `<svg><use href="#${id}"/></svg>`;
  const dernieres = new WeakMap;
  const memo = (el, cle, v) => {
    let m = dernieres.get(el);
    if (!m) dernieres.set(el, m = {});
    if (m[cle] === v) return false;
    m[cle] = v;
    return true;
  };
  const texte = (el, v) => {
    if (memo(el, 'txt', v)) el.textContent = v;
  };
  const style = (el, prop, v) => {
    if (memo(el, prop, v)) el.style[prop] = v;
  };
  const variable = (el, nom, v) => {
    if (memo(el, nom, v)) el.style.setProperty(nom, v);
  };
  const classe = (el, nom, oui) => {
    if (memo(el, 'c:' + nom, oui)) el.classList.toggle(nom, oui);
  };
  function echantillonner(chemin, pas = 3) {
    const L = chemin.getTotalLength();
    const n = Math.max(2, Math.ceil(L / pas));
    const xs = new Float32Array(n + 1), ys = new Float32Array(n + 1);
    for (let i = 0; i <= n; i++) {
      const q = chemin.getPointAtLength(L * i / n);
      xs[i] = q.x;
      ys[i] = q.y;
    }
    const point = l => {
      const t = borne(l / L, 0, 1) * n, i = Math.min(n - 1, Math.floor(t)), f = t - i;
      return [ xs[i] + (xs[i + 1] - xs[i]) * f, ys[i] + (ys[i + 1] - ys[i]) * f ];
    };
    const angle = l => {
      const [x1, y1] = point(Math.max(0, l - 1.5)), [x2, y2] = point(Math.min(L, l + 1.5));
      return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    };
    const proche = (x, y) => {
      let k = 0, dmin = Infinity;
      for (let i = 0; i <= n; i++) {
        const d = (xs[i] - x) ** 2 + (ys[i] - y) ** 2;
        if (d < dmin) {
          dmin = d;
          k = i;
        }
      }
      return L * k / n;
    };
    return {
      L: L,
      point: point,
      angle: angle,
      proche: proche
    };
  }
  let nArt = 0;
  function paysage([c0, c1, c2], {soleil: soleil = [ .76, .3 ], symbole: symbole = '', w: w = 300, h: h = 220} = {}) {
    const id = 'pa' + nArt++;
    const d = k => `M0 ${h * k}C${w * .16} ${h * (k - .35)} ${w * .28} ${h * (k + .13)} ${w * .47} ${h * (k - .14)}S${w * .82} ${h * (k + .12)} ${w} ${h * (k - .09)}V${h}H0z`;
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">\n      <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c0}"/><stop offset=".55" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>\n      <rect width="${w}" height="${h}" fill="url(#${id})"/>\n      <circle cx="${w * soleil[0]}" cy="${h * soleil[1]}" r="${h * .15}" fill="#f3b562" opacity=".9"/>\n      <path d="${d(.6)}" fill="${c1}" opacity=".55"/><path d="${d(.74)}" fill="${c2}" opacity=".8"/><path d="${d(.86)}" fill="${c2}"/>\n      ${symbole ? `<use href="#${symbole}" x="${w * .06}" y="${h * .68}" width="${h * .16}" height="${h * .16}" fill="rgba(255,255,255,.8)"/>` : ''}\n    </svg>`;
  }
  function decouper(el) {
    let n = 0;
    const mots = [];
    const traiter = (noeud, classeMot) => {
      for (const enfant of [ ...noeud.childNodes ]) {
        if (enfant.nodeType === 3) {
          const frag = document.createDocumentFragment();
          enfant.textContent.split(/([ \t\n\r]+)/).forEach((morceau => {
            if (!morceau) return;
            if (/^[ \t\n\r]+$/.test(morceau)) {
              frag.append(' ');
              return;
            }
            const w = document.createElement('span');
            w.className = 'w' + (classeMot ? ' ' + classeMot : '');
            const i = document.createElement('i');
            i.textContent = morceau;
            w.style.setProperty('--wi', n++);
            w.append(i);
            frag.append(w);
            mots.push(w);
          }));
          enfant.replaceWith(frag);
        } else if (enfant.nodeType === 1 && enfant.classList.contains('pastille')) {
          enfant.classList.add('w');
          enfant.style.setProperty('--wi', n++);
          mots.push(enfant);
        } else if (enfant.nodeType === 1) {
          traiter(enfant, enfant.className);
          enfant.replaceWith(...enfant.childNodes);
        }
      }
    };
    traiter(el, '');
    return mots;
  }
  $$('.split').forEach((el => {
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    decouper(el);
  }));
  const manif = $('#manif');
  manif.setAttribute('aria-label', manif.textContent.replace(/\s+/g, ' ').trim());
  const motsManif = decouper(manif);
  let motsAllumes = -1;
  const apparition = new IntersectionObserver((entrees => {
    for (const e of entrees) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('is-in');
      e.target.dispatchEvent(new Event('apparu'));
      apparition.unobserve(e.target);
    }
  }), {
    rootMargin: '0px 0px -8% 0px',
    threshold: .1
  });
  $$('[data-reveal]').forEach((el => apparition.observe(el)));
  const enVue = new Set;
  const portee = new IntersectionObserver((entrees => {
    for (const e of entrees) {
      e.target.classList.toggle('is-paused', !e.isIntersecting);
      if (e.isIntersecting) enVue.add(e.target.id); else enVue.delete(e.target.id);
      if (e.target.id === 'accueil') basculerAvionAccueil(e.isIntersecting);
    }
  }), {
    rootMargin: '100px 0px'
  });
  $$('[data-compte]').forEach((el => {
    const vers = Number(el.dataset.compte);
    el.textContent = nombre.format(vers);
    if (reduit || !vers) return;
    el.textContent = '0';
    el.closest('[data-reveal]').addEventListener('apparu', (() => {
      const t0 = performance.now();
      const pas = t => {
        const k = Math.min((t - t0) / 1400, 1);
        texte(el, nombre.format(Math.round(vers * sortie(k))));
        if (k < 1) requestAnimationFrame(pas);
      };
      requestAnimationFrame(pas);
    }), {
      once: true
    });
  }));
  const nav = $('.nav');
  const barre = $('.nav-progress');
  const liens = $$('.nav-links a');
  const teintes = {
    programme: 'var(--sarcelle)',
    budget: 'var(--sarcelle)',
    souvenirs: 'var(--corail)',
    affiche: 'var(--corail)',
    plus: 'var(--corail)'
  };
  const sectionActive = new IntersectionObserver((entrees => {
    for (const e of entrees) {
      if (!e.isIntersecting) continue;
      const id = e.target.id;
      liens.forEach((a => a.classList.toggle('is-current', a.getAttribute('href') === '#' + id)));
      variable(racine, '--tint', teintes[id] || 'var(--or)');
    }
  }), {
    rootMargin: '-45% 0px -50% 0px'
  });
  $$('main > section[id]').forEach((s => sectionActive.observe(s)));
  $('#annee').textContent = (new Date).getFullYear();
  function suiviPointeur(el, surMouvement, surSortie) {
    let cadre = null, ev = null, prevu = false;
    const image = () => {
      prevu = false;
      if (!ev || !cadre) return;
      surMouvement((ev.clientX - cadre.left) / cadre.width, (ev.clientY - cadre.top) / cadre.height, ev, cadre);
    };
    el.addEventListener('pointerenter', (() => {
      cadre = el.getBoundingClientRect();
    }));
    el.addEventListener('pointermove', (e => {
      if (!cadre) cadre = el.getBoundingClientRect();
      ev = e;
      if (!prevu) {
        prevu = true;
        requestAnimationFrame(image);
      }
    }), {
      passive: true
    });
    el.addEventListener('pointerleave', (() => {
      cadre = null;
      ev = null;
      surSortie();
    }));
    addEventListener('scroll', (() => {
      cadre = null;
    }), {
      passive: true
    });
  }
  if (survolable && !reduit) {
    $$('[data-tilt]').forEach((el => {
      const max = el.classList.contains('phone') ? 7 : 10;
      const estBillet = el.classList.contains('billet');
      const reflets = estBillet ? $$('.bi-face', el) : $$('.af-reflet', el);
      let rx = 0, ry = 0;
      el._tilt = () => {
        const flip = estBillet && el.getAttribute('aria-pressed') === 'true' ? 180 : 0;
        el.style.transform = `perspective(1100px) rotateX(${rx.toFixed(2)}deg) rotateY(${(ry + flip).toFixed(2)}deg)`;
      };
      suiviPointeur(el, ((x, y) => {
        el.classList.add('is-tilting');
        rx = (.5 - y) * max;
        ry = (x - .5) * max;
        el._tilt();
        reflets.forEach((r => {
          r.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
          r.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
        }));
      }), (() => {
        rx = ry = 0;
        el.classList.remove('is-tilting');
        el.style.transform = '';
      }));
    }));
    $$('[data-glow]').forEach((el => suiviPointeur(el, ((x, y, e, c) => {
      el.style.setProperty('--mx', (e.clientX - c.left).toFixed(0) + 'px');
      el.style.setProperty('--my', (e.clientY - c.top).toFixed(0) + 'px');
    }), (() => {}))));
    $$('.magnet').forEach((el => suiviPointeur(el, ((x, y) => {
      el.style.translate = `${((x - .5) * 14).toFixed(1)}px ${((y - .5) * 12).toFixed(1)}px`;
    }), (() => {
      el.style.translate = '';
    }))));
  }
  const THEMES = [ [ 'Riviera', '#f0ab7d', '#bf6b57', '#1a4a54' ], [ 'Lagon', '#1f6361', '#1a4a54', '#123040' ], [ 'Désert', '#f5c785', '#d1804d', '#6b382e' ], [ 'Forêt', '#8cb37a', '#336b4d', '#14382e' ], [ 'Aurore', '#fab3ad', '#9e73b3', '#2e3366' ], [ 'Nuit', '#4d5c94', '#242b54', '#0d0f24' ], [ 'Sakura', '#fcccd6', '#db7d99', '#5c3352', 1 ], [ 'Glacier', '#ccebf7', '#6ba8cc', '#1f476b', 1 ], [ 'Terracotta', '#fabd8f', '#c76342', '#542a1f', 1 ], [ 'Olivier', '#d9d69e', '#80874d', '#333b24', 1 ] ];
  const carteAccueil = $('#home-card');
  const nomTheme = $('#theme-name');
  const nuancier = $('#swatches');
  let themeActif = 4;
  let themeManuel = false;
  nuancier.innerHTML = THEMES.map((([nom, a, b, c, plus], i) => `<button type="button" class="swatch" role="radio" aria-checked="${i === themeActif}" aria-label="${nom}${plus ? ', Escale+' : ''}" data-i="${i}" style="--a:${a};--b:${b};--c:${c}">${plus ? '<i class="plus-pt"></i>' : ''}</button>`)).join('');
  const pastilles = $$('.swatch', nuancier);
  function appliquerTheme(i) {
    themeActif = i;
    const [nom, a, b, c] = THEMES[i];
    carteAccueil.style.setProperty('--c0', a);
    carteAccueil.style.setProperty('--c1', b);
    carteAccueil.style.setProperty('--c2', c);
    nomTheme.textContent = nom;
    pastilles.forEach(((s, k) => s.setAttribute('aria-checked', k === i)));
  }
  nuancier.addEventListener('click', (e => {
    const s = e.target.closest('.swatch');
    if (!s) return;
    themeManuel = true;
    appliquerTheme(+s.dataset.i);
  }));
  if (!reduit) setInterval((() => {
    if (!themeManuel && !document.hidden && enVue.has('accueil') && heroP > .5) appliquerTheme((themeActif + 1) % THEMES.length);
  }), 2600);
  const K = {
    vol: '#3378cc',
    train: '#338c80',
    bateau: '#1a739e',
    lit: '#8c66b8',
    ticket: '#f5b85e',
    resto: '#e87557',
    etape: '#1f6361'
  };
  const PROG = [ {
    j: 'lun.',
    n: 3,
    items: [ {
      t: 'res',
      ic: 'i-train',
      k: K.train,
      b: 'Train Paris – La Spezia',
      s: 'SNCF · Trenitalia · QJX4TR',
      h: '07:12'
    }, {
      t: 'etape',
      ic: 'i-soleil',
      b: 'Levanto',
      s: 'La porte des Cinque Terre',
      fait: true
    }, {
      t: 'res',
      ic: 'i-lit',
      k: K.lit,
      b: 'Casa sul Mare',
      s: 'Arrivée · Via Cavour 12',
      h: '17:00'
    }, {
      t: 'souv',
      ph: 'levanto',
      b: 'Premier café face à la mer',
      s: 'Paisible · Levanto',
      p: [ '#8ab094', '#1f5747', '#1a4a54' ]
    } ]
  }, {
    j: 'mar.',
    n: 4,
    items: [ {
      t: 'etape',
      ic: 'i-soleil',
      b: 'Monterosso',
      s: 'La plage au petit matin',
      fait: true
    }, {
      t: 'res',
      ic: 'i-ticket',
      k: K.ticket,
      b: 'Kayak à Monterosso',
      s: 'Activité · 2 personnes',
      h: '10:00'
    }, {
      t: 'souv',
      ph: 'monterosso',
      b: 'Le premier plongeon',
      s: 'Lumineux · Monterosso',
      p: [ '#eda878', '#e8755a', '#1a4a54' ]
    } ]
  }, {
    j: 'mer.',
    n: 5,
    items: [ {
      t: 'etape',
      ic: 'i-jumelles',
      b: 'Vernazza',
      s: 'Le port et ses barques',
      fait: true
    }, {
      t: 'etape',
      ic: 'i-colonnes',
      b: 'Corniglia',
      s: 'Les 377 marches',
      fait: false
    }, {
      t: 'res',
      ic: 'i-fourchette',
      k: K.resto,
      b: 'Dîner à Vernazza',
      s: 'Trattoria Gianni · Piazza Marconi',
      h: '20:00'
    }, {
      t: 'souv',
      ph: 'pesto',
      b: 'Une table, tout en haut',
      s: 'Savoureux · Vernazza',
      p: [ '#c79e82', '#8f5e54', '#1a4a54' ]
    } ]
  }, {
    j: 'jeu.',
    n: 6,
    items: [ {
      t: 'etape',
      ic: 'i-feuille',
      b: 'Manarola',
      s: 'Le sentier des vignes',
      fait: false
    }, {
      t: 'etape',
      ic: 'i-jumelles',
      b: 'Riomaggiore',
      s: 'Coucher de soleil sur le port',
      fait: false
    }, {
      t: 'souv',
      ph: 'manarola-soir',
      b: 'Le chemin du retour',
      s: 'Libre · Manarola',
      p: [ '#eda878', '#bf6b57', '#1a4a54' ]
    } ]
  }, {
    j: 'ven.',
    n: 7,
    items: [ {
      t: 'res',
      ic: 'i-lit',
      k: K.lit,
      b: 'Casa sul Mare',
      s: 'Départ · rendre les clés',
      h: '10:00'
    }, {
      t: 'res',
      ic: 'i-train',
      k: K.train,
      b: 'Train La Spezia – Paris',
      s: 'Trenitalia · SNCF',
      h: '15:02'
    } ]
  } ];
  const jours = $('#prog-days');
  const listeProg = $('#prog-list');
  let jourActif = 2;
  jours.innerHTML = PROG.map(((d, i) => `<button type="button" class="day${i === 2 ? ' today' : ''}" role="tab" aria-selected="${i === jourActif}" data-i="${i}">${d.j}<b>${d.n}</b></button>`)).join('');
  const vignette = it => it.ph ? `<img src="assets/img/photos/${it.ph}-p.webp" width="240" height="160" alt="" decoding="async">` : paysage(it.p, {
    w: 60,
    h: 60,
    soleil: [ .7, .3 ]
  });
  function rendreJour() {
    const d = PROG[jourActif];
    $$('.day', jours).forEach(((b, i) => b.setAttribute('aria-selected', i === jourActif)));
    listeProg.innerHTML = `<p class="p-jour">Jour ${jourActif + 1} · ${d.j} ${d.n} août</p><div class="p-items">` + d.items.map(((it, i) => {
      if (it.t === 'souv') return `<div class="p-souv" style="--i:${i}"><span class="mini-art">${vignette(it)}</span><span><b>${it.b}</b><small>${it.s}</small></span></div>`;
      if (it.t === 'res') return `<div class="p-item" style="--i:${i}"><span class="ic-tile" style="--k:${it.k}">${ico(it.ic)}</span><span><b>${it.b}</b><small>${it.s}</small></span><time>${it.h}</time></div>`;
      return `<button type="button" class="p-item${it.fait ? ' fait' : ''}" style="--i:${i}" data-k="${i}" aria-pressed="${!!it.fait}"><span class="ic-tile" style="--k:${K.etape}">${ico(it.ic)}</span><span><b>${it.b}</b><small>${it.s}</small></span><i class="p-etat">${ico('i-check')}</i></button>`;
    })).join('') + '</div>';
    listeProg.scrollTop = 0;
  }
  jours.addEventListener('click', (e => {
    const b = e.target.closest('.day');
    if (b) {
      jourActif = +b.dataset.i;
      rendreJour();
    }
  }));
  $('#prog-today').addEventListener('click', (() => {
    jourActif = 2;
    rendreJour();
  }));
  listeProg.addEventListener('click', (e => {
    const b = e.target.closest('button.p-item');
    if (!b) return;
    const it = PROG[jourActif].items[+b.dataset.k];
    it.fait = !it.fait;
    b.classList.toggle('fait', it.fait);
    b.setAttribute('aria-pressed', it.fait);
  }));
  rendreJour();
  const billet = $('#billet');
  billet.addEventListener('click', (() => {
    billet.setAttribute('aria-pressed', billet.getAttribute('aria-pressed') !== 'true');
    if (billet._tilt && billet.classList.contains('is-tilting')) billet._tilt();
  }));
  const MODELES = [ [ 'Les essentiels', 'i-etincelles', [ 'Passeport ou carte d’identité', 'Chargeur', 'Médicaments', 'Brosse à dents', 'Écouteurs' ] ], [ 'Plage et soleil', 'i-soleil', [ 'Maillot de bain', 'Crème solaire', 'Serviette de plage', 'Chapeau ou casquette', 'Lunettes de soleil', 'Sandales', 'Après-soleil' ] ], [ 'Randonnée', 'i-rando', [ 'Chaussures de marche', 'Sac à dos', 'Veste imperméable', 'Gourde', 'Barres de céréales', 'Carte ou trace GPX' ] ], [ 'Week-end en ville', 'i-colonnes', [ 'Chaussures confortables', 'Petit sac à dos', 'Pass de transport', 'Parapluie pliable', 'Batterie externe' ] ], [ 'Camping', 'i-feuille', [ 'Tente', 'Sac de couchage', 'Lampe', 'Réchaud et cartouche', 'Anti-moustique' ] ], [ 'Avec un bébé', 'i-coeur', [ 'Couches', 'Biberons', 'Doudou', 'Poussette ou porte-bébé', 'Carnet de santé' ] ] ];
  const valise = [ {
    n: 'Maillot de bain',
    ok: true
  }, {
    n: 'Chaussures de marche',
    ok: true
  }, {
    n: 'Carte Cinque Terre',
    ok: false
  }, {
    n: 'Crème solaire',
    ok: false
  }, {
    n: 'Chargeur',
    ok: false
  }, {
    n: 'Lunettes de soleil',
    ok: false
  } ];
  const vListe = $('#v-liste');
  const vDefil = vListe.closest('.scroll');
  const sansAccent = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  const dansValise = n => valise.some((o => sansAccent(o.n) === sansAccent(n)));
  const ligneValise = (o, i, retard = -1) => `<li><button type="button" class="v-item${o.ok ? ' ok' : ''}${retard >= 0 ? ' nouveau' : ''}" data-i="${i}" aria-pressed="${o.ok}"${retard >= 0 ? ` style="animation-delay:${retard * 70}ms"` : ''}><i class="v-case">${ico('i-check')}</i><span>${html(o.n)}</span></button></li>`;
  function majModeles() {
    $$('.modele', $('#modeles')).forEach((m => {
      const manque = MODELES[+m.dataset.i][2].filter((n => !dansValise(n))).length;
      m.classList.toggle('ajoute', !manque);
      m.querySelector('em').textContent = manque ? '+' + manque : 'Déjà ajoutée';
    }));
  }
  function majValise() {
    const total = valise.length, prets = valise.filter((o => o.ok)).length;
    $('#v-anneau').style.strokeDashoffset = 113.1 * (1 - (total ? prets / total : 0));
    $('#v-titre').textContent = `${prets} sur ${total} prêt${prets > 1 ? 's' : ''}`;
    const reste = total - prets;
    $('#v-sous').textContent = reste ? `Encore ${reste} objet${reste > 1 ? 's' : ''} à préparer` : 'Bon voyage !';
    $('#v-fini').hidden = !!reste || !total;
    texte($('#v-notif'), reste ? `Encore ${reste} chose${reste > 1 ? 's' : ''} à préparer dans votre valise.` : 'Tout est prêt pour Cinque Terre, Italie. Bon voyage !');
  }
  function ajouterObjets(noms) {
    const debut = valise.length;
    noms.forEach((n => valise.push({
      n: n,
      ok: false
    })));
    vListe.insertAdjacentHTML('beforeend', noms.map(((n, k) => ligneValise(valise[debut + k], debut + k, k))).join(''));
    majValise();
    majModeles();
    vDefil.scrollTo({
      top: vDefil.scrollHeight,
      behavior: reduit ? 'auto' : 'smooth'
    });
  }
  vListe.innerHTML = valise.map(((o, i) => ligneValise(o, i))).join('');
  vListe.addEventListener('click', (e => {
    const b = e.target.closest('.v-item');
    if (!b) return;
    const o = valise[+b.dataset.i];
    o.ok = !o.ok;
    b.classList.toggle('ok', o.ok);
    b.setAttribute('aria-pressed', o.ok);
    majValise();
  }));
  $('#modeles').innerHTML = MODELES.map((([t, ic], i) => `<button type="button" class="modele" data-i="${i}">${ico(ic)}${t}<em></em></button>`)).join('');
  $$('#modeles .modele svg').forEach((s => {
    s.style.width = '16px';
    s.style.height = '16px';
  }));
  $('#modeles').addEventListener('click', (e => {
    const m = e.target.closest('.modele');
    if (!m) return;
    const ajouts = MODELES[+m.dataset.i][2].filter((n => !dansValise(n)));
    if (ajouts.length) ajouterObjets(ajouts);
  }));
  $('#v-form').addEventListener('submit', (e => {
    e.preventDefault();
    const champ = $('#v-input'), n = champ.value.trim();
    if (!n) return;
    champ.value = '';
    if (!dansValise(n)) ajouterObjets([ n ]);
  }));
  majValise();
  majModeles();
  const CATS = {
    transport: [ 'Transport', 'i-avion', '#4a8fb4' ],
    stay: [ 'Hébergement', 'i-lit', '#2e8a86' ],
    food: [ 'Repas', 'i-fourchette', '#e8755a' ],
    activity: [ 'Activités', 'i-ticket', '#f5b85e' ],
    shopping: [ 'Achats', 'i-sac', '#a07cbd' ],
    other: [ 'Autre', 'i-doc', '#8c8f94' ]
  };
  const VOYAGEURS = [ [ 'Léa', '#1f8f8a' ], [ 'Hugo', '#e8755a' ], [ 'Nora', '#5c6bbf' ] ];
  const TAUX = {
    EUR: [ 1, '€' ],
    JPY: [ 162, '¥' ],
    MAD: [ 10.9, 'DH' ],
    USD: [ 1.08, '$' ]
  };
  const BUDGET = 1200;
  const depenses = [ {
    l: 'Train Paris – La Spezia',
    m: 238,
    c: 'transport',
    p: 0
  }, {
    l: 'Casa sul Mare (4 nuits)',
    m: 412,
    c: 'stay',
    p: 1
  }, {
    l: 'Carte Cinque Terre Treno',
    m: 64,
    c: 'transport',
    p: 2
  }, {
    l: 'Dîner à Vernazza',
    m: 96,
    c: 'food',
    p: 0
  }, {
    l: 'Kayak à Monterosso',
    m: 60,
    c: 'activity',
    p: 1
  }, {
    l: 'Huile d’olive et pesto',
    m: 28,
    c: 'shopping',
    p: 2
  } ];
  let catChoisie = 'food', payeur = 0;
  $('#b-cat').innerHTML = Object.entries(CATS).map((([k, [t, ic]]) => `<button type="button" role="radio" aria-checked="${k === catChoisie}" data-c="${k}" title="${t}">${ico(ic)}<span class="sr-c">${t}</span></button>`)).join('');
  $('#b-payeur').innerHTML = VOYAGEURS.map((([n], i) => `<button type="button" role="radio" aria-checked="${i === payeur}" data-p="${i}">${n}</button>`)).join('');
  $$('#b-cat .sr-c').forEach((s => {
    s.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)';
  }));
  $('#b-cat').addEventListener('click', (e => {
    const b = e.target.closest('button');
    if (!b) return;
    catChoisie = b.dataset.c;
    $$('#b-cat button').forEach((x => x.setAttribute('aria-checked', x === b)));
  }));
  $('#b-payeur').addEventListener('click', (e => {
    const b = e.target.closest('button');
    if (!b) return;
    payeur = +b.dataset.p;
    $$('#b-payeur button').forEach((x => x.setAttribute('aria-checked', x === b)));
  }));
  const lireMontant = () => parseFloat(($('#b-montant').value || '').replace(/\s/g, '').replace(',', '.'));
  function majConversion() {
    const d = $('#b-devise').value, v = lireMontant();
    texte($('#b-conv'), d !== 'EUR' && v > 0 ? `${nombre.format(v)} ${TAUX[d][1]} ≈ ${euro(v / TAUX[d][0])} (taux d’exemple)` : '');
  }
  $('#b-montant').addEventListener('input', majConversion);
  $('#b-devise').addEventListener('change', majConversion);
  const donut = $('#b-donut');
  function rendreBudget(nouvelle = -1) {
    const total = depenses.reduce(((s, d) => s + d.m), 0);
    const parCat = {};
    depenses.forEach((d => {
      parCat[d.c] = (parCat[d.c] || 0) + d.m;
    }));
    const base = Math.max(total, BUDGET);
    let acc = 0;
    const parts = Object.entries(parCat).map((([c, v]) => {
      const a = acc;
      acc += v / base * 100;
      return `${CATS[c][2]} ${a.toFixed(2)}% ${acc.toFixed(2)}%`;
    }));
    parts.push(`rgba(246,238,223,.08) ${acc.toFixed(2)}% 100%`);
    donut.style.setProperty('--parts', parts.join(','));
    if (nouvelle >= 0) {
      donut.classList.remove('bump');
      requestAnimationFrame((() => requestAnimationFrame((() => donut.classList.add('bump')))));
    }
    $('#b-total').textContent = euro(total);
    const reste = BUDGET - total;
    $('#b-reste').textContent = reste >= 0 ? `reste ${euro(reste)}` : `dépassement de ${euro(-reste)}`;
    const jauge = $('#b-jauge');
    jauge.style.width = Math.min(100, total / BUDGET * 100) + '%';
    jauge.classList.toggle('depasse', reste < 0);
    $('#b-leg').innerHTML = Object.entries(parCat).sort(((a, b) => b[1] - a[1])).map((([c, v]) => `<li style="--k:${CATS[c][2]}"><i></i>${CATS[c][0]}<b>${euro(v)}</b></li>`)).join('');
    $('#b-liste').innerHTML = depenses.map(((d, i) => ({
      d: d,
      i: i
    }))).reverse().map((({d: d, i: i}) => `<li class="b-dep${i === nouvelle ? ' nouveau' : ''}"><span class="ic-tile" style="--k:${CATS[d.c][2]}">${ico(CATS[d.c][1])}</span><span><b>${html(d.l)}</b><small>${CATS[d.c][0]} · payé par ${VOYAGEURS[d.p][0]}${d.o ? ' · ' + d.o : ''}</small></span><em>${euro(d.m)}</em></li>`)).join('');
    const paye = VOYAGEURS.map(((_, i) => depenses.filter((d => d.p === i)).reduce(((s, d) => s + d.m), 0)));
    const part = total / VOYAGEURS.length;
    const soldes = paye.map((p => Math.round((p - part) * 100) / 100));
    $('#b-voyageurs').innerHTML = VOYAGEURS.map((([n, k], i) => `<li class="voyageur"><span class="avatar" style="--k:${k}">${n.slice(0, 2).toUpperCase()}</span><span><b>${n}</b><small>A payé ${euro(paye[i])} · part ${euro(part)}</small></span><span class="solde ${soldes[i] >= 0 ? 'pos' : 'neg'}">${soldes[i] >= 0 ? '+' : '−'}${euro(Math.abs(soldes[i]))}</span></li>`)).join('');
    const cred = soldes.map(((s, i) => [ i, s ])).filter((([, s]) => s > .005)).sort(((a, b) => b[1] - a[1]));
    const deb = soldes.map(((s, i) => [ i, -s ])).filter((([, s]) => s > .005)).sort(((a, b) => b[1] - a[1]));
    const virs = [];
    while (cred.length && deb.length) {
      const m = Math.min(cred[0][1], deb[0][1]);
      virs.push([ deb[0][0], cred[0][0], m ]);
      cred[0][1] -= m;
      deb[0][1] -= m;
      if (cred[0][1] < .005) cred.shift();
      if (deb[0][1] < .005) deb.shift();
    }
    $('#b-virements').innerHTML = virs.length ? virs.map((([de, a, m], i) => {
      const [n1, k1] = VOYAGEURS[de], [n2, k2] = VOYAGEURS[a];
      return `<li class="virement" style="--i:${i};--k1:${k1};--k2:${k2}"><span class="avatar" style="--k:${k1}">${n1.slice(0, 2).toUpperCase()}</span><b>${n1}</b><i class="fl"></i><b>${euro(m)}</b><i class="fl"></i><span class="avatar" style="--k:${k2}">${n2.slice(0, 2).toUpperCase()}</span></li>`;
    })).join('') : '<li class="virement ok">Les comptes sont à jour.</li>';
  }
  $('#b-form').addEventListener('submit', (e => {
    e.preventDefault();
    const v = lireMontant();
    if (!(v > 0)) {
      $('#b-montant').focus();
      return;
    }
    const d = $('#b-devise').value;
    const lib = $('#b-lib').value.trim() || CATS[catChoisie][0];
    depenses.push({
      l: lib,
      m: Math.round(v / TAUX[d][0] * 100) / 100,
      c: catChoisie,
      p: payeur,
      o: d !== 'EUR' ? `${nombre.format(v)} ${TAUX[d][1]}` : ''
    });
    $('#b-lib').value = '';
    $('#b-montant').value = '';
    majConversion();
    rendreBudget(depenses.length - 1);
    $('#b-liste').scrollTop = 0;
  }));
  rendreBudget();
  const SOUV = [ {
    t: 'Premier café face à la mer',
    ph: 'levanto',
    l: 'Levanto',
    d: '3 août 2026',
    h: [ 'Paisible', 'i-feuille' ],
    x: 'Sans regarder l’heure. Le train pouvait attendre.',
    p: [ '#8ab094', '#1f5747', '#1a4a54' ]
  }, {
    t: 'Le premier plongeon',
    ph: 'monterosso',
    l: 'Monterosso',
    d: '4 août 2026',
    h: [ 'Lumineux', 'i-soleil' ],
    x: 'Le soleil tapait déjà fort. On a posé les sacs et couru vers l’eau.',
    p: [ '#eda878', '#e8755a', '#1a4a54' ]
  }, {
    t: 'Une lumière dorée',
    ph: 'vernazza',
    l: 'Vernazza',
    d: '5 août 2026',
    h: [ 'Émerveillé', 'i-etincelles' ],
    x: 'Une lumière dorée sur les façades, les barques au repos.',
    p: [ '#f5c785', '#d1804d', '#6b382e' ]
  }, {
    t: 'Une table, tout en haut',
    ph: 'pesto',
    l: 'Vernazza',
    d: '5 août 2026',
    h: [ 'Savoureux', 'i-fourchette' ],
    x: 'Pâtes au pesto, vin blanc frais, et le village qui s’allume en contrebas.',
    p: [ '#c79e82', '#8f5e54', '#1a4a54' ]
  }, {
    t: 'Le sentier des vignes',
    ph: 'sentier',
    l: 'Manarola',
    d: '6 août 2026',
    h: [ 'Aventureux', 'i-rando' ],
    x: 'Le dernier détour, celui qui valait le plus.',
    p: [ '#8cb37a', '#336b4d', '#14382e' ]
  }, {
    t: 'Le chemin du retour',
    ph: 'manarola-soir',
    l: 'Manarola',
    d: '6 août 2026',
    h: [ 'Libre', 'i-vent' ],
    x: 'On a raté le train exprès. Le sentier nous a offert la plus belle vue.',
    p: [ '#fab3ad', '#9e73b3', '#2e3366' ]
  } ];
  const HUMEURS = [ [ 'Lumineux', 'i-soleil' ], [ 'Libre', 'i-vent' ], [ 'Émerveillé', 'i-etincelles' ], [ 'Savoureux', 'i-fourchette' ], [ 'Paisible', 'i-feuille' ], [ 'Aventureux', 'i-rando' ], [ 'Nostalgique', 'i-nuage' ] ];
  const piste = $('#souv-piste');
  piste.innerHTML = SOUV.map((s => `<article class="souv-c"><div class="souv-art"><img src="assets/img/photos/${s.ph}.webp" alt="" loading="lazy" decoding="async"><svg class="mood"><use href="#${s.h[1]}"/></svg></div><div class="souv-tx"><em>${ico(s.h[1])}${s.l} · ${s.d}</em><b>${s.t}</b><p>${s.x}</p></div></article>`)).join('') + `<div class="souv-fin"><b>Sept humeurs pour se souvenir.</b><p>Journal par mois ou mosaïque, visionneuse plein écran avec zoom, vidéos depuis Photos.</p><div class="humeurs">${HUMEURS.map((([n, ic]) => `<span>${ico(ic)}${n}</span>`)).join('')}</div></div>`;
  const pellicule = $('#pellicule');
  const PELLICULE = [ 'levanto', 'corniglia-mer', 'monterosso', 'focaccia', 'vernazza', 'port', 'pesto', 'riomaggiore', 'sentier', 'corniglia', 'manarola', 'manarola-soir' ];
  const tuiles = Array.from({
    length: 12
  }, ((_, i) => {
    const t = document.createElement('span');
    t.className = 'ph-t';
    t.innerHTML = `<img src="assets/img/photos/${PELLICULE[i]}-p.webp" alt="" loading="lazy" decoding="async">`;
    pellicule.append(t);
    return t;
  }));
  let range = false, taillePellicule = [ 0, 0 ];
  const hasard = (i, k) => {
    const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  function placerPhotos() {
    const [W, H] = taillePellicule;
    if (!W) return;
    const w = Math.min(84, (W / 3 - 40) / 2);
    tuiles.forEach(((t, i) => {
      t.style.setProperty('--w', w + 'px');
      t.style.setProperty('--dl', (range ? i * 45 : (11 - i) * 30) + 'ms');
      if (range) {
        const c = i % 3, k = Math.floor(i / 3);
        t.style.setProperty('--x', c * W / 3 + 16 + k % 2 * (w + 8) + 'px');
        t.style.setProperty('--y', Math.max(54, (H - 2 * w - 8) / 2 + 16) + Math.floor(k / 2) * (w + 8) + 'px');
        t.style.setProperty('--r', '0deg');
      } else {
        t.style.setProperty('--x', hasard(i, 1) * (W - w) + 'px');
        t.style.setProperty('--y', hasard(i, 2) * (H - w) + 'px');
        t.style.setProperty('--r', (hasard(i, 3) - .5) * 34 + 'deg');
      }
    }));
    pellicule.classList.toggle('range', range);
  }
  new ResizeObserver((([e]) => {
    const W = Math.round(e.contentRect.width), H = Math.round(e.contentRect.height);
    if (W === taillePellicule[0] && H === taillePellicule[1]) return;
    taillePellicule = [ W, H ];
    placerPhotos();
  })).observe(pellicule);
  $('#trouve-go').addEventListener('click', (e => {
    range = !range;
    e.currentTarget.innerHTML = range ? `${ico('i-check')}12 photos rangées · Recommencer` : `${ico('i-loupe')}Retrouver les photos`;
    placerPhotos();
  }));
  const AFFICHES = {
    ligurie: {
      t: 'L’été en Ligurie',
      ph: 'affiche-ligurie',
      d: 'Cinque Terre, Italie · août 2026',
      c: [ '#f0ab7d', '#bf6b57', '#1a4a54' ],
      ch: [ 5, '23,4', 4, 12 ],
      tr: 'M14 40C50 20 70 60 98 62S130 70 150 92C170 96 190 88 206 104S226 118 236 130C252 132 266 138 286 140'
    },
    lisbonne: {
      t: 'Lisbonne en novembre',
      ph: 'affiche-lisbonne',
      d: 'Lisbonne, Portugal · nov. 2026',
      c: [ '#fab3ad', '#9e73b3', '#2e3366' ],
      ch: [ 5, '6,6', 3, 9 ],
      tr: 'M20 120C40 70 80 110 110 80S150 30 180 50 230 110 250 70 270 30 286 24'
    }
  };
  const affiche = $('#affiche-el');
  const traceAff = $('.af-trace');
  function majAffiche() {
    const v = AFFICHES[$('#aff-voyage [aria-checked="true"]').dataset.v];
    affiche.dataset.style = $('#aff-style [aria-checked="true"]').dataset.s;
    affiche.style.setProperty('--c0', v.c[0]);
    affiche.style.setProperty('--c1', v.c[1]);
    affiche.style.setProperty('--c2', v.c[2]);
    $('.af-art img', affiche).src = `assets/img/photos/${v.ph}.webp`;
    $('#af-titre').textContent = v.t;
    $('#af-dest').textContent = v.d;
    $('#af-trace').setAttribute('d', v.tr);
    const pts = v.tr.match(/-?\d+(\.\d+)?/g).map(Number);
    const cercles = $$('circle', traceAff);
    cercles[0].setAttribute('cx', pts[0]);
    cercles[0].setAttribute('cy', pts[1]);
    cercles[1].setAttribute('cx', pts[pts.length - 2]);
    cercles[1].setAttribute('cy', pts[pts.length - 1]);
    $('#af-chiffres').innerHTML = `<span><b>${v.ch[0]}</b>jours</span><span><b>${v.ch[1]}</b>km</span><span><b>${v.ch[2]}</b>étapes</span><span><b>${v.ch[3]}</b>souvenirs</span>`;
    traceAff.classList.remove('redessine');
    requestAnimationFrame((() => requestAnimationFrame((() => traceAff.classList.add('redessine')))));
  }
  $$('#aff-style, #aff-voyage').forEach((g => g.addEventListener('click', (e => {
    const b = e.target.closest('button');
    if (!b) return;
    $$('button', g).forEach((x => x.setAttribute('aria-checked', x === b)));
    majAffiche();
  }))));
  const face = $('#face');
  face.addEventListener('click', (() => {
    if (face.classList.contains('scan')) return;
    face.classList.remove('ok');
    face.classList.add('scan');
    setTimeout((() => {
      face.classList.remove('scan');
      face.classList.add('ok');
      face.setAttribute('aria-label', 'Carnet déverrouillé');
    }), 900);
    setTimeout((() => {
      face.classList.remove('ok');
      face.setAttribute('aria-label', 'Simuler le déverrouillage par Face ID');
    }), 3200);
  }));
  const siri = $('.siri-l');
  if (!reduit) siri.append(...[ ...siri.children ].map((n => {
    const c = n.cloneNode(true);
    c.setAttribute('aria-hidden', 'true');
    return c;
  })));
  const offres = $('#offres');
  offres.addEventListener('click', (e => {
    const o = e.target.closest('.offre');
    if (o) $$('.offre', offres).forEach((x => x.setAttribute('aria-checked', x === o)));
  }));
  const avionAccueil = $('#avion-hero');
  const ciel = $('.vol-hero');
  const arcAccueil = echantillonner($('#arc-hero'), 4);
  let animAvion = null, tailleCiel = '';
  function construireAvionAccueil() {
    const W = ciel.clientWidth, H = ciel.clientHeight;
    if (!W || !H || tailleCiel === W + 'x' + H) return;
    tailleCiel = W + 'x' + H;
    const s = Math.max(W / 1440, H / 800), ox = (W - 1440 * s) / 2, oy = (H - 800 * s) / 2;
    avionAccueil.style.width = avionAccueil.style.height = (28 * s).toFixed(2) + 'px';
    avionAccueil.style.margin = `${(-14 * s).toFixed(2)}px 0 0 ${(-14 * s).toFixed(2)}px`;
    const N = 160, images = [];
    for (let i = 0; i <= N; i++) {
      const l = arcAccueil.L * i / N, [x, y] = arcAccueil.point(l);
      images.push({
        transform: `translate3d(${(ox + x * s).toFixed(1)}px,${(oy + y * s).toFixed(1)}px,0) rotate(${arcAccueil.angle(l).toFixed(1)}deg)`
      });
    }
    const temps = animAvion ? animAvion.currentTime : 0;
    const enPause = animAvion && animAvion.playState === 'paused';
    if (animAvion) animAvion.cancel();
    animAvion = avionAccueil.animate(images, {
      duration: 16e3,
      iterations: Infinity,
      easing: 'linear'
    });
    animAvion.currentTime = temps;
    if (enPause) animAvion.pause();
  }
  function basculerAvionAccueil(visible) {
    if (!animAvion) return;
    if (visible) animAvion.play(); else animAvion.pause();
  }
  const arcVol = echantillonner($('#vol-arc'), 3);
  const traceVol = $('#vol-trace');
  traceVol.style.setProperty('--len', arcVol.L);
  const avion = $('#vol-avion');
  const calque = $('#vol-calque');
  const carteVol = $('#vol-carte');
  const nuages = $$('.nu');
  const cielVol = $('.vol-ciel');
  const billetZone = $('#billet-zone');
  const volCopie = $('.vol-copy');
  const arrivee = [ $('#vol-arrivee'), $('#vol-onde-arr') ];
  const volAlt = $('#vol-alt'), volReste = $('#vol-reste');
  let echelleVol = 1;
  function mesurerVol() {
    const pin = $('.vol-pin').getBoundingClientRect(), r = carteVol.getBoundingClientRect();
    if (!r.width) return;
    echelleVol = Math.min(r.width / 1200, r.height / 560);
    const w = 1200 * echelleVol, h = 560 * echelleVol;
    calque.style.cssText = `left:${(r.left - pin.left + (r.width - w) / 2).toFixed(1)}px;top:${(r.top - pin.top + (r.height - h) / 2).toFixed(1)}px;width:${w.toFixed(1)}px;height:${h.toFixed(1)}px;--s:${echelleVol.toFixed(4)}`;
    dernieres.delete(avion);
  }
  function majVol(p) {
    const f = douce(plage(p, .06, .76));
    const l = f * arcVol.L;
    const [x, y] = arcVol.point(l);
    style(avion, 'transform', `translate3d(${(x * echelleVol).toFixed(1)}px,${(y * echelleVol).toFixed(1)}px,0) rotate(${arcVol.angle(l).toFixed(1)}deg) scale(${(1 + Math.sin(Math.PI * f) * .25).toFixed(3)})`);
    style(traceVol, 'strokeDashoffset', (arcVol.L - l).toFixed(1));
    arrivee.forEach((el => classe(el, 'on', f > .985)));
    texte(volAlt, nombre.format(Math.round(Math.sin(Math.PI * f) ** .6 * 11e3 / 100) * 100) + ' m');
    const min = Math.round(100 * (1 - f));
    texte(volReste, min >= 60 ? `1 h ${String(min - 60).padStart(2, '0')}` : min ? `${min} min` : 'Arrivé');
    nuages.forEach((n => style(n, 'transform', `translate3d(${(p * +n.dataset.v * largeur * .7).toFixed(1)}px,0,0)`)));
    style(cielVol, 'transform', `translate3d(0,${(-p * 5).toFixed(2)}%,0) scale(${(1.14 - p * .1).toFixed(4)})`);
    const o = plage(p, .74, .88);
    variable(billetZone, '--o', o.toFixed(3));
    classe(billetZone, 'is-on', o > .5);
    style(volCopie, 'opacity', largeur < 960 ? (1 - plage(p, .7, .8)).toFixed(3) : '');
  }
  const plan = $('#sv-plan');
  async function figerCarte() {
    const svg = $('.sv-carte', plan);
    const copie = svg.cloneNode(true);
    const proprietes = [ 'fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin', 'opacity', 'font-family', 'font-size', 'font-style', 'font-weight', 'letter-spacing' ];
    const originaux = $$('*', svg), copies = $$('*', copie);
    originaux.forEach(((el, i) => {
      if (!el.getAttribute('class')) return;
      const cs = getComputedStyle(el);
      copies[i].setAttribute('style', proprietes.map((p => `${p}:${cs.getPropertyValue(p)}`)).join(';'));
    }));
    copie.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    copie.setAttribute('width', 1e3);
    copie.setAttribute('height', 700);
    copie.removeAttribute('class');
    const url = URL.createObjectURL(new Blob([ (new XMLSerializer).serializeToString(copie) ], {
      type: 'image/svg+xml'
    }));
    try {
      const img = new Image;
      img.src = url;
      await img.decode();
      const k = devicePixelRatio >= 2 ? 2.5 : 2;
      const toile = document.createElement('canvas');
      toile.width = 1e3 * k;
      toile.height = 700 * k;
      toile.className = 'sv-carte-img';
      toile.setAttribute('aria-hidden', 'true');
      toile.getContext('2d').drawImage(img, 0, 0, toile.width, toile.height);
      svg.after(toile);
      plan.classList.add('carte-prete');
    } catch (e) {} finally {
      URL.revokeObjectURL(url);
    }
  }
  (window.requestIdleCallback || (f => setTimeout(f, 200)))((() => figerCarte()), {
    timeout: 1500
  });
  const sentier = $('#sv-sentier');
  const cheminSentier = echantillonner(sentier, 3);
  const longSentier = cheminSentier.L;
  sentier.style.setProperty('--len', longSentier);
  const pins = $$('.sv-pin');
  const moi = $('#sv-moi');
  const VILLAGES = [ [ 150, 200 ], [ 395, 295 ], [ 560, 378 ], [ 815, 535 ] ];
  const longVillages = VILLAGES.map((([x, y]) => cheminSentier.proche(x, y)));
  const CAMERA = [ {
    p: 0,
    x: 500,
    y: 350,
    z: .66,
    tilt: 0,
    rot: 0,
    l: 0
  }, {
    p: .14,
    x: 150,
    y: 200,
    z: 1.3,
    tilt: 52,
    rot: -6,
    l: longVillages[0]
  }, {
    p: .36,
    x: 395,
    y: 295,
    z: 1.4,
    tilt: 56,
    rot: -14,
    l: longVillages[1]
  }, {
    p: .56,
    x: 560,
    y: 378,
    z: 1.45,
    tilt: 57,
    rot: -20,
    l: longVillages[2]
  }, {
    p: .76,
    x: 815,
    y: 535,
    z: 1.35,
    tilt: 54,
    rot: -26,
    l: longSentier
  }, {
    p: 1,
    x: 500,
    y: 380,
    z: .74,
    tilt: 40,
    rot: -10,
    l: longSentier
  } ];
  const ETAPES = [ {
    j: 'Jour 1 · 3 août',
    n: 'Levanto',
    d: 'La porte des Cinque Terre',
    s: 'Premier café face à la mer, sans regarder l’heure.',
    h: [ 'Paisible', 'i-feuille' ],
    ph: 'levanto'
  }, {
    j: 'Jour 2 · 4 août',
    n: 'Monterosso',
    d: 'La plage au petit matin',
    s: 'L’eau était fraîche. La plage, presque à nous.',
    h: [ 'Lumineux', 'i-soleil' ],
    ph: 'monterosso'
  }, {
    j: 'Jour 3 · 5 août',
    n: 'Vernazza',
    d: 'Le port et ses barques',
    s: 'Une lumière dorée sur les façades.',
    h: [ 'Savoureux', 'i-fourchette' ],
    ph: 'vernazza'
  }, {
    j: 'Jour 4 · 6 août',
    n: 'Manarola',
    d: 'Le sentier des vignes',
    s: 'Le dernier détour, celui qui valait le plus.',
    h: [ 'Libre', 'i-vent' ],
    ph: 'manarola'
  } ];
  const svImg = $('#sv-img');
  (window.requestIdleCallback || (f => setTimeout(f, 300)))((() => ETAPES.forEach((e => {
    (new Image).src = `assets/img/photos/${e.ph}.webp`;
  }))));
  const fiche = $('#sv-fiche');
  const svCopie = $('.sv-copy');
  const svKm = $('#sv-km'), svEtapes = $('#sv-etapes');
  let etapeAffichee = 0, kmEnreg = 0, minuteurFiche = 0;
  function majFiche(i) {
    if (i === etapeAffichee) return;
    etapeAffichee = i;
    fiche.classList.add('change');
    clearTimeout(minuteurFiche);
    minuteurFiche = setTimeout((() => {
      const e = ETAPES[etapeAffichee];
      $('#sv-jour').textContent = e.j;
      $('#sv-nom').textContent = e.n;
      $('#sv-detail').textContent = e.d;
      $('#sv-souvenir').textContent = `« ${e.s} »`;
      $('#sv-humeur').innerHTML = `${ico(e.h[1])}<span>${e.h[0]}</span>`;
      svImg.src = `assets/img/photos/${e.ph}.webp`;
      fiche.classList.remove('change');
    }), 260);
  }
  let ajusteCarte = 1;
  function majSurvol(p) {
    let k = 0;
    while (k < CAMERA.length - 2 && p > CAMERA[k + 1].p) k++;
    const A = CAMERA[k], B = CAMERA[k + 1];
    const t = douce(plage(p, A.p, B.p));
    const z = lerp(A.z, B.z, t) * ajusteCarte, tilt = lerp(A.tilt, B.tilt, t);
    const x = lerp(A.x, B.x, t), y = lerp(A.y, B.y, t);
    variable(plan, '--z', z.toFixed(4));
    variable(plan, '--tilt', tilt.toFixed(2) + 'deg');
    variable(plan, '--rot', lerp(A.rot, B.rot, t).toFixed(2) + 'deg');
    variable(plan, '--tx', (500 - x).toFixed(1) + 'px');
    variable(plan, '--ty', (350 - y).toFixed(1) + 'px');
    const l = lerp(A.l, B.l, sortie(t));
    style(sentier, 'strokeDashoffset', (longSentier - l).toFixed(1));
    const [qx, qy] = cheminSentier.point(Math.max(.1, l));
    style(moi, 'transform', `translate3d(${qx.toFixed(1)}px,${qy.toFixed(1)}px,2px)`);
    style(moi, 'opacity', l > 1 && l < longSentier - 1 ? '1' : '0');
    let atteints = 0;
    pins.forEach(((pin, i) => {
      const on = i ? l >= longVillages[i] - 3 : p > .09;
      if (on) atteints++;
      variable(pin, '--pz', on ? '1' : '0');
    }));
    const cour = Math.max(0, atteints - 1);
    pins.forEach(((pin, i) => classe(pin, 'cur', i === cour && atteints > 0 && p < .9)));
    majFiche(cour);
    style(fiche, 'opacity', (plage(p, .08, .13) * (1 - plage(p, .9, .96))).toFixed(3));
    style(svCopie, 'opacity', (1 - plage(p, .04, .11)).toFixed(3));
    texte(svKm, `${nombre.format(Math.round((l / longSentier * 23.4 + kmEnreg) * 10) / 10)} km`.replace(/^(\d+) km$/, '$1,0 km'));
    texte(svEtapes, `${atteints} / 4`);
  }
  const rec = $('#sv-rec');
  const chrono = $('#sv-chrono');
  let minuteur = null, secondes = 0;
  rec.addEventListener('click', (() => {
    const actif = rec.getAttribute('aria-pressed') !== 'true';
    rec.setAttribute('aria-pressed', actif);
    $('#sv-rec-l').textContent = actif ? 'Arrêter' : 'Enregistrer';
    clearInterval(minuteur);
    if (actif) {
      secondes = 0;
      minuteur = setInterval((() => {
        secondes++;
        kmEnreg += .0013;
        texte(chrono, `${String(Math.floor(secondes / 60)).padStart(2, '0')}:${String(secondes % 60).padStart(2, '0')}`);
        majSurvol(prog('survol', yLisse));
      }), 1e3);
    }
  }));
  const heroCopie = $('.hero-copy');
  const heroPhone = $('.hero-phone');
  const themes = $('.themes');
  const couches = {
    photo: $('.hero-photo'),
    nuit: $('.hero-nuit'),
    vol: ciel
  };
  const indice = $('.hero-hint');
  let heroP = 0, y0 = 0, echelle = 1, yFin = 0;
  function mesurerHero() {
    const vh = hauteur, large = largeur > 1180;
    echelle = Math.min(1, (largeur - 32) / 340, large ? (vh - 90) / 700 : (vh - 120) / 790);
    yFin = large ? 0 : -44 * echelle;
    const basCopie = heroCopie.offsetTop + heroCopie.offsetHeight;
    y0 = Math.max(basCopie + 34 - (vh / 2 - 350 * echelle), vh * .3);
  }
  function majHero(p) {
    heroP = p;
    const t = douce(plage(p, 0, .6));
    style(heroPhone, 'transform', `translate3d(-50%,calc(-50% + ${lerp(y0, yFin, t).toFixed(1)}px),0) scale(${echelle.toFixed(4)})`);
    style(heroCopie, 'opacity', (1 - plage(p, .1, .4)).toFixed(3));
    style(heroCopie, 'transform', `translate3d(0,${(-p * 180).toFixed(1)}px,0) scale(${(1 - p * .08).toFixed(4)})`);
    const o = plage(p, .5, .7);
    style(themes, 'opacity', o.toFixed(3));
    classe(themes, 'is-on', o > .5);
    style(couches.photo, 'transform', `translate3d(0,${(p * 40).toFixed(1)}px,0) scale(${(1 + p * .12).toFixed(4)})`);
    style(couches.nuit, 'opacity', (plage(p, .12, .7) * .5).toFixed(3));
    style(couches.vol, 'transform', `translate3d(0,${(-p * 120).toFixed(1)}px,0)`);
    style(indice, 'opacity', (1 - plage(p, 0, .06)).toFixed(3));
  }
  const avance = $('#souv-avance');
  let courseSouv = 0;
  function majSouvenirs(p) {
    const t = plage(p, .04, .96);
    style(piste, 'transform', `translate3d(${(-t * courseSouv).toFixed(1)}px,0,0)`);
    style(avance, 'transform', `scaleX(${t.toFixed(4)})`);
  }
  const sections = {
    hero: $('#accueil'),
    vol: $('#vol'),
    survol: $('#survol'),
    souv: $('#souvenirs'),
    manif: $('.manif')
  };
  const mesures = {};
  let largeur = innerWidth, hauteur = innerHeight, maxDefil = 1;
  function mesurer() {
    largeur = innerWidth;
    hauteur = innerHeight;
    for (const [k, el] of Object.entries(sections)) {
      let top = 0, n = el;
      while (n) {
        top += n.offsetTop;
        n = n.offsetParent;
      }
      mesures[k] = {
        top: top,
        h: el.offsetHeight
      };
    }
    maxDefil = Math.max(1, racine.scrollHeight - hauteur);
    courseSouv = Math.max(0, piste.scrollWidth - largeur);
    ajusteCarte = Math.min(largeur / 1e3, hauteur / 700) * (largeur < 700 ? 1.25 : 1.05);
    mesurerHero();
    mesurerVol();
    construireAvionAccueil();
  }
  const prog = (k, y) => {
    const m = mesures[k];
    return plage(y, m.top, m.top + m.h - hauteur);
  };
  const dedans = (k, y) => {
    const m = mesures[k];
    return y + hauteur > m.top - 50 && y < m.top + m.h + 50;
  };
  function rendre(y) {
    if (dedans('hero', y)) majHero(prog('hero', y));
    if (dedans('vol', y)) majVol(prog('vol', y));
    if (dedans('survol', y)) majSurvol(prog('survol', y));
    if (dedans('souv', y)) majSouvenirs(prog('souv', y));
    if (dedans('manif', y)) {
      const m = mesures.manif;
      const t = plage(y, m.top - hauteur * .75, m.top + m.h * .55 - hauteur * .45);
      const n = Math.round(t * motsManif.length);
      if (n !== motsAllumes) {
        const de = motsAllumes < 0 ? 0 : Math.min(n, motsAllumes);
        const a = motsAllumes < 0 ? motsManif.length : Math.max(n, motsAllumes);
        for (let i = de; i < a; i++) motsManif[i].classList.toggle('on', i < n);
        motsAllumes = n;
      }
    }
  }
  const LISSAGE = 85;
  let yLisse = scrollY, tPrec = 0, enBoucle = false;
  function image(t) {
    const y = scrollY;
    classe(nav, 'is-scrolled', y > 8);
    style(barre, 'transform', `scaleX(${borne(y / maxDefil, 0, 1).toFixed(4)})`);
    const dt = tPrec ? Math.min(t - tPrec, 64) : 16.7;
    tPrec = t;
    const ecart = y - yLisse;
    if (Math.abs(ecart) < .35 || Math.abs(ecart) > hauteur * 2.5) yLisse = y; else yLisse += ecart * (1 - Math.exp(-dt / LISSAGE));
    rendre(yLisse);
    if (yLisse !== y) requestAnimationFrame(image); else {
      enBoucle = false;
      tPrec = 0;
    }
  }
  const demander = () => {
    if (!enBoucle) {
      enBoucle = true;
      requestAnimationFrame(image);
    }
  };
  let mesureAttendue = false;
  const remesurer = () => {
    if (mesureAttendue) return;
    mesureAttendue = true;
    requestAnimationFrame((() => {
      mesureAttendue = false;
      mesurer();
      rendre(yLisse);
      demander();
    }));
  };
  mesurer();
  $$('[data-scope]').forEach((el => portee.observe(el)));
  if (reduit) {
    motsManif.forEach((w => w.classList.add('on')));
    majVol(1);
    majSurvol(1);
    themes.classList.add('is-on');
    addEventListener('scroll', (() => {
      classe(nav, 'is-scrolled', scrollY > 8);
      barre.style.transform = `scaleX(${borne(scrollY / maxDefil, 0, 1)})`;
    }), {
      passive: true
    });
    addEventListener('resize', (() => {
      maxDefil = Math.max(1, racine.scrollHeight - innerHeight);
    }));
  } else {
    rendre(yLisse);
    addEventListener('scroll', demander, {
      passive: true
    });
    addEventListener('resize', remesurer);
    addEventListener('load', remesurer);
    new ResizeObserver(remesurer).observe(document.body);
  }
})();
