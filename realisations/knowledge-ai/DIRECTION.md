# Knowledge AI — direction du site

**Idée** : l'appareil critique d'un livre. Une réponse est un texte avec ses notes : paragraphes « § » en
marge, exposants numérotés, citations en retrait.

- **Thèmes** : les jetons de l'app (`frontend/src/app/globals.css`) : papier chaud et graphite, bleu d'accent.
- **Typographies** : Literata (titres et réponse), Schibsted Grotesk (interface), Spline Sans Mono (traces).
- **Démonstrations** : l'interface est reconstruite en HTML et rejoue une recherche réelle (trace, réponse
  diffusée mot à mot, sources). La vérification des citations applique en direct la règle de
  `verification.py` (part des mots porteurs de sens retrouvés dans le passage). Carte des connaissances en SVG.
- **Contenu** : la réponse d'exemple porte sur des faits vérifiables (traité de Verdun, Hugues Capet, Philippe
  Auguste, traité de Turin de 1860). Aucune donnée inventée sur les performances : tout vient du README.
- **Film** (`#film`, avant « § 1 ») : 40 s en 16:9, avec musique originale. Une recherche de bout en bout sur l'app
  réelle lancée avec les services simulés de ses tests (la note sous la vidéo le dit) : question, recherche en
  direct (26 images réelles, en accéléré), sources, rapport de vérification, carte, bibliothèque, clair et sombre.
  Fabriqué par `outils/films/presentations/knowledge-ai.html` ; lecteur commun `assets/js/film.js`.
