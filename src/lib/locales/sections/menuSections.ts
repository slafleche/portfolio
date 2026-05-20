import type { Translator } from './helpers.locale';

export type MenuSection = {
  id: string;
  label: string;
};

export const buildHomeMenuSections = (
  t: Translator,
): MenuSection[] => [
  {
    id: t('approach-href'),
    label: t('approach'),
  },
  {
    id: t('about-href'),
    label: t('about'),
  },
  {
    id: t('case_study-href'),
    label: t('case_study'),
  },
  {
    id: t('projects-href'),
    label: t('projects'),
  },
  {
    id: 'contact',
    label: t('contact'),
  },
];

export const buildSystemsMenuSections = (
  t: Translator,
): MenuSection[] => [
  {
    id: t('systems-intro-href'),
    label: t('systems-title'),
  },
  {
    id: t('systems-intro-title'),
    label: t('systems-intro-title'),
  },
  {
    id: t('systems-principles-href'),
    label: t('systems-principles'),
  },
  {
    id: t('systems-architecture-href'),
    label: t('systems-architecture'),
  },
  {
    id: 'contact',
    label: t('contact'),
  },
];
