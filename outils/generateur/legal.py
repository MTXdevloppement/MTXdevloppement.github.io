# Met les pages de texte (mentions légales, confidentialité, 404) à la nouvelle barre, au nouveau pied de page
# et aux polices servies par le site. Leur contenu propre est conservé, sauf les phrases devenues fausses.
import re, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gen

SITE = sys.argv[1]
PAGES = [('mentions-legales.html', './'), ('confidentialite.html', './'), ('404.html', '/')]

for name, root in PAGES:
    path = os.path.join(SITE, name)
    s = open(path, encoding='utf8').read()
    p = {'root': root, 'out': name}
    nav = gen.navbar(p).replace('<header class="navbar" data-navbar>', '<header class="navbar is-solid" data-navbar>')
    a, b = s.index('<header class="navbar'), s.index('<main id="contenu"')
    s = s[:a] + nav + '\n' + s[b:]
    a, b = s.index('<footer class="footer">'), s.index('</footer>') + len('</footer>')
    s = s[:a] + gen.footer(p).rstrip('\n') + s[b:]
    # Polices : plus de serveur tiers.
    s = re.sub(r'<link rel="preconnect" href="https://db\.onlinewebfonts\.com" crossorigin>\n', '', s)
    s = re.sub(r'<link rel="preload" as="font" type="font/woff2" href="https://db\.onlinewebfonts\.com/[^"]+" crossorigin>\n', '', s, count=1)
    s = re.sub(r'<link rel="preload" as="font" type="font/woff2" href="https://db\.onlinewebfonts\.com/[^"]+" crossorigin>\n',
               f'<link rel="preload" as="font" type="font/woff2" href="{root}assets/fonts/geist-latin.woff2" crossorigin>\n', s, count=1)
    s = s.replace('assets/css/site.css?v=8', 'assets/css/site.css?v=10').replace('assets/js/site.js?v=9', 'assets/js/site.js?v=10')
    for k, v in {**gen.MAILS, **gen.ICONS}.items(): s = s.replace('{{' + k + '}}', v)
    assert 'onlinewebfonts' not in s or name == 'confidentialite.html', name
    open(path, 'w', encoding='utf8').write(s)
    print(name, 'ok')

# Politique de confidentialité : la police n’est plus chargée depuis un service tiers.
c = os.path.join(SITE, 'confidentialite.html')
s = open(c, encoding='utf8').read()
rep = {
    '<li>Pour s’afficher, les pages du studio chargent leur police depuis un service tiers&#8239;; le détail est plus bas. Les images et les vidéos sont hébergées avec le site.</li>':
    '<li>Les polices, les images et les vidéos sont hébergées avec le site&#8239;: pour l’afficher, votre navigateur ne contacte aucun service tiers.</li>',
    '<p>Les pages du studio affichent la police Helvetica Now Display, chargée depuis le service Online Web Fonts (db.onlinewebfonts.com). Pour vous envoyer ces fichiers, ce service reçoit l’adresse IP de votre appareil et les informations techniques habituelles de votre navigateur. Le site ne lui transmet rien d’autre.</p>\n      <p>Les polices employées par les sites des réalisations sont hébergées avec le site, comme les images et les vidéos&#8239;: pour les afficher, votre navigateur ne contacte aucun service tiers.</p>':
    '<p>Les pages du studio affichent les polices Geist et Geist Mono (licence SIL Open Font License). Elles sont hébergées avec le site, comme celles des sites des réalisations, les images et les vidéos&#8239;: pour les afficher, votre navigateur ne contacte aucun service tiers.</p>',
    '<h2>Police des pages du studio</h2>': '<h2>Polices des pages</h2>',
    '<li>Données techniques de l’hébergeur et du service de police&#8239;: selon leurs propres politiques.</li>':
    '<li>Données techniques de l’hébergeur&#8239;: selon sa propre politique.</li>',
    '<p>Le site propose un seul moyen de contact&#8239;: l’adresse e-mail du studio.':
    '<p>Le site propose un seul moyen de contact&#8239;: l’adresse e-mail du studio. Le simulateur de devis calcule l’estimation dans votre navigateur et ne transmet rien&#8239;: il prépare seulement un e-mail, que vous envoyez vous-même si vous le souhaitez.',
    'Mise à jour le 10 novembre 2026.': 'Mise à jour le 25 novembre 2026.',
}
for k, v in rep.items():
    assert k in s or v in s, k[:60]
    s = s.replace(k, v)
assert 'onlinewebfonts' not in s
open(c, 'w', encoding='utf8').write(s)

# Page 404 : orienter vers les trois pôles.
e = os.path.join(SITE, '404.html')
s = open(e, encoding='utf8').read()
rep = {
    '<p class="lead">Les apps du studio, elles, sont toutes là.</p>': '<p class="lead">Le reste du studio, lui, est bien là.</p>',
    'Les pages Services, Formules et Contact de l’ancien site n’existent plus&#8239;: tout tient désormais sur l’accueil.':
    'Les pages Services, Formules et Contact de l’ancien site n’existent plus&#8239;: choisissez votre pôle ci-dessous, ou repartez de l’accueil.',
    '<a class="pill pill-black pill-lg" href="/#realisations">Voir les réalisations</a>\n        <a class="pill pill-white pill-lg" href="/">Revenir à l’accueil</a>':
    '<a class="pill pill-black pill-lg" href="/">Revenir à l’accueil</a>\n        <a class="pill pill-white pill-lg" href="/sites-internet/">Sites internet</a>\n        <a class="pill pill-white pill-lg" href="/applications/">Applications</a>\n        <a class="pill pill-white pill-lg" href="/intelligence-artificielle/">Intelligence artificielle</a>',
}
for k, v in rep.items():
    assert k in s or v in s, k[:60]
    s = s.replace(k, v)
open(e, 'w', encoding='utf8').write(s)
print('textes ok')
