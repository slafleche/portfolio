import clsx from 'clsx';
import type {
  ComponentPropsWithoutRef,
  ElementType,
  ReactNode,
} from 'react';

import { Markdown } from '@/components/Markdown';
import Tile from '@/components/Tile';
import TileGrid from '@/components/TileGrid';
import * as tileStyles from '@/styles/components/tiles.css';
import { userContent } from '@/styles/typography.css';

import { GlassPanel } from '../GlassPanel';
import ContentWithTitle from './ContentWithTitle';

type BaseProps<T extends ElementType> = {
  tag?: T;
  contentTitle?: ReactNode;
  headingDepth?: 2 | 3 | 4 | 5 | 6;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, 'className' | 'children'>;

type ContentAsTilesProps<T extends ElementType> = BaseProps<T> & {
  markdown: string;
};

type TileSlice = {
  contentTitle: string;
  body: string;
};

type ParsedMarkdown = {
  intro: string | null;
  tiles: TileSlice[];
};

function parseMarkdownIntoTiles(markdown: string): ParsedMarkdown {
  const lines = markdown.split(/\r?\n/);
  const introLines: string[] = [];
  const tiles: TileSlice[] = [];

  let currentTitle: string | null = null;
  let currentBodyLines: string[] = [];

  const flushCurrentTile = () => {
    if (!currentTitle) return;
    const body = currentBodyLines.join('\n').trim();
    tiles.push({
      contentTitle: currentTitle,
      body,
    });
  };

  for (const line of lines) {
    if (line.startsWith('### ')) {
      flushCurrentTile();
      currentTitle = line.slice(4).trim();
      currentBodyLines = [];
      continue;
    }

    if (currentTitle) {
      currentBodyLines.push(line);
    } else {
      introLines.push(line);
    }
  }

  flushCurrentTile();

  const intro = introLines.join('\n').trim();

  return {
    intro: intro.length > 0 ? intro : null,
    tiles,
  };
}

export default function ContentAsTiles<
  T extends ElementType = 'section',
>(props: ContentAsTilesProps<T>) {
  const {
    tag,
    contentTitle,
    headingDepth,
    className,
    markdown,
    ...rest
  } = props;
  const { intro, tiles } = parseMarkdownIntoTiles(markdown);

  return (
    <ContentWithTitle
      tag={tag}
      contentTitle={contentTitle}
      ignoreDataUI={true}
      headingDepth={headingDepth}
      className={clsx(className)}
      queryDataAttributes={{
        compact: 'no-padding',
      }}
      {...rest}
    >
      {intro ? (
        <Markdown
          source={intro}
          className={clsx(userContent, tileStyles.intro)}
        />
      ) : null}
      {tiles.length > 0 ? (
        <TileGrid>
          {tiles.map((tile, index) => (
            <GlassPanel
              key={`${tile.contentTitle}-${index}`}
              className={tileStyles.tilePanel}
              surfaceClassName={tileStyles.tilePanelSurface}
            >
              <Tile contentTitle={tile.contentTitle}>
                <Markdown
                  source={tile.body}
                  className={userContent}
                />
              </Tile>
            </GlassPanel>
          ))}
        </TileGrid>
      ) : null}
    </ContentWithTitle>
  );
}
