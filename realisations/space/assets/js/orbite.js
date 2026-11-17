(() => {
  const toile = document.querySelector('[data-orbite]');
  if (!toile || !toile.getContext) return;
  const cadre = toile.parentElement;
  const ctx = toile.getContext('2d');
  const racine = document.documentElement;
  const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scoreEl = document.querySelector('[data-score]');
  const recordEl = document.querySelector('[data-record]');
  const etatEl = document.querySelector('[data-etat]');
  const annonce = document.querySelector('[data-annonce]');
  const sonBtn = document.querySelector('[data-son]');

  const ZONES = [
    ['#120A2E', '#3B1C6E', ['#FF9F68', '#FFD93D', '#6BCB77', '#4D96FF', '#FF8FD8']],
    ['#061A2E', '#0E5B73', ['#FFB4A2', '#FFE66D', '#F7FFF7', '#FF9F68', '#A0E7E5']],
    ['#1F0B2E', '#8C3A62', ['#FFD166', '#06D6A0', '#5DADE2', '#FFFFFF', '#F4A261']],
    ['#070D21', '#1C2A4F', ['#5BC0BE', '#FFD60A', '#F78FB3', '#C77DFF', '#FFFFFF']],
    ['#0B2015', '#2F6B45', ['#FFE66D', '#FF9F68', '#F7FFF7', '#FFB4A2', '#4ECDC4']],
  ];
  const MINE = '#FF2E4D', GEMME = '#5CE1E6', FIEVRE = '#FFB627';
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const clair = () => racine.dataset.theme === 'light';

  const L = 390;
  let H = 780, echelle = 1, dpr = 1;
  const VITESSE = 980, VOL_MAX = 1.6, MARGE = 24;

  let planetes = [], gemmes = [], etoiles = [];
  let etat = 'orbite', courant = 0, angle = -Math.PI / 2, bille = { x: 0, y: 0, vx: 0, vy: 0 };
  let vol = 0, camera = 0, defile = false, vitesseDefile = 36, score = 0, serie = 0, fievre = false;
  let record = 0, demo = true, traine = [], textes = [], secousse = 0, fin = 0, zone = 0, zoneMix = 0;
  try { record = +localStorage.getItem('space-record') || 0; } catch {  }

  let graine = 7;
  const alea = () => { graine = (graine * 16807) % 2147483647; return (graine - 1) / 2147483646; };

  const creerPlanete = (i, yPrec) => {
    const r = Math.max(19, 34 - i * 0.35) + alea() * 8;
    const ecart = i === 0 ? 0 : 150 + Math.min(70, i * 2.2) + alea() * 40;
    const x = i === 0 ? L / 2 : 60 + alea() * (L - 120);
    const p = { x, y: yPrec - ecart, r, couleur: alea(), sens: alea() < 0.5 ? -1 : 1,
      vitesse: 2.3 + Math.min(1.6, i * 0.035) + alea() * 0.5, crateres: [], mines: [], bouge: 0, phase: alea() * 6.28 };
    for (let k = 0; k < 3; k++) p.crateres.push([alea() * 1.2 - 0.6, alea() * 1.2 - 0.6, 0.12 + alea() * 0.16]);
    if (i >= 7 && alea() < 0.45) {
      const n = i > 20 && alea() < 0.4 ? 2 : 1;
      for (let k = 0; k < n; k++) p.mines.push({ a: alea() * 6.28 + k * Math.PI, d: r + 30 + alea() * 18 });
    }
    if (i >= 13 && alea() < 0.3) p.bouge = 28 + alea() * 30;
    return p;
  };

  const etendre = () => {
    while (planetes.length < courant + 6) {
      const i = planetes.length, prec = planetes[i - 1];
      const p = creerPlanete(i, prec ? prec.y : 0);
      planetes.push(p);
      if (prec && alea() < 0.4) gemmes.push({ x: (p.x + prec.x) / 2, y: (p.y + prec.y) / 2, pris: false, t: alea() * 6 });
    }
  };

  const nouvellePartie = (enDemo) => {
    graine = enDemo ? 7 : (Date.now() % 2147483646) + 1;
    planetes = []; gemmes = []; textes = []; traine = [];
    planetes.push(creerPlanete(0, 0));
    courant = 0; etendre();
    angle = -Math.PI / 2; etat = 'orbite'; vol = 0; score = 0; serie = 0; fievre = false;
    defile = false; vitesseDefile = 36; zone = 0; zoneMix = 0;
    camera = planetes[0].y - H * 0.72;
    demo = enDemo;
    afficherScore();
    if (etatEl) etatEl.textContent = enDemo ? 'Démonstration' : 'À vous';
  };

  const afficherScore = () => {
    if (scoreEl) scoreEl.textContent = score;
    if (recordEl) recordEl.textContent = record;
  };

  let audio = null, sonActif = false;
  const NOTES = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51];
  const note = (n, duree = 0.32) => {
    if (!sonActif) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const t = audio.currentTime, o = audio.createOscillator(), g = audio.createGain();
      o.type = 'triangle'; o.frequency.value = NOTES[Math.min(n, NOTES.length - 1)];
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.18, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
      o.connect(g).connect(audio.destination); o.start(t); o.stop(t + duree + 0.05);
    } catch {  }
  };
  if (sonBtn) sonBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    sonActif = !sonActif;
    sonBtn.setAttribute('aria-pressed', String(sonActif));
    sonBtn.setAttribute('aria-label', sonActif ? 'Couper le son' : 'Activer le son');
    if (sonActif) note(2, 0.2);
  });

  const posPlanete = (p, t) => ({ x: p.x + (p.bouge ? Math.sin(t * 0.9 + p.phase) * p.bouge : 0), y: p.y });

  const lancer = () => {
    if (etat !== 'orbite') return;
    const p = planetes[courant], c = posPlanete(p, temps);
    const r = p.r + 16;
    bille.x = c.x + Math.cos(angle) * r; bille.y = c.y + Math.sin(angle) * r;
    bille.vx = Math.cos(angle) * VITESSE; bille.vy = Math.sin(angle) * VITESSE;
    etat = 'vol'; vol = 0; defile = true;
  };

  const texte = (t, x, y, couleur) => textes.push({ t, x, y, vie: 1, couleur });

  const capturer = (i, c) => {
    const p = planetes[i];
    const v = Math.hypot(bille.vx, bille.vy) || 1;
    const ecartCentre = Math.abs((bille.vx * (c.y - bille.y) - bille.vy * (c.x - bille.x)) / v);
    const parfait = ecartCentre < p.r * 0.4;
    const bond = i - courant - 1;
    serie = parfait ? serie + 1 : 0;
    if (serie >= 4) fievre = true; else if (!parfait) fievre = false;
    let gain = 1 + bond + (parfait ? Math.min(serie, 5) : 0);
    if (fievre) gain *= 2;
    score += gain;
    courant = i; etat = 'orbite';
    angle = Math.atan2(bille.y - c.y, bille.x - c.x);
    etendre();
    const etiquette = (fievre ? 'FIÈVRE ' : '') + (parfait ? (serie > 1 ? `PARFAIT ×${serie}` : 'PARFAIT') : bond ? `BOND +${bond}` : '');
    if (etiquette) texte(etiquette, c.x, c.y - p.r - 34, fievre ? FIEVRE : '#FFE66D');
    texte('+' + gain, c.x, c.y - p.r - 12, '#FFFFFF');
    note(parfait ? serie + 1 : 0);
    if (Math.floor(courant / 10) !== zone) { zone = Math.floor(courant / 10); texte(`ZONE ${zone + 1}`, L / 2, camera + H * 0.4, '#FFFFFF'); }
    afficherScore();
  };

  const perdre = () => {
    etat = 'fin'; fin = 0; secousse = 0.35; serie = 0; fievre = false;
    if (!demo && score > record) {
      record = score;
      try { localStorage.setItem('space-record', String(record)); } catch {  }
      texte('NOUVEAU RECORD !', L / 2, camera + H * 0.34, FIEVRE);
    }
    afficherScore();
    if (annonce && !demo) annonce.textContent = `Partie terminée : ${score} point${score > 1 ? 's' : ''}. Record : ${record}. Touchez pour rejouer.`;
  };

  const pilote = () => {
    if (etat !== 'orbite') return;
    const p = planetes[courant], cible = planetes[courant + 1];
    if (!cible) return;
    const c = posPlanete(p, temps), d = posPlanete(cible, temps + 0.2);
    const vise = Math.atan2(d.y - c.y, d.x - c.x);
    let ecart = Math.atan2(Math.sin(angle - vise), Math.cos(angle - vise));
    if (Math.abs(ecart) < 0.05 + (graine % 7) * 0.004) lancer();
  };

  let temps = 0, dernier = 0, image = 0, visible = true;
  const pas = (dt) => {
    temps += dt;
    const p = planetes[courant];
    if (etat === 'orbite') {
      angle += p.sens * p.vitesse * dt;
      const c = posPlanete(p, temps), r = p.r + 16;
      bille.x = c.x + Math.cos(angle) * r; bille.y = c.y + Math.sin(angle) * r;
      if (demo) pilote();
    } else if (etat === 'vol') {
      vol += dt;
      bille.x += bille.vx * dt; bille.y += bille.vy * dt;
      for (const g of gemmes) if (!g.pris && Math.hypot(g.x - bille.x, g.y - bille.y) < 26) { g.pris = true; score += fievre ? 2 : 1; texte('◆', g.x, g.y - 14, GEMME); afficherScore(); }
      for (let i = courant; i < Math.min(planetes.length, courant + 5); i++) {
        const q = planetes[i], c = posPlanete(q, temps);
        for (const m of q.mines) {
          const a = m.a + temps * 1.4, mx = c.x + Math.cos(a) * m.d, my = c.y + Math.sin(a) * m.d;
          if (Math.hypot(mx - bille.x, my - bille.y) < 13) return perdre();
        }
        if (i > courant && Math.hypot(c.x - bille.x, c.y - bille.y) < q.r + MARGE) return capturer(i, c);
      }
      if (vol > VOL_MAX || bille.x < -30 || bille.x > L + 30) return perdre();
    } else if (etat === 'fin') {
      fin += dt;
      if (demo && fin > 1.6) nouvellePartie(true);
    }
    traine.push([bille.x, bille.y]); if (traine.length > 14) traine.shift();
    if (etat !== 'fin') {
      const cible = posPlanete(planetes[courant], temps).y - H * 0.72;
      if (defile) { vitesseDefile = Math.min(78, 36 + courant * 0.9); camera -= vitesseDefile * dt; }
      camera += (Math.min(camera, cible) - camera) * Math.min(1, dt * 3.2);
      if (etat === 'orbite' && posPlanete(planetes[courant], temps).y - planetes[courant].r > camera + H) perdre();
    }
    zoneMix += ((zone % ZONES.length) - zoneMix) * Math.min(1, dt * 1.5);
    textes.forEach((t) => { t.vie -= dt * 0.9; t.y -= dt * 26; });
    textes = textes.filter((t) => t.vie > 0);
    secousse = Math.max(0, secousse - dt);
  };

  const melange = (x, y, t) => x.map((v, i) => v + (y[i] - v) * t);
  const rgb = (c) => `rgb(${c.map(Math.round).join(',')})`;
  const BLANC = [255, 255, 255];
  const fond = (z) => {
    const a = ZONES[Math.floor(z) % ZONES.length], b = ZONES[(Math.floor(z) + 1) % ZONES.length], t = z - Math.floor(z);
    let haut = melange(hex(a[0]), hex(b[0]), t), bas = melange(hex(a[1]), hex(b[1]), t);
    if (clair()) { haut = melange(haut, BLANC, 0.88); bas = melange(bas, BLANC, 0.74); }
    return [rgb(haut), rgb(bas)];
  };

  const dessiner = () => {
    const jour = clair();
    const [haut, bas] = fond(zoneMix);
    const g = ctx.createLinearGradient(0, 0, 0, toile.height);
    g.addColorStop(0, haut); g.addColorStop(1, bas);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = g; ctx.fillRect(0, 0, toile.width, toile.height);
    const sx = secousse > 0 ? (Math.random() - 0.5) * 10 * secousse : 0;
    ctx.setTransform(echelle * dpr, 0, 0, echelle * dpr, sx * dpr, 0);

    ctx.fillStyle = jour ? 'rgba(90,60,160,.28)' : 'rgba(255,255,255,.7)';
    for (const e of etoiles) {
      const y = ((e[1] - camera * e[2]) % H + H) % H;
      ctx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(temps * e[3] + e[0]));
      ctx.fillRect(e[0], y, e[2] * 2.2, e[2] * 2.2);
    }
    ctx.globalAlpha = 1;
    ctx.translate(0, -camera);

    const pc = planetes[courant];
    if (defile && etat === 'orbite') {
      const reste = camera + H - (pc.y + pc.r);
      if (reste < 140) {
        const rg = ctx.createLinearGradient(0, camera + H, 0, camera + H - 160);
        rg.addColorStop(0, `rgba(255,46,77,${0.45 * (1 - reste / 140)})`); rg.addColorStop(1, 'rgba(255,46,77,0)');
        ctx.fillStyle = rg; ctx.fillRect(0, camera + H - 160, L, 160);
      }
    }

    const pal = ZONES[zone % ZONES.length][2];
    for (let i = Math.max(0, courant - 2); i < planetes.length; i++) {
      const p = planetes[i], c = posPlanete(p, temps);
      if (c.y - p.r > camera + H + 40 || c.y + p.r < camera - 80) continue;
      if (i === courant) {
        ctx.setLineDash([4, 7]); ctx.lineWidth = 1.5;
        ctx.strokeStyle = jour ? 'rgba(40,20,90,.35)' : 'rgba(255,255,255,.35)';
        ctx.beginPath(); ctx.arc(c.x, c.y, p.r + 16, 0, 6.283); ctx.stroke(); ctx.setLineDash([]);
      } else if (i === courant + 1) {
        ctx.lineWidth = 1; ctx.strokeStyle = jour ? 'rgba(40,20,90,.14)' : 'rgba(255,255,255,.14)';
        ctx.beginPath(); ctx.arc(c.x, c.y, p.r + MARGE, 0, 6.283); ctx.stroke();
      }
      const couleur = pal[Math.floor(p.couleur * pal.length)];
      ctx.shadowColor = couleur; ctx.shadowBlur = jour ? 0 : 22;
      ctx.fillStyle = couleur; ctx.beginPath(); ctx.arc(c.x, c.y, p.r, 0, 6.283); ctx.fill();
      ctx.shadowBlur = 0;
      if (jour) { ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(30,15,70,.18)'; ctx.stroke(); }
      ctx.fillStyle = 'rgba(0,0,0,.13)';
      for (const k of p.crateres) { ctx.beginPath(); ctx.arc(c.x + k[0] * p.r * 0.7, c.y + k[1] * p.r * 0.7, k[2] * p.r, 0, 6.283); ctx.fill(); }
      for (const m of p.mines) {
        const a = m.a + temps * 1.4, mx = c.x + Math.cos(a) * m.d, my = c.y + Math.sin(a) * m.d;
        ctx.fillStyle = MINE; ctx.strokeStyle = MINE; ctx.lineWidth = 2;
        ctx.beginPath();
        for (let k = 0; k < 8; k++) { const b = k * 0.785 + temps * 3; ctx.moveTo(mx, my); ctx.lineTo(mx + Math.cos(b) * 9, my + Math.sin(b) * 9); }
        ctx.stroke(); ctx.beginPath(); ctx.arc(mx, my, 5, 0, 6.283); ctx.fill();
      }
    }
    for (const gm of gemmes) {
      if (gm.pris) continue;
      const y = gm.y + Math.sin(temps * 2.4 + gm.t) * 4;
      ctx.fillStyle = GEMME; ctx.shadowColor = GEMME; ctx.shadowBlur = jour ? 0 : 14;
      ctx.beginPath(); ctx.moveTo(gm.x, y - 9); ctx.lineTo(gm.x + 6, y); ctx.lineTo(gm.x, y + 9); ctx.lineTo(gm.x - 6, y); ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0;
    }
    const bc = jour ? '30,16,72' : '255,255,255';
    traine.forEach((t, i) => { ctx.fillStyle = `rgba(${fievre ? '255,182,39' : bc},${(i / traine.length) * 0.4})`; ctx.beginPath(); ctx.arc(t[0], t[1], 2 + i * 0.32, 0, 6.283); ctx.fill(); });
    if (etat !== 'fin' || fin < 0.12) {
      ctx.shadowColor = fievre ? FIEVRE : `rgb(${bc})`; ctx.shadowBlur = 16;
      ctx.fillStyle = fievre ? FIEVRE : `rgb(${bc})`;
      ctx.beginPath(); ctx.arc(bille.x, bille.y, 7, 0, 6.283); ctx.fill(); ctx.shadowBlur = 0;
    } else {
      for (let k = 0; k < 10; k++) {
        const a = k * 0.628, d = fin * 120;
        ctx.fillStyle = `rgba(${bc},${Math.max(0, 1 - fin * 1.4)})`;
        ctx.beginPath(); ctx.arc(bille.x + Math.cos(a) * d, bille.y + Math.sin(a) * d, 2.6, 0, 6.283); ctx.fill();
      }
    }
    ctx.font = '800 15px "Space Unbounded", system-ui, sans-serif'; ctx.textAlign = 'center';
    for (const t of textes) {
      ctx.globalAlpha = Math.min(1, t.vie * 1.6);
      ctx.fillStyle = jour && t.couleur === '#FFFFFF' ? '#1d1240' : t.couleur;
      ctx.fillText(t.t, t.x, t.y);
    }
    ctx.globalAlpha = 1;
    if (etat === 'fin' && !demo && fin > 0.5) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = jour ? 'rgba(247,243,238,.72)' : 'rgba(10,6,28,.62)';
      ctx.fillRect(0, 0, toile.width, toile.height);
    }
  };

  const boucle = (t) => {
    image = 0;
    if (!visible || document.hidden) { dernier = 0; return; }
    const dt = dernier ? Math.min(0.05, (t - dernier) / 1000) : 0.016;
    dernier = t;
    pas(dt); dessiner();
    cadre.classList.toggle('est-fini', etat === 'fin' && !demo && fin > 0.5);
    image = requestAnimationFrame(boucle);
  };
  const relancer = () => { if (!image && visible && !document.hidden) image = requestAnimationFrame(boucle); };

  const taille = () => {
    const r = toile.getBoundingClientRect();
    if (!r.width) return;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    toile.width = Math.round(r.width * dpr); toile.height = Math.round(r.height * dpr);
    echelle = r.width / L; H = r.height / echelle;
    etoiles = Array.from({ length: 60 }, (_, i) => [((i * 97) % 389), (i * 151) % H, 0.25 + (i % 4) * 0.2, 0.6 + (i % 5) * 0.3]);
    if (!image) dessiner();
  };

  const toucher = () => {
    if (demo) { nouvellePartie(false); cadre.classList.add('est-joue'); if (annonce) annonce.textContent = 'Partie lancée. Touchez pour lancer la bille.'; return; }
    if (etat === 'fin') { if (fin > 0.5) nouvellePartie(false); return; }
    lancer();
  };
  cadre.addEventListener('pointerdown', (e) => { if (e.button > 0) return; e.preventDefault(); toucher(); relancer(); });
  cadre.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toucher(); relancer(); }
  });

  if ('ResizeObserver' in window) new ResizeObserver(taille).observe(toile); else addEventListener('resize', taille);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((en) => { visible = en[0].isIntersecting; relancer(); }).observe(cadre);
  }
  document.addEventListener('visibilitychange', relancer);

  taille();
  nouvellePartie(true);
  if (calme) {
    demo = false; if (etatEl) etatEl.textContent = 'Touchez pour jouer';
    dessiner();
    cadre.addEventListener('pointerdown', relancer, { once: true });
    cadre.addEventListener('keydown', relancer, { once: true });
  } else relancer();
})();
