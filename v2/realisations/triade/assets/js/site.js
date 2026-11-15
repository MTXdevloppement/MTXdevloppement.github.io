// Triade — interactions du site. Sans dépendance ; la page reste lisible sans ce script.
(() => {
  const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Barre : filet au défilement, section en cours.
  const barre = $('[data-barre]');
  if (barre) {
    const maj = () => barre.classList.toggle('defile', scrollY > 60);
    addEventListener('scroll', maj, { passive: true });
    maj();
    const liens = new Map($$('.barre-nav a').map((a) => [a.getAttribute('href').slice(1), a]));
    if ('IntersectionObserver' in window && liens.size) {
      const io = new IntersectionObserver((entrees) => {
        entrees.forEach((e) => {
          if (!e.isIntersecting) return;
          liens.forEach((a) => a.removeAttribute('aria-current'));
          liens.get(e.target.id)?.setAttribute('aria-current', 'true');
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      liens.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
      const haut = document.getElementById('haut');
      if (haut) io.observe(haut);
    }
  }

  // Apparition des titres et des blocs repérés.
  const aReveler = $$('[data-apparait], .eventail-appel');
  if ('IntersectionObserver' in window && !calme) {
    const io = new IntersectionObserver((entrees) => {
      entrees.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('vu'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    aReveler.forEach((el) => io.observe(el));
  } else {
    aReveler.forEach((el) => el.classList.add('vu'));
  }

  // Les trois outils : onglets (clic, doigt, flèches, Début, Fin).
  const onglets = $$('.onglet');
  if (onglets.length) {
    const choisir = (onglet, focus) => {
      onglets.forEach((o) => {
        const actif = o === onglet;
        o.setAttribute('aria-selected', actif);
        o.tabIndex = actif ? 0 : -1;
        const volet = document.getElementById(o.getAttribute('aria-controls'));
        if (volet) volet.hidden = !actif;
      });
      document.body.dataset.outil = onglet.dataset.outil;
      if (focus) onglet.focus();
    };
    onglets.forEach((o, i) => {
      o.addEventListener('click', () => choisir(o));
      o.addEventListener('keydown', (e) => {
        const n = onglets.length;
        const cible = { ArrowRight: (i + 1) % n, ArrowDown: (i + 1) % n, ArrowLeft: (i + n - 1) % n, ArrowUp: (i + n - 1) % n, Home: 0, End: n - 1 }[e.key];
        if (cible === undefined) return;
        e.preventDefault();
        choisir(onglets[cible], true);
      });
    });
    choisir(onglets.find((o) => o.getAttribute('aria-selected') === 'true') || onglets[0]);
  }

  // Démonstrations de l'assistant : captures réelles qui s'enchaînent.
  const demo = $('[data-demo]');
  if (demo) {
    const ETAPES = {
      lettre: [
        ['lettre-1', 'Vous choisissez un outil et décrivez le document.'],
        ['lettre-2', 'Le texte s’écrit sous vos yeux, sur l’iPhone.'],
        ['lettre-3', 'La lettre s’ouvre dans Texte. Les repères entre crochets sont à compléter.'],
      ],
      formule: [
        ['formule-1', 'Votre devis est ouvert dans le tableur.'],
        ['formule-2', 'Vous écrivez « Somme de la colonne B » : la formule arrive avec son résultat, à contrôler avant de l’insérer.'],
      ],
      resume: [
        ['resume-1', 'Dans un texte, l’assistant propose ses actions.'],
        ['resume-2', 'Le résumé tient en deux phrases. Vous l’insérez ou vous le copiez.'],
      ],
    };
    const DUREE = 3600;
    const ordre = Object.keys(ETAPES);
    const choix = $$('[data-demo-choix]', demo);
    const ecrans = $$('[data-etape]', demo);
    const legende = $('[data-demo-legende]', demo);
    const points = $('[data-demo-points]', demo);
    const lecture = $('[data-demo-lecture]', demo);
    const suite = $('[data-demo-suite]', demo);
    let nom = ordre[0], pas = 0, joue = false, visible = false, minuteur = 0;
    demo.style.setProperty('--duree', DUREE + 'ms');

    const afficher = () => {
      const [cle, texte] = ETAPES[nom][pas];
      ecrans.forEach((p) => p.classList.toggle('vu', p.dataset.etape === cle));
      if (legende.textContent !== texte) legende.textContent = texte;
      choix.forEach((b) => b.setAttribute('aria-pressed', b.dataset.demoChoix === nom));
      points.replaceChildren(...ETAPES[nom].map((_, i) => {
        const s = document.createElement('span');
        if (i === pas) s.className = 'actif';
        return s;
      }));
    };
    const avancer = () => {
      if (pas + 1 < ETAPES[nom].length) pas += 1;
      else { nom = ordre[(ordre.indexOf(nom) + 1) % ordre.length]; pas = 0; }
      afficher();
    };
    const planifier = () => {
      clearTimeout(minuteur);
      demo.classList.toggle('joue', joue && visible);
      if (joue && visible) minuteur = setTimeout(() => { avancer(); planifier(); }, DUREE);
    };
    const regler = (etat) => {
      joue = etat;
      lecture.setAttribute('aria-label', joue ? 'Mettre la démonstration en pause' : 'Lancer la démonstration');
      $('use', lecture).setAttribute('href', joue ? '#g-pause' : '#g-lecture');
      planifier();
    };

    choix.forEach((b) => b.addEventListener('click', () => { nom = b.dataset.demoChoix; pas = 0; afficher(); planifier(); }));
    suite.addEventListener('click', () => { avancer(); planifier(); });
    lecture.addEventListener('click', () => regler(!joue));
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; planifier(); }, { threshold: 0.35 }).observe($('.demo-scene', demo));
    } else visible = true;
    document.addEventListener('visibilitychange', () => { if (document.hidden) clearTimeout(minuteur); else planifier(); });
    afficher();
    regler(!calme);
  }

  // Mode Avion : la liste de ce qui fonctionne ne change pas.
  const avion = $('[data-avion]');
  if (avion) {
    const bouton = $('[data-avion-bouton]', avion);
    const etat = $('[data-avion-etat]', avion);
    bouton.addEventListener('click', () => {
      const coupe = bouton.getAttribute('aria-checked') !== 'true';
      bouton.setAttribute('aria-checked', coupe);
      avion.classList.remove('coupe');
      void avion.offsetWidth;
      avion.classList.toggle('coupe', coupe);
      etat.textContent = coupe ? 'Réseau coupé. Tout fonctionne toujours.' : 'Réseau disponible.';
    });
  }
})();
