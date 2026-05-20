import { markdownRefs } from '../markdownRefs';

export const enCaseStudies = {
  case_study: '[wordmark:Vanilla] Case Study',
  'case_study-href': 'case_study',
  ...markdownRefs('case-study-00-intro'),
  'case-study-01-title': 'Starting as a themer',
  'case-study-01-subtitle': 'Discovering system constraints',
  ...markdownRefs('case-study-01-content'),
  'case-study-02-title': 'Building internal tooling',
  'case-study-02-subtitle': 'Eliminating repetitive styling work',
  ...markdownRefs('case-study-02-content'),
  'case-study-03-title': 'Moving to [abbr:R&D]',
  'case-study-03-subtitle':
    'Contributing to core product and architecture',
  ...markdownRefs('case-study-03-content'),
  'case-study-04-title': 'Designing token architecture',
  'case-study-04-subtitle': 'Unifying themes across products',
  ...markdownRefs('case-study-04-content'),
  'case-study-05-title': 'Adapting legacy code',
  'case-study-05-subtitle': 'Connecting Forums to modern theming',
  ...markdownRefs('case-study-05-content'),
  'case-study-06-title': 'Lessons learned',
  'case-study-06-subtitle': 'Why the third audience matters',
  ...markdownRefs('case-study-06-content'),
  tnb_case_study: '[wordmark:TNB] Case Study',
  'tnb-case-study-href': 'tnb-case-study',
  ...markdownRefs('tnb-case-study-00-intro'),
  'tnb-case-study-01-title': 'Consolidating design tokens',
  'tnb-case-study-01-subtitle': 'From many sources to one',
  ...markdownRefs('tnb-case-study-01-content'),
  'tnb-case-study-02-title': 'Tailoring AI standards',
  'tnb-case-study-02-subtitle':
    'Encoding standards into the toolchain',
  ...markdownRefs('tnb-case-study-02-content'),
  'tnb-case-study-03-title': 'Extending the CLI workflow',
  'tnb-case-study-03-subtitle':
    'Db, secrets, and deploys at the prompt',
  ...markdownRefs('tnb-case-study-03-content'),
  'tnb-case-study-04-title': 'Building inside Payload',
  'tnb-case-study-04-subtitle':
    'Admin utilities for editor workflows',
  ...markdownRefs('tnb-case-study-04-content'),
  'tnb-case-study-05-title': 'Owning the live fleet',
  'tnb-case-study-05-subtitle':
    'Patching and supporting the live fleet',
  ...markdownRefs('tnb-case-study-05-content'),
  'tnb-case-study-06-title': 'Bridging product knowledge to AI',
  'tnb-case-study-06-subtitle':
    'Teaching the AI the sister product',
  ...markdownRefs('tnb-case-study-06-content'),
} as const;
