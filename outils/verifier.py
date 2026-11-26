# Vérification du site statique, sans dépendance (Python 3.9+) : fichiers et liens internes, ancres,
# balises SEO, titres en double, données structurées, images sans alt, plan du site, liens externes.
# Usage (depuis la racine du dépôt) : python3 outils/verifier.py      → code de sortie 1 s'il y a une erreur.
import os, re, sys, json, html
from urllib.parse import unquote, urlsplit

RACINE = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else '.')
O = 'https://mtx-developpement.fr/'
erreurs, avis = [], []

pages = []
for d, dirs, files in os.walk(RACINE):
    dirs[:] = [x for x in dirs if not x.startswith('.') and x not in ('outils', 'node_modules')]
    pages += [os.path.join(d, f) for f in files if f.endswith('.html')]

cache = {}
def lire(p):
    if p not in cache: cache[p] = open(p, encoding='utf8').read()
    return cache[p]

def cible(page, url):
    u = unquote(url.split('#')[0].split('?')[0])
    if not u: return page
    base = RACINE if u.startswith('/') else os.path.dirname(page)
    c = os.path.normpath(os.path.join(base, u.lstrip('/')))
    if os.path.isdir(c): c = os.path.join(c, 'index.html')
    return c

def ids(p):
    s = lire(p)
    return set(re.findall(r'\sid="([^"]+)"', s)) | set(re.findall(r'\sname="([^"]+)"', s))

externe = lambda u: re.match(r'^(https?:|mailto:|tel:|data:|blob:|javascript:)', u) or u.startswith('//')
titres, descriptions = {}, {}

for page in sorted(pages):
    nom = os.path.relpath(page, RACINE)
    s = lire(page)
    sans_scripts = re.sub(r'<script[\s\S]*?</script>', '', s)
    redirection = 'http-equiv="refresh"' in s
    noindex = bool(re.search(r'<meta name="robots" content="[^"]*noindex', s))

    # Liens, ressources et ancres internes
    urls = re.findall(r'\s(?:href|src|poster)="([^"]+)"', sans_scripts)
    for srcset in re.findall(r'\ssrcset="([^"]+)"', sans_scripts):
        urls += [x.strip().split(' ')[0] for x in srcset.split(',') if x.strip()]
    for u in urls:
        u = html.unescape(u)
        if u.startswith('{{'): erreurs.append(f'{nom} : jeton non remplacé « {u} »'); continue
        if u.startswith('http://') and 'localhost' not in u and not u.startswith('http://www.w3.org'):
            avis.append(f'{nom} : lien non sécurisé « {u} »')
        if externe(u):
            if u.startswith(O):
                u = '/' + u[len(O):]
            else:
                continue
        c = cible(page, u)
        if not os.path.exists(c):
            erreurs.append(f'{nom} : fichier introuvable « {u} »')
        elif '#' in u and c.endswith('.html'):
            ancre = unquote(u.split('#', 1)[1])
            if ancre and ancre not in ids(c) and ancre not in ('haut', 'contenu', 'top'):
                erreurs.append(f'{nom} : ancre introuvable « {u} »')

    # target=_blank sans rel=noopener
    for a in re.findall(r'<a\s[^>]*target="_blank"[^>]*>', s):
        if 'noopener' not in a and 'noreferrer' not in a: avis.append(f'{nom} : target=_blank sans rel=noopener')

    # Images sans alt
    for img in re.findall(r'<img\s[^>]*>', sans_scripts):
        if not re.search(r'\salt="', img): erreurs.append(f'{nom} : image sans attribut alt « {img[:80]} »')

    # Données structurées
    for bloc in re.findall(r'<script type="application/ld\+json">([\s\S]*?)</script>', s):
        try: json.loads(bloc)
        except Exception as e: erreurs.append(f'{nom} : JSON-LD invalide ({e})')

    if redirection or noindex: continue
    # Balises SEO des pages indexables
    t = re.search(r'<title>(.*?)</title>', s, re.S)
    d = re.search(r'<meta name="description" content="([^"]*)"', s)
    c = re.search(r'<link rel="canonical" href="([^"]+)"', s)
    if not t or not t.group(1).strip(): erreurs.append(f'{nom} : <title> manquant')
    else:
        tt = html.unescape(t.group(1).strip()); titres.setdefault(tt, []).append(nom)
        if len(tt) > 70: avis.append(f'{nom} : titre long ({len(tt)} caractères)')
    if not d: erreurs.append(f'{nom} : meta description manquante')
    else:
        dd = html.unescape(d.group(1)); descriptions.setdefault(dd, []).append(nom)
        if not 70 <= len(dd) <= 170: avis.append(f'{nom} : description de {len(dd)} caractères')
    if not c: erreurs.append(f'{nom} : lien canonique manquant')
    if '<html lang="fr"' not in s: erreurs.append(f'{nom} : attribut lang="fr" manquant')
    n_h1 = len(re.findall(r'<h1[\s>]', s))
    if n_h1 != 1: erreurs.append(f'{nom} : {n_h1} balises h1')
    if 'og:image' not in s: avis.append(f'{nom} : pas d’image de partage (og:image)')

for t, ps in titres.items():
    if len(ps) > 1: erreurs.append(f'Titre en double « {t} » : {", ".join(ps)}')
for d, ps in descriptions.items():
    if len(ps) > 1: erreurs.append(f'Description en double : {", ".join(ps)}')

# Plan du site
plan = lire(os.path.join(RACINE, 'sitemap.xml')) if os.path.exists(os.path.join(RACINE, 'sitemap.xml')) else ''
for loc in re.findall(r'<loc>([^<]+)</loc>', plan):
    if not loc.startswith(O): erreurs.append(f'sitemap : adresse hors domaine {loc}'); continue
    if not os.path.exists(cible(os.path.join(RACINE, 'index.html'), '/' + loc[len(O):])):
        erreurs.append(f'sitemap : page introuvable {loc}')

print(f'{len(pages)} pages vérifiées · {len(erreurs)} erreur(s) · {len(avis)} avis')
for e in erreurs: print('ERREUR', e)
for a in avis: print('avis  ', a)
sys.exit(1 if erreurs else 0)
