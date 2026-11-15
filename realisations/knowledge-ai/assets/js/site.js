// Knowledge AI — interactions de la page.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const io = (cb, opts) => ('IntersectionObserver' in window ? new IntersectionObserver(cb, opts) : null);

  const vus = io((en, obs) => en.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('est-vu'); obs.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
  $$('.apparait').forEach((el) => (vus ? vus.observe(el) : el.classList.add('est-vu')));

  const liens = $$('.barre-nav a');
  const suivi = io((en) => en.forEach((e) => {
    if (e.isIntersecting) liens.forEach((a) => a.classList.toggle('est-ici', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  if (suivi) liens.forEach((a) => { const s = $(a.getAttribute('href')); if (s) suivi.observe(s); });

  // -------------------------------------------------------------------------------------------
  // Le premier écran : une recherche complète, de la question à la réponse vérifiée.
  const SOURCES = [
    ['Traité de Verdun', 'Wikipédia · Contenu'],
    ['Francie occidentale', 'Wikipédia · Introduction'],
    ['Hugues Capet', 'Wikipédia · Élection de 987'],
    ['Domaine royal français', 'Wikipédia · Formation'],
    ['Philippe II Auguste', 'Wikipédia · Titulature'],
    ['Traité de Turin (1860)', 'Wikipédia · Wikidata'],
  ];
  // La réponse, découpée comme un flux : du texte, et {n} pour une citation.
  const REPONSE = [
    ['h', 'Une construction progressive'],
    ['p', 'La France ne naît pas d’un seul événement. En 843, le traité de Verdun partage l’empire carolingien et confie sa partie occidentale à Charles le Chauve {1}. Cette Francie occidentale est le noyau du futur royaume {2}.'],
    ['p', 'En 987, Hugues Capet est élu roi des Francs et fonde la dynastie capétienne {3}. Ses successeurs agrandissent peu à peu le domaine royal, par la guerre, les mariages et les héritages {4}.'],
    ['p', 'Le titre de roi de France s’impose sous Philippe Auguste {5}. Les frontières actuelles ne sont presque atteintes qu’en 1860, avec la Savoie et le comté de Nice {6}.'],
  ];
  const app = $('[data-app]');
  if (app) {
    const qTexte = $('[data-question-texte]', app), etapes = $$('[data-etape]', app), rep = $('[data-reponse]', app), sources = $('[data-sources]', app);
    const QUESTION = qTexte.textContent;
    let jeton = 0, visible = true;
    const attendre = (ms, j) => new Promise((ok, non) => setTimeout(() => (j === jeton ? ok() : non()), ms));
    const pendantVisible = async (j) => { while (!visible || document.hidden) await attendre(300, j); };
    const ajouterSource = (n) => {
      if (sources.querySelector(`[data-s="${n}"]`)) return;
      const [t, s] = SOURCES[n - 1];
      const d = document.createElement('p');
      d.className = 'source'; d.dataset.s = n;
      d.innerHTML = `<b><i>${n}</i>${t}</b><span>${s}</span>`;
      sources.appendChild(d);
    };
    const lier = (n, on) => $$(`[data-s="${n}"]`, app).forEach((e) => e.classList.toggle('est-lie', on));
    rep.addEventListener('pointerover', (e) => { const c = e.target.closest('.cite'); if (c) lier(c.dataset.s, true); });
    rep.addEventListener('pointerout', (e) => { const c = e.target.closest('.cite'); if (c) lier(c.dataset.s, false); });
    const remettre = () => {
      rep.innerHTML = ''; $$('.source', sources).forEach((s) => s.remove());
      etapes.forEach((e) => e.classList.remove('est-encours', 'est-fait'));
      app.classList.remove('est-fini');
    };
    const ecrireReponse = async (j, instant) => {
      for (const [type, texte] of REPONSE) {
        const bloc = document.createElement(type === 'h' ? 'h4' : 'p');
        rep.appendChild(bloc);
        const morceaux = texte.split(/(\{\d\})/).flatMap((m) => (/^\{\d\}$/.test(m) ? [m] : m.split(/(?<=\s)/)));
        for (const m of morceaux) {
          if (/^\{\d\}$/.test(m)) {
            const n = m[1];
            const c = document.createElement('span'); c.className = 'cite'; c.dataset.s = n; c.textContent = n;
            bloc.appendChild(c); ajouterSource(+n);
          } else bloc.append(m);
          if (!instant) { await pendantVisible(j); await attendre(26 + Math.random() * 30, j); }
        }
      }
    };
    const jouer = async () => {
      const j = ++jeton;
      try {
        for (;;) {
          remettre();
          app.classList.add('est-saisie'); qTexte.textContent = '';
          await attendre(500, j);
          for (const c of QUESTION) { await pendantVisible(j); qTexte.textContent += c; await attendre(38, j); }
          app.classList.remove('est-saisie');
          const durees = [700, 1300, 1500, 800];
          for (let k = 0; k < 4; k++) { etapes[k].classList.add('est-encours'); await attendre(durees[k], j); etapes[k].classList.replace('est-encours', 'est-fait'); }
          etapes[4].classList.add('est-encours');
          await ecrireReponse(j, false);
          etapes[4].classList.replace('est-encours', 'est-fait');
          app.classList.add('est-fini');
          await attendre(7000, j);
        }
      } catch { /* recherche interrompue */ }
    };
    if (calme) { etapes.forEach((e) => e.classList.add('est-fait')); ecrireReponse(0, true); app.classList.add('est-fini'); }
    else {
      const obs = io((en) => { visible = en[0].isIntersecting; });
      if (obs) obs.observe(app);
      jouer();
    }
  }

  // -------------------------------------------------------------------------------------------
  // La chaîne : le trait bleu descend avec la lecture.
  const chaine = $('[data-chaine]');
  if (chaine) {
    const maillons = $$('.maillon', chaine);
    let demande = 0;
    const avancer = () => {
      demande = 0;
      const r = chaine.getBoundingClientRect(), niveau = innerHeight * 0.6;
      const p = Math.max(0, Math.min(1, (niveau - r.top) / r.height));
      chaine.style.setProperty('--avance', p.toFixed(4));
      maillons.forEach((m) => m.classList.toggle('est-passe', m.getBoundingClientRect().top + 28 < niveau));
    };
    addEventListener('scroll', () => { if (!demande) demande = requestAnimationFrame(avancer); }, { passive: true });
    addEventListener('resize', avancer);
    avancer();
  }

  // -------------------------------------------------------------------------------------------
  // Vérification des citations : la règle de verification.py, rejouée ici.
  // Part des mots porteurs de sens d'une phrase qu'on retrouve dans le passage qu'elle cite.
  const verif = $('[data-verif]');
  if (verif) {
    const PASSAGES = [
      ['[1] Traité de Verdun · Wikipédia', 'Le traité de Verdun, signé en août 843, partage l’empire carolingien entre les trois petits-fils de Charlemagne : Lothaire Ier, Louis le Germanique et Charles le Chauve.'],
      ['[1] Traité de Verdun · Wikipédia', 'Charles le Chauve obtient la partie occidentale de l’empire, la Francie occidentale, dont le territoire préfigure celui du royaume de France.'],
      ['[2] Hugues Capet · Wikipédia', 'Hugues Capet est élu roi des Francs en 987 à Senlis, puis sacré à Noyon ; il fonde ainsi la dynastie des Capétiens.'],
      ['[2] Hugues Capet · Wikipédia', 'Hugues Capet est élu roi des Francs en 987 à Senlis, puis sacré à Noyon ; il fonde ainsi la dynastie des Capétiens.'],
    ];
    const VIDES = new Set('les des une un le la de du et en au aux ce cette ces qui que quoi dont son sa ses leur leurs est sont par pour sur dans avec entre puis ainsi tout tous toute toutes aussi plus'.split(' '));
    const norme = (m) => m.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const mots = (t) => (t.match(/[\p{L}\d]+/gu) || []).filter((m) => m.length > 2 && !VIDES.has(norme(m)));
    const racine = (m) => norme(m).slice(0, 5);
    const boutons = $$('[data-p]', verif);
    const ref = $('[data-ref]', verif), passage = $('[data-passage]', verif), score = $('[data-score]', verif), verdict = $('[data-verdict]', verif), detail = $('[data-mots]', verif), jauge = $('.verif-jauge', verif);
    const choisir = (i, focus) => {
      boutons.forEach((b, k) => { b.setAttribute('aria-selected', String(k === i)); b.tabIndex = k === i ? 0 : -1; });
      if (focus) boutons[i].focus();
      const phrase = boutons[i].cloneNode(true); phrase.querySelector('sup').remove();
      const [r, texte] = PASSAGES[i];
      const dans = new Set(mots(texte).map(racine));
      const liste = [...new Map(mots(phrase.textContent).map((m) => [racine(m), m])).values()];
      const trouves = liste.filter((m) => dans.has(racine(m)));
      const part = liste.length ? Math.round((trouves.length / liste.length) * 100) : 0;
      const cle = new Set(trouves.map(racine));
      ref.textContent = r;
      passage.innerHTML = texte.replace(/[\p{L}\d]+/gu, (m) => (m.length > 2 && cle.has(racine(m)) && !VIDES.has(norme(m)) ? `<mark>${m}</mark>` : m));
      score.textContent = part + ' %';
      const [mot, couleur] = part >= 60 ? ['bien étayée', 'var(--vert)'] : part >= 35 ? ['à relire', 'var(--orange)'] : ['peu étayée : signalée dans le rapport', '#d9483b'];
      verdict.textContent = mot;
      jauge.style.setProperty('--v', part); jauge.style.setProperty('--c', couleur);
      detail.innerHTML = liste.map((m) => (cle.has(racine(m)) ? m : `<s>${m}</s>`)).join(' · ');
    };
    boutons.forEach((b, i) => {
      b.addEventListener('click', () => choisir(i));
      b.addEventListener('keydown', (e) => {
        const d = ['ArrowDown', 'ArrowRight'].includes(e.key) ? 1 : ['ArrowUp', 'ArrowLeft'].includes(e.key) ? -1 : 0;
        if (d) { e.preventDefault(); choisir((i + d + boutons.length) % boutons.length, true); }
      });
    });
    choisir(0);
  }

  // -------------------------------------------------------------------------------------------
  // La carte des connaissances : nœuds qui respirent, voisins éclairés au survol.
  const graphe = $('[data-graphe]');
  if (graphe) {
    const N = [
      ['ia', 'Intelligence artificielle', 300, 150, 9, true], ['iag', 'IA générale', 420, 84, 5], ['ord', 'Histoire des ordinateurs', 360, 214, 5],
      ['fr', 'France', 168, 96, 8, true], ['clo', 'Clovis Ier', 74, 52, 5], ['ma', 'Moyen Âge', 70, 168, 6], ['ant', 'Antiquité', 168, 232, 6],
      ['fus', 'Fusion nucléaire', 330, 262, 7, true], ['iter', 'ITER', 448, 312, 5], ['sci', 'Sciences', 214, 318, 5],
    ];
    const L = [['ia', 'iag', 0], ['ia', 'ord', 0], ['ia', 'fr', 1], ['ia', 'fus', 1], ['fr', 'clo', 0], ['fr', 'ma', 0], ['clo', 'ma', 1], ['ma', 'ant', 0], ['fr', 'ant', 1], ['fus', 'iter', 0], ['fus', 'sci', 1], ['ant', 'sci', 1], ['ord', 'iag', 1], ['fus', 'fr', 1]];
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 530 370'); svg.setAttribute('aria-hidden', 'true');
    const gl = document.createElementNS(NS, 'g'); svg.appendChild(gl);
    const pos = {}, noeuds = {}, traits = [];
    L.forEach(([a, b, wd]) => { const l = document.createElementNS(NS, 'line'); l.setAttribute('class', 'g-lien' + (wd ? ' wd' : '')); gl.appendChild(l); traits.push([a, b, l]); });
    N.forEach(([id, nom, x, y, r, central], k) => {
      const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'g-noeud' + (central ? ' est-central' : ''));
      const c = document.createElementNS(NS, 'circle'); c.setAttribute('r', r);
      const t = document.createElementNS(NS, 'text'); t.textContent = nom; t.setAttribute('x', r + 6); t.setAttribute('y', 4);
      g.append(c, t); svg.appendChild(g);
      pos[id] = { x, y, x0: x, y0: y, k }; noeuds[id] = g;
      g.addEventListener('pointerenter', () => {
        graphe.classList.add('est-survol');
        traits.forEach(([a, b, l]) => { const on = a === id || b === id; l.classList.toggle('est-lie', on); if (on) { noeuds[a].classList.add('est-lie'); noeuds[b].classList.add('est-lie'); } });
      });
      g.addEventListener('pointerleave', () => { graphe.classList.remove('est-survol'); $$('.est-lie', svg).forEach((e) => e.classList.remove('est-lie')); });
    });
    graphe.appendChild(svg);
    const placer = (t) => {
      Object.values(pos).forEach((p) => { p.x = p.x0 + Math.sin(t / 1900 + p.k * 1.7) * 6; p.y = p.y0 + Math.cos(t / 2300 + p.k * 1.3) * 5; });
      N.forEach(([id]) => noeuds[id].setAttribute('transform', `translate(${pos[id].x.toFixed(1)} ${pos[id].y.toFixed(1)})`));
      traits.forEach(([a, b, l]) => { l.setAttribute('x1', pos[a].x); l.setAttribute('y1', pos[a].y); l.setAttribute('x2', pos[b].x); l.setAttribute('y2', pos[b].y); });
    };
    placer(0);
    if (!calme) {
      let visible = false, image = 0;
      const boucle = (t) => { image = 0; if (!visible || document.hidden) return; placer(t); image = requestAnimationFrame(boucle); };
      const obs = io((en) => { visible = en[0].isIntersecting; if (visible && !image) image = requestAnimationFrame(boucle); });
      if (obs) obs.observe(graphe);
      document.addEventListener('visibilitychange', () => { if (visible && !image) image = requestAnimationFrame(boucle); });
    }
  }
})();
