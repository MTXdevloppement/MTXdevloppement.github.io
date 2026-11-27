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
     4 et 5. Formules et demande de devis (sans prix : chaque projet est chiffré à part)
     --------------------------------------------------------------------- */
  const cartes = $$('[data-plan]');
  const plans = cartes.reduce((acc, el) => {
    acc[el.dataset.plan] = { nom: el.dataset.nom, delai: el.dataset.delai, delaiExpress: el.dataset.delaiExpress };
    return acc;
  }, {});
  const form = $('[data-est]');
  const modeInitial = params.get('mode') === 'refonte' ? 'refonte' : 'creation';

  if (form && Object.keys(plans).length) {
    const sortie = $('[data-est-sum]');
    const out = (k) => $(`[data-out="${k}"]`, sortie);
    const MAX_PAGES = 30;
    const pagesInput = $('[data-pages]', form);
    const moins = $('[data-pages-moins]', form);
    const plus = $('[data-pages-plus]', form);
    const champSite = $('[data-champ-site]', form);
    if (modeInitial === 'refonte') { const r = $('input[name="mode"][value="refonte"]', form); if (r) r.checked = true; }
    const formuleUrl = params.get('formule');
    if (formuleUrl && plans[formuleUrl]) { const r = $(`input[name="formule"][value="${formuleUrl}"]`, form); if (r) r.checked = true; }

    const calculer = () => {
      const fd = new FormData(form);
      const mode = fd.get('mode') === 'refonte' ? 'refonte' : 'creation';
      const formule = plans[fd.get('formule')] ? fd.get('formule') : Object.keys(plans)[0];
      const plan = plans[formule];
      const pages = Math.max(0, Math.min(MAX_PAGES, parseInt(pagesInput.value, 10) || 0));
      pagesInput.value = String(pages);
      moins.disabled = pages <= 0;
      plus.disabled = pages >= MAX_PAGES;
      if (champSite) champSite.hidden = mode !== 'refonte';

      const lignes = [{ label: `${plan.nom} · ${mode === 'refonte' ? 'refonte' : 'création'}` }];
      if (pages) lignes.push({ label: `${pages} page${pages > 1 ? 's' : ''} en plus` });

      let express = false;
      $$('[data-option]', form).forEach((cb) => {
        const inclus = (cb.dataset.inclus || '').split(' ').includes(formule);
        const reserve = cb.dataset.seulement && !cb.dataset.seulement.split(' ').includes(formule);
        cb.disabled = inclus || !!reserve;
        const label = cb.closest('.p-choice');
        if (label) label.hidden = !!reserve;
        const etat = label && $('em', label);
        if (etat) etat.textContent = inclus ? 'inclus' : '';
        if (inclus) { lignes.push({ label: cb.dataset.nom, inclus: true }); return; }
        if (!cb.checked || cb.disabled) return;
        if (cb.dataset.option === 'express') express = true;
        lignes.push({ label: cb.dataset.nom });
      });

      const maint = $('input[name="maintenance"]:checked', form);
      const suivi = maint && maint.dataset.nom ? `Maintenance ${maint.dataset.nom}` : 'Sans maintenance';
      const delai = express ? plan.delaiExpress : plan.delai;

      out('lignes').innerHTML = lignes.map((l) => `<li${l.inclus ? ' class="is-free"' : ''}><span>${esc(l.label)}</span><span>${l.inclus ? 'inclus' : '✓'}</span></li>`).join('');
      out('mois').textContent = suivi;
      out('delai').textContent = delai;
      const mini = $('[data-mini-total]', form);
      if (mini) mini.textContent = plan.nom;

      // E-mail pré-rempli avec le récapitulatif : le devis chiffré revient sous 24 h ouvrées.
      const entreprise = (fd.get('entreprise') || '').toString().trim();
      const site = (fd.get('site') || '').toString().trim();
      const corps = [
        'Bonjour,', '',
        'Voici mon projet, préparé sur mtx-developpement.fr. J’aimerais recevoir un devis :', '',
        ...lignes.map((l) => `- ${l.label}${l.inclus ? ' (inclus)' : ''}`),
        `- ${suivi}`,
        `Délai indicatif : ${delai}`, '',
        `Entreprise et secteur : ${entreprise}`,
        mode === 'refonte' ? `Site actuel : ${site}` : '',
        '', 'Ce que le site doit permettre (présenter, prendre des rendez-vous, vendre…) :', '', '',
        'Échéance souhaitée :', '', '',
      ].filter((l, i, a) => !(l === '' && a[i - 1] === '' && a[i - 2] === ''));
      const sujet = `Devis site internet${entreprise ? ' · ' + entreprise : ''} (${plan.nom}, ${mode === 'refonte' ? 'refonte' : 'création'})`;
      out('mail').href = `mailto:${EMAIL}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps.join('\n'))}`;
    };

    // L’adresse garde le mode et la formule choisis : un lien copié rouvre la même demande de départ.
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

    // Les boutons « Choisir » des formules présélectionnent la formule dans la demande.
    $$('[data-choisir]').forEach((a) => a.addEventListener('click', () => {
      const radio = $(`input[name="formule"][value="${a.dataset.choisir}"]`, form);
      if (radio) radio.checked = true;
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
