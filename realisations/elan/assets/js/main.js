(() => {
  'use strict';

  const sansBarreSafari = (fn) => {
    const tactile = matchMedia('(hover: none) and (pointer: coarse)').matches;
    let l = innerWidth, h = innerHeight;
    return (e) => {
      if (tactile && innerWidth === l && Math.abs(innerHeight - h) < 160) return;
      l = innerWidth; h = innerHeight; fn(e);
    };
  };

  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pointeurFin = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const mobile = matchMedia('(max-width: 900px)');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const borner = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
  const echapper = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const texte = (el, s) => { if (el && el.textContent !== s) el.textContent = s; };

  function parImage(fn) {
    let dernier = null, id = 0;
    const f = (e) => { dernier = e; if (!id) id = requestAnimationFrame(() => { id = 0; fn(dernier); }); };
    f.annuler = () => { if (id) cancelAnimationFrame(id); id = 0; };
    return f;
  }

  const apparition = new IntersectionObserver((entrees) => {
    for (const e of entrees) {
      if (!e.isIntersecting) continue;
      const el = e.target;
      el.classList.add('is-in');
      const delai = parseFloat(getComputedStyle(el).getPropertyValue('--d')) || 0;
      setTimeout(() => el.classList.add('is-done'), 1150 + delai * 1000);
      apparition.unobserve(el);
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  $$('[data-reveal]').forEach((el) => apparition.observe(el));

  const portee = new IntersectionObserver((entrees) => {
    for (const e of entrees) {
      e.target.classList.toggle('is-paused', !e.isIntersecting);
      e.target.dispatchEvent(new Event(e.isIntersecting ? 'portee:entree' : 'portee:sortie'));
    }
  }, { rootMargin: '60px 0px' });
  $$('[data-scope]').forEach((el) => portee.observe(el));

  function boucleScope(el, etape, intervalle) {
    let id = 0;
    const lancer = () => { if (!id) id = setInterval(etape, intervalle); };
    const arreter = () => { clearInterval(id); id = 0; };
    el.addEventListener('portee:entree', lancer);
    el.addEventListener('portee:sortie', arreter);
  }

  const CATS = {
    discipline: { nom: 'Discipline', theme: 'graphite', c: '#ff9f0a', mots: ['Focus', 'Agis', 'Cap', 'Rigueur', 'Méthode'] },
    confiance: { nom: 'Confiance', theme: 'aurore', c: '#ffc371', mots: ['Crois', 'Ose', 'Rayonne', 'Debout', 'Assume'] },
    perseverance: { nom: 'Persévérance', theme: 'foret', c: '#71b280', mots: ['Tiens', 'Avance', 'Continue', 'Patience', 'Encore'] },
    courage: { nom: 'Courage', theme: 'braise', c: '#f0703a', mots: ['Fonce', 'Saute', 'Affronte', 'Brave', 'Ose'] },
    serenite: { nom: 'Sérénité', theme: 'ocean', c: '#26d0ce', mots: ['Respire', 'Calme', 'Lâche', 'Souris', 'Paix'] },
    ambition: { nom: 'Ambition', theme: 'nuit', c: '#9d8cff', mots: ['Vise', 'Rêve', 'Bâtis', 'Grandis', 'Élève'] },
    sagesse: { nom: 'Sagesse', theme: 'dore', c: '#d4af37', mots: ['Apprends', 'Écoute', 'Médite', 'Pense', 'Choisis'] },
    personnelle: { nom: 'Mes phrases', theme: 'lavande', c: '#eaafc8', mots: ['Toi', 'Vis', 'Crée', 'Brille'] }
  };
  const BIBLIO = ['discipline', 'confiance', 'perseverance', 'courage', 'serenite', 'ambition', 'sagesse'];

  const B = 'rgba(255,255,255,';
  const THEMES = {
    automatique: { nom: 'Automatique' },
    aurore: { nom: 'Aurore', g: ['#FF5F6D', '#FFC371'], tx: '#fff', sec: B + '.78)', acc: '#fff' },
    nuit: { nom: 'Nuit', g: ['#0F0C29', '#302B63', '#24243E'], tx: '#fff', sec: B + '.65)', acc: '#9D8CFF' },
    ocean: { nom: 'Océan', g: ['#1A2980', '#26D0CE'], tx: '#fff', sec: B + '.75)', acc: '#B8FFF9' },
    foret: { nom: 'Forêt', g: ['#0F3B2E', '#2E7D5B', '#71B280'], tx: '#fff', sec: B + '.75)', acc: '#D7F5C4' },
    braise: { nom: 'Braise', g: ['#240B36', '#C31432', '#F0703A'], tx: '#fff', sec: B + '.75)', acc: '#FFD27A' },
    lavande: { nom: 'Lavande', g: ['#4B3A8C', '#9B6FBF', '#EAAFC8'], tx: '#fff', sec: B + '.8)', acc: '#FFE3F1' },
    dore: { nom: 'Or', g: ['#0D0D0D', '#1F1A10', '#3A2C12'], tx: '#F5E6C8', sec: 'rgba(212,175,55,.85)', acc: '#D4AF37' },
    papier: { nom: 'Papier', g: ['#F7F2E8', '#E9DFCC'], tx: '#2B2620', sec: 'rgba(43,38,32,.6)', acc: '#B5652B' },
    graphite: { nom: 'Graphite', g: ['#1C1C1E', '#2C2C2E'], tx: '#fff', sec: B + '.6)', acc: '#FF9F0A' }
  };
  const POLICES = {
    serif: { nom: 'Élégante', ff: 'var(--serif)' },
    standard: { nom: 'Standard', ff: 'var(--font)' },
    arrondie: { nom: 'Arrondie', ff: 'var(--round)' },
    mono: { nom: 'Machine', ff: 'var(--mono)' }
  };
  const RYTHMES = { quotidien: ['Chaque jour', 1], deuxParJour: ['Matin et soir', 2], horaire: ['Chaque heure', 24] };

  const BANQUE = {
    discipline: [
      ["La discipline, c'est choisir entre ce que tu veux maintenant et ce que tu veux le plus."], ['Fais-le même sans envie. Surtout sans envie.'],
      ["La motivation te fait démarrer. L'habitude te fait continuer."], ["Un petit effort chaque jour vaut mieux qu'un grand effort une fois par an."],
      ['Ce que tu répètes chaque jour finit par te construire.'], ['Gagne la matinée, et la journée suivra.'], ["Pas d'excuse aujourd'hui. Juste la prochaine étape."],
      ['Ton futur toi te remerciera pour ce que tu fais maintenant.'], ["La régularité bat le talent quand le talent n'est pas régulier."],
      ["Commence petit, mais commence aujourd'hui."], ["Fais d'abord ce qui compte, le reste attendra."], ["La constance transforme l'ordinaire en extraordinaire."],
      ['Une promesse tenue envers toi-même vaut plus que mille résolutions.'], ['Concentre-toi sur une seule chose, et fais-la bien.'],
      ['Vingt fois sur le métier remettez votre ouvrage.', 'Boileau']
    ],
    confiance: [
      ['Tu es plus capable que tu ne le crois.'], ["Tu n'as pas besoin d'être parfait pour être remarquable."], ['Ta valeur ne dépend pas du regard des autres.'],
      ['Tu as déjà traversé des jours difficiles. Celui-ci aussi passera.'], ["Ose prendre ta place. Elle t'attend."], ['Le doute est normal. Avance quand même.'],
      ['Tu es le projet le plus important sur lequel tu travailleras.'], ["Parle-toi comme à quelqu'un que tu aimes."],
      ["Chaque compétence que tu as aujourd'hui, tu l'as apprise un jour."], ["Ta lumière n'éteint pas celle des autres."],
      ["Sois fier du chemin parcouru, même s'il reste de la route."], ['Tu mérites les efforts que tu fais pour toi.'],
      ['Personne ne peut jouer ton rôle mieux que toi.'], ["Crois en toi : c'est là que tout commence."]
    ],
    perseverance: [
      ['Patience et longueur de temps font plus que force ni que rage.', 'La Fontaine'], ['Rien ne sert de courir ; il faut partir à point.', 'La Fontaine'],
      ["Tomber fait partie du chemin. Se relever, c'est le chemin."], ['Les grandes choses prennent du temps. Continue.'], ["Ce n'est pas lent si tu ne t'arrêtes pas."],
      ['Chaque pas compte, même les plus petits.'], ["L'échec n'est qu'une étape vers la réussite."],
      ["Quand tu as envie d'abandonner, souviens-toi pourquoi tu as commencé."], ['Les racines poussent avant les fleurs.'],
      ["Petit à petit, l'oiseau fait son nid.", 'Proverbe'], ['Ne compte pas les jours, fais que les jours comptent.'],
      ["La goutte d'eau creuse la pierre, non par sa force, mais par sa constance.", 'Proverbe latin'], ["Un jour difficile n'est pas une vie difficile."],
      ['Hâtez-vous lentement, et sans perdre courage.', 'Boileau'], ["Encore un essai. C'est souvent celui-là."]
    ],
    courage: [
      ["Ce n'est pas parce que les choses sont difficiles que nous n'osons pas, c'est parce que nous n'osons pas qu'elles sont difficiles.", 'Sénèque'],
      ['À vaincre sans péril, on triomphe sans gloire.', 'Corneille'], ["Qui ne risque rien n'a rien.", 'Proverbe'], ['La peur est un signal, pas un panneau stop.'],
      ["Fais une chose aujourd'hui qui t'effraie un peu."], ["Le courage, ce n'est pas l'absence de peur, c'est d'agir malgré elle."],
      ["Sors de ta zone de confort : c'est là que tout commence."], ["Mieux vaut un essai imparfait qu'un rêve intact."], ['Dis oui à ce qui te fait grandir.'],
      ["Le meilleur moment pour oser, c'est maintenant."], ["Tu ne regretteras pas d'avoir essayé."],
      ["Les vagues ne s'arrêtent pas. Apprends à surfer."], ["Aide-toi, le Ciel t'aidera.", 'La Fontaine'], ["Ose demander. Au pire, c'est non."]
    ],
    serenite: [
      ["Ce qui trouble les hommes, ce ne sont pas les choses, mais les jugements qu'ils portent sur les choses.", 'Épictète'],
      ["Respire. Tu fais de ton mieux, et c'est suffisant."], ["Tout ne doit pas être fait aujourd'hui."], ['Lâche ce que tu ne contrôles pas.'],
      ["Le calme est une force, pas une faiblesse."], ['Prends soin de toi : tu es ton outil le plus précieux.'], ["Ralentir n'est pas reculer."],
      ['Un jour à la fois. Une chose à la fois.'], ['Après la pluie, le beau temps.', 'Proverbe'], ['Ce moment est le seul que tu aies vraiment. Habite-le.'],
      ['Ton repos fait partie du travail.'], ['Sois doux avec toi-même, tu apprends encore.'], ['Il faut cultiver notre jardin.', 'Voltaire'],
      ["La paix commence là où s'arrête la comparaison."]
    ],
    ambition: [
      ["Il n'y a pas de vent favorable pour celui qui ne sait pas où il va.", 'Sénèque'], ['Vise la lune : même en la manquant, tu atterriras parmi les étoiles.'],
      ['Rêve grand, commence petit, agis maintenant.'], ["Ton seul concurrent, c'est la personne que tu étais hier."],
      ['Les rêves ne fonctionnent que si tu travailles.'], ['Construis ce que tu aurais aimé trouver.'], ["Un objectif sans plan n'est qu'un souhait."],
      ["Fixe la barre haut, puis grandis jusqu'à elle."], ["Ce que tu bâtis dans l'ombre, le monde le verra au grand jour."],
      ['Les bâtisseurs ne demandent pas la permission.'], ["Chaque grand projet a commencé par une idée que d'autres trouvaient folle."],
      ["Sois patient avec les résultats, impatient avec l'action."], ["L'imagination est plus importante que le savoir.", 'Albert Einstein'],
      ["Le génie est fait d'un pour cent d'inspiration et de quatre-vingt-dix-neuf pour cent de transpiration.", 'Thomas Edison']
    ],
    sagesse: [
      ['Un voyage de mille lieues commence toujours par un premier pas.', 'Lao Tseu'], ['Le bonheur de ta vie dépend de la qualité de tes pensées.', 'Marc Aurèle'],
      ['Connais-toi toi-même.', 'Socrate'], ['Deviens ce que tu es.', 'Nietzsche'], ['Ce qui ne me tue pas me rend plus fort.', 'Nietzsche'],
      ["Le temps est la chose la plus précieuse qu'un homme puisse dépenser.", 'Théophraste'], ['La vie est trop courte pour être petite.', 'Benjamin Disraeli'],
      ['Qui veut voyager loin ménage sa monture.', 'Racine'],
      ["Le meilleur moment pour planter un arbre était il y a vingt ans. Le deuxième meilleur moment, c'est maintenant.", 'Proverbe chinois'],
      ['Celui qui déplace une montagne commence par déplacer de petites pierres.', 'Proverbe chinois'],
      ['Nous souffrons plus souvent en imagination que dans la réalité.', 'Sénèque'], ["Tant que tu vis, continue d'apprendre à vivre.", 'Sénèque'],
      ['Tout ce que nous sommes est le fruit de nos pensées.', 'Bouddha']
    ]
  };
  const typo = (s) => s.replace(/'/g, '’');
  const PHRASES = BIBLIO.flatMap((c) => BANQUE[c].map(([t, a], i) => ({ id: `${c}-${i + 1}`, t: typo(t), a: a || null, c })));
  $$('[data-total]').forEach((el) => texte(el, String(PHRASES.length)));

  function empreinte(s) { let h = 2166136261; for (const ch of s) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function generateur(graine) {
    let a = graine >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const REF = new Date(2024, 0, 1);
  function periode(date, rythme = 'quotidien') {
    const j0 = new Date(REF.getFullYear(), REF.getMonth(), REF.getDate());
    const j = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const jours = Math.max(0, Math.round((j - j0) / 864e5));
    const h = date.getHours();
    return rythme === 'horaire' ? jours * 24 + h : rythme === 'deuxParJour' ? jours * 2 + (h >= 12 ? 1 : 0) : jours;
  }
  function choisir(elements, p, sel) {
    if (!elements.length) return null;
    const n = elements.length, cycle = Math.floor(p / n), pos = p % n;
    const alea = generateur(empreinte(sel) ^ Math.imul(cycle + 1, 0x9E3779B9));
    const copie = elements.slice();
    for (let i = copie.length - 1; i > 0; i -= 1) { const k = Math.floor(alea() * (i + 1)); [copie[i], copie[k]] = [copie[k], copie[i]]; }
    return copie[pos];
  }
  const maintenant = new Date();
  const P = periode(maintenant);
  function phraseDuJour(pool = PHRASES, max = null, sel = 'toutes') {
    const choix = choisir(pool, P, sel);
    if (max && choix && choix.t.length > max) return choisir(pool.filter((x) => x.t.length <= max), P, sel + '-court') || choix;
    return choix;
  }
  const motDuJour = (cat = null) => choisir(cat ? CATS[cat].mots : BIBLIO.flatMap((c) => CATS[c].mots), P, (cat || 'toutes') + '-mot');
  const dePool = (c) => PHRASES.filter((x) => x.c === c);

  const PALIERS = { petit: [20, 17, 15, 13], moyen: [26, 21, 18, 16], grand: [34, 28, 24, 21] };
  const taillePolice = (format, n) => PALIERS[format][n < 40 ? 0 : n < 80 ? 1 : n < 120 ? 2 : 3];
  const resoudre = (theme, cat) => (theme === 'automatique' ? CATS[cat].theme : theme);
  function varsTheme(cle) {
    const t = THEMES[cle];
    return `--g:linear-gradient(to bottom right,${t.g.join(',')});--tx:${t.tx};--sec:${t.sec};--acc:${t.acc}`;
  }
  const majuscule = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const dateCourte = (d) => majuscule(new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }).format(d));
  const dateLongue = (d) => new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(d);
  const icone = (id) => `<svg aria-hidden="true"><use href="#${id}"/></svg>`;

  const STYLE_DEFAUT = { theme: 'automatique', police: 'serif', auteur: true, align: 'gauche' };
  function carte(p, style = STYLE_DEFAUT, format = 'grand', opts = {}) {
    const cle = resoudre(style.theme, p.c);
    const taille = taillePolice(format, p.t.length) * (opts.k || 1) * (format === 'petit' ? 0.9 : 1);
    const tete = format === 'petit'
      ? `<svg class="pc-open" aria-hidden="true"><use href="#i-quote-o"/></svg>`
      : `<p class="pc-h">${icone('c-' + p.c)}${echapper(CATS[p.c].nom)}<i></i>${opts.date ? `<em>${dateCourte(opts.date)}</em>` : ''}</p>`;
    const auteur = style.auteur && p.a ? `<p class="pc-a" style="font-size:${Math.max(11, taille * 0.5).toFixed(1)}px">— ${echapper(p.a)}</p>` : '';
    return `<div class="pc f-${format} al-${style.align} pol-${style.police}${opts.nouveau ? ' is-new' : ''}" style="${varsTheme(cle)};--ff:${POLICES[style.police].ff};--r:${opts.r || 22}px">`
      + `<div class="pc-bg"></div><svg class="pc-q" aria-hidden="true"><use href="#i-quote-c"/></svg>`
      + `<div class="pc-in">${tete}<span class="pc-sp"></span><p class="pc-t" style="font-size:${taille}px">${echapper(p.t)}</p>${auteur}<span class="pc-sp"></span></div></div>`;
  }

  const tplLock = $('#tpl-lock');
  function construireLock(racine) {
    racine.append(tplLock.content.cloneNode(true));
    texte($('.sb-time', racine), '9:41');
    return {
      inline: $('[data-inline]', racine), rect: $('[data-rect]', racine), cat: $('[data-cat]', racine),
      catIc: $('[data-cat-ic] use', racine), mot: $('[data-mot]', racine), sheetCat: $('[data-sheet-cat]', racine),
      sheetCard: $('[data-sheet-card]', racine), blocs: [$('.lk-inline', racine), $('.lk-rect', racine), $('.lk-circ', racine)]
    };
  }
  function remplirLock(L, p, court, mot, anime) {
    texte(L.inline, court.t);
    texte(L.rect, p.t);
    texte(L.cat, CATS[p.c].nom);
    L.catIc.setAttribute('href', '#c-' + p.c);
    texte(L.mot, mot);
    texte(L.sheetCat, CATS[p.c].nom);
    L.sheetCard.innerHTML = carte(p, STYLE_DEFAUT, 'grand', { date: maintenant });
    if (anime && !reduit) L.blocs.forEach((b, i) => { b.classList.remove('lk-change'); void b.offsetWidth; b.style.animationDelay = `${i * 90}ms`; b.classList.add('lk-change'); });
  }

  const courtes = PHRASES.filter((x) => x.t.length <= 42);
  const moyennes = PHRASES.filter((x) => x.t.length <= 95);

  const lockAuto = $('[data-lock="auto"]');
  const chipMot = $('[data-mot-chip]');
  if (lockAuto) {
    const L = construireLock(lockAuto);
    const ordre = BIBLIO.map((c) => phraseDuJour(dePool(c), 95, c));
    let i = 0;
    const montrer = (anime) => {
      const p = ordre[i % ordre.length];
      const court = courtes[(empreinte(p.id) + i) % courtes.length];
      const mot = motDuJour(p.c);
      remplirLock(L, p, court, mot, anime);
      texte(chipMot, mot);
    };
    montrer(false);
    if (!reduit) boucleScope(lockAuto.closest('[data-scope]'), () => { i += 1; montrer(true); }, 4200);
  }

  const home = $('[data-home]');
  if (home) {
    home.innerHTML = `<div class="wall"></div><div class="hm-grid">
      ${carte(phraseDuJour(PHRASES, null, 'toutes'), STYLE_DEFAUT, 'moyen', { date: maintenant })}
      ${carte(phraseDuJour(dePool('confiance'), 105, 'confiance'), STYLE_DEFAUT, 'petit')}
      ${carte(phraseDuJour(dePool('serenite'), 105, 'serenite'), STYLE_DEFAUT, 'petit')}
      ${carte(phraseDuJour(dePool('courage'), 95, 'courage'), STYLE_DEFAUT, 'grand', { date: maintenant, k: 0.9 })}
    </div><div class="hm-dots"><i></i><i></i></div><div class="hm-dock"><i></i><i></i><i></i><i></i></div>
    <div class="sb"><span class="sb-time">9:41</span><svg class="sb-ic"><use href="#sb"/></svg></div><div class="island"></div><div class="home-ind"></div>`;
  }

  const tplApp = $('#tpl-app');
  const favoris = new Set();
  const toast = $('.toast');
  let toastId = 0;
  function annoncer(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('on');
    clearTimeout(toastId);
    toastId = setTimeout(() => toast.classList.remove('on'), 2200);
  }
  const texteComplet = (p) => (p.a ? `« ${p.t} » — ${p.a}` : `« ${p.t} »`);
  async function copier(s) {
    try { await navigator.clipboard.writeText(s); return true; } catch {
      const t = document.createElement('textarea');
      t.value = s; t.setAttribute('readonly', ''); t.style.cssText = 'position:fixed;opacity:0';
      document.body.append(t); t.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch { ok = false; }
      t.remove();
      return ok;
    }
  }

  function construireApp(racine, interactif) {
    racine.append(tplApp.content.cloneNode(true));
    const el = { date: $('[data-date]', racine), h: $('[data-h]', racine), card: $('[data-card]', racine), mot: $('[data-mot]', racine), fav: $('[data-act="favori"]', racine) };
    const dujour = phraseDuJour();
    const etat = { tiree: null, cat: 'toutes' };
    const courante = () => etat.tiree || dujour;
    texte(el.date, dateLongue(maintenant));
    texte(el.mot, motDuJour());
    const rendre = (nouveau) => {
      const p = courante();
      el.card.innerHTML = carte(p, STYLE_DEFAUT, 'grand', { date: maintenant, nouveau, k: 0.94 });
      texte(el.h, etat.tiree ? 'Une autre inspiration' : 'Ta phrase du jour');
      racine.classList.toggle('is-tiree', !!etat.tiree);
      el.fav.classList.toggle('is-fav', favoris.has(p.id));
      el.fav.setAttribute('aria-pressed', String(favoris.has(p.id)));
    };
    rendre(false);
    if (!interactif) { $$('button', racine).forEach((b) => { b.tabIndex = -1; }); return null; }

    const actions = {
      autre() {
        const pool = (etat.cat === 'toutes' ? PHRASES : dePool(etat.cat)).filter((x) => x.id !== courante().id);
        etat.tiree = pool[Math.floor(Math.random() * pool.length)];
        rendre(true);
      },
      favori() {
        const p = courante();
        if (favoris.has(p.id)) { favoris.delete(p.id); annoncer('Retirée des favoris'); } else { favoris.add(p.id); annoncer('Ajoutée aux favoris ♥'); }
        rendre(false);
      },
      async copier() { annoncer((await copier(texteComplet(courante()))) ? 'Phrase copiée' : 'Copie impossible ici'); },
      async partager() {
        const p = courante();
        if (navigator.share) { try { await navigator.share({ text: texteComplet(p) }); } catch {  } return; }
        annoncer((await copier(texteComplet(p))) ? 'Phrase copiée, prête à partager' : 'Partage impossible ici');
      },
      retour() { etat.tiree = null; rendre(true); }
    };
    racine.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]');
      if (b && actions[b.dataset.act]) actions[b.dataset.act]();
    });
    return { actions, etat, rendre };
  }

  const appStatique = $('[data-app="static"]');
  if (appStatique) { construireApp(appStatique, true); $$('button', appStatique).forEach((b) => { b.tabIndex = -1; }); }
  const appDemo = $('[data-app="interactive"]');
  const demo = appDemo ? construireApp(appDemo, true) : null;

  const zoneCats = $('[data-cats]');
  if (zoneCats && demo) {
    const liste = [['toutes', 'Toutes', 'i-sparkles', '#ffb45e'], ...BIBLIO.map((c) => [c, CATS[c].nom, 'c-' + c, CATS[c].c])];
    zoneCats.innerHTML = liste.map(([c, nom, ic, coul]) => `<button type="button" data-cat="${c}" aria-pressed="${c === 'toutes'}" style="--c:${coul}">${icone(ic)}${nom}</button>`).join('');
    zoneCats.addEventListener('click', (e) => {
      const b = e.target.closest('[data-cat]');
      if (!b) return;
      demo.etat.cat = b.dataset.cat;
      $$('button', zoneCats).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      demo.actions.autre();
    });
  }
  const sectionDemo = $('#aujourdhui');
  let demoVisible = false;
  if (sectionDemo) {
    sectionDemo.addEventListener('portee:entree', () => { demoVisible = true; });
    sectionDemo.addEventListener('portee:sortie', () => { demoVisible = false; });
  }
  addEventListener('keydown', (e) => {
    if (!demo || !demoVisible || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
    if (e.code === 'Space') { e.preventDefault(); demo.actions.autre(); }
    else if (e.key === 'f' || e.key === 'F') demo.actions.favori();
  });

  const histoire = $('.lockstory');
  const lockStory = $('[data-lock="story"]');
  const etapes = $$('.lock-step');
  const barreHistoire = $('.lock-progress i');
  let focusCourant = 'inline';
  if (lockStory) {
    const L = construireLock(lockStory);
    remplirLock(L, phraseDuJour(PHRASES, 95), phraseDuJour(PHRASES, 42, 'inline'), motDuJour(), false);
  }
  function montrerEtape(i) {
    const f = etapes[i] ? etapes[i].dataset.focus : 'inline';
    if (f === focusCourant) return;
    focusCourant = f;
    etapes.forEach((s, k) => s.classList.toggle('is-active', k === i));
    if (lockStory) lockStory.dataset.focus = f;
  }
  const allerEtape = (i) => {
    if (mobile.matches || reduit || !geo.histoire) { montrerEtape(i); return; }
    scrollTo({ top: geo.histoire.top + (geo.histoire.h - innerHeight) * ((i + 0.5) / etapes.length), behavior: 'smooth' });
  };
  etapes.forEach((s, i) => {
    s.tabIndex = 0; s.setAttribute('role', 'button');
    s.addEventListener('click', () => allerEtape(i));
    s.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); allerEtape(i); } });
  });
  if (histoire) {
    let k = 0, id = 0;
    const io = new IntersectionObserver(([e]) => {
      clearInterval(id); id = 0;
      if (e.isIntersecting && (mobile.matches || reduit)) id = setInterval(() => { k = (k + 1) % etapes.length; montrerEtape(k); }, 2800);
    }, { threshold: 0.3 });
    io.observe(histoire);
  }

  const reglage = { ...STYLE_DEFAUT };
  const echantillons = PHRASES.filter((x) => x.a && x.t.length <= 100).concat(PHRASES.filter((x) => !x.a && x.t.length <= 70));
  let iEch = echantillons.findIndex((x) => x.id === 'perseverance-1');
  if (iEch < 0) iEch = 0;
  const board = $('[data-board]');
  const boardCap = $('[data-board-cap]');
  function rendreBoard(nouveau) {
    if (!board) return;
    const p = echantillons[iEch % echantillons.length];
    const court = p.t.length <= 42 ? p : courtes[empreinte(p.id) % courtes.length];
    board.innerHTML = carte(p, reglage, 'moyen', { date: maintenant, nouveau })
      + carte(p.t.length <= 105 ? p : court, reglage, 'petit', { nouveau })
      + `<div class="board-lock" style="--ff:${POLICES[reglage.police].ff};--ta:${reglage.align === 'centre' ? 'center' : 'left'}">
           <small>Écran verrouillé</small>
           <p class="bl-inline">${icone('i-sparkles')}<span>${echapper(court.t)}</span></p>
           <div><p class="lk-cat">${icone('c-' + p.c)}${CATS[p.c].nom}</p><p class="lk-txt">${echapper(p.t)}</p></div>
         </div>`;
    const cle = resoudre(reglage.theme, p.c);
    texte(boardCap, reglage.theme === 'automatique' ? `Automatique : ${THEMES[cle].nom} pour ${CATS[p.c].nom}` : `Thème : ${THEMES[cle].nom}`);
  }
  function radios(zone, entrees, cle, attr) {
    if (!zone) return;
    zone.innerHTML = entrees.map(([v, html, extra = '']) => `<button type="button" role="radio" aria-checked="${reglage[cle] === v}" data-v="${v}" ${attr ? `data-${attr}="${v}"` : ''} ${extra}>${html}</button>`).join('');
    zone.addEventListener('click', (e) => {
      const b = e.target.closest('[data-v]');
      if (!b) return;
      reglage[cle] = b.dataset.v;
      $$('[data-v]', zone).forEach((x) => x.setAttribute('aria-checked', String(x === b)));
      rendreBoard(true);
    });
  }
  radios($('[data-themes]'), Object.entries(THEMES).map(([k, t]) => [k, `<i class="${k === 'automatique' ? 'auto' : ''}" style="${t.g ? `--g:linear-gradient(to bottom right,${t.g.join(',')})` : ''}"></i>${k === 'automatique' ? 'Auto' : t.nom}`, `aria-label="${t.nom}"`]), 'theme');
  radios($('[data-polices]'), Object.entries(POLICES).map(([k, t]) => [k, t.nom]), 'police', 'ff');
  radios($('[data-aligns]'), [['gauche', 'À gauche'], ['centre', 'Centré']], 'align');
  const interAuteur = $('[data-auteur]');
  if (interAuteur) interAuteur.addEventListener('click', () => {
    reglage.auteur = !reglage.auteur;
    interAuteur.classList.toggle('is-on', reglage.auteur);
    interAuteur.setAttribute('aria-checked', String(reglage.auteur));
    rendreBoard(false);
  });
  const autreTheme = $('[data-autre-theme]');
  if (autreTheme) autreTheme.addEventListener('click', () => { iEch += 1 + Math.floor(Math.random() * 9); rendreBoard(true); });
  rendreBoard(false);

  const mes = [
    { id: 'm1', t: 'Un pas, puis un autre.', a: null, c: 'personnelle' },
    { id: 'm2', t: 'Fais-le pour la personne que tu deviens.', a: null, c: 'personnelle' }
  ];
  const form = $('[data-mine-form]');
  const listeMes = $('[data-mine-list]');
  const codeMes = $('[data-mine-code]');
  const apercuMes = $('[data-mine-preview]');
  const formatWidget = () => mes.map((p) => (p.a ? `${p.t} — ${p.a}` : p.t)).join(' | ');
  function rendreMes(nouveau) {
    if (!listeMes) return;
    listeMes.innerHTML = mes.map((p) => `<li data-id="${p.id}">${icone('c-personnelle')}<p>${echapper(p.t)}${p.a ? `<small>— ${echapper(p.a)}</small>` : ''}</p><button type="button" aria-label="Supprimer cette phrase">×</button></li>`).join('')
      || '<li><p>Aucune phrase pour l’instant.<small>Écrivez la vôtre ci-dessus.</small></p></li>';
    texte(codeMes, formatWidget() || '—');
    const derniere = mes[mes.length - 1];
    if (apercuMes) apercuMes.innerHTML = derniere ? carte(derniere, STYLE_DEFAUT, 'moyen', { date: maintenant, nouveau }) : '';
  }
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const donnees = new FormData(form);
      const t = String(donnees.get('texte') || '').replace(/\s+/g, ' ').replace(/\|/g, '/').trim();
      const a = String(donnees.get('auteur') || '').replace(/\s+/g, ' ').replace(/\|/g, '/').trim();
      if (!t) return;
      mes.push({ id: 'm' + Date.now(), t: typo(t), a: a ? typo(a) : null, c: 'personnelle' });
      if (mes.length > 8) mes.shift();
      form.reset();
      rendreMes(true);
      listeMes.scrollTop = listeMes.scrollHeight;
    });
    listeMes.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      const i = mes.findIndex((p) => p.id === b.parentElement.dataset.id);
      if (i >= 0) { mes.splice(i, 1); rendreMes(true); }
    });
    const boutonCopie = $('[data-mine-copy]');
    boutonCopie.addEventListener('click', async () => {
      const ok = mes.length && (await copier(formatWidget()));
      const ancien = boutonCopie.lastChild.textContent;
      boutonCopie.lastChild.textContent = ok ? 'Copié !' : 'Rien à copier';
      setTimeout(() => { boutonCopie.lastChild.textContent = ancien; }, 1600);
    });
    rendreMes(false);
  }

  const rangCats = $('[data-cat-row]');
  if (rangCats) {
    rangCats.innerHTML = BIBLIO.map((c, i) => `<span style="--i:${i};${varsTheme(CATS[c].theme)}">${icone('c-' + c)}${CATS[c].nom} <b>${dePool(c).length}</b></span>`).join('');
  }
  const zoneRythme = $('[data-rythmes]');
  const barreJour = $('[data-day]');
  const teintes = ['aurore', 'ocean', 'foret', 'braise', 'lavande', 'nuit', 'dore', 'graphite'];
  function rendreJour(r) {
    if (!barreJour) return;
    const n = RYTHMES[r][1];
    barreJour.innerHTML = Array.from({ length: n }, (_, i) => `<i style="--i:${i};${varsTheme(teintes[i % teintes.length])}" title="Phrase ${i + 1}"></i>`).join('');
  }
  if (zoneRythme) {
    zoneRythme.innerHTML = Object.entries(RYTHMES).map(([k, [nom]]) => `<button type="button" role="radio" aria-checked="${k === 'quotidien'}" data-v="${k}">${nom}</button>`).join('');
    zoneRythme.addEventListener('click', (e) => {
      const b = e.target.closest('[data-v]');
      if (!b) return;
      $$('[data-v]', zoneRythme).forEach((x) => x.setAttribute('aria-checked', String(x === b)));
      rendreJour(b.dataset.v);
    });
    rendreJour('quotidien');
  }

  const hero = $('.hero');
  const ciel = $('.stars');
  if (ciel && !reduit) {
    const ctx = ciel.getContext('2d');
    let etoiles = [], l = 0, h = 0, raf = 0, dernier = 0;
    const dimensionner = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      l = ciel.clientWidth; h = ciel.clientHeight;
      ciel.width = l * dpr; ciel.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(160, (l * h) / 9000));
      const alea = generateur(42);
      etoiles = Array.from({ length: n }, () => ({ x: alea() * l, y: alea() * h * 0.75, r: 0.4 + alea() * 1.3, p: alea() * Math.PI * 2, v: 0.5 + alea() * 1.5 }));
    };
    const image = (t) => {
      raf = requestAnimationFrame(image);
      if (t - dernier < 33) return;
      dernier = t;
      ctx.clearRect(0, 0, l, h);
      for (const s of etoiles) {
        const a = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(s.p + (t / 1000) * s.v));
        ctx.globalAlpha = a * (1 - s.y / (h * 0.85));
        ctx.fillStyle = '#fff3e4';
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      }
    };
    dimensionner();
    addEventListener('resize', sansBarreSafari(() => { dimensionner(); }));
    hero.addEventListener('portee:entree', () => { if (!raf) raf = requestAnimationFrame(image); });
    hero.addEventListener('portee:sortie', () => { cancelAnimationFrame(raf); raf = 0; });
  }

  const manifeste = $('[data-words]');
  let mots = [];
  if (manifeste) {
    const fragment = document.createDocumentFragment();
    [...manifeste.childNodes].forEach((noeud) => {
      if (noeud.nodeType === 1 && noeud.classList.contains('mot-photo')) { noeud.classList.add('m'); fragment.append(noeud); return; }
      const accent = noeud.nodeType === 1 && noeud.classList.contains('g');
      noeud.textContent.split(/(\s+)/).forEach((morceau) => {
        if (!morceau) return;
        if (/^\s+$/.test(morceau)) { fragment.append(morceau); return; }
        const s = document.createElement('span');
        s.className = accent ? 'm g' : 'm';
        s.textContent = morceau;
        fragment.append(s);
      });
    });
    manifeste.textContent = '';
    manifeste.append(fragment);
    mots = $$('.m', manifeste);
  }

  if (matchMedia('(hover: none)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'touch' || !e.isPrimary) return;
      e.target.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: e.clientX, clientY: e.clientY, pointerId: e.pointerId, pointerType: 'touch', isPrimary: true }));
    }, { passive: true });
  }
  if (!reduit) {
    const tiltsAccueil = $$('.tilt', hero);
    const incliner = (els, ry, rx) => els.forEach((t) => { t.style.setProperty('--ry', ry); t.style.setProperty('--rx', rx); });
    const suivreAccueil = parImage((e) => {
      const nx = e.clientX / innerWidth - 0.5;
      const ny = e.clientY / innerHeight - 0.5;
      incliner(tiltsAccueil, `${(nx * 10).toFixed(2)}deg`, `${(-ny * 7).toFixed(2)}deg`);
    });
    hero.addEventListener('pointermove', suivreAccueil);
    hero.addEventListener('pointerleave', () => { suivreAccueil.annuler(); incliner(tiltsAccueil, '0deg', '0deg'); });

    $$('.tilt-soft').forEach((el) => {
      const zone = el.parentElement;
      const suivre = parImage((e) => {
        const r = zone.getBoundingClientRect();
        incliner([el], `${(((e.clientX - r.left) / r.width - 0.5) * 9).toFixed(2)}deg`, `${(-((e.clientY - r.top) / r.height - 0.5) * 6).toFixed(2)}deg`);
      });
      zone.addEventListener('pointermove', suivre);
      zone.addEventListener('pointerleave', () => { suivre.annuler(); incliner([el], '0deg', '0deg'); });
    });

    $$('.tile').forEach((t) => {
      const suivre = parImage((e) => {
        const r = t.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        t.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
        t.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
        t.style.setProperty('--try', `${((x - 0.5) * 5).toFixed(2)}deg`);
        t.style.setProperty('--trx', `${(-(y - 0.5) * 5).toFixed(2)}deg`);
      });
      t.addEventListener('pointermove', suivre);
      t.addEventListener('pointerleave', () => { suivre.annuler(); t.style.setProperty('--try', '0deg'); t.style.setProperty('--trx', '0deg'); });
    });

    $$('.magnet').forEach((b) => {
      const label = b.firstElementChild;
      const suivre = parImage((e) => {
        const r = b.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        b.style.transform = `translate(${(dx * 0.18).toFixed(1)}px, ${(dy * 0.28).toFixed(1)}px)`;
        if (label) label.style.transform = `translate(${(dx * 0.1).toFixed(1)}px, ${(dy * 0.14).toFixed(1)}px)`;
        b.style.setProperty('--mx', `${e.clientX - r.left}px`);
        b.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
      b.addEventListener('pointermove', suivre);
      b.addEventListener('pointerleave', () => { suivre.annuler(); b.style.transform = ''; if (label) label.style.transform = ''; });
    });
  }

  $$('.faq-list details').forEach((d) => {
    const resume = $('summary', d);
    const corps = $('.faq-a', d);
    resume.addEventListener('click', (e) => {
      if (reduit) return;
      e.preventDefault();
      if (d.open) {
        const a = corps.animate([{ height: `${corps.offsetHeight}px`, opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 380, easing: 'cubic-bezier(.65,0,.35,1)' });
        a.onfinish = () => { d.open = false; };
      } else {
        d.open = true;
        const h = corps.offsetHeight;
        corps.animate([{ height: '0px', opacity: 0 }, { height: `${h}px`, opacity: 1 }], { duration: 480, easing: 'cubic-bezier(.22,.8,.24,1)' });
      }
    });
  });

  const nav = $('.nav');
  const barreLecture = $('.progress i');
  const parallaxe = $$('[data-par]').map((el) => ({ el, k: Number(el.dataset.par) }));
  const liens = $$('.nav-links a');
  const cibles = liens.map((a) => $(a.getAttribute('href')));
  const geo = { hautPage: 0, hero: null, mani: null, histoire: null, cibles: [] };
  const boite = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { top: r.top + scrollY, h: r.height }; };
  const etat = { scrolled: null, lecture: '', courant: null, pAccueil: -1, mots: -1, histoire: '' };
  function mesurer() {
    geo.hautPage = document.documentElement.scrollHeight;
    geo.hero = boite(hero);
    geo.mani = boite(manifeste);
    geo.histoire = boite(histoire);
    geo.cibles = cibles.map((c) => (c ? boite(c).top : null));
    etat.pAccueil = -1;
  }
  function majAccueil(y, vh) {
    if (!geo.hero || reduit) return;
    const top = geo.hero.top - y;
    if (top + geo.hero.h < 0) return;
    const p = borner(-top / vh);
    if (p === etat.pAccueil) return;
    etat.pAccueil = p;
    parallaxe.forEach(({ el, k }) => {
      el.style.transform = k ? `translate3d(${k * p * 90}px, ${-p * 40}px, 0)` : `translate3d(0, ${-p * 90}px, 0) scale(${1 - p * 0.04})`;
    });
  }
  function majManifeste(y, vh) {
    if (!manifeste || !geo.mani) return;
    const top = geo.mani.top - y;
    if (top + geo.mani.h < 0 || top > vh) return;
    const p = borner((vh * 0.85 - top) / (geo.mani.h + vh * 0.25));
    const n = reduit ? mots.length : Math.round(p * mots.length * 1.08);
    if (n === etat.mots) return;
    etat.mots = n;
    mots.forEach((m, i) => m.classList.toggle('on', i < n));
  }
  function majHistoire(y, vh) {
    if (!histoire || !geo.histoire || mobile.matches || reduit) return;
    const top = geo.histoire.top - y;
    if (top + geo.histoire.h < 0 || top > vh) return;
    const p = borner(-top / (geo.histoire.h - vh));
    const t = `scaleX(${p.toFixed(3)})`;
    if (t !== etat.histoire) { etat.histoire = t; if (barreHistoire) barreHistoire.style.transform = t; }
    montrerEtape(Math.min(etapes.length - 1, Math.floor(p * etapes.length)));
  }
  function majNav(y, vh) {
    const scrolled = y > 8;
    if (scrolled !== etat.scrolled) { etat.scrolled = scrolled; nav.classList.toggle('is-scrolled', scrolled); }
    const max = geo.hautPage - vh;
    const lecture = `scaleX(${max > 0 ? (y / max).toFixed(4) : 0})`;
    if (lecture !== etat.lecture) { etat.lecture = lecture; barreLecture.style.transform = lecture; }
    let courant = -1;
    geo.cibles.forEach((top, i) => { if (top != null && top - y < vh * 0.45) courant = i; });
    if (courant !== etat.courant) { etat.courant = courant; liens.forEach((a, i) => a.classList.toggle('is-current', i === courant)); }
  }
  let enAttente = false;
  function surDefilement() {
    if (enAttente) return;
    enAttente = true;
    requestAnimationFrame(() => {
      enAttente = false;
      const y = scrollY, vh = innerHeight;
      majNav(y, vh);
      majAccueil(y, vh);
      majManifeste(y, vh);
      majHistoire(y, vh);
    });
  }
  let delaiRedim = 0;
  addEventListener('scroll', surDefilement, { passive: true });
  addEventListener('resize', sansBarreSafari(() => { clearTimeout(delaiRedim); delaiRedim = setTimeout(() => { mesurer(); surDefilement(); }, 120); }));
  addEventListener('load', () => { mesurer(); surDefilement(); });
  new ResizeObserver(() => { mesurer(); surDefilement(); }).observe(document.body);

  mesurer();
  surDefilement();
  const annee = $('#annee');
  if (annee) annee.textContent = String(new Date().getFullYear());
})();
