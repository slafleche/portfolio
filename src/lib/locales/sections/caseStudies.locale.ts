import type { MessageKey, Translator } from './helpers.locale';
import { translateMarkdownSections } from './markdownSections.helpers';

export const CASE_STUDY_KEYS = {
  title: 'case_study',
  href: 'case_study-href',
} as const satisfies {
  title: MessageKey;
  href: MessageKey;
};

const CASE_STUDY_DEFINITIONS = [
  {
    titleKey: 'case-study-01-title',
    subTitleKey: 'case-study-01-subtitle',
    markdownKey: 'case-study-01-content',
  },
  {
    titleKey: 'case-study-02-title',
    subTitleKey: 'case-study-02-subtitle',
    markdownKey: 'case-study-02-content',
  },
  {
    titleKey: 'case-study-03-title',
    subTitleKey: 'case-study-03-subtitle',
    markdownKey: 'case-study-03-content',
  },
  {
    titleKey: 'case-study-04-title',
    subTitleKey: 'case-study-04-subtitle',
    markdownKey: 'case-study-04-content',
  },
  {
    titleKey: 'case-study-05-title',
    subTitleKey: 'case-study-05-subtitle',
    markdownKey: 'case-study-05-content',
  },
  {
    titleKey: 'case-study-06-title',
    subTitleKey: 'case-study-06-subtitle',
    markdownKey: 'case-study-06-content',
  },
] as const;

export const TNB_CASE_STUDY_KEYS = {
  title: 'tnb_case_study',
  href: 'tnb-case-study-href',
} as const satisfies {
  title: MessageKey;
  href: MessageKey;
};

const TNB_CASE_STUDY_DEFINITIONS = [
  {
    titleKey: 'tnb-case-study-01-title',
    subTitleKey: 'tnb-case-study-01-subtitle',
    markdownKey: 'tnb-case-study-01-content',
  },
  {
    titleKey: 'tnb-case-study-02-title',
    subTitleKey: 'tnb-case-study-02-subtitle',
    markdownKey: 'tnb-case-study-02-content',
  },
  {
    titleKey: 'tnb-case-study-03-title',
    subTitleKey: 'tnb-case-study-03-subtitle',
    markdownKey: 'tnb-case-study-03-content',
  },
  {
    titleKey: 'tnb-case-study-04-title',
    subTitleKey: 'tnb-case-study-04-subtitle',
    markdownKey: 'tnb-case-study-04-content',
  },
  {
    titleKey: 'tnb-case-study-05-title',
    subTitleKey: 'tnb-case-study-05-subtitle',
    markdownKey: 'tnb-case-study-05-content',
  },
  {
    titleKey: 'tnb-case-study-06-title',
    subTitleKey: 'tnb-case-study-06-subtitle',
    markdownKey: 'tnb-case-study-06-content',
  },
] as const;

export type CaseStudyListItem = {
  title: string;
  subTitle?: string;
  content: string;
};

export type CaseStudiesCopy = {
  title: string;
  href: string;
  intro?: string;
  list: CaseStudyListItem[];
};

export type TnbCaseStudyCopy = {
  title: string;
  href: string;
  intro?: string;
  list: CaseStudyListItem[];
};

export const buildCaseStudiesCopy = (
  t: Translator,
): CaseStudiesCopy => {
  return {
    title: t(CASE_STUDY_KEYS.title),
    href: t(CASE_STUDY_KEYS.href),
    intro: t('case-study-00-intro'),
    list: translateMarkdownSections(t, CASE_STUDY_DEFINITIONS).map(
      ({ title, content, subTitle }) => ({
        title,
        content,
        subTitle,
      }),
    ),
  };
};

export const buildTnbCaseStudyCopy = (
  t: Translator,
): TnbCaseStudyCopy => {
  return {
    title: t(TNB_CASE_STUDY_KEYS.title),
    href: t(TNB_CASE_STUDY_KEYS.href),
    intro: t('tnb-case-study-00-intro'),
    list: translateMarkdownSections(t, TNB_CASE_STUDY_DEFINITIONS).map(
      ({ title, content, subTitle }) => ({
        title,
        content,
        subTitle,
      }),
    ),
  };
};
