import { markdownRefs } from './markdownRefs';

export const enData = {
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

  case_study: 'Case Study',
  'case_study-href': 'case_study',
  'case-study-01-title': 'Theming within the system',
  'case-study-01-subtitle': 'understanding boundaries',
  ...markdownRefs('case-study-01-content'),
  'case-study-02-title': 'Streamlining theming',
  'case-study-02-subtitle': 'building reusable patterns',
  ...markdownRefs('case-study-02-content'),
  'case-study-03-title': 'Joining Research and Development',
  'case-study-03-subtitle': 'shaping core functionality',
  ...markdownRefs('case-study-03-content'),
  'case-study-04-title': 'Preparing legacy systems',
  'case-study-04-subtitle': 'building compatibility',
  ...markdownRefs('case-study-04-content'),
  'case-study-05-title': 'New Theming System',
  'case-study-05-subtitle': 'connecting products through tokens',
  ...markdownRefs('case-study-05-content'),
  'case-study-06-title': 'Lessons learned',
  'case-study-06-subtitle': 'keeping design and development aligned',
  ...markdownRefs('case-study-06-content'),

  projects: 'Projects',
  'projects-href': 'projects',
  'projects-01-cocacola-title': 'Brigade du Bonheur (Coca-Cola)',
  ...markdownRefs('projects-01-cocacola-content'),
  'projects-02-ea-title': 'Electronic Arts (EA)',
  ...markdownRefs('projects-02-ea-content'),
  'projects-03-banq-title': 'BAnQ (via InMedia)',
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
  'systems-express': 'Express',
  'systems-express-href': 'systems-express',
  ...markdownRefs('systems-express-content'),
  'systems-integrate': 'Integrate',
  'systems-integrate-href': 'systems-integrate',
  ...markdownRefs('systems-integrate-content'),
  'systems-resilience': 'Resilience',
  'systems-resilience-href': 'systems-resilience',
  ...markdownRefs('systems-resilience-content'),
  'systems-link-label': 'Systems',

  contact: 'Contact',
  'contact-href': 'contact',
  'contact-content': "Think we'd work well together?",
  'contact-email-label': 'Shoot me an email!',
  'privacy-title': 'Privacy Policy',
  'privacy-href': 'privacy',
  'privacy-updated': '',
  ...markdownRefs('privacy-content'),

  'form-heading': "Let's work together",
  'form-intro':
    "Share a few details and I'll get back as soon as I can.",
  'form-name-label': 'Name',
  'form-email-label': 'Email',
  'form-message-label': 'Message',
  'form-submit-label': 'Send message',
  'form-counter-remaining': '{count} characters remaining',
  'form-privacy-text': 'We only use this to reply.',
  'form-privacy-link-label': 'Privacy policy',
  'form-privacy-close-label': 'Back to form',
  'form-honeypot-label': 'Leave this field blank',
  'form-error-name-required': 'Please enter your name.',
  'form-error-name-too_long': 'Name is too long.',
  'form-error-email-invalid': 'Please enter a valid email address.',
  'form-error-message-required':
    'Please write a message before sending.',
  'form-error-message-too_long': 'Message is too long.',
  'form-error-message-too_many_links':
    'Please remove extra links (limit two URLs).',
  'form-error-token-missing': "Please confirm you're not a bot.",
  'form-status-sending': 'Sending your message…',
  'form-status-success': 'Message sent — thank you!',
  'form-status-generic_error':
    "We couldn't send your message right now. Please try again.",
  'form-status-validation_error':
    'Please check the fields and try again.',
  'form-status-rate_limited':
    'Too many attempts. Please wait a minute.',
  'form-status-service_unavailable':
    'Service is unavailable. Please try again shortly.',
  'form-status-not_configured':
    'Email service not configured yet. Try again later.',
  'form-status-blocked': "We couldn't send your message right now.",
} as const;

export type EnData = typeof enData;
