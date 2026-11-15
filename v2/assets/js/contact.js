/* MTX Studio — copier l’adresse du studio, sur toutes les pages.
   Un lien qui affiche l’adresse en clair, ou un bouton [data-copy], place
   l’adresse dans le presse-papiers et affiche une bulle « Adresse copiée »
   avec un raccourci vers la messagerie (message pré-rempli du lien).
   Sans JavaScript, ces liens ouvrent simplement la messagerie. */
(() => {
  'use strict';

  const ADRESSE = /^[\w.+-]+@[\w-]+(\.[\w-]+)+$/;
  const DUREE = 4200;

  const CSS = `
.mtx-copie{position:fixed;left:50%;bottom:calc(22px + env(safe-area-inset-bottom,0px));z-index:2147483000;
  display:flex;align-items:center;gap:12px;max-width:calc(100vw - 32px);box-sizing:border-box;
  padding:10px 10px 10px 12px;border-radius:999px;color:#fff;background:rgba(24,24,27,.9);
  -webkit-backdrop-filter:saturate(1.6) blur(18px);backdrop-filter:saturate(1.6) blur(18px);
  box-shadow:0 18px 50px -12px rgba(0,0,0,.45),0 0 0 1px rgba(255,255,255,.1) inset;
  font:inherit;font-size:15px;line-height:1.2;letter-spacing:normal;text-align:left;
  opacity:0;transform:translate(-50%,24px) scale(.92);pointer-events:none;
  transition:opacity .22s ease,transform .5s cubic-bezier(.2,1.4,.4,1)}
.mtx-copie.est-visible{opacity:1;transform:translate(-50%,0) scale(1);pointer-events:auto}
.mtx-copie-coche{flex:none;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;
  background:linear-gradient(135deg,#2997ff,#a78bfa 45%,#ff6ec7 80%,#ffb86b)}
.mtx-copie-coche svg{width:16px;height:16px;fill:none;stroke:#fff;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}
.mtx-copie-coche path{stroke-dasharray:20;stroke-dashoffset:20}
.mtx-copie.est-visible .mtx-copie-coche{animation:mtx-copie-pop .55s cubic-bezier(.2,1.6,.4,1) .08s both}
.mtx-copie.est-visible .mtx-copie-coche path{animation:mtx-copie-trait .38s ease-out .26s forwards}
.mtx-copie-texte{display:flex;flex-direction:column;min-width:0}
.mtx-copie-texte b{font-weight:600;white-space:nowrap}
.mtx-copie-texte span{font-size:13px;opacity:.7;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mtx-copie-mail{flex:none;margin-left:4px;padding:8px 14px;border-radius:999px;color:#18181b;background:#fff;
  font-size:13px;font-weight:600;text-decoration:none;white-space:nowrap}
.mtx-copie-mail:hover{background:#e9e9ee}
.mtx-copie-mail:focus-visible{outline:2px solid #2997ff;outline-offset:2px}
@keyframes mtx-copie-pop{from{transform:scale(.3)}to{transform:scale(1)}}
@keyframes mtx-copie-trait{to{stroke-dashoffset:0}}
@media (max-width:420px){.mtx-copie-texte span{display:none}}
@media (prefers-reduced-motion:reduce){
  .mtx-copie{transition:opacity .2s ease;transform:translate(-50%,0)}
  .mtx-copie.est-visible .mtx-copie-coche{animation:none}
  .mtx-copie-coche path{stroke-dashoffset:0;animation:none!important}}`;

  let bulle = null;
  let minuteur = 0;

  const creerBulle = () => {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    bulle = document.createElement('div');
    bulle.className = 'mtx-copie';
    bulle.setAttribute('role', 'status');
    bulle.setAttribute('aria-live', 'polite');
    bulle.innerHTML = '<span class="mtx-copie-coche" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M3.5 8.5l3 3 6-7"/></svg></span>'
      + '<span class="mtx-copie-texte"><b>Adresse copiée</b><span></span></span>'
      + '<a class="mtx-copie-mail" tabindex="-1">Ouvrir Mail</a>';
    // La bulle reste affichée tant que la souris ou le focus est dessus.
    bulle.addEventListener('pointerenter', () => clearTimeout(minuteur));
    bulle.addEventListener('pointerleave', programmerFermeture);
    bulle.addEventListener('focusin', () => clearTimeout(minuteur));
    bulle.addEventListener('focusout', programmerFermeture);
    bulle.querySelector('.mtx-copie-mail').addEventListener('click', fermer);
    document.body.appendChild(bulle);
  };

  function fermer() {
    if (!bulle) return;
    bulle.classList.remove('est-visible');
    bulle.querySelector('.mtx-copie-mail').tabIndex = -1;
  }
  function programmerFermeture() {
    clearTimeout(minuteur);
    minuteur = setTimeout(fermer, DUREE);
  }

  const montrer = (adresse, mailto) => {
    if (!bulle) creerBulle();
    bulle.querySelector('.mtx-copie-texte span').textContent = adresse;
    const lien = bulle.querySelector('.mtx-copie-mail');
    lien.href = mailto || 'mailto:' + adresse;
    lien.tabIndex = 0;
    // Relance l’animation si la bulle était déjà ouverte.
    bulle.classList.remove('est-visible');
    void bulle.offsetWidth;
    bulle.classList.add('est-visible');
    programmerFermeture();
  };

  const copier = async (texte) => {
    try {
      await navigator.clipboard.writeText(texte);
      return true;
    } catch {
      const zone = document.createElement('textarea');
      zone.value = texte;
      zone.setAttribute('readonly', '');
      zone.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      document.body.appendChild(zone);
      zone.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch { ok = false; }
      zone.remove();
      return ok;
    }
  };

  // Le libellé d’un bouton [data-copy-text] passe à « Adresse copiée » un instant.
  const libelle = (bouton) => {
    const el = bouton.querySelector('[data-copy-text]');
    if (!el) return;
    if (!el.dataset.copyOriginal) el.dataset.copyOriginal = el.textContent;
    el.textContent = 'Adresse copiée';
    clearTimeout(Number(el.dataset.copyTimer));
    el.dataset.copyTimer = setTimeout(() => { el.textContent = el.dataset.copyOriginal; }, 2200);
  };

  document.addEventListener('click', async (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const cible = e.target.closest('[data-copy], a[href^="mailto:"]');
    if (!cible || cible.closest('.mtx-copie')) return;

    let adresse;
    let mailto = null;
    if (cible.matches('[data-copy]')) {
      adresse = cible.dataset.copy;
      mailto = cible.dataset.copyMailto || null;
    } else {
      // Seuls les liens qui affichent l’adresse elle-même la copient ;
      // les boutons d’action (« Écrire au studio »…) ouvrent la messagerie.
      const texte = cible.textContent.trim();
      if (!ADRESSE.test(texte)) return;
      adresse = texte;
      mailto = cible.getAttribute('href');
    }

    e.preventDefault();
    if (await copier(adresse)) {
      libelle(cible);
      montrer(adresse, mailto);
    } else {
      window.location.href = mailto || 'mailto:' + adresse;
    }
  });

  addEventListener('keydown', (e) => { if (e.key === 'Escape') fermer(); });
})();
