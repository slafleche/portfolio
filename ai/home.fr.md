# home.fr — copy snapshot

> Initial FR snapshot, 2026-05-18. Mirrors the current state of the FR site
> exactly. Where EN has new sections that haven't been translated yet (e.g.
> `Code Quality Guardrails`, `case_studies_outro`), they appear here as
> placeholders with **no invented translation**.
>
> **Audience:** HR person in Québec. Translations must use Québécois French
> phrasing, not France-formal French, while staying professional. Same rule
> applies to any new copy added below.

## title (meta)

Développeur full-stack · Systèmes de design intégrés de A à Z pour les équipes à l’ère de l’IA | Stéphane LaFlèche

## description (meta)

Je suis développeur full-stack basé à Montréal, spécialisé dans la création
de systèmes de design évolutifs et intégrés de A à Z pour les équipes à
l’ère de l’IA.

## hero-title

Développeur full-stack [split] Systèmes de design pour les équipes à l’ère de l’IA

## hero-subtitle

Je suis développeur full-stack basé à Montréal. [split] Je crée des systèmes
de design évolutifs et intégrés de A à Z pour les équipes à l’ère de l’IA.

## summary (title now: "Quelques mots sur moi")

Je suis développeur full-stack avec un parcours atypique. J’ai d’abord étudié
et travaillé dans l’industrie de l’animation. Je collabore très bien avec les
designers sur des systèmes de design.

Aligner une équipe sur un système de design était déjà difficile. Maintenant
que tout le monde a un assistant IA dans son workflow, c’est encore plus
difficile. Je livre des systèmes de design intégrés de A à Z : tokens,
composants et API de composants, patrons d’accessibilité conformes WCAG,
framework CSS (sur mesure, basé sur une bibliothèque, ou les deux). J’écris
aussi les règles de lint sur mesure, les hooks pre-commit, les tests
automatisés et les règles et skills d’agent qui gardent la vision intacte à
travers tout le pipeline.

## approach

Les systèmes d’interface doivent permettre de changer de direction sans tout
reconstruire.

Je me spécialise en infrastructure d’interface : des API de composants, un
système de thèmes et des design tokens. L’objectif est de garder les maquettes
et le code alignés, et de limiter la dette technique qui s’accumule quand on
privilégie la vitesse au départ plutôt que l’adéquation au produit.

Je commence par des contraintes légères pour établir une base claire. Quand
le travail montre qu’il faut plus de structure, je l’ajoute progressivement.
Je construis des primitives composables, avec des défauts accessibles et
responsive. À mesure que la complexité augmente, l’interface reste fidèle
aux intentions de conception.

Quel que soit le projet, je travaille de A à Z avec les équipes design,
produit et ingénierie. J’explique les compromis en langage simple et je fais
de l’accessibilité un standard, pas un ajout. Je regarde au-delà de la
fonctionnalité immédiate : l’objectif d’affaires qu’elle sert et les processus
internes qui l’entourent. Je raffine autant la façon dont on livre que ce
qu’on livre. Bien fait, le système respecte l’intention de conception sans
ralentir l’équipe.

---

## Garde-fous de qualité du code

### guardrails-intro

Utiliser des assistants IA sans garde-fous est rapide mais fragile. Mon
approche est un système : conventions, workflows, règles de lint sur mesure,
vérifications au commit, tests, CI, le tout versionné, chargé au début de
chaque session, identique pour moi et pour quiconque rejoint le projet.
C’est ainsi que j’ai livré trois sites web en production en trois mois chez
The New Business, tout en gérant plusieurs sites clients actifs en parallèle.
Les cartes ci-dessous détaillent le système.

Le système n’est pas arrivé d’un seul coup. Mettre trop de garde-fous trop
vite nuit à la productivité. Ma méthode : commencer léger, tester ce qui
fonctionne, converger progressivement vers le bon ensemble de règles à mesure
que le projet évolue.

### guardrails-01-title: Façonner l’IA (carte hero 2x2)

Les assistants IA, par défaut, démarrent chaque session sans aucune mémoire
de vous ni de votre projet. Je leur donne les deux. Les règles portent les
conventions ; les skills portent les workflows sur mesure ; certains skills
sont même liés à des fonctions CLI pour que l’assistant puisse exécuter ses
propres diagnostics quand quelque chose tourne mal. Certaines parties vivent
au niveau système et m’accompagnent dans n’importe quel projet ; d’autres
vivent dans le dépôt et accompagnent quiconque rejoint le projet.

> Cartes 02–05 et `guardrails-outro` à traduire à la suite.

---

## case_study (title): Mon parcours chez [wordmark:Vanilla]

### case-study-00-intro

Chez Vanilla Forums, j’étais **développeur front-end senior en [abbr:R&D]**.
J’ai contribué à un système de thématisation basé sur des design tokens. Le
système en séparant le design de l’implémentation. Il permettait aux équipes
de livrer des changements et de refactoriser sans casser les thèmes clients,
sur environ **1 300+** déploiements actifs de Vanilla.

J’ai joué un rôle clé dans la définition des conventions de styles et de
composants pour le nouveau produit **Knowledge Base** (_React_). Ce travail a
façonné le modèle de thématisation partagé. La couche de tokens maintenait la
compatibilité avec le **Forum** (_PHP_). Les clients pouvaient conserver une
identité de marque unifiée sur les deux produits.

### Quelques exemples en production :

[ExampleSites|fr]

### case-study-01-title: Débuter comme intégrateur de thèmes

### case-study-01-subtitle: Découvrir les contraintes du système

Chez Vanilla Forums, je suis passé de thématiseur à **développeur front-end
senior** au sein de l’équipe [abbr:R&D]. J’ai participé à la mise en place
d’une infrastructure à base de tokens, séparant clairement le design de
l’implémentation. Permettant aux équipes de refondre les produits sans
compromettre les thèmes de nos clients.

### case-study-02-title: Construire des outils internes

### case-study-02-subtitle: Éliminer les tâches de stylage répétitives

J’ai créé des utilitaires et des snippets réutilisables pour réduire les
duplications de style et améliorer la cohérence. Cela a rendu le travail de
thématisation plus rapide et plus propre au quotidien, avec une boîte à
outils de styles fiable et réutilisable d’un client à l’autre. J’ai aussi
contribué à faire évoluer nos thèmes vers une approche plus pilotée par la
configuration. Plus d’options exposées via des pages de dashboard, et moins
de styles codés en dur. La personnalisation client est ainsi devenue plus
simple à maintenir et à faire évoluer.

### case-study-03-title: Passer en [abbr:R&D]

### case-study-03-subtitle: Contribuer au produit et à son architecture

Je suis passé de la thématisation à l’équipe [abbr:R&D] comme **Intégrateur
d’applications web**. J’ai contribué aux fonctionnalités du **produit
principal**, j’ai commencé à penser davantage aux développeurs qui allaient
travailler avec mon code. Ceci a recentré mon travail sur la clarté, la
maintenabilité et l’expérience développeur en plus de l’utilisateur.

J’ai reconstruit de zéro le site **vanillaforums.com** lors de sa refonte
*(Capture archivée sur Internet Archive, août 2020. À noter que ce n’est plus
le site actuel)* :
[vanillaforums.com](https://web.archive.org/web/20200813114833/https://www.vanillaforums.com/fr/)

J’ai aussi participé à l’intégration d’une application Vanilla Forums pour
Hootsuite *(Capture archivée sur Internet Archive, janvier 2023. À noter que
l’intégration n’existe plus)* :
[Vanilla Forums Hootsuite Integration](https://web.archive.org/web/20230120175544/https://apps.hootsuite.com/apps/vanilla-forums)

### case-study-04-title: Concevoir une architecture de tokens

### case-study-04-subtitle: Unifier les thèmes entre les produits

J’ai développé une **architecture de thématisation basée sur des tokens** qui
traduisait les styles clients en valeurs partagées. Des paramètres globaux
garantissaient la cohérence tandis que les composants s’adaptaient finement.
Ce découplage permettait aux produits d’évoluer en toute sécurité : les
équipes pouvaient mettre à jour ou remplacer des composants sans briser les
thèmes. Le langage visuel survivait aux changements, preuve de la résilience
du système.

### case-study-05-title: Adapter le code legacy

### case-study-05-subtitle: Connecter les forums à la thématisation moderne

J’ai fait partie de l’équipe initiale derrière la **Knowledge Base**, le
produit de prochaine génération de Vanilla. J’ai joué un rôle clé dans la
conception du système de thématisation qui alimente l’expérience, ainsi que
dans l’architecture front-end de base.

Pour un aperçu du système de thématisation, voir (documentation Vanilla, en
anglais seulement) :
[Customize your Default Title Bar](https://success.vanillaforums.com/kb/articles/397-customize-your-default-title-bar)

Ce nouveau système de thématisation fonctionne avec **à la fois** l’ancien
produit Forums (_PHP_) et le produit Knowledge Base (_React_). On peut le
voir dans l’exemple suivant, où les deux produits cohabitent et partagent un
thème unifié.

### Deux produits, un seul thème :

- [Communauté Acer (Forum)](https://community.acer.com/fr/)
- [Réponses Acer (Knowledge Base)](https://community.acer.com/en/kb/)

### case-study-06-title: Leçons retenues

### case-study-06-subtitle: Des systèmes au service des designers, développeurs et usagers

Construire des systèmes évolutifs, c’est aligner trois cibles: la vision,
l’utilisateur final, et l’équipe interne qui fait vivre le code.

Cette troisième audience est souvent oubliée. Pourtant, c’est elle qui
détermine si la vision tient dans la durée.

Quand une base de code est pénible à faire évoluer, l’effort devient coûteux.
Les développeurs prennent des raccourcis, repoussent les refactorings,
négligent les finitions. Les incohérences s’accumulent.

À l’inverse, quand le code est lisible, prévisible et facile à modifier,
l’équipe investit. Elle refactorise, ajoute des tests, corrige les cas
limites. Une bonne infrastructure rend la bonne approche plus simple que la
mauvaise.

## case_studies_outro (title): The case for craft

> **[needs translation]** — This section exists in `home.en.md`. No FR
> translation yet. Do not invent; translate during a dedicated pass.

## projects (title): Projets

### projects-01-cocacola-title: [wordmark:Coca-Cola]

Contribution au front-end et au back-end du site de campagne "La Brigade du
Bonheur" par Coca-Cola, dans le cadre d’une initiative promotionnelle liée à
leur page Facebook.

### projects-02-ea-title: [wordmark:Electronic Arts]

Contribution à un thème pour les forums communautaires d’[abbr:EA], adopté
par plusieurs de leurs propriétés, dont de nombreux titres sportifs. Le
thème a réduit le besoin de versions spécifiques et simplifié la maintenance
à long terme pour les deux équipes.

### projects-03-banq-title: [wordmark:Bibliothèque et Archives nationales du Québec]

Contribution au système de gestion de bibliothèques d’InMedia (utilisé par
la [abbr:BAnQ] et des institutions au Canada et en France), avec un focus
sur la structure front-end et la cohérence dans un code legacy devenu
complexe.

### projects-04-hootsuite-title: [wordmark:Hootsuite]

Collaboration avec le chef de produit et fondateur sur une exploration
précoce de React. Réalisation de prototypes [abbr:HTML]/[abbr:CSS] pour
valider la pertinence du framework dans les futurs développements produits.

### projects-05-king-games-title: [wordmark:King Games]

Premier test en production du nouveau système de thématisation.
Collaboration avec le thématiseur assigné, en apportant du soutien et en
identifiant les points de friction pour affiner les performances du système.

## contact (title): Contact

## contact-content: Envie de collaborer ?

## contact-cta: Prenons contact !
