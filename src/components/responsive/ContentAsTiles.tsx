import type {
  ComponentPropsWithoutRef,
  ElementType,
  ReactNode,
} from 'react';
import clsx from 'clsx';
import Tile from '@/components/Tile';
import TileGrid from '@/components/TileGrid';
import { Markdown } from '@/components/Markdown';
import { userContent } from '@/styles/typography.css';
import Content from './Content';
import { GlassPanel } from '../GlassPanel';

type BaseProps<T extends ElementType> = {
  tag?: T;
  title?: ReactNode;
  headingDepth?: 2 | 3 | 4 | 5 | 6;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, 'className' | 'children'>;

type ContentAsTilesProps<T extends ElementType> = BaseProps<T> & {
  markdown: string;
};

type TileSlice = {
  title: string;
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
      title: currentTitle,
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
  const { tag, title, headingDepth, className, markdown, ...rest } =
    props;
  const { intro, tiles } = parseMarkdownIntoTiles(markdown);

  return (
    <Content
      tag={tag}
      title={title}
      ignoreDataUI={true}
      headingDepth={headingDepth}
      className={clsx(className)}
      {...rest}
    >
      {intro ? (
        <Markdown source={intro} className={userContent} />
      ) : null}
      {tiles.length > 0 ? (
        <TileGrid>
          {tiles.map((tile, index) => (
            <GlassPanel key={`${tile.title}-${index}`}>
              <Tile title={tile.title}>
                <Markdown source={tile.body} className={userContent} />
              </Tile>
            </GlassPanel>
          ))}
        </TileGrid>
      ) : null}
    </Content>
  );
}
