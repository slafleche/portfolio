## Principes

Partir d'une base solide, puis construire des systèmes qui s'adaptent au
changement plutôt que d'y résister. Ajouter de la complexité seulement quand
elle résout de vrais problèmes, et garder tout composable pour que les parties
puissent évoluer indépendamment.

### Concevoir pour le changement

Le changement à long terme est prioritaire sur la commodité à court terme. Les
systèmes sont conçus pour évoluer de manière incrémentale, afin que de nouvelles
exigences n’imposent ni réécritures complètes ni couches de contournements.

### Composition plutôt que rigidité

Les systèmes sont construits par composition plutôt qu’à partir d’abstractions
rigides. Les décisions sont encodées une seule fois au niveau du système et
réutilisées de manière cohérente, ce qui réduit le retravail et les incohérences
accidentelles au fur et à mesure que le système grandit.

### Respecter la plateforme

Les spécifications de la plateforme restent visibles et autoritaires. Le rendu
final reste inspectable et débogable, ce qui évite les couches opaques qui
compliquent le diagnostic et le changement.

### Les personnes avant les abstractions

La conception de systèmes tient compte des utilisateurs, de la vision produit et
des développeurs qui les maintiendront. Les outils sont choisis de manière
pragmatique en fonction des besoins du projet, et non par idéologie.

### Frontières et contraintes claires

La séparation des responsabilités permet aux différentes parties du système
d’évoluer de manière indépendante. Les contraintes sont appliquées de manière
volontaire pour réduire la complexité accidentelle et garder le système
compréhensible dans le temps.
