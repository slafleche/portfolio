import type { MessageKey, Translator } from './helpers.locale';
export const PROJECTS_KEYS = {
  title: 'projects',
  href: 'projects-href',
} as const satisfies {
  title: MessageKey;
  href: MessageKey;
};

type ProjectDefinition = {
  titleKey: MessageKey;
  markdownKey: MessageKey;
};

const PROJECT_DEFINITIONS = {
  cocacola: {
    titleKey: 'projects-01-cocacola-title',
    markdownKey: 'projects-01-cocacola-content',
  },
  ea: {
    titleKey: 'projects-02-ea-title',
    markdownKey: 'projects-02-ea-content',
  },
  banq: {
    titleKey: 'projects-03-banq-title',
    markdownKey: 'projects-03-banq-content',
  },
  hootsuite: {
    titleKey: 'projects-04-hootsuite-title',
    markdownKey: 'projects-04-hootsuite-content',
  },
  kingGames: {
    titleKey: 'projects-05-king-games-title',
    markdownKey: 'projects-05-king-games-content',
  },
} as const satisfies Record<string, ProjectDefinition>;

export type ProjectId = keyof typeof PROJECT_DEFINITIONS;

export type ProjectListItem = {
  id: ProjectId;
  title: string;
  content: string;
};

export type ProjectsItems = {
  [Key in ProjectId]: ProjectListItem;
};

export type ProjectsCopy = {
  title: string;
  href: string;
  items: ProjectsItems;
};

const buildProjectItems = (t: Translator): ProjectsItems => {
  return (
    Object.entries(PROJECT_DEFINITIONS) as [
      ProjectId,
      ProjectDefinition,
    ][]
  ).reduce<ProjectsItems>((acc, [id, definition]) => {
    acc[id] = {
      id,
      title: t(definition.titleKey),
      content: t(definition.markdownKey),
    };
    return acc;
  }, {} as ProjectsItems);
};

export const buildProjectsCopy = (t: Translator): ProjectsCopy => {
  return {
    title: t(PROJECTS_KEYS.title),
    href: t(PROJECTS_KEYS.href),
    items: buildProjectItems(t),
  };
};
