(() => {
  // Thème clair / sombre, commun à tout le site MTX Studio (même clé que l'accueil).
  // Le script en tête de page pose déjà data-theme avant l'affichage ; ici, le bouton et le suivi du système.
  const racine = document.documentElement;
  const systeme = matchMedia('(prefers-color-scheme: dark)');
  const lire = () => { try { return localStorage.getItem('mtx-theme'); } catch { return null; } };
  const boutonsTheme = [...document.querySelectorAll('[data-mtx-theme]')];
  const majTheme = () => {
    const sombre = racine.dataset.theme !== 'light';
    const libelle = sombre ? 'Passer au thème clair' : 'Passer au thème sombre';
    boutonsTheme.forEach((b) => { b.setAttribute('aria-label', libelle); b.title = libelle; });
    // La barre du navigateur prend la couleur du fond de la page.
    const fond = getComputedStyle(document.body).backgroundColor;
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => { m.content = fond; });
  };
  const poser = (theme) => {
    racine.dataset.theme = theme;
    majTheme();
  };
  boutonsTheme.forEach((b) => b.addEventListener('click', () => {
    const suivant = racine.dataset.theme === 'light' ? 'dark' : 'light';
    // Le choix est mémorisé tout de suite ; la transition n'est qu'un effet visuel.
    try { localStorage.setItem('mtx-theme', suivant); } catch { /* stockage indisponible : le choix vaut pour cette page */ }
    const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (document.startViewTransition && !calme && !document.hidden) document.startViewTransition(() => poser(suivant));
    else poser(suivant);
  }));
  // Sans choix mémorisé, la page suit le réglage du système, y compris s'il change.
  systeme.addEventListener('change', () => { if (!lire()) poser(systeme.matches ? "dark" : "light"); });
  addEventListener('storage', (e) => { if (e.key === 'mtx-theme' && (e.newValue === 'dark' || e.newValue === 'light')) poser(e.newValue); });
  majTheme();

  const pf = document.querySelector('.mtx-pf');
  const script = document.querySelector('script[src*="assets/js/projet.js"]');
  if (pf && script && 'FontFace' in window && document.fonts) {
    const dossier = new URL('../fonts/', script.src);
    const latin = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
    const etendu = 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C4,U+2113,U+2C60-2C7F,U+A720-A7FF';
    const polices = [['MTX Geist', 'geist-latin.woff2', latin], ['MTX Geist', 'geist-latin-ext.woff2', etendu], ['MTX Geist Mono', 'geist-mono-latin.woff2', latin]];
    const charger = () => polices.forEach(([famille, fichier, plage]) => {
      const f = new FontFace(famille, `url(${new URL(fichier, dossier)}) format("woff2")`, { weight: '100 900', display: 'swap', unicodeRange: plage });
      document.fonts.add(f);
      if (plage === latin) f.load().catch(() => {});
    });
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entrees) => {
        if (entrees.some((e) => e.isIntersecting)) { io.disconnect(); charger(); }
      }, { rootMargin: '1200px 0px' });
      io.observe(pf);
    } else charger();
  }

  // Scène du pied : le téléphone du studio, sur un nouveau message qui s'écrit. C'est la maquette de la
  // fenêtre « Contact » de l'accueil, posée ici pour les sites des réalisations (styles dans projet.css).
  const enveloppe = pf && pf.querySelector('.mtx-pf-w');
  if (enveloppe) {
    const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const etroit = matchMedia('(max-width: 900px)');
    const app = pf.dataset.mtxApp;
    const message = 'Bonjour Matheo,\n\n' + (app ? `J’ai découvert ${app} sur votre site. ` : '') + 'J’ai une idée d’application. Elle servirait à';
    const sc = document.createElement('div');
    sc.className = 'mtx-sc';
    sc.innerHTML = `<span class="mtx-sc-halo" aria-hidden="true"></span>
<span class="mtx-sc-rig"><span class="mtx-sc-pose">
<span class="mtx-sc-ombre" aria-hidden="true"></span>
<a class="mtx-tel" aria-label="Écrire au studio : ouvrir un e-mail adressé à mtxstudio@proton.me">
<span class="mtx-tel-touches"></span>
<span class="mtx-tel-bord"><span class="mtx-tel-ecran">
<span class="mtx-tel-etat"><span class="mtx-tel-heure" data-mtx-heure>9:41</span><span class="mtx-tel-ind"><svg viewBox="0 0 17 12"><path d="M8.5 2.4c2.3 0 4.4.9 6 2.4l1.1-1.2A10.3 10.3 0 0 0 8.5.7 10.3 10.3 0 0 0 1.4 3.6l1.1 1.2a8.6 8.6 0 0 1 6-2.4Zm0 3.5c1.4 0 2.6.5 3.6 1.4l1.1-1.2a6.9 6.9 0 0 0-9.4 0l1.1 1.2c1-.9 2.2-1.4 3.6-1.4Zm0 3.4c-.7 0-1.3.3-1.8.7l1.8 2 1.8-2c-.5-.4-1.1-.7-1.8-.7Z"/></svg><svg viewBox="0 0 27 12"><rect x=".5" y=".5" width="22" height="11" rx="3.4" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="19" height="8" rx="2.1"/><path d="M24 4v4c.9-.3 1.5-1.1 1.5-2S24.9 4.3 24 4Z" opacity=".45"/></svg></span></span>
<span class="mtx-msg">
<span class="mtx-msg-haut"><span>Annuler</span><span class="mtx-msg-envoi"><svg viewBox="0 0 24 24"><path d="M12 19V6M6.5 11.5 12 6l5.5 5.5"/></svg></span></span>
<span class="mtx-msg-titre">Nouveau message</span>
<span class="mtx-msg-ligne"><span>À :</span><b>mtxstudio@proton.me</b></span>
<span class="mtx-msg-ligne"><span>Objet :</span>Un projet pour MTX Studio</span>
<span class="mtx-msg-corps" data-mtx-corps></span>
</span>
<span class="mtx-tel-barre"></span>
</span></span>
</a>
<span class="mtx-montre" aria-hidden="true">
<span class="mtx-montre-bracelet"></span>
<span class="mtx-montre-boite"><span class="mtx-montre-ecran">
<span class="mtx-montre-date" data-mtx-date>MTX Studio</span>
<b class="mtx-montre-heure" data-mtx-heure>9:41</b>
<span class="mtx-montre-pied"><svg viewBox="22 15 56 70"><defs><linearGradient id="mtx-sc-x" x1="30" x2="70" y1="0" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#2997ff"/><stop offset=".4" stop-color="#a78bfa"/><stop offset=".75" stop-color="#ff6ec7"/><stop offset="1" stop-color="#ffb86b"/></linearGradient></defs><path d="M33 26l34 48M67 26L33 74" fill="none" stroke="url(#mtx-sc-x)" stroke-width="16" stroke-linecap="round"/></svg>4 apps · 4 sites</span>
</span></span>
<span class="mtx-montre-couronne"></span><span class="mtx-montre-bouton"></span>
</span>
</span></span>`;
    sc.querySelector('.mtx-tel').href = 'mailto:mtxstudio@proton.me?subject=Un%20projet%20pour%20MTX%20Studio&body=Bonjour%20Matheo%2C%0A%0AMon%20projet%20en%20quelques%20lignes%20%3A%0A%0A%0AAppareils%20vis%C3%A9s%20%28iPhone%2C%20iPad%2C%20Apple%20Watch%2C%20Mac%29%20%3A%0A%0A%0A%C3%89ch%C3%A9ance%20souhait%C3%A9e%20%3A%0A%0A';
    enveloppe.prepend(sc);
    enveloppe.classList.add('mtx-avec-sc');

    // Heure réelle dans la barre d'état et sur la montre.
    const heures = [...sc.querySelectorAll('[data-mtx-heure]')];
    const jour = sc.querySelector('[data-mtx-date]');
    const horloge = () => {
      const d = new Date();
      const h = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      heures.forEach((el) => { el.textContent = h; });
      jour.textContent = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
    };
    horloge();
    setInterval(horloge, 20000);

    // Le message s'écrit quand la maquette arrive à l'écran, et repart de zéro à chaque passage.
    const corps = sc.querySelector('[data-mtx-corps]');
    let visible = false, frappe = 0, ecrit = false;
    const ecrire = (n) => {
      corps.textContent = '';
      message.slice(0, n).split('\n').forEach((ligne, i) => {
        if (i) corps.appendChild(document.createElement('br'));
        corps.appendChild(document.createTextNode(ligne));
      });
      const curseur = document.createElement('span');
      curseur.className = 'mtx-msg-curseur';
      corps.appendChild(curseur);
    };
    const taper = () => {
      if (ecrit) return;
      ecrit = true;
      let n = 0;
      clearInterval(frappe);
      frappe = setInterval(() => {
        if (!visible || document.hidden) return;
        ecrire(n += 1);
        if (n >= message.length) clearInterval(frappe);
      }, 42);
    };
    ecrire(calme ? message.length : 0);

    // Pose de la maquette : entrée, pivot à la souris, balancement lent sans souris.
    const pose = sc.querySelector('.mtx-sc-pose');
    let px = 0, py = 0, geste = -1e9, rx = 0, ry = 0, debut = 0, image = 0;
    const dessiner = (t) => {
      image = 0;
      if (!visible || document.hidden) return;
      if (!debut) debut = t;
      const e = Math.min(1, (t - debut) / 1500);
      const entree = 1 - (1 - e) ** 4;
      let tx = px, ty = py;
      if (t - geste > 3200) { tx = Math.sin(t / 2700) * 0.42; ty = Math.cos(t / 3500) * 0.3; }
      rx += (-ty * 5 - rx) * 0.06;
      ry += (tx * 11 - ry) * 0.06;
      const petit = etroit.matches;
      pose.style.transform = `translate3d(0,${((1 - entree) * 64).toFixed(1)}px,0) scale(${(0.9 + 0.1 * entree).toFixed(4)}) ` +
        `rotateX(${((petit ? 7 : 5) + rx + (1 - entree) * 10).toFixed(2)}deg) rotateY(${((petit ? -4 : -8) + ry - (1 - entree) * 38).toFixed(2)}deg)`;
      pose.style.setProperty('--mtx-gl', (ry * 3.2 + (1 - entree) * 60).toFixed(1));
      image = requestAnimationFrame(dessiner);
    };
    const tourner = () => { if (!image && visible && !calme) image = requestAnimationFrame(dessiner); };
    if (!calme) {
      addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse') return;
        px = (e.clientX / Math.max(innerWidth, 1)) * 2 - 1;
        py = (e.clientY / Math.max(innerHeight, 1)) * 2 - 1;
        geste = performance.now();
      }, { passive: true });
      document.addEventListener('visibilitychange', tourner);
    }

    const arriver = (ratio) => {
      visible = ratio > 0;
      sc.classList.toggle('est-hors', !visible);
      if (visible) { sc.classList.add('est-pret'); tourner(); }
      if (calme) return;
      if (ratio >= 0.3) taper();
      else if (!visible) { clearInterval(frappe); ecrit = false; ecrire(0); }
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entrees) => entrees.forEach((en) => arriver(en.isIntersecting ? en.intersectionRatio : 0)), { threshold: [0, 0.3] }).observe(sc);
    } else arriver(1);
  }

  // Maquettes des premiers écrans : même pose que la scène du pied (pivot à la souris, balancement lent sans
  // souris, reflet lié à l'angle). L'angle de repos est réglé en CSS par chaque site.
  const poses = document.querySelectorAll('[data-mtx-pose]');
  if (poses.length && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let px = 0, py = 0, geste = -1e9;
    addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      px = (e.clientX / Math.max(innerWidth, 1)) * 2 - 1;
      py = (e.clientY / Math.max(innerHeight, 1)) * 2 - 1;
      geste = performance.now();
    }, { passive: true });
    poses.forEach((pose) => {
      let visible = !('IntersectionObserver' in window), rx = 0, ry = 0, image = 0;
      const dessiner = (t) => {
        image = 0;
        if (!visible || document.hidden) return;
        let tx = px, ty = py;
        if (t - geste > 3200) { tx = Math.sin(t / 2700) * 0.42; ty = Math.cos(t / 3500) * 0.3; }
        rx += (-ty * 5 - rx) * 0.06;
        ry += (tx * 11 - ry) * 0.06;
        pose.style.setProperty('--mtx-rx', rx.toFixed(2));
        pose.style.setProperty('--mtx-ry', ry.toFixed(2));
        pose.style.setProperty('--mtx-gl', (ry * 3.2).toFixed(1));
        image = requestAnimationFrame(dessiner);
      };
      const tourner = () => { if (!image && visible) image = requestAnimationFrame(dessiner); };
      document.addEventListener('visibilitychange', tourner);
      if (visible) tourner();
      else new IntersectionObserver((entrees) => entrees.forEach((en) => {
        visible = en.isIntersecting;
        pose.classList.toggle('est-hors', !visible);
        tourner();
      })).observe(pose);
    });
  }

  const gbar = document.querySelector('.mtx-gbar');
  const nav = document.querySelector('body > .nav');
  if (nav) {
    if (new DOMMatrix(getComputedStyle(nav).transform).m41 < 0) nav.classList.add('mtx-centree');
    const set = () => document.documentElement.style.setProperty('--mtx-nav-h', nav.offsetHeight + 'px');
    set();
    if ('ResizeObserver' in window) new ResizeObserver(set).observe(nav);
    else addEventListener('resize', set);
    return;
  }
  if (!gbar) return;
  const fixes = [...document.body.children].filter((el) => {
    if (el === gbar || el.classList.contains('mtx-pf')) return false;
    const st = getComputedStyle(el);
    return st.position === 'fixed' && parseFloat(st.top) === 0 && el.offsetHeight > 0 && el.offsetHeight < 160 &&
      el.getBoundingClientRect().width >= window.innerWidth * 0.9;
  });
  if (!fixes.length) return;
  let demande = 0, dernier = -1;
  const hauteur = () => gbar.getBoundingClientRect().bottom + window.scrollY;
  let bas0 = hauteur();
  const placer = () => {
    demande = 0;
    const bas = Math.round(Math.max(0, bas0 - window.scrollY));
    if (bas === dernier) return;
    dernier = bas;
    fixes.forEach((el) => el.style.setProperty('top', bas + 'px', 'important'));
  };
  const planifier = () => { if (!demande) demande = requestAnimationFrame(placer); };
  addEventListener('scroll', planifier, { passive: true });
  addEventListener('resize', () => { bas0 = hauteur(); planifier(); });
  placer();
})();
