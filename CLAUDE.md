# fragline

RAIL ARENA 2D — prototype de capture the flag en vue du dessus (Canvas 2D) : un joueur et 5 bots, 4 armes, mouvement inspiré de Quake (accélération/friction), premier à 3 captures.

## Stack

- **JavaScript vanilla en modules ES** (16 modules dans `js/`), **HTML5 Canvas 2D**, **CSS pur** (`css/style.css`), **WebAudio** (sons synthétisés). Aucune dépendance de production, aucun build.
- **Vitest 4** pour les tests (seule devDependency).
- Commandes :
  - Dev : `php -S localhost:8000` (n'importe quel serveur statique convient — les modules ES bloquent `file://`).
  - Tests : `npm test` (one-shot) · `npm run test:watch`.
  - Pas de lint ni de formatteur configurés.

## Conventions de code

Architecture en couches, dépendances à sens unique (bas → haut : données pures → état → simulation → rendu/IO → assemblage) :

- **La simulation ne touche jamais au DOM.** `js/update.js` et tout son graphe (`player.js`, `bot.js`, `combat.js`, `ctf.js`, `entities.js`, `movement.js`) doivent rester exécutables sous Node sans navigateur — c'est ce que testent les tests. Seule exception tolérée : `audio.js` (WebAudio, no-op silencieux hors navigateur).
- **Tout l'état mutable vit dans l'objet `state`** (`js/state.js`). Ne jamais créer de variable mutable au niveau module ailleurs (les bindings importés ne sont pas réassignables ; c'est la raison d'être de l'objet).
- **Aucune valeur de gameplay en dur** : les tunables vont dans `CFG` (`js/config.js`) ou dans les définitions d'armes `WEAPONS` (`js/weapons.js`). Les armes sont pilotées par les données : ajouter une arme ne doit pas demander de nouveau `if` dans `combat.js` tant qu'elle est d'un `kind` existant.
- **`js/geometry.js` ne contient que des fonctions pures** — pas d'accès à `state`, tout passe en paramètres (ex. `losClear(ax,ay,bx,by,walls)`).
- **Le rendu lit `state`, ne le mute jamais.** `ctx` et `cv` sont passés en paramètres aux fonctions de rendu (`draw(ctx,cv)`), jamais importés.
- **`js/main.js` est un point d'assemblage** (~48 lignes) : canvas, boucle, `resetMatch`/`start`/`endGame`. Aucune logique de jeu ne doit y retourner — c'est l'équivalent local de « pas de logique métier dans le Controller ».
- **Pas de cycle d'import.** Les cas connus sont résolus ainsi : la fin de partie se signale par `state.winner` (posé par `ctf.js`, consommé par `main.js`) — ne jamais appeler de fonction DOM depuis la simulation ; `feed`/`banner` vivent dans `render/hud.js` et sont importables par la simulation.
- Nommage : camelCase ; `e` pour une entité, `W` pour une définition d'arme, `f` pour un drapeau ; équipes `BLUE=0`, `RED=1`. Commentaires de code **en anglais**, UI et documentation **en français**.
- Style existant : code dense (plusieurs instructions par ligne) — le respecter dans les fichiers existants, ne pas reformater.

## Domaine / visuel

- Terminologie : `ents` (entités), `flags` (états `home`/`dropped`/`carried`), `carrier`, `frag`, `dash`, `hitscan`/`pellet`/`projectile` (les 3 `kind` d'armes), `mag`/`reserve` (munitions), `beams` (traces de tir).
- Palette par équipe dans `COLS`/`COLD` (`js/config.js`), police HUD `Chakra Petch`. Quirk existant : `ctx.arc(...,0,7)` utilise 7 comme approximation de 2π — ne pas le « corriger » ponctuellement sans traiter tout le fichier.

## Comportement

- **Ne jamais déclarer une tâche terminée sans avoir lancé `npm test` et vérifié que la suite passe.**
- **Si une approche échoue après 2 tentatives, reprendre le plan avant de continuer** (ne pas s'acharner sur la même piste).
- Toute modification de règle visible (touches, armes, condition de victoire, règle CTF) doit être répercutée dans l'écran d'accueil d'`index.html` — un hook Stop le vérifie.
- Les spécifications s'écrivent dans `docs/` au format `PRD-XX-slug.md` (numérotation continue).

## Skills disponibles

- **architecture** — carte des modules, dépendances, et où placer du nouveau code selon le type de changement.
- **testing** — commande, philosophie (tests macro sur la simulation headless), mapping fichier de test → périmètre.
- **armes-combat** — arsenal `WEAPONS`, tir/rechargement/projectiles (`combat.js`), procédure « ajouter une arme ».
- **regles-ctf** — drapeaux, capture, score, victoire, dégâts/respawn (`ctf.js`, `entities.js`).
- **ia-bots** — pipeline de décision des bots (`bot.js`), tunables de difficulté.
- **rendu-hud** — ordre de dessin (`render/world.js`), éléments du HUD (`render/hud.js`), effets visuels.
- **feature** (invocable) — workflow d'implémentation d'une fonctionnalité de bout en bout.
- **prd** (invocable) — rédaction d'une spécification dans `docs/` sans implémenter.
