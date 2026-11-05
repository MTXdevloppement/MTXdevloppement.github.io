(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const wideQ = matchMedia('(min-width: 961px)');
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [ ...el.querySelectorAll(s) ];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => 1 - Math.pow(1 - t, 3);
  const esc = s => String(s).replace(/[&<>"']/g, (c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c])));
  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const icon = id => `<svg><use href="#${id}"/></svg>`;
  const euroFmt = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  });
  const eur = v => euroFmt.format(Math.round(v)).replace(/ /g, ' ');
  const pct = v => `${String(Math.round(v * 1e3) / 10).replace('.', ',')} %`;
  const dec = v => v.toFixed(1).replace('.', ',');
  const YEAR = (new Date).getFullYear();
  const TRADES = {
    renovation: [ 'Rénovation', '🔨' ],
    salleDeBain: [ 'Salle de bain', '🚿' ],
    cuisine: [ 'Cuisine', '🍳' ],
    plomberie: [ 'Plomberie', '🚰' ],
    electricite: [ 'Électricité', '⚡' ],
    maconnerie: [ 'Maçonnerie', '🧱' ],
    menuiserie: [ 'Menuiserie', '🚪' ],
    peinture: [ 'Peinture', '🖌️' ],
    toiture: [ 'Toiture', '🏠' ],
    isolation: [ 'Isolation', '🧊' ],
    chauffage: [ 'Chauffage', '🔥' ],
    paysagisme: [ 'Jardin', '🌿' ]
  };
  const DOCS = {
    siret: [ 'SIRET vérifié', 'Entreprise active (Sirene)' ],
    decennale: [ 'Assurance décennale', 'En cours de validité' ],
    urssaf: [ 'Attestation URSSAF', 'Moins de 6 mois' ],
    rge: [ 'Label RGE', 'Éligible MaPrimeRénov’' ],
    qualibat: [ 'Qualibat', 'Qualification professionnelle' ]
  };
  const COMPANIES = [ {
    id: 'arg',
    name: 'Atelier Rive Gauche',
    ini: 'AR',
    hue: 22,
    tag: 'Salles de bain et cuisines clés en main',
    city: 'Lyon 7e',
    trades: [ 'salleDeBain', 'cuisine', 'renovation', 'plomberie' ],
    rate: .05,
    founded: 2014,
    resp: 3,
    ver: [ 'siret', 'decennale', 'urssaf', 'qualibat' ],
    ratings: [ 5, 5, 4 ],
    done: 48,
    rv: [ [ 'Claire D.', 5, 'Salle de bain refaite en trois semaines, pile dans les délais.', 14800 ], [ 'Mehdi B.', 5, 'Cuisine sur mesure superbe. Le devis en jalons rassure.', 22500 ] ]
  }, {
    id: 'volt',
    name: 'Volt & Co',
    ini: 'VC',
    hue: 209,
    tag: 'Électricité, domotique et bornes',
    city: 'Villeurbanne',
    trades: [ 'electricite', 'chauffage' ],
    rate: .07,
    founded: 2017,
    resp: 2,
    ver: [ 'siret', 'decennale', 'urssaf', 'rge' ],
    ratings: [ 5, 5 ],
    done: 63,
    rv: [ [ 'Thomas R.', 5, 'Tableau refait et borne posée en une journée.', 3900 ] ]
  }, {
    id: 'ferrand',
    name: 'Maçonnerie Ferrand',
    ini: 'MF',
    hue: 32,
    tag: 'Gros œuvre, extensions et ouvertures',
    city: 'Vénissieux',
    trades: [ 'maconnerie', 'renovation', 'toiture' ],
    rate: .06,
    founded: 1998,
    resp: 12,
    ver: [ 'siret', 'decennale', 'urssaf', 'qualibat' ],
    ratings: [ 5, 4, 5 ],
    done: 87,
    rv: [ [ 'Julien P.', 5, 'Extension de 25 m² parfaite, équipe ponctuelle.', 48e3 ] ]
  }, {
    id: 'peintres',
    name: 'Les Peintres du Rhône',
    ini: 'LP',
    hue: 331,
    tag: 'Peinture, enduits et papiers peints',
    city: 'Lyon 3e',
    trades: [ 'peinture', 'renovation' ],
    rate: .08,
    founded: 2019,
    resp: 6,
    ver: [ 'siret', 'decennale', 'urssaf' ],
    ratings: [ 5, 4 ],
    done: 31,
    rv: [ [ 'Léa F.', 5, 'Appartement repeint en 4 jours, finitions parfaites.', 4600 ] ]
  }, {
    id: 'bois',
    name: 'Bois & Lumière',
    ini: 'BL',
    hue: 36,
    tag: 'Menuiserie sur mesure, fenêtres',
    city: 'Tassin',
    trades: [ 'menuiserie', 'isolation' ],
    rate: .05,
    founded: 2011,
    resp: 24,
    ver: [ 'siret', 'decennale', 'urssaf', 'rge', 'qualibat' ],
    ratings: [ 5, 5, 5 ],
    done: 54,
    rv: [ [ 'Hélène M.', 5, 'Escalier en chêne magnifique, un vrai travail d’ébéniste.', 12400 ] ]
  }, {
    id: 'aqua',
    name: 'Aqua Services Lyon',
    ini: 'AS',
    hue: 187,
    tag: 'Plomberie, dépannage, chauffe-eau',
    city: 'Lyon 8e',
    trades: [ 'plomberie', 'chauffage', 'salleDeBain' ],
    rate: .04,
    founded: 2021,
    resp: 1,
    ver: [ 'siret', 'decennale' ],
    ratings: [ 4 ],
    done: 12,
    rv: [ [ 'Marc E.', 4, 'Intervention rapide pour une fuite, efficace.', 680 ] ]
  }, {
    id: 'jardins',
    name: 'Jardins Suspendus',
    ini: 'JS',
    hue: 119,
    tag: 'Paysagisme, terrasses et clôtures',
    city: 'Sainte-Foy',
    trades: [ 'paysagisme', 'maconnerie' ],
    rate: .1,
    founded: 2016,
    resp: 8,
    ver: [ 'siret', 'decennale', 'urssaf' ],
    ratings: [ 5, 4 ],
    done: 39,
    rv: [ [ 'Chloé A.', 5, 'Notre jardin est méconnaissable, merci !', 18e3 ] ]
  } ];
  const byId = id => COMPANIES.find((c => c.id === id));
  const avg = a => a.length ? a.reduce(((x, y) => x + y), 0) / a.length : 0;
  const TRUST_MAX = {
    docs: 30,
    note: 30,
    volume: 15,
    react: 10,
    anc: 10,
    lit: 5
  };
  const trustParts = t => ({
    docs: t.docs / 5 * 30,
    note: (t.rating ? t.rating / 5 : .6) * 30,
    volume: Math.min(t.done / 60, 1) * 15,
    react: Math.max(0, 1 - (t.resp - 1) / 47) * 10,
    anc: Math.min(t.years / 15, 1) * 10,
    lit: t.lit === 0 ? 5 : Math.max(0, 5 - t.lit * 2)
  });
  const trustScore = t => Math.round(Object.values(trustParts(t)).reduce(((a, b) => a + b), 0));
  const coInputs = c => ({
    docs: c.ver.length,
    rating: avg(c.ratings),
    done: c.done,
    resp: c.resp,
    years: Math.max(1, YEAR - c.founded),
    lit: 0
  });
  COMPANIES.forEach((c => {
    c.rating = avg(c.ratings);
    c.trust = trustScore(coInputs(c));
  }));
  const fees = (amount, rate) => {
    const commission = amount * rate, platform = amount * .03, client = Math.min(amount * .015, 490);
    return {
      commission: commission,
      platform: platform,
      client: client,
      net: amount - commission - platform
    };
  };
  const sbar = () => '<div class="sbar"><span>9:41</span><i class="sb-r"></i></div>';
  const tabbarClient = on => `<div class="tabbar">${[ [ 'i-loupe', 'Explorer' ], [ 'i-pile', 'Chantiers' ], [ 'i-plus-rond', 'Apporter' ], [ 'i-euro', 'Gains' ], [ 'i-profil', 'Profil' ] ].map((([i, l], k) => `<span class="${k === on ? 'on' : ''}">${icon(i)}${l}</span>`)).join('')}</div>`;
  const tabbarPro = on => `<div class="tabbar">${[ [ '▦', 'Tableau' ], [ '▤', 'Demandes' ], [ '◧', 'Ma fiche' ] ].map((([i, l], k) => `<span class="${k === on ? 'on' : ''}"><b class="tb-i">${i}</b>${l}</span>`)).join('')}<span>${icon('i-profil')}Profil</span></div>`;
  const logo = c => `<span class="logo" style="--h:${c.hue}">${c.ini}</span>`;
  function notify(app, title, sub) {
    let n = $('.notif', app);
    if (!n) {
      n = document.createElement('div');
      n.className = 'notif';
      n.setAttribute('aria-hidden', 'true');
      app.append(n);
    }
    n.innerHTML = `<img src="assets/img/apple-touch-icon.png" alt=""><span><b>${esc(title)}</b><small>${esc(sub)}</small></span>`;
    clearTimeout(n._t);
    requestAnimationFrame((() => n.classList.add('on')));
    n._t = setTimeout((() => n.classList.remove('on')), 3e3);
  }
  function tweenText(el, to, format, dur = 650) {
    if (!el) return;
    const from = el._v ?? to;
    el._v = to;
    cancelAnimationFrame(el._raf);
    if (reduced || from === to) {
      el.textContent = format(to);
      return;
    }
    const t0 = performance.now();
    const step = now => {
      const t = clamp((now - t0) / dur);
      el.textContent = format(lerp(from, to, ease(t)));
      if (t < 1) el._raf = requestAnimationFrame(step);
    };
    el._raf = requestAnimationFrame(step);
  }
  let scrollToY = y => scrollTo({
    top: y,
    behavior: reduced ? 'auto' : 'smooth'
  });
  const goTo = sel => {
    const el = $(sel);
    if (el) scrollToY(el.getBoundingClientRect().top + scrollY - 40);
  };
  const explorer = (() => {
    const app = $('#explorer');
    if (!app) return null;
    const chipTrades = [ 'salleDeBain', 'cuisine', 'electricite', 'maconnerie', 'menuiserie', 'peinture', 'paysagisme', 'plomberie' ];
    const SORTS = [ [ 'Confiance', (a, b) => b.trust - a.trust ], [ 'Note', (a, b) => b.rating - a.rating ], [ 'Commission', (a, b) => b.rate - a.rate ], [ 'Réactivité', (a, b) => a.resp - b.resp ] ];
    const st = {
      q: '',
      trade: null,
      sort: 0
    };
    app.innerHTML = `\n      <div class="pane" data-home>\n        ${sbar()}\n        <h3 class="lt">Explorer</h3>\n        <label class="search">${icon('i-loupe')}<input type="search" placeholder="Métier, entreprise, ville…" autocomplete="off" aria-label="Rechercher une entreprise dans la démonstration"></label>\n        <div class="chips" role="group" aria-label="Filtrer par métier">\n          <button type="button" class="chip on" data-trade="">Tous</button>${chipTrades.map((t => `<button type="button" class="chip" data-trade="${t}">${TRADES[t][0]}</button>`)).join('')}\n        </div>\n        <div class="row-h"><span data-count></span><button type="button" data-sort aria-label="Changer le tri">Confiance ↓</button></div>\n        <div class="pane-scroll" data-list></div>\n        ${tabbarClient(0)}\n      </div>\n      <div class="pane is-right" data-fiche aria-hidden="true"></div>`;
    const home = $('[data-home]', app), fiche = $('[data-fiche]', app), list = $('[data-list]', app);
    function renderList() {
      const q = norm(st.q.trim());
      const res = COMPANIES.filter((c => !st.trade || c.trades.includes(st.trade))).filter((c => !q || norm(`${c.name} ${c.city} ${c.tag} ${c.trades.map((t => TRADES[t][0])).join(' ')}`).includes(q))).sort(SORTS[st.sort][1]);
      $('[data-count]', app).textContent = `${res.length} entreprise${res.length > 1 ? 's' : ''}`;
      list.innerHTML = res.map(((c, i) => `\n        <button type="button" class="co" data-id="${c.id}" style="--i:${i}" aria-label="Ouvrir la fiche de ${esc(c.name)}">\n          <span class="cover" style="--h:${c.hue}"><img src="assets/img/chantiers/${c.id}.webp" alt="" loading="lazy" decoding="async"><span class="pill-w">€ ${pct(c.rate)} pour l’apporteur</span></span>\n          <span class="co-b">${logo(c)}<span><b>${esc(c.name)}</b><small>${esc(c.tag)}</small></span></span>\n          <span class="co-m"><span>${icon('i-etoile').replace('<svg', '<svg class="y"')}${dec(c.rating)} <span class="gr">(${c.ratings.length})</span></span><span class="gr">${icon('i-epingle')}${esc(c.city)}</span><span class="tr">${icon('i-bouclier')}${c.trust}</span></span>\n        </button>`)).join('') || '<p class="empty">Aucune entreprise.<br>Essayez un autre métier.</p>';
    }
    function open(id, viaKeyboard) {
      const c = byId(id);
      fiche.innerHTML = `\n        ${sbar()}\n        <div class="navb"><button type="button" class="nb-l" data-back>‹ Explorer</button><b>${esc(c.name)}</b><span></span></div>\n        <div class="pane-scroll">\n          <div class="f-cover"><span class="cover" style="--h:${c.hue}"><img src="assets/img/chantiers/${c.id}.webp" alt="" loading="lazy" decoding="async"></span></div>\n          <div class="f-top">${logo(c)}<svg class="ring-s" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="16"/><circle class="v" cx="20" cy="20" r="16"/><text x="20" y="24">${c.trust}</text></svg></div>\n          <p class="f-name">${esc(c.name)}<small>${esc(c.tag)}</small></p>\n          <div class="stats"><span><b>${dec(c.rating)}</b>${c.ratings.length} avis</span><span><b>${c.done}</b>chantiers</span><span><b>${c.resp} h</b>réponse</span><span><b>${pct(c.rate)}</b>commission</span></div>\n          <p class="sec-t">Documents vérifiés</p>\n          <div class="list">${Object.entries(DOCS).map((([k, [l, d]]) => {
        const ok = c.ver.includes(k);
        return `<div class="${ok ? '' : 'off'}">${icon('i-bouclier').replace('<svg', `<svg class="${ok ? 'g' : ''}"`)}<span><b>${l}</b><small>${ok ? d : 'Non fourni'}</small></span>${ok ? icon('i-coche').replace('<svg', '<svg class="g"') : ''}</div>`;
      })).join('')}</div>\n          <p class="sec-t">Avis vérifiés</p>\n          ${c.rv.map((([a, n, t, m]) => `<div class="rv"><div class="rv-h"><span>${esc(a)} ${icon('i-coche').replace('<svg', '<svg class="g" style="display:inline;vertical-align:-2px"')}</span><span class="y">${'★'.repeat(n)}</span></div><p>${esc(t)}</p><small>${eur(m)} · chantier payé via Maillon</small></div>`)).join('')}\n        </div>\n        <div class="bottom"><button type="button" class="ubtn" data-bring>＋ Apporter un chantier</button></div>`;
      home.classList.add('is-under');
      home.setAttribute('aria-hidden', 'true');
      fiche.classList.remove('is-right');
      fiche.removeAttribute('aria-hidden');
      const ring = $('.ring-s .v', fiche);
      requestAnimationFrame((() => requestAnimationFrame((() => {
        ring.style.strokeDashoffset = 100.5 * (1 - c.trust / 100);
      }))));
      fiche.dataset.id = id;
      if (viaKeyboard) $('[data-back]', fiche).focus({
        preventScroll: true
      });
    }
    function close(viaKeyboard) {
      home.classList.remove('is-under');
      home.removeAttribute('aria-hidden');
      fiche.classList.add('is-right');
      fiche.setAttribute('aria-hidden', 'true');
      if (viaKeyboard) $(`.co[data-id="${fiche.dataset.id}"]`, app)?.focus({
        preventScroll: true
      });
    }
    app.addEventListener('input', (e => {
      if (e.target.type === 'search') {
        st.q = e.target.value;
        renderList();
      }
    }));
    app.addEventListener('click', (e => {
      const chip = e.target.closest('[data-trade]');
      if (chip) {
        st.trade = chip.dataset.trade || null;
        $$('[data-trade]', app).forEach((b => b.classList.toggle('on', b === chip)));
        renderList();
        return;
      }
      if (e.target.closest('[data-sort]')) {
        st.sort = (st.sort + 1) % SORTS.length;
        e.target.closest('[data-sort]').textContent = `${SORTS[st.sort][0]} ↓`;
        renderList();
        return;
      }
      const co = e.target.closest('.co');
      if (co) {
        open(co.dataset.id, e.detail === 0);
        return;
      }
      if (e.target.closest('[data-back]')) {
        close(e.detail === 0);
        return;
      }
      if (e.target.closest('[data-bring]')) {
        apport?.preselect(fiche.dataset.id);
        goTo('#apporter');
      }
    }));
    renderList();
    return {
      open: open
    };
  })();
  const apport = (() => {
    const app = $('#apport');
    if (!app) return null;
    const TITLES = [ 'Pour qui ?', 'Le projet', 'Budget et délai', 'L’entreprise', 'Récapitulatif' ];
    const DELAIS = [ 'Urgent', 'Sous 1 mois', 'Sous 3 mois', 'Flexible' ];
    const fresh = () => ({
      step: 0,
      dir: 1,
      kind: 'proche',
      name: 'Jean Morel',
      consent: false,
      trade: 'salleDeBain',
      title: '',
      city: 'Lyon 5e',
      budget: 15e3,
      delai: 1,
      company: null,
      sent: false
    });
    let st = fresh();
    let lastStep = -1;
    const ticket = $('#ticket'), gainEl = $('#ticket-gain');
    const co = () => st.company ? byId(st.company) : null;
    const title = () => st.title.trim() || `${TRADES[st.trade][0]} à refaire`;
    const candidates = () => COMPANIES.filter((c => c.trades.includes(st.trade))).sort(((a, b) => b.trust - a.trust));
    const canGo = () => st.step === 0 ? st.kind === 'moi' || st.name.trim() && st.consent : st.step === 1 ? !!st.city.trim() : st.step === 3 ? !!st.company : true;
    function stepHtml() {
      switch (st.step) {
       case 0:
        return `\n          <button type="button" class="choice ${st.kind === 'proche' ? 'on' : ''}" data-kind="proche"><i>👥</i><span><b>Pour un proche</b><small>Un voisin, un ami. Vous touchez la commission.</small></span></button>\n          <button type="button" class="choice ${st.kind === 'moi' ? 'on' : ''}" data-kind="moi"><i>🏠</i><span><b>Pour moi</b><small>Vos travaux. La commission devient une remise.</small></span></button>\n          ${st.kind === 'proche' ? `\n            <p class="lbl">Le porteur du projet</p>\n            <input class="field" data-f="name" value="${esc(st.name)}" placeholder="Nom du proche" aria-label="Nom du proche">\n            <button type="button" class="toggle" role="switch" aria-checked="${st.consent}" data-consent><span>Mon proche est d’accord pour être contacté. Il confirmera la demande.</span><i></i></button>` : ''}`;

       case 1:
        return `\n          <p class="lbl">Type de travaux</p>\n          <div class="trades">${Object.entries(TRADES).map((([k, [l, e]]) => `<button type="button" class="trade ${st.trade === k ? 'on' : ''}" data-trade="${k}" aria-pressed="${st.trade === k}"><em>${e}</em>${l}</button>`)).join('')}</div>\n          <p class="lbl">Le chantier</p>\n          <input class="field" data-f="title" value="${esc(st.title)}" placeholder="${esc(TRADES[st.trade][0])} à refaire" aria-label="Titre du chantier">\n          <input class="field" data-f="city" value="${esc(st.city)}" placeholder="Ville" aria-label="Ville">`;

       case 2:
        return `\n          <div class="budget"><small style="color:var(--u-muted)">Budget estimé</small><output data-budget>${eur(st.budget)}</output>\n            <input type="range" min="500" max="150000" step="500" value="${st.budget}" data-f="budget" aria-label="Budget estimé">\n            <div class="presets-u">${[ 5e3, 15e3, 4e4, 8e4 ].map((v => `<button type="button" data-budget-set="${v}">${eur(v)}</button>`)).join('')}</div></div>\n          <p class="lbl">Délai souhaité</p>\n          <div class="segu" role="radiogroup" aria-label="Délai">${DELAIS.map(((d, i) => `<button type="button" role="radio" aria-checked="${st.delai === i}" class="${st.delai === i ? 'on' : ''}" data-delai="${i}">${d}</button>`)).join('')}</div>\n          <p style="color:var(--u-muted);font-size:10px">💡 Pas besoin d’être précis : l’entreprise affinera après la visite.</p>`;

       case 3:
        {
          const cs = candidates();
          return `<p style="color:var(--u-muted);font-size:10.5px">Une seule entreprise reçoit votre chantier : pas d’enchères, pas de démarchage.</p>\n            ${cs.map((c => `<button type="button" class="pick ${st.company === c.id ? 'on' : ''}" data-pick="${c.id}" aria-pressed="${st.company === c.id}">${logo(c)}<span><b>${esc(c.name)}</b><small>★ ${dec(c.rating)} · ${esc(c.city)} · confiance ${c.trust}</small><em>Gain estimé : ${eur(st.budget * c.rate)}</em></span><i class="rd"></i></button>`)).join('') || '<p class="empty">Aucune entreprise pour ce métier dans la démo.</p>'}`;
        }

       default:
        {
          const c = co();
          return `<div class="gain-c"><small>${st.kind === 'moi' ? 'Votre remise estimée' : 'Votre commission estimée'}</small><b>${eur(st.budget * c.rate)}</b><small>${pct(c.rate)} du montant HT signé, versés au fil des paiements.</small></div>\n            <div class="recap">${[ [ 'Chantier', title() ], [ 'Ville', st.city ], [ 'Budget', eur(st.budget) ], [ 'Délai', DELAIS[st.delai] ], [ 'Pour', st.kind === 'moi' ? 'Moi' : st.name ], [ 'Entreprise', c.name ] ].map((([k, v]) => `<div><span>${k}</span><b>${esc(v)}</b></div>`)).join('')}</div>\n            <p style="color:var(--u-muted);font-size:10px">🔒 Les coordonnées ne sont transmises qu’après acceptation.</p>`;
        }
      }
    }
    function render(focusSel) {
      if (st.sent) {
        const c = co();
        app.innerHTML = `<div class="pane">${sbar()}\n          <div class="done"><span class="ok">${icon('i-coche')}</span><h4>Chantier envoyé&#8239;!</h4>\n          <p>${st.kind === 'proche' ? `${esc(st.name)} va recevoir une invitation pour confirmer. ` : ''}${esc(c.name)} répond en ${c.resp} h en moyenne.</p></div>\n          <div class="bottom" style="display:grid;gap:7px"><button type="button" class="ubtn" data-follow>Suivre mon chantier ↓</button><button type="button" class="ubtn sec" data-again>Apporter un autre chantier</button></div></div>`;
        lastStep = -1;
        return;
      }
      const same = st.step === lastStep;
      lastStep = st.step;
      app.innerHTML = `<div class="pane">${sbar()}\n        <div class="navb"><button type="button" class="nb-l" data-prev ${st.step ? '' : 'disabled'}>‹ Retour</button><b>${TITLES[st.step]}</b><span></span></div>\n        <div class="prog"><span style="width:${(st.step + 1) / TITLES.length * 100}%"></span></div>\n        <div class="step ${same ? 'still' : st.dir < 0 ? 'back' : ''}">${stepHtml()}</div>\n        <div class="bottom"><button type="button" class="ubtn" data-next ${canGo() ? '' : 'disabled'}>${st.step === 4 ? 'Envoyer le chantier' : 'Continuer'}</button></div></div>`;
      if (focusSel) $(focusSel, app)?.focus({
        preventScroll: true
      });
    }
    let prevTicket = {};
    function renderTicket() {
      const c = co();
      const rows = {
        Pour: st.kind === 'moi' ? 'Moi' : st.name.trim() || '—',
        "Métier": TRADES[st.trade][0],
        Chantier: title(),
        Ville: st.city || '—',
        Budget: eur(st.budget),
        "Délai": DELAIS[st.delai],
        Entreprise: c ? c.name : '—'
      };
      ticket.innerHTML = Object.entries(rows).map((([k, v]) => `<div class="${prevTicket[k] !== undefined && prevTicket[k] !== v ? 'chg' : ''}"><dt>${k}</dt><dd>${esc(v)}</dd></div>`)).join('');
      prevTicket = rows;
      $('#ticket-gain-l').textContent = st.kind === 'moi' ? 'Votre remise estimée' : 'Votre commission estimée';
      if (c) {
        tweenText(gainEl, st.budget * c.rate, eur);
        $('#ticket-gain-s').textContent = `${pct(c.rate)} du HT signé chez ${c.name}, versés à chaque jalon.`;
      } else {
        cancelAnimationFrame(gainEl._raf);
        gainEl._v = undefined;
        gainEl.textContent = '—';
        $('#ticket-gain-s').textContent = 'Choisissez une entreprise pour voir son taux.';
      }
    }
    const update = focusSel => {
      render(focusSel);
      renderTicket();
    };
    app.addEventListener('click', (e => {
      const t = e.target;
      const kb = e.detail === 0;
      if (t.closest('[data-kind]')) {
        st.kind = t.closest('[data-kind]').dataset.kind;
        update(kb && `[data-kind="${st.kind}"]`);
      } else if (t.closest('[data-consent]')) {
        st.consent = !st.consent;
        update('[data-consent]');
      } else if (t.closest('[data-trade]')) {
        st.trade = t.closest('[data-trade]').dataset.trade;
        if (st.company && !byId(st.company).trades.includes(st.trade)) st.company = null;
        update(kb && `[data-trade="${st.trade}"]`);
      } else if (t.closest('[data-budget-set]')) {
        st.budget = +t.closest('[data-budget-set]').dataset.budgetSet;
        update();
      } else if (t.closest('[data-delai]')) {
        st.delai = +t.closest('[data-delai]').dataset.delai;
        update(kb && `[data-delai="${st.delai}"]`);
      } else if (t.closest('[data-pick]')) {
        st.company = t.closest('[data-pick]').dataset.pick;
        update(kb && `[data-pick="${st.company}"]`);
      } else if (t.closest('[data-prev]')) {
        st.step--;
        st.dir = -1;
        update(kb && '[data-next]');
      } else if (t.closest('[data-next]')) {
        if (!canGo()) return;
        if (st.step < 4) {
          st.step++;
          st.dir = 1;
          update(kb && '[data-next]');
          return;
        }
        st.sent = true;
        update(kb && '[data-follow]');
        const c = co();
        duo?.load({
          title: title(),
          trade: st.trade,
          city: st.city,
          budget: st.budget,
          company: c.id,
          kind: st.kind,
          porteur: st.kind === 'moi' ? 'Vous' : st.name.trim(),
          phone: '06 12 34 56 78'
        }, true);
      } else if (t.closest('[data-follow]')) goTo('#suivre'); else if (t.closest('[data-again]')) {
        st = fresh();
        update();
      }
    }));
    app.addEventListener('input', (e => {
      const f = e.target.dataset.f;
      if (!f) return;
      if (f === 'budget') {
        st.budget = +e.target.value;
        $('[data-budget]', app).textContent = eur(st.budget);
      } else st[f] = e.target.value;
      const next = $('[data-next]', app);
      if (next) next.disabled = !canGo();
      renderTicket();
    }));
    update();
    return {
      preselect(id) {
        const c = byId(id);
        if (!c) return;
        st = {
          ...fresh(),
          company: id,
          trade: c.trades[0],
          budget: 15e3
        };
        update();
      }
    };
  })();
  const duo = (() => {
    const wrap = $('#duo');
    if (!wrap) return null;
    const sides = {
      client: $('.duo-side[data-side="client"]', wrap),
      pro: $('.duo-side[data-side="pro"]', wrap)
    };
    const apps = {
      client: $('#duo-client'),
      pro: $('#duo-pro')
    };
    const packet = $('#duo-packet'), path = $('#duo-path'), logEl = $('#duo-log');
    const flows = Object.fromEntries($$('[data-flow]').map((el => [ el.dataset.flow, el ])));
    const STATUS = {
      envoye: [ 'Envoyé', '#0A84FF', '✈︎' ],
      accepte: [ 'Accepté', '#5E5CE6', '👍' ],
      visite: [ 'Visite planifiée', '#5E5CE6', '📅' ],
      devis: [ 'Devis reçu', '#FF6B2C', '📄' ],
      signe: [ 'Devis signé', '#8E5CF7', '✍︎' ],
      travaux: [ 'Travaux en cours', '#8E5CF7', '🔨' ],
      termine: [ 'Terminé', '#3DBE8B', '✓' ],
      refuse: [ 'Décliné', '#8a8a8e', '✕' ]
    };
    const ORDER = [ 'envoye', 'accepte', 'visite', 'devis', 'signe', 'travaux', 'termine' ];
    const MS = [ [ 'Acompte à la signature', .3 ], [ 'Mi-chantier', .4 ], [ 'Réception des travaux', .3 ] ];
    const DEFAULT = {
      title: 'Salle de bain PMR',
      trade: 'salleDeBain',
      city: 'Lyon 8e',
      budget: 12e3,
      company: 'arg',
      kind: 'proche',
      porteur: 'Odile Garnier',
      phone: '06 45 22 81 09'
    };
    let s, shownSide = 'client';
    const c = () => byId(s.ch.company);
    const released = () => s.ms.filter((m => m.on)).reduce(((a, m) => a + m.share), 0);
    const nextMs = () => s.ms.find((m => !m.on));
    const turn = () => [ 'envoye', 'accepte', 'visite', 'signe' ].includes(s.st) ? 'pro' : s.st === 'devis' || s.st === 'travaux' || s.st === 'termine' && !s.reviewed || s.st === 'refuse' ? 'client' : null;
    function load(ch, fromApport) {
      s = {
        ch: ch,
        st: 'envoye',
        quote: 0,
        ms: [],
        reviewed: false,
        day: 0,
        log: []
      };
      log(`Chantier apporté à ${c().name}`);
      render();
      if (fromApport) {
        s.pending = true;
      }
    }
    function log(text, days = 0) {
      s.day += days;
      s.log.unshift([ text, s.day ]);
      s.log = s.log.slice(0, 6);
    }
    const pipe = () => `<div class="pipe" style="--c:${STATUS[s.st][1]}">${ORDER.map(((k, i) => `<i class="${s.st !== 'refuse' && i <= ORDER.indexOf(s.st) ? 'on' : ''}"></i>`)).join('')}</div>`;
    const pill = () => `<span class="pillu" style="--c:${STATUS[s.st][1]}">${STATUS[s.st][2]} ${STATUS[s.st][0]}</span>`;
    const act = (title, text, buttons = '') => `<div class="card act ${buttons ? '' : 'wait'}"><b>${title}</b><small>${text}</small>${buttons}</div>`;
    function quoteCard() {
      if (!s.quote) return '';
      return `<div class="card"><div class="amt"><b>${eur(s.quote)}</b><small>HT</small></div>\n        <div class="barg"><span style="width:${released() * 100}%"></span></div>\n        ${s.ms.map((m => `<div class="ms ${m.on ? 'on' : ''}"><i>${m.on ? '✓' : ''}</i><span>${m.label}</span><span>${eur(s.quote * m.share)}</span></div>`)).join('')}</div>`;
    }
    function clientHtml() {
      const co = c();
      const f = fees(s.quote || s.ch.budget, co.rate);
      const n = nextMs();
      let a;
      switch (s.st) {
       case 'envoye':
        a = act('En attente de réponse', `${esc(co.name)} répond en ${co.resp} h en moyenne.`);
        break;

       case 'accepte':
        a = act('Demande acceptée', 'La visite va être planifiée.');
        break;

       case 'visite':
        a = act('Visite planifiée', 'Jeudi à 9 h. Le devis suivra.');
        break;

       case 'devis':
        a = act('Devis à signer', 'Signez et versez l’acompte : il ne part qu’avec votre accord.', '<button type="button" class="ubtn" data-a="sign">Signer et verser l’acompte</button>');
        break;

       case 'signe':
        a = act('Devis signé', 'L’entreprise va démarrer les travaux.');
        break;

       case 'travaux':
        a = act('Prochain jalon', `«&#8239;${n.label}&#8239;» : validez quand l’étape est terminée.`, `<button type="button" class="ubtn money" data-a="release">Valider et libérer ${eur(s.quote * n.share)}</button>`);
        break;

       case 'termine':
        a = s.reviewed ? act('Merci&#8239;!', 'Avis publié. Votre commission est versée en totalité.') : act('Chantier terminé 🎉', 'Votre avis vérifié aide toute la communauté.', `<div class="stars" aria-hidden="true">★★★★★</div><button type="button" class="ubtn" data-a="review">Publier l’avis</button>`);
        break;

       default:
        a = act('Demande déclinée', 'Proposez votre chantier à une autre entreprise.', '<button type="button" class="ubtn sec" data-a="reset">Recommencer</button>');
      }
      return `<div class="pane">${sbar()}\n        <div class="navb"><span class="nb-l">‹ Chantiers</span><b>${esc(s.ch.title)}</b><span class="nb-r">${icon('i-bulle')}</span></div>\n        <div class="pane-scroll">\n          <div class="card">${pill()}<b style="font-size:14px">${esc(s.ch.title)}</b><small style="color:var(--u-muted)">${esc(co.name)} · ${s.ch.kind === 'moi' ? 'Pour moi' : 'Pour un proche'}</small>${pipe()}</div>\n          ${a}${quoteCard()}\n          <div class="card"><div class="kv"><span>${s.ch.kind === 'moi' ? 'Votre remise' : 'Votre commission'} (${pct(co.rate)})</span><b class="gr">+ ${eur(f.commission * released())}</b></div><div class="kv"><span>${s.quote ? 'Sur le devis signé' : 'Estimée sur le budget'}</span><b>${eur(f.commission)}</b></div></div>\n        </div>${tabbarClient(1)}</div>`;
    }
    function proHtml() {
      const co = c();
      const f = fees(s.quote || s.ch.budget, co.rate);
      const open = s.st !== 'envoye' && s.st !== 'refuse';
      const proposal = Math.round(s.ch.budget * 1.05 / 100) * 100;
      let a;
      switch (s.st) {
       case 'envoye':
        a = act('Nouvelle demande', 'Acceptez pour obtenir les coordonnées du porteur.', '<div class="ubtns"><button type="button" class="ubtn sec" data-a="decline">Décliner</button><button type="button" class="ubtn" data-a="accept">Accepter</button></div>');
        break;

       case 'accepte':
        a = act('Planifiez la visite', 'Le porteur reçoit l’invitation dans son agenda.', '<button type="button" class="ubtn" data-a="visit">Planifier jeudi 9 h</button>');
        break;

       case 'visite':
        a = act('Envoyez votre devis', `${eur(proposal)} HT en trois jalons : 30 / 40 / 30.`, '<button type="button" class="ubtn" data-a="quote">Envoyer le devis</button>');
        break;

       case 'devis':
        a = act('Devis envoyé', `En attente de la signature de ${esc(s.ch.porteur)}.`);
        break;

       case 'signe':
        a = act('Devis signé 🎉', 'Acompte reçu. Démarrez quand vous êtes prêt.', '<button type="button" class="ubtn" data-a="start">Démarrer les travaux</button>');
        break;

       case 'travaux':
        a = act('Travaux en cours', 'Le client valide chaque jalon pour libérer les fonds.');
        break;

       case 'termine':
        a = act('Chantier terminé', s.reviewed ? 'Nouvel avis ★★★★★ publié sur votre fiche.' : 'Tout est payé. Publiez la réalisation sur votre fiche.');
        break;

       default:
        a = act('Demande déclinée', 'L’apporteur a été prévenu.');
      }
      return `<div class="pane">${sbar()}\n        <div class="navb"><span class="nb-l">‹ Demandes</span><b>${esc(co.name)}</b><span class="nb-r">${icon('i-bulle')}</span></div>\n        <div class="pane-scroll">\n          <div class="card">${pill()}<b style="font-size:14px">${esc(s.ch.title)}</b><small style="color:var(--u-muted)">${esc(s.ch.city)} · apporté par vous</small>${pipe()}</div>\n          ${a}\n          <div class="card">\n            <div class="kv"><span>Porteur</span>${open ? `<b>${esc(s.ch.porteur)}</b>` : '<span class="mask">Après acceptation</span>'}</div>\n            <div class="kv"><span>Téléphone</span>${open ? `<b>${esc(s.ch.phone)}</b>` : '<span class="mask">•• •• •• ••</span>'}</div>\n            <div class="kv"><span>Budget annoncé</span><b>${eur(s.ch.budget)}</b></div>\n            <div class="kv"><span>Commission apporteur</span><b>${pct(co.rate)}</b></div>\n          </div>\n          ${s.quote ? `<div class="card"><b>Paiements</b><div class="kv"><span>Versé sur votre compte</span><b class="gr">${eur(f.net * released())}</b></div><div class="kv"><span>Sur le séquestre</span><b>${eur(escrow())}</b></div><div class="kv"><span>Net du chantier</span><b>${eur(f.net)}</b></div></div>` : ''}\n        </div>${tabbarPro(1)}</div>`;
    }
    const escrow = () => s.quote && [ 'signe', 'travaux' ].includes(s.st) && nextMs() ? s.quote * nextMs().share : 0;
    function render() {
      const scrolls = Object.fromEntries(Object.entries(apps).map((([k, a]) => [ k, $('.pane-scroll', a)?.scrollTop || 0 ])));
      const keep = Object.fromEntries(Object.entries(apps).map((([k, a]) => [ k, $('.notif', a) ])));
      apps.client.innerHTML = clientHtml();
      apps.pro.innerHTML = proHtml();
      Object.entries(apps).forEach((([k, a]) => {
        if (keep[k]) a.append(keep[k]);
        const sc = $('.pane-scroll', a);
        if (sc) sc.scrollTop = scrolls[k];
      }));
      const t = turn();
      Object.entries(sides).forEach((([k, el]) => {
        el.classList.toggle('is-turn', t === k);
        el.classList.toggle('is-wait', !!t && t !== k);
      }));
      const co = c();
      const f = fees(s.quote || 0, co.rate), r = released();
      tweenText(flows.escrow, escrow(), eur);
      tweenText(flows.pro, f.net * r, eur);
      tweenText(flows.com, f.commission * r, eur);
      tweenText(flows.fee, (f.platform + f.client) * r, eur);
      logEl.innerHTML = s.log.map((([t, d]) => `<li><span>${esc(t)}</span><small>J+${d}</small></li>`)).join('');
    }
    function showSide(side) {
      shownSide = side;
      Object.entries(sides).forEach((([k, el]) => el.classList.toggle('is-shown', k === side)));
      $$('.duo-tabs [data-side]', wrap).forEach((b => b.setAttribute('aria-selected', String(b.dataset.side === side))));
    }
    let geo = null;
    function measureArc() {
      if (!wideQ.matches) {
        geo = null;
        return;
      }
      const w = wrap.getBoundingClientRect();
      const a = $('.iphone', sides.client).getBoundingClientRect(), b = $('.iphone', sides.pro).getBoundingClientRect();
      const y = a.top - w.top + a.height * .3;
      geo = {
        x1: a.right - w.left + 6,
        x2: b.left - w.left - 6,
        y: y,
        cy: y - 120
      };
      $('.duo-arc').setAttribute('viewBox', `0 0 ${w.width} ${w.height}`);
      path.setAttribute('d', `M${geo.x1},${geo.y} Q${(geo.x1 + geo.x2) / 2},${geo.cy} ${geo.x2},${geo.y}`);
    }
    function fly(from, label, color, done) {
      if (!geo || reduced) {
        done();
        return;
      }
      packet.innerHTML = `<i style="background:${color}"></i>${esc(label)}`;
      const pw = packet.offsetWidth, ph = packet.offsetHeight;
      const [xa, xb] = from === 'client' ? [ geo.x1, geo.x2 ] : [ geo.x2, geo.x1 ];
      const xm = (geo.x1 + geo.x2) / 2, t0 = performance.now(), dur = 950;
      packet.style.opacity = 1;
      const step = now => {
        const t = clamp((now - t0) / dur), e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const x = (1 - e) ** 2 * xa + 2 * (1 - e) * e * xm + e * e * xb;
        const y = (1 - e) ** 2 * geo.y + 2 * (1 - e) * e * geo.cy + e * e * geo.y;
        packet.style.transform = `translate3d(${x - pw / 2}px, ${y - ph / 2}px, 0) scale(${1 - Math.abs(e - .5) * .3})`;
        if (t < 1) requestAnimationFrame(step); else {
          packet.style.opacity = 0;
          done();
        }
      };
      requestAnimationFrame(step);
    }
    let busy = false;
    function send(from, label, color, apply, notice) {
      busy = true;
      fly(from, label, color, (() => {
        apply();
        render();
        const to = from === 'client' ? 'pro' : 'client';
        if (notice) notify(apps[to], notice[0], notice[1]);
        if (!wideQ.matches) setTimeout((() => showSide(turn() || to)), 700);
        busy = false;
      }));
    }
    const ACTIONS = {
      accept: () => send('pro', 'Demande acceptée', '#5E5CE6', (() => {
        s.st = 'accepte';
        log('Demande acceptée par l’entreprise', 1);
      }), [ `${c().name}`, 'a accepté votre chantier.' ]),
      decline: () => send('pro', 'Demande déclinée', '#8a8a8e', (() => {
        s.st = 'refuse';
        log('Demande déclinée', 1);
      }), [ `${c().name}`, 'a décliné la demande.' ]),
      visit: () => send('pro', 'Visite jeudi 9 h', '#5E5CE6', (() => {
        s.st = 'visite';
        log('Visite planifiée jeudi à 9 h', 1);
      }), [ 'Visite planifiée', 'Jeudi à 9 h, ajoutée à votre agenda.' ]),
      quote: () => {
        const amount = Math.round(s.ch.budget * 1.05 / 100) * 100;
        send('pro', `Devis · ${eur(amount)}`, '#FF6B2C', (() => {
          s.st = 'devis';
          s.quote = amount;
          s.ms = MS.map((([label, share]) => ({
            label: label,
            share: share,
            on: false
          })));
          log(`Devis de ${eur(amount)} HT envoyé`, 6);
        }), [ 'Nouveau devis', `${eur(amount)} HT à signer.` ]);
      },
      sign: () => send('client', `Acompte · ${eur(s.quote * .3)}`, '#8E5CF7', (() => {
        s.st = 'signe';
        s.ms[0].on = true;
        log('Devis signé, acompte libéré', 3);
      }), [ 'Devis signé', `Acompte de ${eur(s.quote * .3)} reçu.` ]),
      start: () => send('pro', 'Travaux démarrés', '#8E5CF7', (() => {
        s.st = 'travaux';
        log('Travaux démarrés', 7);
      }), [ 'Travaux démarrés', `${c().name} est sur le chantier.` ]),
      release: () => {
        const n = nextMs(), lastOne = s.ms.filter((x => !x.on)).length === 1;
        send('client', `Jalon · ${eur(s.quote * n.share)}`, '#3DBE8B', (() => {
          n.on = true;
          log(`Jalon validé : ${n.label}`, 14);
          if (!nextMs()) {
            s.st = 'termine';
            log('Chantier réceptionné, commission versée');
          }
        }), [ lastOne ? 'Chantier réceptionné' : 'Jalon validé', `${eur(s.quote * n.share)} libérés du séquestre.` ]);
      },
      review: () => send('client', 'Avis ★★★★★', '#F5B83D', (() => {
        s.reviewed = true;
        log('Avis vérifié publié ★★★★★', 2);
      }), [ 'Nouvel avis', '★★★★★ sur votre fiche.' ]),
      reset: () => {
        load({
          ...DEFAULT
        });
        if (!wideQ.matches) showSide('pro');
      }
    };
    wrap.addEventListener('click', (e => {
      const tab = e.target.closest('.duo-tabs [data-side]');
      if (tab) {
        showSide(tab.dataset.side);
        return;
      }
      const b = e.target.closest('[data-a]');
      if (!b || busy) return;
      ACTIONS[b.dataset.a]?.();
    }));
    $('#duo-reset')?.addEventListener('click', (() => {
      if (!busy) ACTIONS.reset();
    }));
    load({
      ...DEFAULT
    });
    showSide('pro');
    return {
      load(ch, fromApport) {
        load(ch, fromApport);
        showSide('pro');
      },
      measure: measureArc,
      arrive() {
        if (!s?.pending) return;
        s.pending = false;
        setTimeout((() => notify(apps.pro, 'Nouveau chantier', `${s.ch.title} · ${eur(s.ch.budget)}`)), 500);
      }
    };
  })();
  $('#ui-theme')?.addEventListener('click', (e => {
    const b = e.target.closest('[data-ui]');
    if (!b) return;
    root.dataset.ui = b.dataset.ui;
    $$('#ui-theme [data-ui]').forEach((x => x.setAttribute('aria-checked', String(x === b))));
  }));
  const fill = input => input.style.setProperty('--fill', `${(input.value - input.min) / (input.max - input.min) * 100}%`);
  document.addEventListener('input', (e => {
    if (e.target.matches('.range input')) fill(e.target);
  }));
  (() => {
    const calc = $('[data-calc]');
    if (!calc) return;
    const inA = $('[data-in="amount"]', calc), inR = $('[data-in="rate"]', calc), bar = $('.repart', calc);
    const segs = Object.fromEntries($$('[data-seg]', calc).map((x => [ x.dataset.seg, x ])));
    const vals = Object.fromEntries($$('[data-val]', calc).map((x => [ x.dataset.val, x ])));
    const update = () => {
      const amount = +inA.value, rate = +inR.value / 100, f = fees(amount, rate);
      $('[data-out="amount"]', calc).textContent = `${eur(amount)} HT`;
      $('[data-out="rate"]', calc).textContent = pct(rate);
      segs.net.style.setProperty('--w', `calc(${f.net / amount * 100}% - 7px)`);
      segs.com.style.setProperty('--w', `calc(${f.commission / amount * 100}% - 2px)`);
      segs.fee.style.setProperty('--w', `calc(${f.platform / amount * 100}% - 1px)`);
      tweenText(vals.com, f.commission, eur);
      tweenText(vals.net, f.net, eur);
      tweenText(vals.fee, f.platform, eur);
      tweenText(vals.client, f.client, eur);
      fill(inA);
      fill(inR);
    };
    inA.addEventListener('input', update);
    inR.addEventListener('input', update);
    update();
    $$('[data-leg]', calc).forEach((leg => {
      const seg = segs[leg.dataset.leg];
      const on = v => {
        bar.classList.toggle('focus', v);
        seg.classList.toggle('focus', v);
        leg.classList.toggle('focus', v);
      };
      [ leg, seg ].forEach((el => {
        el.addEventListener('pointerenter', (() => on(true)));
        el.addEventListener('pointerleave', (() => on(false)));
      }));
    }));
  })();
  (() => {
    const box = $('.trust');
    if (!box) return;
    const presets = $('#trust-presets'), docsEl = $('#trust-docs'), bars = $('#trust-bars');
    const ring = $('#trust-ring'), scoreEl = $('#trust-score'), verdict = $('#trust-verdict');
    const inputs = Object.fromEntries($$('[data-t]', box).map((x => [ x.dataset.t, x ])));
    const outs = Object.fromEntries($$('[data-t-out]', box).map((x => [ x.dataset.tOut, x ])));
    const LABELS = {
      docs: 'Documents vérifiés',
      note: 'Avis vérifiés',
      volume: 'Chantiers réalisés',
      react: 'Réactivité',
      anc: 'Ancienneté',
      lit: 'Absence de litige'
    };
    const PRESETS = [ 'arg', 'bois', 'aqua', 'peintres' ];
    let docs = [];
    presets.innerHTML = PRESETS.map((id => {
      const c = byId(id);
      return `<button type="button" data-preset="${id}" aria-pressed="false"><i style="--h:${c.hue}">${c.ini}</i>${esc(c.name)}</button>`;
    })).join('');
    docsEl.innerHTML = Object.entries(DOCS).map((([k, [l]]) => `<button type="button" class="doc" data-doc="${k}" aria-pressed="false">${icon('i-coche')}${l}</button>`)).join('');
    bars.innerHTML = Object.keys(LABELS).map((k => `<li data-bar="${k}"><span>${LABELS[k]}</span><b></b><i style="--v:0"></i></li>`)).join('');
    function load(id) {
      const c = byId(id), v = coInputs(c);
      docs = [ ...c.ver ];
      inputs.rating.value = v.rating.toFixed(1);
      inputs.done.value = v.done;
      inputs.resp.value = v.resp;
      inputs.years.value = v.years;
      inputs.lit.value = 0;
      $$('[data-preset]', presets).forEach((b => b.setAttribute('aria-pressed', String(b.dataset.preset === id))));
      update(true);
    }
    function update(fromPreset) {
      if (!fromPreset) $$('[data-preset]', presets).forEach((b => b.setAttribute('aria-pressed', 'false')));
      const t = {
        docs: docs.length,
        rating: +inputs.rating.value,
        done: +inputs.done.value,
        resp: +inputs.resp.value,
        years: +inputs.years.value,
        lit: +inputs.lit.value
      };
      $$('[data-doc]', docsEl).forEach((b => b.setAttribute('aria-pressed', String(docs.includes(b.dataset.doc)))));
      outs.rating.textContent = `${dec(t.rating)} ★`;
      outs.done.textContent = t.done;
      outs.resp.textContent = `${t.resp} h`;
      outs.years.textContent = `${t.years} an${t.years > 1 ? 's' : ''}`;
      outs.lit.textContent = t.lit;
      Object.values(inputs).forEach(fill);
      const parts = trustParts(t), score = trustScore(t);
      Object.entries(parts).forEach((([k, v]) => {
        const li = $(`[data-bar="${k}"]`, bars);
        $('b', li).textContent = `${Math.round(v * 10) / 10} / ${TRUST_MAX[k]}`.replace('.', ',');
        $('i', li).style.setProperty('--v', v / TRUST_MAX[k]);
      }));
      const [col, word] = score >= 85 ? [ '#3DBE8B', 'Très fiable' ] : score >= 70 ? [ '#3B82F6', 'Fiable' ] : score >= 55 ? [ '#F5B83D', 'À surveiller' ] : [ '#E5484D', 'Insuffisant' ];
      ring.style.setProperty('--rc', col);
      ring.style.setProperty('--s', score / 100);
      verdict.textContent = word;
      tweenText(scoreEl, score, (v => Math.round(v)), 700);
    }
    presets.addEventListener('click', (e => {
      const b = e.target.closest('[data-preset]');
      if (b) load(b.dataset.preset);
    }));
    docsEl.addEventListener('click', (e => {
      const b = e.target.closest('[data-doc]');
      if (!b) return;
      const k = b.dataset.doc;
      docs = docs.includes(k) ? docs.filter((d => d !== k)) : [ ...docs, k ];
      update();
    }));
    Object.values(inputs).forEach((i => i.addEventListener('input', (() => update()))));
    load('arg');
  })();
  $$('.split').forEach((h => {
    const text = h.textContent.trim();
    h.setAttribute('aria-label', text);
    h.innerHTML = text.split(/\s+/).map(((w, i) => `<span class="w" aria-hidden="true"><span style="--wi:${i}">${esc(w)}</span></span>`)).join(' ');
  }));
  const manif = $('#manif');
  const words = [];
  if (manif) {
    const wrapWords = node => [ ...node.childNodes ].forEach((n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.append(part);
            return;
          }
          const w = document.createElement('span');
          w.className = 'w';
          w.textContent = part;
          words.push(w);
          frag.append(w);
        }));
        n.replaceWith(frag);
      } else if (n.nodeType === 1) wrapWords(n);
    }));
    wrapWords(manif);
  }
  function countUp(el) {
    const to = +el.dataset.compte, t0 = performance.now(), dur = reduced ? 1 : 1500;
    const step = now => {
      const t = clamp((now - t0) / dur);
      el.textContent = Math.round(to * ease(t));
      if (t < 1) requestAnimationFrame(step);
    };
    el.textContent = 0;
    requestAnimationFrame(step);
  }
  $$('.chart i').forEach(((b, i) => b.style.setProperty('--k', i)));
  const io = new IntersectionObserver((entries => entries.forEach((en => {
    if (!en.isIntersecting) return;
    const el = en.target;
    el.classList.add('is-in');
    io.unobserve(el);
    $$('[data-compte]', el).forEach(countUp);
    if (el.id === 'duo') duo?.arrive();
  }))), {
    threshold: .16,
    rootMargin: '0px 0px -6% 0px'
  });
  $$('[data-reveal], .split, .repart, .pro-phone').forEach((el => io.observe(el)));
  new IntersectionObserver((en => {
    if (en[0].isIntersecting) duo?.arrive();
  }), {
    threshold: .4
  }).observe($('#duo'));
  if (fine && !reduced) {
    $$('.tilt').forEach((el => {
      const zone = el.closest('.hero-device, .apport-phone, .pro-phone') || el;
      const max = el.classList.contains('tilt-soft') ? 6 : 9;
      zone.addEventListener('pointermove', (e => {
        const r = zone.getBoundingClientRect();
        el.classList.add('is-tilting');
        el.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - .5) * max}deg`);
        el.style.setProperty('--rx', `${-((e.clientY - r.top) / r.height - .5) * max * .7}deg`);
      }));
      zone.addEventListener('pointerleave', (() => {
        el.classList.remove('is-tilting');
        el.style.setProperty('--ry', '0deg');
        el.style.setProperty('--rx', '0deg');
      }));
    }));
    $$('.glow').forEach((el => el.addEventListener('pointermove', (e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--gx', `${e.clientX - r.left}px`);
      el.style.setProperty('--gy', `${e.clientY - r.top}px`);
    }))));
    $$('.magnet').forEach((el => {
      el.addEventListener('pointermove', (e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .2}px, ${(e.clientY - r.top - r.height / 2) * .32}px)`;
      }));
      el.addEventListener('pointerleave', (() => {
        el.style.transform = '';
      }));
    }));
  }
  let docMax = 0, vh = innerHeight, vw = innerWidth;
  const smooth = {
    on: fine && !reduced,
    active: false,
    target: scrollY,
    cur: scrollY
  };
  const scrollsInside = (el, dy) => {
    for (;el && el !== document.body; el = el.parentElement) {
      if (el.scrollHeight > el.clientHeight + 1) {
        const oy = getComputedStyle(el).overflowY;
        if ((oy === 'auto' || oy === 'scroll') && (dy > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 0)) return true;
      }
    }
    return false;
  };
  if (smooth.on) {
    addEventListener('wheel', (e => {
      if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY) || scrollsInside(e.target, e.deltaY)) return;
      e.preventDefault();
      if (!smooth.active) smooth.target = smooth.cur = scrollY;
      smooth.target = clamp(smooth.target + e.deltaY * (e.deltaMode === 1 ? 36 : e.deltaMode === 2 ? vh : 1), 0, docMax);
      smooth.active = true;
    }), {
      passive: false
    });
    const release = () => {
      smooth.active = false;
      smooth.target = smooth.cur = scrollY;
    };
    addEventListener('keydown', release);
    addEventListener('pointerdown', (e => {
      if (e.clientX > root.clientWidth - 2) release();
    }));
    scrollToY = y => {
      if (!smooth.active) smooth.cur = scrollY;
      smooth.target = clamp(y, 0, docMax);
      smooth.active = true;
    };
  }
  $$('a[href^="#"]').forEach((a => a.addEventListener('click', (e => {
    const id = a.getAttribute('href');
    const el = id === '#haut' ? document.body : $(id);
    if (!el) return;
    e.preventDefault();
    scrollToY(id === '#haut' ? 0 : el.getBoundingClientRect().top + scrollY - (id === '#apporter' || id === '#suivre' ? 40 : 0));
  }))));
  const nav = $('.nav'), bar = $('.progress');
  const navLinks = $$('.nav-links a');
  const hero = $('[data-scene="hero"]'), heroCopy = $('.hero-copy'), stage = $('.hero-stage'), links = $$('.hl'), hint = $('.hero-hint');
  const m = {
    sections: [],
    heroH: 0,
    stageDx: 0,
    manTop: 0,
    manH: 0
  };
  let heroScene = false;
  function measure() {
    vh = innerHeight;
    vw = innerWidth;
    heroScene = wideQ.matches && !reduced;
    stage.style.transform = '';
    m.heroH = hero.offsetHeight;
    const r = stage.getBoundingClientRect();
    m.stageDx = vw / 2 - (r.left + r.width / 2);
    m.sections = navLinks.map((a => {
      const s = $(a.getAttribute('href'));
      return s ? s.getBoundingClientRect().top + scrollY : Infinity;
    }));
    if (manif) {
      const mr = manif.getBoundingClientRect();
      m.manTop = mr.top + scrollY;
      m.manH = mr.height;
    }
    docMax = root.scrollHeight - vh;
    duo?.measure();
    lastY = -1;
  }
  let lastY = -1, navY = scrollY, wordsOn = -1, last = performance.now();
  const from = [ [ -70, 70, -14 ], [ 0, 160, 8 ], [ 70, 70, 14 ] ];
  function onScroll(y) {
    bar.style.setProperty('--p', docMax > 0 ? (y / docMax).toFixed(4) : 0);
    if (y > 260 && y > navY + 6) {
      nav.classList.add('is-hidden');
      navY = y;
    } else if (y < navY - 6 || y < 260) {
      nav.classList.remove('is-hidden');
      navY = y;
    }
    let active = -1;
    m.sections.forEach(((t, i) => {
      if (y + vh * .4 >= t) active = i;
    }));
    navLinks.forEach(((a, i) => a.classList.toggle('is-active', i === active)));
    const hp = heroScene ? clamp(y / (m.heroH - vh)) : 1;
    if (heroScene && y < m.heroH) {
      const e = ease(hp);
      heroCopy.style.transform = `translate3d(0, ${-hp * 70}px, 0)`;
      const opCopie = 1 - clamp((hp - .25) * 1.8);
      heroCopy.style.opacity = opCopie;
      heroCopy.style.pointerEvents = opCopie < .4 ? 'none' : '';
      stage.style.transform = `translate3d(${m.stageDx * ease(clamp((hp - .15) / .7))}px, 0, 0) scale(${1 + e * .05})`;
      hint.style.opacity = hp > .85 ? 0 : 1;
    }
    links.forEach(((l, i) => {
      const t = ease(clamp((hp - i * .14) / .45));
      const [x, yy, r] = from[i];
      l.style.transform = `translate(${x * (1 - t)}px, ${yy * (1 - t)}px) rotate(${r * (1 - t)}deg)`;
      l.style.opacity = .35 + .65 * t;
    }));
    if (words.length) {
      const n = Math.round(clamp((y + vh * .85 - m.manTop) / (m.manH + vh * .3)) * words.length);
      if (n !== wordsOn) {
        words.forEach(((w, i) => w.classList.toggle('on', i < n)));
        wordsOn = n;
      }
    }
  }
  function loop(now) {
    const dt = Math.min(64, now - last);
    last = now;
    if (smooth.active) {
      smooth.cur = lerp(smooth.cur, smooth.target, 1 - Math.pow(.9, dt / 16.67));
      if (Math.abs(smooth.target - smooth.cur) < .4) {
        smooth.cur = smooth.target;
        smooth.active = false;
      }
      scrollTo(0, smooth.cur);
    }
    const y = scrollY;
    if (y !== lastY) {
      onScroll(y);
      lastY = y;
    }
    requestAnimationFrame(loop);
  }
  let rt;
  const remeasure = () => {
    clearTimeout(rt);
    rt = setTimeout(measure, 120);
  };
  addEventListener('resize', remeasure);
  new ResizeObserver(remeasure).observe(document.body);
  wideQ.addEventListener('change', (() => location.reload()));
  $('#annee').textContent = YEAR;
  measure();
  requestAnimationFrame(loop);
  Promise.race([ document.fonts?.ready, new Promise((r => setTimeout(r, 700))) ]).then((() => requestAnimationFrame((() => {
    document.body.classList.add('is-loaded');
    measure();
  }))));
})();
