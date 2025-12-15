import { markdownRefs } from './markdownRefs';
import { frAbbreviations } from './abbreviations/fr.abbr';
import { frCaseStudies } from './caseStudies/fr.caseStudies';
import { frFormCopy } from './forms/fr.form';
import { mergeLocaleSections } from './mergeLocaleSections';

const frBaseData = {
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
  'close-label': 'Fermer',
  'scroll-cue': 'Défiler vers le contenu',

  'manifest-name': 'Portfolio — Stéphane L.',
  'manifest-short-name': 'Stéphane L.',
  'manifest-description':
    'Application web progressive du portfolio personnel.',
  'manifest-categories': [
    'portfolio',
    'personnel',
  ],

  'error-video':
    'Désolé, votre navigateur ne peut pas lire cette vidéo.',

  'favicon-meta-description':
    'Métadonnées décrivant les favicons et manifestes du portfolio de Stéphane L.',
  'favicon-meta-keywords': 'favicon, icône, manifeste, Stéphane L.',
  'favicon-meta-author': 'Stéphane L.',

  'hero-title': 'Fond dégradé bleu et magenta en rotation',
  'hero-alt':
    'Dégradé diagonal en rotation lente mêlant des tons bleu froid et magenta doux, avec de légères bandes lumineuses',
  'hero-title_a': 'Systèmes de design pensés',
  'hero-title_b': 'pour évoluer',
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

  projects: 'Projets',
  'projects-href': 'projets',
  'projects-01-cocacola-title': 'Brigade du Bonheur (Coca-Cola)',
  ...markdownRefs('projects-01-cocacola-content'),
  'projects-02-ea-title': 'Electronic Arts ([abbr:EA])',
  ...markdownRefs('projects-02-ea-content'),
  'projects-03-banq-title': '[abbr:BAnQ] (via InMedia)',
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
  'systems-architecture': 'Architecture du système',
  'systems-architecture-href': 'systems-architecture',
  ...markdownRefs('systems-architecture-content'),
  'systems-express': 'Exprimer',
  'systems-express-href': 'systems-exprimer',
  ...markdownRefs('systems-express-content'),
  'systems-integrate': 'Intégrer',
  'systems-integrate-href': 'systems-integrer',
  ...markdownRefs('systems-integrate-content'),
  'systems-resilience': 'Résilience',
  'systems-resilience-href': 'systems-resilience',
  ...markdownRefs('systems-resilience-content'),
  'systems-ai': 'Assistance [abbr:AI]',
  'systems-ai-href': 'systems-ia',
  ...markdownRefs('systems-ai-content'),
  'systems-link-label': 'Systèmes',
  'footer-systems-snippet-label':
    'Extrait HTML décoratif inspiré des outils de développement, qui montre la fin du code de la page.',

  contact: 'contact',
  'contact-href': 'contact',
  'contact-content': 'Envie de collaborer ?',
  'contact-email-label': 'Envoyez-moi un email !',

  ...markdownRefs('forms-form-success-body', 'forms-form-error-body'),

  'privacy-title': 'Politique de confidentialité',
  'privacy-href': 'confidentialite',
  'privacy-updated': '',
  ...markdownRefs('privacy-content'),
} as const;

export const frData = mergeLocaleSections(
  frBaseData,
  frAbbreviations,
  frCaseStudies,
  frFormCopy,
);

export type FrData = typeof frData;
