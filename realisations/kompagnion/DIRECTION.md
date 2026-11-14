# Kompagnion — direction artistique du site

Site de la réalisation Kompagnion, dans le site MTX Studio (`realisations/kompagnion/`). Bandeau et pied communs
(`../../assets/css/projet.css`, `../../assets/js/projet.js`), lecteur de film commun (`../../assets/js/film.js`).

## Le produit

- **Pour qui** : un indépendant ou une petite entreprise (graphiste, artisan, café, agence) qui gère seul ses
  clients et sa facturation, l’iPhone en main entre deux rendez-vous.
- **Moment déclencheur** : « Quand un client m’appelle ou qu’une facture tarde, je veux retrouver tout ce qui le
  concerne en un écran, pour répondre sans fouiller trois apps. »
- **Mécanisme** : clients, projets, demandes et documents sont reliés entre eux et par des #tags ; l’accueil se
  compose de widgets choisis (chiffres clés, demandes, échéances, tâches, facturation), et les factures et devis
  deviennent un PDF.
- **Fonctions montrées** (noms de l’app) : Personnaliser l’accueil, Clients, Projets, Demandes, Documents (factures et
  devis, export PDF), Tags (#), Couleur d’accent.
- **Limites** : iPhone seulement, iOS 27 ; pas de synchronisation iCloud ; pas encore sur l’App Store (ni date ni
  prix). Aucun chiffre d’usage inventé : les montants du site sont ceux des données de démonstration de l’app.
- **Matériau** : captures réelles en thème sombre et accent vert (`build/promo/shots`), film promo de 42 s avec
  musique, icône (pile de cartes, K sur la carte de devant).

## 1. Idée directrice : l’accueil qu’on compose

Le geste propre à Kompagnion est « Personnaliser l’accueil » : on choisit ses widgets, on en retire, on les déplace.
Le site fait faire ce geste au visiteur, sur un accueil reconstruit en HTML avec les vraies données de démonstration.
L’icône — des cartes empilées — donne la forme de tout le site : chaque bloc est une carte de widget (grand chiffre,
petite étiquette), posée sur le fond groupé d’iOS. Test de l’échange : ni Triade ni Sténo n’ont d’accueil à
composer ; l’idée ne sert qu’ici.

## 2. Composition

Promesse (téléphone sur l’accueil réel, deux widgets détachés) → **Composez votre accueil** (la démo) → Les quatre
espaces (onglets, captures) → De la ligne au PDF (facture recalculée) → Tout par #tag (filtre) → Le film → Vos
données → Questions → Appel. Ordinateur : grille de 12 colonnes, texte à gauche, appareil à droite ; mobile : le
téléphone d’abord pour la démo, puis le catalogue des widgets en rangée défilante.

## 3. Palette

Tirée des matériaux de l’app : fond groupé iOS et cartes.

| Rôle | Clair | Sombre |
|---|---|---|
| Fond | `#F2F2F7` | `#000000` |
| Carte | `#FFFFFF` | `#1C1C1E` |
| Encre | `#111118` | `#F5F5F7` |
| Texte doux | `#5E5E6A` (5,6:1 sur le fond) | `#A1A1AA` (8,3:1) |
| Accent (Violet, `AccentColor` de l’app) | `#584FEB` (5,0:1 sur le fond) | `#8A85FF` (6,6:1) |

L’accent est le seul aplat de couleur. Le visiteur peut en changer comme dans Réglages (Violet, Bleu, Turquoise,
Vert, Orange, Rose, Rouge, Graphite) : variantes web assombries en clair et éclaircies en sombre pour garder 4,5:1.
Les couleurs des statuts (Nouvelle rose, En cours bleu, En attente orange, Traitée vert) restent celles de l’app.

## 4. Typographies

Geist (police du studio, déjà servie par `assets/fonts`) pour les textes et les titres, en graisses 500 à 700 et
approche serrée comme les titres d’iOS ; **Geist Mono** pour tout ce qui se compte : montants, numéros de facture
(F-2026-002), quantités. Raison : le widget de Kompagnion est un grand nombre au-dessus d’une petite étiquette ; la
chasse fixe aligne les colonnes de la facture. Paire nouvelle dans l’historique (Triade : Instrument Serif + Rethink
Sans ; Sténo : Bricolage + Newsreader + Plex Mono ; Viewer : Archivo + Martian Mono ; GoRun : Mona Sans).

## 5. Traitement des visuels

- Captures réelles (WebP 660 px) dans un cadre de téléphone dessiné en CSS.
- Accueil, facture et liste filtrée reconstruits en HTML à partir de `SampleData.swift` (mêmes clients, montants,
  tags), pour pouvoir les manipuler.
- Film promo réencodé en 720 × 1280 (H.264 et AV1), affiche WebP.

## 6. Animation

- **Signature** : « Personnaliser » fait trembler les widgets comme sur iOS, affiche le − pour retirer ; on déplace
  au doigt ou à la souris (glisser), ou au clavier (flèches sur la poignée) ; le catalogue ajoute un widget. Les
  autres cartes glissent à leur place (FLIP, 320 ms, courbe `cubic-bezier(.2,.8,.2,1)`). « OK » referme.
- **Secondaires** : la couleur d’accent repeint la page ; la facture se recalcule (TVA 20 % / franchise en base) ;
  les #tags filtrent une liste mêlée de clients, projets, demandes et documents.
- **Survols** : seulement sous `@media (hover: hover)`.
- **Mouvement réduit** : pas de tremblement ni de glissement, changements instantanés ; le film ne se lance pas seul.
- **Sans JavaScript** : l’accueil reste affiché (widgets par défaut), les onglets deviennent une suite de blocs, la
  liste par tag est complète.

## Références

Les sites de référence n’ont pas été consultés en ligne pour ce projet. Références retenues, connues et assumées :

- **Principale — le mode édition de l’écran d’accueil d’iOS** (et celui de Kompagnion, qui le reprend) : tremblement,
  pastille −, glisser pour réordonner. Repris : le geste ; non repris : la grille d’icônes.
- **Le film promo de Kompagnion** (`build/promo`) : titres en deux temps, seconde ligne en couleur d’accent ; widgets
  qui se détachent du téléphone. Repris dans le héros.
- **Les autres sites du studio** (Triade, Sténo) : bandeau, pied, film et rythme des sections, pour l’unité.
