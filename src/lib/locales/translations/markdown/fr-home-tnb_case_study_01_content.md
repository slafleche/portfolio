J’ai refactorisé des sources de vérité éparpillées dans un seul
`tokens.json`. Une étape de build distribue ces tokens vers la
configuration Tailwind, `variables.css` et `tokens-responsive.css`, tous
générés depuis ce fichier unique. Un script de synchronisation distinct lit
les variables Figma du designer et les propage dans les tokens. Chaque
changement de token se propage d’un seul fichier vers tous les endroits où
il est utilisé.

J’ai aligné les projets clients existants de l’agence vers ce pipeline de
manière incrémentale. Chaque fichier que je touchais était migré vers le
nouveau système, tout en livrant le travail que j’étais là pour livrer.
