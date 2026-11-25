# MTX Studio

Site de MTX Studio : des apps pour iPhone, iPad, Apple Watch et Mac, des sites et applications web, des logiciels sur mesure, des systèmes d’IA, des jeux, et le site de chacun.

En ligne : https://mtx-developpement.fr/

Contact : mtxstudio@proton.me

## Modifier le site

Les pages du studio (accueil, trois pôles, tarifs, refonte) sont assemblées par un petit générateur Python, sans
dépendance : `outils/generateur/`.

- `pages/*.html` : le contenu propre de chaque page ;
- `gen.py` : en-tête, barre globale, barre du pôle, menu mobile, pied de page et données structurées communs ;
- `config.py` : liste des pages, réalisations, vitrine, scène iPhone ;
- `legal.py` : met les mentions légales, la confidentialité et la page 404 aux éléments communs.

Après une modification : `python3 outils/generateur/gen.py .` puis `python3 outils/generateur/legal.py .`,
et `npm run check` pour vérifier liens, ancres, titres, images et plan du site.
Direction artistique : voir `DIRECTION.md`.
