/* MTX Studio — sites des pôles et accueil-aiguillage (JavaScript sans dépendance).
   1. Barre locale : rubriques dépliables sur mobile.
   2. Vitrine : de vrais sites du studio, dans le navigateur et le téléphone.
   3. Comparateur avant / après (refonte), manipulé par le visiteur seulement.
   4. Interrupteur Création / Refonte des formules.
   5. Simulateur de devis : lit les prix dans la page (cartes des formules et options), une seule source.
   6. Bouton flottant sur mobile.
   7. Réponse sourcée (IA) : toucher une citation surligne le passage de la source.
   Sans JavaScript : tout le contenu reste lisible, la vitrine montre le premier site, le comparateur reste
   à 50 %, le simulateur laisse place à un lien vers l’e-mail. */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const euros = (n) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.round(n));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const EMAIL = 'mtxstudio@proton.me';
  const params = new URLSearchParams(window.location.search);

  /* ---------------------------------------------------------------------
     1. Barre locale
     --------------------------------------------------------------------- */
  const lnav = $('[data-lnav]');
  if (lnav) {
    const btn = $('[data-lnav-toggle]', lnav);
    const list = $('[data-lnav-list]', lnav);
    const large = window.matchMedia('(min-width: 900px)');
    let open = false;
    const apply = () => {
      list.hidden = !large.matches && !open;
      if (btn) {
        btn.setAttribute('aria-expanded', String(open && !large.matches));
        btn.setAttribute('aria-label', open ? 'Masquer les rubriques' : 'Afficher les rubriques');
      }
    };
    const setOpen = (v) => { open = v; apply(); };
    if (btn) btn.addEventListener('click', () => setOpen(!open));
    $$('a', list).forEach((a) => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) { setOpen(false); btn && btn.focus(); } });
    document.addEventListener('click', (e) => { if (open && !lnav.contains(e.target)) setOpen(false); });
    large.addEventListener('change', apply);
    apply();
  }

  /* ---------------------------------------------------------------------
     2. Vitrine
     --------------------------------------------------------------------- */
  const show = $('[data-show]');
  if (show) {
    const tabs = $$('[role="tab"][data-slide]');
    const url = $('[data-show-url]', show);
    const open = $('[data-show-open]');
    let actuel = Math.max(0, tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true'));
    const afficher = (i, focus) => {
      i = (i + tabs.length) % tabs.length;
      const tab = tabs[i];
      const cle = tab.dataset.slide;
      tabs.forEach((t, k) => {
        t.setAttribute('aria-selected', String(k === i));
        t.tabIndex = k === i ? 0 : -1;
      });
      $$('[data-slide-key]', show).forEach((s) => {
        const on = s.dataset.slideKey === cle;
        const etait = !s.hidden;
        s.hidden = !on;
        if (on && !etait && !reduceMotion) { s.classList.remove('is-entering'); void s.offsetWidth; s.classList.add('is-entering'); }
      });
      if (url) url.textContent = tab.dataset.url;
      if (open) { open.href = tab.dataset.href; open.textContent = `Ouvrir le site de ${tab.dataset.nom}`; }
      if (focus) tab.focus();
      actuel = i;
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => afficher(i));
      tab.addEventListener('keydown', (e) => {
        const pas = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (pas) { e.preventDefault(); afficher(actuel + pas, true); }
        else if (e.key === 'Home') { e.preventDefault(); afficher(0, true); }
        else if (e.key === 'End') { e.preventDefault(); afficher(tabs.length - 1, true); }
      });
    });
    afficher(actuel);
  }

  /* ---------------------------------------------------------------------
     3. Comparateur avant / après
     --------------------------------------------------------------------- */
  $$('[data-ba]').forEach((ba) => {
    const range = $('input[type="range"]', ba);
    if (!range) return;
    const poser = () => {
      ba.style.setProperty('--pos', range.value + '%');
      range.setAttribute('aria-valuetext', `${range.value}\u00a0% de l’ancien site visible`);
    };
    range.addEventListener('input', poser);
    poser();
  });

  /* ---------------------------------------------------------------------
     4 et 5. Formules (création / refonte) et simulateur
     --------------------------------------------------------------------- */
  const cartes = $$('[data-plan]');
  const plans = cartes.reduce((acc, el) => {
    acc[el.dataset.plan] = {
      nom: el.dataset.nom,
      creation: +el.dataset.creation,
      refonte: +el.dataset.refonte,
      delai: el.dataset.delai,
      delaiExpress: el.dataset.delaiExpress,
    };
    return acc;
  }, {});
  const form = $('[data-est]');
  const modeInitial = params.get('mode') === 'refonte' ? 'refonte' : 'creation';

  // Les prix des cartes suivent l’interrupteur ; le simulateur suit le même mode.
  const majCartes = (mode) => {
    const grille = $('[data-plans]');
    if (grille && !reduceMotion) { grille.classList.add('is-switching'); window.setTimeout(() => grille.classList.remove('is-switching'), 180); }
    window.setTimeout(() => {
      cartes.forEach((c) => {
        const n = $('[data-prix]', c);
        if (n) n.textContent = euros(+c.dataset[mode]);
        const note = $('[data-prix-note]', c);
        if (note) note.textContent = mode === 'refonte' ? note.dataset.refonte : note.dataset.creation;
      });
      $$('[data-mode-label]').forEach((el) => { el.textContent = mode === 'refonte' ? 'refonte' : 'création'; });
    }, reduceMotion ? 0 : 120);
  };
  const interrupteurs = $$('input[name="tarif-mode"]');
  const poserMode = (mode, depuis) => {
    interrupteurs.forEach((r) => { r.checked = r.value === mode; });
    if (form && depuis !== 'form') {
      const radio = $(`input[name="mode"][value="${mode}"]`, form);
      if (radio && !radio.checked) { radio.checked = true; form.dispatchEvent(new Event('change')); }
    }
    majCartes(mode);
  };
  interrupteurs.forEach((r) => r.addEventListener('change', () => poserMode(r.value, 'switch')));
  if (interrupteurs.length && modeInitial === 'refonte') poserMode('refonte');

  if (form && Object.keys(plans).length) {
    const sortie = $('[data-est-sum]');
    const out = (k) => $(`[data-out="${k}"]`, sortie);
    const PAGE = +form.dataset.prixPage;
    const MAX_PAGES = 30;
    const pagesInput = $('[data-pages]', form);
    const moins = $('[data-pages-moins]', form);
    const plus = $('[data-pages-plus]', form);
    const champSite = $('[data-champ-site]', form);
    if (modeInitial === 'refonte') { const r = $('input[name="mode"][value="refonte"]', form); if (r) r.checked = true; }
    const formuleUrl = params.get('formule');
    if (formuleUrl && plans[formuleUrl]) { const r = $(`input[name="formule"][value="${formuleUrl}"]`, form); if (r) r.checked = true; }

    const majChoixFormules = (mode) => {
      $$('[data-formule-prix]', form).forEach((em) => {
        const p = plans[em.dataset.formulePrix];
        if (!p) return;
        const prefixe = em.dataset.formulePrix === 'boutique' ? 'dès ' : '';
        em.textContent = `${prefixe}${euros(p[mode])}\u00a0€`;
      });
    };

    let modePrecedent = null;
    const calculer = () => {
      const fd = new FormData(form);
      const mode = fd.get('mode') === 'refonte' ? 'refonte' : 'creation';
      if (modePrecedent && mode !== modePrecedent && interrupteurs.length) poserMode(mode, 'form');
      modePrecedent = mode;
      const formule = plans[fd.get('formule')] ? fd.get('formule') : Object.keys(plans)[0];
      const plan = plans[formule];
      const pages = Math.max(0, Math.min(MAX_PAGES, parseInt(pagesInput.value, 10) || 0));
      pagesInput.value = String(pages);
      moins.disabled = pages <= 0;
      plus.disabled = pages >= MAX_PAGES;

      majChoixFormules(mode);
      if (champSite) champSite.hidden = mode !== 'refonte';

      const lignes = [{ label: `${plan.nom} · ${mode === 'refonte' ? 'refonte' : 'création'}`, prix: plan[mode] }];
      if (pages) lignes.push({ label: `${pages}\u00a0page${pages > 1 ? 's' : ''} en plus`, prix: pages * PAGE });

      let express = false;
      $$('[data-option]', form).forEach((cb) => {
        const inclus = (cb.dataset.inclus || '').split(' ').includes(formule);
        const reserve = cb.dataset.seulement && !cb.dataset.seulement.split(' ').includes(formule);
        cb.disabled = inclus || !!reserve;
        const label = cb.closest('.p-choice');
        if (label) label.hidden = !!reserve;
        const prixEl = label && $('em', label);
        if (prixEl) prixEl.textContent = inclus ? 'inclus' : prixEl.dataset.prix;
        if (inclus) { lignes.push({ label: cb.dataset.nom, prix: 0, inclus: true }); return; }
        if (!cb.checked || cb.disabled) return;
        if (cb.dataset.option === 'express') { express = true; return; }
        lignes.push({ label: cb.dataset.nom, prix: +cb.dataset.prixOption });
      });

      let total = lignes.reduce((s, l) => s + l.prix, 0);
      if (express) {
        const sup = Math.round(total * 0.25);
        lignes.push({ label: 'Livraison express (+25 %)', prix: sup });
        total += sup;
      }

      const maint = $('input[name="maintenance"]:checked', form);
      const mensuel = maint ? +maint.dataset.prixMois : 0;

      // Échéancier : 30 % à la signature, 40 % à la maquette, le solde à la mise en ligne.
      const a1 = Math.round(total * 0.3), a2 = Math.round(total * 0.4), a3 = total - a1 - a2;
      const delai = express ? plan.delaiExpress : plan.delai;

      out('total').textContent = euros(total);
      const mini = $('[data-mini-total]', form);
      if (mini) mini.textContent = euros(total);
      out('mois').textContent = mensuel ? `+ ${maint.dataset.nom}\u202f: ${euros(mensuel)}\u00a0€ par mois, sans engagement` : 'Sans maintenance\u202f: le site vous appartient, vous en faites ce que vous voulez.';
      out('lignes').innerHTML = lignes.map((l) => `<li${l.inclus ? ' class="is-free"' : ''}><span>${esc(l.label)}</span><span>${l.inclus ? 'inclus' : euros(l.prix) + '\u00a0€'}</span></li>`).join('');
      out('echeances').textContent = `${euros(a1)} · ${euros(a2)} · ${euros(a3)}\u00a0€`;
      out('delai').textContent = delai;

      // E-mail pré-rempli avec le récapitulatif.
      const entreprise = (fd.get('entreprise') || '').toString().trim();
      const site = (fd.get('site') || '').toString().trim();
      const corps = [
        'Bonjour Matheo,', '',
        'Voici l’estimation faite sur mtx-developpement.fr, j’aimerais un devis :', '',
        ...lignes.map((l) => `- ${l.label} : ${l.inclus ? 'inclus' : euros(l.prix) + ' €'}`),
        `Total estimé : ${euros(total)} €`,
        mensuel ? `Maintenance : ${maint.dataset.nom}, ${euros(mensuel)} € par mois` : 'Maintenance : aucune pour l’instant',
        `Délai indicatif : ${delai}`, '',
        `Entreprise et secteur : ${entreprise}`,
        mode === 'refonte' ? `Site actuel : ${site}` : '',
        '', 'Ce que le site doit permettre (présenter, prendre des rendez-vous, vendre…) :', '', '',
        'Échéance souhaitée :', '', '',
      ].filter((l, i, a) => !(l === '' && a[i - 1] === '' && a[i - 2] === ''));
      const sujet = `Devis site internet${entreprise ? ' · ' + entreprise : ''} (${plan.nom}, ${euros(total)} €)`;
      out('mail').href = `mailto:${EMAIL}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps.join('\n'))}`;
    };

    // L’adresse garde le mode et la formule choisis : un lien copié rouvre la même estimation de départ.
    const majAdresse = () => {
      if (!window.history || !history.replaceState) return;
      const fd = new FormData(form);
      const q = new URLSearchParams(window.location.search);
      q.set('mode', fd.get('mode') === 'refonte' ? 'refonte' : 'creation');
      if (fd.get('formule')) q.set('formule', fd.get('formule'));
      history.replaceState(history.state, '', `${window.location.pathname}?${q}${window.location.hash || '#devis'}`);
    };
    const parGeste = () => { calculer(); majAdresse(); };
    moins.addEventListener('click', () => { pagesInput.value = String((+pagesInput.value || 0) - 1); parGeste(); });
    plus.addEventListener('click', () => { pagesInput.value = String((+pagesInput.value || 0) + 1); parGeste(); });
    form.addEventListener('input', parGeste);
    form.addEventListener('change', parGeste);
    form.addEventListener('submit', (e) => e.preventDefault());

    // Les boutons « Choisir » des formules présélectionnent la formule (et le mode affiché) dans le simulateur.
    $$('[data-choisir]').forEach((a) => a.addEventListener('click', () => {
      const radio = $(`input[name="formule"][value="${a.dataset.choisir}"]`, form);
      if (radio) radio.checked = true;
      const coche = interrupteurs.find((r) => r.checked);
      if (coche) { const m = $(`input[name="mode"][value="${coche.value}"]`, form); if (m) m.checked = true; }
      calculer();
    }));
    calculer();
  }

  /* ---------------------------------------------------------------------
     6. Bouton flottant sur mobile : visible après le héros, caché près
        des zones qui ont déjà leur bouton (simulateur, appel final).
     --------------------------------------------------------------------- */
  const flottant = $('[data-float]');
  if (flottant && 'IntersectionObserver' in window) {
    const hero = $('[data-hero]');
    const masques = $$('[data-float-hide]');
    let apresHero = false;
    const proches = new Set();
    const maj = () => {
      const on = apresHero && proches.size === 0;
      flottant.classList.toggle('is-visible', on);
      flottant.inert = !on;
    };
    if (hero) new IntersectionObserver(([en]) => { apresHero = !en.isIntersecting && en.boundingClientRect.top < 0; maj(); }).observe(hero);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => (en.isIntersecting ? proches.add(en.target) : proches.delete(en.target)));
      maj();
    });
    masques.forEach((m) => io.observe(m));
    maj();
  }

  /* ---------------------------------------------------------------------
     7. Réponse sourcée
     --------------------------------------------------------------------- */
  $$('[data-answer]').forEach((box) => {
    const cites = $$('.p-cite', box);
    const sources = $$('.p-source', box);
    const allumer = (id) => {
      cites.forEach((c) => c.setAttribute('aria-pressed', String(c.getAttribute('aria-controls') === id)));
      sources.forEach((s) => s.classList.toggle('is-lit', s.id === id));
    };
    // Le survol montre la source ; un clic la fixe, un second clic sur la même citation l’éteint.
    // (Sans ce suivi, le survol allumait la source et le clic qui suivait l’éteignait aussitôt.)
    let fixee = '';
    cites.forEach((c) => {
      const id = c.getAttribute('aria-controls');
      c.addEventListener('click', () => {
        fixee = fixee === id ? '' : id;
        allumer(fixee);
      });
      if (window.matchMedia('(hover: hover)').matches) {
        c.addEventListener('mouseenter', () => allumer(id));
        c.addEventListener('mouseleave', () => allumer(fixee));
      }
    });
  });
})();
