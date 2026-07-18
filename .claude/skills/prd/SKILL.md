---
name: prd
description: Use when the user asks for a specification or PRD for a future feature — produces a spec document in docs/, implements nothing.
user_invocable: true
---

# Workflow : rédiger un PRD

Produire un **document de spécification** dans `docs/`. **N'implémenter aucun code** — pas même « en passant ».

## 1. Explorer l'existant technique

Lire le code réellement concerné (s'appuyer sur le skill **architecture** et les skills de domaine) pour remplir la section « Existant technique » avec des faits vérifiés : modules impactés, fonctions et champs `state`/`CFG`/`WEAPONS` existants, contraintes d'architecture (simulation sans DOM, resets miroirs, etc.). Ne rien affirmer qui n'ait été lu dans le code.

## 2. Poser uniquement les décisions produit

Via questions cliquables (AskUserQuestion) : valeurs de gameplay, comportements aux cas limites, interactions avec les règles existantes, priorités. Ne pas demander ce que le code tranche déjà. Ce qui reste sans réponse va en « Risques & questions ouvertes ».

## 3. Rédiger le PRD

Fichier : `docs/PRD-XX-slug.md` — numérotation continue (les PRD 01–05 existent), slug en kebab-case français. Format fixe :

```markdown
# PRD XX — <Titre>

## Objectif
<le pourquoi, en 2-3 phrases>

## Existant technique
<état actuel du code : modules, fonctions, données — factuel, vérifié>

## Comportement
<spécification fonctionnelle : règles, valeurs, cas limites décidés>

## Hors périmètre
<ce que ce PRD ne couvre explicitement pas>

## Impacts par couche
<table : couche/module → changement attendu (config, state, simulation, rendu, input, tests, doc)>

## Critères d'acceptation
<cases à cocher vérifiables, y compris « npm test vert » et la synchro de l'écran d'accueil si règle visible>

## Tests
<les tests macro à écrire : scénario → comportement observable attendu>

## Risques & questions ouvertes
<décisions non tranchées, effets de bord possibles>
```

## 4. Conclure

Annoncer le chemin du PRD créé et rappeler qu'aucun code n'a été modifié. L'implémentation se fait ensuite via le skill **feature** en pointant ce PRD.
