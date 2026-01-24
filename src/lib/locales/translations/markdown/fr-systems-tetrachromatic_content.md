[MockCode|ts] La plupart des équipes choisissent des frameworks pour aller vite
au départ. Quand ces frameworks ne correspondent pas aux besoins réels du
projet, la dette technique s’accumule et les contournements deviennent de plus
en plus laids à mesure que le projet mûrit.

L’approche tétrachromatique résout ce problème en vous permettant de découvrir
l’architecture de votre projet progressivement. Comme les
<dfn title="Personnes ayant quatre types de récepteurs dans leurs yeux qui leur permettent de percevoir des couleurs invisibles à la plupart des humains">tétrachromates</dfn>,
le système révèle des patterns et des contraintes que la plupart des systèmes
masquent, ou bien vous poussent dans une direction qui ne correspond pas à votre
projet.

Commencez par une bonne structure. Typez vos variables [abbr:CSS], et laisser la
sortie finale des styles permettre toute la spécification [abbr:CSS] (pas un
sous-ensemble). Avec [CSS Calipers](#css-calipers), vous pouvez typer et
vérifier toutes vos variables [abbr:CSS], en [abbr:TS] ou même écrire votre
propre validation sur mesure en [abbr:JS].

Les globals sont utiles, mais utilisez-les toujours comme des valeurs par défaut
surchargeables pour les composants. À mesure que la complexité émerge, vous
pouvez définir des tokens plus complexes ou des pipelines pour amener vos
variables jusqu’au style. Les composants portent leurs responsabilités. Les
frontières restent explicites. Les dépendances restent traçables.

Voici à quoi ça ressemble en pratique. Les styles complexes sont produits via
des helpers mais ils sont optionels. Utiliser `borders()`, `paddings()`, ou
`margins()` vous permet d’ajouter de la complexité à vos styles en n’éditant que
vos tokens :

```ts
// Dans un fichier *.tokens.ts
const simpleConf = {
  borders: {
    color: color(’#fff’),
  },
};

const complexConf = {
  borders: {
    top: {
      ...externalDesignTokens.borders,
      color: externalDesignTokens.borders.color.alpha(0.3),
    },
    horitonzal: externalDesignTokens.borders,
    bottom: externalDesignTokens.borders,
    radius: {
      north: m(0),
      south: externalDesignTokens.borders.radius,
    },
  },
};

// Vanilla-Extract est utilisé dans mon exemple, mais [abbr:CSS] Calipers est agnostique de toute plateforme [abbr:CSS]-in-[abbr:JS].


// Exemple A : utiliser les valeurs par défaut directement
export const useDefaults = style(borders()); // utilise la largeur, le style et la couleur par défaut

// Exemple B : définir une surcharge dans votre stylesheet
export const hardCoded = style({
  ...borders({
    width: m(20),
  }), // utilisera la couleur et le style par défaut
});

// Exemple C : récupérer les tokens depuis un objet externe
export const fromVarsSimple = style({
  ...borders(simpleConf.borders),
}); // utilisera la largeur et le style par défaut depuis la config globale

// Exemple D : récupérer des tokens complexes depuis un objet externe
export const fromVarsComplex = style({
  ...borders(complexConf.borders),
});

// ⚠️ Note importante : il n’y a aucune différence entre C et D. Vous pouvez simplement changer vos tokens et tout fonctionne, sans modifier le CSS.
// Dans CSS Calipers, le pluriel sert à distinguer la valeur CSS du helper : « borders » est le helper pour « border », « margins » pour « margin », etc.
```

Résultat : un système où les changements ont un impact local et prévisible. Vous
pouvez diverger sans risque et refactorer en confiance. Les changements sont
clairement cadrés, et vous savez toujours qui dépend de quoi.

Ci-dessous, je détaille les outils et patterns qui rendent ça possible.
[/MockCode]
