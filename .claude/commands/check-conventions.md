# /check-conventions — vérification rapide des conventions

Version allégée de `/review`, centrée conventions.

1. **Lire `CLAUDE.md`** (racine).
2. **Récupérer le périmètre** : `git diff`, `git diff --cached`, `git status`, `git log --oneline -5`. Aucun changement → « Rien à vérifier », stop.
3. **Vérifier**, sur les fichiers modifiés uniquement :
   - Simulation sans DOM (`update.js` et son graphe : pas de `document`/`ctx`/`cv`).
   - État centralisé : pas de variable mutable de module ; nouveaux champs de `state` réinitialisés dans `resetMatch` (`js/main.js`) **et** `resetTestMatch` (`tests/helpers.js`).
   - Tunables dans `CFG`/`WEAPONS`, pas en dur.
   - Dépendances à sens unique, pas de logique de jeu dans `main.js`, `geometry.js` pur.
   - Commentaires en anglais, UI/textes joueur en français.
   - **Cohérence tests/doc** : comportement de simulation modifié → test macro correspondant mis à jour (`tests/`) ; règle visible modifiée → écran d'accueil d'`index.html` à jour ; nouveau module/convention → CLAUDE.md et skills à jour.
4. **Lancer `npm test`** et rapporter le résultat.
5. **Rapport** : statut par item (`OK` / `VIOLATION` avec fichier:ligne / `N/A`) + verdict global.
