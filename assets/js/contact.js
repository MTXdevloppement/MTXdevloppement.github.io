(() => {
  const {$: $, $$: $$} = window.MTX;
  const DEST = 'mtxstudio@proton.me';
  const ENDPOINT = `https://formsubmit.co/ajax/${DEST}`;
  const form = $('#form'), status = $('#status'), sendBtn = form.querySelector('[type=submit]');
  const fName = $('#f-name'), fMail = $('#f-mail'), fMsg = $('#f-msg'), fHoney = $('#f-honey');
  const PROJETS = {
    memora: 'Memora',
    triade: 'Triade',
    foulee: 'Foulée',
    synapse: 'Synapse',
    elan: 'Élan',
    viewer: 'MTX Viewer',
    escale: 'Escale',
    maillon: 'Maillon',
    tiroir: 'Tiroir',
    mue: 'Mue',
    'triade-mac': 'Triade pour Mac',
    volta: 'Volta'
  };
  const BESOINS = {
    web: 'c-web',
    app: 'c-app',
    ia: 'c-ia'
  };
  const q = new URLSearchParams(location.search);
  const profil = q.get('profil'), besoin = q.get('besoin'), projet = PROJETS[q.get('projet')];
  if (profil === 'pro' || profil === 'part') $(`#c-${profil}`).checked = true;
  if (BESOINS[besoin] || projet) {
    $$('#form [name=b]').forEach((i => {
      i.checked = false;
    }));
    if (BESOINS[besoin]) $(`#${BESOINS[besoin]}`).checked = true;
    if (projet) {
      $('#c-app').checked = true;
      $('#c-web').checked = true;
    }
  }
  if (projet && !fMsg.value) fMsg.value = `Bonjour, je souhaite un projet dans l’esprit ${/^[aeiouyéèêâîôh]/i.test(projet) ? 'd’' : 'de '}${projet}. `;
  const say = (cls, ...parts) => {
    status.className = `status ${cls}`;
    status.replaceChildren(...parts);
  };
  form.addEventListener('submit', (async e => {
    e.preventDefault();
    if (sendBtn.disabled) return;
    const name = fName.value.trim(), mail = fMail.value.trim(), msg = fMsg.value.trim();
    const invalide = (champ, texte) => {
      say('err', texte);
      champ.setAttribute('aria-invalid', 'true');
      champ.setAttribute('aria-describedby', 'status');
      champ.focus();
      champ.addEventListener('input', (() => {
        champ.removeAttribute('aria-invalid');
        champ.removeAttribute('aria-describedby');
      }), {
        once: true
      });
    };
    if (!name) {
      invalide(fName, 'Indiquez votre nom.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      invalide(fMail, 'Vérifiez votre adresse e-mail.');
      return;
    }
    const done = () => {
      say('ok', `Merci ${name}, votre demande est bien envoyée. Réponse sous 48 h.`);
      form.reset();
    };
    if (fHoney.value) {
      done();
      return;
    }
    const labelOf = i => i.nextElementSibling.textContent;
    const prof = labelOf(form.querySelector('[name=profil]:checked'));
    const bes = $$('#form [name=b]:checked').map(labelOf).join(', ') || 'Non précisé';
    const subject = `Nouvelle demande de projet : ${name}`;
    const body = `Nom : ${name}\nE-mail : ${mail}\nProfil : ${prof}\nBesoin : ${bes}\n\n${msg}`;
    say('', 'Envoi en cours…');
    sendBtn.disabled = true;
    const ctrl = new AbortController, timer = setTimeout((() => ctrl.abort()), 15e3);
    try {
      const r = await fetch(ENDPOINT, {
        method: 'POST',
        signal: ctrl.signal,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          _subject: subject,
          _template: 'table',
          _captcha: 'false',
          Nom: name,
          email: mail,
          Profil: prof,
          Besoin: bes,
          Message: msg || '(vide)'
        })
      });
      const d = await r.json();
      if (!r.ok || String(d.success) !== 'true') throw new Error(d.message || `HTTP ${r.status}`);
      done();
    } catch (err) {
      console.warn('Formulaire non envoyé :', err);
      const a = document.createElement('a');
      a.href = `mailto:${DEST}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      a.textContent = 'Envoyez-la depuis votre messagerie';
      say('err', 'L’envoi n’a pas abouti. ', a, ', la demande est déjà rédigée.');
    } finally {
      clearTimeout(timer);
      sendBtn.disabled = false;
    }
  }));
  const cb = $('#copy');
  cb.addEventListener('click', (() => {
    const sel = () => {
      const r = document.createRange();
      r.selectNodeContents($('#mail'));
      const s = getSelection();
      s.removeAllRanges();
      s.addRange(r);
      cb.textContent = 'Sélectionné';
    };
    try {
      navigator.clipboard.writeText($('#mail').textContent).then((() => {
        cb.textContent = 'Copié';
        setTimeout((() => cb.textContent = 'Copier'), 1600);
      }), sel);
    } catch (e) {
      sel();
    }
  }));
})();
