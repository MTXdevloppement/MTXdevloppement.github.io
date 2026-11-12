# Sténo — direction artistique du site

Site : `realisations/steno/`. Produit : Sténo 1.0 pour iPhone et iPad (iOS 27), dépôt local `MTX Studio/Steno`.
Aucun élément des sites GoRun, MTX Viewer ou Triade n'a été repris, hors le bandeau et le pied communs.

## 1. Idée directrice : la page est un mémo, la phrase se range

Sténo transforme une parole brute en notes rangées. Le site rejoue ce geste deux fois.

- **La page se lit comme un mémo.** Une marge rouge de cahier court sur toute la hauteur ; chaque section porte un
  repère de temps (0:00, 0:14, 0:31…) et une tête de lecture suit le défilement. La barre du haut est un lecteur :
  son onde se remplit à mesure qu'on avance.
- **La phrase se range.** Dans « Le relevé », le visiteur choisit un mémo ou écrit sa propre phrase : les mots
  utiles prennent la couleur de leur famille (un prénom en bleu, une échéance en orange, une tâche soulignée en
  vert), puis se posent dans la colonne des notes. Le moteur est une version réduite de l'analyse locale de l'app
  (`assets/js/releve.js`), exécutée dans le navigateur : rien n'est envoyé.

L'idée ne tient que pour ce produit : c'est son entrée (une phrase dite) et sa sortie (des éléments rangés).

## 2. Composition

Ordre : promesse et démonstration (dicter, analyser, retrouver) → le relevé (interaction-signature) → les cinq
façons d'envoyer un mémo → Apple Intelligence (interroger, rédiger) → vie privée (le circuit fermé) → écran
d'accueil (widget, thèmes, activité en direct) → questions → sortie. Une seule colonne de texte, calée contre la
marge ; les films à droite sur ordinateur, dessous sur téléphone. Dans « Raccourcis », en une colonne, le film
passe avant la liste des cinq façons : elle change de hauteur à chaque chapitre, lui ne bouge pas.

## 3. Palette

| Rôle | Clair | Sombre |
|---|---|---|
| Papier (fond) | `#FBFBFD` | `#0D0C11` |
| Encre (texte) | `#14121A` | `#F4F2F8` |
| Texte secondaire | `#565363` (discret `#6E6B7C`) | `#AAA6B9` (discret `#8D899C`) |
| Filets | `#E2E2EC` | `#282631` |
| Rouge d'enregistrement | `#D93529` (texte `#C22B20`) | `#FF5A4C` (texte `#FF7B6F`) |
| Lignes du cahier | bleu-violet à 13 % | bleu-violet à 10 % |

Le rouge est celui du bouton d'enregistrement de l'app : marge, tête de lecture, appels à l'action. Les dix
couleurs des familles (tâches en vert, dates en orange, personnes en bleu, décisions en indigo, questions en rose,
idées en ocre, lieux en sarcelle, organisations en brun, chiffres en violet, coordonnées en cyan) ne servent qu'aux
éléments relevés, avec une variante par thème pour garder un contraste d'au moins 4,5:1.

## 4. Typographies : la parole, la note, la machine

Trois voix, une par état du mémo. Les titres en portent deux : la première ligne parle, la seconde note.

- **Bricolage Grotesque** (première ligne des titres en graisse 800, texte courant, interface) : la parole. Une
  grotesque serrée, un peu irrégulière, qui a du grain comme une voix.
- **Newsreader** (seconde ligne des titres en italique 500, rouge ; notes, réponses de l'assistant, comptes
  rendus) : la note relue et rangée.
- **IBM Plex Mono** (transcription, repères de temps, étiquettes, actions de Raccourcis) : la machine qui capte.

Le widget garde la police du système : c'est un morceau d'iOS, pas du site. Fichiers locaux sous licence OFL dans
`assets/fonts/`, réduits au latin ; les coupes des titres et du texte courant sont préchargées.

## 5. Visuels : des films, pas des maquettes

Trois films sans son remplacent les maquettes. Chacun existe en clair et en sombre, en AV1 et en H.264, avec une
affiche WebP (`assets/films/`).

| Film | Durée | Ce qu'il montre |
|---|---|---|
| `heros` (4:5) | 13,4 s | La voix devient un texte sous l'onde, les mots utiles prennent leur couleur, puis se rangent dans le mémo de l'app. Trois chapitres : Dicter, Analyser, Retrouver. |
| `gestes` (4:5) | 26 s | Les cinq façons d'envoyer un mémo, en plan rapproché sur le téléphone. Cinq chapitres de 5,2 s, un par onglet. |
| `ile` (9:5) | 8,4 s | L'activité en direct dans la Dynamic Island : pause, reprise, fin de l'enregistrement. |

Les films sont dessinés en HTML et CSS d'après l'app réelle (mêmes textes, mêmes mémos d'exemple), puis filmés
image par image. Sources et fabrication dans `outils/films/` : une page par film, animée par `moteur.js` (chaque
image se calcule à partir du temps seul), `capture.swift` pour la prise de vue, `fabriquer.sh` pour l'encodage.
Pour changer un film, on modifie sa page puis on relance `fabriquer.sh` ; on ne retouche jamais la vidéo.

Restent dessinés dans la page, parce qu'on les manipule : la feuille du relevé, les cartes de l'assistant, le
circuit de la vie privée, le widget et les vignettes de thème. L'icône est celle de l'app : trois barres de voix
qui deviennent trois lignes.

## 6. Mouvement

- **Signature** : le relevé. Surlignage des mots l'un après l'autre, puis arrivée des éléments dans les notes.
  La légende isole une famille, dans le texte comme dans les notes.
- Films : chargés à l'approche de l'écran, lus seulement quand ils sont visibles, en boucle. Le chapitre en cours
  s'allume et sa barre rouge avance avec le film. Dans le héros, un chapitre choisi fait repartir le film de là ;
  dans « Raccourcis », l'onglet choisi tourne en boucle. Un bouton met en pause. Au changement de thème, le film
  change de couleurs sans perdre sa place.
- Assistant : les réponses s'écrivent mot à mot. Vie privée : un point parcourt le circuit sans jamais sortir.
- Écran d'accueil : widget dont on coche les tâches ; les trois vignettes de thème changent le thème du site.
- Courbe `cubic-bezier(.2,.7,0,1)`, ressort `cubic-bezier(.3,1.35,.5,1)` pour les boutons et les vignettes.
- Avec `prefers-reduced-motion` ou l'économie de données : aucun film ne se lance ni ne se charge, l'affiche reste
  seule. Un chapitre choisi montre une image arrêtée ; le bouton de lecture lance le film si on le demande.
- Sans JavaScript : la page reste lisible, les films gardent les commandes du navigateur, le texte du relevé reste
  éditable.

## Références

Les trois sites frères, pour s'en écarter : GoRun et MTX Viewer sont sombres et en linéales, Triade est sur papier
crème avec trois feuilles en éventail. Ici, un cahier à marge rouge et une page qui se lit comme un enregistrement.
L'app elle-même (écrans d'enregistrement et de mémo, réglage du thème, widget, activité en direct) est la source
de tous les films et de tous les éléments dessinés.
