import { enAbbreviations } from './abbreviations/en.abbr';
import { enCaseStudies } from './caseStudies/en.caseStudies';
import { enFormCopy } from './forms/en.form';
import { markdownRefs } from './markdownRefs';
import { mergeLocaleSections } from './mergeLocaleSections';

const enBaseData = {
  label: 'English',
  'abbreviated-label': 'EN',
  redirecting: 'Redirecting...',
  title: "Front-End Developer | Stéphane's Developer Portfolio",
  description:
    'Front‑end developer Stéphane builds UI systems, reusable components, and accessible interfaces that keep design and engineering aligned over time',

  'menu-skip_nav': 'Skip to content',
  'menu-left_label': 'About Me',
  'menu-right_label': 'My Work',
  'menu-anchor_label': 'Jump to section',
  'menu-home_label': 'Home',
  'menu-nav_label': 'Site navigation',
  localeChange: 'Select language',
  'close-label': 'Close',
  'scroll-cue': 'Scroll to content',

  'manifest-name': "Stéphane's Developer Portfolio",
  'manifest-short-name': "Stéphane's Developer Portfolio",
  'manifest-description': 'Personal portfolio progressive web app.',
  'manifest-categories': [
    'portfolio',
    'personal',
  ],

  'favicon-meta-description':
    "Metadata describing the favicon and manifest assets for Stéphane's portfolio.",
  'favicon-meta-keywords': 'favicon, icon, manifest, Stéphane',
  'favicon-meta-author': 'Stéphane',

  'hero-title': 'Stéphane LaFlèche [split] Front-end Developer',
  'hero-subTitle':
    'I specialize in React UI & design systems, keeping design and code aligned',

  'hero-cta': "Let's connect!",

  'console-curiosity-title': '🔎 Curious?',
  'console-curiosity-test': '[test] 👀 Observer detected.',
  'console-curiosity-result': '[result] Access granted.',
  'console-curiosity-hint':
    '[hint] The code shows what I built; curiosity() shows how I think.',

  approach: 'Approach',
  'approach-href': 'approach',
  ...markdownRefs('approach-content'),

  about: 'About Me',
  'about-href': 'about',
  ...markdownRefs('about-content'),

  projects: 'Projects',
  'projects-href': 'projects',
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

  'systems-hero-title': 'Interfaces designed [split] for composition',
  'systems-hero-subTitle':
    'Type-safe CSS primitives for building **your** design system',

  'systems-title': 'Expertise',

  ...markdownRefs('expertise-content'),
  'systems-intro-href': 'systems-expertise',
  'systems-principles': 'Principles',
  'systems-principles-href': 'systems-principles',
  ...markdownRefs('principles-content'),
  'systems-architecture': 'Architecture',
  'systems-architecture-href': 'systems-architecture',
  ...markdownRefs('architecture-content'),
  ...markdownRefs('blurb-content'),
  'systems-back-home-label': 'Back to home',
  'systems-link-label': 'Open systems page',
  'systems-mock-html-alt':
    'Decorative devtools-style HTML showing the end of the page source.',

  contact: 'Contact',
  'contact-href': 'contact',
  'contact-content': "Think we'd work well together?",
  'contact-email-label': 'Shoot me an email!',
  'contact-bg-title': 'Starry night sky with tree line silhouette',
  'contact-bg-description':
    'A clear night sky filled with stars and the faint glow of the Milky Way, with a black silhouette of a dense forest in the foreground.',

  ...markdownRefs('forms-form-success-body', 'forms-form-error-body'),

  'privacy-title': 'Privacy Policy',
  'privacy-href': 'privacy',
  ...markdownRefs('privacy-content'),
} as const;

export const enData = mergeLocaleSections(
  enBaseData,
  enAbbreviations,
  enCaseStudies,
  enFormCopy,
);

export type EnData = typeof enData;
