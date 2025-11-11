Ce portfolio repose sur une règle : la structure d’abord, le style ensuite.
Chaque morceau d’interface traverse un pipeline strict — tokens → helpers →
modules → styles vanilla-extract. Chaque couche a une responsabilité unique et
passe sa propre vérification de types.

Les tokens ne contiennent que des données brutes : mesures, couleurs, durées.
Les helpers transforment ces valeurs en logique — calculs, géométrie,
relations — avec une sécurité d’unités à la compilation grâce à MeasurementKit
(bientôt migré vers [abbr:CSS] Calipers). Les modules composent les comportements et la
couche styles est la seule autorisée à émettre des sélecteurs, imposée par des
règles [abbr:ESLint] personnalisées et des garde-fous lint-staged.

Cette séparation rend le système prévisible et auditable. Toute variation
visuelle se rattache à une source numérique ou logique, et les outils peuvent
refactorer en toute sécurité parce que les frontières sont définies dans le
code, pas laissées aux conventions. C’est le même principe que pour les design
systems qui passent à l’échelle : d’abord la structure déterministe, ensuite
l’expression.
