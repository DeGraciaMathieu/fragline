# PRD 01 — Extraction du CSS et passage du script en module ES

## Objectif

Sortir le CSS et le JavaScript du fichier `index.html` pour obtenir une structure de fichiers standard, sans aucun changement de logique ni de comportement.

## Contexte

Tout le jeu (CSS ~27 lignes, HTML ~15 lignes, JS ~630 lignes) vit dans `index.html`. Cette étape est le prérequis de toutes les suivantes : elle met en place la structure de fichiers et le chargement en module ES.

## Périmètre

1. Créer `css/style.css` et y déplacer l'intégralité du contenu de la balise `<style>`.
2. Créer `js/main.js` et y déplacer l'intégralité du contenu de la balise `<script>`.
3. Dans `index.html` :
   - remplacer `<style>…</style>` par `<link rel="stylesheet" href="css/style.css">` ;
   - remplacer `<script>…</script>` par `<script type="module" src="js/main.js"></script>`.

## Hors périmètre

- Aucun découpage du JavaScript en plusieurs fichiers (étapes 02 et 04).
- Aucune modification de la logique, des noms ou de la structure du code JS.
- Aucun outillage de build (bundler, minification).

## Contraintes techniques

- Le passage en `type="module"` impose de servir les fichiers via HTTP (le protocole `file://` bloque les modules). Utiliser un serveur local : `php -S localhost:8000` ou `npx serve`.
- Les modules ES sont en mode strict par défaut : vérifier qu'aucune assignation implicite de globale ne casse (le code actuel déclare tout avec `const`/`let`, ça devrait passer sans modification).
- Les gestionnaires d'événements sont attachés via `addEventListener` (pas d'attributs `onclick` inline) : aucun impact du scope module.

## Critères d'acceptation

- [ ] `index.html` ne contient plus ni `<style>` ni code JS inline.
- [ ] Le jeu servi en HTTP local est identique au comportement d'origine : écran d'accueil, clic pour jouer, déplacement, tir, changement d'arme, CTF, fin de partie et rejouer.
- [ ] Aucune erreur dans la console navigateur.

## Structure cible

```
fragline/
  index.html
  css/style.css
  js/main.js
```
