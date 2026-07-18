---
name: architecture
description: Use when navigating the codebase, deciding where new code belongs, adding a module, or reasoning about layer boundaries and import rules in fragline.
auto_invoke: true
---

# Architecture de fragline

Jeu Canvas 2D en modules ES, sans dépendance ni build. Couches à dépendances **strictement à sens unique** (un module n'importe que des couches inférieures).

## Carte des modules

| Module | Rôle | Dépendances clés |
|---|---|---|
| `js/config.js` | Tunables `CFG` (arène, mouvement, dash, HP, bots, CTF), équipes `BLUE`/`RED`, palettes `COLS`/`COLD` | — |
| `js/weapons.js` | `WEAPONS` (définitions data-driven), kinds `HITSCAN`/`PELLET`/`PROJECTILE` | — |
| `js/geometry.js` | Fonctions **pures** : `circleRect`, `rayRect`, `rayCircle`, `losClear`, `d2` | — |
| `js/state.js` | Objet `state` (tout l'état mutable), construction de l'arène (`walls`), `BASE`, `flags`, `mkEnt` + création joueur/bots | config, weapons |
| `js/audio.js` | `actx`, `zap` (sons WebAudio synthétisés ; no-op silencieux hors navigateur) | — |
| `js/entities.js` | `damage`, `respawn` | state, ctf (dropFlag), render/hud (feed), audio |
| `js/movement.js` | `collide`, `move` (accel/friction), `tryDash` | geometry, combat (finishReload), audio |
| `js/combat.js` | `fire`, `hitscan` (privé), `startReload`/`finishReload`, `explode` (privé), `updateProjectiles`, `updateParticles`, `addShake`, `spark` | weapons, geometry, entities (damage), audio |
| `js/ctf.js` | `updateCTF`, `dropFlag`, `other` ; pose `state.winner` à la capture décisive | geometry, render/hud (feed), audio |
| `js/player.js` | `updatePlayer` (input → visée/mouvement/dash) | movement |
| `js/bot.js` | `updateBot` (IA complète d'un bot) | geometry, ctf (other), combat (fire), movement |
| `js/update.js` | `update(state,dt)` — **le pas de simulation, sans DOM** | player, bot, ctf, combat, entities |
| `js/input.js` | `initInput(cv)` — listeners clavier/souris/molette → écrit dans `state` | combat (fire, startReload) |
| `js/render/world.js` | `draw(ctx,cv)` — monde entier + appelle `drawHUD` | state (lecture), render/hud |
| `js/render/hud.js` | `drawHUD(ctx,cv)`, `chip`/`meter` (privés), `feed`, `banner` | state |
| `js/main.js` | **Assemblage uniquement** : canvas/`fit`, `initInput`, `resetMatch`/`start`/`endGame`, boucle `update` → `draw` | tout le reste |

Boucle (`js/main.js`) : `update(state,dt)` → `if(state.winner!==null) endGame(state.winner)` → `draw(ctx,cv)`.

## Où placer du nouveau code

| Type de changement | Où | Ne surtout pas |
|---|---|---|
| Nouvelle valeur d'équilibrage (vitesse, portée, délai…) | `CFG` dans `js/config.js`, ou champ de l'arme dans `js/weapons.js` | En dur dans la logique |
| Nouvelle arme | Entrée `WEAPONS` dans `js/weapons.js` (voir skill armes-combat) | Nouveau `if` par arme dans `combat.js` |
| Nouvelle règle de jeu (score, drapeaux, victoire) | `js/ctf.js` ; nouveaux champs d'état dans `state` | Appeler du DOM — signaler via un champ de `state` lu par `main.js` |
| Nouveau comportement de bot | `js/bot.js` ; tunables dans `CFG.BOT_*` | — |
| Nouveau contrôle clavier/souris | `js/input.js` (`initInput`) | Listeners ailleurs |
| Nouvel élément visuel du monde | `js/render/world.js` (respecter l'ordre de dessin) | Muter `state` depuis le rendu |
| Nouvel élément de HUD | `js/render/hud.js` | — |
| Nouveau calcul géométrique | `js/geometry.js` — fonction pure, `walls`/données en paramètres | Accéder à `state` |
| Nouvelle donnée d'état | Champ de l'objet `state` dans `js/state.js` + reset dans `resetMatch` (`js/main.js`) et `resetTestMatch` (`tests/helpers.js`) | Variable mutable au niveau module |
| Nouvel écran / élément DOM | `index.html` + `css/style.css`, orchestré par `js/main.js` | — |
| Ce qui doit tourner chaque frame | `js/update.js` (partie simulation ou partie « effets toujours actifs ») | Directement dans la boucle de `main.js` |

## Ajouter un nouveau module

1. Créer `js/<nom>.js` ; n'importer que des couches inférieures (voir table).
2. Si le module a de l'état, le mettre dans `state` (`js/state.js`), pas en variable de module.
3. Le brancher : dans `js/update.js` s'il participe à la simulation, dans `js/render/world.js` s'il dessine, dans `js/main.js` s'il relève de l'assemblage.
4. Vérifier l'absence de cycle : le jeu doit charger sans `Cannot access before initialization`, et `npm test` doit passer (les tests importent le graphe complet de simulation).
