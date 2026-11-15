// Volta — interactions de la page.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const io = (cb, opts) => ('IntersectionObserver' in window ? new IntersectionObserver(cb, opts) : null);
  const nombre = (n, dec = 0) => n.toLocaleString('fr-FR', { minimumFractionDigits: dec, maximumFractionDigits: dec });

  // Apparition au défilement.
  const vus = io((en, obs) => en.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('est-vu'); obs.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
  $$('.apparait, .banc').forEach((el) => (vus ? vus.observe(el) : el.classList.add('est-vu')));

  // Barre : section en cours.
  const liens = $$('.barre-nav a');
  const suivi = io((en) => en.forEach((e) => {
    if (e.isIntersecting) liens.forEach((a) => a.classList.toggle('est-ici', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  if (suivi) liens.forEach((a) => { const s = $(a.getAttribute('href')); if (s) suivi.observe(s); });

  // Fenêtre de l'app : le curseur va cliquer dans la barre latérale, l'écran change.
  // Positions des entrées de la barre latérale, mesurées sur les captures (en % de la fenêtre).
  const fenetre = $('[data-fenetre]');
  if (fenetre) {
    const ecrans = $$('[data-ecran]', fenetre), onglets = $$('[data-aller]'), curseur = $('[data-curseur]', fenetre);
    const Y = [9.2, 12.7, 16.2, 19.6, 23];
    let actuel = 0, minuteur = 0, auto = !calme, visible = true;
    const montrer = (i) => {
      actuel = i;
      ecrans.forEach((e, k) => e.classList.toggle('est-actif', k === i));
      onglets.forEach((o, k) => { o.setAttribute('aria-selected', String(k === i)); o.tabIndex = k === i ? 0 : -1; });
    };
    const viser = (i) => { curseur.style.setProperty('--cx', '6.5%'); curseur.style.setProperty('--cy', Y[i] - 1.2 + '%'); };
    const suivant = () => {
      clearTimeout(minuteur);
      if (!auto || !visible || document.hidden) return;
      const i = (actuel + 1) % ecrans.length;
      viser(i);
      minuteur = setTimeout(() => {
        curseur.classList.add('est-clic');
        setTimeout(() => curseur.classList.remove('est-clic'), 160);
        montrer(i);
        // Le curseur repart se poser dans le contenu, comme quelqu'un qui lit.
        minuteur = setTimeout(() => {
          curseur.style.setProperty('--cx', 30 + Math.random() * 50 + '%');
          curseur.style.setProperty('--cy', 35 + Math.random() * 40 + '%');
          minuteur = setTimeout(suivant, 2600);
        }, 700);
      }, 1100);
    };
    const prendre = (i, focus) => { auto = false; clearTimeout(minuteur); montrer(i); viser(i); if (focus) onglets[i].focus(); };
    onglets.forEach((o, i) => {
      o.addEventListener('click', () => prendre(i));
      o.addEventListener('keydown', (e) => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (d) { e.preventDefault(); prendre((i + d + onglets.length) % onglets.length, true); }
        else if (/^[1-5]$/.test(e.key)) { e.preventDefault(); prendre(+e.key - 1, true); }
      });
    });
    if (calme) curseur.hidden = true;
    const obs = io((en) => { visible = en[0].isIntersecting; if (visible) { clearTimeout(minuteur); minuteur = setTimeout(suivant, 1800); } else clearTimeout(minuteur); });
    if (obs) obs.observe(fenetre); else minuteur = setTimeout(suivant, 2500);
    document.addEventListener('visibilitychange', () => { if (!document.hidden && visible) minuteur = setTimeout(suivant, 1500); });
  }

  // Bornier : les chiffres montent.
  const cpt = io((en, obs) => en.forEach((e) => {
    if (!e.isIntersecting) return;
    obs.unobserve(e.target);
    const fin = +e.target.dataset.compte;
    if (calme) return;
    const t0 = performance.now();
    const pas = (t) => { const k = Math.min(1, (t - t0) / 1300); e.target.textContent = nombre(Math.round(fin * (1 - Math.pow(1 - k, 4)))); if (k < 1) requestAnimationFrame(pas); };
    requestAnimationFrame(pas);
  }), { threshold: 0.6 });
  if (cpt) $$('[data-compte]').forEach((c) => cpt.observe(c));

  // Carte « Consommation » : 26 semaines, un bâton par semaine.
  const histo = $('[data-histo]');
  if (histo) {
    const h = [62, 74, 81, 55, 66, 64, 70, 58, 63, 77, 60, 66, 72, 59, 68, 74, 65, 63, 79, 71, 67, 76, 73, 69, 77, 18];
    histo.innerHTML = h.map((v, k) => `<i style="--h:${v};--k:${k}"></i>`).join('');
  }

  // Le geste : sélectionner, ⌘E, taper, ⏎. En boucle tant que la scène est visible.
  const feuille = $('[data-feuille]'), etapes = $$('[data-etapes] li');
  if (feuille) {
    const saisie = $('[data-saisie]', feuille), obtenu = $('[data-obtenu]', feuille);
    let t = 0, visible = false, en = false;
    const etape = (n) => {
      feuille.className = feuille.className.replace(/\setape-\d/g, '') + ' etape-' + n;
      etapes.forEach((li, k) => li.classList.toggle('est-actif', k === n - 1));
    };
    const attendre = (ms) => new Promise((r) => { t = setTimeout(r, ms); });
    const tourner = async () => {
      if (en) return; en = true;
      while (visible) {
        saisie.textContent = ''; obtenu.textContent = '42 m'; etape(1); await attendre(1400);
        etape(2); await attendre(1100);
        etape(3);
        for (const c of '5') { await attendre(450); saisie.textContent += c; obtenu.textContent = '37 m'; }
        await attendre(1200);
        etape(4); await attendre(2600);
      }
      en = false;
    };
    if (calme) { saisie.textContent = '5'; obtenu.textContent = '37 m'; etape(3); }
    else {
      const obs = io((e) => { visible = e[0].isIntersecting; if (visible) tourner(); else clearTimeout(t), en = false; }, { threshold: 0.35 });
      if (obs) obs.observe(feuille);
    }
  }

  // Calcul de rupture : les règles du README de Volta, appliquées en direct.
  const calcul = $('[data-calcul]');
  if (calcul) {
    const r = (k) => $(`[data-r="${k}"]`, calcul), o = (k) => $(`[data-o="${k}"]`, calcul), c = (k) => $(`[data-c="${k}"]`, calcul);
    const etat = $('[data-etat]', calcul), stockF = $('[data-frise-stock]', calcul), livr = $('[data-frise-livraison]', calcul);
    const maj = () => {
      const stock = +r('stock').value, sorties = +r('sorties').value, delai = +r('delai').value;
      ['stock', 'sorties', 'delai'].forEach((k) => { const i = r(k); o(k).textContent = i.value; i.style.setProperty('--p', ((i.value - i.min) / (i.max - i.min)) * 100 + '%'); });
      const conso = sorties / 90;
      const jours = conso > 0 ? stock / conso : Infinity;
      const seuil = Math.ceil(conso * delai * 1.5);
      c('conso').textContent = nombre(conso, conso < 10 ? 1 : 0);
      c('jours').textContent = isFinite(jours) ? nombre(Math.floor(jours)) : '∞';
      c('seuil').textContent = nombre(seuil);
      let texte = 'En stock', couleur = 'var(--vert)';
      if (stock === 0) { texte = 'En rupture'; couleur = 'var(--rouge)'; }
      else if (jours < delai) { texte = 'Rupture prévue'; couleur = 'var(--orange)'; }
      else if (stock < seuil) { texte = 'Sous le seuil · à commander'; couleur = 'var(--jaune-texte)'; }
      etat.textContent = texte;
      calcul.style.setProperty('--c', couleur);
      const echelle = Math.max(delai * 1.6, Math.min(isFinite(jours) ? jours : 60, 90), 20);
      stockF.style.setProperty('--w', Math.min(100, ((isFinite(jours) ? jours : echelle) / echelle) * 100) + '%');
      livr.style.setProperty('--l', (delai / echelle) * 100 + '%');
    };
    $$('input', calcul).forEach((i) => i.addEventListener('input', maj));
    maj();
  }

  // Devis : les étapes s'allument une à une.
  const cycle = $('[data-cycle]');
  if (cycle) {
    const li = $$('li', cycle);
    const obs = io((en, ob) => en.forEach((e) => {
      if (!e.isIntersecting) return; ob.unobserve(cycle);
      li.forEach((x, k) => setTimeout(() => x.classList.add('est-passe'), calme ? 0 : 300 + k * 380));
    }), { threshold: 0.5 });
    if (obs) obs.observe(cycle); else li.forEach((x) => x.classList.add('est-passe'));
  }

  // Le fil : un conducteur part du bornier, longe la marge et dessert chaque section.
  // Il s'allume jusqu'au niveau de lecture ; les repères qu'il atteint passent « sous tension ».
  const svg = $('.fil'), fond = $('[data-fil-fond]'), courant = $('[data-fil]');
  const reperes = $$('.repere'), depart = $('.bornier');
  if (svg && depart && reperes.length) {
    let noeuds = [], longueur = 0, demande = 0;
    const construire = () => {
      if (getComputedStyle(svg).display === 'none') return;
      const base = document.body.getBoundingClientRect();
      const x0 = Math.max(18, Math.min(40, innerWidth * 0.022));
      const y0 = depart.getBoundingClientRect().bottom - base.top;
      let d = `M${x0} ${y0}`, l = 0, y = y0;
      noeuds = [];
      reperes.forEach((rep) => {
        const b = rep.querySelector('span').getBoundingClientRect();
        const ry = b.top + b.height / 2 - base.top, rx = b.left - base.left - 6;
        l += ry - y; noeuds.push({ l, y: ry, rep, larg: rx - x0 });
        l += 2 * (rx - x0);
        d += ` V${ry} H${rx} H${x0}`;
        y = ry;
      });
      fond.setAttribute('d', d); courant.setAttribute('d', d);
      longueur = l;
      courant.style.strokeDasharray = `${longueur} ${longueur}`;
      allumer();
    };
    const allumer = () => {
      demande = 0;
      if (!longueur) return;
      const base = document.body.getBoundingClientRect();
      const niveau = scrollY + innerHeight * 0.62 - (base.top + scrollY);
      let l = 0, yPrec = noeuds.length ? noeuds[0].y - noeuds[0].l : 0;
      for (const n of noeuds) {
        if (niveau < n.y) { l = n.l - (n.y - Math.max(yPrec, niveau)); break; }
        l = n.l + 2 * n.larg; yPrec = n.y;
      }
      courant.style.strokeDashoffset = String(longueur - Math.max(0, l));
      noeuds.forEach((n) => n.rep.classList.toggle('est-sous-tension', niveau >= n.y));
    };
    addEventListener('scroll', () => { if (!demande) demande = requestAnimationFrame(allumer); }, { passive: true });
    if ('ResizeObserver' in window) new ResizeObserver(() => construire()).observe(document.body);
    addEventListener('resize', construire);
    if (document.fonts) document.fonts.ready.then(construire);
    construire();
  }
})();
