Je voulais que les valeurs CSS numériques aient les mêmes garanties que le reste
de mon code, alors j’ai créé CSS-Calipers.

### Le problème

Les valeurs CSS sont du code, mais nous les traitons comme des chaînes de
caractères. Vous concaténez des unités, extrayez des nombres de chaînes, et
découvrez des incompatibilités d’unités quand les mises en page cassent en
production au lieu de les détecter à la compilation.

### Les mesures comme données structurées

CSS-Calipers traite les mesures comme des données typées avec une structure
claire : un nombre et une unité qui restent ensemble jusqu’à ce que vous ayez
explicitement besoin d’une chaîne CSS. Vous faites des calculs avec des helpers
comme `add()`, `multiply()`, `subtract()`, et `clamp()`. Détectez les opérations
incompatibles à la compilation, puis appelez `.css()` à la frontière. Idéalement
au moment du build pour la meilleure performance, mais le runtime est supporté.
C’est agnostique de votre configuration CSS-in-JS.

### [abbr:CSS] typé

Vous pouvez garder davantage (ou la totalité) de votre surface de styling typée.
Les helpers qui normalement acceptent des chaînes CSS brutes peuvent prendre des
entrées TypeScript typées de CSS‑Calipers, donc les valeurs de style "chaînées"
deviennent des entrées réelles et validées.

### Périmètre clair et coexistence

La bibliothèque reste ciblée et prescriptive sur ce qu’elle gère. Elle se
concentre sur les valeurs numériques avec unités et laisse les mots-clés, les
expressions `calc()`, et les variables CSS à votre couche de styling. Elle
n’essaie pas d’être votre solution CSS complète. Elle coexiste avec les systèmes
de styling existants en gérant une chose bien : rendre les calculs de mesure
prévisibles et type-safe.

Découvrez-le sur [element:NPMWordmark|fr] ou
<span data-white-space="no-wrap">[element:GitHubWordmark|csscalipers-fr] !</span>
