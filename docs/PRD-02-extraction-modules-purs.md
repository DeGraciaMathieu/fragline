# PRD 02 — Extraction des modules sans dépendance (config, weapons, geometry)

## Objectif

Extraire de `js/main.js` les données de configuration et les fonctions pures dans trois modules ES indépendants, importés par `main.js`.

## Contexte

Dépend du PRD 01. Ces trois blocs n'ont aucune dépendance vers l'état du jeu : ce sont des constantes et des fonctions pures. Ils sont extractibles sans risque et servent de fondation aux découpages suivants.

## Périmètre

### `js/config.js`

Exporter :
- `CFG` (tunables : dimensions, mouvement, dash, HP, bots, CTF) ;
- `BLUE`, `RED` ;
- `COLS`, `COLD` (palettes par équipe).

### `js/weapons.js`

Exporter :
- `HITSCAN`, `PELLET`, `PROJECTILE` (constantes de type d'arme) ;
- `WEAPONS` (tableau des définitions d'armes).

### `js/geometry.js`

Exporter les fonctions pures :
- `circleRect(cx, cy, r, R)` — résolution collision cercle/rectangle ;
- `rayRect(x0, y0, dx, dy, len, R)` — intersection rayon/rectangle ;
- `rayCircle(x0, y0, dx, dy, cx, cy, r)` — intersection rayon/cercle ;
- `d2(ax, ay, bx, by)` — distance au carré (actuellement définie dans la section CTF de `main.js` : la déplacer ici) ;
- `losClear(ax, ay, bx, by, walls)` — **attention** : cette fonction lit actuellement la globale `walls`. Lui passer `walls` en paramètre pour la rendre pure ; adapter les deux appels dans `main.js` (`updateBot` et la détection de cible).

### `js/main.js`

Remplacer les définitions déplacées par des imports. Le reste du fichier est inchangé.

## Hors périmètre

- Aucune extraction de code dépendant de l'état du jeu (input, combat, rendu…) — voir PRD 04.
- Aucune modification des valeurs de `CFG` ou `WEAPONS`.

## Critères d'acceptation

- [ ] `config.js`, `weapons.js`, `geometry.js` n'importent rien depuis `main.js` (dépendances à sens unique).
- [ ] `losClear` reçoit `walls` en paramètre et ne référence plus de globale.
- [ ] Comportement du jeu strictement identique (mouvement, collisions, lignes de vue des bots, dégâts des 4 armes).
- [ ] Aucune erreur console.

## Structure cible

```
js/
  config.js
  weapons.js
  geometry.js
  main.js
```
