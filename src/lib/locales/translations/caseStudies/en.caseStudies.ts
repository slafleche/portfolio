import { markdownRefs } from '../markdownRefs';

export const enCaseStudies = {
  case_study: 'Case Study',
  'case_study-href': 'case_study',
  ...markdownRefs('case-study-00-intro'),
  'case-study-01-title': 'Starting as a themer',
  'case-study-01-subtitle': 'discovering system constraints',
  ...markdownRefs('case-study-01-content'),
  'case-study-02-title': 'Building internal tooling',
  'case-study-02-subtitle': 'eliminating repetitive styling work',
  ...markdownRefs('case-study-02-content'),
  'case-study-03-title': 'Moving to [abbr:R&D]',
  'case-study-03-subtitle':
    'contributing to core product and architecture',
  ...markdownRefs('case-study-03-content'),
  'case-study-04-title': 'Adapting legacy code',
  'case-study-04-subtitle': 'connecting Forums to modern theming',
  ...markdownRefs('case-study-04-content'),
  'case-study-05-title': 'Designing token architecture',
  'case-study-05-subtitle': 'unifying themes across products',
  ...markdownRefs('case-study-05-content'),
  'case-study-06-title': 'Lessons learned',
  'case-study-06-subtitle':
    'systems that serve designers, developers, and users',
  ...markdownRefs('case-study-06-content'),
} as const;
