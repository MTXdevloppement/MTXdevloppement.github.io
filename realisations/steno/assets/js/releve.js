// Sténo — le relevé de démonstration du site.
// Version réduite de l'analyse locale de l'app (RuleExtractor) : des règles de langue, rien d'autre.
// Tout se passe dans la page ; le texte saisi n'est envoyé nulle part.
(() => {
  const FAMILLES = ['tache', 'date', 'personne', 'decision', 'question', 'idee', 'lieu', 'organisation', 'chiffre', 'coordonnee'];
  // Familles qui portent sur une phrase entière (soulignées), les autres sur quelques mots (surlignées).
  const DE_PHRASE = new Set(['tache', 'decision', 'question', 'idee']);

  const PRENOMS = new Set(('adrien alice amélie anaïs antoine arthur aurélie baptiste benjamin camille caroline cédric charlotte chloé ' +
    'christophe claire clara clément david élodie émilie emma étienne fabien florian françois gabriel guillaume hugo inès jean jeanne ' +
    'jérôme julie julien juliette karim kevin laura laurent léa léo louis louise lucas lucie maël maëlys manon marc margaux marie marine ' +
    'martin mathéo matheo mathieu mathilde maxime mélanie michel nathan nicolas noah noémie olivier paul pauline pierre quentin raphaël ' +
    'romain sarah sébastien simon sophie stéphane théo thomas valentin victor vincent yann zoé').split(' '));
  const VILLES = new Set(('paris lyon marseille montpellier toulouse bordeaux lille nantes nice strasbourg rennes grenoble dijon angers ' +
    'nîmes reims toulon tours brest limoges amiens perpignan metz besançon orléans rouen caen nancy avignon bruxelles genève lausanne ' +
    'luxembourg londres berlin madrid barcelone rome milan lisbonne amsterdam montréal québec new york tokyo france belgique suisse ' +
    'espagne italie allemagne portugal canada').split(' '));
  const INFINITIFS = {
    envoie: 'Envoyer', appelle: 'Appeler', rappelle: 'Rappeler', note: 'Noter', prépare: 'Préparer', réserve: 'Réserver',
    achète: 'Acheter', commande: 'Commander', vérifie: 'Vérifier', demande: 'Demander', paie: 'Payer', confirme: 'Confirmer',
    contacte: 'Contacter', termine: 'Terminer', finisse: 'Finir', fasse: 'Faire', prenne: 'Prendre', écrive: 'Écrire',
    relance: 'Relancer', passe: 'Passer', regarde: 'Regarder', range: 'Ranger', trouve: 'Trouver', change: 'Changer',
  };

  const JOUR = '(?:lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)';
  const MOIS = '(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)';
  const HEURE = '(?:\\s(?:à|vers)\\s\\d{1,2}\\s?h(?:\\s?\\d{2})?)';
  const QUAND = `(?:après-demain|demain(?:\\s(?:matin|soir|après-midi))?|aujourd['’]hui|ce soir|ce matin|cet après-midi|` +
    `${JOUR}(?:\\s(?:prochain|matin|soir|après-midi))*|le\\s\\d{1,2}(?:er)?\\s${MOIS}(?:\\s\\d{4})?|` +
    `la fin (?:du mois|de la semaine|de l['’]année)|cette semaine|la semaine prochaine|le mois prochain|` +
    `dans\\s(?:\\d+|un|une|deux|trois|quatre|cinq|six|huit|dix|quinze)\\s(?:jours?|semaines?|mois))`;
  const RE_DATE = new RegExp(`(?<![\\p{L}])(?:(?:avant|d['’]ici)\\s)?${QUAND}${HEURE}?(?![\\p{L}])|(?<![\\p{L}])à\\s\\d{1,2}\\s?h(?:\\s?\\d{2})?(?![\\p{L}\\d])`, 'giu');
  const RE_TEL = /(?:\+33\s?|0)[1-9](?:[ .]?\d{2}){4}/g;
  const RE_MAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;
  const RE_CHIFFRE = /\d[\d   ]*(?:[.,]\d+)?\s?(?:k€|M€|€|euros?|%|pour ?cent|km|kg|m²)(?![\p{L}])/giu;
  const RE_NOM = /(?<![\p{L}])\p{Lu}[\p{Ll}]+(?:[-\s]\p{Lu}[\p{Ll}]+)*/gu;
  const RE_ORGA = /(?:entreprise|société|groupe|agence|association|magasin|cabinet|boutique|chez)\s$/i;
  const RE_TITRE = /^(?:Monsieur|Madame|Docteur|Maître)\s/;

  const RE_REMPLISSAGE = /^(?:(?:alors|donc|bon|ben|euh|et|ok|voilà|du coup|en fait|ah oui|oui|aussi|ensuite|puis)[ ,]+)+/i;
  const RE_TACHE = /^(?:il (?:faudrait|faudra|faut|va falloir)(?: aussi| encore| absolument| vraiment)?|je dois|on doit|nous devons|je vais devoir|on va devoir|pens(?:er|e|ez) à|ne pas oublier (?:de |d['’])|n['’]oublie(?:z)? pas (?:de |d['’])|il reste à|à faire ?:?)\s*/i;
  const RE_QUE_JE = /^que (?:j['’]|je |l['’]on |on )\s*(\p{L}+)\s*/iu;
  const RE_CONFIE = /^(\p{Lu}[\p{Ll}]+(?:\s\p{Lu}[\p{Ll}]+)?) (?:doit|devra|va devoir|s['’]occupe de|s['’]occupera de|se charge de)\s+(.+)$/u;
  const RE_IMPERATIF = /^(?:rappeler|appeler|envoyer|préparer|réserver|acheter|commander|vérifier|relancer|planifier|organiser|prévoir|confirmer|finir|terminer|écrire|rédiger|payer|contacter|demander à|en parler à|renouveler|noter|déplacer|prendre rendez-vous)(?![\p{L}])/iu;
  const RE_DECISION = /on a décidé|nous avons décidé|j['’]ai décidé|on part sur|on garde|on retient|c['’]est validé|c['’]est acté|on est d['’]accord|on a choisi|on a validé/i;
  const RE_QUESTION = /^(?:est-ce qu|qu['’]est-ce|pourquoi|comment|combien|quand est-ce|qui (?:va|doit|peut)|à voir si|reste à savoir|je me demande)/i;
  const RE_IDEE = /on pourrait|ce serait bien|pourquoi pas|il serait intéressant/i;
  const RE_ET_SI = /^et si /i;
  const RE_URGENT = /urgent|important|priorit|absolument|au plus vite|impérativement/i;

  const majuscule = (t) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t);
  const propre = (t) => t.replace(/\s{2,}/g, ' ').replace(/\s+([,.])/g, '$1').replace(/^[\s,;:–-]+|[\s,;:.!–-]+$/g, '').trim();
  const cle = (t) => t.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

  function analyser(texte) {
    const marques = [];
    const notes = Object.fromEntries(FAMILLES.map((f) => [f, []]));
    const libre = (d, f) => !marques.some((m) => !DE_PHRASE.has(m.fam) && d < m.f && f > m.d);
    const marquer = (d, f, fam) => { marques.push({ d, f, fam }); };

    // Phrases, avec leur position dans le texte.
    const phrases = [];
    for (const m of texte.matchAll(/[^.!?\n]+[.!?]*/g)) {
      const avant = m[0].match(/^\s*/)[0].length;
      const t = m[0].trim();
      if (t.length >= 2) phrases.push({ t, d: m.index + avant });
    }

    const personnes = new Map(); // premier mot → fiche
    const vus = new Set();
    const ajouter = (fam, note) => {
      const k = fam + '|' + cle(note.texte);
      if (vus.has(k) || !note.texte) return;
      vus.add(k);
      notes[fam].push(note);
    };

    for (const p of phrases) {
      const dates = [];
      // Coordonnées, puis chiffres, puis dates : dans cet ordre, pour qu'un téléphone ne devienne pas un montant.
      for (const m of p.t.matchAll(RE_TEL)) { marquer(p.d + m.index, p.d + m.index + m[0].length, 'coordonnee'); ajouter('coordonnee', { texte: m[0], detail: 'Téléphone' }); }
      for (const m of p.t.matchAll(RE_MAIL)) { marquer(p.d + m.index, p.d + m.index + m[0].length, 'coordonnee'); ajouter('coordonnee', { texte: m[0], detail: 'E-mail' }); }
      for (const m of p.t.matchAll(RE_CHIFFRE)) {
        const d = p.d + m.index, f = d + m[0].length;
        if (!libre(d, f)) continue;
        marquer(d, f, 'chiffre');
        ajouter('chiffre', { texte: propre(m[0]) });
      }
      for (const m of p.t.matchAll(RE_DATE)) {
        const d = p.d + m.index, f = d + m[0].length;
        if (!libre(d, f)) continue;
        marquer(d, f, 'date');
        // « le rendez-vous de jeudi » situe une chose, ce n'est pas une échéance.
        dates.push({ expr: m[0], i: m.index, repere: /\bde\s$/i.test(p.t.slice(0, m.index)) });
      }

      // Noms propres : personnes, lieux, organisations.
      for (const m of p.t.matchAll(RE_NOM)) {
        let nom = m[0];
        const d = p.d + m.index, f = d + nom.length;
        if (!libre(d, f)) continue;
        const premier = cle(nom.split(/[\s-]/)[0]);
        const suite = p.t.slice(m.index + nom.length);
        if (m.index === 0 && !PRENOMS.has(premier) && !RE_TITRE.test(nom)) continue; // simple majuscule de début de phrase
        const avant = p.t.slice(0, m.index);
        let fam = 'personne';
        if (VILLES.has(cle(nom))) fam = 'lieu';
        else if (RE_ORGA.test(avant) && !PRENOMS.has(premier)) fam = 'organisation';
        marquer(d, f, fam);
        if (fam !== 'personne') { ajouter(fam, { texte: nom }); continue; }
        nom = nom.replace(/\s+$/, '');
        const role = (suite.match(/^,\s((?:l['’]|le |la |notre |mon |ma )[\p{Ll}' ’-]{3,26}?)(?=,| et |\.|$)/u) || [])[1]
          || (suite.match(/^ (?:de|chez) (?:l['’]entreprise |la société |l['’]agence )?(\p{Lu}[\p{L}]+(?: \p{Lu}[\p{L}]+)*)/u) || [])[1];
        const fiche = personnes.get(premier);
        if (!fiche) personnes.set(premier, { texte: nom, detail: role ? majuscule(role.replace(/^(?:l['’]|le |la )/, '')) : '' });
        else {
          if (nom.length > fiche.texte.length) fiche.texte = nom;
          if (role && !fiche.detail) fiche.detail = majuscule(role.replace(/^(?:l['’]|le |la )/, ''));
        }
      }

      // La phrase elle-même : tâche, décision, question, idée, ou simple date.
      const net = p.t.replace(RE_REMPLISSAGE, '');
      const decalage = p.t.length - net.length;
      const fin = p.d + p.t.length;
      const echeance = dates.find((x) => !x.repere);
      const sansDates = (t) => dates.reduce((r, x) => (x.repere ? r : r.replace(x.expr, ' ')), t);
      const titreTache = (reste) => {
        let t = sansDates(reste).split(/,\s|\sparce qu|\scar\s/)[0];
        t = t.replace(/^(?:me |m['’]|nous )/i, '');
        return majuscule(propre(t));
      };

      let tache = null;
      const prefixe = net.match(RE_TACHE);
      const confie = !prefixe && net.match(RE_CONFIE);
      if (prefixe) {
        let reste = net.slice(prefixe[0].length);
        const conj = reste.match(RE_QUE_JE);
        if (conj) reste = (INFINITIFS[conj[1].toLowerCase()] || majuscule(conj[1])) + ' ' + reste.slice(conj[0].length);
        if (reste.length >= 4) tache = { texte: titreTache(reste) };
      } else if (confie && !['il', 'elle', 'on', 'ça', 'cela'].includes(confie[1].toLowerCase())) {
        tache = { texte: titreTache(confie[2]), qui: confie[1] };
      } else if (net.length <= 150 && RE_IMPERATIF.test(net)) {
        tache = { texte: titreTache(net) };
      }

      if (tache && tache.texte.length >= 4) {
        if (echeance) tache.date = majuscule(propre(echeance.expr));
        if (RE_URGENT.test(net)) tache.prioritaire = true;
        marquer(p.d + decalage, fin, 'tache');
        ajouter('tache', tache);
      } else if (RE_ET_SI.test(p.t)) {
        marquer(p.d, fin, 'idee');
        ajouter('idee', { texte: majuscule(propre(p.t.replace(/\s*\?$/, ''))) });
      } else if (net.endsWith('?') || RE_QUESTION.test(net)) {
        marquer(p.d + decalage, fin, 'question');
        ajouter('question', { texte: majuscule(propre(net.replace(/\s*\?$/, ''))) + (net.endsWith('?') ? ' ?' : '') });
      } else if (RE_DECISION.test(net)) {
        marquer(p.d + decalage, fin, 'decision');
        for (const part of net.split(/,\s*(?:par contre|mais|en revanche)\s+/i)) {
          const t = part.replace(/^(?:on a décidé|nous avons décidé|j['’]ai décidé) (?:de |d['’]|que )?/i, '')
            .replace(/^on part sur (?:du |de la |des |un |une |le |la |les )?/i, '').replace(/^on (?:garde|retient|a choisi|a validé) /i, (x) => (x.toLowerCase().includes('garde') ? 'Garder ' : ''));
          ajouter('decision', { texte: majuscule(propre(t)) });
        }
      } else if (RE_IDEE.test(net) && net.length >= 25) {
        marquer(p.d + decalage, fin, 'idee');
        ajouter('idee', { texte: majuscule(propre(net.replace(/\s*\?$/, ''))) });
      } else if (echeance) {
        const sujet = propre(net.slice(0, Math.max(0, echeance.i - decalage)).replace(/\s(?:le|c['’]est|est|sera|aura lieu)\s*$/i, ''));
        if (sujet.length >= 6) ajouter('date', { texte: majuscule(sujet), date: majuscule(propre(echeance.expr)) });
      }
    }

    for (const fiche of personnes.values()) ajouter('personne', fiche);
    marques.sort((a, b) => a.d - b.d || b.f - a.f);
    return { marques, notes, total: FAMILLES.reduce((n, f) => n + notes[f].length, 0) };
  }

  // Découpe le texte en morceaux, chacun avec les familles qui le couvrent, pour l'afficher surligné.
  function morceaux(texte, marques) {
    const bornes = new Set([0, texte.length]);
    marques.forEach((m) => { bornes.add(m.d); bornes.add(m.f); });
    const points = [...bornes].sort((a, b) => a - b);
    const sortie = [];
    for (let i = 0; i < points.length - 1; i += 1) {
      const d = points[i], f = points[i + 1];
      const fams = [...new Set(marques.filter((m) => m.d <= d && m.f >= f).map((m) => m.fam))];
      sortie.push({ texte: texte.slice(d, f), fams });
    }
    return sortie;
  }

  const api = { FAMILLES, DE_PHRASE, analyser, morceaux };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else window.StenoReleve = api;
})();
