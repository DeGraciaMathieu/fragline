---
name: testing
description: Use when writing, running, or fixing tests, or when deciding what and how to test a change in fragline.
auto_invoke: true
---

# Tests fragline

## Commandes

- `npm test` — suite complète, one-shot (Vitest 4, ~0,5 s).
- `npm run test:watch` — mode watch.

## Philosophie

**Tests macro sur la simulation headless.** L'architecture garantit que `update(state,dt)` et tout son graphe tournent sous Node sans DOM : les tests pilotent le jeu par ses fonctions publiques (`update`, `fire`, `updateCTF`, `damage`…) et vérifient le **comportement fonctionnel observable** (un ennemi meurt, un drapeau revient, un score monte) — jamais les détails d'implémentation (pas d'assertion sur des intermédiaires privés comme `hitscan` ou `explode`).

Règles pratiques :
- Le jeu utilise `Math.random()` (spread, strafe, dash des bots) : assertions **robustes**, pas de position exacte quand l'aléatoire intervient (cf. tolérance de 40 px sur le respawn dans `simulation.test.js`).
- `state` est un **singleton partagé** : chaque test commence par `resetTestMatch()` (en `beforeEach`).
- Le rendu (`render/`) et le DOM (`main.js`, `input.js`) ne sont **pas** couverts — c'est assumé : ils se vérifient en jouant (`php -S localhost:8000`).

## Mapping fichier de test → périmètre

| Fichier | Périmètre couvert |
|---|---|
| `tests/geometry.test.js` | Fonctions pures : `rayRect`, `rayCircle`, `losClear`, `d2`, `circleRect` |
| `tests/combat.test.js` | Tir hitscan (dégâts, mur bloquant), munitions/rechargement, roquettes (projectile → explosion → splash), `damage` |
| `tests/ctf.test.js` | Prise/port/retour de drapeau, capture et ses préconditions (drapeau à la base), drop à la mort, `FLAG_RETURN`, `state.winner` |
| `tests/simulation.test.js` | `update()` : stabilité 600 ticks, bornes de l'arène, cycle mort/respawn, pause (gameplay gelé, effets qui s'éteignent), expiration du feed |
| `tests/helpers.js` | `resetTestMatch()` (miroir sans DOM de `resetMatch` de `main.js`), `DT=1/60` |

## Où placer un nouveau test

1. **Choisir le fichier** par domaine (table ci-dessus) ; créer `tests/<domaine>.test.js` seulement pour un domaine réellement nouveau.
2. Importer `resetTestMatch` depuis `tests/helpers.js` et l'appeler en `beforeEach`.
3. Mettre en scène via `state` (positions, `weapon`, `score`…), agir via les fonctions publiques, vérifier le comportement observable.
4. **Si un champ est ajouté à `state`** : le réinitialiser aussi dans `resetTestMatch` (`tests/helpers.js`) ET dans `resetMatch` (`js/main.js`) — les deux doivent rester miroirs.
5. Lancer `npm test` — la suite doit être verte avant de déclarer la tâche terminée (un hook Stop l'impose).

## Géographie utile pour les mises en scène

- Couloir supérieur dégagé : `y=60`, `x` entre ~340 et ~640 (aucun mur — pratique pour les tests de ligne de vue).
- Pilier central : autour de `(CFG.W/2, CFG.H/2)` — pratique pour tester un tir bloqué.
- Bases : `BASE[BLUE]={x:80,y:360}`, `BASE[RED]={x:1040,y:360}` (exportées par `js/state.js`).
