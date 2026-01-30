## Itération rapide, risque réduit

Le site est construit avec des outils modernes qui me permettent de livrer vite,
tout en détectant les problèmes avant qu’ils n’atteignent les utilisateurs. Les
tests visuels automatisés aident à valider les mises à jour UI avec confiance,
sans dépendre de longues cycles de QA manuelle.

Je garde aussi les styles "typés" (au lieu d’un CSS basé sur des chaînes), grâce
à CSS Calipers publié sur <span data-white-space="no-wrap">[element:NPMWordmark|fr].</span>
Ça permet d’attraper des valeurs invalides et des erreurs d’unités tôt, tout en
produisant du CSS standard et facile à déboguer.

## Maintenable par design

La base de code suit des patterns cohérents, renforcés par des vérifications
automatiques, pour que les changements restent prévisibles et faciles à
reviewer. Les nouvelles fonctionnalités n’abîment pas l’existant, et la dette
technique est détectée tôt plutôt que de s’accumuler.

Exemples de garde-fous intégrés au repo :

- règles de dépendances (frontières claires, changements bien cadrés)
- règles de styles sur mesure (cohérence UI, moins de "drift" CSS)
- validation du contenu i18n (clés manquantes, règles de format)
- détection de secrets et vérification de config runtime

Des tests unitaires et d’intégration (Vitest + Testing Library) couvrent la
logique et les comportements UI importants, pour livrer des refactors en
confiance.

## Livraison fiable

Les assets, le contenu, et la localisation sont générés via des scripts
reproductibles. Moins d’étapes manuelles veut dire moins d’erreurs et des
livraisons plus rapides. Les favicons et les mises à jour de contenu CDN se
mettent à jour automatiquement, avec une traçabilité claire.

## IA pour gagner du levier

J’utilise l’IA pour accélérer le travail répétitif (documentation, scaffolding
de tests, vérifications de cohérence) tout en gardant les standards de qualité
humains. Les résultats sont validés comme du code écrit à la main : types,
tests, et revues automatisées.
