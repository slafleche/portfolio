Les systèmes d’interface doivent permettre de changer de direction sans tout
reconstruire.

Je me concentre sur l’infrastructure front-end : des API de composants, un
système de thèmes et des design tokens. L’objectif est de garder les maquettes
et le code alignés, et de limiter la dette technique qui s’accumule quand on
privilégie la vitesse au départ plutôt que l’adéquation au produit.

Je commence par des contraintes légères pour établir une base claire. Quand le
travail montre qu’il faut plus de structure, je l’ajoute progressivement. Je
construis des primitives modulaires, avec des défauts accessibles et adaptés au
responsive. À mesure que la complexité augmente, l’interface reste fidèle aux
intentions de conception.
