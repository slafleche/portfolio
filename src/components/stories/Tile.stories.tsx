import type { Meta, StoryObj } from '@storybook/react';

import ContentAsTiles from '@/components/responsive/ContentAsTiles';
import * as g from '@/dev/storybook/gallery.css';
import { createSectionTranslator } from '@/lib/locales/sections/helpers.locale';
import en from '@/lib/locales/translations/en';
import {
  contentAsMockCode,
  contentAsMockCodeIntro,
  contentAsMockCodeTitle,
} from '@/styles/components/code.css';

const t = createSectionTranslator(en, en);

type TileSlice = {
  title: string;
  body: string;
};

function extractFirstTileFromMarkdown(markdown: string): {
  tile: TileSlice | null;
} {
  const lines = markdown.split(/\r?\n/);

  let tileTitle: string | null = null;
  const tileBodyLines: string[] = [];
  let inFirstTile = false;

  for (const line of lines) {
    if (line.startsWith('### ')) {
      if (!inFirstTile) {
        tileTitle = line.slice(4).trim();
        inFirstTile = true;
        continue;
      }
      break;
    }

    if (inFirstTile) {
      tileBodyLines.push(line);
    }
  }

  if (!tileTitle) {
    return {
      tile: null,
    };
  }

  return {
    tile: {
      title: tileTitle,
      body: tileBodyLines.join('\n').trim(),
    },
  };
}

function buildSingleTileMarkdown(markdown: string): string {
  const { tile } = extractFirstTileFromMarkdown(markdown);
  if (!tile) return markdown;

  return [
    `### ${tile.title}`,
    tile.body,
  ]
    .filter(Boolean)
    .join('\n\n')
    .trim();
}

const architectureMarkdown = t('architecture-content');
const oneTileArchitectureMarkdown = buildSingleTileMarkdown(
  architectureMarkdown,
);

const meta: Meta<typeof ContentAsTiles> = {
  title: 'Components/Tile',
  component: ContentAsTiles,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof ContentAsTiles>;

export const Default: Story = {
  name: 'Default',
  render: () => (
    <div className={g.root}>
      <ContentAsTiles
        id="storybook-architecture-tile"
        markdown={oneTileArchitectureMarkdown}
        titleClassName={contentAsMockCodeTitle}
        introClassName={contentAsMockCodeIntro}
        bgOffset={5}
        rotateOffset={1}
        scaleOffset={4}
        translateOffset={3}
        className={contentAsMockCode}
        data-query-all="no-margin"
        data-query-compact="no-padding-no-margin"
      />
    </div>
  ),
};

