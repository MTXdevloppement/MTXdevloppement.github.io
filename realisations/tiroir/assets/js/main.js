(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
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
  const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const icon = id => `<svg aria-hidden="true"><use href="#${id}"/></svg>`;
  const wait = ms => new Promise((r => setTimeout(r, reduced ? 0 : ms)));
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const startOfDay = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const TODAY = startOfDay(new Date);
  const Y = TODAY.getFullYear();
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const addMonths = (d, n) => {
    const r = new Date(d.getFullYear(), d.getMonth() + n, 1);
    r.setDate(Math.min(d.getDate(), new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate()));
    return r;
  };
  const addYears = (d, n) => addMonths(d, n * 12);
  const T = n => addDays(TODAY, n);
  const daysFrom = d => Math.round((startOfDay(d) - TODAY) / 864e5);
  const DF = o => new Intl.DateTimeFormat('fr-FR', o);
  const premier = s => s.replace(/^1 /, '1er ');
  const fDay = d => premier(DF({
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(d));
  const fDayC = d => premier(DF({
    day: 'numeric',
    month: 'short'
  }).format(d));
  const fLong = d => premier(DF({
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(d));
  const fNum = d => DF({
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(d);
  const fMois = d => DF({
    month: 'long',
    year: 'numeric'
  }).format(d);
  const fJour = d => DF({
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(d);
  const eur2 = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const eur0 = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  });
  const eur = v => (Math.round(v * 100) % 100 === 0 ? eur0 : eur2).format(v).replace(/[  ]/g, ' ');
  const monthsOrYears = days => {
    if (days >= 365) {
      const y = Math.round(days / 365.25);
      return y <= 1 ? '1 an' : `${y} ans`;
    }
    return `${Math.max(2, Math.round(days / 30.44))} mois`;
  };
  const relDays = d => {
    if (d === 0) return 'aujourd’hui';
    if (d === 1) return 'demain';
    if (d === -1) return 'hier';
    if (d >= 2 && d <= 60) return `dans ${d} jours`;
    if (d > 60) return `dans ${monthsOrYears(d)}`;
    if (d <= -2 && d >= -60) return `il y a ${-d} jours`;
    return `il y a ${monthsOrYears(-d)}`;
  };
  const chip = d => {
    if (d === 0) return 'Aujourd’hui';
    if (d === 1) return 'Demain';
    if (d >= 2 && d <= 60) return `${d} jours`;
    if (d > 60) return monthsOrYears(d);
    if (d === -1) return 'Hier';
    return `Retard ${Math.min(-d, 999)} j`;
  };
  const LEADS = {
    0: 'le jour même',
    1: 'la veille',
    7: '1 semaine avant',
    14: '2 semaines avant',
    30: '1 mois avant',
    60: '2 mois avant',
    90: '3 mois avant',
    120: '4 mois avant',
    180: '6 mois avant'
  };
  const leadLabel = n => LEADS[n] || `${n} jours avant`;
  const leadsPhrase = leads => {
    const l = leads.map(leadLabel);
    return l.length > 1 ? `${l.slice(0, -1).join(', ')} et ${l[l.length - 1]}` : l[0];
  };
  const urgency = d => d < 0 ? 'urgence' : d <= 7 ? 'bientot' : d <= 31 ? 'mois' : 'plus';
  const CAT = {
    identity: [ 'Identité', 'c-identite' ],
    health: [ 'Santé', 'c-sante' ],
    housing: [ 'Logement', 'c-logement' ],
    work: [ 'Travail', 'c-travail' ],
    taxes: [ 'Impôts', 'c-impots' ],
    bank: [ 'Banque', 'c-banque' ],
    vehicle: [ 'Véhicule', 'c-vehicule' ],
    purchases: [ 'Achats et garanties', 'c-achats' ],
    contracts: [ 'Contrats', 'c-contrats' ],
    family: [ 'Famille et études', 'c-famille' ],
    other: [ 'Autres', 'c-autres' ]
  };
  const tile = cat => `<i class="tile" style="--k:var(--${CAT[cat][1]})">${icon(CAT[cat][1])}</i>`;
  const WHO = {
    camille: 'Camille Martin',
    julien: 'Julien Martin'
  };
  const who = w => WHO[w] || 'Tout le foyer';
  const KIND = {
    idCard: [ 'Carte d’identité', 'identity', 'Expire le', true ],
    passport: [ 'Passeport', 'identity', 'Expire le', true ],
    drivingLicense: [ 'Permis de conduire', 'identity', 'Expire le', true ],
    familyBook: [ 'Livret de famille', 'identity' ],
    healthCard: [ 'Carte Vitale', 'health', 'Expire le', true ],
    mutualCard: [ 'Carte de mutuelle', 'health', 'Valable jusqu’au' ],
    rentReceipt: [ 'Quittance de loyer', 'housing' ],
    homeInsurance: [ 'Assurance habitation', 'housing', 'Fin du contrat' ],
    energyBill: [ 'Facture d’énergie', 'housing' ],
    payslip: [ 'Bulletin de salaire', 'work' ],
    employmentContract: [ 'Contrat de travail', 'work', 'Fin du contrat' ],
    taxNotice: [ 'Avis d’impôt', 'taxes', 'Expire le', true ],
    bankDetails: [ 'RIB', 'bank', 'Expire le', true ],
    registration: [ 'Carte grise', 'vehicle' ],
    carInsurance: [ 'Assurance auto', 'vehicle', 'Fin du contrat' ],
    roadworthiness: [ 'Contrôle technique', 'vehicle', 'Prochain contrôle avant le' ],
    invoice: [ 'Facture d’achat', 'purchases', 'Fin de garantie' ],
    phoneBill: [ 'Téléphone et internet', 'contracts', 'Fin du contrat' ]
  };
  const moisPasse = n => new Date(Y, TODAY.getMonth() - n + 1, 0);
  const finGarantie = T(30);
  const LIB = [ {
    kind: 'passport',
    t: 'Passeport',
    w: 'camille',
    ref: '18CM•••••',
    full: '18CM04512',
    issue: addYears(T(165), -10),
    key: T(165),
    text: 'Passeport · Nom : MARTIN · Prénom : Camille · Date d’expiration : ' + fNum(T(165))
  }, {
    kind: 'idCard',
    t: 'Carte d’identité',
    w: 'julien',
    ref: 'X4RT8•••••',
    full: 'X4RT8K2M71',
    issue: addYears(T(1500), -10),
    key: T(1500),
    text: 'Carte d’identité · Nom : MARTIN · Prénom : Julien'
  }, {
    kind: 'drivingLicense',
    t: 'Permis de conduire',
    w: 'julien',
    ref: '12AB•••••',
    full: '12AB34567',
    issue: new Date(Y - 9, 3, 2),
    key: new Date(Y + 6, 3, 1),
    text: 'Permis de conduire · Titulaire : Julien Martin · Catégorie B'
  }, {
    kind: 'familyBook',
    t: 'Livret de famille',
    w: null,
    issue: new Date(2019, 5, 15),
    text: 'Livret de famille · Époux : Julien Martin · Épouse : Camille Martin'
  }, ...[ 1, 2, 3 ].map((n => ({
    kind: 'rentReceipt',
    t: `Quittance de loyer — ${fMois(moisPasse(n))}`,
    w: 'camille',
    issuer: 'Cabinet Rive Droite',
    issue: moisPasse(n),
    amount: 780,
    text: `Quittance de loyer · Période : ${fMois(moisPasse(n))} · Locataire : Camille Martin · Loyer 690,00 € · Charges 90,00 € · Total 780,00 €`
  }))), ...[ 1, 2, 3 ].map((n => ({
    kind: 'payslip',
    t: `Bulletin de salaire — ${fMois(moisPasse(n))}`,
    w: 'camille',
    issuer: 'Atelier Brunel',
    issue: moisPasse(n),
    amount: 2184.3,
    text: `Bulletin de paie · ${fMois(moisPasse(n))} · Salariée : Camille Martin · Net à payer 2 184,30 €`
  }))), {
    kind: 'employmentContract',
    t: 'Contrat de travail',
    w: 'camille',
    issuer: 'Atelier Brunel',
    issue: new Date(Y - 5, 8, 1),
    text: 'Contrat de travail à durée indéterminée · Atelier Brunel · Camille Martin, cheffe de projet'
  }, {
    kind: 'taxNotice',
    t: `Avis d’impôt ${Y}`,
    w: null,
    issuer: 'Finances publiques',
    ref: '3•••••••••••5',
    full: '3021 457 812 365',
    issue: new Date(Y, 7, 28),
    text: `Avis d’impôt ${Y} sur les revenus ${Y - 1} · Déclarants : Camille Martin, Julien Martin`
  }, {
    kind: 'bankDetails',
    t: 'RIB',
    w: 'camille',
    issuer: 'Banque du Confluent',
    ref: 'FR76 •••• •••• •••• •••• •••• 189',
    full: 'FR76 1234 5678 9012 3456 7890 189',
    issue: new Date(Y - 2, 1, 10),
    text: 'Relevé d’identité bancaire · Titulaire : Camille Martin · IBAN FR76 •••• •••• •••• •••• •••• 189 · BIC BDCF FR 2L'
  }, {
    kind: 'invoice',
    t: 'Lave-linge 8 kg',
    w: null,
    issuer: 'Maison & Ménager',
    ref: `MM-${Y - 2}-77812`,
    issue: addYears(finGarantie, -2),
    key: finGarantie,
    amount: 449,
    text: 'Facture · Lave-linge 8 kg · Garantie légale de conformité : 2 ans · Total TTC 449,00 €'
  }, {
    kind: 'homeInsurance',
    t: 'Assurance habitation',
    w: null,
    issuer: 'Assurances du Lac',
    ref: 'HAB-55-20981',
    issue: addYears(T(63), -1),
    key: T(62),
    amount: 220.8,
    text: 'Attestation d’assurance habitation · Garanties : responsabilité civile, dégâts des eaux, incendie, vol'
  }, {
    kind: 'carInsurance',
    t: 'Assurance auto',
    w: 'julien',
    issuer: 'Assurances du Lac',
    ref: 'AUTO-58-30417',
    issue: addYears(T(150), -1),
    key: T(149),
    amount: 558,
    text: 'Attestation d’assurance automobile · Conducteur principal : Julien Martin · Citadine AB-123-CD'
  }, {
    kind: 'registration',
    t: 'Carte grise',
    w: 'julien',
    ref: 'AB-123-CD',
    issue: new Date(Y - 4, 4, 20),
    text: 'Certificat d’immatriculation · AB-123-CD · Titulaire : Julien Martin'
  }, {
    kind: 'roadworthiness',
    t: 'Contrôle technique',
    w: 'julien',
    issuer: 'Garage des Pins',
    issue: addYears(T(-4), -2),
    key: T(-4),
    text: 'Procès-verbal de contrôle technique · AB-123-CD · Prochain contrôle avant le ' + fNum(T(-4))
  }, {
    kind: 'mutualCard',
    t: 'Carte de mutuelle',
    w: null,
    issuer: 'Mutuelle Horizon',
    issue: new Date(Y, 0, 1),
    key: new Date(Y, 11, 31),
    text: `Carte de tiers payant · Bénéficiaires : Camille Martin, Julien Martin · Valable jusqu’au 31/12/${Y}`
  }, {
    kind: 'healthCard',
    t: 'Carte Vitale',
    w: 'julien',
    ref: '1 89 ••• ••• ••• 42',
    full: '1 89 07 69 123 456 42',
    issue: new Date(Y - 6, 2, 3),
    text: 'Carte Vitale · Julien Martin'
  }, {
    kind: 'energyBill',
    t: `Facture d’énergie — ${fMois(moisPasse(1))}`,
    w: 'camille',
    issuer: 'Volta Énergie',
    ref: `FA-${moisPasse(1).getFullYear()}-109215`,
    issue: moisPasse(1),
    amount: 91.2,
    text: 'Facture d’énergie · Client : Camille Martin · Total TTC 91,20 €'
  }, {
    kind: 'phoneBill',
    t: 'Box internet',
    w: null,
    issuer: 'Onde Fibre',
    issue: new Date(Y - 1, 2, 4),
    amount: 29.99,
    text: 'Contrat d’abonnement · Box fibre · 29,99 € par mois · sans engagement'
  } ].map(((d, i) => ({
    id: i,
    issuer: '',
    ref: '',
    ...d,
    cat: KIND[d.kind][1]
  })));
  const sbar = () => '<div class="sbar" aria-hidden="true"><span>9:41</span><i class="sb-r"></i></div>';
  const TABS = [ [ 'i-maison', 'Accueil' ], [ 'i-docs', 'Documents' ], [ 'i-calendrier', 'Échéances' ], [ 'i-dossier', 'Dossiers' ], [ 'i-reglages', 'Réglages' ] ];
  const tabbar = on => `<div class="tabbar" aria-hidden="true">${TABS.map((([i, l], k) => `<span class="${k === on ? 'on' : ''}">${icon(i)}${l}</span>`)).join('')}</div>`;
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
    requestAnimationFrame((() => requestAnimationFrame((() => n.classList.add('on')))));
    n._t = setTimeout((() => n.classList.remove('on')), 4200);
  }
  function toast(app, text) {
    let t = $('.toast', app);
    if (!t) {
      t = document.createElement('div');
      t.className = 'toast';
      t.setAttribute('role', 'status');
      app.append(t);
    }
    t.textContent = text;
    clearTimeout(t._t);
    requestAnimationFrame((() => requestAnimationFrame((() => t.classList.add('on')))));
    t._t = setTimeout((() => t.classList.remove('on')), 2400);
  }
  const showPane = (pane, on) => {
    pane.inert = !on;
    pane.setAttribute('aria-hidden', String(!on));
  };
  function radioGroup(group, onPick) {
    const items = () => $$('[role="radio"]', group);
    const sync = () => items().forEach((b => {
      b.tabIndex = b.getAttribute('aria-checked') === 'true' ? 0 : -1;
    }));
    const pick = (b, focus) => {
      items().forEach((x => x.setAttribute('aria-checked', String(x === b))));
      sync();
      if (focus) b.focus();
      onPick?.(b);
    };
    group.addEventListener('click', (e => {
      const b = e.target.closest('[role="radio"]');
      if (b && group.contains(b)) pick(b);
    }));
    group.addEventListener('keydown', (e => {
      const keys = [ 'ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End' ];
      if (!keys.includes(e.key)) return;
      const list = items(), i = list.indexOf(document.activeElement);
      if (i < 0) return;
      e.preventDefault();
      const n = e.key === 'Home' ? 0 : e.key === 'End' ? list.length - 1 : (i + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length;
      pick(list[n], true);
    }));
    sync();
    return {
      pick: pick,
      sync: sync
    };
  }
  const radios = (labels, current) => labels.map((([v, l]) => `<button type="button" role="radio" data-v="${v}" aria-checked="${v === current}">${l}</button>`)).join('');
  const uiTheme = $('#ui-theme');
  $$('[data-ui]', uiTheme).forEach((b => b.setAttribute('aria-checked', String(b.dataset.ui === root.dataset.ui))));
  radioGroup(uiTheme, (b => {
    root.dataset.ui = b.dataset.ui;
  }));
  const hDate = $('#h-date');
  if (hDate) hDate.textContent = fJour(TODAY);
  const SCANS = (() => {
    const issueE = T(-6), dueE = T(9);
    const anniv = T(150), effet = addYears(anniv, -1), finA = T(149), limite = addDays(anniv, -30);
    const achat = T(-2), garantie = addYears(achat, 2);
    return [ {
      id: 'energie',
      label: 'Facture d’énergie',
      type: 'Facture d’énergie',
      k: '#E8893A',
      paper: `<div class="fe-tete"><span class="fe-logo" style="--k:#E8893A">VÉ</span><span><b data-k="emetteur">Volta Énergie</b><small>8 quai des Lumières · 69002 Lyon</small></span></div>\n          <h4 class="fe-titre"><span data-k="type">Facture d’énergie</span></h4>\n          <dl class="fe-meta"><div><dt>Client</dt><dd><span data-k="personne">Camille Martin</span></dd></div><div><dt>Facture n°</dt><dd><span data-k="reference">FA-${Y}-118734</span></dd></div><div><dt>Date de facture</dt><dd><span data-k="emission">${fNum(issueE)}</span></dd></div><div><dt>Période</dt><dd>${DF({
        month: 'short'
      }).format(addMonths(issueE, -1))} – ${DF({
        month: 'short'
      }).format(issueE)}</dd></div></dl>\n          <div class="fe-lignes"><p><span>Abonnement</span><span>14,20 €</span></p><p><span>Consommation · 312 kWh</span><span>63,90 €</span></p><p><span>Taxes et contributions</span><span>8,30 €</span></p></div>\n          <p class="fe-total"><span>Total TTC</span><b data-k="montant">86,40 €</b></p>\n          <p class="fe-pied"><span data-k="echeance">À payer avant le ${fNum(dueE)}</span></p>\n          <div class="fe-bloc"><i></i><i></i><i></i></div>`,
      rows: [ [ 'Titre', `Facture d’énergie — ${fMois(issueE)}`, 'type', 'Type reconnu' ], [ 'Catégorie', 'Logement' ], [ 'Personne', 'Camille Martin', 'personne', 'Personne' ], [ 'Émetteur', 'Volta Énergie', 'emetteur', 'Émetteur' ], [ 'Référence', `FA-${Y}-118734`, 'reference', 'Référence' ], [ 'Émis le', fDay(issueE), 'emission', 'Date d’émission' ], [ 'Expire le', '' ], [ 'Montant', eur(86.4), 'montant', 'Montant' ] ],
      ech: {
        k: 'echeance',
        l: 'Date limite',
        t: 'Paiement : Facture d’énergie',
        s: `${fDay(dueE)} · rappels ${leadsPhrase([ 7, 0 ])}`,
        cat: 'housing'
      },
      cat: 'Logement'
    }, {
      id: 'auto',
      label: 'Assurance auto',
      type: 'Assurance auto',
      k: '#2E93A3',
      paper: `<div class="fe-tete"><span class="fe-logo" style="--k:#2E93A3">AL</span><span><b data-k="emetteur">Assurances du Lac</b><small>3 rue du Port · 74000 Annecy</small></span></div>\n          <h4 class="fe-titre"><span data-k="type">Attestation d’assurance auto</span></h4>\n          <dl class="fe-meta"><div><dt>Assuré</dt><dd><span data-k="personne">Julien Martin</span></dd></div><div><dt>Contrat n°</dt><dd><span data-k="reference">AUTO-58-30417</span></dd></div><div><dt>Date d’effet</dt><dd><span data-k="emission">${fNum(effet)}</span></dd></div><div><dt>Valable jusqu’au</dt><dd><span data-k="fin">${fNum(finA)}</span></dd></div></dl>\n          <div class="fe-lignes"><p><span>Véhicule</span><span>Citadine · AB-123-CD</span></p><p><span>Formule</span><span>Tous risques</span></p><p><span>Conducteur principal</span><span>Julien Martin</span></p></div>\n          <p class="fe-total"><span>Cotisation annuelle</span><b data-k="montant">558,00 €</b></p>\n          <p class="fe-pied"><span data-k="echeance">Reconduction tacite · préavis de résiliation : 1 mois</span></p>\n          <div class="fe-bloc"><i></i><i></i><i></i></div>`,
      rows: [ [ 'Titre', 'Assurance auto — Citadine', 'type', 'Type reconnu' ], [ 'Catégorie', 'Véhicule' ], [ 'Personne', 'Julien Martin', 'personne', 'Personne' ], [ 'Émetteur', 'Assurances du Lac', 'emetteur', 'Émetteur' ], [ 'Référence', 'AUTO-58-30417', 'reference', 'Référence' ], [ 'Émis le', fDay(effet), 'emission', 'Date d’effet' ], [ 'Fin du contrat', fDay(finA), 'fin', 'Fin du contrat' ], [ 'Montant', eur(558), 'montant', 'Montant' ] ],
      ech: {
        k: 'echeance',
        l: 'Préavis',
        t: 'Résilier avant reconduction : Assurance auto',
        s: `${fDay(limite)} · rappels ${leadsPhrase([ 60, 15, 0 ])}`,
        cat: 'vehicle'
      },
      cat: 'Véhicule'
    }, {
      id: 'achat',
      label: 'Facture d’achat',
      type: 'Facture d’achat',
      k: '#C7862A',
      paper: `<div class="fe-tete"><span class="fe-logo" style="--k:#C7862A">M&amp;M</span><span><b data-k="emetteur">Maison &amp; Ménager</b><small>Centre commercial des Saules · Villeurbanne</small></span></div>\n          <h4 class="fe-titre"><span data-k="type">Facture</span></h4>\n          <dl class="fe-meta"><div><dt>Client</dt><dd><span data-k="personne">Camille Martin</span></dd></div><div><dt>Facture n°</dt><dd><span data-k="reference">MM-${Y}-40517</span></dd></div><div><dt>Date d’achat</dt><dd><span data-k="emission">${fNum(achat)}</span></dd></div><div><dt>Magasin</dt><dd>n° 12</dd></div></dl>\n          <div class="fe-lignes"><p><span>Aspirateur balai sans fil</span><span>229,00 €</span></p><p><span>Support mural</span><span>9,00 €</span></p><p><span>Éco-participation</span><span>1,00 €</span></p></div>\n          <p class="fe-total"><span>Total TTC</span><b data-k="montant">239,00 €</b></p>\n          <p class="fe-pied"><span data-k="echeance">Garantie légale de conformité : 2 ans</span></p>\n          <div class="fe-bloc"><i></i><i></i><i></i></div>`,
      rows: [ [ 'Titre', 'Aspirateur balai sans fil', 'type', 'Type reconnu' ], [ 'Catégorie', 'Achats et garanties' ], [ 'Personne', 'Camille Martin', 'personne', 'Personne' ], [ 'Émetteur', 'Maison & Ménager', 'emetteur', 'Émetteur' ], [ 'Référence', `MM-${Y}-40517`, 'reference', 'Référence' ], [ 'Émis le', fDay(achat), 'emission', 'Date d’achat' ], [ 'Fin de garantie', fDay(garantie), null, null, 'calculé' ], [ 'Montant', eur(239), 'montant', 'Montant' ] ],
      ech: {
        k: 'echeance',
        l: 'Garantie légale',
        t: 'Fin de garantie : Aspirateur balai sans fil',
        s: `${fDay(garantie)} · rappels ${leadsPhrase([ 30, 0 ])}`,
        cat: 'purchases'
      },
      cat: 'Achats et garanties'
    } ];
  })();
  (() => {
    const zone = $('.scan'), app = $('#scan-app'), feuille = $('#scan-feuille'), go = $('#scan-go'), etat = $('#scan-etat'), choix = $('#scan-choix');
    if (!app) return;
    app.setAttribute('role', 'group');
    app.setAttribute('aria-label', 'Démonstration : scanner un papier avec Tiroir');
    let doc = SCANS[0], run = 0, busy = false;
    choix.innerHTML = radios(SCANS.map((s => [ s.id, s.label ])), doc.id);
    radioGroup(choix, (b => {
      doc = SCANS.find((s => s.id === b.dataset.v));
      render();
    }));
    function render() {
      run++;
      busy = false;
      zone.classList.remove('is-scanning');
      feuille.innerHTML = doc.paper;
      app.innerHTML = `\n        <div class="pane cam" data-p="cam">${sbar()}\n          <div class="navb"><span class="nb-l">Annuler</span><b>Scanner</b><span></span></div>\n          <div class="cam-vue"><span class="cam-aide">Placez le papier dans le cadre</span><div class="cam-feuille" style="--k:${doc.k}"><i></i><i></i><i></i><i></i><i></i><i></i></div><i class="cam-cadre"></i><i class="cam-flash"></i></div>\n          <div class="cam-bas"><span>Auto</span><button type="button" class="obturateur" aria-label="Scanner ce papier"></button><span>1 page</span></div>\n        </div>\n        <div class="pane is-right" data-p="form">${sbar()}\n          <div class="navb"><button type="button" class="nb-l" data-a="annuler">Annuler</button><b>Nouveau document</b><button type="button" class="nb-r" data-a="enregistrer" disabled>Enregistrer</button></div>\n          <div class="pane-scroll">\n            <div class="sc-type"><span class="sc-thumb" style="--k:${doc.k}"><i></i><i></i><i></i><i></i><i></i></span><span><small>Type reconnu</small><b>${icon('i-etincelles')}${esc(doc.type)}</b><em>1 page · texte lu sur l’iPhone</em></span></div>\n            <p class="u-gh">Informations</p>\n            <div class="u-card">${doc.rows.map((([l, v], i) => `<label class="f-row" data-r="${i}"><span>${esc(l)}</span><input type="text" value="" placeholder="${v ? '' : 'Aucune'}" aria-label="${esc(l)}"><i class="det">${icon('i-etincelles')}${doc.rows[i][4] || 'détecté'}</i></label>`)).join('')}</div>\n            <p class="u-gh">Échéance proposée</p>\n            <div class="u-card"><div class="f-ech">${tile(doc.ech.cat)}<span><b>${esc(doc.ech.t)}</b><small>${esc(doc.ech.s)}</small></span><i class="interr" aria-hidden="true"></i></div></div>\n          </div>\n          <div class="lecture">${icon('i-texte')}Lecture du texte…</div>\n        </div>`;
      showPane($('[data-p="form"]', app), false);
      go.innerHTML = `${icon('i-scan')}Scanner ce papier`;
      go.disabled = false;
      etat.textContent = 'Le texte sera lu sur l’iPhone, sans connexion.';
    }
    async function scan() {
      if (busy) return;
      if (!$('[data-p="cam"]', app) || $('[data-p="cam"]', app).classList.contains('is-under')) render();
      busy = true;
      const id = ++run, alive = () => id === run;
      const cam = $('[data-p="cam"]', app), form = $('[data-p="form"]', app);
      go.disabled = true;
      $('.obturateur', app).disabled = true;
      etat.textContent = 'Scan en cours…';
      zone.classList.add('is-scanning');
      cam.classList.add('is-detect');
      await wait(1100);
      if (!alive()) return;
      cam.classList.add('is-flash');
      await wait(380);
      if (!alive()) return;
      cam.classList.add('is-under');
      form.classList.remove('is-right');
      showPane(cam, false);
      showPane(form, true);
      const lecture = $('.lecture', form);
      lecture.classList.add('on');
      etat.textContent = 'Tiroir lit le texte…';
      await wait(800);
      if (!alive()) return;
      lecture.classList.remove('on');
      zone.classList.remove('is-scanning');
      const rows = $$('.f-row', form);
      for (let i = 0; i < doc.rows.length; i++) {
        const [, v, k, l] = doc.rows[i];
        if (!v) continue;
        const part = k && $(`[data-k="${k}"]`, feuille);
        if (part) {
          part.dataset.l = l;
          part.classList.add('lu');
        }
        const row = rows[i], input = $('input', row);
        input.value = v;
        row.classList.add('is-det', 'is-new');
        await wait(340);
        if (!alive()) return;
      }
      const part = $(`[data-k="${doc.ech.k}"]`, feuille);
      if (part) {
        part.dataset.l = doc.ech.l;
        part.classList.add('lu');
      }
      $('.f-ech', form).classList.add('on');
      $('[data-a="enregistrer"]', form).disabled = false;
      etat.textContent = 'Vérifiez, modifiez si besoin, puis enregistrez.';
      go.innerHTML = `${icon('i-scan')}Scanner à nouveau`;
      go.disabled = false;
      busy = false;
    }
    go.addEventListener('click', (() => {
      if (go.textContent.includes('nouveau')) render();
      scan();
    }));
    app.addEventListener('click', (e => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.classList.contains('obturateur')) scan(); else if (b.dataset.a === 'annuler') {
        render();
        etat.textContent = 'Scan annulé. Rien n’a été enregistré.';
      } else if (b.dataset.a === 'enregistrer') {
        b.disabled = true;
        const scroll = $('[data-p="form"] .pane-scroll', app);
        scroll.insertAdjacentHTML('afterbegin', `<div class="range-ok">${icon('i-check')}Rangé dans ${esc(doc.cat)}</div>`);
        scroll.scrollTop = 0;
        toast(app, 'Document enregistré');
        etat.textContent = `Rangé dans ${doc.cat}. L’échéance et ses rappels sont créés.`;
      }
    }));
    app.addEventListener('input', (e => {
      e.target.closest('.f-row')?.classList.remove('is-det');
    }));
    render();
  })();
  const types = $('.types-l');
  if (types && !reduced) {
    $$('li', types).forEach((li => {
      const c = li.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      types.append(c);
    }));
    types.classList.add('defile');
  }
  const RECUR = {
    monthly: [ 'Chaque mois', d => addMonths(d, 1) ],
    yearly: [ 'Chaque année', d => addYears(d, 1) ],
    everyTwoYears: [ 'Tous les deux ans', d => addYears(d, 2) ]
  };
  (() => {
    const app = $('#ech-app');
    if (!app) return;
    app.setAttribute('role', 'group');
    app.setAttribute('aria-label', 'Démonstration : l’échéancier de Tiroir');
    const base = () => [ {
      t: 'Contrôle technique',
      s: 'Citadine · AB-123-CD',
      cat: 'vehicle',
      d: T(-4),
      rec: 'everyTwoYears'
    }, {
      t: 'Paiement : Taxe foncière',
      s: 'Tout le foyer',
      cat: 'housing',
      d: T(-2),
      rec: 'yearly'
    }, {
      t: 'Résilier avant reconduction : Assurance habitation',
      s: 'Assurances du Lac',
      cat: 'housing',
      d: T(3)
    }, {
      t: 'Rendez-vous en mairie',
      s: 'Passeport · Camille',
      cat: 'identity',
      d: T(5)
    }, {
      t: 'Paiement : Box internet',
      s: 'Onde Fibre',
      cat: 'contracts',
      d: T(12),
      rec: 'monthly'
    }, {
      t: 'Expiration : Ordonnance',
      s: 'Julien',
      cat: 'health',
      d: T(20)
    }, {
      t: 'Fin de garantie : Lave-linge 8 kg',
      s: 'Maison & Ménager',
      cat: 'purchases',
      d: finGarantie
    }, {
      t: 'Renouveler : Passeport',
      s: 'Camille',
      cat: 'identity',
      d: T(165)
    } ].map(((e, i) => ({
      ...e,
      id: i
    })));
    let items = base(), done = 0, nextId = 100, born = -1;
    const GROUPS = [ [ 'urgence', 'En retard' ], [ 'bientot', 'Cette semaine' ], [ 'mois', 'Ce mois-ci' ], [ 'plus', 'Plus tard' ] ];
    function render() {
      const list = [ ...items ].sort(((a, b) => a.d - b.d));
      const html = GROUPS.map((([u, label]) => {
        const g = list.filter((e => urgency(daysFrom(e.d)) === u));
        if (!g.length) return '';
        return `<p class="ech-g ${u}" role="heading" aria-level="4">${label}<em>${g.length}</em></p><div class="u-card">${g.map((e => {
          const n = daysFrom(e.d);
          return `<div class="ech-row${e.id === born ? ' is-born' : ''}" data-id="${e.id}"><button type="button" class="rond" aria-label="C’est fait : ${esc(e.t)}">${icon('i-check')}</button>${tile(e.cat)}<span><b>${esc(e.t)}</b><small>${e.rec ? icon('i-repete') : ''}${esc(e.s)} · ${fDayC(e.d)}</small></span><em class="due ${u === 'plus' ? '' : u}">${chip(n)}</em></div>`;
        })).join('')}</div>`;
      })).join('');
      const ahead = items.length;
      app.innerHTML = `${sbar()}\n        <div class="ech-tete"><h3 class="lt">Échéances</h3><span>${ahead ? `${ahead} à venir` : ''}</span></div>\n        <div class="pane-scroll">${html || `<div class="u-card empty">${icon('i-check')}<b>Rien à faire pour l’instant.</b><br>Tiroir vous préviendra.</div>`}\n          ${done ? `<div class="ech-fin"><span>Terminées · ${done}</span><button type="button" data-a="reset">Tout remettre</button></div>` : ''}\n        </div>${tabbar(2)}`;
      born = -1;
    }
    app.addEventListener('click', (async e => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.a === 'reset') {
        items = base();
        done = 0;
        render();
        $('.rond', app)?.focus();
        return;
      }
      if (!b.classList.contains('rond')) return;
      const row = b.closest('.ech-row'), id = +row.dataset.id, it = items.find((x => x.id === id));
      if (!it || row.classList.contains('is-done')) return;
      row.classList.add('is-done');
      await wait(550);
      row.classList.add('is-gone');
      await wait(450);
      items = items.filter((x => x !== it));
      done++;
      let next = null;
      if (it.rec) {
        next = {
          ...it,
          id: nextId++,
          d: RECUR[it.rec][1](it.d)
        };
        while (daysFrom(next.d) < 0) next.d = RECUR[it.rec][1](next.d);
        items.push(next);
        born = next.id;
      }
      render();
      toast(app, next ? `${RECUR[it.rec][0]} : la suivante, le ${fDay(next.d)}` : 'C’est fait');
      $('.rond', app)?.focus({
        preventScroll: true
      });
    }));
    render();
  })();
  (() => {
    const choix = $('#rap-choix'), frise = $('#rap-frise'), note = $('#rap-note'), heure = $('#rap-heure');
    if (!choix) return;
    const RAP = [ {
      id: 'passeport',
      l: 'Passeport',
      t: 'Renouveler : Passeport',
      leads: [ 180, 60, 7, 0 ],
      n: 'Six mois avant&#8239;: le temps d’obtenir un rendez-vous en mairie, qui demande souvent plusieurs semaines d’attente.'
    }, {
      id: 'contrat',
      l: 'Contrat',
      t: 'Résilier avant reconduction : Assurance auto',
      leads: [ 60, 15, 0 ],
      n: 'Deux mois et quinze jours avant la date limite de résiliation, pour ne pas subir la reconduction.'
    }, {
      id: 'controle',
      l: 'Contrôle technique',
      t: 'Contrôle technique',
      leads: [ 60, 14, 0 ],
      n: 'Deux mois avant, pour prendre rendez-vous au centre de contrôle sans courir.'
    }, {
      id: 'garantie',
      l: 'Garantie',
      t: 'Fin de garantie : Lave-linge 8 kg',
      leads: [ 30, 0 ],
      n: 'Un mois avant la fin de la garantie, pour faire réparer à temps ce qui doit l’être.'
    } ];
    let cur = RAP[0];
    choix.innerHTML = radios(RAP.map((r => [ r.id, r.l ])), cur.id);
    const draw = () => {
      const h = `${heure.value} h 00`;
      frise.innerHTML = `<ol class="frise-l">${cur.leads.map(((n, i) => `<li class="${n === 0 ? 'fin' : ''}" style="--i:${i}"><i>${icon(n === 0 ? 'i-calendrier' : 'i-cloche')}</i><span><b>${cap(leadLabel(n))}</b><small>${h} · «&#8239;${esc(cur.t)}&#8239;» ${n === 0 ? 'aujourd’hui' : relDays(n)}</small></span></li>`)).join('')}</ol>`;
      note.innerHTML = cur.n;
    };
    radioGroup(choix, (b => {
      cur = RAP.find((r => r.id === b.dataset.v));
      draw();
    }));
    heure.addEventListener('change', draw);
    draw();
  })();
  (() => {
    const list = $('#ctr-l'), total = $('#ctr-total'), vue = $('#ctr-vue');
    if (!list) return;
    const CTR = [ {
      t: 'Assurance habitation',
      o: 'Assurances du Lac',
      cat: 'housing',
      cost: 220.8,
      per: 1,
      anniv: T(63),
      notice: 60
    }, {
      t: 'Assurance auto',
      o: 'Assurances du Lac',
      cat: 'vehicle',
      cost: 46.5,
      per: 12,
      anniv: T(150),
      notice: 30
    }, {
      t: 'Box internet',
      o: 'Onde Fibre',
      cat: 'contracts',
      cost: 29.99,
      per: 12
    }, {
      t: 'Forfait mobile',
      o: 'Mobilis',
      cat: 'contracts',
      cost: 9.99,
      per: 12
    } ];
    let mode = 'mois';
    const yearly = c => c.cost * c.per;
    const draw = () => {
      list.innerHTML = CTR.map((c => {
        const lim = c.anniv && addDays(c.anniv, -c.notice);
        const sub = lim ? `<small class="${daysFrom(lim) <= 31 ? 'lim' : ''}">Résilier avant le ${fDayC(lim)}</small>` : `<small>${esc(c.o)} · sans date anniversaire</small>`;
        const v = mode === 'mois' ? yearly(c) / 12 : yearly(c);
        return `<li>${tile(c.cat)}<span><b>${esc(c.t)}</b>${sub}</span><em class="num">${eur(v)}</em></li>`;
      })).join('');
      const sum = CTR.reduce(((a, c) => a + yearly(c)), 0);
      total.textContent = `${eur(mode === 'mois' ? sum / 12 : sum)} ${mode === 'mois' ? 'par mois' : 'par an'}`;
    };
    radioGroup(vue, (b => {
      mode = b.dataset.v;
      draw();
    }));
    draw();
  })();
  const garantie = (() => {
    const achatEl = $('#gar-achat'), txt = $('#gar-txt'), jauge = $('#gar-jauge');
    if (!txt) return null;
    const achat = addYears(finGarantie, -2), n = daysFrom(finGarantie);
    achatEl.textContent = fLong(achat);
    txt.innerHTML = `Garanti jusqu’au ${fLong(finGarantie)}<small>Fin de garantie ${relDays(n)} · rappel 1 mois avant</small>`;
    return () => {
      jauge.style.setProperty('--v', `${clamp(1 - n / ((finGarantie - achat) / 864e5)) * 100}%`);
    };
  })();
  (() => {
    const app = $('#rech-app'), sugg = $('#rech-sugg');
    if (!app) return;
    app.setAttribute('role', 'group');
    app.setAttribute('aria-label', 'Démonstration : rechercher dans les documents');
    const docs = [ ...LIB ].sort(((a, b) => b.issue - a.issue));
    const searchable = d => norm([ d.t, KIND[d.kind][0], CAT[d.cat][0], d.issuer, d.ref, d.text ].join(' '));
    docs.forEach((d => {
      d._s = searchable(d);
    }));
    app.innerHTML = `\n      <div class="pane" data-p="liste">${sbar()}\n        <h3 class="lt">Documents</h3>\n        <label class="search">${icon('i-loupe')}<input type="search" id="rech-q" placeholder="Rechercher dans vos papiers" aria-label="Rechercher dans les documents" autocomplete="off" spellcheck="false"></label>\n        <p class="res-n" id="rech-n" aria-live="polite"></p>\n        <div class="pane-scroll"><div class="u-card" id="rech-l"></div></div>\n        ${tabbar(1)}\n      </div>\n      <div class="pane is-right" data-p="fiche"></div>`;
    const q = $('#rech-q', app), out = $('#rech-l', app), count = $('#rech-n', app), liste = $('[data-p="liste"]', app), fiche = $('[data-p="fiche"]', app);
    showPane(fiche, false);
    const mark = (text, words) => {
      if (!words.length) return esc(text);
      const n = norm(text);
      const spans = [];
      words.forEach((w => {
        let i = n.indexOf(w);
        while (i >= 0) {
          spans.push([ i, i + w.length ]);
          i = n.indexOf(w, i + w.length);
        }
      }));
      if (!spans.length) return esc(text);
      spans.sort(((a, b) => a[0] - b[0]));
      let html = '', at = 0;
      spans.forEach((([a, b]) => {
        if (a < at) return;
        html += esc(text.slice(at, a)) + `<mark>${esc(text.slice(a, b))}</mark>`;
        at = b;
      }));
      return html + esc(text.slice(at));
    };
    const extrait = (text, words) => {
      const n = norm(text), i = Math.min(...words.map((w => {
        const k = n.indexOf(w);
        return k < 0 ? Infinity : k;
      })));
      if (!isFinite(i)) return '';
      const a = Math.max(0, i - 28), b = Math.min(text.length, i + 60);
      return (a > 0 ? '…' : '') + mark(text.slice(a, b), words) + (b < text.length ? '…' : '');
    };
    function draw() {
      const words = norm(q.value).split(/\s+/).filter(Boolean);
      const res = docs.filter((d => words.every((w => d._s.includes(w)))));
      count.textContent = words.length ? res.length ? `${res.length} ${res.length > 1 ? 'documents' : 'document'}` : 'Aucun document' : `${docs.length} documents`;
      out.innerHTML = res.length ? res.map(((d, i) => {
        const ex = words.length ? extrait(d.text, words) : '';
        return `<button type="button" class="doc-row" data-id="${d.id}" style="--i:${Math.min(i, 8)}">${tile(d.cat)}<span><b>${mark(d.t, words)}</b><small>${esc([ d.issuer, who(d.w) ].filter(Boolean).join(' · '))}</small>${ex ? `<small class="extrait">${ex}</small>` : ''}</span>${icon('i-chev-d')}</button>`;
      })).join('') : `<p class="empty">Aucun papier ne contient «&#8239;${esc(q.value.trim())}&#8239;».</p>`;
      $$('button', sugg).forEach((b => b.setAttribute('aria-pressed', String(norm(b.textContent) === norm(q.value.trim())))));
    }
    function open(d) {
      const n = d.key ? daysFrom(d.key) : null;
      const cpt = n === null ? '' : `<span class="fiche-cpt ${n < 0 ? 'urgence' : n <= 183 ? 'bientot' : 'ok'}">${icon('i-horloge')}${esc(KIND[d.kind][2] === 'Expire le' ? n < 0 ? 'Expiré' : `Expire ${relDays(n)}` : `${KIND[d.kind][2]} ${fDay(d.key)}`)}</span>`;
      const rows = [ [ 'Type', KIND[d.kind][0] ], [ 'Personne', who(d.w) ], d.issuer && [ 'Émetteur', d.issuer ], d.issue && [ 'Émis le', fDay(d.issue) ], d.key && [ KIND[d.kind][2] || 'Expire le', fDay(d.key) ], d.amount && [ 'Montant', eur(d.amount) ] ].filter(Boolean);
      const sens = KIND[d.kind][3] && d.full;
      fiche.innerHTML = `${sbar()}\n        <div class="navb"><button type="button" class="nb-l" data-a="retour">${icon('i-chev-g')}Documents</button><b>${esc(d.t)}</b><span class="nb-r" aria-hidden="true">${icon('i-partage')}</span></div>\n        <div class="pane-scroll">\n          <span class="fiche-page" style="--k:var(--${CAT[d.cat][1]})" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></span>\n          ${cpt}\n          <div class="u-card">${rows.map((([l, v]) => `<div class="i-row"><span>${esc(l)}</span><b>${esc(v)}</b></div>`)).join('')}\n            ${d.ref ? `<div class="i-row"><span>Référence</span><b class="mono" data-ref>${esc(d.ref)}</b>${sens ? `<button type="button" class="i-btn" data-a="voir" aria-pressed="false" aria-label="Afficher la référence">${icon('i-oeil')}</button>` : ''}<button type="button" class="i-btn" data-a="copier" aria-label="Copier la référence">${icon('i-copie')}</button></div>` : ''}\n          </div>\n          <p class="u-gh">Texte reconnu</p>\n          <p class="fiche-txt">${mark(d.text, norm(q.value).split(/\s+/).filter(Boolean))}</p>\n        </div>`;
      fiche._doc = d;
      liste.classList.add('is-under');
      fiche.classList.remove('is-right');
      showPane(liste, false);
      showPane(fiche, true);
      $('[data-a="retour"]', fiche).focus({
        preventScroll: true
      });
    }
    function close() {
      liste.classList.remove('is-under');
      fiche.classList.add('is-right');
      showPane(fiche, false);
      showPane(liste, true);
    }
    app.addEventListener('click', (e => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.classList.contains('doc-row')) {
        const id = +b.dataset.id;
        open(docs.find((d => d.id === id)));
        fiche._from = id;
      } else if (b.dataset.a === 'retour') {
        close();
        $(`.doc-row[data-id="${fiche._from}"]`, app)?.focus({
          preventScroll: true
        });
      } else if (b.dataset.a === 'voir') {
        const on = b.getAttribute('aria-pressed') !== 'true', d = fiche._doc;
        b.setAttribute('aria-pressed', String(on));
        b.setAttribute('aria-label', on ? 'Masquer la référence' : 'Afficher la référence');
        $('[data-ref]', fiche).textContent = on ? d.full : d.ref;
      } else if (b.dataset.a === 'copier') toast(app, 'Référence copiée');
    }));
    q.addEventListener('input', draw);
    sugg.innerHTML = [ 'loyer', 'IBAN', 'garantie', 'Julien' ].map((w => `<button type="button" aria-pressed="false">${w}</button>`)).join('');
    sugg.addEventListener('click', (e => {
      const b = e.target.closest('button');
      if (!b) return;
      if (!fiche.classList.contains('is-right')) close();
      q.value = b.getAttribute('aria-pressed') === 'true' ? '' : b.textContent;
      draw();
    }));
    draw();
  })();
  (() => {
    const app = $('#dos-app'), modeles = $('#dos-modeles'), etapes = $$('#dos-etapes li'), pdf = $('#dos-pdf');
    if (!app) return;
    app.setAttribute('role', 'group');
    app.setAttribute('aria-label', 'Démonstration : un dossier qui se remplit tout seul');
    const it = (title, hint, kinds, count = 1, opt = false) => ({
      title: title,
      hint: hint,
      kinds: kinds,
      count: count,
      opt: opt
    });
    const TPL = [ {
      id: 'rental',
      l: 'Location',
      t: 'Dossier de location',
      s: 'Les pièces qu’un propriétaire peut demander.',
      w: 'camille',
      dest: 'Agence Les Tilleuls',
      items: [ it('Pièce d’identité', 'Carte d’identité, passeport ou titre de séjour', [ 'idCard', 'passport', 'residencePermit' ]), it('Justificatif de domicile', 'Les 3 dernières quittances de loyer', [ 'rentReceipt' ], 3), it('Situation professionnelle', 'Contrat de travail ou attestation employeur', [ 'employmentContract', 'employerCertificate' ]), it('Revenus', 'Les 3 derniers bulletins de salaire', [ 'payslip' ], 3), it('Avis d’impôt', 'Le dernier avis d’imposition', [ 'taxNotice' ]), it('RIB', 'Pour le prélèvement du loyer', [ 'bankDetails' ], 1, true) ]
    }, {
      id: 'mortgage',
      l: 'Prêt immobilier',
      t: 'Demande de prêt immobilier',
      s: 'Ce que la banque ou le courtier demande d’habitude.',
      w: null,
      dest: 'Banque du Confluent',
      items: [ it('Pièce d’identité', 'Carte d’identité ou passeport', [ 'idCard', 'passport', 'residencePermit' ]), it('Situation familiale', 'Livret de famille', [ 'familyBook' ], 1, true), it('Justificatif de domicile', 'Quittance ou facture d’énergie récente', [ 'rentReceipt', 'energyBill', 'waterBill' ]), it('Contrat de travail', 'Ou attestation employeur', [ 'employmentContract', 'employerCertificate' ]), it('Bulletins de salaire', 'Les 3 derniers', [ 'payslip' ], 3), it('Avis d’impôt', 'Les 2 derniers', [ 'taxNotice' ], 2), it('Relevés de compte', 'Les 3 derniers mois', [ 'bankStatement' ], 3), it('Prêts en cours', 'Offres ou tableaux d’amortissement', [ 'loan' ], 1, true) ]
    }, {
      id: 'school',
      l: 'Inscription scolaire',
      t: 'Inscription scolaire',
      s: 'École, crèche, cantine, centre de loisirs.',
      w: null,
      dest: '',
      items: [ it('Livret de famille', 'Ou acte de naissance de l’enfant', [ 'familyBook', 'birthCertificate' ]), it('Justificatif de domicile', 'Facture ou quittance de moins de 3 mois', [ 'energyBill', 'waterBill', 'rentReceipt', 'phoneBill' ]), it('Vaccinations', 'Pages vaccins du carnet de santé', [ 'vaccination' ]), it('Pièce d’identité d’un parent', 'Carte d’identité ou passeport', [ 'idCard', 'passport', 'residencePermit' ]), it('Attestation d’assurance', 'Responsabilité civile ou assurance scolaire', [ 'homeInsurance', 'insurancePolicy' ], 1, true), it('Quotient familial', 'Attestation CAF', [ 'familyBenefits' ], 1, true) ]
    }, {
      id: 'travel',
      l: 'Voyage à l’étranger',
      t: 'Voyage à l’étranger',
      s: 'Papiers d’identité, santé et assurances pour partir.',
      w: 'camille',
      dest: '',
      items: [ it('Passeport', 'Souvent valable 6 mois après le retour', [ 'passport' ]), it('Carte d’identité', 'Pour les pays qui l’acceptent', [ 'idCard' ], 1, true), it('Santé', 'Carte Vitale, mutuelle, vaccinations', [ 'healthCard', 'mutualCard', 'vaccination' ], 2, true), it('Assurance voyage', 'Contrat ou attestation', [ 'insurancePolicy' ], 1, true), it('Permis de conduire', 'Pour louer une voiture', [ 'drivingLicense' ], 1, true) ]
    }, {
      id: 'claim',
      l: 'Déclaration de sinistre',
      t: 'Déclaration de sinistre',
      s: 'Contrat, factures et preuves pour l’assureur.',
      w: null,
      dest: 'Assurances du Lac',
      items: [ it('Contrat d’assurance', 'Habitation, auto ou autre', [ 'homeInsurance', 'carInsurance', 'insurancePolicy' ]), it('Factures des biens', 'Pour justifier leur valeur', [ 'invoice', 'warranty' ], 3), it('Photos et constats', 'Photos des dégâts, constat amiable, dépôt de plainte', [ 'other' ], 1, true), it('RIB', 'Pour l’indemnisation', [ 'bankDetails' ]) ]
    }, {
      id: 'vehicle',
      l: 'Démarches véhicule',
      t: 'Démarches véhicule',
      s: 'Vente, assurance, contrôle : les papiers de la voiture.',
      w: null,
      dest: '',
      items: [ it('Carte grise', 'Certificat d’immatriculation', [ 'registration' ]), it('Permis de conduire', 'Du conducteur principal', [ 'drivingLicense' ]), it('Assurance', 'Attestation ou contrat', [ 'carInsurance' ]), it('Contrôle technique', 'Le dernier procès-verbal', [ 'roadworthiness' ]) ]
    } ];
    let tpl = TPL[0], filled = null, exported = false, run = 0;
    const short = d => d.kind === 'rentReceipt' || d.kind === 'payslip' ? `${KIND[d.kind][0].split(' ')[0]} · ${DF({
      month: 'short',
      year: 'numeric'
    }).format(d.issue)}` : d.t;
    const fill = () => tpl.items.map((item => LIB.filter((d => item.kinds.includes(d.kind) && (!tpl.w || !d.w || d.w === tpl.w))).sort(((a, b) => b.issue - a.issue)).slice(0, item.count)));
    const required = () => tpl.items.filter((i => !i.opt));
    const doneCount = () => filled ? tpl.items.filter(((i, k) => !i.opt && filled[k].length >= i.count)).length : 0;
    function steps() {
      etapes.forEach(((li, i) => {
        const ok = i === 0 || i === 1 && filled || i === 2 && exported;
        li.classList.toggle('ok', !!ok);
        li.classList.toggle('on', !ok && (i === 1 ? !filled : !!filled));
      }));
    }
    function render() {
      const req = required().length, n = doneCount(), ready = filled && n === req;
      app.innerHTML = `${sbar()}\n        <div class="navb"><span class="nb-l">${icon('i-chev-g')}Dossiers</span><span></span><span></span></div>\n        <div class="pane-scroll">\n          <h3 class="lt" style="font-size:20px">${esc(tpl.t)}</h3>\n          <div class="dos-tete"><svg class="anneau${ready ? ' pret' : ''}" viewBox="0 0 46 46" aria-hidden="true"><circle class="fd" cx="23" cy="23" r="18"/><circle class="vl" cx="23" cy="23" r="18" style="--v:${req ? n / req : 0}"/></svg><span><b>${ready ? 'Prêt à envoyer' : `${n} sur ${req} pièces`}</b><small>${esc(tpl.w ? `Pour ${who(tpl.w)}` : 'Tout le foyer')}${tpl.dest ? ` · pour ${esc(tpl.dest)}` : ''}</small></span></div>\n          <p class="u-gh">Pièces demandées</p>\n          <div class="u-card">${tpl.items.map(((item, k) => {
        const got = filled ? filled[k] : [];
        const ok = got.length >= item.count, manque = filled && !ok;
        const what = got.length ? `<span class="trouves">${got.map(((d, j) => `<em style="--i:${j + k}">${esc(short(d))}</em>`)).join('')}</span>` : '';
        const miss = manque ? `<span class="manque-l">${got.length ? `Encore ${item.count - got.length} à ajouter` : item.opt ? 'Facultatif · aucun papier trouvé' : 'À ajouter : aucun papier trouvé'}</span>` : '';
        return `<div class="piece${ok && filled ? ' ok' : ''}${manque && !item.opt ? ' manque' : ''}"><i class="etat">${icon('i-check')}</i><span><b>${esc(item.title)}${item.opt ? '<i class="fac">Facultatif</i>' : ''}</b><small>${esc(item.hint)}</small>${what}${miss}</span></div>`;
      })).join('')}</div>\n        </div>\n        <div class="dos-bas">${filled ? `<button type="button" class="dos-btn" data-a="export">${icon('i-pdf')}Exporter en un seul PDF <span class="pm">Tiroir+</span></button>` : `<button type="button" class="dos-btn" data-a="remplir">${icon('i-etincelles')}Remplir automatiquement</button>`}</div>`;
      steps();
    }
    function drawPdf() {
      const docs = filled.flat().filter(((d, i, a) => a.indexOf(d) === i));
      let page = 3;
      const somm = tpl.items.map(((item, k) => {
        const p = filled[k].length ? page : null;
        page += filled[k].length;
        return p ? `<p><span>${esc(item.title)}</span><span>${p}</span></p>` : '';
      })).join('');
      const pages = docs.length + 2;
      const fil = tpl.dest ? `<div class="pdf-fil">${Array.from({
        length: 9
      }, (() => `<span>Copie destinée à ${esc(tpl.dest)} — ${fNum(TODAY)}</span>`)).join('')}</div>` : '';
      pdf.innerHTML = `\n        <div class="pdf-p garde" style="--i:0"><img src="assets/img/tiroir-icone-512.png" alt=""><b>${esc(tpl.t)}</b><small>${esc(tpl.w ? who(tpl.w) : 'Camille et Julien Martin')}</small><small>${fLong(TODAY)}</small>${fil}</div>\n        <div class="pdf-p somm" style="--i:1"><b>Sommaire</b>${somm}${fil}</div>\n        <div class="pdf-p page" style="--i:2"><i></i><i></i><i></i><i></i><i></i><i></i><i></i>${fil}</div>\n        <p class="pdf-info"><b>${esc(tpl.t)} — ${esc(tpl.w ? who(tpl.w) : 'Foyer Martin')}.pdf</b> · ${pages} pages${tpl.dest ? ' · avec filigrane' : ''}</p>`;
      pdf.classList.add('on');
      return pages;
    }
    modeles.innerHTML = radios(TPL.map((t => [ t.id, t.l ])), tpl.id);
    radioGroup(modeles, (b => {
      tpl = TPL.find((t => t.id === b.dataset.v));
      filled = null;
      exported = false;
      run++;
      pdf.classList.remove('on');
      render();
    }));
    app.addEventListener('click', (async e => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.a === 'remplir') {
        const id = ++run;
        b.disabled = true;
        b.innerHTML = `${icon('i-loupe')}Recherche des pièces…`;
        await wait(650);
        if (id !== run) return;
        filled = fill();
        render();
        const req = required().length, n = doneCount();
        toast(app, n === req ? 'Toutes les pièces sont là' : `Il manque ${req - n} ${req - n > 1 ? 'pièces' : 'pièce'}`);
        $('[data-a="export"]', app)?.focus({
          preventScroll: true
        });
      } else if (b.dataset.a === 'export') {
        exported = true;
        const pages = drawPdf();
        steps();
        notify(app, 'PDF prêt à partager', `${tpl.t} · ${pages} pages`);
      }
    }));
    render();
  })();
  (() => {
    const carte = $('#fil-carte'), calque = $('#fil-calque'), on = $('#fil-on'), dest = $('#fil-dest'), leg = $('#fil-legende'), desc = $('#fil-desc');
    if (!carte) return;
    $('#fil-form').addEventListener('submit', (e => e.preventDefault()));
    const draw = () => {
      const txt = `Copie destinée à ${dest.value.trim() || '…'} — ${fNum(TODAY)}`;
      calque.innerHTML = Array.from({
        length: 11
      }, (() => `<p>${esc(`${txt}   ·   ${txt}   ·   ${txt}`)}</p>`)).join('');
      carte.classList.toggle('sans', !on.checked);
      leg.classList.toggle('sans', !on.checked);
      leg.innerHTML = on.checked ? `${icon('i-check')}<span>Partagée en PDF avec «&#8239;${esc(txt)}&#8239;»</span>` : `${icon('i-filigrane')}<span>Sans filigrane, la copie peut resservir ailleurs.</span>`;
      desc.textContent = `Pièce d’identité fictive de Camille Martin, ${on.checked ? `avec le filigrane « ${txt} »` : 'sans filigrane'}.`;
    };
    on.addEventListener('change', draw);
    dest.addEventListener('input', draw);
    draw();
  })();
  (() => {
    const list = $('#gr-l'), go = $('#gr-go'), pied = $('#gr-pied'), bilan = $('#gr-bilan'), jeter = $('#gr-jeter'), toastEl = $('#gr-toast'), toastT = $('#gr-toast-t'), annuler = $('#gr-annuler'), sous = $('#gr-sous');
    if (!list) return;
    const base = () => [ {
      t: `Téléphone et internet — mars ${Y - 2}`,
      cat: 'contracts',
      d: new Date(Y - 2, 2, 12),
      n: 1
    }, {
      t: `Facture d’énergie — janvier ${Y - 6}`,
      cat: 'housing',
      d: new Date(Y - 6, 0, 20),
      n: 5
    }, {
      t: `Bulletin de salaire — mars ${Y - 9}`,
      cat: 'work',
      d: new Date(Y - 9, 2, 31),
      r: 'Jusqu’à la retraite'
    }, {
      t: `Avis d’impôt ${Y - 4}`,
      cat: 'taxes',
      d: new Date(Y - 4, 7, 30),
      n: 3
    }, {
      t: 'Livret de famille',
      cat: 'identity',
      d: new Date(2019, 5, 15),
      r: 'Toute la vie'
    }, {
      t: `Taxe foncière ${Y - 2}`,
      cat: 'housing',
      d: new Date(Y - 2, 8, 1),
      n: 1
    }, {
      t: `Quittance de loyer — juin ${Y - 1}`,
      cat: 'housing',
      d: new Date(Y - 1, 5, 30),
      n: 3
    }, {
      t: `Relevé de compte — février ${Y - 6}`,
      cat: 'bank',
      d: new Date(Y - 6, 1, 28),
      n: 5
    }, {
      t: `Facture d’énergie — septembre ${Y - 1}`,
      cat: 'housing',
      d: new Date(Y - 1, 8, 18),
      n: 5
    } ].map(((p, i) => ({
      ...p,
      id: i,
      rule: p.r || (p.n === 1 ? '1 an' : `${p.n} ans`)
    })));
    let items = base(), ran = false, removed = [];
    const from = p => p.n ? new Date(p.d.getFullYear() + p.n + 1, 0, 1) : null;
    const part = p => {
      const f = from(p);
      return !!f && f <= TODAY;
    };
    function render() {
      sous.textContent = `${items.length} ${items.length > 1 ? 'papiers' : 'papier'} · ${ran ? 'grand rangement fait' : 'pas encore triés'}`;
      list.innerHTML = items.map((p => {
        const can = ran && part(p);
        const verdict = !ran ? `<small>Conservation conseillée : ${esc(p.rule)}</small>` : can ? `<small class="verdict">Peut partir depuis le ${fLong(from(p))}</small>` : `<small class="verdict">À garder ${p.n ? `jusqu’au ${fLong(new Date(from(p).getFullYear() - 1, 11, 31))}` : `: ${p.rule.charAt(0).toLowerCase() + p.rule.slice(1)}`}</small>`;
        const box = can ? `<label class="gr-coche"><input type="checkbox" checked data-id="${p.id}" aria-label="Mettre « ${esc(p.t)} » à la corbeille"><i>${icon('i-check')}</i></label>` : '<span></span>';
        return `<li class="${ran ? can ? 'part' : 'garde' : ''}" data-id="${p.id}">${tile(p.cat)}<span><b>${esc(p.t)}</b>${verdict}</span>${box}</li>`;
      })).join('');
      updateBilan();
    }
    function updateBilan() {
      const n = $$('input:checked', list).length, all = items.filter(part).length;
      pied.hidden = !ran || !all;
      bilan.textContent = `${all} ${all > 1 ? 'papiers peuvent partir' : 'papier peut partir'}${n !== all ? ` · ${n} ${n > 1 ? 'sélectionnés' : 'sélectionné'}` : ''}`;
      jeter.disabled = !n;
      jeter.style.opacity = n ? '' : '.5';
      if (ran && !all && !removed.length) bilan.textContent = '';
    }
    go.addEventListener('click', (() => {
      ran = true;
      toastEl.hidden = true;
      render();
      if (!items.some(part)) {
        sous.textContent = `${items.length} papiers · rien à jeter, votre tiroir est à jour`;
      }
    }));
    list.addEventListener('change', updateBilan);
    jeter.addEventListener('click', (async () => {
      const ids = $$('input:checked', list).map((i => +i.dataset.id));
      if (!ids.length) return;
      ids.forEach((id => $(`li[data-id="${id}"]`, list).classList.add('out')));
      pied.hidden = true;
      await wait(600);
      removed = items.filter((p => ids.includes(p.id)));
      items = items.filter((p => !ids.includes(p.id)));
      render();
      toastT.textContent = `${removed.length} ${removed.length > 1 ? 'papiers' : 'papier'} dans la corbeille, pour 30 jours`;
      toastEl.hidden = false;
      annuler.focus({
        preventScroll: true
      });
    }));
    annuler.addEventListener('click', (() => {
      items = [ ...items, ...removed ].sort(((a, b) => a.id - b.id));
      removed = [];
      toastEl.hidden = true;
      render();
      go.focus({
        preventScroll: true
      });
    }));
    render();
  })();
  const face = $('#face');
  face?.addEventListener('click', (() => {
    if (face.classList.contains('is-ok')) {
      face.classList.remove('is-ok');
      face.setAttribute('aria-pressed', 'false');
      return;
    }
    face.classList.add('is-scan');
    setTimeout((() => {
      face.classList.remove('is-scan');
      face.classList.add('is-ok');
      face.setAttribute('aria-pressed', 'true');
    }), reduced ? 0 : 950);
  }));
  const offres = $('#offres');
  if (offres) radioGroup(offres);
  $$('.split').forEach((h => {
    const label = h.textContent.replace(/\s+/g, ' ').trim();
    h.setAttribute('aria-label', label);
    let i = 0;
    const wrap = node => [ ...node.childNodes ].forEach((n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.append(' ');
            return;
          }
          const w = document.createElement('span');
          w.className = 'w';
          w.setAttribute('aria-hidden', 'true');
          w.innerHTML = `<span style="--wi:${i++}">${esc(part)}</span>`;
          frag.append(w);
        }));
        n.replaceWith(frag);
      } else if (n.nodeType === 1) wrap(n);
    }));
    wrap(h);
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
    if (reduced) words.forEach((w => w.classList.add('on')));
  }
  const io = new IntersectionObserver((entries => entries.forEach((en => {
    if (!en.isIntersecting) return;
    const el = en.target;
    el.classList.add('is-in');
    io.unobserve(el);
    if (el.classList.contains('garantie')) garantie?.();
  }))), {
    threshold: .14,
    rootMargin: '0px 0px -6% 0px'
  });
  $$('[data-reveal], .split, .durees, .garantie').forEach((el => io.observe(el)));
  if (matchMedia('(hover: none)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    addEventListener('pointerdown', (e => {
      if (e.pointerType !== 'touch' || !e.isPrimary) return;
      e.target.dispatchEvent(new PointerEvent('pointermove', {
        bubbles: true,
        clientX: e.clientX,
        clientY: e.clientY,
        pointerId: e.pointerId,
        pointerType: 'touch',
        isPrimary: true
      }));
    }), {
      passive: true
    });
  }
  if (!reduced) {
    $$('.tilt').forEach((el => {
      const zone = el.closest('.stage, .scan-phone, .hero-stage, .dossier') || el;
      const max = 7;
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
    $$('[data-glow]').forEach((el => el.addEventListener('pointermove', (e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--gx', `${e.clientX - r.left}px`);
      el.style.setProperty('--gy', `${e.clientY - r.top}px`);
    }))));
    $$('.magnet').forEach((el => {
      el.addEventListener('pointermove', (e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px, ${(e.clientY - r.top - r.height / 2) * .3}px)`;
      }));
      el.addEventListener('pointerleave', (() => {
        el.style.transform = '';
      }));
    }));
  }
  const nav = $('.nav'), bar = $('.progress');
  const navLinks = $$('.nav-links a');
  const heroStage = $('.hero-stage');
  const m = {
    sections: [],
    manTop: 0,
    manH: 0,
    docMax: 0
  };
  let vh = innerHeight;
  function measure() {
    vh = innerHeight;
    m.sections = navLinks.map((a => {
      const s = $(a.getAttribute('href'));
      return s ? s.getBoundingClientRect().top + scrollY : Infinity;
    }));
    if (manif) {
      const r = manif.getBoundingClientRect();
      m.manTop = r.top + scrollY;
      m.manH = r.height;
    }
    m.docMax = root.scrollHeight - vh;
    lastY = -1;
  }
  let lastY = -1, navY = scrollY, wordsOn = -1;
  function onScroll(y) {
    bar.style.setProperty('--p', m.docMax > 0 ? (y / m.docMax).toFixed(4) : 0);
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
    if (!reduced && heroStage && y < vh * 1.4) {
      const p = ease(clamp(y / (vh * .75)));
      heroStage.style.setProperty('--sink', `${(p * 46).toFixed(1)}%`);
      heroStage.style.setProperty('--rise', `${(-p * 64).toFixed(1)}px`);
    }
    if (words.length && !reduced) {
      const n = Math.round(clamp((y + vh * .8 - m.manTop) / (m.manH + vh * .25)) * words.length);
      if (n !== wordsOn) {
        words.forEach(((w, i) => w.classList.toggle('on', i < n)));
        wordsOn = n;
      }
    }
  }
  function loop() {
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
  const tactile = matchMedia('(hover: none) and (pointer: coarse)').matches;
  let largeurVue = innerWidth, hauteurVue = innerHeight;
  addEventListener('resize', (() => {
    if (tactile && innerWidth === largeurVue && Math.abs(innerHeight - hauteurVue) < 160) return;
    largeurVue = innerWidth;
    hauteurVue = innerHeight;
    remeasure();
  }));
  new ResizeObserver(remeasure).observe(document.body);
  $('#annee').textContent = Y;
  measure();
  requestAnimationFrame(loop);
  Promise.race([ document.fonts?.ready, new Promise((r => setTimeout(r, 700))) ]).then((() => requestAnimationFrame((() => {
    document.body.classList.add('is-loaded');
    measure();
    const heroApp = $('.app-accueil');
    if (heroApp) setTimeout((() => notify(heroApp, 'Fin de garantie : Lave-linge 8 kg', `Maison & Ménager · ${relDays(daysFrom(finGarantie))}`)), reduced ? 600 : 2600);
  }))));
})();
