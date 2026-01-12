import clsx from 'clsx';
import { type IMeasurement, m, mDeg } from 'css-calipers';
import type {
  ComponentPropsWithoutRef,
  ElementType,
  ReactNode,
} from 'react';

import SoftTriangleIcon from '@/components/icons/SoftTriangleIcon';
import { Markdown } from '@/components/Markdown';
import Tile from '@/components/Tile';
import TileGrid from '@/components/TileGrid';
import * as tileStyles from '@/styles/components/tiles.css';
import { userContent } from '@/styles/typography.css';

import { transformValue } from '../../styles/helpers/transforms.helper';
import ContentWithTitle from './ContentWithTitle';

type RandomizeBg = {
  bgOffset?: number;
  rotateOffset?: number;
  scaleOffset?: number;
  translateOffset?: number;
};

type BaseProps<T extends ElementType> = {
  tag?: T;
  contentTitle?: ReactNode;
  headingDepth?: 2 | 3 | 4 | 5 | 6;
  className?: string;
  randomizedBg?: RandomizeBg;
  bgOffset?: number;
  rotateOffset?: number;
  scaleOffset?: number;
  translateOffset?: number;
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
    randomizedBg,
    bgOffset,
    rotateOffset,
    scaleOffset,
    translateOffset,
    ...rest
  } = props;
  const { intro, tiles } = parseMarkdownIntoTiles(markdown);

  const {
    bgOffset: randomizedBgOffset,
    rotateOffset: randomizedRotateOffset,
    scaleOffset: randomizedScaleOffset,
    translateOffset: randomizedTranslateOffset,
  } = randomizedBg ?? {};
  const resolvedBgOffset = bgOffset ?? randomizedBgOffset ?? 0;
  const resolvedRotateOffset =
    rotateOffset ?? randomizedRotateOffset ?? 0;
  const resolvedScaleOffset =
    scaleOffset ?? randomizedScaleOffset ?? 0;
  const resolvedTranslateOffset =
    translateOffset ?? randomizedTranslateOffset ?? 0;

  const transformValues = {
    rotate: [
      mDeg(12),
      mDeg(47),
      mDeg(89),
      mDeg(134),
      mDeg(176),
      mDeg(213),
      mDeg(258),
      mDeg(301),
      mDeg(329),
      mDeg(357),
    ],
    scale: [
      2,
      1.8,
      -1.6,
      1.7,
      -1.8,
      1.6,
      -1.7,
      2.1,
    ],
    translateOffset: [
      {
        x: m(9),
        y: m(-18),
      },
      {
        x: m(-12),
        y: m(-22),
      },
      {
        x: m(15),
        y: m(-14),
      },
      {
        x: m(-8),
        y: m(-20),
      },
      {
        x: m(11),
        y: m(16),
      },
      {
        x: m(-14),
        y: m(12),
      },
    ],
  };

  const getTranslationFromOffset = (i: number) => {
    const size = transformValues.translateOffset.length;
    return transformValues.translateOffset[
      (i + resolvedTranslateOffset) % size
    ];
  };

  const getRotationFromOffset = (i: number) => {
    const size = transformValues.rotate.length;
    return transformValues.rotate[(i + resolvedRotateOffset) % size];
  };

  const getScaleFromOffset = (i: number) => {
    const size = transformValues.scale.length;
    return transformValues.scale[(i + resolvedScaleOffset) % size];
  };

  const isOddNumberOfTiles = tiles.length % 2 === 1;

  return (
    <ContentWithTitle
      tag={tag}
      contentTitle={contentTitle}
      ignoreDataUI={true}
      headingDepth={headingDepth}
      className={className}
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
          {tiles.map((tile, index) => {
            const tileA = (index + resolvedBgOffset) % 4 === 0;
            const tileB = (index + resolvedBgOffset) % 4 === 1;
            const tileC = (index + resolvedBgOffset) % 4 === 2;
            const tileD = (index + resolvedBgOffset) % 4 === 3;
            const isLastTile = index === tiles.length - 1;
            const shouldSpanColumns =
              isOddNumberOfTiles && isLastTile;

            const translation = getTranslationFromOffset(index);
            const rotation = getRotationFromOffset(index);
            const scale = getScaleFromOffset(index);

            const transform = transformValue({
              translate: { x: translation.x, y: translation.y },
              rotate: { value: rotation },
              scale: { xy: scale },
            });

            return (
              <Tile
                key={`${tile.contentTitle}-${index}`}
                contentTitle={tile.contentTitle}                
                className={clsx(tileStyles.tilePanel, {
                  [tileStyles.tileA]: tileA,
                  [tileStyles.tileB]: tileB,
                  [tileStyles.tileC]: tileC,
                  [tileStyles.tileD]: tileD,
                  [tileStyles.span2]: isOddNumberOfTiles && isLastTile,
                })}
                bgOverlay={
                  <SoftTriangleIcon
                    className={tileStyles.bgDecoration}
                    aria-hidden="true"
                    style={{ transform }}
                  />
                }
              >
                <Markdown
                  source={tile.body}
                  className={userContent}
                />
              </Tile>
            );
          })}
        </TileGrid>
      ) : null}
    </ContentWithTitle>
  );
}
