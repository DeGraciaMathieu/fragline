---
name: armes-combat
description: Use when adding or balancing a weapon, or touching firing, reload, projectiles, explosions, or hit effects (weapons.js, combat.js).
auto_invoke: true
---

# Armes & combat

L'arsenal est **piloté par les données** : une arme = une entrée du tableau `WEAPONS` (`js/weapons.js`). La logique de `js/combat.js` est générique par `kind` — ajouter une arme d'un kind existant ne demande aucun code dans `combat.js`.

## Les 3 kinds

| Kind | Constante | Comportement (`fire` dans `js/combat.js`) | Exemple |
|---|---|---|---|
| Hitscan | `HITSCAN=0` | 1 rayon instantané (`hitscan`), spread aléatoire | RAILGUN (perce : touche tous les ennemis en ligne), FUSIL D'ASSAUT (auto) |
| Pellets | `PELLET=1` | `pellets` rayons par tir, spread par pellet | FUSIL À POMPE |
| Projectile | `PROJECTILE=2` | pousse dans `state.projectiles`, avancé par `updateProjectiles`, explose via `explode` (splash + knockback, y compris soi → rocket-jump) | LANCE-ROQUETTES |

## Champs d'une définition d'arme

| Champ | Effet | Consommé par |
|---|---|---|
| `key`, `name` | Libellé slot HUD / nom affiché | `render/hud.js` |
| `kind`, `dmg`, `spread`, `range` | Type, dégâts, dispersion (rad), portée | `fire`/`hitscan` |
| `cd` / `botCd` | Cadence joueur / bot (s) | `fire` |
| `pierce` | Le rayon traverse les ennemis | `hitscan` |
| `auto` | Tir maintenu (clic enfoncé) | `update.js` (full-auto hold-to-fire) |
| `mag`, `reserve`, `reload` | Chargeur, réserve (joueur ; bots = infinie), durée de recharge | `startReload`/`finishReload`, HUD |
| `pellets` | Nb de rayons par tir (PELLET) | `fire` |
| `speed`, `splash`, `splashDmg`, `knock` | Projectile : vitesse, rayon/dégâts de zone, knockback | `updateProjectiles`/`explode` |
| `botRange` | Distance de combat idéale du bot | `bot.js` (gating de tir + kiting) |
| `beam:{glow,w,core,squiggle,life,color}` | Style de la trace de tir | `render/world.js` |
| `snd:{f,d,t,v}`, `shake`, `boomShake` | Son (`zap`), screenshake | `fire`/`explode` |
| `teamColor`, `color` | Couleur beam = couleur d'équipe / couleur projectile | rendu |

## Flux d'un tir

`input.js` (clic) ou `bot.js` → `fire(e)` [`js/combat.js`] : vérifie `alive`/`railCd`/`reload`/`mags` → décrémente le chargeur → cooldown, shake, `zap` → selon `kind` → `damage(victime, dmg, tireur)` [`js/entities.js`] → mort éventuelle : `dropFlag`, `feed`, respawn différé. Chargeur vide → `startReload` automatique.

## Ajouter une nouvelle arme

1. Ajouter l'entrée dans `WEAPONS` (`js/weapons.js`) en copiant l'arme existante du même `kind` et en ajustant les champs (table ci-dessus). **Attention** : `input.js` mappe `Digit1`–`Digit4` — au-delà de 4 armes, étendre la plage dans `initInput` (la molette et le HUD s'adaptent seuls à `WEAPONS.length`).
2. Si un bot doit la porter : loadouts en bas de `js/state.js` (`state.ents[i].weapon=...`).
3. Équilibrage bot : renseigner `botCd` et `botRange` (sinon le bot combat mal avec).
4. Mettre à jour la ligne des armes de l'écran d'accueil dans `index.html` (`RAIL · ASSAUT · POMPE · ROQUETTES`) — le hook Stop de synchro doc le vérifie.
5. Tester dans `tests/combat.test.js` (comportement macro : la cible meurt/survit, munitions décrémentées) puis `npm test`.

Un nouveau `kind` (ex. grenade à rebond) demande en plus : une constante dans `js/weapons.js`, une branche dans `fire`, et l'update/rendu correspondants (`updateProjectiles` ou équivalent, `render/world.js`).

## Équilibrer une arme existante

Modifier uniquement `js/weapons.js` (jamais de valeur en dur dans `combat.js`). Les tests de `tests/combat.test.js` s'appuient sur des invariants (RAILGUN = 100 dmg ≥ `MAX_HP`, one-shot) : si l'équilibrage casse un invariant, ajuster le test **en le gardant macro**.
