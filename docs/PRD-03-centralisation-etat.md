# PRD 03 — Centralisation de l'état mutable dans un objet `state`

## Objectif

Regrouper les ~25 variables globales mutables du jeu dans un objet `state` unique, exporté par un module `js/state.js`, afin de rendre l'état explicite, traçable et le futur découpage par domaine (PRD 04) possible.

## Contexte

Dépend du PRD 02. Aujourd'hui l'état est éclaté en globales lues et écrites librement par toutes les fonctions (`hitFlash` est par exemple écrit par `hitscan`, `damage` et `loop`). C'est le principal blocage à la modularisation.

## Périmètre

### `js/state.js`

Créer et exporter l'objet d'état ainsi que ses fonctions de construction :

```js
export const state = {
  // monde
  walls: [], flags: {}, ents: [], player: null,
  // effets
  beams: [], projectiles: [], particles: [],
  shake: 0, hitFlash: 0, hurtFlash: 0,
  // partie
  score: {0: 0, 1: 0}, running: false, gameOver: false,
  // HUD
  feedItems: [], bannerTxt: '', bannerT: 0,
  // input
  keys: {}, mx: 0, my: 0, mDown: false,
};
```

- Déplacer dans ce module la construction de l'arène (`wall`, `coverLR`, murs, `BASE`, `flags`) et la création des entités (`mkEnt`, création du joueur et des bots, loadouts).
- `BASE` est une constante dérivée de `CFG` : l'exporter depuis `state.js` (ou `config.js`, au choix de l'implémenteur, mais un seul endroit).

### `js/main.js`

- Supprimer les globales déplacées ; remplacer chaque accès par `state.xxx` (ex. `score[0]` → `state.score[0]`, `running` → `state.running`).
- Les fonctions qui écrivaient des globales scalaires (`shake`, `hitFlash`, `hurtFlash`, `bannerT`…) écrivent désormais dans `state` — c'est ce qui motive l'objet plutôt que des exports scalaires (les bindings importés ne sont pas réassignables).

## Hors périmètre

- Aucun découpage supplémentaire de `main.js` en modules (PRD 04).
- Aucune sérialisation, sauvegarde ou replay — l'objet `state` les rend seulement possibles.
- Pas d'immutabilité ni de store type Redux : mutation directe conservée.

## Critères d'acceptation

- [ ] Plus aucune variable d'état mutable au niveau module dans `main.js` (seules restent les références DOM, `ctx`, `scale`/`ox`/`oy` et `last` de la boucle).
- [ ] `state.js` ne dépend que de `config.js` et `weapons.js`.
- [ ] Comportement du jeu strictement identique, y compris `resetMatch` (reset des scores, drapeaux, effets, respawn de toutes les entités).
- [ ] Aucune erreur console.

## Structure cible

```
js/
  config.js
  weapons.js
  geometry.js
  state.js
  main.js
```
