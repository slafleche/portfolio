### Entrées typées aux frontières
Les valeurs de style entrent dans le système sous forme de primitives typées plutôt que de simples chaînes. Cela établit un contrat clair au moment de l’écriture et rend les valeurs invalides ou incohérentes plus difficiles à exprimer par accident.

### Un début et une fin clairs
Le système est défini par ses frontières. La structure et les contraintes existent au moment de l’écriture, tandis que le résultat final est du [abbr:CSS] simple et conforme aux spécifications. Le [abbr:CSS] reste la source de vérité, pas un dialecte abstrait.

### Signification appliquée via des helpers métier
Les helpers métier appliquent une signification sémantique aux valeurs sans redéfinir la plateforme. Ils relient l’intention aux vraies propriétés [abbr:CSS], tout en gardant le rendu sous-jacent lisible et familier.

### Composition flexible au milieu
La couche intermédiaire est volontairement peu prescriptive. Elle fait un minimum d’hypothèses sur la manière dont les styles sont composés, ce qui permet aux équipes d’adapter le système aux besoins du projet plutôt que d’imposer un mode d’utilisation fixe.

### Conçu pour être inspecté et remplacé
Le système résultant est fait pour être inspecté, débogué et modifié. Les parties peuvent être remplacées ou retirées avec le temps sans déstabiliser l’ensemble, et aucun framework ou modèle d’écriture unique n’est requis.
