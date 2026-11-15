// MTX Studio — films de présentation des réalisations (MTX Viewer, GoRun, Sténo). Sans dépendance.
//
// Le film tourne sans le son tant qu'il est à l'écran, comme les autres films des sites. « Avec le son » (ou un
// toucher sur l'image) le reprend au début avec la musique, sans boucle. Il se met en pause dès qu'il quitte l'écran
// et reprend quand on y revient. Les chapitres sautent d'une scène à l'autre et suivent la lecture.
// Mouvement réduit ou économie de données : rien ne se lance ni ne se charge seul, l'affiche reste jusqu'au geste ;
// un chapitre choisi montre son image, arrêtée. Sans JavaScript : la vidéo garde les commandes du navigateur.
//
// Balisage : un conteneur [data-mtx-film] (data-duree en secondes) qui contient la vidéo, son cadre
// [data-mtx-film-cadre], les commandes [data-mtx-film-son], [data-mtx-film-jouer], [data-mtx-film-plein] et, où l'on
// veut, les chapitres [data-mtx-film-aller="secondes"] dans une liste [data-mtx-film-chapitres]. États posés sur le
// conteneur : data-pret, data-regarde, data-lecture, data-son, data-fin, data-plein, data-calme ; --p donne
// l'avancement du film (0 à 1), et --p sur chaque chapitre celui du chapitre.
(() => {
  'use strict';
  const conteneurs = [...document.querySelectorAll('[data-mtx-film]')];
  if (!conteneurs.length) return;
  const calme = matchMedia('(prefers-reduced-motion: reduce)');
  const econome = Boolean(navigator.connection && navigator.connection.saveData);
  const horloge = (s) => { const n = Math.max(0, Math.floor(s)); return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`; };
  const pleinElement = () => document.fullscreenElement || document.webkitFullscreenElement || null;
  const etiqueter = (el, texte) => { if (el && el.getAttribute('aria-label') !== texte) el.setAttribute('aria-label', texte); };

  conteneurs.forEach((racine) => {
    const video = racine.querySelector('video');
    if (!video) return;
    const cadre = racine.querySelector('[data-mtx-film-cadre]') || video.parentElement;
    const commandes = racine.querySelector('.mtx-film-commandes');
    const bSon = racine.querySelector('[data-mtx-film-son]');
    const bJouer = racine.querySelector('[data-mtx-film-jouer]');
    const bPlein = racine.querySelector('[data-mtx-film-plein]');
    const temps = racine.querySelector('[data-mtx-film-temps]');
    const liste = racine.querySelector('[data-mtx-film-chapitres]');
    const chapitres = [...racine.querySelectorAll('[data-mtx-film-aller]')]
      .map((b) => ({ b, t: Number(b.dataset.mtxFilmAller) || 0, p: -1 }));
    let duree = Number(racine.dataset.duree) || 0;

    // regarde : le visiteur a choisi le film (le son, une seule lecture). voulu : la lecture est souhaitée.
    let regarde = false;
    let voulu = !calme.matches && !econome;
    let aLEcran = false, charge = false, attente = null, chapitreChoisi = false, pauseInterne = false;
    let image = 0, actif = -1, seconde = -1, minuteur = 0, toucherCalme = false;

    const charger = () => {
      if (charge) return;
      charge = true;
      video.preload = 'auto';
      if (video.readyState === 0) video.load();
    };
    const jouer = () => {
      charge = true;
      const promesse = video.play();
      // Lecture refusée (économie d'énergie d'iOS, son sans geste) : le film attend qu'on le lance.
      if (promesse && promesse.catch) promesse.catch((e) => { if (!e || e.name !== 'AbortError') { voulu = false; majEtat(); } });
    };
    const arreter = () => { if (!video.paused) { pauseInterne = true; video.pause(); } };
    const appliquer = () => {
      if (voulu && aLEcran && !document.hidden) { if (video.paused && !video.ended) jouer(); } else arreter();
      majEtat();
    };
    const aller = (t) => {
      const cible = Math.max(0, duree ? Math.min(t, duree - 0.05) : t);
      if (video.readyState >= 1) { video.currentTime = cible; attente = null; } else { attente = cible; charger(); }
      majTemps();
    };
    // Le film, avec la musique : depuis le début, ou depuis le chapitre que l'on vient de choisir.
    const regarder = () => {
      regarde = true;
      video.loop = false;
      video.muted = false;
      if (!chapitreChoisi || video.ended) aller(0);
      chapitreChoisi = false;
      voulu = true;
      jouer();
      majEtat();
    };
    const basculer = () => {
      if (video.ended) { aller(0); voulu = true; jouer(); majEtat(); return; }
      if (video.paused) {
        // Rien ne s'est lancé seul (mouvement réduit, économie de données) : la première lecture est celle du film.
        if (!regarde && (calme.matches || econome)) { regarder(); return; }
        voulu = true;
        jouer();
      } else { voulu = false; arreter(); }
      majEtat();
    };

    // La durée de chaque chapitre (--d), pour les frises dont les segments suivent les scènes.
    const mesurer = () => {
      chapitres.forEach((c, n) => {
        const fin = n + 1 < chapitres.length ? chapitres[n + 1].t : duree;
        if (fin > c.t) (c.b.closest('li') || c.b).style.setProperty('--d', (fin - c.t).toFixed(2));
      });
    };

    // Le chapitre en cours et son avancement, le fil, l'horloge.
    const centrer = () => {
      if (!liste || actif < 0 || liste.scrollWidth <= liste.clientWidth + 1) return;
      const el = chapitres[actif].b.closest('li') || chapitres[actif].b;
      const rl = liste.getBoundingClientRect(), re = el.getBoundingClientRect();
      liste.scrollTo({ left: Math.max(0, liste.scrollLeft + re.left - rl.left - (rl.width - re.width) / 2), behavior: calme.matches ? 'auto' : 'smooth' });
    };
    const majTemps = () => {
      const t = attente !== null ? attente : video.currentTime || 0;
      const d = duree || video.duration || 0;
      if (d) racine.style.setProperty('--p', Math.min(1, t / d).toFixed(4));
      let i = -1;
      chapitres.forEach((c, n) => { if (t >= c.t - 0.05) i = n; });
      chapitres.forEach((c, n) => {
        const fin = n + 1 < chapitres.length ? chapitres[n + 1].t : d;
        const p = n < i ? 1 : n > i ? 0 : Math.min(1, Math.max(0, (t - c.t) / Math.max(0.1, fin - c.t)));
        const r = Math.round(p * 1000) / 1000;
        if (r !== c.p) { c.p = r; c.b.style.setProperty('--p', String(r)); }
      });
      if (i !== actif) {
        chapitres.forEach((c, n) => { if (n === i) c.b.setAttribute('aria-current', 'true'); else c.b.removeAttribute('aria-current'); });
        actif = i;
        centrer();
      }
      const s = Math.floor(t);
      if (temps && (s !== seconde || !temps.textContent)) { seconde = s; temps.textContent = `${horloge(t)} / ${horloge(d)}`; }
    };
    const boucle = () => {
      image = 0;
      majTemps();
      if (!video.paused && !video.ended) image = requestAnimationFrame(boucle);
    };
    const majEtat = () => {
      const enLecture = !video.paused && !video.ended;
      const plein = pleinElement() === cadre;
      racine.toggleAttribute('data-regarde', regarde);
      racine.toggleAttribute('data-lecture', enLecture);
      racine.toggleAttribute('data-son', !video.muted);
      racine.toggleAttribute('data-fin', video.ended);
      racine.toggleAttribute('data-plein', plein);
      if (!enLecture || !regarde) { clearTimeout(minuteur); racine.removeAttribute('data-calme'); }
      etiqueter(bSon, !regarde ? 'Regarder le film avec le son' : video.muted ? 'Remettre le son' : 'Couper le son');
      etiqueter(bJouer, video.ended ? 'Revoir le film' : enLecture ? 'Mettre le film en pause' : 'Lire le film');
      etiqueter(bPlein, plein ? 'Quitter le plein écran' : 'Voir le film en plein écran');
      majTemps();
      if (enLecture && !image) image = requestAnimationFrame(boucle);
    };

    // Pendant le film, les commandes s'effacent quand rien ne bouge ; un geste les ramène.
    const reveiller = () => {
      racine.removeAttribute('data-calme');
      clearTimeout(minuteur);
      if (regarde && !video.paused) minuteur = setTimeout(() => { if (!cadre.matches(':focus-within')) racine.setAttribute('data-calme', ''); }, 2600);
    };

    // Mise en place : les commandes du site remplacent celles du navigateur.
    video.removeAttribute('controls');
    video.muted = true;
    video.loop = true;
    if (commandes) commandes.hidden = false;
    if (bSon) bSon.hidden = false;
    if (bJouer) bJouer.hidden = false;
    const pleinCadre = Boolean((cadre.requestFullscreen || cadre.webkitRequestFullscreen) && (document.fullscreenEnabled || document.webkitFullscreenEnabled));
    const pleinVideo = !pleinCadre && typeof video.webkitEnterFullscreen === 'function'; // iPhone
    if (bPlein && (pleinCadre || pleinVideo)) bPlein.hidden = false;
    racine.setAttribute('data-pret', '');

    mesurer();
    video.addEventListener('loadedmetadata', () => {
      if (Number.isFinite(video.duration) && video.duration > 0) { duree = video.duration; mesurer(); }
      if (attente !== null) { video.currentTime = attente; attente = null; }
      majTemps();
    });
    video.addEventListener('play', () => { voulu = true; majEtat(); reveiller(); });
    video.addEventListener('pause', () => { if (!pauseInterne && !video.ended) voulu = false; pauseInterne = false; majEtat(); });
    video.addEventListener('ended', () => { voulu = false; majEtat(); });
    video.addEventListener('seeked', majTemps);
    video.addEventListener('timeupdate', () => { if (!image) majTemps(); });
    video.addEventListener('volumechange', majEtat);

    if (bSon) bSon.addEventListener('click', () => {
      if (!regarde) { regarder(); return; }
      video.muted = !video.muted;
      majEtat();
    });
    if (bJouer) bJouer.addEventListener('click', basculer);
    if (bPlein) bPlein.addEventListener('click', () => {
      if (pleinElement() === cadre) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
      if (pleinCadre) {
        const r = (cadre.requestFullscreen || cadre.webkitRequestFullscreen).call(cadre);
        if (r && r.catch) r.catch(() => {});
        return;
      }
      // iPhone : le plein écran du système, avec ses propres commandes. Il faut que le film soit ouvert.
      try { video.webkitEnterFullscreen(); } catch { if (!regarde) regarder(); }
    });
    document.addEventListener('fullscreenchange', majEtat);
    document.addEventListener('webkitfullscreenchange', majEtat);

    // Un toucher sur l'image : le film avec le son ; ensuite, pause ou lecture. Au doigt, quand les commandes se sont
    // effacées, le premier toucher les ramène seulement.
    cadre.addEventListener('pointerdown', (e) => { toucherCalme = racine.hasAttribute('data-calme') && e.pointerType !== 'mouse'; reveiller(); });
    cadre.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') reveiller(); });
    racine.addEventListener('focusin', reveiller);
    video.addEventListener('click', () => {
      if (toucherCalme) { toucherCalme = false; return; }
      if (!regarde) regarder(); else basculer();
    });

    chapitres.forEach((c) => c.b.addEventListener('click', () => {
      if (!regarde) chapitreChoisi = true;
      aller(c.t);
      if (regarde || (!calme.matches && !econome)) { voulu = true; jouer(); } else charger();
      majEtat();
    }));

    // À l'écran à moitié : il tourne. Presque sorti : il s'arrête. Entre les deux, rien ne change.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entrees) => {
        const e = entrees[entrees.length - 1];
        if (e.isIntersecting && (e.intersectionRatio >= 0.5 || e.intersectionRect.height >= innerHeight * 0.6)) aLEcran = true;
        else if (!e.isIntersecting || e.intersectionRatio < 0.2) aLEcran = false;
        else return;
        appliquer();
      }, { threshold: [0, 0.2, 0.5] }).observe(cadre);
    } else { aLEcran = true; appliquer(); }
    document.addEventListener('visibilitychange', appliquer);
    if (calme.addEventListener) calme.addEventListener('change', () => { if (calme.matches && !regarde) { voulu = false; appliquer(); } });

    majEtat();
  });
})();
