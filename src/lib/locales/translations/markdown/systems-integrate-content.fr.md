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

**Définition réutilisable de la famille (partagée entre tokens et CSS) :**

````ts
import { m } from '../styles/measurementKit';
import fontsConfig, { makeFamilyDef } from '../styles/helpers/fontConfig';

const urbanist = makeFamilyDef({
  familyName: 'Urbanist',
  fallbacks: ['Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
  cfgMap: fontsConfig,
  spacing: m(0, 'rem'),
  offsetToFlushTop: m(0, 'rem'),
  lineHeight: 1.2,
  weights: {
    default: 400,
    strong: 700,
  },
});
````

**Référence unique à la famille dans vos tokens (sans duplication) :**

````ts
import { fontFamilies } from '../tokens/fontFamilies.tokens';
import { m, mPercent } from '../styles/measurementKit';

export const fontVariants = {
  hero: {
    family: fontFamilies.urbanist,
    config: {
      overrides: {
        size: m(45),
        lineHeight: 1.1,
      },
      options: {
        weightPercents: {
          default: mPercent(20),
        },
      },
    },
  },
} as const;
````

**Composition finale via les helpers :**

````ts
import { composeFontVariantStyles } from '../tokens/fontVariants.tokens';

const heroHeading = composeFontVariantStyles(fontVariants.hero);
````

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
