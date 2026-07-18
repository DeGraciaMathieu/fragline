---
name: ia-bots
description: Use when tuning bot difficulty or behavior — targeting, aiming, kiting, dash, goal selection (bot.js, CFG.BOT_*).
auto_invoke: true
---

# IA des bots

Toute l'IA tient dans `updateBot(e,dt)` (`js/bot.js`), appelée chaque tick par `js/update.js` pour chaque bot vivant. Pipeline de décision, dans l'ordre du code :

| Étape | Logique | Tunables |
|---|---|---|
| 1. Objectif (`gx,gy`) | Porteur → sa base ; sinon son drapeau si `dropped` → le récupérer ; sinon → drapeau ennemi | — |
| 2. Détection d'ennemi | Ennemi vivant le plus proche, à portée **et** en ligne de vue (`losClear(..., state.walls)`) | `CFG.BOT_VIEW` (380 px) |
| 3. Visée | Lerp angulaire vers la cible (ou l'objectif) — une cible qui strafe vite peut esquiver | `CFG.BOT_AIM_LERP` (5.0) |
| 4. Décision de tir | Cumule `e.react` face à un ennemi ; tire si cooldown fini, réaction acquise, visée < 0.4 rad, et distance < `botRange*1.3` | `CFG.BOT_REACT` (0,45 s), `botCd`/`botRange` **par arme** (`js/weapons.js`) |
| 5. Déplacement | Porteur : fonce à la base. Combat : maintient `botRange` (approche/recule) + strafe alterné (période via `e.think`). Sinon : va à l'objectif | `botRange`, facteur strafe 0.85 |
| 6. Évitement | « Obstacle nudge » : mur droit devant → vire à 90° | — |
| 7. Dash | Aléatoire : probabilité `dt*0.35` si cooldown prêt | `CFG.DASH_CD` |

Les bots utilisent les mêmes primitives que le joueur : `fire` (`js/combat.js`), `move`/`tryDash` (`js/movement.js`). Différences codées : cadence `botCd` (plus lente), réserve de munitions infinie (`finishReload`), shake et volume sonore réduits.

## Ajuster la difficulté

Ne toucher que des données :
- Globales : `CFG.BOT_VIEW` (distance de détection), `CFG.BOT_REACT` (temps de réaction), `CFG.BOT_AIM_LERP` (vitesse de visée — plus haut = plus dur à esquiver) dans `js/config.js`.
- Par arme : `botCd` (cadence) et `botRange` (distance de combat) dans `js/weapons.js`.
- Composition d'équipe : loadouts en bas de `js/state.js` (`state.ents[i].weapon=...` ; ordre : `[player, B-1, B-2, R-1, R-2, R-3]`).

## Ajouter un comportement

1. L'insérer dans le pipeline d'`updateBot` (`js/bot.js`) à la bonne étape (objectif, ciblage ou déplacement) ; toute nouvelle constante va dans `CFG.BOT_*` (`js/config.js`).
2. Rester sans DOM et sans état de module : l'état par bot vit sur l'entité (`e.think`, `e.react`… — champs créés dans `mkEnt`, `js/state.js`).
3. Tester macro dans `tests/simulation.test.js` : faire tourner `update()` N ticks et vérifier un comportement observable (position, tir, score). Les bots sont volontairement aléatoires (strafe, dash) — assertions avec tolérance, jamais de position exacte.
4. `npm test` vert avant de conclure.
