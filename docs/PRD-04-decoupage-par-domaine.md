# PRD 04 — Découpage de `main.js` par domaine fonctionnel

## Objectif

Éclater le reste de `js/main.js` en modules par domaine (input, audio, combat, CTF, entités, joueur, bots, rendu), en suivant le découpage déjà dessiné par les sections commentées du code d'origine.

## Contexte

Dépend du PRD 03 : l'objet `state` étant en place, les fonctions peuvent migrer vers des modules qui importent `state` au lieu de partager des globales.

## Périmètre

### Modules à créer

| Module | Contenu (fonctions actuelles) |
|---|---|
| `js/audio.js` | `actx`, `zap` |
| `js/input.js` | listeners clavier/souris/molette, écriture dans `state.keys`, `state.mx/my/mDown` |
| `js/entities.js` | `respawn`, `damage` |
| `js/movement.js` | `move`, `tryDash`, `collide` |
| `js/combat.js` | `fire`, `hitscan`, `startReload`, `finishReload`, `explode`, `updateProjectiles`, `addShake`, `spark`, `updateParticles` |
| `js/ctf.js` | `updateCTF`, `dropFlag`, `other` |
| `js/player.js` | `updatePlayer` |
| `js/bot.js` | `updateBot` |
| `js/render/world.js` | `draw`, `drawFlag`, `drawActor` |
| `js/render/hud.js` | `drawHUD`, `chip`, `meter`, `feed`, `banner` |
| `js/main.js` | canvas/`fit`, `loop`, `start`, `endGame`, `resetMatch`, listeners d'écran |

### Règles de dépendance

- Chaque module importe ce dont il a besoin depuis `config.js`, `weapons.js`, `geometry.js`, `state.js` — jamais depuis `main.js`.
- `main.js` devient le point d'assemblage : il importe et orchestre, il ne définit plus de logique de jeu.
- Cycles à résoudre explicitement :
  - `damage` (entities) appelle `dropFlag` (ctf) et `feed` (hud) ; `updateCTF` appelle `feed` et `endGame`. Résolution recommandée : `feed`/`banner` vivent dans `hud.js` et sont importables sans cycle ; pour `endGame`, faire poser un drapeau dans l'état (`state.winner = team`) par `updateCTF` et laisser `main.js` détecter `state.winner` dans la boucle pour déclencher la fin de partie.
  - `input.js` appelle `fire` et `startReload` (combat) : import direct, pas de cycle.
- Le canvas et `ctx` : `main.js` les crée et les passe aux fonctions de rendu en paramètre (`draw(ctx, state)`), plutôt que de les exporter en globale.
- `scale` est lu par `input.js` (conversion coordonnées souris) et écrit par `fit()` : le stocker dans `state` (`state.scale`).

## Hors périmètre

- Aucune modification de logique de jeu, de gameplay ou de valeurs.
- Pas de séparation update/render dans la boucle (PRD 05).
- Pas de système d'événements pour découpler audio/HUD (amélioration ultérieure possible, non requise ici).

## Critères d'acceptation

- [ ] `main.js` ≤ ~100 lignes : setup canvas, boucle, flux de partie (start/end/reset) uniquement.
- [ ] Aucun cycle d'import (vérifiable : le jeu charge sans erreur `Cannot access before initialization`).
- [ ] Comportement strictement identique : 4 armes, rechargement, dash, IA des bots, CTF complet, HUD, feed, écrans de début/fin, rejouer.
- [ ] Aucune erreur console.

## Structure cible

```
js/
  config.js  weapons.js  geometry.js  state.js
  audio.js   input.js    entities.js  movement.js
  combat.js  ctf.js      player.js    bot.js
  render/
    world.js
    hud.js
  main.js
```
