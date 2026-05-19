J’ai contribué à construire un thème de compatibilité qui faisait le pont
entre le Forum legacy (PHP) et la nouvelle Knowledge Base (React). Les mêmes
design tokens alimentaient les deux produits : React les consommait
directement via du CSS-in-JS ; PHP les recevait à travers une couche CSS de
compatibilité. Le thème fermait aussi la porte à l’injection libre de HTML /
CSS / JS dans laquelle les clients se nuisaient à eux-mêmes. On a échangé
cette flexibilité contre la stabilité des thèmes, volontairement.

### Deux produits, un seul thème

- [Communauté Acer (Forum)](https://community.acer.com/fr/)
- [Réponses Acer (Knowledge Base)](https://community.acer.com/en/kb/)
