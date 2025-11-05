### Dégradés

CSS rend les dégradés faciles à écrire mais difficiles à fiabiliser.  
De légères variations de teinte ou de luminosité peuvent créer des bandes
visibles.  
J’ai construit un petit système pour les stabiliser : variables structurées,
points prévisibles et un bruit léger pour casser les transitions parfaites.

```ts
const gradient = makeLinearGradient({
  from: colorVars.spotA,
  to: colorVars.spotB,
  angle: m(45, 'deg'),
  mode: 'oklch',
});
```

Chaque dégradé repose sur le même cadre : angles, espacements et calculs de
couleur cohérents, pour un rendu stable sans ajustement manuel.  
Le système est flexible par conception : on peut échanger les tokens, ajuster
les paramètres ou remplacer le générateur, le résultat reste cohérent.

Transitions douces, contraste sûr, pas de surprise.  
Les mathématiques peuvent évoluer, mais le rendu garde sa cohésion.

---

### Forme

L’arche a commencé comme une expérience, quelque chose que CSS seul n’exprimait
pas proprement.  
C’est devenu un test pour voir jusqu’où un système peut s’étendre tout en
restant précis.

```ts
const path = makeArchPath({
  width: m(320, 'px'),
  height: m(140, 'px'),
  curveHeight: m(60, 'px'),
});
```

La forme est basée sur du SVG mais calculée à partir de variables partagées.  
Changer quelques nombres redessine la courbe sans briser proportion ni
alignement.  
Elle reste flexible dans des limites claires : une structure qui invite à la
variation au lieu de la bloquer.

Chaque nouveau tracé est une pièce neuve bâtie sur la même intention.  
Cet équilibre entre liberté et contrainte garde la forme vivante sans perdre son
identité.

---

### Mouvement

Le bouton de contact est la pièce de mouvement la plus complexe du site.  
Il semble simple, mais repose sur une douzaine de couches travaillant ensemble
pour lui donner vie.

```ts
const buttonMotion = makeContactMotion({
  pressDepth: m(2, 'px'),
  overshoot: m(1.2, ''),
  timing: easeOutBack,
});
```

Chaque couche contrôle une petite partie de l’effet, isolée pour pouvoir évoluer
sans casser le reste.  
Le système applique des principes classiques d’animation — anticipation, suivi —
mais en code plutôt qu’en keyframes.

Les pièces peuvent changer, le rythme reste.  
C’est ce qui donne sa cohérence au système de mouvement.
