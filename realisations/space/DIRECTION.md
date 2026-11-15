# Space — direction du site

**Idée** : le site est un ciel, et la règle du jeu se vit avant de se lire. Le premier écran contient une
réplique jouable de la partie (`assets/js/orbite.js`), fidèle aux règles de `Space/Game/GameScene.swift` :
orbite, lancer au tap, capture, parfaits, bonds, gemmes, mines dès la 7e planète, écran qui monte.
Tant que personne ne touche l'écran, la partie se joue toute seule.

- **Thèmes** : sombre = la nuit du jeu (palette de la zone 1), clair = « l'aube », les mêmes couleurs éclaircies.
  La partie elle-même change de palette avec le thème.
- **Typographies** : Unbounded (titres, chiffres du score), Onest (texte). Auto-hébergées, licence OFL.
- **Mouvement** : anneaux d'orbite autour du téléphone ; schémas animés de la règle ; la section « La montée »
  traverse les palettes de zone pendant le défilement, avec un altimètre et une vignette par danger ;
  notes pentatoniques jouées en Web Audio (son coupé par défaut).
- **Mouvement réduit** : pas de démonstration, la partie attend le premier geste ; animations décoratives coupées.
- **Contenus** : chiffres et règles tirés du README du dépôt `space` ; captures réelles du jeu.
