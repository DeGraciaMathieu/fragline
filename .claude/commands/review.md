# /review — revue complète des changements en cours

Procédure :

1. **Lire `CLAUDE.md`** (racine) pour charger les conventions.
2. **Récupérer le périmètre** : `git diff`, `git diff --cached`, `git status`, `git log --oneline -5`. S'il n'y a aucun changement (working tree et index propres), répondre « Rien à revoir » et s'arrêter.
3. **Vérifier point par point**, sur les fichiers modifiés uniquement :

   **Conventions (CLAUDE.md)**
   - Simulation sans DOM : aucun `document`/`ctx`/`cv`/listener dans `update.js`, `player.js`, `bot.js`, `combat.js`, `ctf.js`, `entities.js`, `movement.js`, `state.js`, `geometry.js`.
   - État : pas de nouvelle variable mutable au niveau module — tout dans `state` (`js/state.js`), avec resets miroirs dans `resetMatch` (`js/main.js`) et `resetTestMatch` (`tests/helpers.js`).
   - Tunables : aucune valeur de gameplay en dur — tout dans `CFG` (`js/config.js`) ou `WEAPONS` (`js/weapons.js`).
   - Couches : dépendances à sens unique (table du skill architecture), pas de logique de jeu dans `js/main.js`, `js/geometry.js` pur, rendu en lecture seule de `state`.
   - Nommage/langue : camelCase, commentaires en anglais, UI/doc en français.

   **Couverture de tests**
   - Tout comportement de simulation nouveau/modifié a un test macro dans `tests/` (mapping du skill testing) ; les tests vérifient le comportement observable, pas l'implémentation.

   **Maintenabilité**
   - Couplage : le changement n'introduit pas d'import remontant les couches ni de cycle.
   - Responsabilité unique : chaque fonction modifiée garde un rôle ; signaler les fonctions qui dépassent nettement le gabarit du fichier (référence : `updateBot` ~50 lignes est le maximum actuel).
   - Duplication : pas de logique copiée entre modules (ex. resets non miroirs, géométrie recodée hors `geometry.js`).
   - Nommage et magic values : noms cohérents avec la terminologie du projet (`ents`, `flags`, `carrier`, `mag`…), pas de nombre magique de gameplay hors `CFG`/`WEAPONS`.

   **Cohérence système**
   - Intégration : le changement passe par les points d'entrée existants (`update.js` pour la simulation, `draw`/`drawHUD` pour le rendu, `initInput` pour les contrôles).
   - Forme des données : nouveaux champs d'état dans `state` avec la même forme que l'existant (objets plats, tableaux mutés en place).
   - Patterns : armes data-driven (pas de `if` par arme), fin de partie via `state.winner`, événements joueur via `feed`.
   - Doc vivante : si touches/armes/règles visibles ont changé, l'écran d'accueil d'`index.html` est à jour.

4. **Lancer `npm test`** et rapporter le résultat exact.
5. **Rapport structuré** : un statut par item — `OK` / `VIOLATION` (avec fichier:ligne et correction attendue) / `N/A` — puis un **verdict global** : ✅ conforme, ou ❌ à corriger avec la liste priorisée.
