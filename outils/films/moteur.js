// Moteur des films du site Sténo. Un film est une page dont chaque image se calcule à partir du temps seul :
// aucune animation CSS, aucune horloge. On peut donc le lire dans un navigateur (boucle) ou le filmer image par
// image (outils/films/capture.swift appelle window.film.aller(t)).
//
//   const f = Film({ duree: 12 });
//   f.piste(el, [0, { o: 0, y: 20 }], [0.6, { o: 1, y: 0 }, 'sortie']);   // clés : [instant, valeurs, courbe]
//   f.chaque((t) => { … });                                               // calcul libre à chaque image
//   f.lancer();
//
// Valeurs d'une piste : x, y (px), s, sx, sy (échelle), r (degrés), o (opacité), f (flou en px) et toute variable
// CSS (« --p »). Plusieurs pistes sur un même élément se composent : les déplacements s'ajoutent, les échelles et
// les opacités se multiplient.
(() => {
  const params = new URLSearchParams(location.search);
  document.documentElement.dataset.theme = params.get('theme') === 'sombre' ? 'dark' : 'light';

  const bezier = (x1, y1, x2, y2) => {
    const ax = 3 * x1 - 3 * x2 + 1, bx = 3 * x2 - 6 * x1, cx = 3 * x1;
    const ay = 3 * y1 - 3 * y2 + 1, by = 3 * y2 - 6 * y1, cy = 3 * y1;
    const X = (u) => ((ax * u + bx) * u + cx) * u;
    const Y = (u) => ((ay * u + by) * u + cy) * u;
    const dX = (u) => (3 * ax * u + 2 * bx) * u + cx;
    return (p) => {
      if (p <= 0) return 0;
      if (p >= 1) return 1;
      let u = p;
      for (let i = 0; i < 8; i += 1) { const d = dX(u); if (Math.abs(d) < 1e-6) break; u -= (X(u) - p) / d; }
      u = Math.min(1, Math.max(0, u));
      return Y(u);
    };
  };
  const COURBES = {
    lin: (p) => p,
    sortie: bezier(0.2, 0.7, 0, 1),      // la courbe du site
    douce: bezier(0.45, 0, 0.15, 1),     // départ et arrivée amortis
    entree: bezier(0.6, 0, 0.9, 0.5),
    ressort: bezier(0.3, 1.35, 0.5, 1),  // léger dépassement
    rebond: bezier(0.3, 1.8, 0.45, 1),
  };
  const borne = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const mel = (a, b, p) => a + (b - a) * p;
  // Avancement de 0 à 1 entre deux instants, passé par une courbe.
  const av = (t, debut, duree, courbe = 'sortie') => COURBES[courbe](borne((t - debut) / duree));
  // Hasard reproductible.
  const hasard = (graine) => { let g = graine; return () => (g = (g * 16807) % 2147483647) / 2147483647; };
  const horloge = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const NEUTRE = { x: 0, y: 0, s: 1, sx: 1, sy: 1, r: 0, o: 1, f: 0 };

  window.Film = ({ duree }) => {
    const pistes = [], libres = [];
    const el = (e) => (typeof e === 'string' ? $(e) : e);

    const piste = (cible, ...cles) => {
      const e = el(cible);
      if (!e) throw new Error(`Piste sans élément : ${cible}`);
      let courant = {};
      const liste = cles.map(([t, v, c]) => { courant = { ...courant, ...v }; return { t, v: courant, c: c || 'sortie' }; });
      // Les valeurs absentes des premières clés prennent celles de la première clé qui les donne.
      const noms = Object.keys(courant);
      for (const n of noms) {
        const premiere = liste.find((k) => n in k.v).v[n];
        for (const k of liste) if (!(n in k.v)) k.v = { ...k.v, [n]: premiere };
      }
      pistes.push({ e, liste, noms });
      return api;
    };
    const lire = ({ liste, noms }, t) => {
      if (t <= liste[0].t) return liste[0].v;
      const fin = liste[liste.length - 1];
      if (t >= fin.t) return fin.v;
      let i = 0;
      while (liste[i + 1].t <= t) i += 1;
      const a = liste[i], b = liste[i + 1];
      const p = COURBES[b.c]((t - a.t) / (b.t - a.t));
      const v = {};
      for (const n of noms) v[n] = mel(a.v[n], b.v[n], p);
      return v;
    };

    // Raccourcis d'écriture
    const entre = (cible, t, { d = 0.6, y = 16, x = 0, s = 1, f = 0, c = 'sortie' } = {}) => piste(cible, [t, { o: 0, x, y, s, f }], [t + d, { o: 1, x: 0, y: 0, s: 1, f: 0 }, c]);
    const sort = (cible, t, { d = 0.4, y = -10, x = 0, s = 1, f = 0, c = 'douce' } = {}) => piste(cible, [t, { o: 1, x: 0, y: 0, s: 1, f: 0 }], [t + d, { o: 0, x, y, s, f }, c]);
    const chaque = (fn) => { libres.push(fn); return api; };

    const rendre = (t) => {
      const etats = new Map();
      for (const p of pistes) {
        const v = lire(p, t);
        let e = etats.get(p.e);
        if (!e) { e = { ...NEUTRE, vars: null }; etats.set(p.e, e); }
        for (const n of p.noms) {
          if (n[0] === '-') (e.vars || (e.vars = {}))[n] = v[n];
          else if (n === 'x' || n === 'y' || n === 'r' || n === 'f') e[n] += v[n];
          else e[n] *= v[n];
        }
      }
      for (const [e, v] of etats) {
        const st = e.style;
        st.transform = `translate3d(${v.x.toFixed(2)}px,${v.y.toFixed(2)}px,0) rotate(${v.r.toFixed(3)}deg) scale(${(v.s * v.sx).toFixed(4)},${(v.s * v.sy).toFixed(4)})`;
        st.opacity = v.o.toFixed(3);
        st.visibility = v.o <= 0.001 ? 'hidden' : 'visible';
        st.filter = v.f > 0.05 ? `blur(${v.f.toFixed(2)}px)` : 'none';
        if (v.vars) for (const n in v.vars) st.setProperty(n, v.vars[n].toFixed(4));
      }
      for (const fn of libres) fn(t);
    };

    let manuel = false;
    const pret = (document.fonts ? document.fonts.ready : Promise.resolve());
    const api = {
      duree, piste, entre, sort, chaque, av, mel, borne, hasard, horloge, COURBES, $, $$,
      lancer() {
        window.film = {
          duree,
          async aller(t) { manuel = true; await pret; rendre(t); void document.body.offsetHeight; return true; },
        };
        pret.then(() => {
          const fixe = params.get('t');
          if (fixe != null) { rendre(Number(fixe)); return; }
          const depart = performance.now();
          const boucle = (maintenant) => {
            if (manuel) return;
            rendre(((maintenant - depart) / 1000) % duree);
            requestAnimationFrame(boucle);
          };
          requestAnimationFrame(boucle);
        });
      },
    };
    return api;
  };
})();
