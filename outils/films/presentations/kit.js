(() => {
  window.Kit = (f, scene) => {
    const tournage = new URLSearchParams(location.search).has('tournage');
    if (tournage) document.body.classList.add('tournage');
    else {
      const ajuste = () => { const l = scene.offsetWidth, h = scene.offsetHeight; scene.style.transform = `scale(${Math.min(innerWidth / l, innerHeight / h)})`; };
      addEventListener('resize', ajuste); ajuste();
    }
    const el = (tag, cls, parent, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; (parent || scene).appendChild(e); return e; };
    const place = (e, o) => {
      const s = e.style;
      for (const k of ['left', 'top', 'right', 'bottom', 'width', 'height']) if (o[k] != null) s[k] = typeof o[k] === 'number' ? `${o[k]}px` : o[k];
      if (o.x != null) s.left = `${o.x}px`; if (o.y != null) s.top = `${o.y}px`;
      if (o.l != null) s.width = `${o.l}px`; if (o.h != null) s.height = `${o.h}px`;
      if (o.taille) s.fontSize = `${o.taille}px`;
      if (o.origine) s.transformOrigin = o.origine;
      if (o.z != null) s.zIndex = o.z;
      if (o.couleur) s.color = o.couleur;
      if (o.style) Object.assign(s, o.style);
      return e;
    };

    const K = {
      el, place,
      plan: (parent, z) => { const p = el('div', 'plan', parent); if (z != null) p.style.zIndex = z; return p; },

      fond({ halos = [], grain = true } = {}) {
        const c = el('div', 'calque');
        c.style.zIndex = 0;
        const hs = halos.map((h) => { const e = el('div', 'halo', c); e.style.setProperty('--c', h.c); if (h.taille) { e.style.width = e.style.height = `${h.taille}px`; e.style.margin = `${-h.taille / 2}px 0 0 ${-h.taille / 2}px`; } if (h.o != null) e.style.opacity = h.o; return { e, ...h }; });
        f.chaque((t) => {
          for (const h of hs) {
            const a = t * (h.v || 0.08) + (h.p || 0);
            h.e.style.transform = `translate3d(${(h.x + Math.sin(a) * (h.ax || 120)).toFixed(1)}px, ${(h.y + Math.cos(a * 0.8) * (h.ay || 90)).toFixed(1)}px, 0)`;
          }
        });
        if (grain) {
          const g = el('div', 'grain');
          const toile = document.createElement('canvas'); toile.width = toile.height = 220;
          const cx = toile.getContext('2d'); const img = cx.createImageData(220, 220);
          let s = 11; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
          for (let i = 0; i < img.data.length; i += 4) { const v = r() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
          cx.putImageData(img, 0, 0);
          g.style.backgroundImage = `url(${toile.toDataURL()})`;
          f.chaque((t) => { const k = Math.floor(t * 24); g.style.transform = `translate(${(k * 73) % 220}px, ${(k * 151) % 220}px)`; });
        }
        return c;
      },

      titre(parent, lignes, o = {}) {
        const e = place(el('div', `titre ${o.classe || ''}`, parent), o);
        if (o.align) e.style.textAlign = o.align;
        e.innerHTML = lignes.map((l) => `<span class="ligne">${l.replace(/(<[^>]+>)|([^\s<]+)/g, (m, tag, mot) => (tag ? tag : `<span class="mot">${mot}</span>`))}</span>`).join('');
        e.mots = [...e.querySelectorAll('.mot')];
        return e;
      },
      montre(titre, t0, t1, { pas = 0.045, d = 0.75, sortie = 0.45 } = {}) {
        const h = parseFloat(getComputedStyle(titre).fontSize) * 1.15;
        titre.mots.forEach((m, i) => {
          const a = t0 + i * pas;
          const cles = [[a, { y: h, o: 0, r: 4 }], [a + d, { y: 0, o: 1, r: 0 }, 'sortie']];
          if (t1 != null) { const b = t1 + i * pas * 0.5; cles.push([b, { y: 0, o: 1, r: 0 }], [b + sortie, { y: -h, o: 0, r: -3 }, 'entree']); }
          f.piste(m, ...cles);
        });
        return titre;
      },

      voileHaut(parent, h = 260, c = 'var(--fond)') { const v = place(el('div', 'voile-haut', parent), { h }); v.style.background = `linear-gradient(${c} 45%, transparent)`; return v; },
      surtitre(parent, texte, o = {}) { return place(el('div', 'surtitre', parent, texte), o); },
      legende(parent, texte, o = {}) { return place(el('p', 'legende', parent, texte), o); },

      mac(parent, src, o = {}) {
        const e = place(el('div', 'mac', parent), o);
        const i = el('img', '', e); i.src = src; i.alt = '';
        e.img = i;
        return e;
      },
      tel(parent, src, o = {}) {
        const e = place(el('div', 'tel', parent), o);
        const ecran = el('div', 'tel-ecran', e);
        e.ecran = ecran;
        e.images = (Array.isArray(src) ? src : [src]).map((s) => { const i = el('img', '', ecran); i.src = s; i.alt = ''; return i; });
        return e;
      },
      enchaine(images, instants, d = 0.5) {
        images.forEach((img, i) => {
          if (i === 0) { if (instants[0] != null) f.piste(img, [instants[0], { o: 1 }], [instants[0] + d, { o: 0 }, 'douce']); return; }
          const cles = [[instants[i - 1], { o: 0 }], [instants[i - 1] + d, { o: 1 }, 'douce']];
          if (instants[i] != null) cles.push([instants[i], { o: 1 }], [instants[i] + d, { o: 0 }, 'douce']);
          f.piste(img, ...cles);
        });
      },
      puce(parent, html, o = {}) { const e = place(el('div', 'puce', parent, `<i></i><span>${html}</span>`), o); if (o.point) e.querySelector('i').style.background = o.point; return e; },
      touche(parent, texte, o = {}) { return place(el('div', 'touche', parent, texte), o); },
      curseur(parent) {
        const e = el('div', 'curseur', parent, '<svg viewBox="0 0 32 32"><path d="M7 3.5v22.2l5.6-5.3 3.6 8.4 3.6-1.5-3.5-8.3h7.7z" fill="#111" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>');
        return e;
      },
      trajet(curseur, points, clics = []) {
        f.piste(curseur, ...points.map(([t, x, y]) => [t, { x, y }, 'douce']));
        clics.forEach((t) => {
          f.piste(curseur, [t - 0.08, { s: 1 }], [t, { s: 0.86 }, 'lin'], [t + 0.16, { s: 1 }, 'sortie']);
          const pos = () => { const r = curseur.style.transform.match(/translate3d\(([-\d.]+)px, ?([-\d.]+)px/); return r ? [r[1], r[2]] : [0, 0]; };
          const onde = el('div', 'onde', curseur.parentElement);
          f.chaque((tt) => {
            const p = (tt - t) / 0.55;
            if (p < 0 || p > 1) { onde.style.opacity = 0; return; }
            const [x, y] = pos();
            onde.style.opacity = (1 - p).toFixed(3);
            onde.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${(0.3 + p * 0.9).toFixed(3)})`;
          });
        });
      },
      compte(e, t0, d, a, b, fmt = (v) => Math.round(v).toLocaleString('fr-FR')) {
        f.chaque((t) => { const p = f.av(t, t0, d, 'douce'); e.textContent = fmt(a + (b - a) * p); });
      },

      sequence(plan, t0, t1, { entree = 'fondu', sortie = 'fondu', d = 0.6 } = {}) {
        const ent = { fondu: { o: 0, s: 1.02 }, bas: { o: 0, y: 120 }, droite: { o: 0, x: 200 }, zoom: { o: 0, s: 0.92 }, rien: { o: 1 } }[entree];
        const sor = { fondu: { o: 0, s: 0.985 }, haut: { o: 0, y: -120 }, gauche: { o: 0, x: -200 }, zoom: { o: 0, s: 1.08 }, rien: { o: 1 } }[sortie];
        const neutre = { o: 1, x: 0, y: 0, s: 1 };
        const cles = [[t0, { ...neutre, ...ent }], [t0 + d, neutre, 'sortie']];
        if (t1 != null) cles.push([t1 - d, neutre], [t1, { ...neutre, ...sor }, 'entree']);
        f.piste(plan, ...cles);
        return plan;
      },

      fin(parent, { icone, nom, ligne, x, y, taille = 150, signature = 'Une réalisation MTX Studio', site = 'mtx-developpement.fr', t }) {
        const vertical = scene.dataset.format === 'vertical';
        const cx = x ?? (vertical ? 540 : 960), cy = y ?? (vertical ? 860 : 470);
        const ic = place(el('div', 'fin-icone', parent, `<img src="${icone}" alt="">`), { x: cx - 110, y: cy - 260 });
        const n = place(el('div', 'fin-nom', parent, nom), { taille, y: cy - 10 });
        n.style.left = '0'; n.style.right = '0'; n.style.textAlign = 'center';
        const l = place(el('div', 'fin-ligne', parent, ligne), { y: cy + taille * 1.08 + 22 });
        l.style.left = '0'; l.style.right = '0'; l.style.textAlign = 'center';
        const sg = place(el('div', 'signature', parent, `${signature} · <b>${site}</b>`), { y: vertical ? 1700 : 960 });
        sg.style.left = '0'; sg.style.right = '0'; sg.style.justifyContent = 'center';
        f.piste(ic, [t, { o: 0, s: 0.6, y: 30 }], [t + 0.9, { o: 1, s: 1, y: 0 }, 'ressort']);
        f.piste(n, [t + 0.25, { o: 0, y: 40 }], [t + 1.05, { o: 1, y: 0 }, 'sortie']);
        f.piste(l, [t + 0.5, { o: 0, y: 30 }], [t + 1.3, { o: 1, y: 0 }, 'sortie']);
        f.piste(sg, [t + 0.9, { o: 0 }], [t + 1.8, { o: 1 }, 'douce']);
        return { ic, n, l, sg };
      },
    };
    return K;
  };
})();
