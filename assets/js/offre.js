/* MTX Studio — page « Sites internet pour entreprises » (JavaScript sans dépendance).
   1. Démo du héros : un même mini-site, rendu dans le navigateur et dans le téléphone, change de secteur.
   2. Comparateur avant / après de la refonte.
   3. Simulateur de devis : lit les prix dans la page (cartes des formules et options), une seule source.
   4. Bouton flottant « Devis gratuit » sur mobile.
   Sans JavaScript : la démo montre le premier exemple, le comparateur reste à 50 %, le simulateur
   laisse place à un lien vers l'e-mail, et toutes les informations restent lisibles. */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const euros = (n) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.round(n));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const EMAIL = 'mtxstudio@proton.me';

  /* ---------------------------------------------------------------------
     1. Démo des secteurs
     --------------------------------------------------------------------- */
  // Entreprises fictives : la page le dit sous la démo.
  const SECTEURS = {
    artisan: {
      domaine: 'atelier-morel.fr', nom: 'Atelier Morel', liens: ['Réalisations', 'Savoir-faire', 'Devis'],
      tag: 'Menuiserie sur mesure · Lyon', titre: 'Des meubles faits pour durer.',
      texte: 'Cuisines, dressings et escaliers dessinés pour votre intérieur.', bouton: 'Demander un devis',
      cartes: [['Cuisines', 'Chêne massif'], ['Dressings', 'Sur mesure'], ['Escaliers', 'Pose comprise']],
      vars: { bg: '#f5efe6', ink: '#2b1d12', accent: '#a4522b', font: 'Georgia, "Times New Roman", serif', w: '400',
        v1: '#d9b48f', v2: '#f4dcc0', v3: '#8a5a3b', card: 'linear-gradient(140deg,#c79c74,#7e5236)' },
    },
    restaurant: {
      domaine: 'le-comptoir-nantes.fr', nom: 'Le Comptoir', liens: ['La carte', 'Le midi', 'Réserver'],
      tag: 'Bistrot de quartier · Nantes', titre: 'Cuisine du marché, midi et soir.',
      texte: 'Une ardoise qui change chaque semaine, des vins de petits producteurs.', bouton: 'Réserver une table',
      cartes: [['Entrées', 'dès 8 €'], ['Plats', 'dès 17 €'], ['Desserts', 'dès 7 €']],
      vars: { bg: '#17130f', ink: '#f8f1e7', accent: '#e0703a', accent2: '#e0703a', font: 'Georgia, "Times New Roman", serif', w: '400',
        v1: '#5a2e1a', v2: '#f0a35e', v3: '#1f1410', card: 'linear-gradient(140deg,#7a3b1f,#2a1810)' },
    },
    cabinet: {
      domaine: 'durand-associes-avocats.fr', nom: 'Durand & Associés', liens: ['Expertises', 'Équipe', 'Rendez-vous'],
      tag: 'Avocats en droit des affaires · Paris', titre: 'Vos décisions, sécurisées.',
      texte: 'Création de société, contrats, contentieux : un avocat dédié à votre dossier.', bouton: 'Prendre rendez-vous',
      cartes: [['Sociétés', 'Création, cession'], ['Contrats', 'Rédaction, audit'], ['Contentieux', 'Négociation']],
      vars: { bg: '#ffffff', ink: '#0f1b33', accent: '#1d3a8a', font: 'system-ui, -apple-system, "Helvetica Neue", sans-serif', w: '600', rb: '0.35em',
        v1: '#c9d4ea', v2: '#ffffff', v3: '#1d3a8a', card: 'linear-gradient(140deg,#dbe3f3,#9fb1d8)' },
    },
    boutique: {
      domaine: 'maison-lune.fr', nom: 'Maison Lune', liens: ['Collection', 'Atelier', 'Panier (2)'],
      tag: 'Céramiques faites main', titre: 'La nouvelle collection d’hiver.',
      texte: 'Pièces uniques tournées à l’atelier, livrées en 48 h.', bouton: 'Voir la boutique',
      cartes: [['Tasse Nuage', '24 €'], ['Bol Galet', '32 €'], ['Vase Dune', '58 €']],
      vars: { bg: '#fbf3ef', ink: '#3b2430', accent: '#9b4d6c', font: '"Helvetica Neue", Helvetica, Arial, sans-serif', w: '500',
        v1: '#efc9c0', v2: '#fff6f2', v3: '#b98a9c', card: 'linear-gradient(140deg,#f1d3cb,#c99aa9)' },
    },
    startup: {
      domaine: 'nova-planning.io', nom: 'Nova', liens: ['Produit', 'Tarifs', 'Essai gratuit'],
      tag: 'Logiciel de planning d’équipe', titre: 'Planifiez vos équipes en cinq minutes.',
      texte: 'Plannings, absences et heures sup au même endroit. Sans tableur.', bouton: 'Essayer gratuitement',
      cartes: [['Planning', 'Glisser-déposer'], ['Absences', 'Validées en 1 clic'], ['Export paie', 'Automatique']],
      vars: { bg: '#0b1020', ink: '#eef2ff', accent: '#5b7cfa', accent2: '#9db0ff', font: 'system-ui, -apple-system, "Helvetica Neue", sans-serif', w: '700', rb: '0.6em',
        v1: '#24346e', v2: '#8aa2ff', v3: '#121a3a', card: 'linear-gradient(140deg,#2a3b80,#141c40)' },
    },
  };

  const rendreSite = (s) => {
    const v = s.vars;
    const style = [
      `--ms-bg:${v.bg}`, `--ms-ink:${v.ink}`, `--ms-accent:${v.accent}`, `--ms-font:${v.font}`, `--ms-w:${v.w}`,
      `--ms-v1:${v.v1}`, `--ms-v2:${v.v2}`, `--ms-v3:${v.v3}`, `--ms-card:${v.card}`,
      v.accent2 ? `--ms-accent2:${v.accent2}` : '', v.rb ? `--ms-rb:${v.rb}` : '',
    ].filter(Boolean).join(';');
    return `<div class="ms" style='${style}'>`
      + `<div class="ms-nav"><span class="ms-logo">${esc(s.nom)}</span><span class="ms-links">${s.liens.map((l) => `<span>${esc(l)}</span>`).join('')}</span><span class="ms-burger"></span></div>`
      + `<div class="ms-hero"><div><span class="ms-tag">${esc(s.tag)}</span><span class="ms-h">${esc(s.titre)}</span><span class="ms-p">${esc(s.texte)}</span><span class="ms-btn">${esc(s.bouton)}</span></div><div class="ms-visual"></div></div>`
      + `<div class="ms-cards">${s.cartes.map(([t, d]) => `<span class="ms-card"><i></i><b>${esc(t)}</b><small>${esc(d)}</small></span>`).join('')}</div>`
      + '</div>';
  };

  const stage = $('[data-demo]');
  if (stage) {
    const tabs = $$('[data-sector]', stage);
    const cibles = $$('[data-ms]', stage);
    const url = $('[data-url]', stage);
    const panel = $('[data-demo-panel]', stage);
    const DUREE = 4800;
    let actuel = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
    if (actuel < 0) actuel = 0;
    let auto = !reduceMotion;
    let minuteur = 0;
    let visible = true;

    const afficher = (i, focus = false) => {
      actuel = (i + tabs.length) % tabs.length;
      const tab = tabs[actuel];
      const s = SECTEURS[tab.dataset.sector];
      if (!s) return;
      tabs.forEach((t, k) => {
        const sel = k === actuel;
        t.setAttribute('aria-selected', String(sel));
        t.tabIndex = sel ? 0 : -1;
      });
      if (focus) tab.focus();
      panel.setAttribute('aria-labelledby', tab.id);
      const html = rendreSite(s);
      const poser = () => {
        cibles.forEach((c) => { c.innerHTML = html; });
        if (url) url.textContent = s.domaine;
        if (!reduceMotion) {
          cibles.forEach((c) => { const ms = c.firstElementChild; ms.classList.add('is-out'); void ms.offsetWidth; ms.classList.remove('is-out'); });
        }
      };
      const vieux = cibles.map((c) => c.firstElementChild).filter(Boolean);
      if (vieux.length && !reduceMotion) {
        vieux.forEach((ms) => ms.classList.add('is-out'));
        window.setTimeout(poser, 220);
      } else poser();
      // Relance la barre de progression de l'onglet choisi.
      if (auto) { stage.classList.remove('is-auto'); void stage.offsetWidth; stage.classList.add('is-auto'); }
    };

    const planifier = () => {
      window.clearTimeout(minuteur);
      if (!auto || !visible || document.hidden) { stage.classList.remove('is-auto'); return; }
      stage.classList.add('is-auto');
      minuteur = window.setTimeout(() => { afficher(actuel + 1); planifier(); }, DUREE);
    };
    const arreter = () => { auto = false; window.clearTimeout(minuteur); stage.classList.remove('is-auto'); };

    stage.style.setProperty('--o-auto', DUREE + 'ms');
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => { arreter(); afficher(i); });
      tab.addEventListener('keydown', (e) => {
        const pas = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (pas) { e.preventDefault(); arreter(); afficher(actuel + pas, true); }
        else if (e.key === 'Home') { e.preventDefault(); arreter(); afficher(0, true); }
        else if (e.key === 'End') { e.preventDefault(); arreter(); afficher(tabs.length - 1, true); }
      });
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        entries.forEach((en) => { visible = en.isIntersecting; planifier(); });
      }).observe(stage);
    }
    document.addEventListener('visibilitychange', planifier);
    afficher(actuel);
    planifier();
  }

  /* ---------------------------------------------------------------------
     2. Comparateur avant / après
     --------------------------------------------------------------------- */
  $$('[data-ba]').forEach((ba) => {
    const range = $('input[type="range"]', ba);
    if (!range) return;
    const poser = () => {
      ba.style.setProperty('--pos', range.value + '%');
      range.setAttribute('aria-valuetext', `${range.value} % de l’ancien site visible`);
    };
    range.addEventListener('input', poser);
    poser();
    // Petit aller-retour quand le comparateur apparaît, pour montrer qu'il se manipule.
    if (!reduceMotion && 'IntersectionObserver' in window) {
      let touche = false;
      range.addEventListener('pointerdown', () => { touche = true; }, { once: true });
      range.addEventListener('keydown', () => { touche = true; }, { once: true });
      const io = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        const etapes = [50, 68, 30, 50];
        let k = 0;
        const suivant = () => {
          if (touche || k >= etapes.length - 1) return;
          const de = etapes[k], a = etapes[k + 1], t0 = performance.now(), d = 700;
          const pas = (t) => {
            if (touche) return;
            const p = Math.min(1, (t - t0) / d);
            const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
            range.value = String(Math.round(de + (a - de) * e));
            poser();
            if (p < 1) requestAnimationFrame(pas); else { k += 1; window.setTimeout(suivant, 120); }
          };
          requestAnimationFrame(pas);
        };
        window.setTimeout(suivant, 400);
      }, { threshold: 0.6 });
      io.observe(ba);
    }
  });

  /* ---------------------------------------------------------------------
     3. Simulateur de devis
     --------------------------------------------------------------------- */
  const form = $('[data-est]');
  if (form) {
    const sortie = $('[data-est-sum]');
    const out = (k) => $(`[data-out="${k}"]`, sortie);
    const plans = $$('[data-plan]').reduce((acc, el) => {
      acc[el.dataset.plan] = {
        nom: el.dataset.nom,
        creation: +el.dataset.creation,
        refonte: +el.dataset.refonte,
        delai: el.dataset.delai,
        delaiExpress: el.dataset.delaiExpress,
      };
      return acc;
    }, {});
    const PAGE = +form.dataset.prixPage;
    const MAX_PAGES = 30;
    const pagesInput = $('[data-pages]', form);
    const moins = $('[data-pages-moins]', form);
    const plus = $('[data-pages-plus]', form);
    const champSite = $('[data-champ-site]', form);

    // Prix affichés dans les choix de formule, selon création / refonte.
    const majChoixFormules = (mode) => {
      $$('[data-formule-prix]', form).forEach((em) => {
        const p = plans[em.dataset.formulePrix];
        if (!p) return;
        const prefixe = em.dataset.formulePrix === 'boutique' ? 'dès ' : '';
        em.textContent = `${prefixe}${euros(p[mode])} €`;
      });
    };

    const calculer = () => {
      const fd = new FormData(form);
      const mode = fd.get('mode') === 'refonte' ? 'refonte' : 'creation';
      const formule = plans[fd.get('formule')] ? fd.get('formule') : Object.keys(plans)[0];
      const plan = plans[formule];
      let pages = Math.max(0, Math.min(MAX_PAGES, parseInt(pagesInput.value, 10) || 0));
      pagesInput.value = String(pages);
      moins.disabled = pages <= 0;
      plus.disabled = pages >= MAX_PAGES;

      majChoixFormules(mode);
      if (champSite) champSite.hidden = mode !== 'refonte';

      const lignes = [{ label: `${plan.nom} · ${mode === 'refonte' ? 'refonte' : 'création'}`, prix: plan[mode] }];
      if (pages) lignes.push({ label: `${pages} page${pages > 1 ? 's' : ''} en plus`, prix: pages * PAGE });

      let express = false;
      $$('[data-option]', form).forEach((cb) => {
        const inclus = (cb.dataset.inclus || '').split(' ').includes(formule);
        const reserve = cb.dataset.seulement && !cb.dataset.seulement.split(' ').includes(formule);
        cb.disabled = inclus || !!reserve;
        const label = cb.closest('.o-choice');
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

      const maint = $(`input[name="maintenance"]:checked`, form);
      const mensuel = maint ? +maint.dataset.prixMois : 0;

      // Échéancier : 30 % à la commande, 40 % à la maquette, le solde à la mise en ligne.
      const a1 = Math.round(total * 0.3), a2 = Math.round(total * 0.4), a3 = total - a1 - a2;

      out('total').textContent = euros(total);
      const mini = $('[data-mini-total]', form);
      if (mini) mini.textContent = euros(total);
      out('mois').textContent = mensuel ? `+ ${maint.dataset.nom} : ${euros(mensuel)} € par mois, sans engagement` : 'Sans maintenance : le site vous appartient, vous en faites ce que vous voulez.';
      out('lignes').innerHTML = lignes.map((l) => `<li${l.inclus ? ' class="is-free"' : ''}><span>${esc(l.label)}</span><span>${l.inclus ? 'inclus' : euros(l.prix) + ' €'}</span></li>`).join('');
      out('echeances').textContent = `${euros(a1)} · ${euros(a2)} · ${euros(a3)} €`;
      out('delai').textContent = express ? plan.delaiExpress : plan.delai;

      // E-mail pré-rempli avec le récapitulatif.
      const entreprise = (fd.get('entreprise') || '').toString().trim();
      const site = (fd.get('site') || '').toString().trim();
      const corps = [
        'Bonjour Matheo,', '',
        'Voici l’estimation faite sur votre site, j’aimerais un devis :', '',
        ...lignes.map((l) => `- ${l.label} : ${l.inclus ? 'inclus' : euros(l.prix) + ' €'}`),
        `Total estimé : ${euros(total)} €`,
        mensuel ? `Maintenance : ${maint.dataset.nom}, ${euros(mensuel)} € par mois` : 'Maintenance : aucune pour l’instant',
        `Délai indicatif : ${express ? plan.delaiExpress : plan.delai}`, '',
        `Entreprise et secteur : ${entreprise}`,
        mode === 'refonte' ? `Site actuel : ${site}` : '',
        '', 'Ce que le site doit permettre (présenter, prendre des rendez-vous, vendre…) :', '', '',
        'Échéance souhaitée :', '', '',
      ].filter((l, i, a) => !(l === '' && a[i - 1] === '' && a[i - 2] === ''));
      const sujet = `Devis site internet${entreprise ? ' · ' + entreprise : ''} (${plan.nom}, ${euros(total)} €)`;
      out('mail').href = `mailto:${EMAIL}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps.join('\n'))}`;
    };

    moins.addEventListener('click', () => { pagesInput.value = String((+pagesInput.value || 0) - 1); calculer(); });
    plus.addEventListener('click', () => { pagesInput.value = String((+pagesInput.value || 0) + 1); calculer(); });
    form.addEventListener('input', calculer);
    form.addEventListener('change', calculer);
    form.addEventListener('submit', (e) => e.preventDefault());

    // Les boutons « Choisir » des formules présélectionnent la formule dans le simulateur.
    $$('[data-choisir]').forEach((a) => a.addEventListener('click', () => {
      const radio = $(`input[name="formule"][value="${a.dataset.choisir}"]`, form);
      if (radio) { radio.checked = true; calculer(); }
    }));
    // Les liens « Refonte » présélectionnent le mode refonte.
    $$('[data-mode-refonte]').forEach((a) => a.addEventListener('click', () => {
      const radio = $('input[name="mode"][value="refonte"]', form);
      if (radio) { radio.checked = true; calculer(); }
    }));
    calculer();
  }

  /* ---------------------------------------------------------------------
     4. Bouton flottant sur mobile : visible après le héros, caché près
        du simulateur et du contact (qui ont déjà leurs boutons).
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
    new IntersectionObserver(([en]) => { apresHero = !en.isIntersecting && en.boundingClientRect.top < 0; maj(); }).observe(hero);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => (en.isIntersecting ? proches.add(en.target) : proches.delete(en.target)));
      maj();
    });
    masques.forEach((m) => io.observe(m));
    maj();
  }
})();
