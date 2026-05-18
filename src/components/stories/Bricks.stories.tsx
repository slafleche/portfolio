import type { Decorator, Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';

import type { BrickData } from '@/components/Brick';
import Bricks from '@/components/Bricks';
import {
  __forceReducedMotion,
  __setStorybookPathname,
} from '@/dev/storybook/nextNavigationShim';
import { defaultViewports } from '@/dev/storybookConfig';
import {
  type BricksCopy,
  buildBricksCopy,
} from '@/lib/locales/sections/bricks.locale';
import { createSectionTranslator } from '@/lib/locales/sections/helpers.locale';
import en from '@/lib/locales/translations/en';
import fr from '@/lib/locales/translations/fr';
import * as layoutStyles from '@/styles/layout.css';

import Content from '../responsive/Content';

const t = createSectionTranslator(en, en);
const tFr = createSectionTranslator(fr, en);

const bricksEn = buildBricksCopy(t);
const bricksFr = buildBricksCopy(tFr);

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

const toBrickData = (item: {
  title: string;
  content: string;
}): BrickData => ({
  title: item.title,
  body: item.content,
});

type BricksSectionProps = {
  copy: BricksCopy;
};

function BricksSection({ copy }: BricksSectionProps) {
  const hero = toBrickData(copy.hero);
  const items = Object.values(copy.items).map(toBrickData);

  return (
    <section className={layoutStyles.sectionSpacing}>
      <Content tag="div" ignoreBottomMargin={true}>
        <Bricks hero={hero} items={items} />
      </Content>
    </section>
  );
}

const meta: Meta<typeof BricksSection> = {
  title: 'Components/Bricks',
  component: BricksSection,
  parameters: {
    layout: 'fullscreen',
    chromatic: {
      viewports: defaultViewports,
      pauseAnimationAtEnd: true,
    },
  },
};

export default meta;

type Story = StoryObj<typeof BricksSection>;

export const En: Story = {
  name: 'Bricks (EN)',
  decorators: [withLocaleEnvironment('/en')],
  render: () => <BricksSection copy={bricksEn} />,
};

export const Fr: Story = {
  name: 'Bricks (FR)',
  decorators: [withLocaleEnvironment('/fr')],
  render: () => <BricksSection copy={bricksFr} />,
};
