# MTX Studio — direction artistique

## 0. Architecture : un accueil qui aiguille, trois pôles qui ont chacun leur site

Le visiteur arrive sur mtx-developpement.fr et choisit d’abord ce qu’il veut faire faire. Chaque pôle a son propre
site, intégré au domaine : sa couleur, sa navigation locale, ses pages, son appel à l’action.

| Adresse | Rôle |
| --- | --- |
| `/` | Accueil-aiguillage : trois portes (Sites internet, Applications, IA), les dix réalisations, le studio, les questions, le contact |
| `/sites-internet/` | Pôle Web : vue d’ensemble (pour qui, création, inclus, tarifs en bref, réalisations, méthode, questions) |
| `/sites-internet/tarifs/` | Formules, options, coûts annexes, maintenance, paiement, comparatif, simulateur de devis (`#devis`) |
| `/sites-internet/refonte/` | Refonte : signes, audit gratuit, avant/après, ce qui est conservé, migration, questions |
| `/applications/` | Pôle Apps : la scène iPhone et Apple Watch (ci-dessous), ce que le studio crée, réalisations, méthode, budget |
| `/intelligence-artificielle/` | Pôle IA : réponse sourcée à vérifier, cas d’usage, données, réalisations, méthode, budget |

**Ne pas perdre le client.**

- La barre globale est la même partout. Elle porte le logo (retour à l’accueil), les trois pôles (le pôle en cours est
  marqué) et le contact.
- Sous elle, une barre locale collante porte la couleur et le nom du pôle, ses rubriques et son appel à l’action. C’est le
  principe de la navigation locale des pages produit d’Apple.
- Chaque pied de page liste les trois pôles.

**Idée directrice : le X est un carrefour.** Le X du logo est l’endroit où les chemins se croisent, et son dégradé
donne une couleur à chaque branche. Sur l’accueil, les trois portes partent de ce croisement. Chaque porte montre du
vrai travail du studio :

- une vraie capture de site dans un navigateur ;
- les vraies icônes des apps ;
- une réponse sourcée, comme le fait Knowledge AI.

**Couleurs des pôles.** Ce sont des segments du dégradé du X. On les emploie en petites touches (pastille, filet, nom du
pôle, états), jamais en grands aplats. Les variantes « encre » sont réservées au texte et ont un contraste vérifié
(≥ 5,4:1 sur le papier, ≥ 9:1 en sombre).

| Pôle | Pastille | Encre clair | Encre sombre |
| --- | --- | --- | --- |
| Sites internet | `#2997ff` | `#0a5bc4` | `#6cb4ff` |
| Applications | `#ffb86b` | `#a14a00` | `#ffbd7a` |
| IA | `#a78bfa` | `#6a42d6` | `#c2adff` |

**Typographies.** Geist et Geist Mono (SIL Open Font License), hébergées sur le site :

- aucune requête vers un serveur tiers, ce qui va dans le sens du RGPD et de la vitesse promis aux clients ;
- une licence claire ;
- un seul fichier variable pour toutes les graisses.

Geist Mono sert à ce qui se compte : prix, étapes, délais.

**Signatures par page.**

- Accueil : la porte survolée ou ciblée au clavier s’ouvre, et sa miniature s’anime.
- Passage d’une page à l’autre : la pastille et le nom du pôle glissent jusqu’à la barre locale, grâce aux transitions
  de vue entre documents (amélioration progressive).
- Sites internet : on ouvre un vrai site du studio dans le navigateur et le téléphone de la vitrine.
- Tarifs : l’interrupteur Création / Refonte change tous les prix.
- Refonte : un comparateur avant / après manipulé par le visiteur, sans balayage automatique.
- IA : toucher une citation surligne le passage de la source.

En mouvement réduit, on n’a aucun déplacement continu, et seuls les états finaux restent.

**Réaliste.** On n’affiche ni faux avis, ni faux logos clients, ni chiffres non mesurés. Les exemples fictifs sont
annoncés comme tels. Les coûts annexes sont écrits (domaine, hébergement après la première année, plateforme
e-commerce, compte Apple Developer, consommation d’IA).

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
