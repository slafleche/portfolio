import type { CSSProperties, SVGProps } from 'react';

import Hero from '@/components/Hero';
import ShareImageHeroBg from '@/components/ShareImageHeroBg';
import * as s from '@/styles/components/blogImages.css';
import * as heroStyles from '@/styles/components/hero.css';

const BLOG_IMAGE_SIZES = [
  { width: 1200, height: 630, label: 'LinkedIn' },
  { width: 1000, height: 420, label: 'dev.to' },
] as const;

const BLOG_IMAGES = [
  {
    id: 'no-css-frameworks',
    titleLines: [
      "We still don't have proper",
      'CSS frameworks',
    ],
  },
  {
    id: 'compiled-typed-css',
    titleLines: [
      'The case for compiled,',
      'typed CSS (blame AI)',
    ],
  },
  {
    id: 'save-handedness',
    titleLines: [
      'Most of the web is touch.',
      '[br]',
      "We still don't save handedness.",
    ],
  },
  {
    id: 'save-handedness-linkedin',
    titleLines: [
      "The web's most ignored preference:",
      '[br]',
      'your hand.',
    ],
    sizes: ['1200x630'],
  },
  {
    id: 'css-frameworks-fashion',
    titleLines: [
      'CSS frameworks are all fashion,',
      'no foundation',
    ],
  },
  {
    id: 'dreamweaver-mistake',
    titleLines: [
      "We're making the Dreamweaver mistake again,",
      'on purpose this time',
    ],
    fontSize: 40,
  },
  {
    id: 'figma-design-tokens',
    titleLines: [
      "Even Figma isn't sure about",
      'its own design tokens',
    ],
  },
  {
    id: 'missing-middle',
    titleLines: [
      'The messy missing middle:',
      'charting a better path from',
      'design to AI-generated code',
    ],
    fontSize: 54,
  },
  {
    id: 'illusion-of-stability',
    titleLines: [
      '_The illusion of stability:_',
      'Figma-to-code pipelines are repeating',
      'the same mistakes we made with *Flash*',
    ],
    fontSize: 42,
  },
  {
    id: 'shaky-foundation',
    titleLines: [
      'Figma-to-code: even the best ones',
      'hit a wall on a shaky foundation',
    ],
    fontSize: 48,
  },
  {
    id: 'real-shift',
    titleLines: [
      'Figma-to-code:',
      '[br]',
      'the real _shift_ happening',
    ],
    fontSize: 56,
  },
  {
    id: 'hits-a-wall',
    titleLines: [
      'Where design-to-code hits a wall',
    ],
    fontSize: 48,
  },
] as const;

const BG_TRANSFORMS = {
  roundedTransform: {
    translateXPercent: 12,
    translateYPercent: 0,
    rotationDeg: -5,
    scale: 1,
  },
  nubbyTransform: {
    translateXPercent: -20,
    translateYPercent: -5,
    rotationDeg: 10,
    scale: 1,
  },
} as const;

// Use '[br]' as a titleLines entry to insert a paragraph gap between lines
// instead of a full blank text line.
const TITLE_BREAK_MARKER = '[br]';

const DEFAULT_TITLE_FONT_SIZE = 60;

// A per-image `fontSize` override is interpreted at this reference width
// (the LinkedIn size) and scaled proportionally for narrower sizes.
const TITLE_REFERENCE_WIDTH = 1200;

// How much larger a *bold* emphasis word renders than the base size. The
// headless render's system font may not distinguish 700 from 900, so size is
// what actually makes the word read as emphasized.
const BOLD_EMPHASIS_SCALE = 1.22;

// Inline markup inside a title line:
//   *word*  -> bold emphasis (bigger + weight 900, against the 700 default)
//   _text_  -> italic
type TitleSegment = { text: string; bold?: boolean; italic?: boolean };

const TITLE_MARKUP_REGEX = /(\*[^*]+\*|_[^_]+_)/g;

function parseTitleLine(line: string): TitleSegment[] {
  const segments: TitleSegment[] = [];
  let lastIndex = 0;
  for (const match of line.matchAll(TITLE_MARKUP_REGEX)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      segments.push({ text: line.slice(lastIndex, index) });
    }
    const token = match[0];
    if (token.startsWith('*')) {
      segments.push({ text: token.slice(1, -1), bold: true });
    } else {
      segments.push({ text: token.slice(1, -1), italic: true });
    }
    lastIndex = index + token.length;
  }
  if (lastIndex < line.length) {
    segments.push({ text: line.slice(lastIndex) });
  }
  return segments.length > 0 ? segments : [{ text: line }];
}

function stripTitleMarkup(line: string): string {
  return line.replace(/[*_]/g, '');
}

function makeTitleSvg(
  lines: ReadonlyArray<string>,
  imageWidth: number,
  fontSize: number = DEFAULT_TITLE_FONT_SIZE,
) {
  const scale = fontSize / DEFAULT_TITLE_FONT_SIZE;
  const lineHeight = 80 * scale;
  const breakGap = 36 * scale;
  const svgWidth = Math.round(imageWidth * 0.9);
  const centerX = svgWidth / 2;

  let cursor = 0;
  const positionedLines: Array<{ text: string; y: number }> = [];
  for (const line of lines) {
    if (line === TITLE_BREAK_MARKER) {
      cursor += breakGap;
      continue;
    }
    positionedLines.push({ text: line, y: cursor + lineHeight / 2 });
    cursor += lineHeight;
  }
  const height = cursor;

  function BlogImageTitleSvg(props: SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        viewBox={`0 0 ${svgWidth} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={fontSize}
          fontWeight={700}
          fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
          fill="#ffffff"
        >
          {positionedLines.map((line, index) => (
            <tspan
              key={index}
              x={centerX}
              y={line.y}
            >
              {parseTitleLine(line.text).map((seg, segIndex) => (
                <tspan
                  key={segIndex}
                  fontSize={seg.bold ? fontSize * BOLD_EMPHASIS_SCALE : undefined}
                  fontWeight={seg.bold ? 900 : undefined}
                  fontStyle={seg.italic ? 'italic' : undefined}
                >
                  {seg.text}
                </tspan>
              ))}
            </tspan>
          ))}
        </text>
      </svg>
    );
  }

  return BlogImageTitleSvg;
}

export default function BlogImagesDebugPage() {
  return (
    <div className={s.debugRoot}>
      {BLOG_IMAGES.map((image) => {
        const titleText = image.titleLines
          .filter((line) => line !== TITLE_BREAK_MARKER)
          .map(stripTitleMarkup)
          .join(' ');

        const allowedSizes: readonly string[] | null =
          'sizes' in image ? image.sizes : null;

        return BLOG_IMAGE_SIZES.filter(
          (size) =>
            !allowedSizes ||
            allowedSizes.includes(`${size.width}x${size.height}`),
        ).map((size) => {
          const sizeLabel = `${size.width}x${size.height}`;
          // A per-image `fontSize` is specified at the reference width and
          // scaled by this size's width, so every size fills the same
          // fraction of the frame (consistent side padding across sizes).
          const fontSize =
            'fontSize' in image
              ? image.fontSize * (size.width / TITLE_REFERENCE_WIDTH)
              : undefined;
          const TitleSvg = makeTitleSvg(
            image.titleLines,
            size.width,
            fontSize,
          );
          const viewportStyle = {
            width: `${size.width}px`,
            height: `${size.height}px`,
          } as CSSProperties;

          return (
            <div key={`${image.id}-${sizeLabel}`}>
              <p className={s.debugLabel}>
                {image.id} - {sizeLabel} ({size.label})
              </p>
              <div
                className={s.viewport}
                data-target="blog-image-viewport"
                data-id={image.id}
                data-size={sizeLabel}
                style={viewportStyle}
              >
                <Hero
                  className={s.heroOverride}
                  mainClassName={heroStyles.blogMain}
                  copy={{
                    title: titleText,
                    ctaLabel: '',
                    ctaText: '',
                  }}
                  TitleSvg={TitleSvg}
                  Bg={(props) => (
                    <ShareImageHeroBg
                      {...props}
                      roundedTransform={BG_TRANSFORMS.roundedTransform}
                      nubbyTransform={BG_TRANSFORMS.nubbyTransform}
                    />
                  )}
                  hideCta={true}
                  hideSubtitle={true}
                  hideWaypoint={true}
                />
              </div>
            </div>
          );
        });
      })}
    </div>
  );
}
