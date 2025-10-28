# Le Navire de Thésée : Le meilleur système

> Chaque pièce peut être remplacée avec le temps sans briser l’ensemble.  
> Cette page montre comment cette idée façonne la construction des systèmes,  
> où la structure, le processus et l’intention demeurent cohérents même lorsque
> les pièces évoluent.

## Processus

Chaque système que je conçois suit la même boucle : **analyser, tester,
codifier, prouver.**

- **Analyser →** étudier comment les éléments s’imbriquent et ce qui doit rester
  stable.
- **Tester →** essayer les cas limites, voir où ça casse, affiner la règle.
- **Codifier →** transformer la règle raffinée en code pour que l’intention ne
  dérive pas plus tard.
- **Prouver →** l’appliquer jusqu’à ce qu’elle tienne d’elle-même.

Cette boucle s’applique aussi bien à une seule valeur CSS qu’à un flux de
travail complet.  
Elle sécurise le changement et permet à l’identité de survivre au remplacement.

---

## Décrire

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

---

## Exprimer

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

## Intégrer

### Polices

La configuration des polices part d’un seul fichier partagé entre le CSS et les
requêtes Google Fonts.  
Les graisses sont définies comme des plages ou des listes, rendant l’intention
claire dès le départ.

**Config (source unique de vérité) :**

```
# src/data/fonts.config.json
{
  "Comfortaa": { "weights": ["300..700"], "ital": true },
  "Titan One": { "weights": ["400", "700"] }
}
```

**Utilisation dans le CSS (partagée avec l’outil de build) :**

```
const titan = makeFamilyDef({
  familyName: 'Titan One',
  fallbacks: ['Poppins', 'Helvetica', 'sans-serif'],
  cfgMap: fontsConfig,                 // config validée
  spacing: m(0.25, 'rem'),
  offsetToFlushTop: m(-0.1, 'rem'),
});

style({
  fontFamily: titan.family,
  fontWeight: titan.weights.low,       // extrait de "400..700"
  letterSpacing: titan.spacing.css(),
});
```

La même configuration alimente un générateur d’URL qui ne demande que les plages
et styles réellement utilisés.  
Cela garde la typographie cohérente entre CSS et requêtes réseau tout en
allégeant la charge utile.

---

### Localisation

Chaque section ne charge que le texte dont elle a besoin.  
Les bundles correspondent directement aux sections UI, donc le chargement reste
léger et la responsabilité claire.  
Un seul traducteur est créé par locale, et les builders s’en servent pour
composer des objets de texte simples — pas de couche i18n, pas d’appels `t()`
dans le rendu.

```
const t = await loadTranslator(locale);
const heroCopy = buildHeroCopy(t);
const contactCopy = buildContactCopy(t);

<Hero copy={heroCopy} />
<Footer contact={contactCopy} />
```

Les clés manquantes ou incohérentes apparaissent immédiatement en
**développement**, pas en production.  
Cela garde la logique de traduction proche du contenu, rend les composants
prévisibles et faciles à tester, et évite les mauvaises surprises en ligne.  
Aucune traduction au moment du rendu : moins de surcharge et une hydratation
plus rapide.  
Même modèle que le reste du système : contrats clairs, portée locale, résultats
prévisibles.

---

### Pipeline des Médias

Les médias ne sont pas stockés dans le dépôt.  
De petits fichiers JSON pointent vers les originaux distants, et des scripts
gèrent le téléchargement, l’optimisation et la génération de manifestes prêts à
l’emploi.

```
# src/assets/videos/videoSources.json
{
  "hero": { "src": "https://dropbox.com/…?dl=1", "speed": 2 }
}
```

```
# src/data/generated/videos.manifest.gen.json
{
  "hero": {
    "width": 3840,
    "height": 2160,
    "masterUrl": "/videos/hero/master.m3u8",
    "posterUrl": "/videos/hero/poster.png"
  }
}
```

```
<VideoByName name="hero" kind="hero" autoPlay loop muted playsInline />
```

Ce processus garde les fichiers lourds hors du contrôle de version et produit
des sorties déterministes prêtes à être consommées par les composants.  
Les SVG suivent le même principe : nettoyés avec SVGO et formatés avec Prettier
pour des IDs sûrs et des diffs cohérents.

---

## Résilience

### Intégrité & Continuité

Je considère qu’un système est bien conçu si chaque pièce peut être remplacée
facilement. Nouvelles vérifications, nouvelles bibliothèques, nouvelles idées —
rien ne devrait casser le reste.

C’est ce qui fait fonctionner cet ensemble : chaque couche connaît ses limites.
Fonctions, wrappers et composants reposent sur des contrats clairs plutôt que
sur les détails internes, donc le changement reste local. En pratique, on ne
refactorise pas toujours quand il faudrait — le travail s’accumule, les
priorités changent — mais une bonne structure empêche cette dette de se
propager.

C’est une forme tranquille de **Navire de Thésée** : les pièces évoluent, mais
l’identité demeure. Le langage visuel reste cohérent parce que la structure rend
le changement sûr par conception. Une architecture propre n’est pas réservée aux
données et aux API — les styles peuvent être tout aussi disciplinés, prévisibles
et maintenables quand on leur accorde le même respect.
