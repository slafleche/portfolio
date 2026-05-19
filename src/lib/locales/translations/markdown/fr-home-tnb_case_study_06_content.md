Le produit affilié de l’agence est Whereabouts, une plateforme SaaS de
widgets pour le tourisme. Les sites clients intègrent des widgets
Whereabouts, chacun avec ses propres props, endpoints GraphQL, et
thématisation CSS via `::part()` et les variables `--wa-*`. J’ai construit
une couche d’intégration consciente de l’IA : un skill Claude encodant les
patterns d’intégration des widgets, un cache local de la documentation
produit, et un skill de synchronisation qui rafraîchit le cache sans tout
recharger à chaque session. Quand je trouvais des bugs dans la surface des
widgets pendant le travail d’intégration, je créais des issues à l’équipe
Whereabouts pour améliorer le produit.
