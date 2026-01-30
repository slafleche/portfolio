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
  'meta-description':
    'Front‑end developer Stéphane builds UI systems, reusable components, and accessible interfaces that keep design and engineering aligned over time.',
  'meta-keywords':
    'portfolio, web developer, frontend developer, frontend engineer, design systems, TypeScript, CSS architecture, type-safe CSS, CSS-in-JS, UI engineering, UI architecture, UI components, component systems, accessibility, performance, responsive design, UX',
  'meta-author': 'Stéphane LaFlèche',
  'systems-meta-title':
    'Design Systems & UI Architecture | Stéphane LaFlèche',
  'systems-meta-description':
    'How I build UI systems that scale: composable tokens, typed styling inputs, and plain CSS output so changes stay predictable and scoped.',
  'systems-meta-keywords':
    'design systems, UI architecture, typed CSS, CSS primitives, scalable UI, accessibility, frontend engineering, portfolio',
  'not_found-title': '404 This page can not be found',
  'not_found-back': 'Back to home',

  'menu-skip_nav': 'Skip to content',
  'menu-left_label': 'About Me',
  'menu-right_label': 'My Work',
  'menu-anchor_label': 'Jump to section',
  'menu-home_label': 'Home',
  'menu-nav_label': 'Site navigation',
  localeChange: 'Select language',
  'close-label': 'Close',
  'scroll-cue': 'Scroll to content',

  'manifest-name': "Stéphane LaFlèche's Portfolio",
  'manifest-short-name': 'Stéphane',
  'manifest-description':
    'Front-end developer building design systems and accessible interfaces with TypeScript.',
  'manifest-categories': [
    'portfolio',
    'developer',
    'design',
  ],

  'favicon-meta-description':
    "Metadata describing the favicon and manifest assets for Stéphane's portfolio.",
  'favicon-meta-keywords':
    'portfolio, web developer, frontend developer, frontend engineer, design systems, TypeScript, CSS architecture, type-safe CSS, CSS-in-JS, UI engineering, UI architecture, UI components, component systems, accessibility, performance, responsive design, UX',
  'favicon-meta-author': 'Stéphane LaFlèche',

  'hero-title': 'Stéphane LaFlèche [split] Front-end Developer',
  'hero-subtitle':
    'I build design systems and component libraries that scale. [split] Keeping UIs consistent, maintainable, and aligned with design over time.',

  'console-curiosity-title': '🔎 Curious?',
  'console-curiosity-test': '[test] 👀 Observer detected.',
  'console-curiosity-result': '[result] Access granted.',
  'console-curiosity-hint':
    '[hint] The code shows what I built; curiosity() shows how I think.',

  approach: 'Approach',
  'approach-href': 'approach',
  ...markdownRefs('approach-content'),

  architecture: 'Site Architecture',
  'architecture-href': 'architecture',
  ...markdownRefs('home-architecture-content'),

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

  'systems-hero-title': 'The Tetrachromatic [split] Approach',
  'systems-hero-subtitle':
    'UI systems with **progressive formalization** and explicit boundaries. [split] Start simple. Formalize progressively. Own locally. Change predictably.',

  'systems-tetrachromatic-title': 'The Tetrachromatic Approach',
  ...markdownRefs('tetrachromatic-content'),

  'systems-title': 'Expertise',
  ...markdownRefs('expertise-content'),

  'systems-intro-href': 'systems-expertise',
  'systems-principles': 'Principles',
  'systems-principles-href': 'systems-principles',
  ...markdownRefs('principles-content'),
  'systems-architecture': 'Architecture',
  'systems-architecture-href': 'systems-architecture',
  ...markdownRefs('systems-architecture-content'),
  ...markdownRefs('calipers-content'),
  'systems-back-home-label': 'Back to home',
  'systems-link-label': 'Open systems page',
  'systems-mock-html-alt':
    'Decorative devtools-style HTML showing the end of the page source.',

  contact: 'Contact',
  'contact-href': 'contact',
  'contact-label-floating': 'Open Contact Form (floating)',
  'contact-label-hero': 'Open Contact Form',
  'contact-cta': "Let's connect!",

  'contact-content': "Think we'd work well together?",
  'contact-email-label': 'Shoot me an email!',
  'contact-bg-title': 'Starry night sky with tree line silhouette',
  'contact-bg-description':
    'A clear night sky filled with stars and the faint glow of the Milky Way, with a black silhouette of a dense forest in the foreground.',

  ...markdownRefs('forms-form-success-body', 'forms-form-error-body'),

  'privacy-title': 'Privacy Policy',
  'privacy-href': 'privacy',
  ...markdownRefs('privacy-content'),

  css_calipers: 'CSS Calipers',

  'links-github-label': 'My portfolio on GitHub',
  'links-linkedin-label': 'My LinkedIn Page',
  'links-github-css-calipers-label': 'CSS Calipers on GitHub',
  'links-npm-css-calipers-label': 'CSS Calipers on NPM',
} as const;

export const enData = mergeLocaleSections(
  enBaseData,
  enAbbreviations,
  enCaseStudies,
  enFormCopy,
);

export type EnData = typeof enData;
