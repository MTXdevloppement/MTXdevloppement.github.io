# Régénère sitemap.xml : toutes les pages indexables (ni noindex, ni redirection), hors outils/.
# lastmod = date du dernier commit qui touche la page, ou aujourd'hui si elle est modifiée et pas encore commitée.
# Usage (depuis la racine du dépôt) : python3 outils/generateur/plan.py .
import os, re, sys, subprocess, datetime
SITE = sys.argv[1] if len(sys.argv) > 1 else '.'
O = 'https://mtx-developpement.fr/'
PRIORITE = ['index.html', 'sites-internet/index.html', 'sites-internet/tarifs/index.html', 'sites-internet/refonte/index.html',
            'applications/index.html', 'intelligence-artificielle/index.html']
today = datetime.date.today().isoformat()

def lastmod(rel):
    dirty = subprocess.run(['git', 'status', '--porcelain', '--', rel], cwd=SITE, capture_output=True, text=True).stdout.strip()
    if dirty: return today
    d = subprocess.run(['git', 'log', '-1', '--format=%cs', '--', rel], cwd=SITE, capture_output=True, text=True).stdout.strip()
    return d or today

pages = []
for dirpath, dirs, files in os.walk(SITE):
    dirs[:] = sorted(d for d in dirs if not d.startswith('.') and d != 'outils' and d != 'node_modules')
    for f in sorted(files):
        if not f.endswith('.html'): continue
        rel = os.path.relpath(os.path.join(dirpath, f), SITE)
        s = open(os.path.join(SITE, rel), encoding='utf8').read()
        if 'http-equiv="refresh"' in s or re.search(r'<meta name="robots" content="[^"]*noindex', s): continue
        canon = re.search(r'<link rel="canonical" href="([^"]+)"', s)
        if not canon or not canon.group(1).startswith(O): continue
        url = canon.group(1)
        if url != O + (rel[:-10] if rel.endswith('index.html') else rel): continue  # page qui pointe ailleurs
        pages.append((rel, url))
pages.sort(key=lambda x: (PRIORITE.index(x[0]) if x[0] in PRIORITE else 99, x[0]))
out = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
out += [f'  <url><loc>{u}</loc><lastmod>{lastmod(r)}</lastmod></url>' for r, u in pages]
out.append('</urlset>')
open(os.path.join(SITE, 'sitemap.xml'), 'w', encoding='utf8').write('\n'.join(out) + '\n')
print(f'sitemap.xml : {len(pages)} pages')
