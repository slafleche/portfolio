import { markdownRefs } from './markdownRefs';
import { enAbbreviations } from './abbreviations/en.abbr';
import { enCaseStudies } from './caseStudies/en.caseStudies';
import { enFormCopy } from './forms/en.form';
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

  'error-video': 'Sorry, your browser cannot play this video',

  'favicon-meta-description':
    "Metadata describing the favicon and manifest assets for Stéphane's portfolio.",
  'favicon-meta-keywords': 'favicon, icon, manifest, Stéphane',
  'favicon-meta-author': 'Stéphane',

  'hero-video-title': 'Blue-magenta gradient rotation background',
  'hero-video-alt':
    'Slowly rotating diagonal gradient blending cool blue and soft magenta tones with subtle light bands',

  'hero-title': 'Stéphane LaFlèche, [split] Front-end Developer',
  'hero-subTitle':
    'I specialize in React UI & design systems, keeping design and code aligned',

  'hero-console_description': 'Decorative code backdrop',
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
  ...markdownRefs('systems-intro'),
  'systems-intro-href': 'systems-expertise',
  'systems-principles': 'Principles',
  'systems-principles-href': 'systems-principles',
  ...markdownRefs('systems-principles-content'),
  'systems-system-shape': 'System Shape',
  'systems-system-shape-href': 'systems-system-shape',
  ...markdownRefs(
    'systems-system-shape-content',
    'systems-system-shape-blurb',
  ),
  'systems-back-home-label': 'Back to home',
  'systems-link-label': 'Systems',
  'footer-systems-snippet-label':
    'Decorative devtools-style HTML showing the end of the page source.',

  contact: 'Contact',
  'contact-href': 'contact',
  'contact-content': "Think we'd work well together?",
  'contact-email-label': 'Shoot me an email!',

  ...markdownRefs('forms-form-success-body', 'forms-form-error-body'),

  'privacy-title': 'Privacy Policy',
  'privacy-href': 'privacy',
  'privacy-updated': '',
  ...markdownRefs('privacy-content'),
} as const;

export const enData = mergeLocaleSections(
  enBaseData,
  enAbbreviations,
  enCaseStudies,
  enFormCopy,
);

export type EnData = typeof enData;
