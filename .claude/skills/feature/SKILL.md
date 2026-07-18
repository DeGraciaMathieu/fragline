---
name: feature
description: Use when implementing a feature end-to-end in fragline — from understanding the request to green tests and updated docs.
user_invocable: true
---

# Workflow : implémenter une fonctionnalité

Dérouler ces étapes dans l'ordre. Ne pas sauter la phase de compréhension.

## 1. Comprendre la demande

- Reformuler la demande en une ou deux phrases et la faire valider si elle est ambiguë.
- Invoquer le skill **architecture** pour situer la fonctionnalité (quelle couche, quels modules) ; invoquer le skill de domaine concerné (**armes-combat**, **regles-ctf**, **ia-bots**, **rendu-hud**).
- Poser les questions de clarification **avant de coder**, notamment :
  - les valeurs numériques (dégâts, délais, distances, probabilités — elles iront dans `CFG` ou `WEAPONS`) ;
  - les interactions avec l'existant (que se passe-t-il pendant un dash ? si le porteur du drapeau est concerné ? en pause ?) ;
  - les cas limites (chargeur vide, entité morte, les deux drapeaux portés, fin de partie simultanée).

## 2. Implémenter

- Respecter le CLAUDE.md : simulation sans DOM, état dans `state` (+ resets miroirs `resetMatch`/`resetTestMatch`), tunables dans `config.js`/`weapons.js`, dépendances à sens unique, `main.js` sans logique de jeu.
- Suivre la table « où placer du nouveau code » du skill architecture.

## 3. Tester

- Écrire les tests **macro** (skill **testing**) : comportement observable via `update`/fonctions publiques, jamais les détails internes.
- `npm test` — corriger jusqu'au vert. Si une approche échoue après 2 tentatives, reprendre le plan avant de continuer.

## 4. Synchroniser la documentation

Si le périmètre visible change :
- règle/touche/arme visible du joueur → écran d'accueil d'`index.html` (le hook Stop de synchro doc le vérifie) ;
- nouvelle convention ou nouveau module → CLAUDE.md et skill(s) concerné(s) ;
- nouveau domaine de test → table de mapping du skill **testing**.

## 5. Résumer

Terminer par : fichiers modifiés (avec rôle du changement), tests ajoutés/modifiés, résultat de `npm test`, et points restés ouverts le cas échéant.
