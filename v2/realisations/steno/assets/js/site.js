// Sténo — interactions du site. Sans dépendance ; la page reste lisible sans ce script.
(() => {
  const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
  const horloge = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const visible = (el, fn, marge = '0px') => {
    if (!('IntersectionObserver' in window)) { fn(); return; }
    const io = new IntersectionObserver((e) => { if (e.some((x) => x.isIntersecting)) { io.disconnect(); fn(); } }, { rootMargin: marge });
    io.observe(el);
  };

  // ---------- La page est un mémo : l'onde de la barre et la tête de lecture suivent le défilement ----------
  const onde = $('[data-onde]');
  const teteTemps = $('[data-tete-temps]');
  const sections = $$('[data-code]').map((el) => {
    const [m, s] = el.dataset.code.split(':').map(Number);
    return { el, t: m * 60 + s };
  });
  const FIN = 112; // 1:52, la durée du « mémo » qu'est la page
  let barres = [];
  if (onde) {
    let graine = 11;
    const alea = () => (graine = (graine * 16807) % 2147483647) / 2147483647;
    const total = innerWidth < 600 ? 44 : 84;
    for (let i = 0; i < total; i += 1) {
      const b = document.createElement('i');
      const h = Math.min(1, 0.18 + Math.abs(Math.sin(i * 0.37) * 0.55 + Math.sin(i * 0.11) * 0.2) + alea() * 0.35);
      b.style.setProperty('--h', h.toFixed(2));
      onde.append(b);
    }
    barres = [...onde.children];
  }
  let lues = -1, demande = 0;
  const lecture = () => {
    demande = 0;
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    const n = Math.round(p * barres.length);
    if (n !== lues) {
      const [a, b] = n > lues ? [Math.max(0, lues), n] : [n, lues];
      for (let i = a; i < b; i += 1) barres[i]?.classList.toggle('lu', i < n);
      lues = n;
    }
    if (teteTemps && sections.length) {
      // Le temps affiché est interpolé entre les repères des sections, lus au milieu de l'écran.
      const y = scrollY + innerHeight / 2;
      let t = 0;
      for (let i = 0; i < sections.length; i += 1) {
        const haut = sections[i].el.getBoundingClientRect().top + scrollY;
        const suivant = sections[i + 1];
        const bas = suivant ? suivant.el.getBoundingClientRect().top + scrollY : document.documentElement.scrollHeight;
        if (y >= haut) t = sections[i].t + ((suivant ? suivant.t : FIN) - sections[i].t) * Math.min(1, (y - haut) / Math.max(1, bas - haut));
      }
      teteTemps.textContent = horloge(t);
    }
  };
  const demander = () => { if (!demande) demande = requestAnimationFrame(lecture); };
  addEventListener('scroll', demander, { passive: true });
  addEventListener('resize', demander);
  lecture();

  // Lien de la section en cours.
  const liens = new Map($$('.nav-liens a').map((a) => [a.getAttribute('href').slice(1), a]));
  if ('IntersectionObserver' in window && liens.size) {
    const io = new IntersectionObserver((entrees) => {
      entrees.forEach((e) => {
        if (!e.isIntersecting) return;
        liens.forEach((a) => a.removeAttribute('aria-current'));
        liens.get(e.target.id)?.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(({ el }) => io.observe(el));
  }

  // ---------- Apparition des titres et des blocs ----------
  const aReveler = $$('[data-apparait]');
  aReveler.forEach((el) => {
    if (el.tagName === 'LI') el.style.setProperty('--rang', [...el.parentElement.children].indexOf(el));
  });
  if ('IntersectionObserver' in window && !calme) {
    const io = new IntersectionObserver((entrees) => {
      entrees.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('vu'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -12% 0px' });
    aReveler.forEach((el) => io.observe(el));
  } else aReveler.forEach((el) => el.classList.add('vu'));

  // ---------- Les films : lecture à l'écran, chapitres, thème ----------
  // Chaque film existe en clair et en sombre, en AV1 et en H.264. Il ne se charge qu'à l'approche de l'écran, ne
  // tourne que visible, et suit le thème de la page sans perdre sa place.
  const racine = document.documentElement;
  const AV1 = (() => { try { return document.createElement('video').canPlayType('video/mp4; codecs="av01.0.08M.08"') === 'probably'; } catch { return false; } })();
  const econome = Boolean(navigator.connection && navigator.connection.saveData);
  const films = new Map();
  $$('[data-film]').forEach((fig) => {
    const video = $('video', fig);
    const nom = fig.dataset.film;
    const zone = fig.closest('[data-film-zone]') || fig;
    const debuts = (fig.dataset.chapitres || '0').split(' ').map(Number);
    const arrets = (fig.dataset.arrets || '0').split(' ').map(Number);
    const duree = Number(fig.dataset.duree);
    const bouton = $('[data-film-jouer]', fig);
    const boutons = $$('[data-film-aller]', fig);
    const ecoutes = [];
    // voulu : la lecture est souhaitée (jamais d'office en mouvement réduit ou en mode économie de données).
    let voulu = !calme && !econome, aLEcran = false, charge = false, boucle = -1, chapitre = -1, image = 0, depart = 0;

    const fichier = (ext) => `assets/films/${nom}-${racine.dataset.theme === 'dark' ? 'sombre' : 'clair'}${ext}`;
    const charger = (a) => {
      charge = true;
      depart = a;
      // La source avant le préchargement : dans l'autre ordre, le navigateur entame le fichier inscrit dans le HTML.
      video.src = fichier(AV1 ? '.av1.mp4' : '.mp4') + (a > 0 ? `#t=${a.toFixed(2)}` : '');
      video.preload = 'auto';
    };
    // Le fragment #t ne suffit pas partout (serveur sans requêtes partielles) : la tête de lecture est replacée.
    video.addEventListener('loadedmetadata', () => {
      if (depart > 0 && Math.abs(video.currentTime - depart) > 0.25) video.currentTime = depart;
      depart = 0;
    });
    const fin = (i) => (i + 1 < debuts.length ? debuts[i + 1] : duree);
    const suivre = () => {
      image = 0;
      // Tant que le fichier n'est pas ouvert, l'instant demandé fait foi : le bon chapitre s'allume tout de suite.
      const t = depart > 0 ? depart : video.currentTime;
      // Un chapitre choisi tourne en boucle.
      if (boucle >= 0 && !video.seeking && !video.paused && (t >= fin(boucle) - 0.05 || t < debuts[boucle] - 0.1)) video.currentTime = debuts[boucle];
      let i = debuts.length - 1;
      while (i > 0 && t < debuts[i]) i -= 1;
      if (boucle >= 0) i = boucle;
      if (i !== chapitre) {
        chapitre = i;
        boutons.forEach((b, n) => { if (n === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
        ecoutes.forEach((fn) => fn(i));
      }
      zone.style.setProperty('--p', Math.min(1, Math.max(0, (t - debuts[i]) / (fin(i) - debuts[i]))).toFixed(3));
      if (!video.paused && !video.ended) image = requestAnimationFrame(suivre);
    };
    const appliquer = () => {
      if (voulu && aLEcran) {
        if (!charge) charger(0);
        const promesse = video.play();
        if (promesse) promesse.catch(() => {});
      } else if (charge) video.pause();
      fig.toggleAttribute('data-pause', !voulu);
      if (bouton) bouton.setAttribute('aria-label', voulu ? 'Mettre le film en pause' : 'Lire le film');
    };
    const aller = (i, { enBoucle = false } = {}) => {
      // En mouvement réduit, tant que la lecture n'a pas été demandée : une image arrêtée du chapitre.
      const fige = calme && !voulu;
      boucle = enBoucle && !fige ? i : -1;
      const t = debuts[i] + (fige ? arrets[Math.min(i, arrets.length - 1)] : 0);
      if (!fige) voulu = true;
      if (!charge || fige || video.readyState === 0) charger(t); else video.currentTime = t;
      appliquer();
      suivre();
    };

    video.removeAttribute('controls');
    video.poster = fichier('.webp');
    video.addEventListener('play', () => { if (!image) image = requestAnimationFrame(suivre); });
    video.addEventListener('seeked', () => { if (!image) suivre(); });
    video.addEventListener('loadeddata', () => { if (!image) suivre(); });
    if (bouton) bouton.addEventListener('click', () => { voulu = !voulu; appliquer(); });
    boutons.forEach((b, i) => b.addEventListener('click', () => aller(i)));
    if (boutons[0]) boutons[0].setAttribute('aria-current', 'true');

    if ('IntersectionObserver' in window) {
      new IntersectionObserver((e) => { aLEcran = e[e.length - 1].isIntersecting; appliquer(); }, { threshold: 0.2 }).observe(fig);
    } else { aLEcran = true; appliquer(); }

    films.set(nom, {
      aller,
      surChapitre: (fn) => ecoutes.push(fn),
      // Le thème change : même film, même instant, autres couleurs.
      retheme() {
        video.poster = fichier('.webp');
        if (!charge) return;
        charger(video.readyState ? video.currentTime : depart);
        appliquer();
      },
    });
  });
  if (films.size) new MutationObserver(() => films.forEach((f) => f.retheme())).observe(racine, { attributes: true, attributeFilter: ['data-theme'] });

  // ---------- Le relevé : la phrase qui se range ----------
  const rel = $('[data-releve]');
  if (rel && window.StenoReleve) {
    const { analyser, morceaux, FAMILLES } = window.StenoReleve;
    const saisie = $('[data-rel-saisie]', rel);
    const fond = $('[data-rel-fond]', rel);
    const zone = $('[data-rel-familles]', rel);
    const total = $('[data-rel-total]', rel);
    const titre = $('[data-rel-titre]', rel);
    const mots = $('[data-rel-mots]', rel);
    const duree = $('[data-rel-duree]', rel);
    const onglets = $$('.rel-onglets [role="tab"]', rel);
    const legende = $$('[data-legende] button');
    const NOMS = {
      tache: 'Tâches', date: 'Dates', personne: 'Personnes', decision: 'Décisions', question: 'Questions ouvertes',
      idee: 'Idées', lieu: 'Lieux', organisation: 'Organisations', chiffre: 'Chiffres', coordonnee: 'Coordonnées',
    };
    const MEMOS = {
      chantier: { titre: 'Compte rendu réunion chantier', texte: saisie.value },
      idee: {
        titre: 'Idée d’application',
        texte: 'Idée en marchant. Et si on faisait une app qui scanne les tickets de caisse et qui range les garanties toute seule ? On pourrait prévenir l’utilisateur un mois avant la fin de la garantie. Ce serait bien de proposer un export pour l’assurance aussi. Il faudrait vérifier ce que fait la concurrence, je crois que Sophie en avait parlé chez Darty. Il faut que je note ça dans le tableau des projets ce soir. Demander à Thomas combien de temps prendrait un prototype. Combien les gens paieraient pour ça ? Peut-être 2 euros par mois. En parler à l’équipe lundi prochain.',
      },
      semaine: {
        titre: 'Plan pour la semaine prochaine',
        texte: 'Alors pour la semaine prochaine. Réserver le train pour Lyon, départ mardi matin. Appeler le dentiste pour déplacer le rendez-vous de jeudi. Acheter un cadeau pour l’anniversaire de Léa, c’est samedi. Envoyer la facture à Monsieur Bertrand avant mercredi, 1 850 euros. Il faut aussi renouveler l’assurance de la voiture avant la fin du mois. Marie doit me renvoyer le contrat signé. Et ne pas oublier de préparer la présentation pour le client, rendez-vous vendredi à 14h30 à Paris.',
      },
      libre: { titre: 'Votre mémo', texte: '' },
    };
    let memo = 'chantier';

    const el = (balise, classe, texte) => {
      const n = document.createElement(balise);
      if (classe) n.className = classe;
      if (texte != null) n.textContent = texte;
      return n;
    };
    const initiales = (nom) => nom.replace(/^(Monsieur|Madame|Docteur|Maître)\s/, '').split(/[\s-]+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();

    const ligne = (fam, note, rang) => {
      const li = el('li');
      li.style.setProperty('--i', rang);
      const corps = el('span');
      if (fam === 'tache') li.append(el('span', 'fam-case'));
      else if (fam === 'personne') li.append(el('span', 'fam-mono', initiales(note.texte)));
      else li.append(el('span', 'fam-puce'));
      corps.append(note.texte);
      if (note.detail) corps.append(el('span', 'detail', note.detail));
      const puces = el('small');
      if (note.date) puces.append(el('span', 'puce puce-date', note.date));
      if (note.qui) puces.append(el('span', 'puce puce-qui', note.qui));
      if (note.prioritaire) puces.append(el('span', 'puce puce-prio', 'Prioritaire'));
      if (puces.childNodes.length) corps.append(puces);
      li.append(corps);
      return li;
    };

    const rendre = (frais) => {
      const texte = saisie.value;
      const r = analyser(texte);

      // La feuille : le même texte, avec ses mots relevés.
      fond.textContent = '';
      let i = 0;
      for (const m of morceaux(texte, r.marques)) {
        if (!m.fams.length) { fond.append(m.texte); continue; }
        const s = el('span', 'm ' + m.fams.map((f) => 'm-' + f).join(' '), m.texte);
        s.style.setProperty('--i', i);
        i += 1;
        fond.append(s);
      }
      fond.append('​');
      fond.classList.remove('frais');
      if (frais) { void fond.offsetWidth; fond.classList.add('frais'); }

      // Les notes, famille par famille.
      zone.textContent = '';
      let rang = 0;
      for (const fam of FAMILLES) {
        const notes = r.notes[fam];
        if (!notes.length) continue;
        const bloc = el('section', 'fam f-' + fam);
        const tete = el('p', 'fam-tete');
        tete.innerHTML = `<svg aria-hidden="true"><use href="#f-${fam}"/></svg>`;
        tete.append(NOMS[fam], el('i', '', String(notes.length)));
        const liste = el('ul');
        notes.forEach((note) => { liste.append(ligne(fam, note, frais ? rang : 0)); rang += 1; });
        bloc.append(tete, liste);
        zone.append(bloc);
      }
      if (!r.total) zone.append(el('p', 'rel-vide', texte.trim() ? 'Rien à relever dans cette phrase. Essayez avec un prénom, une date ou une chose à faire.' : 'Écrivez une phrase : les éléments relevés se rangent ici.'));

      const nombre = (texte.trim().match(/\S+/g) || []).length;
      total.textContent = r.total;
      mots.textContent = `${nombre} mot${nombre > 1 ? 's' : ''}`;
      duree.textContent = horloge(nombre / 2.7);
      titre.textContent = MEMOS[memo].titre;
      legende.forEach((b) => { b.style.opacity = r.notes[b.dataset.fam].length ? '' : '.4'; });
    };

    const choisir = (id, focus) => {
      memo = id;
      onglets.forEach((o) => { const ici = o.dataset.memo === id; o.setAttribute('aria-selected', ici); o.tabIndex = ici ? 0 : -1; });
      saisie.value = MEMOS[id].texte;
      rendre(true);
      if (id === 'libre' && focus) saisie.focus({ preventScroll: true });
    };
    onglets.forEach((o, i) => {
      o.addEventListener('click', () => choisir(o.dataset.memo, true));
      o.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        const suivant = onglets[(i + (e.key === 'ArrowRight' ? 1 : onglets.length - 1)) % onglets.length];
        suivant.focus();
        choisir(suivant.dataset.memo, false);
      });
    });
    saisie.addEventListener('input', () => { MEMOS[memo].texte = saisie.value; rendre(false); });

    // La légende isole une famille, dans le texte et dans les notes.
    legende.forEach((b) => b.addEventListener('click', () => {
      const actif = b.getAttribute('aria-pressed') === 'true';
      legende.forEach((x) => x.setAttribute('aria-pressed', 'false'));
      if (actif) delete rel.dataset.filtre;
      else { b.setAttribute('aria-pressed', 'true'); rel.dataset.filtre = b.dataset.fam; }
    }));

    rendre(false);
    visible(rel, () => rendre(true), '0px 0px -25% 0px');
  }

  // ---------- Raccourcis : cinq façons d'envoyer un mémo, cinq chapitres d'un même film ----------
  const ges = $('[data-gestes]');
  const filmGestes = films.get('gestes');
  if (ges && filmGestes) {
    const choix = $$('[data-geste-choix]', ges);
    const scene = $('#ges-scene', ges);
    const marquer = (i) => choix.forEach((c, n) => {
      const ici = n === i;
      c.setAttribute('aria-selected', ici);
      c.tabIndex = ici ? 0 : -1;
      if (ici) scene.setAttribute('aria-labelledby', c.id);
    });
    // Le film avance : l'onglet suit. Un onglet choisi : son chapitre tourne en boucle.
    filmGestes.surChapitre(marquer);
    choix.forEach((c, i) => {
      c.addEventListener('click', () => { marquer(i); filmGestes.aller(i, { enBoucle: true }); });
      c.addEventListener('keydown', (e) => {
        if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(e.key)) return;
        e.preventDefault();
        const n = (i + (e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : choix.length - 1)) % choix.length;
        choix[n].focus();
        marquer(n);
        filmGestes.aller(n, { enBoucle: true });
      });
    });
  }

  // ---------- Assistant : la réponse s'écrit ----------
  const ecrire = async (cible, texte, encore) => {
    if (calme) { cible.textContent = texte; return; }
    cible.textContent = '';
    cible.classList.add('ecrit');
    const parts = texte.split(/(\s+)/);
    for (const part of parts) {
      if (!encore()) return;
      cible.append(part);
      if (part.trim()) await attendre(26 + Math.random() * 34);
    }
    cible.classList.remove('ecrit');
  };

  const interroger = $('[data-interroger]');
  if (interroger) {
    const question = $('[data-fil-question]', interroger);
    const reponse = $('[data-fil-reponse]', interroger);
    const boutons = $$('[data-question]', interroger);
    const REPONSES = {
      dates: '– Plan corrigé à envoyer à Claire : avant vendredi\n– Commander les fenêtres : cette semaine\n– Rappeler la banque : demain à 10 h\n– Prochaine réunion de chantier : 24 novembre à 9 h, à Montpellier',
      qui: 'Vous : envoyer le plan corrigé à Claire avant vendredi, et rappeler la banque demain à 10 h.\nJulien : commander les fenêtres cette semaine. C’est prioritaire, il y a six semaines de délai.',
      premier: 'Rappeler la banque demain à 10 h pour le déblocage des fonds. Ensuite, envoyer le plan corrigé à Claire avant vendredi.',
    };
    let tour = 0;
    reponse.style.whiteSpace = 'pre-line';
    boutons.forEach((b) => b.addEventListener('click', async () => {
      tour += 1;
      const t = tour;
      boutons.forEach((x) => x.setAttribute('aria-pressed', x === b));
      question.textContent = b.textContent;
      reponse.textContent = 'Sténo cherche…';
      if (!calme) await attendre(520);
      if (t === tour) ecrire(reponse, REPONSES[b.dataset.question], () => t === tour);
    }));
  }

  const rediger = $('[data-rediger]');
  if (rediger) {
    const feuille = $('[data-feuille]', rediger);
    const boutons = $$('[data-format]', rediger);
    const TEXTES = {
      rendu: feuille.textContent,
      mail: 'Objet : Suites de la réunion de chantier\n\nBonjour Claire, bonjour Julien,\n\nVoici ce que je retiens de ce matin. Nous gardons le parquet en chêne dans le salon et passons au carrelage dans l’entrée. Le devis de la cuisine est à 12 400 €, soit 8 % de plus que prévu.\n\nJe vous envoie le plan corrigé avant vendredi. Julien, peux-tu commander les fenêtres cette semaine ?\n\nProchaine réunion le 24 novembre à 9 h, sur place.\n\nBonne journée,',
      message: 'Réunion de chantier faite : parquet gardé au salon, carrelage dans l’entrée. Je t’envoie le plan corrigé avant vendredi. Prochaine réunion le 24 novembre à 9 h.',
      points: '– Parquet en chêne gardé dans le salon\n– Carrelage dans l’entrée\n– Devis de la cuisine : 12 400 €, 8 % de plus que prévu\n– Fenêtres à commander cette semaine (six semaines de délai)\n– Prochaine réunion le 24 novembre à 9 h, à Montpellier',
    };
    let tour = 0;
    boutons.forEach((b) => b.addEventListener('click', () => {
      tour += 1;
      const t = tour;
      boutons.forEach((x) => x.setAttribute('aria-pressed', x === b));
      ecrire(feuille, TEXTES[b.dataset.format], () => t === tour);
    }));
  }

  // ---------- Vie privée : le point parcourt le circuit sans jamais sortir ----------
  const circuit = $('[data-circuit]');
  if (circuit) {
    const pas = () => {
      const liste = $('.circuit-etapes', circuit);
      if (liste) circuit.style.setProperty('--pas', `${liste.getBoundingClientRect().width / 4}px`);
    };
    pas();
    addEventListener('resize', pas);
  }

  // ---------- Widget « À faire » ----------
  const widget = $('[data-widget]');
  if (widget) {
    const liste = $('[data-widget-liste]', widget);
    const compteur = $('[data-widget-compte]', widget);
    const vide = $('[data-widget-vide]', widget);
    const lignes = $$('li', liste);
    const restant = () => lignes.filter((l) => !l.classList.contains('fait')).length;
    const maj = () => { compteur.textContent = restant(); const fini = restant() === 0; vide.hidden = !fini; liste.hidden = fini; };
    lignes.forEach((li) => $('button', li).addEventListener('click', async () => {
      if (li.classList.contains('fait')) return;
      li.classList.add('fait');
      compteur.textContent = restant();
      await attendre(calme ? 0 : 620);
      li.classList.add('parti');
      await attendre(calme ? 0 : 460);
      maj();
    }));
    $('[data-widget-remettre]', widget).addEventListener('click', () => {
      lignes.forEach((l) => l.classList.remove('fait', 'parti'));
      maj();
      $('button', lignes[0]).focus();
    });
  }

  // ---------- Thèmes : le réglage de l'app, branché sur la page ----------
  const themes = $('[data-themes]');
  if (themes) {
    const systeme = matchMedia('(prefers-color-scheme: dark)');
    const boutons = $$('[data-theme-choix]', themes);
    const lire = () => { try { return localStorage.getItem('mtx-theme'); } catch { return null; } };
    const refleter = () => {
      const choix = lire();
      const actuel = choix === 'dark' || choix === 'light' ? choix : 'system';
      boutons.forEach((b) => { const ici = b.dataset.themeChoix === actuel; b.setAttribute('aria-checked', ici); b.tabIndex = ici ? 0 : -1; });
    };
    const appliquer = (choix) => {
      const theme = choix === 'system' ? (systeme.matches ? 'dark' : 'light') : choix;
      try { if (choix === 'system') localStorage.removeItem('mtx-theme'); else localStorage.setItem('mtx-theme', choix); } catch { /* stockage indisponible */ }
      const poser = () => {
        racine.dataset.theme = theme;
        const fond = getComputedStyle(document.body).backgroundColor;
        $$('meta[name="theme-color"]').forEach((m) => { m.content = fond; });
        refleter();
      };
      if (document.startViewTransition && !calme) document.startViewTransition(poser);
      else poser();
    };
    boutons.forEach((b, i) => {
      b.addEventListener('click', () => appliquer(b.dataset.themeChoix));
      b.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        const suivant = boutons[(i + (e.key === 'ArrowRight' ? 1 : boutons.length - 1)) % boutons.length];
        suivant.focus();
        appliquer(suivant.dataset.themeChoix);
      });
    });
    // Le bouton du bandeau change aussi le thème : la sélection suit.
    new MutationObserver(refleter).observe(racine, { attributes: true, attributeFilter: ['data-theme'] });
    refleter();
  }
})();
