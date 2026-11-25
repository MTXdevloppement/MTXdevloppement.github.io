# Pages du site et données partagées (réalisations, offres) pour gen.py.
import re, html as H

O = 'https://mtx-developpement.fr/'
POLE_NOMS = {'web': 'Sites internet', 'app': 'Applications', 'ia': 'IA'}

# dossier, image, nom, catégorie, phrase, technologies, pôles, appel
WORKS = {
    'foulee': ('gorun', 'GoRun', 'App iPhone et Apple Watch · Course à pied', 'GoRun, l’app de course à pied qui vous fait courir contre votre record.', 'SwiftUI, HealthKit, watchOS, Live Activities', ['app'], 'Essayer la démo'),
    'space': ('space', 'Space', 'Jeu iPhone · Arcade à un doigt', 'Space, le jeu d’arcade à un doigt où chaque tap envoie la bille d’une orbite à l’autre.', 'SwiftUI, SpriteKit, AVFoundation', ['app'], 'Jouer dans la page'),
    'viewer': ('viewer', 'MTX Viewer', 'App iPhone et iPad · Développement web', 'MTX Viewer vérifie qu’un site web s’affiche bien partout, depuis un iPhone.', 'SwiftUI, WebKit', ['app', 'web'], 'Essayer la démo'),
    'volta': ('volta', 'Volta', 'Logiciel Mac sur mesure · Gestion de stock', 'Volta tient le stock, les devis et le budget d’un service électricité, sur un Mac.', 'SwiftUI, Swift Charts, SQLite (GRDB)', ['app'], 'Visiter l’app'),
    'triade': ('triade', 'Triade', 'App iPhone et iPad · Bureautique', 'Triade réunit texte, tableur et présentation dans une seule app, même sans Internet.', 'SwiftUI, UIKit, Foundation Models, App Intents', ['app', 'ia'], 'Essayer la démo'),
    'knowledge-ai': ('knowledge-ai', 'Knowledge AI', 'Application web · IA locale', 'Knowledge AI répond avec une IA qui tourne sur le Mac, et cite chacune de ses sources.', 'Python, FastAPI, Next.js, Ollama, SQLite', ['web', 'ia'], 'Suivre une recherche'),
    'steno': ('steno', 'Sténo', 'App iPhone et iPad · Prise de notes', 'Sténo transforme vos mémos vocaux en notes claires et en tâches à faire.', 'SwiftUI, Foundation Models, SpeechAnalyzer, App Intents, WidgetKit', ['app', 'ia'], 'Essayer la démo'),
    'mue': ('mue', 'Mue', 'Utilitaire Mac · Conversion de fichiers', 'Mue convertit, retouche et range vos fichiers d’un seul geste, sans quitter le Mac.', 'Swift, SwiftUI, AppKit, AVFoundation, PDFKit', ['app'], 'Essayer le geste'),
    'kompagnion': ('kompagnion', 'Kompagnion', 'App iPhone · Gestion d’entreprise', 'Kompagnion réunit clients, projets, demandes et factures dans votre iPhone.', 'SwiftUI, SwiftData, PDFKit, Liquid Glass', ['app'], 'Essayer la démo'),
    'startup3d': ('startup3d', 'Startup3D', 'Application web · 3D temps réel', 'Startup3D met l’entreprise en volume&#8239;: on la gère en traversant son agence.', 'React, TypeScript, Three.js, React Three Fiber', ['web', 'ia'], 'Entrer dans l’agence'),
}
ORDRE = ['foulee', 'space', 'viewer', 'volta', 'triade', 'knowledge-ai', 'steno', 'mue', 'kompagnion', 'startup3d']
IMG = 'assets/img/realisations/'

def pic(root, img, theme, sizes, mobile=True, lazy=True, alt=''):
    b = f'{root}{IMG}site-{img}-{theme}'
    m = f'{root}{IMG}mobile-{img}-{theme}'
    mob = (f'<source media="(max-width: 639px)" type="image/avif" srcset="{m}.avif">'
           f'<source media="(max-width: 639px)" type="image/webp" srcset="{m}.webp">') if mobile else ''
    return (f'<picture class="work-shot work-shot-{theme}">{mob}'
            f'<source type="image/avif" srcset="{b}-720.avif 720w, {b}.avif 1440w, {b}-2160.avif 2160w" sizes="{sizes}">'
            f'<img src="{b}-720.webp" srcset="{b}-720.webp 720w, {b}.webp 1440w" sizes="{sizes}" width="1440" height="900" alt="{alt}"{" loading=\"lazy\"" if lazy else ""} decoding="async"></picture>')

def swatches(poles):
    return '<span class="ix-poles" aria-hidden="true">' + ''.join(f'<i class="swatch" data-pole="{k}" title="{POLE_NOMS[k]}"></i>' for k in poles) + '</span>'

def work_index(key, root, n):
    img, nom, cat, phrase, tech, poles, cta = WORKS[key]
    return (f'          <li id="r-{key}"><a class="ix-row" href="{root}realisations/{key}/" data-key="{key}">'
            f'<span class="ix-n" aria-hidden="true">{n:02d}</span>'
            f'<img class="ix-icon" src="{root}{IMG}icone-{img}.webp" width="160" height="160" alt="" loading="lazy" decoding="async">'
            f'<span class="ix-txt"><span class="ix-name">{nom}</span><span class="ix-cat">{cat}</span></span>'
            f'{swatches(poles)}<span class="ix-go" aria-hidden="true">{cta}</span></a></li>')

def work_preview(key, root, first):
    img, nom, cat, phrase, tech, poles, cta = WORKS[key]
    sizes = '(min-width: 1440px) 560px, 40vw'
    return (f'          <figure class="ix-p{" is-on" if first else ""}" data-key="{key}">{pic(root, img, "clair", sizes, mobile=False)}{pic(root, img, "sombre", sizes, mobile=False)}'
            f'<figcaption>{phrase}</figcaption></figure>')

def work_fig(key, root, n, sizes='(min-width: 1440px) 680px, (min-width: 640px) 46vw, 92vw', idp='w-'):
    img, nom, cat, phrase, tech, poles, cta = WORKS[key]
    return f'''<li class="fig" id="{idp}{key}">
  <a href="{root}realisations/{key}/" aria-describedby="{idp}{key}-d">
    <div class="fig-media">{pic(root, img, 'clair', sizes, alt=f'Aperçu du site de {nom}, en thème clair')}{pic(root, img, 'sombre', sizes, alt=f'Aperçu du site de {nom}, en thème sombre')}</div>
    <div class="fig-cap"><img class="fig-icon" src="{root}{IMG}icone-{img}.webp" width="160" height="160" alt="" loading="lazy" decoding="async"><h3 class="fig-name">{nom}</h3><span class="fig-cat">{cat}</span><span class="fig-go">{cta}</span><p class="fig-text" id="{idp}{key}-d">{phrase}</p><p class="fig-tech">{tech}</p></div>
  </a>
</li>'''

def works(keys, root, fn, **kw):
    if fn is work_index: return '\n'.join(work_index(k, root, i + 1) for i, k in enumerate(keys))
    if fn is work_preview: return '\n'.join(work_preview(k, root, i == 0) for i, k in enumerate(keys))
    return '\n'.join(fn(k, root, i + 1, **kw) for i, k in enumerate(keys))

# ---------- Données structurées ------------------------------------------------

ORG = {"@type": "Organization", "@id": O + "#studio", "name": "MTX Studio", "legalName": "Matheo Merchez EI", "url": O,
       "logo": O + "assets/img/apple-touch-icon.png", "image": O + "assets/img/og-mtx-studio.png", "email": "mtxstudio@proton.me",
       "description": "MTX Studio conçoit des sites internet, des applications (iPhone, iPad, Apple Watch, Mac, web) et des solutions d’intelligence artificielle pour les entreprises.",
       "founder": {"@type": "Person", "@id": O + "#matheo", "name": "Matheo Merchez", "jobTitle": "Fondateur, designer et développeur"},
       "alternateName": ["MTX Développement", "MTX"], "areaServed": {"@type": "Country", "name": "France"}, "knowsLanguage": "fr",
       "contactPoint": {"@type": "ContactPoint", "email": "mtxstudio@proton.me", "contactType": "sales", "availableLanguage": ["fr"]},
       "knowsAbout": ["Création de sites internet", "Refonte de sites internet", "Référencement naturel", "Développement d’applications iOS", "Développement d’applications macOS", "Swift", "SwiftUI", "Applications web", "TypeScript", "React", "Python", "Intelligence artificielle", "IA locale", "Assistants documentaires", "Automatisation"],
       "makesOffer": [
           {"@type": "Offer", "itemOffered": {"@id": O + "sites-internet/#service"}},
           {"@type": "Offer", "itemOffered": {"@id": O + "applications/#service"}},
           {"@type": "Offer", "itemOffered": {"@id": O + "intelligence-artificielle/#service"}}]}
SITE_LD = {"@type": "WebSite", "@id": O + "#site", "url": O, "name": "MTX Studio", "inLanguage": "fr-FR", "publisher": {"@id": O + "#studio"}, "alternateName": ["MTX Développement", "mtx-developpement.fr"]}
ITEMS = {"@type": "ItemList", "@id": O + "#realisations", "name": "Réalisations de MTX Studio", "numberOfItems": len(ORDRE),
         "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": WORKS[k][1], "description": H.unescape(WORKS[k][3]).replace(' ', ' '), "url": O + f"realisations/{k}/"} for i, k in enumerate(ORDRE)]}

def service(path, nom, stype, desc, audience, catalog=None):
    s = {"@type": "Service", "@id": O + path + "#service", "name": nom, "serviceType": stype, "url": O + path, "description": desc,
         "provider": {"@id": O + "#studio"}, "areaServed": {"@type": "Country", "name": "France"}, "availableLanguage": "fr",
         "audience": {"@type": "BusinessAudience", "audienceType": audience}}
    if catalog: s["hasOfferCatalog"] = catalog
    return s

def web_catalog(body):
    def t(s): return re.sub(r'\s+', ' ', H.unescape(re.sub(r'<[^>]+>', '', s))).replace(' ', ' ').strip()
    offers = []
    for m in re.finditer(r'data-plan="(\w+)" data-nom="([^"]+)" data-creation="(\d+)" data-refonte="(\d+)".*?<p class="p-plan-for">(.*?)</p>', body, re.S):
        key, nom, c, r, d = m.groups()
        for mode, prix in (("Création", c), ("Refonte", r)):
            offers.append({"@type": "Offer", "name": f"{mode} · {nom}", "description": t(d),
                           "priceSpecification": {"@type": "PriceSpecification", "price": int(prix), "priceCurrency": "EUR", **({"minPrice": int(prix)} if key == "boutique" else {}), "valueAddedTaxIncluded": False},
                           "url": O + "sites-internet/tarifs/#formules"})
    return {"@type": "OfferCatalog", "name": "Formules de sites internet", "itemListElement": offers}

WEB_SERVICE_DESC = "Sites vitrines, sites sur mesure et boutiques en ligne pour les entreprises de toutes tailles et de tous secteurs, créés de zéro ou refaits à partir d’un site existant : design sur mesure, rapides, adaptés au mobile et optimisés pour Google."

PAGES = [
    dict(out='index.html', path='', root='', body='accueil.html', css=['site.css?v=20', 'pole.css?v=20'], js=['site.js?v=20', 'pole.js?v=20', 'contact.js?v=3'],
         title='MTX Studio · Sites internet, applications et IA',
         desc='Création de sites internet, d’applications iPhone, Mac et web, et de solutions d’IA pour les entreprises. Prix fixes, un seul interlocuteur.',
         about=O + '#studio', ld=[ORG, SITE_LD, ITEMS],
         hub=True,
         tokens={'WORKS_HUB': works(ORDRE, '', work_index), 'WORKS_PREVIEW': works(ORDRE, '', work_preview)}),
    dict(out='sites-internet/index.html', path='sites-internet/', root='../', pole='web', lnav='apercu', body='web.html',
         css=['site.css?v=20', 'pole.css?v=20'], js=['site.js?v=20', 'pole.js?v=20', 'contact.js?v=3'],
         title='Création de site internet pour entreprise · MTX Studio',
         desc='Création et refonte de sites internet pour les entreprises : sur mesure, rapides, bien référencés. Prix fixe dès 690 €, devis gratuit sous 48 h.',
         og='og-sites-internet.png', og_alt='MTX Studio, création de sites internet pour les entreprises',
         crumbs=[('Sites internet', 'sites-internet/')], about=O + 'sites-internet/#service',
         ld=[lambda b: service('sites-internet/', 'Création et refonte de sites internet pour entreprises', 'Création de site internet', WEB_SERVICE_DESC, 'Entreprises, indépendants, commerces, PME, startups et associations')],
         tokens={'WORKS_WEB': works(['volta', 'startup3d', 'knowledge-ai', 'steno', 'kompagnion', 'mue'], '../', work_fig, idp='w-')}),
    dict(out='sites-internet/tarifs/index.html', path='sites-internet/tarifs/', root='../../', pole='web', lnav='tarifs', body='web-tarifs.html',
         css=['site.css?v=20', 'pole.css?v=20'], js=['site.js?v=20', 'pole.js?v=20', 'contact.js?v=3'],
         title='Tarifs création de site internet · MTX Studio',
         desc='Prix d’un site internet pour entreprise : formules à prix fixe de 690 € à 2 490 €, boutique dès 2 990 €, refonte dès 590 €. Simulateur de devis.',
         og='og-sites-internet.png', og_alt='Tarifs de création de site internet, MTX Studio',
         crumbs=[('Sites internet', 'sites-internet/'), ('Tarifs', 'sites-internet/tarifs/')], about=O + 'sites-internet/#service',
         ld=[lambda b: service('sites-internet/', 'Création et refonte de sites internet pour entreprises', 'Création de site internet', WEB_SERVICE_DESC, 'Entreprises, indépendants, commerces, PME, startups et associations', web_catalog(b))]),
    dict(out='sites-internet/refonte/index.html', path='sites-internet/refonte/', root='../../', pole='web', lnav='refonte', body='web-refonte.html',
         css=['site.css?v=20', 'pole.css?v=20'], js=['site.js?v=20', 'pole.js?v=20', 'contact.js?v=3'],
         title='Refonte de site internet · MTX Studio',
         desc='Refonte de site internet sans perdre votre référencement : audit gratuit, redirections, site plus rapide et adapté au mobile. Prix fixe dès 590 €.',
         og='og-sites-internet.png', og_alt='Refonte de site internet, MTX Studio',
         crumbs=[('Sites internet', 'sites-internet/'), ('Refonte', 'sites-internet/refonte/')], about=O + 'sites-internet/refonte/#service',
         ld=[service('sites-internet/refonte/', 'Refonte de site internet', 'Refonte de site internet', 'Refonte complète d’un site existant : audit gratuit, reprise des contenus, nouveau design, performances, plan de redirections pour conserver le référencement, suivi après la bascule.', 'Entreprises qui ont déjà un site')]),
    dict(out='applications/index.html', path='applications/', root='../', pole='app', lnav=None, body='apps.html',
         css=['site.css?v=20', 'pole.css?v=20', 'scene.css?v=8'], js=['site.js?v=20', 'pole.js?v=20', 'scene.js?v=14', 'contact.js?v=3'],
         title='Création d’applications iPhone, Mac et web · MTX Studio',
         desc='Création d’applications iPhone, iPad, Apple Watch et Mac, de logiciels métier et d’applications web, jusqu’à l’App Store. Devis gratuit à prix fixe.',
         og='og-applications.png', og_alt='MTX Studio, création d’applications iPhone, Mac et web',
         crumbs=[('Applications', 'applications/')], about=O + 'applications/#service',
         ld=[service('applications/', 'Création d’applications iPhone, iPad, Apple Watch, Mac et web', 'Développement d’applications', 'Conception et développement d’apps natives en Swift et SwiftUI pour iPhone, iPad, Apple Watch et Mac, de logiciels métier et d’applications web, du cadrage à la publication sur l’App Store.', 'Entreprises, startups et indépendants')],
         tokens={'WORKS_APP': works(['foulee', 'space', 'viewer', 'volta', 'triade', 'steno', 'mue', 'kompagnion'], '../', work_fig, idp='a-')}),
    dict(out='intelligence-artificielle/index.html', path='intelligence-artificielle/', root='../', pole='ia', lnav=None, body='ia.html',
         css=['site.css?v=20', 'pole.css?v=20'], js=['site.js?v=20', 'pole.js?v=20', 'contact.js?v=3'],
         title='Intelligence artificielle pour les entreprises · MTX Studio',
         desc='Assistants IA sur vos documents qui citent leurs sources, automatisations et IA locale pour les entreprises. Données protégées, devis gratuit.',
         og='og-ia.png', og_alt='MTX Studio, intelligence artificielle pour les entreprises',
         crumbs=[('Intelligence artificielle', 'intelligence-artificielle/')], about=O + 'intelligence-artificielle/#service',
         ld=[service('intelligence-artificielle/', 'Solutions d’intelligence artificielle pour les entreprises', 'Intégration d’intelligence artificielle', 'Assistants qui répondent à partir de vos documents en citant leurs sources, automatisation de tâches répétitives, IA intégrée à un site, une app ou un logiciel, et IA locale quand les données doivent rester dans l’entreprise.', 'Entreprises, PME et indépendants')],
         tokens={'WORKS_IA': works(['knowledge-ai', 'steno', 'triade', 'startup3d'], '../', work_fig, idp='i-')}),
]

# ---------- Vitrine du pôle Sites internet : de vrais sites du studio ------------
SHOW = ['volta', 'startup3d', 'knowledge-ai', 'steno', 'kompagnion']

def show_browser(root):
    out = []
    for i, k in enumerate(SHOW):
        img, nom = WORKS[k][0], WORKS[k][1]
        sizes = '(min-width: 1520px) 800px, (min-width: 1024px) 52vw, 92vw'
        b = f'{root}{IMG}site-{img}'
        def p(theme, eager):
            att = ' fetchpriority="high"' if eager else ' loading="lazy"'
            return (f'<picture class="work-shot work-shot-{theme}"><source type="image/avif" srcset="{b}-{theme}-720.avif 720w, {b}-{theme}.avif 1440w" sizes="{sizes}">'
                    f'<img src="{b}-{theme}-720.webp" srcset="{b}-{theme}-720.webp 720w, {b}-{theme}.webp 1440w" sizes="{sizes}" width="1440" height="900" alt="Page d’accueil du site de {nom}, sur ordinateur"{att} decoding="async"></picture>')
        out.append(f'<div class="p-slide" data-slide-key="{k}"{"" if i == 0 else " hidden"}>{p("clair", i == 0)}{p("sombre", False)}</div>')
    return '\n'.join(out)

def show_phone(root):
    out = []
    for i, k in enumerate(SHOW):
        img = WORKS[k][0]
        m = f'{root}{IMG}mobile-{img}'
        pics = ''.join(f'<picture class="work-shot work-shot-{t}"><source type="image/avif" srcset="{m}-{t}.avif"><img src="{m}-{t}.webp" width="780" height="1688" alt="" loading="lazy" decoding="async"></picture>' for t in ('clair', 'sombre'))
        out.append(f'<div class="p-slide" data-slide-key="{k}"{"" if i == 0 else " hidden"}>{pics}</div>')
    return '\n'.join(out)

def show_tabs(root):
    out = []
    for i, k in enumerate(SHOW):
        img, nom = WORKS[k][0], WORKS[k][1]
        out.append(f'<button class="p-tab" type="button" role="tab" id="tab-{k}" aria-selected="{"true" if i == 0 else "false"}" tabindex="{0 if i == 0 else -1}" aria-controls="vitrine" data-slide="{k}" data-nom="{nom}" data-url="mtx-developpement.fr/realisations/{k}/" data-href="{root}realisations/{k}/"><img src="{root}{IMG}icone-{img}.webp" width="160" height="160" alt="" decoding="async">{nom}</button>')
    return '\n'.join(out)

for p in PAGES:
    if p['out'] == 'sites-internet/index.html':
        p['tokens'].update({'SHOW_BROWSER': show_browser('../'), 'SHOW_PHONE': show_phone('../'), 'SHOW_TABS': show_tabs('../')})

# ---------- Scène iPhone et Apple Watch (reprise de l’ancien accueil) ------------
import os as _os
_src = open(_os.path.join(_os.path.dirname(_os.path.abspath(__file__)), 'ancien-index.html'), encoding='utf8').read()
_a = _src.index('  <!-- Scène : l’écran d’accueil du studio')
_b = _src.index('  <div class="sheet">')
SCENE = _src[_a:_b]
SCENE = SCENE.replace('<div class="scene" data-scene ', '<div class="scene" data-scene data-racine="../" ')
SCENE = SCENE.replace('src="assets/', 'src="../assets/').replace('href="realisations/', 'href="../realisations/').replace('href="#studio"', 'href="../#studio"')
SCENE = re.sub(r'href="mailto:[^"]*"', 'href="{{MAIL_APP}}"', SCENE)
assert 'data-racine' in SCENE and 'src="assets/' not in SCENE
for p in PAGES:
    if p['out'] == 'applications/index.html':
        p['tokens']['SCENE'] = SCENE
