import type { Decorator, Meta, StoryObj } from '@storybook/react';
import { clsx } from 'clsx';
import { useEffect } from 'react';

import Card from '@/components/Card';
import { Column, Grid } from '@/components/Grid';
import WordMarkInTitle from '@/components/WordmarkInTitle';
import {
  BQWordmark,
  CCWordmark,
  EAWordmark,
  HSWordmark,
  KGWordmark,
} from '@/components/wordmarks/wordmarks';
import {
  __forceReducedMotion,
  __setStorybookPathname,
} from '@/dev/storybook/nextNavigationShim';
import { defaultViewports } from '@/dev/storybookConfig';
import { createSectionTranslator } from '@/lib/locales/sections/helpers.locale';
import { buildProjectsCopy } from '@/lib/locales/sections/projects.locale';
import en from '@/lib/locales/translations/en';
import fr from '@/lib/locales/translations/fr';
import * as cg from '@/styles/components/card.css';
import * as layoutStyles from '@/styles/layout.css';

import Heading from '../Heading';
import { Markdown } from '../Markdown';
import Content from '../responsive/Content';

const t = createSectionTranslator(en, en);
const tFr = createSectionTranslator(fr, en);

const projectsEn = buildProjectsCopy(t);
const projectsFr = buildProjectsCopy(tFr);

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

type ProjectsSectionProps = {
  copy: typeof projectsEn;
};

function ProjectsSection({ copy }: ProjectsSectionProps) {
  const { cocacola, ea, banq, hootsuite, kingGames } = copy.items;

  return (
    <section className={layoutStyles.sectionSpacing}>
      <Content tag="div" ignoreBottomMargin={true}>
        <Heading id={copy.href} ignoreDataUI={true}>
          {copy.title}
        </Heading>
      </Content>

      <Grid>
        <Column span={2}>
          <Card
            className={cg.cardCC}
            gradientClassName={cg.gradientCC}
            title={
              <WordMarkInTitle
                WordMark={CCWordmark}
                textTemplate={cocacola.title}
                textClassName={cg.wordmarkTextNoLogo}
              />
            }
            logoAsBg={
              <CCWordmark
                className={clsx(cg.logoAsBgSVG, cg.logoAsBg_cc)}
              />
            }
          >
            <Markdown source={cocacola.content} />
          </Card>
        </Column>
        <Column span={2}>
          <Card
            className={cg.cardEa}
            gradientClassName={cg.gradientEa}
            title={
              <WordMarkInTitle
                WordMark={EAWordmark}
                textTemplate={ea.title}
                textClassName={cg.wordmarkTextNoLogo}
              />
            }
            logoAsBg={
              <EAWordmark
                className={clsx(cg.logoAsBgSVG, cg.logoAsBg_ea)}
              />
            }
          >
            <Markdown source={ea.content} />
          </Card>
        </Column>
        <Column
          span={1}
          mediaQuerySpan={{
            underMinWidth: 2,
          }}
        >
          <Card
            className={cg.cardBanq}
            gradientClassName={cg.gradientBanq}
            title={
              <WordMarkInTitle
                WordMark={BQWordmark}
                textTemplate={banq.title}
                textClassName={cg.wordmarkTextNoLogo}
              />
            }
            logoAsBg={
              <BQWordmark
                className={clsx(cg.logoAsBgSVG, cg.logoAsBg_banq)}
              />
            }
          >
            <Markdown source={banq.content} />
          </Card>
        </Column>
        <Column
          span={1}
          mediaQuerySpan={{
            underMinWidth: 2,
          }}
        >
          <Card
            className={cg.cardHs}
            gradientClassName={cg.gradientHs}
            title={
              <WordMarkInTitle
                WordMark={HSWordmark}
                textTemplate={hootsuite.title}
                textClassName={cg.wordmarkTextNoLogo}
              />
            }
            logoAsBg={
              <HSWordmark
                className={clsx(cg.logoAsBgSVG, cg.logoAsBg_hs)}
              />
            }
          >
            <Markdown source={hootsuite.content} />
          </Card>
        </Column>
        <Column
          span={2}
          mediaQuerySpan={{
            compact: 1,
          }}
        >
          <Card
            className={cg.cardKg}
            gradientClassName={cg.gradientKg}
            title={
              <WordMarkInTitle
                WordMark={KGWordmark}
                textTemplate={kingGames.title}
                textClassName={cg.wordmarkTextNoLogo}
              />
            }
            logoAsBg={
              <KGWordmark
                className={clsx(cg.logoAsBgSVG, cg.logoAsBg_kg)}
              />
            }
          >
            <Markdown source={kingGames.content} />
          </Card>
        </Column>
      </Grid>
    </section>
  );
}

const meta: Meta<typeof ProjectsSection> = {
  title: 'Sections/Projects',
  component: ProjectsSection,
  parameters: {
    layout: 'fullscreen',
    chromatic: {
      viewports: defaultViewports,
      pauseAnimationAtEnd: true,
    },
  },
};

export default meta;

type Story = StoryObj<typeof ProjectsSection>;

export const En: Story = {
  name: 'Projects (EN)',
  decorators: [
    withLocaleEnvironment('/en'),
  ],
  render: () => <ProjectsSection copy={projectsEn} />,
};

export const Fr: Story = {
  name: 'Projects (FR)',
  decorators: [
    withLocaleEnvironment('/fr'),
  ],
  render: () => <ProjectsSection copy={projectsFr} />,
};
