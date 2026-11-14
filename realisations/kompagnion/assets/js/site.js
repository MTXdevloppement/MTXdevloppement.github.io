// Kompagnion — démos de la page. Sans dépendance.
// L'accueil à composer (Personnaliser : retirer, glisser, ajouter), la couleur d'accent, les espaces en onglets,
// la facture recalculée et le filtre par #tag. Sans JavaScript, tout reste lisible : widgets par défaut, volets
// les uns sous les autres, liste complète.
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const calme = matchMedia('(prefers-reduced-motion: reduce)');
  const lire = (cle) => { try { return localStorage.getItem(cle); } catch { return null; } };
  const ecrire = (cle, v) => { try { localStorage.setItem(cle, v); } catch { /* stockage indisponible */ } };

  /* Barre collante, section en cours, apparitions =============================================== */
  const barre = $('[data-barre]');
  if (barre) {
    const temoin = document.createElement('div');
    temoin.style.cssText = 'position:absolute;top:0;height:1px;width:1px';
    barre.before(temoin);
    new IntersectionObserver(([e]) => barre.toggleAttribute('data-colle', !e.isIntersecting)).observe(temoin);
    const liens = $$('.barre-nav a');
    const cibles = liens.map((a) => $(a.getAttribute('href'))).filter(Boolean);
    const io = new IntersectionObserver((entrees) => {
      for (const e of entrees) if (e.isIntersecting) {
        liens.forEach((a) => a.toggleAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id));
        liens.forEach((a) => { if (a.hasAttribute('aria-current')) a.setAttribute('aria-current', 'true'); });
      }
    }, { rootMargin: '-45% 0px -50% 0px' });
    cibles.forEach((c) => io.observe(c));
  }
  const apparait = new IntersectionObserver((entrees) => {
    for (const e of entrees) if (e.isIntersecting) { e.target.classList.add('vu'); apparait.unobserve(e.target); }
  }, { rootMargin: '0px 0px -8% 0px' });
  $$('[data-apparait]').forEach((el) => apparait.observe(el));

  /* Couleur d'accent ============================================================================== */
  const pastilles = $$('[data-accent]');
  const poserAccent = (nom) => {
    if (nom === 'violet') delete document.documentElement.dataset.accent;
    else document.documentElement.dataset.accent = nom;
    pastilles.forEach((p) => p.setAttribute('aria-pressed', String(p.dataset.accent === nom)));
  };
  poserAccent(document.documentElement.dataset.accent || 'violet');
  pastilles.forEach((p) => p.addEventListener('click', () => { poserAccent(p.dataset.accent); ecrire('kompagnion-accent', p.dataset.accent); annoncer(`Couleur d’accent : ${p.textContent.trim()}.`); }));

  const annonce = $('[data-annonce]');
  function annoncer(t) { if (annonce) { annonce.textContent = ''; requestAnimationFrame(() => { annonce.textContent = t; }); } }

  /* L'accueil à composer ============================================================================ */
  const atelier = $('[data-atelier]');
  if (atelier) {
    const grille = $('[data-widgets]', atelier);
    const ecran = $('[data-ecran]', atelier);
    const bouton = $('[data-personnaliser]', atelier);
    const libelleBouton = $('span', bouton);
    const titre = $('[data-ecran-titre]', atelier);
    const salut = $('[data-ecran-salut]', atelier);
    const aide = $('[data-ecran-aide]', atelier);
    const catalogue = $('[data-catalogue]', atelier);
    const listeCat = $('[data-catalogue-liste]', atelier);
    const nombreCat = $('[data-catalogue-nombre]', atelier);
    const date = $('[data-date]', atelier);
    if (date) date.textContent = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    const tous = $$('.w', grille);
    const parNom = new Map(tous.map((w) => [w.dataset.w, w]));
    // Descriptions des widgets, reprises de l'app (HomeWidgets.swift).
    const descriptions = {
      'projets': 'Le nombre de projets en cours.', 'demandes-ouvertes': 'Les demandes qui attendent une réponse.',
      'encaisser': 'Le total des factures envoyées, pas encore payées.', 'encaisse': 'Le total des factures payées cette année.',
      'facture-mois': 'Le total des factures émises ce mois-ci.', 'devis-attente': 'Le montant des devis envoyés, sans réponse.',
      'taches-restantes': 'Les tâches restantes sur vos projets ouverts.', 'clients': 'Le nombre de clients enregistrés.',
      'retard': 'Une alerte quand une facture dépasse son échéance.', 'a-traiter': 'Les demandes les plus urgentes, en un coup d’œil.',
      'echeances': 'Les projets dont l’échéance approche.', 'documents': 'Les derniers documents ajoutés.',
      'taches': 'Cochez vos prochaines tâches depuis l’accueil.', 'facturation': 'Un graphique de ce que vous avez facturé, mois par mois.',
      'favoris': 'Vos clients favoris, à portée de main.', 'tags': 'Vos # les plus utilisés.', 'raccourcis': 'Créer un client, un projet, un devis… en un tap.',
    };
    const nomDe = (w) => ($('.w-lib', w) || $('.w-titre', w) || $('b', w)).textContent.trim().replace(/^1 facture en retard$/, 'Factures en retard');
    const visibles = () => $$('.w:not([hidden])', grille);

    // Mise en page mémorisée (confort du visiteur, sur cet appareil seulement).
    const memoire = lire('kompagnion-accueil');
    if (memoire) {
      const noms = memoire.split(',').filter((n) => parNom.has(n));
      if (noms.length) {
        tous.forEach((w) => { w.hidden = !noms.includes(w.dataset.w); });
        noms.forEach((n) => grille.append(parNom.get(n)));
        tous.filter((w) => w.hidden).forEach((w) => grille.append(w));
      }
    }
    const memoriser = () => ecrire('kompagnion-accueil', visibles().map((w) => w.dataset.w).join(','));

    // Pastille − et accessibilité de chaque carte.
    for (const w of tous) {
      const moins = document.createElement('button');
      moins.type = 'button'; moins.className = 'w-retirer'; moins.hidden = true;
      moins.setAttribute('aria-label', `Retirer « ${nomDe(w)} »`);
      moins.innerHTML = '<svg aria-hidden="true"><use href="#i-moins"/></svg>';
      moins.addEventListener('click', (e) => { e.stopPropagation(); retirer(w); });
      w.prepend(moins);
    }

    // FLIP : les cartes glissent jusqu'à leur nouvelle place.
    const flip = (changer, sauf) => {
      const avant = new Map(visibles().map((w) => [w, w.getBoundingClientRect()]));
      changer();
      if (calme.matches) return;
      for (const w of visibles()) {
        if (w === sauf || !avant.has(w)) continue;
        const a = avant.get(w), b = w.getBoundingClientRect();
        const dx = a.left - b.left, dy = a.top - b.top;
        if (!dx && !dy) continue;
        w.style.transition = 'none';
        w.style.translate = `${dx}px ${dy}px`;
        requestAnimationFrame(() => requestAnimationFrame(() => {
          w.style.transition = 'translate .32s cubic-bezier(.2,.8,.2,1)';
          w.style.translate = '';
        }));
      }
    };

    let edition = false;
    const majCatalogue = () => {
      const caches = tous.filter((w) => w.hidden);
      listeCat.textContent = '';
      nombreCat.textContent = `· ${caches.length}`;
      if (!caches.length) {
        const li = document.createElement('li');
        li.className = 'catalogue-vide'; li.textContent = 'Tous les widgets sont sur l’accueil.';
        listeCat.append(li); return;
      }
      for (const w of caches) {
        const li = document.createElement('li');
        const b = document.createElement('button');
        b.type = 'button';
        b.style.setProperty('--c', w.style.getPropertyValue('--c'));
        const ic = $('.w-ic use', w) ? $('.w-ic use', w).getAttribute('href') : '#i-plus';
        b.innerHTML = `<span class="w-ic" style="--c:${w.style.getPropertyValue('--c')}"><svg aria-hidden="true"><use href="${icone(w) || ic}"/></svg></span><span><b></b><small></small></span><span class="catalogue-plus" aria-hidden="true"><svg><use href="#i-plus"/></svg></span>`;
        $('b', b).textContent = nomDe(w);
        $('small', b).textContent = descriptions[w.dataset.w] || '';
        b.setAttribute('aria-label', `Ajouter « ${nomDe(w)} »`);
        b.addEventListener('click', () => ajouter(w));
        li.append(b); listeCat.append(li);
      }
    };
    const icones = { 'a-traiter': '#i-recu', 'echeances': '#i-echeance', 'documents': '#i-docs', 'taches': '#i-coche', 'facturation': '#i-barres', 'favoris': '#i-etoile', 'tags': '#i-diese', 'raccourcis': '#i-eclair', 'retard': '#i-alerte' };
    function icone(w) { return icones[w.dataset.w]; }

    const basculer = (oui) => {
      edition = oui;
      grille.classList.toggle('edition', oui);
      bouton.setAttribute('aria-pressed', String(oui));
      libelleBouton.textContent = oui ? 'OK' : 'Personnaliser';
      titre.textContent = oui ? 'Personnaliser' : 'Mon entreprise';
      salut.firstChild.textContent = oui ? 'Vos widgets' : 'Bonjour';
      $('small', salut).hidden = oui;
      aide.hidden = !oui;
      catalogue.hidden = !oui;
      for (const w of tous) {
        $('.w-retirer', w).hidden = !oui;
        if (oui) { w.tabIndex = 0; w.setAttribute('aria-roledescription', 'widget déplaçable'); w.setAttribute('aria-label', `${nomDe(w)}. Flèches pour déplacer, Suppr pour retirer.`); }
        else { w.removeAttribute('tabindex'); w.removeAttribute('aria-roledescription'); w.removeAttribute('aria-label'); }
      }
      if (oui) majCatalogue();
      annoncer(oui ? 'Mode personnalisation : retirez, déplacez ou ajoutez des widgets.' : 'Accueil enregistré.');
      if (!oui) memoriser();
    };
    bouton.addEventListener('click', () => basculer(!edition));

    function retirer(w) {
      const suivant = visibles()[visibles().indexOf(w) + 1] || visibles()[visibles().indexOf(w) - 1];
      flip(() => { w.hidden = true; grille.append(w); }, w);
      majCatalogue(); memoriser();
      annoncer(`« ${nomDe(w)} » retiré.`);
      if (suivant && document.activeElement && !document.activeElement.isConnected) suivant.focus();
      if (suivant && document.activeElement === document.body) suivant.focus();
    }
    function ajouter(w) {
      flip(() => { w.hidden = false; const der = visibles().filter((x) => x !== w).pop(); if (der) der.after(w); });
      if (!calme.matches) { w.classList.remove('arrive'); void w.offsetWidth; w.classList.add('arrive'); }
      w.addEventListener('animationend', () => w.classList.remove('arrive'), { once: true });
      if (edition) { w.tabIndex = 0; $('.w-retirer', w).hidden = false; }
      majCatalogue(); memoriser();
      ecran.scrollTo({ top: w.offsetTop - 120, behavior: calme.matches ? 'auto' : 'smooth' });
      annoncer(`« ${nomDe(w)} » ajouté en bas de l’accueil.`);
    }
    const deplacer = (w, sens) => {
      const v = visibles(); const i = v.indexOf(w); const j = i + sens;
      if (j < 0 || j >= v.length) return;
      flip(() => { if (sens < 0) v[j].before(w); else v[j].after(w); });
      w.focus(); memoriser();
      annoncer(`« ${nomDe(w)} » en position ${j + 1} sur ${v.length}.`);
    };
    grille.addEventListener('keydown', (e) => {
      const w = e.target.closest('.w');
      if (!edition || !w || e.target !== w) return;
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); deplacer(w, -1); }
      else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); deplacer(w, 1); }
      else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); retirer(w); }
    });
    atelier.addEventListener('keydown', (e) => { if (e.key === 'Escape' && edition) { basculer(false); bouton.focus(); } });

    // Glisser une carte : elle suit le doigt, les autres s'écartent.
    let porte = null;
    grille.addEventListener('pointerdown', (e) => {
      const w = e.target.closest('.w');
      if (!edition || !w || e.target.closest('.w-retirer') || e.button > 0) return;
      const tactile = e.pointerType === 'touch';
      if (!tactile) e.preventDefault();
      try { w.setPointerCapture(e.pointerId); } catch { /* pointeur déjà relâché */ }
      const r = w.getBoundingClientRect();
      porte = { w, id: e.pointerId, dx: e.clientX - r.left, dy: e.clientY - r.top, x: e.clientX, y: e.clientY, bouge: false, pret: !tactile };
      // Au doigt, comme sur iOS : un appui maintenu soulève la carte ; un glissement rapide fait défiler l'écran.
      if (tactile) porte.minuterie = setTimeout(() => { if (porte) { porte.pret = true; w.classList.add('porte'); } }, 280);
    });
    grille.addEventListener('touchmove', (e) => { if (porte && porte.pret) e.preventDefault(); }, { passive: false });
    grille.addEventListener('pointermove', (e) => {
      if (!porte || e.pointerId !== porte.id) return;
      const { w } = porte;
      const ecart = Math.hypot(e.clientX - porte.x, e.clientY - porte.y);
      if (!porte.pret) { if (ecart > 8) { clearTimeout(porte.minuterie); porte = null; } return; }
      if (!porte.bouge && ecart < 4) return;
      if (!porte.bouge) { porte.bouge = true; w.classList.add('porte'); w.style.transition = 'none'; }
      // Défilement de l'écran quand la carte approche d'un bord.
      const re = ecran.getBoundingClientRect();
      if (e.clientY < re.top + 110) ecran.scrollTop -= 10; else if (e.clientY > re.bottom - 60) ecran.scrollTop += 10;
      const place = () => { w.style.translate = '0 0'; const r = w.getBoundingClientRect(); w.style.translate = `${e.clientX - porte.dx - r.left}px ${e.clientY - porte.dy - r.top}px`; };
      place();
      w.style.pointerEvents = 'none';
      const dessous = document.elementFromPoint(e.clientX, e.clientY);
      w.style.pointerEvents = '';
      const cible = dessous && dessous.closest('.w');
      if (cible && cible !== w && cible.parentNode === grille) {
        const v = visibles();
        const avant = v.indexOf(cible) < v.indexOf(w);
        flip(() => { if (avant) cible.before(w); else cible.after(w); }, w);
        place();
      }
    });
    const lacher = (e) => {
      if (!porte || e.pointerId !== porte.id) return;
      const { w, bouge } = porte;
      clearTimeout(porte.minuterie);
      porte = null;
      if (!bouge) { w.classList.remove('porte'); return; }
      w.classList.remove('porte');
      w.style.transition = calme.matches ? 'none' : 'translate .3s cubic-bezier(.2,.8,.2,1)';
      w.style.translate = '';
      memoriser();
      annoncer(`« ${nomDe(w)} » en position ${visibles().indexOf(w) + 1}.`);
    };
    grille.addEventListener('pointerup', lacher);
    grille.addEventListener('pointercancel', lacher);
  }

  /* Les quatre espaces ============================================================================== */
  const espaces = $('[data-espaces]');
  if (espaces) {
    const onglets = $$('[role="tab"]', espaces);
    const montrer = (o, focus) => {
      onglets.forEach((x) => {
        const oui = x === o;
        x.setAttribute('aria-selected', String(oui));
        x.tabIndex = oui ? 0 : -1;
        document.getElementById(x.getAttribute('aria-controls')).classList.toggle('actif', oui);
      });
      if (focus) o.focus();
    };
    montrer(onglets[0]);
    onglets.forEach((o, i) => {
      o.addEventListener('click', () => montrer(o));
      o.addEventListener('keydown', (e) => {
        const n = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (n) { e.preventDefault(); montrer(onglets[(i + n + onglets.length) % onglets.length], true); }
        if (e.key === 'Home') { e.preventDefault(); montrer(onglets[0], true); }
        if (e.key === 'End') { e.preventDefault(); montrer(onglets[onglets.length - 1], true); }
      });
    });
  }

  /* La facture ===================================================================================== */
  const facture = $('[data-facture]');
  if (facture) {
    const euros = (n) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/ /g, ' ') + ' €';
    const lignes = $$('[data-ligne]', facture);
    const pdfQte = $$('[data-pdf-qte]', facture), pdfLigne = $$('[data-pdf-ligne]', facture);
    const pulse = (el) => { if (calme.matches) return; el.classList.remove('maj'); void el.offsetWidth; el.classList.add('maj'); };
    const calculer = (touche) => {
      let ht = 0;
      lignes.forEach((l, i) => {
        const q = Number($('[data-qte]', l).value || $('[data-qte]', l).textContent);
        const t = q * Number(l.dataset.prix);
        ht += t;
        $('[data-total-ligne]', l).textContent = euros(t);
        pdfQte[i].textContent = q; pdfLigne[i].textContent = euros(t);
        if (touche === i) { pulse(pdfQte[i].parentNode); }
      });
      const taux = Number($('[data-tva]:checked', facture).value);
      const tva = ht * taux / 100;
      $('[data-ht]', facture).textContent = euros(ht);
      $('[data-ligne-tva]', facture).hidden = !taux;
      $('[data-montant-tva]', facture).textContent = euros(tva);
      $('[data-libelle-total]', facture).textContent = taux ? 'Total TTC' : 'Total';
      $('[data-ttc]', facture).textContent = euros(ht + tva);
      $('[data-pdf-libelle]', facture).textContent = taux ? 'Total TTC' : 'Total';
      $('[data-pdf-total]', facture).textContent = euros(ht + tva);
      $('[data-pdf-mention]', facture).hidden = Boolean(taux);
      if (touche === 'tva') pulse($('.feuille-total', facture));
    };
    lignes.forEach((l, i) => {
      const sortie = $('[data-qte]', l);
      sortie.value = sortie.textContent;
      const changer = (d) => { const q = Math.min(20, Math.max(1, Number(sortie.value) + d)); sortie.value = q; sortie.textContent = q; calculer(i); };
      $('[data-moins]', l).addEventListener('click', () => changer(-1));
      $('[data-plus]', l).addEventListener('click', () => changer(1));
    });
    $$('[data-tva]', facture).forEach((r) => r.addEventListener('change', () => calculer('tva')));
    calculer();
  }

  /* Le filtre par #tag ============================================================================= */
  const tri = $('[data-tri]');
  if (tri) {
    const champ = $('[data-tri-champ]', tri);
    const puces = $$('[data-tag]', tri);
    const elements = $$('[data-tri-liste] > li', tri);
    const compte = $('[data-tri-compte]', tri);
    const liste = $('[data-tri-liste]', tri);
    const vide = document.createElement('li');
    vide.className = 'tri-vide'; vide.textContent = 'Aucun résultat. Essayez #web ou #relance.'; vide.hidden = true;
    liste.append(vide);
    const normal = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const filtrer = () => {
      const q = normal(champ.value.trim());
      const tags = q.split(/\s+/).filter((m) => m.startsWith('#')).map((m) => m.slice(1)).filter(Boolean);
      const mots = q.split(/\s+/).filter((m) => m && !m.startsWith('#'));
      let n = 0;
      const avant = new Map(elements.filter((e) => !e.hidden).map((e) => [e, e.getBoundingClientRect().top]));
      for (const el of elements) {
        const sesTags = normal(el.dataset.tags).split(' ');
        const texte = normal(el.textContent);
        const ok = tags.every((t) => sesTags.some((s) => s.startsWith(t))) && mots.every((m) => texte.includes(m));
        el.hidden = !ok; if (ok) n += 1;
      }
      vide.hidden = n > 0;
      compte.textContent = n === elements.length ? `${n} éléments` : `${n} élément${n > 1 ? 's' : ''} sur ${elements.length}`;
      puces.forEach((p) => p.setAttribute('aria-pressed', String(tags.length === 1 && tags[0] === normal(p.dataset.tag))));
      if (!calme.matches) for (const el of elements) {
        if (el.hidden) continue;
        if (!avant.has(el) || Math.abs(avant.get(el) - el.getBoundingClientRect().top) > 240) { el.animate([{ opacity: 0, transform: 'scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'ease-out' }); continue; }
        const d = avant.get(el) - el.getBoundingClientRect().top;
        if (d) el.animate([{ transform: `translateY(${d}px)` }, { transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)' });
      }
    };
    champ.addEventListener('input', filtrer);
    puces.forEach((p) => {
      p.setAttribute('aria-pressed', 'false');
      p.addEventListener('click', () => {
        const actif = p.getAttribute('aria-pressed') === 'true';
        champ.value = actif ? '' : '#' + p.dataset.tag;
        filtrer();
      });
    });
  }
})();
