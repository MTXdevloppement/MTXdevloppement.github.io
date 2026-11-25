# Met les pages de texte (mentions légales, confidentialité, 404) à la barre, au pied de page et aux styles
# communs. Leur contenu propre est conservé. Usage (depuis la racine du dépôt) : python3 outils/generateur/legal.py .
# Le script peut être relancé : il remplace les blocs communs quelle que soit leur version.
import re, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gen

SITE = sys.argv[1]
PAGES = [('mentions-legales.html', './'), ('confidentialite.html', './'), ('404.html', '/')]
CSS_V, JS_V, CONTACT_V = '20', '20', '3'

for name, root in PAGES:
    path = os.path.join(SITE, name)
    s = open(path, encoding='utf8').read()
    p = {'root': root, 'out': name, 'path': name}

    # En-tête : police, feuilles et scripts à jour.
    s = re.sub(r'<link rel="preload" as="font" type="font/woff2" href="[^"]*assets/fonts/[^"]+" crossorigin>',
               f'<link rel="preload" as="font" type="font/woff2" href="{root}assets/fonts/bricolage-latin.woff2" crossorigin>', s)
    s = re.sub(r'assets/css/site\.css\?v=\d+', f'assets/css/site.css?v={CSS_V}', s)
    s = re.sub(r'assets/js/site\.js\?v=\d+', f'assets/js/site.js?v={JS_V}', s)
    s = re.sub(r'assets/js/contact\.js\?v=\d+', f'assets/js/contact.js?v={CONTACT_V}', s)
    s = s.replace('<meta name="theme-color" content="#f4f4f2" media="(prefers-color-scheme: light)">', '<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">')
    s = s.replace('<meta name="theme-color" content="#0b0b0c" media="(prefers-color-scheme: dark)">', '<meta name="theme-color" content="#121212" media="(prefers-color-scheme: dark)">')
    s = re.sub(r'<body class="[^"]*">', '<body>', s)

    # Barre et menu mobile.
    a = s.index('<header class="nav')
    b = s.index('<main id="contenu"')
    s = s[:a] + gen.navbar(p) + '\n' + s[b:]

    # Corps : classes de la nouvelle mise en page.
    s = s.replace('<main id="contenu" class="text-main">\n  <div class="text-grid">', '<main id="contenu" class="text-page">\n  <div class="wrap">')
    s = s.replace('<h1 class="display">', '<h1 class="d1">').replace('<p class="lead">', '<p class="lede">')
    s = s.replace('<div class="eyebrow"><p class="eyebrow-label"><span>Erreur 404</span></p></div>', '<p class="sec-k">Erreur 404</p>')
    s = s.replace('<div class="text-actions">', '<div class="actions text-actions">')
    s = re.sub(r'class="pill pill-black pill-lg"', 'class="btn"', s)
    s = re.sub(r'class="pill pill-white pill-lg"', 'class="btn btn-line"', s)

    # Pied de page et symboles.
    a = s.index('<footer class="')
    b = s.index('</footer>') + len('</footer>')
    s = s[:a] + gen.footer(p).rstrip('\n') + s[b:]
    a = s.index('<p class="sr-only" aria-live="polite" data-live></p>')
    b = s.index('</svg>', a) + len('</svg>\n')
    s = s[:a] + gen.SPRITE + s[b:]

    s = gen.finish(s, {'root': root, 'out': name})
    open(path, 'w', encoding='utf8').write(s)
    print(name, 'ok')

# Politique de confidentialité : la police des pages du studio.
c = os.path.join(SITE, 'confidentialite.html')
s = open(c, encoding='utf8').read()
old = 'Les pages du studio affichent les polices Geist et Geist Mono (licence SIL Open Font License).'
new = 'Les pages du studio affichent la police Bricolage Grotesque (licence SIL Open Font License).'
assert old in s or new in s
s = s.replace(old, new)
open(c, 'w', encoding='utf8').write(s)
print('textes ok')
