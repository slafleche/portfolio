import { frAbbreviations } from './abbreviations/fr.abbr';
import { frCaseStudies } from './caseStudies/fr.caseStudies';
import { frFormCopy } from './forms/fr.form';
import { markdownRefs } from './markdownRefs';
import { mergeLocaleSections } from './mergeLocaleSections';

const frBaseData = {
  label: 'Français',
  'abbreviated-label': 'FR',
  redirecting: 'Redirection...',
  title: 'Développeur Front-End | Portfolio par Stéphane',
  description: '',

  'menu-skip_nav': 'Aller au contenu',
  'menu-left_label': 'À propos de moi',
  'menu-right_label': 'Mon travail',
  'menu-anchor_label': 'Aller à la section',
  'menu-home_label': "Page d'accueil",
  'menu-nav_label': 'Navigation du site',
  localeChange: 'Choix de la langue',
  'close-label': 'Fermer',
  'scroll-cue': 'Défiler vers le contenu',

  'manifest-name': 'Portfolio | Stéphane',
  'manifest-short-name': 'Stéphane',
  'manifest-description':
    'Application web progressive du portfolio personnel.',
  'manifest-categories': [
    'portfolio',
    'personnel',
  ],

  'favicon-meta-description':
    'Métadonnées décrivant les favicons et manifestes du portfolio par Stéphane',
  'favicon-meta-keywords': 'favicon, icône, manifeste, Stéphane',
  'favicon-meta-author': 'Stéphane',

  'hero-title': 'Stéphane LaFlèche [split] développeur front-end',
  'hero-subtitle':
    'Je me spécialise dans les interfaces React et les systèmes de design, en gardant design et code alignés.',

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

  'systems-hero-title':
    'Interfaces conçues [split] pour la composition',
  'systems-hero-subtitle':
    'Primitives CSS typées pour structurer **votre** système de design',

  'systems-title': 'Expertise',
  ...markdownRefs('expertise-content'),
  'systems-intro-href': 'systems-expertise',
  'systems-principles': 'Principes',
  'systems-principles-href': 'systems-principes',
  ...markdownRefs('principles-content'),
  'systems-architecture': 'Forme du système',
  'systems-architecture-href': 'systems-forme-du-systeme',
  ...markdownRefs('architecture-content'),
  ...markdownRefs('calipers-content'),
  'systems-back-home-label': "Retour à la page d'accueil",
  'systems-link-label': 'Naviguez vers la page Systèmes',
  'systems-mock-html-alt':
    'HTML décoratif de style devtools montrant la fin du code source de la page.',

  contact: 'contact',
  'contact-href': 'contact',

  'contact-content': 'Envie de collaborer ?',
  'contact-email-label': 'Envoyez-moi un courriel !',
  'contact-label-floating':
    'Ouvrir le formulaire de contact (flottant)',
  'contact-label-hero': 'Ouvrir le formulaire de contact',
  'contact-cta': 'Prenons contact !',

  'contact-bg-title': "Ciel étoilé avec silhouette de ligne d'arbres",
  'contact-bg-description':
    "Un ciel nocturne clair rempli d'étoiles et de la faible lueur de la Voie lactée, avec une silhouette noire d'une forêt dense au premier plan.",

  ...markdownRefs('forms-form-success-body', 'forms-form-error-body'),

  'privacy-title': 'Politique de confidentialité',
  'privacy-href': 'confidentialite',
  ...markdownRefs('privacy-content'),

  css_calipers: 'CSS Calipers',
} as const;

export const frData = mergeLocaleSections(
  frBaseData,
  frAbbreviations,
  frCaseStudies,
  frFormCopy,
);

export type FrData = typeof frData;
