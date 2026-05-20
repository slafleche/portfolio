import { frAbbreviations } from './abbreviations/fr.abbr';
import { frCaseStudies } from './caseStudies/fr.caseStudies';
import { frFormCopy } from './forms/fr.form';
import { markdownRefs } from './markdownRefs';
import { mergeLocaleSections } from './mergeLocaleSections';

const frBaseData = {
  label: 'Français',
  'abbreviated-label': 'FR',
  redirecting: 'Redirection...',
  title:
    'Développeur full-stack · Systèmes de design intégrés de A à Z pour les équipes à l’ère de l’IA | Stéphane LaFlèche',
  description:
    'Développeur full-stack basé à Montréal depuis 2012, spécialisé dans la création de systèmes de design évolutifs et intégrés de A à Z pour les équipes à l’ère de l’IA.',
  'meta-description':
    'Développeur full-stack basé à Montréal depuis 2012, spécialisé dans la création de systèmes de design évolutifs et intégrés de A à Z pour les équipes à l’ère de l’IA.',
  'meta-keywords':
    'portfolio, développeur web, développeur frontend, ingénieur frontend, design systems, TypeScript, architecture CSS, CSS typé, CSS-in-JS, UI, architecture UI, composants, accessibilité, performance, design responsive, UX',
  'meta-author': 'Stéphane LaFlèche',
  'systems-meta-title':
    'Systèmes de design & architecture UI | Stéphane LaFlèche',
  'systems-meta-description':
    'Une approche pour des systèmes UI qui évoluent : tokens composables, styles typés et CSS en sortie, pour que les changements restent prévisibles et bien cadrés.',
  'systems-meta-keywords':
    'systèmes de design, architecture UI, CSS typé, primitives CSS, interfaces évolutives, accessibilité, ingénierie front-end, portfolio',
  'not_found-title': '404 Page non trouvée',
  'not_found-back': 'Retour à la page d’accueil',

  'menu-skip_nav': 'Aller au contenu',
  'menu-left_label': 'À propos de moi',
  'menu-right_label': 'Mon travail',
  'menu-anchor_label': 'Aller à la section',
  'menu-home_label': 'Page d’accueil',
  'menu-nav_label': 'Navigation du site',
  localeChange: 'Choix de la langue',
  'close-label': 'Fermer',
  'scroll-cue': 'Défiler vers le contenu',

  'manifest-name': 'Portfolio de Stéphane LaFlèche',
  'manifest-short-name': 'Stéphane',
  'manifest-description':
    'Développeur front-end spécialisé en design systems, interfaces accessibles et TypeScript.',
  'manifest-categories': [
    'portfolio',
    'développeur',
    'design',
  ],

  'favicon-meta-description':
    'Métadonnées décrivant les favicons et manifestes du portfolio par Stéphane',
  'favicon-meta-keywords':
    'portfolio, développeur web, développeur frontend, ingénieur frontend, design systems, TypeScript, architecture CSS, CSS typé, CSS-in-JS, UI, architecture UI, composants, accessibilité, performance, design responsive, UX',
  'favicon-meta-author': 'Stéphane LaFlèche',

  'hero-title':
    'Développeur full-stack [split] Systèmes de design pour les équipes à l’ère de l’IA',
  'hero-subtitle':
    'Je suis développeur full-stack basé à Montréal depuis 2012. Je crée des systèmes de design évolutifs et intégrés de A à Z pour les équipes à l’ère de l’IA.',

  'console-curiosity-title': '🔎 Curieux ?',
  'console-curiosity-test': '[test] 👀 Observateur détecté.',
  'console-curiosity-result': '[résultat] Accès accordé.',
  'console-curiosity-hint':
    '[indice] Le code montre ce que j’ai construit; curiosity() montre comment je pense.',

  design_systems: 'Systèmes de design intégrés de A à Z',
  'design_systems-href': 'systemes-de-design',
  ...markdownRefs('design-systems-content'),

  summary: 'Quelques mots sur moi',
  'summary-href': 'resume',
  ...markdownRefs('summary-content'),

  approach: 'Approche',
  'approach-href': 'philosophie',
  ...markdownRefs('approach-content'),

  guardrails: 'Garde-fous de qualité du code',
  'guardrails-href': 'garde-fous',
  ...markdownRefs('guardrails-intro'),
  'guardrails-02-title': 'Détecter la dérive tôt',
  ...markdownRefs('guardrails-02-content'),
  'guardrails-03-title': 'Contrôler chaque commit',
  ...markdownRefs('guardrails-03-content'),
  'guardrails-04-title': 'Tester le comportement',
  ...markdownRefs('guardrails-04-content'),
  'guardrails-05-title': 'Tester avec le CI',
  ...markdownRefs('guardrails-05-content'),
  ...markdownRefs('guardrails-outro'),

  about: 'À propos',
  'about-href': 'a-propos',
  ...markdownRefs('about-content'),

  projects: 'Projets',
  'projects-href': 'projets',
  'projects-01-cocacola-title': '[wordmark:Coca-Cola]',
  ...markdownRefs('projects-01-cocacola-content'),
  'projects-02-ea-title': '[wordmark:Electronic Arts]',
  ...markdownRefs('projects-02-ea-content'),
  'projects-03-banq-title':
    '[wordmark:Bibliothèque et Archives nationales du Québec]',
  ...markdownRefs('projects-03-banq-content'),
  'projects-04-hootsuite-title': '[wordmark:Hootsuite]',
  ...markdownRefs('projects-04-hootsuite-content'),
  'projects-05-king-games-title': '[wordmark:King Games]',
  ...markdownRefs('projects-05-king-games-content'),

  'systems-hero-title': 'L’approche [split] Tetrachromatic',
  'systems-hero-subtitle':
    'Systèmes d’interface avec **formalisation progressive** et frontières explicites. Commencer simple. Formaliser progressivement. Périmètre local. Changer de manière prévisible.',

  'systems-title': 'Expertise',
  ...markdownRefs('expertise-content'),
  'systems-intro-href': 'systems-expertise',

  'systems-tetrachromatic-title': 'L’approche Tetrachromatic',
  ...markdownRefs('tetrachromatic-content'),

  'systems-principles': 'Principes',
  'systems-principles-href': 'systems-principes',
  ...markdownRefs('principles-content'),
  'systems-architecture': 'Architecture',
  'systems-architecture-href': 'systems-architecture',
  ...markdownRefs('architecture-content'),
  ...markdownRefs('calipers-content'),
  'systems-back-home-label': 'Retour à la page d’accueil',
  'systems-link-label': 'Naviguez vers la page Systèmes',
  'systems-mock-html-alt':
    'HTML décoratif de style devtools montrant la fin du code source de la page.',

  contact: 'Contact',
  'contact-href': 'contact',

  'contact-content': 'Envie de collaborer ?',
  'contact-fit':
    'Disponible pour des postes senior front-end ou full-stack dans des équipes qui prennent les systèmes de design et le métier au sérieux. Montréal hybride ou à distance.',
  'contact-email-label': 'Envoyez-moi un courriel !',
  'contact-label-floating':
    'Ouvrir le formulaire de contact (flottant)',
  'contact-label-hero': 'Ouvrir le formulaire de contact',
  'contact-cta': 'Prenons contact !',

  'contact-bg-title': 'Ciel étoilé avec silhouette de ligne d’arbres',
  'contact-bg-description':
    'Un ciel nocturne clair rempli d’étoiles et de la faible lueur de la Voie lactée, avec une silhouette noire d’une forêt dense au premier plan.',

  ...markdownRefs('forms-form-success-body', 'forms-form-error-body'),

  'privacy-title': 'Politique de confidentialité',
  'privacy-href': 'confidentialite',
  ...markdownRefs('privacy-content'),

  css_calipers: 'CSS Calipers',

  'links-github-label': 'Mon Portfolio sur GitHub',
  'links-linkedin-label': 'Ma page LinkedIn',
  'links-github-css-calipers-label': 'CSS Calipers sur GitHub',
  'links-npm-css-calipers-label': 'CSS Calipers sur NPM',
} as const;

export const frData = mergeLocaleSections(
  frBaseData,
  frAbbreviations,
  frCaseStudies,
  frFormCopy,
);

export type FrData = typeof frData;
