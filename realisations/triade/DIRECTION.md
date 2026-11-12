# Triade — direction artistique du site

Site : `realisations/triade/` (V5 du site MTX Studio). Produit : Triade 4.0 pour iPhone et iPad
(dépôt `triade-ios`, dossier `Triade.V4`). Aucun élément des anciens sites Triade n'a été repris.

## 1. Idée directrice : trois feuilles dans une main

L'icône de Triade montre trois feuilles en éventail : bleue (Texte), verte (Tableur), orange (Présentation).
Le site reprend ce geste. Les trois feuilles sont l'objet de la page : elles se déploient derrière le téléphone,
et choisir un outil ramène sa feuille devant les autres. L'idée ne tient que pour ce produit : trois outils,
un seul objet en main.

## 2. Composition

Page claire, comme un bureau sur lequel on pose des feuilles ; une seule bande sombre (le bleu nuit de
l'icône) pour l'assistant. Ordre : promesse → les trois outils (interaction-signature) → l'assistant sur
l'appareil (démonstrations rejouées à partir de captures réelles) → formats → vie privée (interrupteur
mode Avion) → modèles → questions → contact.

## 3. Palette

| Rôle | Clair | Sombre |
|---|---|---|
| Papier (fond) | `#F6F4EE` | `#0B1024` |
| Encre (texte) | `#0E1530` | `#F1EEE6` |
| Texte secondaire | `#565D75` | `#A9AFC4` |
| Filets | `#DFDACB` | `#252C4A` |
| Texte / état bleu | `#1F57C8` | `#7FA8FF` |
| Tableur / état vert | `#0F7A45` | `#4FD08B` |
| Présentation / état orange | `#B8480F` | `#FF9A5E` |

Les couleurs vives des feuilles (`#2E70EB`, `#1A9E5C`, `#E86B2B`, celles de l'app) ne servent qu'aux feuilles
et aux états ; le texte utilise les variantes foncées ci-dessus (contraste ≥ 4,5:1 sur le papier).

## 4. Typographies : une voix par outil

- **Instrument Serif** (titres) : la voix du texte imprimé, celle d'une lettre ou d'un rapport.
- **Rethink Sans** (texte courant, interface) : la voix nette d'une diapositive.
- **Police à chasse fixe du système** (repères, chiffres, formules) : la voix du tableur.

Fichiers locaux sous licence OFL (`assets/fonts/`), deux graisses de serif et une police variable.

## 5. Visuels

Captures réelles de l'app (simulateur iPhone, données de démonstration, textes réellement produits par le
modèle de l'appareil), dans un cadre de téléphone dessiné en CSS. Les feuilles de l'éventail sont dessinées
en HTML/SVG d'après l'icône.

## 6. Mouvement

- **Signature** : l'éventail. Onglets Texte / Tableur / Présentation (clic, doigt, flèches du clavier) :
  la feuille choisie passe devant, l'écran du téléphone change.
- Démonstrations de l'assistant : suite de captures qui s'enchaînent, avec légende, pause et étapes.
- Interrupteur « mode Avion » : la liste de ce qui fonctionne ne change pas.
- Apparition des titres au défilement (un seul effet, sobre), déploiement de l'éventail à l'arrivée.
- Scène du héros en volume : elle pivote avec la souris (pose commune du site MTX Studio), les trois feuilles
  sont en retrait derrière le téléphone, chacune à sa profondeur, et un extrait de chaque outil flotte devant
  lui dans sa voix (« Madame, Monsieur, » en serif, `=SOMME(B4:B31)` en chasse fixe, « Projet de boulangerie »
  en linéale).
- Courbe `cubic-bezier(.2,.7,0,1)`, 0,35 à 0,7 s. Avec `prefers-reduced-motion`, pas de lecture automatique
  ni de déplacement : l'état final est affiché et les étapes se passent à la main.

## Références

Le site principal MTX Studio (bandeau, pied commun, pastilles, repères en chasse fixe) et les deux sites
frères, GoRun et MTX Viewer, pour s'en distinguer : tous deux sombres et en linéales, d'où une page claire
à titres serif. MotionSites et Awwwards n'ont pas pu être étudiés (listes rendues en JavaScript,
illisibles par l'outil de lecture) : aucune référence externe n'est donc revendiquée.
