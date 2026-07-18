# /check-tests — analyse de couverture et tests manquants

1. **Lire `CLAUDE.md`** (racine) et le skill **testing** (philosophie macro, mapping fichier → périmètre).
2. **Récupérer le périmètre** : `git diff`, `git diff --cached`, `git status`, `git log --oneline -5`. Aucun changement → « Rien à analyser », stop.
3. **Analyser la couverture** des changements :
   - Pour chaque comportement de simulation ajouté/modifié (dans `update.js`, `combat.js`, `ctf.js`, `bot.js`, `entities.js`, `movement.js`, `state.js`, `geometry.js`), vérifier qu'un test de `tests/` l'exerce réellement (pas seulement qu'il passe à travers).
   - Rendu (`render/`), `main.js` et `input.js` : hors périmètre des tests automatisés — `N/A`, vérification en jouant.
4. **Proposer les tests manquants** : pour chacun, une ligne « scénario → comportement observable attendu », en style macro (mise en scène via `state`, action via les fonctions publiques, assertion sur l'observable ; `resetTestMatch` en `beforeEach` ; tolérance sur tout ce qui dépend de `Math.random`).
5. **Attendre la validation de l'utilisateur** (questions cliquables) avant d'écrire quoi que ce soit. N'écrire que les tests validés, dans le bon fichier selon le mapping du skill testing.
6. **Relancer `npm test`** et rapporter le résultat.
7. **Rapport** : par comportement — `OK` (couvert) / `VIOLATION` (non couvert → test proposé/écrit) / `N/A` — + verdict global.
