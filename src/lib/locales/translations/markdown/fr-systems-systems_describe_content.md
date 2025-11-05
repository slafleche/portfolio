### Système de Mesure

Traiter les mesures CSS comme de véritables objets plutôt que des chaînes de
texte libres.  
Les nombres portent du sens — unités, relations, échelles — et les manipuler
comme des données rend ce sens explicite.

```ts
const offset = m(8, 'px');
const curve = m(24, 'px');

if (process.env.NODE_ENV !== 'production') {
  assertUnit(offset, 'px', 'offset');
  assertUnit(curve, 'px', 'curve');
}

const total = offset.add(curve).multiply(2).css(); // "64px"
```

Chaque composant définit ses propres garde-fous. Certaines valeurs restent
flexibles ; d’autres vérifient les unités quand les calculs exigent de la
rigueur.  
Cet équilibre garde l’intention lisible et les refactorings sûrs.

Des unités claires sont la mémoire du système.  
Elles permettent aux pièces de changer sans casser les proportions.

---

### Color Wrapper

Les couleurs CSS sont flexibles, mais cette flexibilité devient vite fragile.  
Un simple ajustement d’alpha peut traverser les couches ou ruiner le contraste
d’un dégradé.  
Le color wrapper transforme ce chaos en cohérence en traitant les couleurs comme
des données avec des règles.

```ts
const background = color('#453564');
const shadow = background.darken(0.8).desaturate(0.2).alpha(0.5);

style({
  backgroundColor: colorVars.bodyBg.css(),
  boxShadow: `0 4px 12px ${shadow.css()}`,
});
```

Chaque ajustement clone avant d’appliquer, donc les tokens partagés ne mutent
jamais.  
L’émission finale n’a lieu qu’au moment du `.css()`, ce qui garde le rendu
prévisible.  
Les dégradés utilisent les mêmes objets en interne, donc les points héritent
automatiquement des règles de contraste et d’alpha.

Les entrailles du wrapper peuvent changer — bibliothèques, formules, math — mais
le contrat reste.  
Cette stabilité rend la gestion des couleurs composable, testable et sûre à
faire évoluer.

