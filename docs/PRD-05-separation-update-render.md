# PRD 05 — Séparation simulation / rendu dans la boucle de jeu

## Objectif

Restructurer la boucle `loop()` de `main.js` en deux phases explicites — `update(state, dt)` puis `render(ctx, state)` — pour que la simulation soit exécutable sans canvas ni DOM.

## Contexte

Dépend du PRD 04. La boucle actuelle entremêle mises à jour et effets qui continuent d'animer en pause (beams, particules, shake, flashes). Cette étape clarifie qui avance quoi, et ouvre la voie à la testabilité de la simulation et, à terme, à un pas de temps fixe ou du multijoueur.

## Périmètre

### `js/update.js` (nouveau)

Exporter une fonction `update(state, dt)` qui regroupe, dans l'ordre actuel de la boucle :

1. **Simulation de partie** (uniquement si `state.running && !state.gameOver`) :
   - `updatePlayer(dt)` ;
   - respawn des morts / `updateBot` pour les bots vivants ;
   - `updateCTF(dt)` ;
   - `updateProjectiles(dt)` ;
   - expiration des `feedItems` et du `bannerT` ;
   - tir automatique maintenu (`mDown` + arme `auto`) ;
   - détection de `state.winner` (posé par `updateCTF`, cf. PRD 04).
2. **Effets toujours actifs** (même en pause, pour que les effets se terminent proprement) :
   - expiration des `beams` ;
   - `updateParticles(dt)` ;
   - décroissance de `shake`, `hitFlash`, `hurtFlash`.

### `js/main.js`

La boucle devient :

```js
function loop(now){
  requestAnimationFrame(loop);
  let dt = (now - last) / 1000; last = now;
  if (dt > 0.05) dt = 0.05;
  update(state, dt);
  if (state.winner !== null) endGame(state.winner);
  render(ctx, state);
}
```

- `render(ctx, state)` est l'appel existant `draw` + `drawHUD` (regroupés derrière une seule fonction exportée par `render/world.js` ou un `render/index.js`, au choix de l'implémenteur).
- `main.js` ne contient plus aucune logique de mise à jour d'état dans la boucle.

## Hors périmètre

- Pas de pas de temps fixe (accumulateur) : le `dt` variable plafonné à 0.05 s est conservé tel quel.
- Pas de tests automatisés de la simulation — l'étape la rend seulement possible.
- Pas de système d'événements, pas de découplage audio supplémentaire.

## Critères d'acceptation

- [ ] `update(state, dt)` ne référence ni `ctx`, ni `document`, ni le canvas (les modules qu'il importe non plus, hors `audio.js` qui reste toléré car appelé par la logique de combat).
- [ ] La boucle de `main.js` se réduit à : calcul du `dt`, `update`, détection de fin de partie, `render`.
- [ ] Comportement strictement identique, y compris : effets qui finissent de s'animer sur l'écran de fin, plafonnement du `dt`, tir automatique maintenu.
- [ ] Aucune erreur console.

## Structure cible

```
js/
  …(modules du PRD 04)
  update.js
  main.js
```
