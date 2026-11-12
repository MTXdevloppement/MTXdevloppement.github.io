# MTX Studio — direction artistique de l’accueil (V2 du héros)

Branche de travail : `v2-accueil`. La version en ligne (branche `main`, étiquette `sauvegarde-v5-avant-v2`)
n’est pas modifiée. Seul le premier écran change : la vidéo de l’homme à tête d’écran est remplacée par une
maquette interactive.

## 1. Idée directrice : l’écran d’accueil du studio

Le studio fabrique des apps pour iPhone, iPad, Apple Watch et Mac. Le premier écran montre donc l’objet du
métier : un iPhone dont l’écran d’accueil ne contient que les apps du studio, et une Apple Watch à côté.
On touche une icône, l’app s’ouvre avec le zoom d’iOS et déroule ses vraies captures ; un lien mène à son
site. C’est le slogan « De l’icône au site » rejoué par le visiteur, et l’écho du titre de la section
suivante, « Ouvrez-en une. ». L’idée ne tient que pour ce studio : ce sont ses trois icônes, ses captures,
et l’emplacement vide « Votre app » est l’appel au projet.

## 2. Composition

- Ordinateur : texte à gauche (inchangé), maquette à droite, légende sous le téléphone alignée sur la
  rangée « Le studio en bref ».
- Mobile : le téléphone occupe le haut de l’écran, coupé par le texte ; la rangée d’icônes reste visible
  et touchable. La légende passe au-dessus du nom du fondateur.
- La scène est fixe, comme l’était la vidéo : la feuille des réalisations glisse par-dessus, et la fenêtre
  « Contact » la laisse réapparaître, cette fois sur un nouveau message adressé au studio.

## 3. Palette

Aucune couleur ajoutée. Fond de plateau neutre (gris clair en thème clair, graphite en thème sombre), tiré
des jetons existants. Le dégradé de la marque (bleu, violet, rose, orange) reste réservé au X du logo : fond
d’écran du téléphone, emplacement « Votre app », bouton d’envoi. Les couleurs vives viennent des apps
elles-mêmes (icônes et captures).

## 4. Typographies

Helvetica Now pour le site (inchangé). Dans les appareils, la police du système : c’est celle des écrans
reproduits.

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
