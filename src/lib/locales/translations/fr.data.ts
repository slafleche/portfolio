import { markdownRefs } from './markdownRefs';

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

  'manifest-name': 'Portfolio — Stéphane L.',
  'manifest-short-name': 'Stéphane L.',
  'manifest-description':
    'Application web progressive du portfolio personnel.',
  'manifest-categories': ['portfolio', 'personnel'],

  'error-video':
    'Désolé, votre navigateur ne peut pas lire cette vidéo.',

  'favicon-meta-description':
    'Métadonnées décrivant les favicons et manifestes du portfolio de Stéphane L.',
  'favicon-meta-keywords': 'favicon, icône, manifeste, Stéphane Laflèche',
  'favicon-meta-author': 'Stéphane L.',

  'hero-title': 'Fond dégradé bleu et magenta en rotation',
  'hero-alt':
    'Dégradé diagonal en rotation lente mêlant des tons bleu froid et magenta doux, avec de légères bandes lumineuses',
  'hero-title_a': 'Des systèmes techniques ;',
  'hero-title_b': 'dictés par le design',
  'hero-console_description': 'Arrière-plan de code décoratif',
  'hero-cta': 'Prenons contact !',

  'console-curiosity-title': '🔎 Curieux ?',
  'console-curiosity-test': '[test] 👀 Observateur détecté.',
  'console-curiosity-result': '[résultat] Accès accordé.',
  'console-curiosity-hint':
    "[indice] Le code montre ce que j'ai construit; curiosity() montre comment je pense.",

  approach: 'Approche',
  'approach-href': 'philosophie',
  ...markdownRefs('approach-content'),

  about: 'À propos',
  'about-href': 'a-propos',
  ...markdownRefs('about-content'),

  case_study: 'Études de cas',
  'case_study-href': 'etudes-de-cas',
  'case-study-01-title': 'Thématisation dans le système',
  'case-study-01-subtitle': 'comprendre ses limites',
  ...markdownRefs('case-study-01-content'),
  'case-study-02-title': 'Fluidifier la thématisation',
  'case-study-02-subtitle': 'simplifier le système au quotidien',
  ...markdownRefs('case-study-02-content'),
  'case-study-03-title': 'Rejoindre la R&D',
  'case-study-03-subtitle': "contribuer depuis l'intérieur du système",
  ...markdownRefs('case-study-03-content'),
  'case-study-04-title': "Préparer l'héritage",
  'case-study-04-subtitle': 'créer les bases du changement',
  ...markdownRefs('case-study-04-content'),
  'case-study-05-title': 'Nouveau système de thème',
  'case-study-05-subtitle': 'relier plateformes legacy et modernes',
  ...markdownRefs('case-study-05-content'),
  'case-study-06-title': 'Leçons retenues',
  'case-study-06-subtitle': 'garder design et développement alignés',
  ...markdownRefs('case-study-06-content'),

  projects: 'Projets',
  'projects-href': 'projets',
  'projects-01-cocacola-title': 'Brigade du Bonheur (Coca-Cola)',
  ...markdownRefs('projects-01-cocacola-content'),
  'projects-02-ea-title': 'Electronic Arts (EA)',
  ...markdownRefs('projects-02-ea-content'),
  'projects-03-banq-title': 'BAnQ (via InMedia)',
  ...markdownRefs('projects-03-banq-content'),
  'projects-04-hootsuite-title': 'Hootsuite (collaboration interne)',
  ...markdownRefs('projects-04-hootsuite-content'),
  'projects-05-king-games-title': 'King Games',
  ...markdownRefs('projects-05-king-games-content'),

  'systems-title':
    'Vaisseau de Thésée : la structure qui survit au changement',
  'systems-title_a': 'Le navire de Thésée: ',
  'systems-title_b': 'la structure qui survit au changement',
  ...markdownRefs('systems-intro'),
  'systems-process': 'Processus',
  'systems-process-href': 'systems-processus',
  ...markdownRefs('systems-process-content'),
  'systems-describe': 'Décrire',
  'systems-describe-href': 'systems-decrire',
  ...markdownRefs('systems-describe-content'),
  'systems-express': 'Exprimer',
  'systems-express-href': 'systems-exprimer',
  ...markdownRefs('systems-express-content'),
  'systems-integrate': 'Intégrer',
  'systems-integrate-href': 'systems-integrer',
  ...markdownRefs('systems-integrate-content'),
  'systems-resilience': 'Résilience',
  'systems-resilience-href': 'systems-resilience',
  ...markdownRefs('systems-resilience-content'),
  'systems-link-label': 'Systèmes',

  contact: 'contact',
  'contact-href': 'contact',
  'contact-content': 'Envie de collaborer ?',
  'contact-email-label': 'Envoyez-moi un email !',
} as const;

export type FrData = typeof frData;
