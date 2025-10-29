import { markdownRef } from './markdownRefs';

export const frData = {
  label: 'Français',
  'abbreviated-label': 'FR',
  redirecting: 'Redirection...',
  title: 'Développeur Front-End | Portfolio de Stéphane L.',
  description:
    'Stéphane L. développe des composants réutilisables, des expériences responsives et des interfaces fidèles aux marques — pour élever les projets au-delà du simple passage entre design et développement.',

  'menu-skip_nav': 'Aller au contenu',
  'menu-left_label': 'À propos de moi',
  'menu-right_label': 'Mon travail',
  localeChange: 'Choix de la langue',

  'scroll-cue': 'Défiler vers le contenu',

  'hero-title': 'Fond dégradé bleu et magenta en rotation',
  'hero-alt':
    'Dégradé diagonal en rotation lente mêlant des tons bleu froid et magenta doux, avec de légères bandes lumineuses',

  'hero-title_a': 'Tisser le design et',
  'hero-title_b': 'le développement',
  'hero-subtitle': "Un développeur avec l'*œil* d\'un designer",
  'hero-console_description': 'Arrière-plan de code décoratif',
  'hero-cta': 'Prenons contact !',

  'console-curiosity-title': '🔎 Curieux ?',
  'console-curiosity-test': '[test] 👀 Observateur détecté.',
  'console-curiosity-result': '[résultat] Accès accordé.',
  'console-curiosity-hint':
    "[indice] Le code montre ce que j\'ai construit; curiosity() montre comment je pense.",

  'error-video':
    'Désolé, votre navigateur ne peut pas lire cette vidéo.',

  about: 'À propos',
  'about-href': 'a-propos',
  'about-content':
    "Avant d'\u00e9crire la moindre ligne de code, j'ai \u00e9tudi\u00e9 l'**Animation Art and Design** avant de passer \u00e0 la mod\u00e9lisation 3D, o\u00f9 je devais cr\u00e9er des objets qui respectaient \u00e0 la fois une vision artistique et des contraintes techniques strictes. Ce m\u00e9lange de cr\u00e9ativit\u00e9 et de rigueur m'a appris \u00e0 observer comment les choses s'imbriquent, \u00e0 voir les syst\u00e8mes et les sch\u00e9mas qui existent sous la surface.\n\nQuand je me suis tourn\u00e9 vers le d\u00e9veloppement front-end, cette m\u00eame curiosit\u00e9 m'a conduit vers l'exp\u00e9rience utilisateur, la th\u00e9matisation et la r\u00e9utilisabilit\u00e9. J'ai commenc\u00e9 \u00e0 penser moins en termes de composants isol\u00e9s et davantage \u00e0 la mani\u00e8re dont toutes les interfaces s'interconnectent \u2014 comment les d\u00e9cisions de design se d\u00e9clinent \u00e0 grande \u00e9chelle et comment les syst\u00e8mes restent flexibles dans le temps.\n\nJ'ai jou\u00e9 un r\u00f4le cl\u00e9 dans la cr\u00e9ation d'un syst\u00e8me de th\u00e9matisation qui servait plusieurs produits.\n\nIl a \u00e9t\u00e9 con\u00e7u pour garder le langage visuel coh\u00e9rent tout en permettant \u00e0 chaque application de conserver sa propre identit\u00e9.\n\nDes projets comme celui-ci ont fa\u00e7onn\u00e9 ma vision de la collaboration entre design et d\u00e9veloppement : non pas comme un simple passage de relais, mais comme un processus partag\u00e9 qui maintient la coh\u00e9rence de l'id\u00e9e initiale jusqu'\u00e0 la mise en ligne. Je pense \u00e0 l'**exp\u00e9rience d\u00e9veloppeur** comme les designers pensent \u00e0 l'exp\u00e9rience utilisateur : plus le syst\u00e8me est clair et coh\u00e9rent, plus il est facile de voir de bonnes id\u00e9es se concr\u00e9tiser.\n\nJ'essaie de b\u00e2tir des environnements o\u00f9 les \u00e9quipes peuvent se concentrer sur le travail lui-m\u00eame sans se battre contre les outils \u2014 o\u00f9 design, d\u00e9veloppement et intention avancent de concert, du premier croquis \u00e0 la release finale.",

  approach: 'Approche',
  'approach-href': 'philosophie',
  'approach-content':
    "Les syst\u00e8mes de design r\u00e9ussis ne naissent pas par hasard.\n\nIls fonctionnent vraiment bien quand le design et le d\u00e9veloppement restent synchronis\u00e9s \u2013 quand quelqu'un surveille la fa\u00e7on dont les id\u00e9es se traduisent d'un c\u00f4t\u00e9 \u00e0 l'autre.\n\nC'est l'espace o\u00f9 j'aime travailler : transformer l'intention de design en composants, en syst\u00e8mes de th\u00e9matisation et en sch\u00e9mas qui tiennent la route dans le code. Je pense au flux des d\u00e9cisions : comment les tokens de couleur, le mouvement et la mise en page se r\u00e9pondent pour que le rendu final reste coh\u00e9rent et intentionnel.\n\nPour moi, il s'agit de cr\u00e9er de la structure sans ajouter de friction \u2014 des syst\u00e8mes qui facilitent la t\u00e2che de chacun pour construire quelque chose qui semble juste, qui se ressent juste et qui fonctionne juste.",


  case_study: 'Études de cas',
  'case_study-href': 'etudes-de-cas',
  'case_study-list': [
    {
      title: 'Thématisation dans le système',
      subTitle: 'comprendre ses limites',
      content:
        "J\'ai commencé comme **thémeur**, à construire des thèmes clients dans le cadre déjà en place de Vanilla. Ce travail m\'a dévoilé le comportement réel du système : où il était souple, où il résistait, et comment l\'intention de design se traduisait en code. Je devais souvent concilier deux attentes opposées : des clients voulant une grande liberté créative et mon responsable qui privilégiait la sécurité des refactorisations. J\'ai naturellement fait le pont entre ces besoins, en trouvant des solutions respectant autant l\'objectif visuel que les limites structurelles du système.",
    },
    {
      title: 'Fluidifier la thématisation',
      subTitle: 'simplifier le système au quotidien',
      content:
        "En thématisant, j\'ai repéré des frictions récurrentes : styles dupliqués, espacements incohérents, noms peu clairs. Même si personne n\'utilisait mon travail, j\'ai commencé à écrire de petits utilitaires et des snippets réutilisables pour rendre mon processus plus net. Ces outils personnels m\'ont montré qu\'organisation et prévisibilité ne font pas que gagner du temps : ils renforcent la confiance qu\'on peut avoir dans le système.",
    },
    {
      title: 'Rejoindre la R&D',
      subTitle: "contribuer depuis l'intérieur du système",
      content:
        "J\'ai intégré la **Recherche et Développement (R&D)** comme **intégrateur web**, en passant du stylisme au-dessus du système à la manière dont il fonctionne en profondeur. J\'ai contribué directement au **produit principal**, ajouté de nouvelles fonctionnalités, corrigé des bugs et affiné le comportement front-end, tout en construisant le nouveau site **Vanilla.com** en autonomie et en collaborant sur des projets plus modestes comme une intégration Hootsuite. En entrant dans le code mutualisé, j\'ai davantage pensé aux développeurs amenés à le maintenir, y compris au nouveau thémeur prenant ma place. Cette étape a renforcé mon attention à la clarté, à la maintenabilité et à l\'expérience développeur.",
    },
    {
      title: "Préparer l\'héritage",
      subTitle: 'créer les bases du changement',
      content:
        "Au sein de l\'équipe **Knowledge Base**, j\'ai travaillé sur la fondation front-end qui allait soutenir la prochaine génération de produits Vanilla. J\'ai aidé à définir la manière dont les composants étaient stylés, structurés et thématisés, en me concentrant sur la cohérence, les pratiques CSS-in-JS et des schémas évolutifs. En parallèle, j\'ai contribué à adapter l\'ancien code Forums pour qu\'il puisse se connecter aux nouveaux concepts de thématisation sans casser l\'existant. Cette phase consistait à bâtir compatibilité et résilience, pour préparer les systèmes historiques à coexister avec ce qui était en train d\'arriver.",
    },
    {
      title: 'Nouveau système de thème',
      subTitle: 'relier plateformes legacy et modernes',
      content:
        "J\'ai participé à la mise en place d\'une architecture de thème qui traduisait le style de chaque client en un ensemble de **design tokens** : des valeurs partagées interprétées selon les besoins de chaque produit. Un ensemble concis de paramètres globaux gardait tout cohérent, tandis que les composants pouvaient s\'adapter finement à ces tokens. Ce **découplage par tokens** a permis aux produits d\'évoluer en toute sécurité : les équipes pouvaient mettre à jour les composants sans casser les thèmes clients. Même lorsque des composants étaient entièrement remplacés, le langage visuel restait intact, preuve de la résilience du système.",
    },
    {
      title: 'Leçons retenues',
      subTitle: 'garder design et développement alignés',
      content:
        "De tout cela, j\'ai retenu que bâtir des systèmes évolutifs impose d\'aligner toutes les personnes qui les touchent, pas uniquement le code. Le travail devait servir **trois publics** à la fois : l\'équipe interne qui fait avancer la plateforme, les développeurs produits qui l\'utilisent et les clients qui définissent leurs thèmes de marque. Garder l\'intention cohérente entre ces groupes est devenu le vrai indicateur de réussite. Pour moi, cet alignement — entre design, développement et intention — est ce qui transforme de bons systèmes en systèmes durables.",
    },
  ] as const,

  projects: 'Projets',
  'projects-href': 'projets',
  'projects-list': {
    cocacola: {
      title: 'Brigade du Bonheur (Coca-Cola)',
      content:
        "Travail sur le front-end et le back-end du site de la campagne Brigade du Bonheur de Coca-Cola, dans le cadre d\'une initiative promotionnelle liée à leur page Facebook.",
    },
    ea: {
      title: 'Electronic Arts (EA)',
      content:
        "Création d\'un thème pour les forums communautaires d\'EA, adopté par plusieurs de leurs propriétés, dont de nombreux titres sportifs. Ce thème a réduit le besoin de versions personnalisées et simplifié la maintenance à long terme pour les deux équipes.",
    },
    banq: {
      title: 'BAnQ (via InMedia)',
      content:
        "Travail sur le système de gestion de bibliothèques d\'InMedia, utilisé par la BAnQ et d\'autres institutions au Canada et en France. Mise en place d\'une structure plus cohérente et d\'une meilleure constance dans un front-end devenu complexe au fil du temps.",
    },
    hootsuite: {
      title: 'Hootsuite (collaboration interne)',
      content:
        "Collaboration avec le chef de produit et fondateur sur un premier essai utilisant React. Réalisation de prototypes HTML/CSS pour appuyer sa recherche et explorer comment le framework pouvait s\'intégrer dans les futurs développements produits.",
    },
    kingGames: {
      title: 'King Games',
      content:
        "L\'un des premiers tests réels du nouveau système de thématisation. Collaboration avec le themer assigné au projet pour offrir des conseils et observer les premiers points de friction, afin d\'affiner la performance du système en contexte client.",
    },
  },

  contact: 'contact',
  'contact-href': 'contact',
  'contact-content':
    'Envie de collaborer ? Contactez-moi sur [LinkedIn](https://www.linkedin.com/in/slafleche)',
  'contact-github':
    'Le code du site est dispo sur [GitHub](https://github.com/slafleche/portfolio) !',

  'systems-title': 'Ship of Theseus : le meilleur système',
  ...markdownRef('systems-content'),
  'systems-link-label': 'Systèmes',
} as const;

export type FrData = typeof frData;
