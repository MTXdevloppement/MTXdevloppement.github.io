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
marge ; les maquettes à droite sur ordinateur, dessous sur téléphone.

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

## 4. Typographies : la voix brute et la note propre

- **Geist Mono** (transcription, repères de temps, étiquettes) : la parole captée telle quelle.
- **Serif du système** (titres, notes, réponses) : New York sur les appareils Apple, la police des titres de l'app ;
  Iowan Old Style, Palatino ou Georgia ailleurs. La note relue et rangée.
- **Geist** (texte courant, interface).

Fichiers locaux sous licence OFL dans `assets/fonts/`.

## 5. Visuels

Aucune image : téléphone, écrans de l'app, île, widget et feuille de partage sont dessinés en HTML et CSS d'après
l'app réelle (mêmes textes, mêmes mémos d'exemple), et suivent le thème de la page. Le verre des barres reprend
Liquid Glass (flou, liseré clair). L'icône est celle de l'app : trois barres de voix qui deviennent trois lignes.

## 6. Mouvement

- **Signature** : le relevé. Surlignage des mots l'un après l'autre, puis arrivée des éléments dans les notes.
  La légende isole une famille, dans le texte comme dans les notes.
- Héros : démonstration en boucle (dictée mot à mot, compteurs de l'analyse, pose des cartes du mémo), avec
  pause et accès direct à chaque étape.
- Raccourcis : cinq scènes dans le même téléphone (bouton Action, feuille de partage, Centre de contrôle, halo de
  Siri, action de Raccourcis) ; l'île s'ouvre quand l'enregistrement démarre.
- Assistant : les réponses s'écrivent mot à mot. Vie privée : un point parcourt le circuit sans jamais sortir.
- Écran d'accueil : widget dont on coche les tâches ; les trois vignettes de thème changent le thème du site.
- Courbe `cubic-bezier(.2,.7,0,1)`, ressort `cubic-bezier(.3,1.35,.5,1)` pour l'île et les bannières.
- Avec `prefers-reduced-motion` : pas de lecture automatique, états finaux affichés, changements instantanés.
- Sans JavaScript : la page reste lisible, le mémo final est affiché, le texte du relevé reste éditable.

## Références

Les trois sites frères, pour s'en écarter : GoRun et MTX Viewer sont sombres et en linéales, Triade est sur papier
crème avec trois feuilles en éventail. Ici, un cahier à marge rouge et une page qui se lit comme un enregistrement.
L'app elle-même (écrans d'enregistrement et de mémo, réglage du thème, widget, activité en direct) est la source
de toutes les maquettes.
