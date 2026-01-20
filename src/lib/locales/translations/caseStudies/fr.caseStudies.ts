import { markdownRefs } from '../markdownRefs';

export const frCaseStudies = {
  case_study: 'Mon parcours chez [wordmark:Vanilla]',
  'case_study-href': 'etudes-de-cas',
  ...markdownRefs('case-study-00-intro'),
  'case-study-01-title': 'Débuter comme intégrateur de thèmes',
  'case-study-01-subtitle': 'Découvrir les contraintes du système',
  ...markdownRefs('case-study-01-content'),
  'case-study-02-title': 'Construire des outils internes',
  'case-study-02-subtitle':
    'Éliminer les tâches de stylage répétitives',
  ...markdownRefs('case-study-02-content'),
  'case-study-03-title': 'Passer en [abbr:R&D]',
  'case-study-03-subtitle':
    'Contribuer au produit et à son architecture',
  ...markdownRefs('case-study-03-content'),
  'case-study-04-title': 'Concevoir une architecture de tokens',
  'case-study-04-subtitle': 'Unifier les thèmes entre les produits',
  ...markdownRefs('case-study-04-content'),
  'case-study-05-title': 'Adapter le code legacy',
  'case-study-05-subtitle': 'Connecter les forums au théming moderne',
  ...markdownRefs('case-study-05-content'),
  'case-study-06-title': 'Leçons retenues',
  'case-study-06-subtitle':
    'Des systèmes au service des designers, développeurs et usagers',
  ...markdownRefs('case-study-06-content'),
} as const;
