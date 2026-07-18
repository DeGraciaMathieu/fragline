---
name: rendu-hud
description: Use when drawing anything — world entities, HUD elements, beams/particles/screenshake — or touching render/world.js, render/hud.js.
auto_invoke: true
---

# Rendu & HUD

Deux modules, **lecture seule de `state`** : `js/render/world.js` (monde, espace jeu, mis à l'échelle par `state.scale`) et `js/render/hud.js` (interface, espace écran en pixels canvas). `ctx` et `cv` sont **passés en paramètres** (`draw(ctx,cv)`), jamais importés. `main.js` appelle `draw` une fois par frame ; `draw` termine par `drawHUD`.

## Ordre de dessin dans `draw` (`render/world.js`)

sol → grille → ligne médiane → zones de base → murs → beams → particules → roquettes → drapeaux (sauf portés) → acteurs (`drawActor` : anneau dash prêt, corps, canon, muzzle flash, drapeau porté, barre HP des bots) → ligne de visée du joueur → **HUD**.

Un nouvel élément du monde s'insère à sa place dans cet ordre (ce qui est dessiné après passe devant). Le screenshake est un `ctx.translate` aléatoire appliqué à tout le monde quand `state.shake>0.2`.

## Éléments du HUD (`render/hud.js`)

| Élément | Où dans `drawHUD` | Données lues |
|---|---|---|
| Score + « CAPTURES » | haut centre | `state.score` |
| Chips drapeaux (`BASE`/`PRIS`/`LÂCHÉ`) | `chip(ctx,x,y,team)` | `state.flags[t].state` |
| Barre de vie + « HP » | bas gauche | `state.player.hp` |
| Jauges arme/recharge + dash | `meter(ctx,...)`, bas droite | `railCd`/`cd`, `reload`, `dashCd` |
| Munitions (chargeur / réserve) | bas droite | `player.mags`, `player.reserves` |
| Slots d'armes 1–4 | bas centre — s'adapte seul à `WEAPONS.length` | `WEAPONS`, `player.weapon`, `mags` |
| Kill feed | `feed()` alimente `state.feedItems`, rendu haut gauche | `state.feedItems` |
| « ÉLIMINÉ » / bannière | centre | `player.alive`, `state.bannerT/bannerTxt` |
| Vignettes hit (anneau blanc) / hurt (rouge) | plein écran | `state.hitFlash`, `state.hurtFlash` |

Textes du HUD **en français**, police `Chakra Petch`, couleurs d'équipe via `COLS`/`COLD` (`js/config.js`).

## Effets visuels : qui produit, qui consomme

| Effet | Produit par (simulation) | Données | Consommé par |
|---|---|---|---|
| Trace de tir | `hitscan` → `state.beams` | style `beam:{...}` de l'arme (`squiggle` = spirale railgun) | boucle beams de `draw` ; expiration dans `update.js` |
| Étincelles/fumée/anneau d'explosion | `spark`/`explode`/`updateProjectiles` → `state.particles` (`{boom:true}` = anneau) | — | boucle particules de `draw` ; `updateParticles` |
| Screenshake | `addShake` (`js/combat.js`) | `shake`/`boomShake` de l'arme | `draw` ; décroissance dans `update.js` |
| Flash de dégât sur l'acteur | `damage` → `e.flash` | — | `drawActor` |

## Ajouter un élément de HUD

1. Le dessiner dans `drawHUD` (`js/render/hud.js`) ; réutiliser `meter`/`chip` si la forme existe.
2. Ses données doivent déjà exister dans `state` ou `WEAPONS` — le rendu ne calcule pas de logique de jeu et ne mute rien.
3. Si l'élément a un cycle de vie (fondu, expiration), la décroissance va dans `update.js` (section effets, active même en pause), pas dans le rendu.
4. Le rendu n'est pas couvert par les tests : vérifier en jouant (`php -S localhost:8000`), et `npm test` doit rester vert (le graphe de simulation ne doit pas se mettre à importer `render/` autre que `hud.js` pour `feed`/`banner`).
