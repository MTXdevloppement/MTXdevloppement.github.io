(() => {
  'use strict';
  const sansBarreSafari = fn => {
    const tactile = matchMedia('(hover: none) and (pointer: coarse)').matches;
    let l = innerWidth, h = innerHeight;
    return e => {
      if (tactile && innerWidth === l && Math.abs(innerHeight - h) < 160) return;
      l = innerWidth;
      h = innerHeight;
      fn(e);
    };
  };
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pointeurFin = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [ ...r.querySelectorAll(s) ];
  const borner = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
  const attendre = ms => new Promise((ok => setTimeout(ok, ms)));
  const echapper = s => String(s).replace(/[&<>"]/g, (c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  }[c])));
  const texte = (el, s) => {
    if (el && el.textContent !== s) el.textContent = s;
  };
  const icone = (id, cls = '') => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;
  function parImage(fn) {
    let dernier = null, id = 0;
    const f = e => {
      dernier = e;
      if (!id) id = requestAnimationFrame((() => {
        id = 0;
        fn(dernier);
      }));
    };
    f.annuler = () => {
      if (id) cancelAnimationFrame(id);
      id = 0;
    };
    return f;
  }
  const apparition = new IntersectionObserver((entrees => {
    for (const e of entrees) {
      if (!e.isIntersecting) continue;
      const el = e.target;
      el.classList.add('is-in');
      const delai = parseFloat(getComputedStyle(el).getPropertyValue('--d')) || 0;
      setTimeout((() => el.classList.add('is-done')), 1150 + delai * 1e3);
      el.dispatchEvent(new Event('apparu'));
      apparition.unobserve(el);
    }
  }), {
    rootMargin: '0px 0px -8% 0px',
    threshold: .12
  });
  $$('[data-reveal]').forEach((el => apparition.observe(el)));
  const portee = new IntersectionObserver((entrees => {
    for (const e of entrees) {
      e.target.classList.toggle('is-paused', !e.isIntersecting);
      e.target.dispatchEvent(new Event(e.isIntersecting ? 'portee:entree' : 'portee:sortie'));
    }
  }), {
    rootMargin: '60px 0px'
  });
  $$('[data-scope]').forEach((el => portee.observe(el)));
  function boucleScope(el, etape, intervalle) {
    let id = 0;
    const lancer = () => {
      if (!id) {
        etape();
        id = setInterval(etape, intervalle);
      }
    };
    const arreter = () => {
      clearInterval(id);
      id = 0;
    };
    el.addEventListener('portee:entree', lancer);
    el.addEventListener('portee:sortie', arreter);
  }
  const CONSOLE = [ {
    lv: 'log',
    m: 'Atelier Lune · page prête en 182 ms',
    s: 'main.js:4'
  }, {
    lv: 'warn',
    m: 'atelier-2.jpg : 612 KB pour 360 px affichés',
    s: 'index.html'
  }, {
    lv: 'error',
    m: 'Failed to load resource: atelier-5.jpg (404)',
    s: 'index.html:58'
  }, {
    lv: 'log',
    m: 'Réservation : 3 créneaux disponibles samedi',
    s: 'main.js:27'
  } ];
  const CONSOLE_PLUS = [ {
    lv: 'log',
    m: 'IntersectionObserver : 4 créations visibles',
    s: 'main.js:41'
  }, {
    lv: 'log',
    m: 'Menu ouvert',
    s: 'main.js:12'
  }, {
    lv: 'log',
    m: 'localStorage « panier » mis à jour',
    s: 'main.js:63'
  }, {
    lv: 'warn',
    m: 'Bouton « Réserver » : zone tactile 38 × 38 px',
    s: 'index.html'
  }, {
    lv: 'log',
    m: 'Formulaire validé, envoi…',
    s: 'main.js:88'
  } ];
  const RESEAU = [ {
    n: 'index.html',
    p: '/',
    t: 'doc',
    s: 200,
    kb: 18
  }, {
    n: 'style.css',
    p: '/assets/css/',
    t: 'css',
    s: 200,
    kb: 24
  }, {
    n: 'main.js',
    p: '/assets/js/',
    t: 'js',
    s: 200,
    kb: 9
  }, {
    n: 'atelier-1.webp',
    p: '/assets/img/',
    t: 'img',
    s: 200,
    kb: 86
  }, {
    n: 'atelier-2.jpg',
    p: '/assets/img/',
    t: 'img',
    s: 200,
    kb: 612
  }, {
    n: 'atelier-5.jpg',
    p: '/assets/img/',
    t: 'img',
    s: 404,
    kb: 0
  } ];
  const IC_RESEAU = {
    doc: 'i-doc',
    css: 'i-file',
    js: 'i-code',
    img: 'i-photo'
  };
  const FILTRES = [ [ 'tout', 'Tout' ], [ 'err', 'Erreurs' ], [ 'doc', 'Doc' ], [ 'css', 'CSS' ], [ 'js', 'JS' ], [ 'img', 'Images' ] ];
  const SOURCES = {
    'index.html': [ '<span class="k">&lt;!doctype</span> html<span class="k">&gt;</span>', '<span class="k">&lt;html</span> <span class="a">lang</span>=<span class="s">"fr"</span><span class="k">&gt;</span>', '<span class="k">&lt;head&gt;</span>', '  <span class="k">&lt;meta</span> charset=<span class="s">"utf-8"</span><span class="k">&gt;</span>', '  <span class="k">&lt;meta</span> name=<span class="s">"viewport"</span> …<span class="k">&gt;</span>', '  <span class="k">&lt;title&gt;</span>Atelier Lune · Céramique<span class="k">&lt;/title&gt;</span>', '  <span class="k">&lt;link</span> rel=<span class="s">"stylesheet"</span> href=<span class="s">"assets/css/style.css"</span><span class="k">&gt;</span>', '<span class="k">&lt;/head&gt;</span>', '<span class="k">&lt;body&gt;</span>', '  <span class="k">&lt;header</span> class=<span class="s">"nav"</span><span class="k">&gt;</span>…<span class="k">&lt;/header&gt;</span>', '  <span class="k">&lt;section</span> class=<span class="s">"hero"</span><span class="k">&gt;</span>', '    <span class="k">&lt;h1&gt;</span>Des pièces tournées à la main.<span class="k">&lt;/h1&gt;</span>', '    <span class="k">&lt;a</span> class=<span class="s">"btn"</span> href=<span class="s">"#ateliers"</span><span class="k">&gt;</span>Réserver<span class="k">&lt;/a&gt;</span>', '  <span class="k">&lt;/section&gt;</span>' ],
    'style.css': [ '<span class="c">/* Atelier Lune — feuille principale */</span>', '<span class="k">:root</span> {', '  --sable: <span class="n">#f6f1ea</span>;', '  --terre: <span class="n">#2a211b</span>;', '}', '<span class="k">.hero h1</span> {', '  font: <span class="n">600</span> clamp(<span class="n">34px</span>, <span class="n">6vw</span>, <span class="n">76px</span>)/<span class="n">1.05</span> serif;', '}', '<span class="k">@container</span> (min-width: <span class="n">700px</span>) {', '  <span class="k">.nav-links</span> { display: flex; }', '}' ],
    'main.js': [ '<span class="c">// Atelier Lune — interactions</span>', '<span class="k">const</span> debut = performance.now();', '<span class="k">addEventListener</span>(<span class="s">\'load\'</span>, () =&gt; {', '  console.log(<span class="s">`page prête en ${…} ms`</span>);', '});', '<span class="k">const</span> panier = JSON.parse(localStorage.panier ?? <span class="s">\'[]\'</span>);', '<span class="k">function</span> reserver(creneau) {', '  <span class="k">return</span> fetch(<span class="s">\'/api/ateliers\'</span>, { method: <span class="s">\'POST\'</span> });', '}' ]
  };
  const AUDIT = {
    avant: {
      score: 86,
      msg: '4 points à revoir avant la livraison',
      secs: [ [ 'SEO & partage', 'i-search', [ [ 'pass', 'Titre (27 caractères)' ], [ 'pass', 'Meta description (118 caractères)' ], [ 'warn', 'Open Graph incomplet', 'Manquant : og:image — l’aperçu WhatsApp/LinkedIn sera pauvre.' ] ] ], [ 'Responsive & mobile', 'i-iphone', [ [ 'pass', 'Meta viewport' ], [ 'pass', 'Aucun débordement horizontal' ], [ 'warn', '1 zone tactile < 44 px', 'Apple recommande 44×44 px minimum pour les boutons.' ] ] ], [ 'Accessibilité', 'i-access', [ [ 'pass', 'Toutes les images ont un attribut alt' ], [ 'pass', 'Boutons nommés' ] ] ], [ 'Images', 'i-photo', [ [ 'warn', '1 image > 400 Ko', 'Pense au WebP/AVIF et à la compression.' ], [ 'fail', '1 image cassée', 'atelier-5.jpg introuvable dans le dossier du site.' ] ] ], [ 'Liens', 'i-link', [ [ 'pass', 'Liens internes valides (12)' ], [ 'pass', 'Ancres (#section) valides' ] ] ], [ 'Performance & erreurs', 'i-speed', [ [ 'fail', '1 ressource en erreur' ], [ 'info', 'Poids de la page : 749 KB' ] ] ] ]
    },
    apres: {
      score: 98,
      msg: 'Prêt à livrer',
      secs: [ [ 'SEO & partage', 'i-search', [ [ 'pass', 'Titre (27 caractères)' ], [ 'pass', 'Meta description (118 caractères)' ], [ 'pass', 'Aperçu de partage (Open Graph) complet' ] ] ], [ 'Responsive & mobile', 'i-iphone', [ [ 'pass', 'Meta viewport' ], [ 'pass', 'Aucun débordement horizontal' ], [ 'pass', 'Zones tactiles confortables' ] ] ], [ 'Accessibilité', 'i-access', [ [ 'pass', 'Toutes les images ont un attribut alt' ], [ 'pass', 'Boutons nommés' ] ] ], [ 'Images', 'i-photo', [ [ 'pass', 'Aucune image > 400 Ko' ], [ 'pass', 'Aucune image cassée' ] ] ], [ 'Liens', 'i-link', [ [ 'pass', 'Liens internes valides (12)' ], [ 'pass', 'Ancres (#section) valides' ] ] ], [ 'Performance & erreurs', 'i-speed', [ [ 'pass', 'Toutes les ressources chargent' ], [ 'info', 'Poids de la page : 214 KB' ] ] ] ]
    }
  };
  const STATUT = {
    pass: 's-pass',
    warn: 's-warn',
    fail: 's-fail',
    info: 's-info'
  };
  const TITRES = {
    console: 'Console',
    elements: 'Éléments',
    reseau: 'Réseau',
    source: 'Source',
    audit: 'Audit',
    stockage: 'Stockage'
  };
  const tplSite = $('#tpl-site');
  const nouveauSite = () => tplSite.content.firstElementChild.cloneNode(true);
  const ligneConsole = (l, neuf) => {
    const ic = l.lv === 'warn' ? 's-warn' : l.lv === 'error' ? 's-fail' : l.lv === 'input' ? 'i-chev-r' : l.lv === 'result' ? 'i-arrow' : 'i-terminal';
    return `<div class="cs-row ${l.lv}${neuf ? ' is-new' : ''}">${icone(ic)}<p>${echapper(l.m)}</p>${l.s ? `<small>${echapper(l.s)}</small>` : ''}</div>`;
  };
  function paneAudit(cle) {
    const a = AUDIT[cle];
    const nb = st => a.secs.reduce(((n, [, , l]) => n + l.filter((x => x[0] === st)).length), 0);
    return `<div class="au-score"><div class="au-ring" style="--p:${a.score}"><svg viewBox="0 0 110 110"><circle cx="55" cy="55" r="46"/><circle class="v" cx="55" cy="55" r="46"/></svg><b>${a.score}</b></div>` + `<div><b>Score qualité</b><small>${nb('pass')} réussis · ${nb('warn')} à revoir · ${nb('fail')} en échec</small></div></div>` + a.secs.map((([t, ic, l]) => `<div class="au-sec"><h5>${icone(ic)}${t}<em>${l.length}</em></h5>${l.map((([st, ti, d]) => `<div class="au-row">${icone(STATUT[st], 'st-' + st)}<div><span>${echapper(ti)}</span>${d ? `<small>${echapper(d)}</small>` : ''}</div></div>`)).join('')}</div>`)).join('');
  }
  function decrire(v, prof = 0) {
    if (v === undefined) return 'undefined';
    if (v === null) return 'null';
    if (typeof v === 'string') return `"${v}"`;
    if (typeof v === 'function') return `ƒ ${v.name || ''}()`;
    if (typeof v !== 'object') return String(v);
    if (v instanceof Element) return `<${v.tagName.toLowerCase()}${v.id ? '#' + v.id : ''}${v.classList.length ? '.' + [ ...v.classList ].join('.') : ''}>`;
    if (v instanceof NodeList || v instanceof HTMLCollection) return `NodeList(${v.length})`;
    if (Array.isArray(v)) return prof > 1 ? `Array(${v.length})` : `[${v.slice(0, 12).map((x => decrire(x, prof + 1))).join(', ')}${v.length > 12 ? ', …' : ''}]`;
    try {
      const j = JSON.stringify(v);
      return j.length > 220 ? j.slice(0, 220) + '…' : j;
    } catch {
      return Object.prototype.toString.call(v);
    }
  }
  function evaluer(code) {
    const ev = eval;
    try {
      let r;
      try {
        r = ev(`(${code})`);
      } catch (e) {
        if (e instanceof SyntaxError) r = ev(code); else throw e;
      }
      return {
        lv: 'result',
        m: decrire(r)
      };
    } catch (e) {
      return {
        lv: 'error',
        m: `${e.name}: ${e.message}`
      };
    }
  }
  const tplBrowser = $('#tpl-browser');
  function construireNavigateur(racine, interactif) {
    racine.append(tplBrowser.content.cloneNode(true));
    const page = $('[data-page]', racine);
    const site = nouveauSite();
    page.append(site);
    const corps = $('[data-sheet-body]', racine);
    const titre = $('[data-sheet-title]', racine);
    const onglets = $$('[data-sheet-tabs] button', racine);
    const st = {
      tab: 'console',
      logs: CONSOLE.slice(),
      filtre: 'tout',
      fichier: 'index.html',
      choisi: null,
      viseur: false,
      audit: 'avant'
    };
    let hl = null;
    if (interactif) {
      hl = document.createElement('div');
      hl.className = 'hl';
      hl.innerHTML = '<b></b>';
      page.append(hl);
    } else racine.querySelectorAll('button').forEach((b => {
      b.tabIndex = -1;
    }));
    const noeuds = $$('[data-n]', site);
    const niveau = el => {
      let n = 0, p = el.parentElement;
      while (p && p !== site.parentElement) {
        if (p.hasAttribute('data-n')) n += 1;
        p = p.parentElement;
      }
      return n;
    };
    const balise = el => {
      const cls = el.getAttribute('class');
      const feuille = [ 'H1', 'P', 'A', 'B' ].includes(el.tagName);
      const tx = feuille ? `<span class="tx">${echapper(el.textContent.trim().slice(0, 26))}${el.textContent.trim().length > 26 ? '…' : ''}</span>` : '…';
      return `<span class="t">&lt;${el.tagName.toLowerCase()}</span>${cls ? ` <span class="a">class</span>=<span class="v">"${echapper(cls)}"</span>` : ''}<span class="t">&gt;</span>${tx}`;
    };
    function surligner(el) {
      st.choisi = el;
      if (!hl) return;
      if (!el) {
        hl.classList.remove('on');
        return;
      }
      const r = el.getBoundingClientRect(), p = page.getBoundingClientRect(), k = p.width / 393;
      const x = (r.left - p.left) / k, y = (r.top - p.top) / k, w = r.width / k, h = r.height / k;
      Object.assign(hl.style, {
        left: `${x}px`,
        top: `${y}px`,
        width: `${w}px`,
        height: `${h}px`
      });
      hl.classList.toggle('below', y < 30);
      hl.firstChild.textContent = `${el.tagName.toLowerCase()}${el.classList.length ? '.' + el.classList[0] : ''}  ${Math.round(w)} × ${Math.round(h)}`;
      hl.classList.add('on');
    }
    const panneaux = {
      console() {
        return `<div class="cs"><div class="cs-rows" data-rows>${st.logs.map((l => ligneConsole(l))).join('')}</div>` + (interactif ? `<div class="cs-in-wrap"><div class="cs-sugg">${[ 'document.title', 'innerWidth', 'navigator.language', '2 ** 10', "document.querySelectorAll('section').length" ].map((s => `<button type="button" data-sugg="${echapper(s)}">${echapper(s)}</button>`)).join('')}</div>` + `<form class="cs-in" data-cs-form><b>›</b><input type="text" placeholder="Exécuter du JavaScript…" aria-label="Expression JavaScript" autocomplete="off" autocapitalize="off" spellcheck="false"></form></div>` : '') + '</div>';
      },
      elements() {
        return `<div class="el-tools"><button type="button" class="el-pick${st.viseur ? ' on' : ''}" data-pick>${icone('i-viewfinder')}Sélectionner</button><span>Touchez un nœud ou un élément de la page</span></div>` + noeuds.map(((el, i) => `<button type="button" class="el-row${st.choisi === el ? ' on' : ''}" data-node="${i}" style="--lv:${niveau(el)}">${balise(el)}</button>`)).join('') + `<div class="el-det" data-det>${st.choisi ? detail(st.choisi) : 'Aucun élément sélectionné.'}</div>`;
      },
      reseau() {
        const n = f => RESEAU.filter((r => f === 'tout' || (f === 'err' ? r.s >= 400 : r.t === f))).length;
        const liste = RESEAU.filter((r => st.filtre === 'tout' || (st.filtre === 'err' ? r.s >= 400 : r.t === st.filtre)));
        const total = RESEAU.reduce(((a, r) => a + r.kb), 0);
        return `<div class="nw-filters">${FILTRES.map((([k, l]) => `<button type="button" data-filtre="${k}" class="${st.filtre === k ? 'on' : ''}">${l}${k !== 'tout' && n(k) ? `<em>${n(k)}</em>` : ''}</button>`)).join('')}</div>` + `<div class="nw-sum"><span>⇅ ${RESEAU.length} requêtes</span><span>${total} KB</span></div>` + liste.map((r => `<div class="nw-row${r.s >= 400 ? ' err' : ''}">${icone(IC_RESEAU[r.t])}<div><b>${r.n}</b><small>${r.p}</small></div><span><b>${r.s}</b>${r.kb} KB</span></div>`)).join('');
      },
      source() {
        return `<div class="src-files">${Object.keys(SOURCES).map((f => `<button type="button" data-fichier="${f}" class="${st.fichier === f ? 'on' : ''}">${f}</button>`)).join('')}</div>` + `<div class="src-code">${SOURCES[st.fichier].map((l => `<span>${l}</span>`)).join('')}</div>`;
      },
      audit() {
        return paneAudit(st.audit);
      },
      stockage() {
        return '<p class="sto-h">localStorage · 3 clés</p><div class="sto"><div><b>panier</b><span>[{"id":"bol-lune","qte":1}]</span></div><div><b>theme</b><span>"clair"</span></div><div><b>bandeau-vu</b><span>true</span></div></div>' + '<p class="sto-h">Cookies</p><div class="sto"><div><b>Aucun cookie</b><span>—</span></div></div>' + '<p class="sto-note">Espace isolé pour ce site : mtxsite://s7f3a2c1. Les autres sites de la bibliothèque ne le voient pas.</p>';
      }
    };
    function detail(el) {
      const cs = getComputedStyle(el), p = page.getBoundingClientRect(), k = p.width / 393, r = el.getBoundingClientRect();
      return `<b>${el.tagName.toLowerCase()}${el.classList.length ? '.' + [ ...el.classList ].join('.') : ''}</b><br>${Math.round(r.width / k)} × ${Math.round(r.height / k)} px<br>font-size: ${cs.fontSize} · font-weight: ${cs.fontWeight}<br>color: ${cs.color}<br>display: ${cs.display}`;
    }
    function montrer(tab, depuis) {
      st.tab = tab;
      onglets.forEach((b => b.classList.toggle('on', b.dataset.tab === tab)));
      texte(titre, TITRES[tab]);
      corps.innerHTML = `<div class="sh-pane">${panneaux[tab]()}</div>`;
      corps.scrollTop = 0;
      if (tab !== 'elements') {
        st.viseur = false;
        racine.classList.remove('picking');
        surligner(null);
      } else if (st.choisi) surligner(st.choisi);
      const actif = $('[data-sheet-tabs] .on', racine);
      if (actif && depuis !== 'auto') actif.scrollIntoView({
        block: 'nearest',
        inline: 'center',
        behavior: reduit ? 'auto' : 'smooth'
      });
      racine.dispatchEvent(new CustomEvent('onglet', {
        detail: tab
      }));
    }
    function journal(l) {
      st.logs.push(l);
      if (st.logs.length > 40) st.logs.shift();
      if (st.tab !== 'console') return;
      const rows = $('[data-rows]', corps);
      if (!rows) return;
      rows.insertAdjacentHTML('beforeend', ligneConsole(l, true));
      while (rows.children.length > st.logs.length) rows.firstElementChild.remove();
      corps.scrollTop = corps.scrollHeight;
    }
    montrer('console', 'auto');
    racine.addEventListener('click', (e => {
      const t = e.target;
      const onglet = t.closest('[data-sheet-tabs] button');
      if (onglet) {
        montrer(onglet.dataset.tab);
        return;
      }
      if (!interactif) return;
      const b = t.closest('[data-filtre],[data-fichier],[data-node],[data-pick],[data-sugg]');
      if (b) {
        if (b.dataset.filtre) {
          st.filtre = b.dataset.filtre;
          montrer('reseau');
        } else if (b.dataset.fichier) {
          st.fichier = b.dataset.fichier;
          montrer('source');
        } else if (b.dataset.node) {
          surligner(noeuds[Number(b.dataset.node)]);
          montrer('elements');
        } else if (b.hasAttribute('data-pick')) {
          st.viseur = !st.viseur;
          racine.classList.toggle('picking', st.viseur);
          montrer('elements');
        } else if (b.dataset.sugg) {
          const champ = $('[data-cs-form] input', corps);
          champ.value = b.dataset.sugg;
          champ.focus();
        }
        return;
      }
      if (st.viseur && t.closest('[data-page]')) {
        const el = t.closest('[data-n]');
        if (el) {
          e.preventDefault();
          surligner(el);
          st.viseur = false;
          racine.classList.remove('picking');
          montrer('elements');
        }
      }
    }));
    if (interactif) {
      racine.addEventListener('submit', (e => {
        const f = e.target.closest('[data-cs-form]');
        if (!f) return;
        e.preventDefault();
        const champ = $('input', f);
        const code = champ.value.trim();
        if (!code) return;
        journal({
          lv: 'input',
          m: code
        });
        journal(evaluer(code));
        champ.value = '';
        champ.focus();
      }));
      racine.addEventListener('pointerover', (e => {
        const r = e.target.closest('[data-node]');
        if (r) surligner(noeuds[Number(r.dataset.node)]);
      }));
    }
    return {
      montrer: montrer,
      journal: journal,
      st: st
    };
  }
  const brAuto = $('[data-browser="auto"]');
  if (brAuto) {
    const nav = construireNavigateur(brAuto, false);
    let i = 0;
    if (!reduit) boucleScope(brAuto.closest('[data-scope]'), (() => {
      if (i > 0 && i % 7 === 0) {
        nav.st.logs = CONSOLE.slice();
        nav.montrer('console', 'auto');
        brAuto.classList.remove('reload');
        void brAuto.offsetWidth;
        brAuto.classList.add('reload');
      } else nav.journal(CONSOLE_PLUS[i % CONSOLE_PLUS.length]);
      i += 1;
    }), 2300);
  }
  const brDemo = $('[data-browser="interactive"]');
  const outils = $('[data-tools]');
  if (brDemo) {
    const demo = construireNavigateur(brDemo, true);
    const boutons = outils ? $$('button', outils) : [];
    brDemo.addEventListener('onglet', (e => boutons.forEach((b => b.setAttribute('aria-selected', String(b.dataset.tab === e.detail))))));
    boutons.forEach((b => b.addEventListener('click', (() => demo.montrer(b.dataset.tab, 'auto')))));
    if (outils) outils.addEventListener('keydown', (e => {
      if (![ 'ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight' ].includes(e.key)) return;
      e.preventDefault();
      const i = boutons.indexOf(document.activeElement);
      const n = boutons[(i + (e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : boutons.length - 1)) % boutons.length];
      n.focus();
      n.click();
    }));
  }
  const lib = $('[data-lib]');
  if (lib) {
    const carte = (nom, lieu, ic, th, large) => `<div class="lib-card${large ? ' lib-wide' : ''}"><div class="th" style="${th.style || ''}">${th.html}</div><b>${nom}</b><small>${icone(ic)}${lieu}</small></div>`;
    lib.innerHTML = `<div class="lib"><div class="lib-tools">${icone('i-question')}${icone('i-plus')}</div><h3 class="lt">MTX Viewer</h3>\n      <h4>Récents</h4><div class="lib-grid">${carte('Atelier Lune', 'iCloud Drive › Sites', 'i-folder', {
      html: '<div class="ms-mini" data-mini></div>'
    }, true)}</div>\n      <h4>Sur cet iPhone</h4><div class="lib-grid">\n        ${carte('Foulée', 'Sur mon iPhone › MTX Viewer', 'i-iphone', {
      style: '--a:#ff6a3d;--b:#120806',
      html: '<small>Foulée</small><b>Chaque foulée <em>compte.</em></b>'
    })}\n        ${carte('Memora', 'Sur mon iPhone › MTX Viewer', 'i-iphone', {
      style: '--a:#34d399;--b:#04120c',
      html: '<small>Memora</small><b>Vos lieux ont une <em>mémoire.</em></b>'
    })}\n      </div></div>\n      <div class="sb"><span class="sb-time">9:41</span><svg class="sb-ic"><use href="#sb"/></svg></div><div class="island"></div><div class="home-ind"></div>`;
    $('[data-mini]', lib).append(nouveauSite());
  }
  const ecranAudit = $('[data-audit-screen]');
  if (ecranAudit) {
    ecranAudit.innerHTML = `<div class="aud"><div class="aud-nav"><span>Fermer</span><b>Audit</b>${icone('i-reload')}</div><div class="sh-body">${paneAudit('avant')}</div></div>\n      <div class="sb"><span class="sb-time">9:41</span><svg class="sb-ic"><use href="#sb"/></svg></div><div class="island"></div><div class="home-ind"></div>`;
  }
  const champUrl = $('[data-typing-url]');
  if (champUrl) {
    const adresse = 'http://192.168.1.20:5500';
    let enCours = false;
    const scene = async () => {
      if (enCours) return;
      enCours = true;
      champUrl.textContent = '';
      await attendre(400);
      for (const c of adresse) {
        champUrl.textContent += c;
        await attendre(55);
      }
      enCours = false;
    };
    if (reduit) champUrl.textContent = adresse; else boucleScope(champUrl.closest('[data-scope]'), scene, 4200);
  }
  const vpStage = $('[data-vp-stage]');
  const vpPage = $('[data-vp-page]');
  const vpW = $('[data-vp-w]');
  const tailles = $('[data-sizes]');
  let largeur = 393;
  function majVp() {
    if (!vpStage) return;
    const sw = vpStage.clientWidth - 24, sh = vpStage.clientHeight;
    const k = Math.min(1, sw / largeur);
    vpPage.style.width = `${largeur}px`;
    vpPage.style.height = `${Math.ceil(sh / k)}px`;
    vpPage.style.transform = `translateX(-50%) scale(${k.toFixed(4)})`;
    texte(vpW, `${largeur} px${k < 1 ? ` · ${Math.round(k * 100)} %` : ''}`);
  }
  if (vpPage) {
    vpPage.append(nouveauSite());
    tailles.addEventListener('click', (e => {
      const b = e.target.closest('[data-w]');
      if (!b) return;
      largeur = Number(b.dataset.w);
      $$('[data-w]', tailles).forEach((x => x.setAttribute('aria-checked', String(x === b))));
      majVp();
    }));
    majVp();
  }
  const rapport = $('[data-report]');
  const anneau = $('[data-ring]');
  const score = $('[data-score]');
  const scoreMsg = $('[data-score-msg]');
  const relancer = $('[data-rerun]');
  let version = 'avant', lancement = 0;
  async function lancerAudit() {
    if (!rapport) return;
    const id = ++lancement;
    const a = AUDIT[version];
    rapport.innerHTML = '';
    anneau.style.setProperty('--p', 0);
    texte(score, '0');
    texte(scoreMsg, 'Analyse de la page…');
    const lignes = a.secs.flatMap((([t, , l]) => l.map((x => [ t, ...x ]))));
    for (const [sec, st, ti, d] of lignes) {
      if (id !== lancement) return;
      rapport.insertAdjacentHTML('beforeend', `<li>${icone(STATUT[st], 'st-' + st)}<div><b>${echapper(ti)}</b><small>${echapper(d || sec)}</small></div></li>`);
      rapport.scrollTop = rapport.scrollHeight;
      if (!reduit) await attendre(140);
    }
    if (id !== lancement) return;
    anneau.style.setProperty('--rc', a.score >= 90 ? '#4ade80' : '#fbbf24');
    anneau.style.setProperty('--p', a.score);
    texte(scoreMsg, a.msg);
    rapport.scrollTo({
      top: 0,
      behavior: reduit ? 'auto' : 'smooth'
    });
    const t0 = performance.now();
    const compter = t => {
      if (id !== lancement) return;
      const p = reduit ? 1 : borner((t - t0) / 1400);
      texte(score, String(Math.round(a.score * (1 - Math.pow(1 - p, 3)))));
      if (p < 1) requestAnimationFrame(compter);
    };
    requestAnimationFrame(compter);
    if (relancer) relancer.lastChild.textContent = version === 'avant' ? 'Corriger et relancer' : 'Revoir l’original';
  }
  if (rapport) {
    const rep = rapport.closest('.report');
    let lance = false;
    new IntersectionObserver((([e], io) => {
      if (e.isIntersecting && !lance) {
        lance = true;
        lancerAudit();
        io.disconnect();
      }
    }), {
      threshold: .3
    }).observe(rep);
    relancer.addEventListener('click', (() => {
      version = version === 'avant' ? 'apres' : 'avant';
      lancerAudit();
    }));
  }
  const manifeste = $('[data-words]');
  let mots = [];
  if (manifeste) {
    const fragment = document.createDocumentFragment();
    manifeste.childNodes.forEach((noeud => {
      const accent = noeud.nodeType === 1 && noeud.classList.contains('g');
      noeud.textContent.split(/(\s+)/).forEach((morceau => {
        if (!morceau) return;
        if (/^\s+$/.test(morceau)) {
          fragment.append(morceau);
          return;
        }
        const s = document.createElement('span');
        s.className = accent ? 'm g' : 'm';
        s.textContent = morceau;
        fragment.append(s);
      }));
    }));
    manifeste.textContent = '';
    manifeste.append(fragment);
    mots = $$('.m', manifeste);
  }
  const hero = $('.hero');
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
  if (!reduit) {
    const tiltsAccueil = $$('.tilt', hero);
    const incliner = (els, ry, rx) => els.forEach((t => {
      t.style.setProperty('--ry', ry);
      t.style.setProperty('--rx', rx);
    }));
    const suivreAccueil = parImage((e => {
      const nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
      incliner(tiltsAccueil, `${(nx * 10).toFixed(2)}deg`, `${(-ny * 7).toFixed(2)}deg`);
    }));
    hero.addEventListener('pointermove', suivreAccueil);
    hero.addEventListener('pointerleave', (() => {
      suivreAccueil.annuler();
      incliner(tiltsAccueil, '0deg', '0deg');
    }));
    $$('.tile').forEach((t => {
      const suivre = parImage((e => {
        const r = t.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        t.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
        t.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
        t.style.setProperty('--try', `${((x - .5) * 5).toFixed(2)}deg`);
        t.style.setProperty('--trx', `${(-(y - .5) * 5).toFixed(2)}deg`);
      }));
      t.addEventListener('pointermove', suivre);
      t.addEventListener('pointerleave', (() => {
        suivre.annuler();
        t.style.setProperty('--try', '0deg');
        t.style.setProperty('--trx', '0deg');
      }));
    }));
    $$('.magnet').forEach((b => {
      const label = b.firstElementChild;
      const suivre = parImage((e => {
        const r = b.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        b.style.transform = `translate(${(dx * .18).toFixed(1)}px, ${(dy * .28).toFixed(1)}px)`;
        if (label) label.style.transform = `translate(${(dx * .1).toFixed(1)}px, ${(dy * .14).toFixed(1)}px)`;
        b.style.setProperty('--mx', `${e.clientX - r.left}px`);
        b.style.setProperty('--my', `${e.clientY - r.top}px`);
      }));
      b.addEventListener('pointermove', suivre);
      b.addEventListener('pointerleave', (() => {
        suivre.annuler();
        b.style.transform = '';
        if (label) label.style.transform = '';
      }));
    }));
  }
  $$('.faq-list details').forEach((d => {
    const resume = $('summary', d);
    const corps = $('.faq-a', d);
    resume.addEventListener('click', (e => {
      if (reduit) return;
      e.preventDefault();
      if (d.open) {
        const a = corps.animate([ {
          height: `${corps.offsetHeight}px`,
          opacity: 1
        }, {
          height: '0px',
          opacity: 0
        } ], {
          duration: 380,
          easing: 'cubic-bezier(.65,0,.35,1)'
        });
        a.onfinish = () => {
          d.open = false;
        };
      } else {
        d.open = true;
        const h = corps.offsetHeight;
        corps.animate([ {
          height: '0px',
          opacity: 0
        }, {
          height: `${h}px`,
          opacity: 1
        } ], {
          duration: 480,
          easing: 'cubic-bezier(.22,.8,.24,1)'
        });
      }
    }));
  }));
  const nav = $('.nav');
  const barreLecture = $('.progress i');
  const parallaxe = $$('[data-par]').map((el => ({
    el: el,
    k: Number(el.dataset.par)
  })));
  const liens = $$('.nav-links a');
  const cibles = liens.map((a => $(a.getAttribute('href'))));
  const geo = {
    hautPage: 0,
    hero: null,
    mani: null,
    cibles: []
  };
  const boite = el => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      top: r.top + scrollY,
      h: r.height
    };
  };
  const etat = {
    scrolled: null,
    lecture: '',
    courant: null,
    pAccueil: -1,
    mots: -1
  };
  function mesurer() {
    geo.hautPage = document.documentElement.scrollHeight;
    geo.hero = boite(hero);
    geo.mani = boite(manifeste);
    geo.cibles = cibles.map((c => c ? boite(c).top : null));
    etat.pAccueil = -1;
  }
  function majAccueil(y, vh) {
    if (!geo.hero || reduit) return;
    const top = geo.hero.top - y;
    if (top + geo.hero.h < 0) return;
    const p = borner(-top / vh);
    if (p === etat.pAccueil) return;
    etat.pAccueil = p;
    parallaxe.forEach((({el: el, k: k}) => {
      el.style.transform = k ? `translate3d(${k * p * 90}px, ${-p * 40}px, 0)` : `translate3d(0, ${-p * 90}px, 0) scale(${1 - p * .04})`;
    }));
  }
  function majManifeste(y, vh) {
    if (!manifeste || !geo.mani) return;
    const top = geo.mani.top - y;
    if (top + geo.mani.h < 0 || top > vh) return;
    const p = borner((vh * .85 - top) / (geo.mani.h + vh * .25));
    const n = reduit ? mots.length : Math.round(p * mots.length * 1.08);
    if (n === etat.mots) return;
    etat.mots = n;
    mots.forEach(((m, i) => m.classList.toggle('on', i < n)));
  }
  function majNav(y, vh) {
    const scrolled = y > 8;
    if (scrolled !== etat.scrolled) {
      etat.scrolled = scrolled;
      nav.classList.toggle('is-scrolled', scrolled);
    }
    const max = geo.hautPage - vh;
    const lecture = `scaleX(${max > 0 ? (y / max).toFixed(4) : 0})`;
    if (lecture !== etat.lecture) {
      etat.lecture = lecture;
      barreLecture.style.transform = lecture;
    }
    let courant = -1;
    geo.cibles.forEach(((top, i) => {
      if (top != null && top - y < vh * .45) courant = i;
    }));
    if (courant !== etat.courant) {
      etat.courant = courant;
      liens.forEach(((a, i) => a.classList.toggle('is-current', i === courant)));
    }
  }
  let enAttente = false;
  function surDefilement() {
    if (enAttente) return;
    enAttente = true;
    requestAnimationFrame((() => {
      enAttente = false;
      const y = scrollY, vh = innerHeight;
      majNav(y, vh);
      majAccueil(y, vh);
      majManifeste(y, vh);
    }));
  }
  let delaiRedim = 0;
  addEventListener('scroll', surDefilement, {
    passive: true
  });
  addEventListener('resize', sansBarreSafari((() => {
    clearTimeout(delaiRedim);
    delaiRedim = setTimeout((() => {
      mesurer();
      majVp();
      surDefilement();
    }), 120);
  })));
  addEventListener('load', (() => {
    mesurer();
    majVp();
    surDefilement();
  }));
  new ResizeObserver((() => {
    mesurer();
    surDefilement();
  })).observe(document.body);
  mesurer();
  surDefilement();
  const annee = $('#annee');
  if (annee) annee.textContent = String((new Date).getFullYear());
})();
