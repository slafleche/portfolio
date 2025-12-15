import { markdownRefs } from './markdownRefs';
import { enAbbreviations } from './abbreviations/en.abbr';
import { enCaseStudies } from './caseStudies/en.caseStudies';
import { enFormCopy } from './forms/en.form';
import { mergeLocaleSections } from './mergeLocaleSections';

const enBaseData = {
  label: 'English',
  'abbreviated-label': 'EN',
  redirecting: 'Redirecting...',
  title: 'Front-End Developer | Stéphane L. Portfolio',
  description:
    'Stéphane L. builds reusable components, responsive experiences, and brand-faithful interfaces — elevating projects beyond the handoff between design and development.',

  'menu-skip_nav': 'Skip to content',
  'menu-left_label': 'About Me',
  'menu-right_label': 'My Work',
  localeChange: 'Select language',
  'close-label': 'Close',
  'scroll-cue': 'Scroll to content',

  'manifest-name': 'Portfolio — Stéphane L.',
  'manifest-short-name': 'Stéphane L.',
  'manifest-description': 'Personal portfolio progressive web app.',
  'manifest-categories': [
    'portfolio',
    'personal',
  ],

  'error-video': 'Sorry, your browser cannot play this video',

  'favicon-meta-description':
    "Metadata describing the favicon and manifest assets for Stéphane L.'s portfolio.",
  'favicon-meta-keywords': 'favicon, icon, manifest, Stéphane L.',
  'favicon-meta-author': 'Stéphane L.',

  'hero-title': 'Blue–magenta gradient rotation background',
  'hero-alt':
    'Slowly rotating diagonal gradient blending cool blue and soft magenta tones with subtle light bands',
  'hero-title_a': 'Design systems built',
  'hero-title_b': 'to evolve',
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
  'projects-01-cocacola-title': 'Brigade du Bonheur (Coca-Cola)',
  ...markdownRefs('projects-01-cocacola-content'),
  'projects-02-ea-title': 'Electronic Arts ([abbr:EA])',
  ...markdownRefs('projects-02-ea-content'),
  'projects-03-banq-title': '[abbr:BAnQ] (via InMedia)',
  ...markdownRefs('projects-03-banq-content'),
  'projects-04-hootsuite-title': 'Hootsuite (internal collaboration)',
  ...markdownRefs('projects-04-hootsuite-content'),
  'projects-05-king-games-title': 'King Games',
  ...markdownRefs('projects-05-king-games-content'),

  'systems-title': 'Ship of Theseus: Structure that endures',
  'systems-title_a': 'Ship of Theseus: ',
  'systems-title_b': 'structure that endures',
  ...markdownRefs('systems-intro'),
  'systems-process': 'Process',
  'systems-process-href': 'systems-process',
  ...markdownRefs('systems-process-content'),
  'systems-describe': 'Describe',
  'systems-describe-href': 'systems-describe',
  ...markdownRefs('systems-describe-content'),
  'systems-architecture': 'System Architecture',
  'systems-architecture-href': 'systems-architecture',
  ...markdownRefs('systems-architecture-content'),
  'systems-express': 'Express',
  'systems-express-href': 'systems-express',
  ...markdownRefs('systems-express-content'),
  'systems-integrate': 'Integrate',
  'systems-integrate-href': 'systems-integrate',
  ...markdownRefs('systems-integrate-content'),
  'systems-resilience': 'Resilience',
  'systems-resilience-href': 'systems-resilience',
  ...markdownRefs('systems-resilience-content'),
  'systems-ai': '[abbr:AI] Assistance',
  'systems-ai-href': 'systems-ai',
  ...markdownRefs('systems-ai-content'),
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
