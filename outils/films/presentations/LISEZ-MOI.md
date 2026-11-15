# Films de présentation — Volta, Mue, Knowledge AI, Startup3D, Space, Triade

Les films de GoRun, MTX Viewer, Sténo et Kompagnion ont été livrés en MP4 et préparés avec `../presentations.sh`.
Ceux-ci sont fabriqués ici, entièrement par le code : une page HTML par film, filmée image par image, et une musique
originale synthétisée. On ne retouche jamais la vidéo : on modifie la page (ou la fiche de la musique), puis on
relance la fabrication.

| Film | Format | Durée | Tempo | Matériau |
|---|---|---|---|---|
| `volta.html` | 16:9 | 36 s | 120 | 12 captures réelles de l'app, clair et sombre (`img/volta/`) |
| `mue.html` | 16:9 | 34,3 s | 112 | 22 captures réelles : roues, bannières, Atelier, réglages (`img/mue/`) |
| `knowledge-ai.html` | 16:9 | 40 s | 96 | Captures de l'app en fonctionnement, dont 26 images d'une recherche en direct (`img/knowledge-ai/`) |
| `startup3d.html` | 16:9 | 34,9 s | 110 | 8 captures de l'app, jour et nuit (`img/startup3d/`) |
| `space.html` | 9:16 | 30 s | 128 | La partie de démonstration du site (orbite.js) et 5 captures du jeu (`img/space/`) |
| `triade.html` | 9:16 | 38,4 s | 100 | 9 captures de l'app iPhone (`img/triade/`) |

## Fabriquer un film

Depuis la racine du site, serveur local ouvert (`python3 -m http.server 8765`) :

```sh
outils/films/presentations/fabriquer.sh volta 6.4        # film, instant de l'affiche (secondes)
node outils/films/presentations/apercu.mjs volta /tmp/v.png 1,6.5,12   # planche de quelques instants, pour relire
```

`fabriquer.sh` enchaîne :

1. `filmer.mjs` — Chromium (Playwright) ouvre la page avec `?tournage`, avance le temps (`window.film.aller(t)`) et
   photographie chaque image (30 par seconde) ; les images partent directement dans ffmpeg, qui écrit un original
   presque sans perte (H.264 4:4:4, CRF 10). L'original n'est refait que si la page ou le kit ont changé.
2. `musique.py` — la bande-son du film, à la durée exacte du film.
3. L'encodage pour le web, aux mêmes réglages que les films livrés : H.264 (CRF 24) et AV1 (CRF 36) avec la musique
   en AAC, une version 720p pour les téléphones quand le film est en paysage, et l'affiche en WebP. Matrice BT.709
   écrite dans les fichiers. Sortie : `realisations/<film>/assets/video/presentation*`.
4. `son.py` — remet la musique en vérifiant la crête après encodage AAC : au-dessus de −1 dBFS, le gain est
   baissé d'autant et l'audio réencodé (l'image est copiée telle quelle).

Ne pas modifier `fabriquer.sh` pendant qu'il tourne : bash lit le script au fur et à mesure.

## Écrire un film

- `../moteur.js` (le moteur des films de Sténo) : chaque image se calcule à partir du temps seul. Les pistes
  (`f.piste(élément, [t, {x, y, s, r, o, f}], …)`) se composent ; attention, une valeur absente des premières clés
  prend celle de la première clé qui la donne : préciser l'opacité dans chaque clé quand elle change en fin de piste.
- `kit.js` / `kit.css` : titres dont les mots sortent d'un masque, fenêtre Mac, iPhone, pastilles, touches, curseur,
  fond (halos et grain), voile haut pour garder les titres lisibles sur une capture zoomée, carton de fin.
- Les scènes tombent sur les mesures de la musique (`const M = 240 / tempo`), pour que les changements de plan,
  les souffles et les coups de la bande-son coïncident.
- Space : le code du jeu du site est exécuté avec l'horloge du film à la place de `requestAnimationFrame`, image
  par image : la partie de démonstration est identique à chaque tournage.

## La musique

`musique.py <film> <sortie.wav>` : tout est synthétisé (NumPy, SciPy), sans échantillon ni boucle importée. Chaque
fiche donne le tempo, la tonalité, quatre accords, les sections (nappe, arpège, basse, grosse caisse, claquement,
charleston) et les mesures des changements de scène. Mixage vérifié à la mesure : crête à −1,5 dBFS avant encodage, environ −13 dBFS
efficaces, énergie répartie entre graves et médiums pour rester audible sur un haut-parleur de téléphone.

## Captures de Knowledge AI

Faites sur l'app réelle (interface Next.js, API FastAPI), lancée avec les services simulés de ses propres tests
(`backend/tests/fakes.py`) à la place d'Ollama et de Wikipédia, enrichis de cinq articles sur la naissance de la
France. L'interface, la recherche, la sélection des passages et la vérification des citations sont réelles ; les
articles, la réponse du modèle et les durées viennent du jeu d'essai. La page du film le précise sous la vidéo.
