import type { Decorator, Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';

import ContentAsTiles from '@/components/responsive/ContentAsTiles';
import {
  __forceReducedMotion,
  __setStorybookPathname,
} from '@/dev/storybook/nextNavigationShim';
import { defaultViewports } from '@/dev/storybookConfig';
import { createSectionTranslator } from '@/lib/locales/sections/helpers.locale';
import en from '@/lib/locales/translations/en';
import fr from '@/lib/locales/translations/fr';
import {
  contentAsMockCode,
  contentAsMockCodeTitle,
} from '@/styles/components/code.css';

const t = createSectionTranslator(en, en);
const tFr = createSectionTranslator(fr, en);

const architectureEn = {
  id: t('systems-architecture-href'),
  title: t('systems-architecture'),
  markdown: t('systems-architecture-content'),
};

const architectureFr = {
  id: tFr('systems-architecture-href'),
  title: tFr('systems-architecture'),
  markdown: tFr('systems-architecture-content'),
};

function GlobalStyleOverrides() {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = [
      '* { animation: none !important; transition: none !important; }',
    ].join('\n');
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, []);
  return null;
}

function withLocaleEnvironment(pathname: string): Decorator {
  return function WithLocaleEnvironmentDecorator(Story) {
    const restoreReducedMotion = (() => {
      __setStorybookPathname(pathname);
      return __forceReducedMotion();
    })();

    function LocaleDecorator() {
      useEffect(() => restoreReducedMotion, []);
      return (
        <>
          <GlobalStyleOverrides />
          <Story />
        </>
      );
    }

    return <LocaleDecorator />;
  };
}

type ContentAsTilesSectionProps = {
  id: string;
  title: string;
  markdown: string;
};

function ContentAsTilesSection({
  id,
  title,
  markdown,
}: ContentAsTilesSectionProps) {
  return (
    <ContentAsTiles
      id={id}
      title={title}
      markdown={markdown}
      titleClassName={contentAsMockCodeTitle}
      bgOffset={5}
      rotateOffset={1}
      scaleOffset={4}
      translateOffset={3}
      className={contentAsMockCode}
      data-query-all="no-margin"
      data-query-compact="no-padding-no-margin"
    />
  );
}

const meta: Meta<typeof ContentAsTilesSection> = {
  title: 'Sections/ContentAsTiles',
  component: ContentAsTilesSection,
  parameters: {
    layout: 'fullscreen',
    chromatic: { viewports: defaultViewports },
  },
};

export default meta;

type Story = StoryObj<typeof ContentAsTilesSection>;

export const ArchitectureEn: Story = {
  name: 'Architecture Tiles (EN)',
  decorators: [
    withLocaleEnvironment('/en/systems'),
  ],
  render: () => <ContentAsTilesSection {...architectureEn} />,
};

export const ArchitectureFr: Story = {
  name: 'Architecture Tiles (FR)',
  decorators: [
    withLocaleEnvironment('/fr/systems'),
  ],
  render: () => <ContentAsTilesSection {...architectureFr} />,
};
