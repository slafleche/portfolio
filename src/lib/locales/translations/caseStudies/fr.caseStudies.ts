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
  'case-study-05-subtitle':
    'Connecter les forums à la thématisation moderne',
  ...markdownRefs('case-study-05-content'),
  'case-study-06-title': 'Leçons retenues',
  'case-study-06-subtitle': 'Pourquoi la troisième audience compte',
  ...markdownRefs('case-study-06-content'),
  tnb_case_study: 'Mon travail chez [wordmark:TNB]',
  'tnb-case-study-href': 'tnb-etude-de-cas',
  ...markdownRefs('tnb-case-study-00-intro'),
  'tnb-case-study-01-title': 'Consolider les design tokens',
  'tnb-case-study-01-subtitle': 'De plusieurs sources à une seule',
  ...markdownRefs('tnb-case-study-01-content'),
  'tnb-case-study-02-title': 'Adapter les standards IA',
  'tnb-case-study-02-subtitle':
    'Encoder les standards dans l’outillage',
  ...markdownRefs('tnb-case-study-02-content'),
  'tnb-case-study-03-title': 'Étendre le workflow CLI',
  'tnb-case-study-03-subtitle':
    'BD, secrets et déploiements en ligne de commande',
  ...markdownRefs('tnb-case-study-03-content'),
  'tnb-case-study-04-title': 'Construire à l’intérieur de Payload',
  'tnb-case-study-04-subtitle':
    'Utilitaires admin pour les workflows éditeur',
  ...markdownRefs('tnb-case-study-04-content'),
  'tnb-case-study-05-title': 'Gérer la flotte en production',
  'tnb-case-study-05-subtitle':
    'Correctifs et soutien pour la flotte',
  ...markdownRefs('tnb-case-study-05-content'),
  'tnb-case-study-06-title':
    'Connecter la connaissance produit à l’IA',
  'tnb-case-study-06-subtitle':
    'Initier l’IA au produit affilié',
  ...markdownRefs('tnb-case-study-06-content'),
} as const;
