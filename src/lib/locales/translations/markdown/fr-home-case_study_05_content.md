J'ai participé à la mise en place d'une architecture de thème qui traduisait le
style de chaque client en un ensemble de **design tokens** : des valeurs
partagées interprétées selon les besoins de chaque produit. Un ensemble concis
de paramètres globaux gardait tout cohérent, tandis que les composants pouvaient
s'adapter finement à ces tokens. Ce **découplage par tokens** a permis aux
produits d'évoluer en toute sécurité : les équipes pouvaient mettre à jour les
composants sans casser les thèmes clients. Même lorsque des composants étaient
entièrement remplacés, le langage visuel restait intact, preuve de la résilience
du système.
