import type { MessageKey, Translator } from './helpers.locale';
import { translateMarkdownSections } from './markdownSections.helpers';

export const PROJECTS_KEYS = {
  title: 'projects',
  href: 'projects-href',
} as const satisfies {
  title: MessageKey;
  href: MessageKey;
};

const PROJECT_DEFINITIONS = [
  {
    id: 'cocacola',
    titleKey: 'projects-01-cocacola-title',
    markdownKey: 'projects-01-cocacola-content',
  },
  {
    id: 'ea',
    titleKey: 'projects-02-ea-title',
    markdownKey: 'projects-02-ea-content',
  },
  {
    id: 'banq',
    titleKey: 'projects-03-banq-title',
    markdownKey: 'projects-03-banq-content',
  },
  {
    id: 'hootsuite',
    titleKey: 'projects-04-hootsuite-title',
    markdownKey: 'projects-04-hootsuite-content',
  },
  {
    id: 'kingGames',
    titleKey: 'projects-05-king-games-title',
    markdownKey: 'projects-05-king-games-content',
  },
] as const satisfies ReadonlyArray<{
  id: string;
  titleKey: MessageKey;
  markdownKey: MessageKey;
}>;

export type ProjectListItem = {
  id: string;
  title: string;
  content: string;
};

export type ProjectsCopy = {
  title: string;
  href: string;
  list: ProjectListItem[];
};

export const buildProjectsCopy = (t: Translator): ProjectsCopy => {
  return {
    title: t(PROJECTS_KEYS.title),
    href: t(PROJECTS_KEYS.href),
    list: translateMarkdownSections(t, PROJECT_DEFINITIONS).map(
      ({ id, title, content }) => ({
        id,
        title,
        content,
      }),
    ),
  };
};
