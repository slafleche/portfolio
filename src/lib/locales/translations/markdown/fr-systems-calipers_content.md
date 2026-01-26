[MockCode|ts]

J’en avais assez de gérer des valeurs CSS en chaînes. Concaténer des unités,
perdre le typage dès qu’un nombre devient `"12px"`, et déboguer des erreurs
d’unités à l’exécution.

J’ai donc créé CSS-Calipers.

```ts
// La friction :
const spacingPx = 4;
const gutter = `${spacingPx * 3}px`; // string immédiatement
const heroHeight = `40vh`;
const combo = gutter + heroHeight; // "12px40vh" (JS valide, CSS cassé)

// Avec CSS-Calipers : des valeurs typées jusqu’au dernier moment
import { m } from ’css-calipers’;

const spacing = m(4); // px par défaut
const gutter = spacing.multiply(3); // 12px, toujours typé
const heroHeight = m(40, ’vh’);
// gutter.add(heroHeight);  ❌
// Erreur de type : impossible de mélanger px et vh.
// Tu trouves l’erreur pendant le développement,
// pas comme une erreur de chaîne silencieuse.

// N’émettre du CSS qu’à la frontière
const styles = { gap: gutter.css() }; // "12px"
```

### Ce qui reste des chaînes

Les mots-clés (`auto`, `inherit`), les variables CSS `var(--spacing)`, et les
expressions `calc(...)` restent de simples chaînes. Ça garde la sortie
inspectable et agnostique du framework. Pas de runtime magique, pas de DSL
opaque.

### For more details

Découvrez-le sur [element:NPMWordmark] ou
<span data-white-space="no-wrap">[element:GitHubWordmark|csscalipers-en]!</span>
[/MockCode]
