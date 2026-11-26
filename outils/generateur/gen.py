# Assemble les pages statiques de mtx-developpement.fr : en-tête, barre globale, barre locale du pôle,
# menu mobile, pied de page et données structurées communs ; le corps de chaque page vient de pages/*.html.
# Usage (depuis la racine du dépôt) : python3 outils/generateur/gen.py .
import json, re, html, sys, os, hashlib
from urllib.parse import quote

SITE = sys.argv[1] if len(sys.argv) > 1 and __name__ == '__main__' else ''
HERE = os.path.dirname(os.path.abspath(__file__))
O = 'https://mtx-developpement.fr/'
EMAIL = 'mtxstudio@proton.me'

def mailto(subject, body):
    q = lambda s: quote(s, safe='')
    return f'mailto:{EMAIL}?subject={q(subject)}&amp;body={q(body)}'

MAILS = {
    'MAIL_PROJET': mailto('Un projet pour MTX Studio', 'Bonjour Matheo,\n\nMon projet en quelques lignes :\n\n\nType de projet (site internet, application, IA) et appareils visés :\n\n\nÉchéance souhaitée :\n\n'),
    'MAIL_BONJOUR': mailto('Bonjour MTX Studio', 'Bonjour Matheo,\n\n'),
    'MAIL_ORIENTER': mailto('Je ne sais pas par où commencer', 'Bonjour Matheo,\n\nVoici ce que j’aimerais faire (même si ce n’est pas encore clair) :\n\n\nMon entreprise et mon secteur :\n\n'),
    'MAIL_DEVIS': mailto('Devis site internet', 'Bonjour Matheo,\n\nJe souhaite un devis pour un site internet.\n\nEntreprise et secteur :\n\nCréation ou refonte (adresse du site actuel) :\n\nCe que le site doit permettre (présenter, prendre des rendez-vous, vendre…) :\n\nÉchéance souhaitée :\n\n'),
    'MAIL_AUDIT': mailto('Audit gratuit de mon site', 'Bonjour Matheo,\n\nPouvez-vous auditer mon site actuel ?\n\nAdresse du site :\n\nCe qui me gêne aujourd’hui :\n\nMon objectif (plus de contacts, de ventes, de réservations…) :\n\n'),
    'MAIL_APP': mailto('Un projet d’application', 'Bonjour Matheo,\n\nMon idée d’application en quelques lignes :\n\n\nPour qui, et sur quels appareils (iPhone, iPad, Apple Watch, Mac, navigateur) :\n\nCe qui existe déjà (maquettes, site, logiciel actuel) :\n\nÉchéance souhaitée :\n\n'),
    'MAIL_IA': mailto('Un projet d’IA', 'Bonjour Matheo,\n\nLa tâche que j’aimerais confier à une IA :\n\n\nLes documents ou outils concernés (sans données confidentielles dans ce message) :\n\nMes contraintes (confidentialité, budget, délai) :\n\n'),
}

ICONS = {
    'CHECK': '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6.4 4.8 9.2 10 3.4" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    'ARROW': '<svg class="arrow" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8h11M8.5 3.5 13 8l-4.5 4.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    'LOCK': '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2.5 4.5V3.4a2.5 2.5 0 0 1 5 0v1.1M2 4.5h6v4.5H2z" fill="none" stroke="currentColor" stroke-width="1.1"/></svg>',
    'X': '<svg viewBox="0 0 56 70" aria-hidden="true"><use href="#x-mono"/></svg>',
}

POLES = {
    'web': dict(n='01', nom='Sites internet', court='Sites internet', home='sites-internet/', desc='Création et refonte, dès 690&nbsp;€',
        items=[('apercu', 'Vue d’ensemble', 'sites-internet/'), ('refonte', 'Refonte', 'sites-internet/refonte/'),
               ('tarifs', 'Tarifs', 'sites-internet/tarifs/'), ('realisations', 'Réalisations', 'sites-internet/#realisations'),
               ('methode', 'Méthode', 'sites-internet/#methode'), ('questions', 'Questions', 'sites-internet/#questions')],
        cta=('Devis gratuit', 'sites-internet/tarifs/#devis'), cta_court='Devis'),
    'app': dict(n='02', nom='Applications', court='Applications', home='applications/', desc='iPhone, iPad, Apple Watch, Mac et web',
        items=[('creations', 'Ce que je crée', 'applications/#creations'), ('realisations', 'Réalisations', 'applications/#realisations'),
               ('methode', 'Méthode', 'applications/#methode'), ('budget', 'Budget', 'applications/#budget'),
               ('questions', 'Questions', 'applications/#questions')],
        cta=('Parler de mon app', '{{MAIL_APP}}'), cta_court='Contact'),
    'ia': dict(n='03', nom='Intelligence artificielle', court='IA', home='intelligence-artificielle/', desc='Assistants, automatisations, IA locale',
        items=[('usages', 'Cas d’usage', 'intelligence-artificielle/#usages'), ('donnees', 'Vos données', 'intelligence-artificielle/#donnees'),
               ('realisations', 'Réalisations', 'intelligence-artificielle/#realisations'), ('methode', 'Méthode', 'intelligence-artificielle/#methode'),
               ('budget', 'Budget', 'intelligence-artificielle/#budget'), ('questions', 'Questions', 'intelligence-artificielle/#questions')],
        cta=('Parler de mon projet', '{{MAIL_IA}}'), cta_court='Contact'),
}
POLE_NAV = [('web', 'Sites internet'), ('app', 'Applications'), ('ia', 'IA')]

SUN = ('<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/>'
       '<path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.35 5.35l1.55 1.55M17.1 17.1l1.55 1.55M5.35 18.65l1.55-1.55M17.1 6.9l1.55-1.55"/></svg>')
MOON = ('<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true">'
        '<path d="M20.2 14.3A8.4 8.4 0 0 1 9.7 3.8a8.4 8.4 0 1 0 10.5 10.5Z"/></svg>')

def href(root, h):
    return h if h.startswith(('mailto:', '{{', 'http', '#')) else root + h

def navbar(p):
    root, pole = p['root'], p.get('pole')
    home = root or './'
    links = []
    for k, label in POLE_NAV:
        cur = ''
        if pole == k:
            cur = ' aria-current="page"' if p.get('lnav') in ('apercu', None) and p['out'].count('/') == 1 else ' aria-current="true"'
        links.append(f'<a href="{root}{POLES[k]["home"]}" data-pole="{k}"{cur}><i class="swatch" aria-hidden="true"></i>{label}</a>')
    studio = (f'<span class="nav-sep" aria-hidden="true"></span><a href="{root}#realisations">Réalisations</a>'
              f'<a href="{root}#studio">Le studio</a>')
    cls = 'nav' + (' nav-pole' if pole else '')
    colls = ''.join(
        f'  <a class="m-coll" data-pole="{k}" href="{root}{POLES[k]["home"]}"{" aria-current=" + chr(34) + "true" + chr(34) if pole == k else ""} data-close-menu>'
        f'<b>{POLES[k]["nom"]}</b><small>{POLES[k]["desc"]}</small>{{{{ARROW}}}}</a>\n'
        for k, _ in POLE_NAV)
    return (f'<header class="{cls}" data-navbar>\n'
            f'  <div class="wrap nav-in">\n'
            f'    <a class="brand" href="{home}" aria-label="MTX Studio, accueil" translate="no"><svg viewBox="0 0 56 70" aria-hidden="true"><use href="#x-mono"/></svg><span>MTX Studio</span></a>\n'
            f'    <nav class="nav-links" aria-label="Pôles et studio">{"".join(links)}{studio}</nav>\n'
            f'    <div class="nav-actions">\n'
            f'      <button class="icon-btn theme-toggle" type="button" aria-label="Changer de thème" data-theme-toggle>{SUN}{MOON}</button>\n'
            f'      <a class="btn nav-cta" href="{root}#contact">Contact</a>\n'
            f'      <button class="icon-btn menu-toggle" type="button" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="menu-mobile" data-menu-toggle><span></span><span></span><span></span></button>\n'
            f'    </div>\n'
            f'  </div>\n'
            f'</header>\n\n'
            f'<nav class="m-menu" id="menu-mobile" aria-label="Navigation mobile" data-menu>\n'
            f'{colls}'
            f'  <div class="m-more">\n'
            f'    <a href="{home}" data-close-menu>Accueil</a>\n'
            f'    <a href="{root}#realisations" data-close-menu>Réalisations</a>\n'
            f'    <a href="{root}#studio" data-close-menu>Le studio</a>\n'
            f'    <a href="{root}#questions" data-close-menu>Questions</a>\n'
            f'  </div>\n'
            f'  <div class="m-foot">\n'
            f'    <a class="btn" href="{{{{MAIL_PROJET}}}}" data-close-menu>Écrire au studio</a>\n'
            f'    <p>{EMAIL} · réponse sous 48&nbsp;h ouvrées</p>\n'
            f'  </div>\n'
            f'</nav>\n')

def lnav(p):
    pole = p.get('pole')
    if not pole: return ''
    root, P = p['root'], POLES[pole]
    items = []
    for key, label, h in P['items']:
        cur = ' aria-current="page"' if key == p.get('lnav') else ''
        # Une rubrique de la page en cours : simple ancre, sans recharger.
        lien = h[h.index('#'):] if '#' in h and h.split('#')[0] == p['path'] else href(root, h)
        items.append(f'<li><a href="{lien}"{cur}>{label}</a></li>')
    titre = (f'<span class="lnav-long">{P["nom"]}</span><span class="lnav-short">{P["court"]}</span>'
             if P['court'] != P['nom'] else P['nom'])
    return (f'<nav class="lnav" aria-label="Rubriques du pôle {P["nom"]}" data-lnav>\n'
            f'  <div class="wrap lnav-in">\n'
            f'    <a class="lnav-title" href="{root}{P["home"]}"><span class="lnav-n">{P["n"]}</span>{titre}</a>\n'
            f'    <button class="lnav-toggle" type="button" aria-expanded="false" aria-controls="lnav-list" aria-label="Afficher les rubriques" data-lnav-toggle>'
            f'<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4.2 6 8.2l4-4" fill="none" stroke="currentColor" stroke-width="2"/></svg></button>\n'
            f'    <ul class="lnav-list" id="lnav-list" data-lnav-list>{"".join(items)}</ul>\n'
            f'    <a class="btn btn-on lnav-cta" href="{href(root, P["cta"][1])}"><span class="lnav-long">{P["cta"][0]}</span><span class="lnav-short">{P["cta_court"]}</span></a>\n'
            f'  </div>\n'
            f'</nav>\n')

def footer(p):
    root = p['root']
    home = root or './'
    def col(k, links):
        return (f'<nav class="foot-col" data-pole="{k}" aria-labelledby="pied-{k}"><h2 id="pied-{k}"><i class="swatch" aria-hidden="true"></i>{POLES[k]["nom"]}</h2><ul>'
                + ''.join(f'<li><a href="{href(root, h)}">{t}</a></li>' for t, h in links) + '</ul></nav>')
    call = '' if p.get('hub') else (
        '    <div class="foot-call">\n'
        '      <p class="k">Un projet, une question&#8239;? Réponse sous 48&nbsp;h ouvrées</p>\n'
        f'      <a class="foot-mail" href="{{{{MAIL_PROJET}}}}" data-fit><span data-fit-line>{EMAIL}</span></a>\n'
        '    </div>\n')
    cols = '\n      '.join([
        col('web', [('Vue d’ensemble', 'sites-internet/'), ('Refonte', 'sites-internet/refonte/'), ('Tarifs', 'sites-internet/tarifs/'), ('Simulateur de devis', 'sites-internet/tarifs/#devis')]),
        col('app', [('Vue d’ensemble', 'applications/'), ('Ce que je crée', 'applications/#creations'), ('Réalisations', 'applications/#realisations'), ('Budget', 'applications/#budget')]),
        col('ia', [('Vue d’ensemble', 'intelligence-artificielle/'), ('Cas d’usage', 'intelligence-artificielle/#usages'), ('Vos données', 'intelligence-artificielle/#donnees'), ('Budget', 'intelligence-artificielle/#budget')]),
    ])
    return (f'<footer class="foot">\n  <div class="wrap">\n{call}'
            f'    <div class="foot-cols">\n      {cols}\n'
            f'      <nav class="foot-col" aria-labelledby="pied-studio"><h2 id="pied-studio">Studio</h2><ul>\n'
            f'        <li><a href="{home}">Accueil</a></li>\n'
            f'        <li><a href="{root}#realisations">Réalisations</a></li>\n'
            f'        <li><a href="{root}#studio">Le studio</a></li>\n'
            f'        <li><a href="{root}#contact">Contact</a></li>\n'
            f'        <li><a href="{root}mentions-legales.html">Mentions légales</a></li>\n'
            f'        <li><a href="{root}confidentialite.html">Confidentialité</a></li>\n'
            f'        <li><a href="{root}assistance/">Assistance des apps</a></li>\n'
            f'      </ul></nav>\n'
            f'    </div>\n'
            f'    <div class="foot-bottom">\n'
            f'      <span>© 2026 MTX Studio (MTX Développement) · Matheo Merchez EI</span>\n'
            f'      <span>Studio indépendant, partout en France</span>\n'
            f'      <button class="push" type="button" data-theme-toggle><span data-theme-label>Thème sombre</span></button>\n'
            f'      <a href="#contenu" data-top>Haut de page ↑</a>\n'
            f'    </div>\n  </div>\n</footer>\n')

SPRITE = '''<p class="sr-only" aria-live="polite" data-live></p>
<svg width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g-x" x1="30" x2="70" y1="0" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#2997ff"/><stop offset=".4" stop-color="#a78bfa"/><stop offset=".75" stop-color="#ff6ec7"/><stop offset="1" stop-color="#ffb86b"/></linearGradient>
    <symbol id="x-glyph" viewBox="22 15 56 70"><path d="M33 26l34 48M67 26L33 74" fill="none" stroke="url(#g-x)" stroke-width="16" stroke-linecap="round"/></symbol>
    <symbol id="x-mono" viewBox="22 15 56 70"><path d="M33 26l34 48M67 26L33 74" fill="none" stroke="currentColor" stroke-width="16"/></symbol>
  </defs>
</svg>
'''

def txt(s):
    s = re.sub(r'<[^>]+>', '', s)
    s = html.unescape(s)
    return re.sub(r'[  ]', ' ', s).strip()

def faq_ld(body, url):
    faq = []
    for q, a in re.findall(r'<summary><h3>(.*?)</h3>.*?</summary>\s*<p class="faq-a">(.*?)</p>', body, re.S):
        faq.append({"@type": "Question", "name": txt(q), "acceptedAnswer": {"@type": "Answer", "text": txt(a)}})
    return {"@type": "FAQPage", "@id": url + "#questions", "mainEntity": faq} if faq else None

# Chaque fichier CSS ou JS est appelé avec une empreinte de son contenu (?v=…) : quand il change, l’adresse
# change, et les navigateurs reprennent la nouvelle version sans qu’on ait à y penser.
ASSETS = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'assets')

def empreinte(chemin):
    return hashlib.sha1(open(chemin, 'rb').read()).hexdigest()[:10]

def versionne(dossier, nom):
    nom = nom.split('?')[0]
    return f'{nom}?v={empreinte(os.path.join(ASSETS, dossier, nom))}'

def minifie_css(css):
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    css = re.sub(r'\s+', ' ', css)
    css = re.sub(r'\s*([{};])\s*', r'\1', css)
    css = re.sub(r',\s+', ',', css)
    css = re.sub(r':\s+', ':', css)
    return css.replace(';}', '}').strip() + '\n'

def regroupe_css():
    """Assemble site.css et pole.css (les sources) en un seul fichier minifié : mtx.css."""
    src = [os.path.join(ASSETS, 'css', n) for n in ('site.css', 'pole.css')]
    corps = '/* MTX Studio — fichier assemblé par outils/generateur/gen.py depuis site.css et pole.css. Ne pas modifier à la main. */\n'
    corps += ''.join(minifie_css(open(f, encoding='utf8').read()) for f in src)
    open(os.path.join(ASSETS, 'css', 'mtx.css'), 'w', encoding='utf8').write(corps)

def head(p, ld):
    root = p['root']
    url = O + p['path']
    css = ''.join(f'<link rel="stylesheet" href="{root}assets/css/{versionne("css", c)}">\n' for c in p['css'])
    js = ''.join(f'<script src="{root}assets/js/{versionne("js", j)}" defer></script>\n' for j in p['js'])
    og = O + 'assets/img/' + p.get('og', 'og-mtx-studio.png')
    pole_attr = f' data-pole="{p["pole"]}"' if p.get('pole') else ''
    return f'''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{p['title']}</title>
<meta name="description" content="{p['desc']}">
<meta name="author" content="Matheo Merchez">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:locale" content="fr_FR">
<meta property="og:site_name" content="MTX Studio">
<meta property="og:title" content="{p['title']}">
<meta property="og:description" content="{p['desc']}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{p.get('og_alt', 'MTX Studio : sites internet, applications et IA')}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{p['title']}">
<meta name="twitter:description" content="{p['desc']}">
<meta name="twitter:image" content="{og}">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#121212" media="(prefers-color-scheme: dark)">
<link rel="icon" href="{root}assets/img/mtx-icone.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="{root}assets/img/apple-touch-icon.png">
<link rel="manifest" href="{root}site.webmanifest">
<script>(function(d){{try{{var t=localStorage.getItem('mtx-theme');if(t==='dark'||t==='light')d.dataset.theme=t}}catch(e){{}}d.classList.add('js')}})(document.documentElement)</script>
<link rel="preload" as="font" type="font/woff2" href="{root}assets/fonts/bricolage-latin.woff2" crossorigin>
{css}{js}<script type="speculationrules">{{"prefetch":[{{"where":{{"href_matches":["/sites-internet/*","/applications/","/intelligence-artificielle/","/"]}},"eagerness":"moderate"}}]}}</script>
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False, separators=(',', ':'))}</script>
</head>
<body{pole_attr}>
<a class="skip-link" href="#contenu">Aller au contenu</a>

'''

def breadcrumbs(p):
    items = [{"@type": "ListItem", "position": 1, "name": "MTX Studio", "item": O}]
    for i, (n, path) in enumerate(p.get('crumbs', []), start=2):
        items.append({"@type": "ListItem", "position": i, "name": n, "item": O + path})
    return {"@type": "BreadcrumbList", "itemListElement": items}

def finish(out, p):
    for k, v in p.get('tokens', {}).items(): out = out.replace('{{' + k + '}}', v)
    out = out.replace('{{ROOT}}', p['root'])
    for k, v in {**MAILS, **ICONS}.items(): out = out.replace('{{' + k + '}}', v)
    left = re.findall(r'\{\{[A-Z_]+\}\}', out)
    assert not left, (p['out'], left)
    return out

def build(p):
    body = open(os.path.join(HERE, 'pages', p['body']), encoding='utf8').read()
    url = O + p['path']
    graph = []
    if p.get('crumbs'): graph.append(breadcrumbs(p))
    graph.append({"@type": "WebPage", "@id": url + "#page", "url": url, "name": p['title'], "inLanguage": "fr-FR",
                  "isPartOf": {"@id": O + "#site"}, "description": p['desc'],
                  "primaryImageOfPage": O + 'assets/img/' + p.get('og', 'og-mtx-studio.png'),
                  **({"about": {"@id": p['about']}} if p.get('about') else {})})
    for extra in p.get('ld', []): graph.append(extra(body) if callable(extra) else extra)
    f = faq_ld(body, url)
    if f: graph.append(f)
    ld = {"@context": "https://schema.org", "@graph": graph}
    out = head(p, ld) + navbar(p) + lnav(p) + '\n<main id="contenu">\n' + body + '\n</main>\n\n' + footer(p) + '\n' + SPRITE + '</body>\n</html>\n'
    out = finish(out, p)
    dest = os.path.join(SITE, p['out'])
    os.makedirs(os.path.dirname(dest) or '.', exist_ok=True)
    open(dest, 'w', encoding='utf8').write(out)
    print(f"{p['out']:42s} {len(out)//1024:4d} Ko  FAQ:{len(f['mainEntity']) if f else 0}")

if __name__ == '__main__':
    sys.path.insert(0, HERE)
    regroupe_css()
    from config import PAGES
    for p in PAGES: build(p)
