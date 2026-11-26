# MTX Studio — direction artistique (version 2, novembre 2026)

La première version (Geist, cartes arrondies, pastilles, gros titres en deux mots, dégradé bleu-violet) reprenait
tous les réflexes des sites générés automatiquement. Le client l’a jugée « faite par IA ». Cette version part
d’un principe d’édition plutôt que d’un modèle de page.

## 0. Architecture (inchangée)

| Adresse | Rôle |
| --- | --- |
| `/` | Accueil-aiguillage : la phrase-menu, les trois collections, l’index des dix réalisations, le studio, les questions, le contact |
| `/sites-internet/` | Pôle Web : pour qui, ce qui est compris, tarifs en bref, réalisations, méthode, questions |
| `/sites-internet/tarifs/` | Formules, options, coûts annexes, maintenance, paiement, simulateur (`#devis`) — le comparatif avec les agences est supprimé |
| `/sites-internet/refonte/` | Refonte : signes, audit gratuit, avant/après, ce qui est conservé, méthode, questions |
| `/applications/` | Pôle Apps : la scène iPhone et Apple Watch (plus bas), ce que le studio crée, réalisations, méthode, budget |
| `/intelligence-artificielle/` | Pôle IA : réponse sourcée, cas d’usage, données, réalisations, méthode, budget |

## 1. Idée directrice : trois collections, une couleur chacune

Le studio fait trois métiers ; le visiteur doit toujours savoir dans lequel il se trouve. On reprend le principe des
collections de livres de poche classées par couleur (Penguin, 1935 : orange pour le roman, vert pour le policier,
bleu pour les essais) : **une couleur franche par collection**, posée en bandeau, et tout le reste en noir sur blanc.

- **Sites internet — bleu lien** `#1f3fe0`. Le bleu des liens hypertextes, la matière même du web.
- **Applications — rouge pastille** `#d42a1a`. Le rouge des pastilles de notification sur l’écran d’accueil.
- **IA — jaune surligneur** `#ffd21f`. Le surligneur qui montre d’où vient une réponse : l’IA du studio cite ses sources.
- **Le studio (accueil, pied de page) — noir** `#111`.

Ce sont les trois couleurs primaires : un système qu’on comprend sans légende. On ne les mélange jamais sur une même
surface ; seul l’accueil les montre ensemble, chacune dans son bandeau.

**Ne pas perdre le client.** La barre globale est la même partout (MTX Studio, les trois collections, Réalisations,
Contact). Sous elle, la barre locale du pôle est un bandeau plein à sa couleur : on ne peut pas se tromper de rayon.

## 2. Composition

- Fond blanc pur (pas de crème : c’est devenu un réflexe de générateur), texte noir, filets noirs de 2 px pour
  structurer, filets gris de 1 px pour séparer.
- **Titres en manchette** : chaque section s’ouvre sur un filet noir, une colonne de marge (numéro et nom de la
  rubrique) et le titre dans les neuf colonnes de droite. La colonne de marge porte aussi les notes et conditions.
- **Pas de cartes par réflexe.** Les listes sont des lignes réglées (numéro, intitulé, détail), les prix des lignes à
  points de conduite comme sur un devis, les réalisations des figures avec légende. Une boîte n’existe que si on agit
  dessus (simulateur, démonstration, formulaire).
- Coins droits partout ; seuls les appareils dessinés (téléphone, navigateur) et les icônes d’apps gardent les leurs.
- Accueil : une phrase-menu (« Je fabrique des sites internet, des applications et des IA utiles… ») dont chaque
  métier est un lien souligné à sa couleur, puis les trois bandeaux-collections pleine largeur, puis l’index des
  réalisations avec aperçu.
- Mobile : les bandeaux restent pleine largeur, la colonne de marge passe au-dessus du titre, les tableaux deviennent
  des fiches ligne à ligne.

## 3. Palette et contrastes

| Rôle | Clair | Sombre | Contraste vérifié |
| --- | --- | --- | --- |
| Papier / encre | `#ffffff` / `#111111` | `#121212` / `#f2f2f2` | 18,9:1 |
| Texte secondaire | `#4d4d4d` | `#b8b8b8` | ≥ 8:1 |
| Bleu (bandeau, texte blanc) | `#1f3fe0` | idem | blanc 7,4:1 ; texte bleu en sombre `#8fa2ff` |
| Rouge (bandeau, texte blanc) | `#d42a1a` | idem | blanc 5,1:1 ; texte rouge sur blanc `#c8281b` 5,6:1, en sombre `#ff8a7a` |
| Jaune (bandeau, texte noir) | `#ffd21f` | idem | noir 13:1 ; jamais en texte sur blanc |

## 4. Typographie

**Bricolage Grotesque** (Mathieu Triay, SIL Open Font License), un seul fichier variable hébergé sur le site, axes
taille optique, graisse et chasse. Un dessin français par son nom et son auteur, issu des grotesques du XIXᵉ siècle :
aux grandes tailles, ses pièges à encre et ses formes un peu brutes donnent un aspect fait main ; en texte, la taille
optique le rend calme et lisible. Chiffres tabulaires pour les prix et les totaux. Aucune police tierce n’est chargée.
Le fichier servi est allégé (axe de chasse figé à 100 %, graisses limitées à 400–800) : 73 Ko au lieu de 131 Ko,
même dessin. Les sites des réalisations l’emploient aussi dans le pied « Une réalisation MTX Studio ».

**Fichiers.** Les styles s’écrivent dans `assets/css/site.css` (commun) et `assets/css/pole.css` (pages de pôle) ;
le générateur les assemble et les minifie dans `assets/css/mtx.css`, seul fichier chargé par les pages. Chaque
feuille et script est appelé avec une empreinte de son contenu (`?v=…`) : rien à incrémenter à la main.

## 5. Visuels

- Vraies captures des sites du studio, à plat, filet de 1 px, légende dessous (« Volta — logiciel Mac de gestion de
  stock »). Pas d’ombre portée, pas d’inclinaison.
- Appareils (navigateur, téléphone) dessinés en HTML et CSS, sobres.
- Le X du logo est employé en noir (ou blanc) dans l’interface ; l’icône en dégradé reste celle de l’onglet et de
  l’écran d’accueil.
- Exemples fictifs annoncés comme tels (garage de la refonte, documents de la démonstration IA).

## 6. Mouvement

- **Signature** : on entre dans une collection. Le bandeau cliqué sur l’accueil devient la barre du pôle
  (transition de vue entre documents, amélioration progressive).
- Secondaires : l’index des réalisations change d’aperçu au survol ou au focus ; le simulateur écrit le devis en
  direct ; la démonstration IA surligne en jaune le passage cité.
- Aucune apparition « fondu + montée » au défilement. En mouvement réduit, aucune transition de page ni déplacement.

## 7. Ton

Première personne du pluriel (« nous », « le studio »). Ne jamais nommer le fondateur (sauf dans les mentions légales, obligatoires) et ne jamais affirmer une équipe (« notre équipe », « nos développeurs ») : le « nous » reste implicite. Phrases courtes et concrètes, chiffres réels, pas de
slogan creux, pas de faux avis, pas de chiffres non mesurés. Les conditions sont écrites à côté des prix, pas en
petits caractères.

## Références

- **Principale — les collections Penguin (1935, Edward Young)** : une couleur par collection pour savoir où l’on se
  trouve. Non repris : la couverture à trois bandes, le logo, la typographie.
- Les grilles éditoriales suisses (Josef Müller-Brockmann) : la colonne de marge qui porte les intitulés et les notes.
- Les devis papier : lignes, points de conduite, total, échéancier — repris dans le simulateur et les listes de prix.
- Liste « anti-AI slop » de Refero (2026) : signes à éviter (violet, cartes partout, crème + sérif par défaut,
  grilles symétriques, textes trop écrits).

---

## Scène du pôle Applications (ancien premier écran de l’accueil)


Le premier écran du pôle Applications (`/applications/`) est une maquette interactive : un iPhone et une Apple Watch qui présentent les apps
du studio.

## 1. Idée directrice : l’écran d’accueil du studio

Le studio fabrique des apps pour iPhone, iPad, Apple Watch et Mac. Le premier écran montre donc l’objet du
métier : un iPhone dont l’écran d’accueil ne contient que les apps du studio, et une Apple Watch à côté.
On touche une icône, l’app s’ouvre avec le zoom d’iOS et déroule ses vraies captures ; un lien mène à son
site. C’est le slogan « De l’icône au site » rejoué par le visiteur, et l’écho du titre de la section
suivante, « Ouvrez-en une. ». L’idée ne tient que pour ce studio : ce sont ses icônes (quatre depuis Sténo), ses
captures, et l’emplacement vide « Votre app », passé dans le dock quand la rangée s’est remplie, est l’appel au projet.

## 2. Composition

- Ordinateur : texte à gauche (inchangé), maquette à droite, légende sous le téléphone alignée sur la
  rangée « Le studio en bref ».
- Mobile : le téléphone occupe le haut de l’écran, coupé par le texte ; la rangée d’icônes reste visible
  et touchable. La légende passe au-dessus du nom du fondateur.
- La scène est fixe, comme l’était la vidéo : la feuille des réalisations glisse par-dessus, et la fenêtre
  « Contact » la laisse réapparaître, cette fois sur un nouveau message adressé au studio.
- Sites des réalisations : la même maquette (téléphone sur un nouveau message, montre à l’heure) est posée
  dans le pied commun « Une réalisation MTX Studio » par `assets/js/projet.js`. Le message cite l’app du site
  (`data-mtx-app`) ; le téléphone est un lien qui ouvre l’e-mail. Sans JavaScript, le pied reste tel quel.
- Maquettes des sites des réalisations : chaque site reprend la pose de cette scène (pivot à la souris,
  flottement, reflet de la vitre) avec les classes communes `mtx-pose`, `mtx-flotte` et `mtx-reflet`, et y
  ajoute ce qui lui est propre. Sténo : les éléments relevés flottent devant le téléphone. GoRun : l’Apple
  Watch suit la course du téléphone. MTX Viewer (section « Ouvrir un site ») : un cadre de sélection passe
  d’un site de la bibliothèque à l’autre. Triade : les trois feuilles en retrait, un extrait de chaque outil
  devant.

## 3. Palette

Depuis la version 2, le plateau prend le rouge de la collection Applications (dégradé radial `#e4452f` →
`#d42a1a` → `#9e1c10`, qui sert d’éclairage au téléphone), et le texte posé dessus est blanc. Le dégradé de la
marque (bleu, violet, rose, orange) reste réservé à l’intérieur du téléphone : fond d’écran, emplacement
« Votre app », bouton d’envoi. Les couleurs vives viennent des apps elles-mêmes (icônes et captures).

## 4. Typographies

Bricolage Grotesque pour le texte autour de la scène, comme sur tout le site. Dans les appareils, la police du
système : c’est celle des écrans reproduits.

## 5. Traitement des visuels

- Appareils dessinés en HTML et CSS (aucune image de maquette).
- Contenu des apps : captures réelles déjà publiées sur les sites des réalisations (trois par app).
- Apple Watch : réplique HTML de l’écran de course de GoRun, aux mêmes valeurs que la réplique du site GoRun.
- Icônes : celles des apps.

## 6. Animation

- Signature : ouvrir une app depuis l’écran d’accueil (zoom depuis l’icône, 480 ms, courbe d’iOS), puis les
  captures se poussent comme une navigation. Barre d’accueil, bouton « Accueil » ou Échap pour refermer.
- Secondaires : la maquette pivote en 3D avec la souris (elle remplace la tête qui tournait dans la vidéo) ;
  elle bascule et recule quand la feuille monte au défilement ; la montre passe sur la course quand GoRun
  s’ouvre ; reflet sur la vitre lié à l’angle.
- Démonstration automatique tant que le visiteur n’a rien touché ; elle s’arrête au premier geste.
- Tactile : tout se fait au doigt ; balancement lent à la place de la souris.
- Mouvement réduit : pas de démonstration, pas de pivot ni de balancement ; ouverture en fondu.
- Sans JavaScript : écran d’accueil statique, les icônes sont des liens vers les sites.

## Références

- MotionSites, « Laptop Portfolio » (`motionsites.ai/?prompt=laptop-portfolio`) — référence principale :
  l’écran de l’appareil devient la scène où l’on montre le travail. Non repris : photo, personnage, textes.
- MotionSites, « Look Circle » — des objets disposés pour qu’on en choisisse un ; ici, les icônes.
- MotionSites, « Outfit Carousel » — l’élément choisi passe au premier plan.
- family.co et awwwards.com (rubrique Mobile & Apps) : consultés, mais le navigateur intégré, masqué, n’a
  rendu que des pages vides ; rien n’en est retenu.
