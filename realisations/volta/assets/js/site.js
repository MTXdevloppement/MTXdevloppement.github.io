(() => {
  'use strict';
  const { $, $$, attendre, reduit, compter } = window.Socle;
  const euros = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const eur = (v) => `${euros.format(v)} €`;
  const entier = new Intl.NumberFormat('fr-FR');
  const echelleDe = (el) => { const p = el.closest('.plateau'); return p ? p.getBoundingClientRect().width / p.offsetWidth : 1; };
  const hasard = (graine) => () => { graine = (graine * 16807) % 2147483647; return graine / 2147483647; };

  function bandeau(el, texte, annuler) {
    $('span', el).textContent = texte;
    const b = $('button', el);
    if (b) b.hidden = !annuler;
    el.classList.add('vu');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('vu'), annuler ? 5200 : 3200);
  }

  (() => {
    const cartes = $('#cartes');
    if (!cartes) return;
    const liste = $$('.cv', cartes), masquees = $('#masquees'), edit = $('#tdb-edit'), reinit = $('#tdb-reset');
    const alea = hasard(42);
    $('#barres-conso').innerHTML = Array.from({ length: 26 }, (_, k) => `<i style="--k:${k};--h:${Math.round(38 + alea() * 50 + (k > 20 ? 8 : 0))}%"></i>`).join('');
    const formats = { k: (v) => `${v.toFixed(1).replace('.', ',')} k€`, eur: (v) => eur(v), pc: (v) => `${Math.round(v)} %` };
    const animer = () => liste.forEach((c, k) => {
      c.style.setProperty('--k', k);
      c.classList.add('vu');
      const n = $('.cv-n', c);
      if (n && n.dataset.v) setTimeout(() => compter(n, Number(n.dataset.v), 1300, formats[n.dataset.f] || ((v) => entier.format(Math.round(v)))), 250 + k * 70);
    });
    setTimeout(animer, reduit ? 0 : 900);

    edit.addEventListener('click', () => {
      const on = !cartes.classList.contains('edit');
      cartes.classList.toggle('edit', on);
      edit.setAttribute('aria-pressed', on);
      edit.textContent = on ? 'Terminé' : 'Modifier la disposition';
      reinit.hidden = !on;
    });
    const majMasquees = () => {
      const caches = liste.filter((c) => c.classList.contains('cache'));
      masquees.hidden = !caches.length;
      $$('button', masquees).forEach((b) => b.remove());
      caches.forEach((c) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = `+ ${$('h4', c).textContent}`;
        b.addEventListener('click', () => { c.classList.remove('cache'); majMasquees(); });
        masquees.append(b);
      });
    };
    liste.forEach((c) => $('.cv-oeil', c).addEventListener('click', () => { c.classList.add('cache'); majMasquees(); }));
    reinit.addEventListener('click', () => { liste.forEach((c) => c.classList.remove('cache')); majMasquees(); });
    const scene = $('#tableau-scene');
    let vue = false;
    new IntersectionObserver(async ([e], io) => {
      if (!e.isIntersecting || vue || reduit) return;
      vue = true; io.disconnect();
      await attendre(4200);
      if (cartes.classList.contains('edit')) return;
      edit.click(); await attendre(1300);
      const c = liste.find((x) => x.dataset.c === 'relancer'); c.classList.add('cache'); majMasquees();
      await attendre(1800);
      reinit.click(); await attendre(900); edit.click();
    }, { threshold: .5 }).observe(scene);
  })();

  (() => {
    const lignes = $('#st-lignes');
    if (!lignes) return;
    const ETATS = { rupture: ['En rupture', '#ff453a'], seuil: ['Sous le seuil', '#ff9f0a'], prevue: ['Rupture prévue', '#bf5af2'], ok: ['En stock', '#30d158'] };
    const A = [
      ['APP-00011', 'Interrupteur simple allumage blanc', 'Appareillage', 64, 20, 3.9, 1.6],
      ['APP-00026', 'Plaque de finition triple anthracite', 'Appareillage', 8, 12, 6.4, .5],
      ['APP-00020', 'Détecteur de présence mural 360°', 'Appareillage', 14, 6, 48.5, .2],
      ['APP-00032', 'Prise 2P+T encastrée', 'Appareillage', 9, 15, 4.2, 1.5],
      ['CAB-00001', 'Fil H07V-U 1,5 mm² vert-jaune', 'Câbles et conducteurs', 140, 60, .42, 6],
      ['CAB-00004', 'Fil H07V-U 1,5 mm² noir', 'Câbles et conducteurs', 52, 60, .42, 5],
      ['CAB-00013', 'Câble R2V 3G1,5 mm²', 'Câbles et conducteurs', 210, 100, 1.18, 7],
      ['CAB-00014', 'Câble R2V 3G2,5 mm²', 'Câbles et conducteurs', 0, 100, 1.86, 6],
      ['CAB-00024', 'Câble souple H07RN-F 3G2,5 mm²', 'Câbles et conducteurs', 75, 50, 3.1, 2],
      ['CAB-00026', 'Fil H07V-U 1,5 mm² bleu', 'Câbles et conducteurs', 24, 40, .42, 8],
      ['CNX-00001', 'Bornes de connexion automatiques 3 entrées', 'Connectique', 30, 100, .38, 7.5],
      ['CNX-00002', 'Bornes de connexion automatiques 5 entrées', 'Connectique', 180, 100, .52, 6],
      ['CNX-00006', 'Boîte de dérivation étanche 100x100 mm', 'Connectique', 22, 10, 3.6, .4],
      ['PRO-00004', 'Disjoncteur 16 A courbe C', 'Protection', 18, 10, 9.8, .3],
      ['PRO-00009', 'Interrupteur différentiel 40 A 30 mA', 'Protection', 3, 4, 52, .1],
      ['ECL-00003', 'Dalle LED 600x600 36 W 4000 K', 'Éclairage', 11, 8, 39, .25],
    ].map(([ref, des, cat, stock, seuil, prix, conso]) => ({ ref, des, cat, stock, seuil, prix, conso }));
    const etat = (a) => a.stock === 0 ? 'rupture' : a.stock / a.conso < 7 ? 'prevue' : a.stock <= a.seuil ? 'seuil' : 'ok';
    const norme = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/²/g, '2').replace(/³/g, '3');
    const q = $('#st-q'), etats = $('#st-etats'), fiche = $('#st-fiche');
    let filtre = null, choisi = A[4], tape = false;
    etats.innerHTML = [['tous', 'Tous les articles', 362, '#8e8e93'], ['seuil', 'Sous le seuil', 58, '#ff9f0a'], ['rupture', 'En rupture', 12, '#ff453a'], ['prevue', 'Rupture prévue', 10, '#bf5af2']]
      .map(([k, t, n, c]) => `<button type="button" data-k="${k}" aria-pressed="${k === 'tous'}" style="--c:${c}"><i></i>${t}<b>${n}</b></button>`).join('');
    const surligner = (texte, cherche) => {
      if (!cherche) return texte;
      const n = norme(texte), i = n.indexOf(norme(cherche));
      if (i < 0) return texte;
      return `${texte.slice(0, i)}<mark>${texte.slice(i, i + cherche.length)}</mark>${texte.slice(i + cherche.length)}`;
    };
    function rendre(anime) {
      const c = q.value.trim();
      const vus = A.filter((a) => (!filtre || etat(a) === filtre) && (!c || norme(`${a.ref} ${a.des} ${a.cat}`).includes(norme(c))));
      lignes.innerHTML = vus.length ? vus.map((a, k) => `<div class="st-l${a === choisi ? ' sel' : ''}${anime ? ' entre' : ''}" role="row" data-r="${a.ref}" style="--k:${k}"><span><i class="pt" style="--c:${ETATS[etat(a)][1]}"></i></span><span>${a.ref}</span><span>${surligner(a.des, c)}</span><span>${a.cat}</span><span class="n">${a.stock}</span><span class="n">${a.seuil}</span></div>`).join('')
        : '<p class="st-vide">Aucun article ne correspond.</p>';
    }
    function rendreFiche(flash) {
      const a = choisi, [et, coul] = ETATS[etat(a)];
      const jours = a.stock ? Math.round(a.stock / a.conso) : 0, max = Math.max(a.seuil * 3, a.stock);
      const alea = hasard(a.ref.charCodeAt(4) * 97 + a.stock);
      const pts = Array.from({ length: 12 }, (_, k) => [k * 24, 60 - (25 + alea() * 28)]);
      pts[11][1] = 60 - Math.min(55, a.stock / max * 60);
      fiche.innerHTML = `<div><h5>${a.des}</h5><span class="ref">${a.ref} · ${a.cat}</span></div>
        <div class="sf-n${flash ? ' flash' : ''}"><b>${a.stock}</b><span>en stock · seuil ${a.seuil}</span></div>
        <div class="sf-jauge" style="--c:${coul}"><i style="--w:${a.stock / max * 100}%"></i><em style="--s:${a.seuil / max * 100}%"></em></div>
        <div class="sf-g"><div><small>État</small><b style="color:${coul}">${et}</b></div><div><small>Jours restants</small><b>${a.stock ? jours : '—'}</b></div><div><small>Valeur</small><b>${eur(a.stock * a.prix)}</b></div><div><small>Prix unitaire</small><b>${eur(a.prix)}</b></div></div>
        <svg class="sf-courbe" viewBox="0 0 264 64" preserveAspectRatio="none"><path d="M${pts.map((p) => p.join(' ')).join('L')}" fill="none" stroke="#0a84ff" stroke-width="2"/></svg>
        <button type="button" class="v-btn bleu" id="st-sortie"${a.stock ? '' : ' disabled'}>Sortie de stock…</button>`;
      $('#st-sortie').addEventListener('click', ouvrirFeuille);
    }
    lignes.addEventListener('click', (e) => {
      const l = e.target.closest('.st-l'); if (!l) return;
      choisi = A.find((a) => a.ref === l.dataset.r);
      $$('.st-l', lignes).forEach((x) => x.classList.toggle('sel', x === l));
      rendreFiche();
    });
    etats.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      filtre = b.dataset.k === 'tous' ? null : b.dataset.k;
      $$('button', etats).forEach((x) => x.setAttribute('aria-pressed', x === b));
      rendre(true);
    });
    q.addEventListener('input', () => { tape = true; rendre(false); });

    const feuille = $('#st-feuille'), fq = $('#fe-q'), band = $('#st-bandeau');
    let derniere = null;
    function majFeuille() {
      const n = Math.max(0, Number(fq.value) || 0), apres = choisi.stock - n;
      $('#fe-avant').textContent = choisi.stock;
      const b = $('#fe-apres'); b.textContent = apres; b.classList.toggle('neg', apres < 0);
      $('#fe-oui').disabled = n < 1 || apres < 0;
    }
    function ouvrirFeuille() {
      $('#fe-art').textContent = `${choisi.ref} · ${choisi.des}`;
      fq.value = Math.min(10, choisi.stock);
      feuille.hidden = false; majFeuille();
      setTimeout(() => fq.focus({ preventScroll: true }), 50);
    }
    fq.addEventListener('input', majFeuille);
    fq.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !$('#fe-oui').disabled) $('#fe-oui').click(); if (e.key === 'Escape') feuille.hidden = true; });
    $('#fe-non').addEventListener('click', () => { feuille.hidden = true; });
    $('#fe-oui').addEventListener('click', () => {
      const n = Number(fq.value);
      choisi.stock -= n; derniere = { a: choisi, n };
      feuille.hidden = true; rendre(false); rendreFiche(true);
      bandeau(band, `Sortie de ${n} enregistrée · ${choisi.ref}`, true);
    });
    $('#st-annuler').addEventListener('click', () => {
      if (!derniere) return;
      derniere.a.stock += derniere.n; choisi = derniere.a; derniere = null;
      rendre(false); rendreFiche(true);
      bandeau(band, 'Annulé : un ajustement inverse est inscrit au journal.', false);
    });
    rendre(false); rendreFiche();

    const scene = $('#stock-scene');
    scene.addEventListener('apparu', async () => {
      if (reduit) return;
      await attendre(900);
      for (const ch of 'mm2') { if (tape) return; q.value += ch; rendre(false); await attendre(230); }
      await attendre(700);
      if (tape) return;
      const l = $('.st-l', lignes);
      if (l) l.click();
    }, { once: true });
  })();

  (() => {
    const boite = $('#dv-colonnes');
    if (!boite) return;
    const COLS = [['brouillon', 'Brouillon', '#8e8e93'], ['envoyee', 'Envoyée', '#0a84ff'], ['relancee', 'Relancée', '#bf5af2'], ['recu', 'Devis reçu', '#ff9f0a'], ['accepte', 'Accepté', '#30d158'], ['recept', 'Réceptionné', '#64d2ff']];
    const SUIVANT = { brouillon: 'envoyee', envoyee: 'recu', relancee: 'recu', recu: 'accepte', accepte: 'recept' };
    boite.innerHTML = COLS.map(([k, t, c]) => `<div class="col-dv" data-k="${k}" style="--c:${c}"><h5>${t}<em>0</em></h5></div>`).join('');
    const couleur = Object.fromEntries(COLS.map(([k, , c]) => [k, c]));
    const band = $('#dv-bandeau'), resume = $('#dv-resume'), preparer = $('#dv-preparer');
    let engage = 0;
    const montant = (d) => d.m || (d.m = Math.round(d.a * (160 + (d.n.charCodeAt(11) % 7) * 21) * 100) / 100);
    function carte(d, nait) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = `dv${nait ? ' nait' : ''}`; b._d = d;
      b.style.setProperty('--c', couleur[d.e]);
      b.innerHTML = `<b>${d.n}</b><span>${d.f}</span><small></small>`;
      maj(b);
      b.addEventListener('click', () => avancer(b));
      return b;
    }
    function maj(b) {
      const d = b._d;
      b.style.setProperty('--c', couleur[d.e]);
      $('small', b).textContent = ['recu', 'accepte', 'recept'].includes(d.e) ? `${d.a} articles · ${eur(montant(d))}` : `${d.a} article${d.a > 1 ? 's' : ''}`;
    }
    function compte() {
      $$('.col-dv', boite).forEach((c) => { $('em', c).textContent = $$('.dv', c).length; });
      const cours = $$('.dv', boite).filter((b) => ['envoyee', 'relancee', 'recu'].includes(b._d.e)).length;
      resume.textContent = `${cours} demandes en cours · ${$$('.col-dv[data-k="relancee"] .dv', boite).length} relancées${engage ? ` · ${eur(engage)} engagés` : ''}`;
    }
    function deplacer(b, vers) {
      const s = echelleDe(boite), avant = b.getBoundingClientRect();
      $(`.col-dv[data-k="${vers}"]`, boite).append(b);
      const apres = b.getBoundingClientRect();
      if (!reduit) b.animate([{ transform: `translate(${(avant.left - apres.left) / s}px, ${(avant.top - apres.top) / s}px)` }, { transform: 'none' }], { duration: 650, easing: 'cubic-bezier(.22,.8,.24,1)' });
    }
    function avancer(b) {
      const d = b._d, vers = SUIVANT[d.e];
      if (!vers) { bandeau(band, `${d.n} : réception terminée.`); return; }
      d.e = vers; deplacer(b, vers); maj(b); compte();
      if (vers === 'envoyee') bandeau(band, `${d.n} envoyée à ${d.f} par Apple Mail`);
      if (vers === 'recu') bandeau(band, `Devis reçu de ${d.f} : ${eur(montant(d))}`);
      if (vers === 'accepte') { engage += montant(d); bandeau(band, `Devis accepté : ${eur(montant(d))} engagés au budget`); compte(); }
      if (vers === 'recept') bandeau(band, `Réception : ${d.a} articles entrés en stock au prix du devis`);
    }
    [{ n: 'DDV-2026-0021', f: 'Batifil Pro', a: 4, e: 'relancee' }, { n: 'DDV-2026-0024', f: 'Distrilec Services', a: 6, e: 'relancee' },
      { n: 'DDV-2026-0026', f: 'Comptoir Électrique du Nord', a: 3, e: 'envoyee' }, { n: 'DDV-2026-0027', f: 'Sud Appareillage', a: 7, e: 'recu', m: 2140.5 },
      { n: 'DDV-2026-0025', f: 'Armor Électricité', a: 2, e: 'accepte', m: 486 }, { n: 'DDV-2026-0019', f: 'Volt Partenaires', a: 5, e: 'recept', m: 1212.8 }]
      .forEach((d) => $(`.col-dv[data-k="${d.e}"]`, boite).append(carte(d)));
    compte();
    let fait = false;
    async function preparerDemandes() {
      if (fait) return;
      fait = true; preparer.disabled = true;
      const nouvelles = [{ n: 'DDV-2026-0031', f: 'Lumière & Câbles', a: 12 }, { n: 'DDV-2026-0032', f: 'Électro Négoce Ouest', a: 5 }, { n: 'DDV-2026-0033', f: 'Comptoir Électrique du Nord', a: 3 }];
      const cartes = [];
      for (const d of nouvelles) {
        d.e = 'brouillon';
        const b = carte(d, true);
        $('.col-dv[data-k="brouillon"]', boite).append(b); cartes.push(b); compte();
        await attendre(reduit ? 0 : 260);
      }
      bandeau(band, '3 demandes préparées : une par fournisseur, pour les 20 articles à commander');
      await attendre(reduit ? 0 : 1500);
      for (const b of cartes) { avancer(b); await attendre(reduit ? 0 : 420); }
      preparer.textContent = 'Demandes envoyées ✓';
    }
    preparer.addEventListener('click', preparerDemandes);
    $('#devis-scene').addEventListener('apparu', async () => { if (!reduit) { await attendre(1400); preparerDemandes(); } }, { once: true });
  })();

  (() => {
    const svg = $('#bg-svg');
    if (!svg) return;
    const PREVU = 319000, CONSO = 251927.59, ENGAGE = 2925.27, JOUR = 307, AN = 365, MAX = 400000;
    const X = (j) => 60 + j / AN * 960, Y = (v) => 270 - v / MAX * 250;
    const mois = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];
    const cumul = [0, 22100, 46900, 74000, 98200, 124500, 150300, 172000, 190400, 218800, 245600];
    const pts = cumul.map((v, i) => [X(mois[i]), Y(v)]).concat([[X(JOUR), Y(CONSO)]]);
    const ligne = `M${pts.map((p) => p.map((n) => n.toFixed(1)).join(' ')).join('L')}`;
    const noms = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
    svg.innerHTML = `<defs><linearGradient id="bg-deg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#0a84ff" stop-opacity=".45"/><stop offset="1" stop-color="#0a84ff" stop-opacity="0"/></linearGradient></defs>
      ${[100000, 200000, 300000].map((v) => `<line x1="60" x2="1020" y1="${Y(v)}" y2="${Y(v)}" stroke="rgba(255,255,255,.07)"/><text x="52" y="${Y(v) + 4}" text-anchor="end">${v / 1000} k€</text>`).join('')}
      ${noms.map((n, i) => `<text x="${X((mois[i] + mois[i + 1]) / 2)}" y="292" text-anchor="middle">${n}</text>`).join('')}
      <line class="bg-prevu" x1="60" x2="1020" y1="${Y(PREVU)}" y2="${Y(PREVU)}"/><text x="68" y="${Y(PREVU) - 8}" style="fill:rgba(255,255,255,.75)">Prévu 319 k€</text>
      <path class="bg-aire" d="${ligne}L${X(JOUR)} 270L60 270Z"/>
      <path class="bg-ligne bg-trace" d="${ligne}"/>
      <path class="bg-proj" id="bg-proj"/>
      <circle cx="${X(JOUR)}" cy="${Y(CONSO)}" r="5" fill="#0a84ff" stroke="#fff" stroke-width="2"/>
      <circle class="bg-pt" id="bg-pt" r="6" stroke="#fff" stroke-width="2"/>
      <text id="bg-pt-t" text-anchor="end" style="font-weight:600"></text>
      <line x1="${X(JOUR)}" x2="${X(JOUR)}" y1="20" y2="270" stroke="rgba(255,255,255,.25)" stroke-dasharray="2 4"/><text x="${X(JOUR) - 6}" y="32" text-anchor="end">aujourd’hui</text>`;
    const trace = $('.bg-trace', svg), l = trace.getTotalLength();
    trace.style.setProperty('--l', l);
    const plus = $('#bg-plus'), kpi = $('.bg-kpi .proj');
    function maj() {
      const x = Number(plus.value), engage = ENGAGE + x, proj = CONSO / JOUR * AN + engage, pc = proj / PREVU * 100;
      const cl = pc > 110 ? 'rouge' : pc > 100 ? 'orange' : '';
      $('#k-engage').textContent = eur(engage);
      $('#k-reste').textContent = eur(PREVU - engage - CONSO);
      $('#k-proj').textContent = eur(proj);
      $('#k-proj-pc').textContent = `${pc.toFixed(1).replace('.', ',')} % du prévu${cl === 'rouge' ? ' · dépassement' : ''}`;
      kpi.className = `proj ${cl}`;
      const p = $('#bg-proj'), pt = $('#bg-pt'), t = $('#bg-pt-t');
      p.setAttribute('d', `M${X(JOUR)} ${Y(CONSO)}L${X(AN)} ${Y(proj)}`);
      p.setAttribute('class', `bg-proj ${cl}`);
      pt.setAttribute('cx', X(AN)); pt.setAttribute('cy', Y(proj)); pt.setAttribute('class', `bg-pt ${cl}`);
      t.setAttribute('x', X(AN) - 12); t.setAttribute('y', Y(proj) + (proj > PREVU ? -10 : 18)); t.textContent = `Projection ${Math.round(proj / 1000)} k€`;
      t.style.fill = cl === 'rouge' ? '#ff453a' : cl ? '#ff9f0a' : '#30d158';
      $('#bg-plus-v').textContent = `${entier.format(x)} €`;
      plus.style.setProperty('--p', `${x / plus.max * 100}%`);
    }
    plus.addEventListener('input', maj);
    maj();
    const scene = $('#budget-scene');
    scene.addEventListener('apparu', async () => {
      $('.win', scene).classList.add('vu');
      if (reduit) return;
      await attendre(2400);
      const anim = async (de, a, ms) => {
        const t0 = performance.now();
        await new Promise((ok) => { const pas = (t) => { const k = Math.min((t - t0) / ms, 1), e = 1 - (1 - k) ** 3; plus.value = Math.round((de + (a - de) * e) / 500) * 500; maj(); if (k < 1) requestAnimationFrame(pas); else ok(); }; requestAnimationFrame(pas); });
      };
      await anim(0, 36000, 1600);
      await attendre(1500);
      await anim(36000, 0, 1200);
    }, { once: true });
  })();
})();
