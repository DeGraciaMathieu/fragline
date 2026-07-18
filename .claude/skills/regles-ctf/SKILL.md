---
name: regles-ctf
description: Use when changing game rules — flags, capture, scoring, win condition, death/respawn (ctf.js, entities.js, state.js).
auto_invoke: true
---

# Règles CTF

## Concepts → implémentation

| Concept | Implémentation |
|---|---|
| Drapeau | `state.flags[team]` : `{team, home:{x,y}, x, y, state, carrier, timer}` — construit dans `js/state.js` |
| États d'un drapeau | `'home'` (à la base) · `'dropped'` (au sol, `timer` décompte) · `'carried'` (suit `carrier`) |
| Prise du drapeau ennemi | `updateCTF` (`js/ctf.js`) : distance < `CFG.GRAB` (26 px) et drapeau `home`/`dropped` sans porteur |
| Capture (marquer) | `updateCTF` : porteur à moins de `CFG.CAPTURE` (40 px) de sa base **et son propre drapeau `home`** — c'est la règle « ton drapeau doit être à la base pour marquer » |
| Retour de drapeau | Coéquipier qui touche son drapeau `dropped` → retour instantané ; sinon auto-retour après `CFG.FLAG_RETURN` (12 s) |
| Drop à la mort | `damage` (`js/entities.js`) → `dropFlag` (`js/ctf.js`) si le mort portait un drapeau |
| Score | `state.score[team]`, incrémenté dans `updateCTF` à la capture |
| Victoire | `state.score >= CFG.WIN` (3) → `updateCTF` pose **`state.winner = team`** ; c'est `main.js` qui appelle `endGame` (la simulation ne touche jamais au DOM) |
| Équipe adverse | `other(t)` exportée par `js/ctf.js` |
| Mort / respawn | `damage` → `alive=false`, `respawn=CFG.RESPAWN` (2,2 s) ; décompte dans `update.js` → `respawn(e)` (`js/entities.js`) à la base, HP/munitions pleins |
| Kill feed | `feed(txt, team, cap)` (`js/render/hud.js`) — messages en français (`prend le drapeau`, `ramène le drapeau`, `CAPTURE !`, `frag`) |

Tunables : `GRAB`, `CAPTURE`, `FLAG_RETURN`, `WIN`, `RESPAWN`, `MAX_HP` dans `js/config.js`.

## Modifier une règle CTF

1. Si c'est une valeur (rayon, délai, score cible) : `CFG` dans `js/config.js` uniquement.
2. Si c'est un comportement : `updateCTF`/`dropFlag` dans `js/ctf.js`. Contraintes :
   - pas d'accès DOM — tout événement de fin de partie passe par un champ de `state` (`state.winner`) lu par `main.js` ;
   - annoncer les événements au joueur via `feed(...)` ;
   - un nouvel état de drapeau doit être gérée par `bot.js` (choix d'objectif) et `render/world.js`/`hud.js` (drapeau + chips `BASE`/`PRIS`/`LÂCHÉ`).
3. Nouveau champ d'état → l'ajouter dans `state` (`js/state.js`) **et** le réinitialiser dans `resetMatch` (`js/main.js`) et `resetTestMatch` (`tests/helpers.js`).
4. Mettre à jour `tests/ctf.test.js` (les règles y sont toutes couvertes, y compris la précondition de capture et `state.winner`) ; `npm test` vert.
5. Si la règle est visible du joueur : répercuter dans l'écran d'accueil d'`index.html` (« PREMIER À 3 », `.hint`) — le hook Stop de synchro doc le vérifie.
