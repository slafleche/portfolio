[MockCode|ts] Les systèmes d’interface échouent quand ils optimisent la mauvaise
chose. La plupart optimisent la vitesse de mise en place ou la réutilisabilité
maximale. Moi, j’optimise la **prévisibilité du changement dans le temps**.
[/MockCode]

### Concevoir pour le changement

La valeur du système se cumule à mesure que le projet mûrit. La vélocité au
démarrage compte, mais pas au prix de décisions qui vous enferment. De nouvelles
exigences ne devraient pas déclencher des réécritures. Elles devraient
ressembler à des extensions naturelles de ce qui existe déjà.

### Composition plutôt que rigidité

Encodez les décisions une fois, composez-les partout. Quand une valeur
d’espacement doit changer, vous changez un token, pas cinquante composants. Et
quand un pattern doit diverger, vous le branchez proprement, sans abandonner
l’original.

### Respecter la plateforme

La spécification [abbr:CSS] est le contrat. Les abstractions peuvent faciliter
l’écriture, mais la sortie doit rester du [abbr:CSS] inspectable et débogable,
pour que n’importe quel développeur peut lire et comprendre. Pas de runtime
magique, pas de transformations opaques.

### Les personnes avant les abstractions

Les systèmes servent les équipes, pas l’inverse. Une abstraction « maline » qui
perd votre équipe est un boulet. Les outils sont choisis pour leur utilité au projet, pas pour une pureté architecturale. L’objectif, c’est la maintenabilité,
pas l’outil du moment parce qu’il rend bien en démo. 

### Frontières et contraintes claires

Des frontières explicites rendent le changement prévisible. Vous savez qui
dépend de quoi. Vous savez ce qu’un refactor va affecter. L’ampleur de l’impact de chaque changement est claire et évidente. Les contraintes sont choisies pour le projet et pour ce qu’on veut construire,et non des limites arbitraires héritées d’un framework que quelqu’un a choisi avant de comprendre le problème.
