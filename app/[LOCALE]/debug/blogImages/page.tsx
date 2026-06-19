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

function makeTitleSvg(
  lines: ReadonlyArray<string>,
  imageWidth: number,
) {
  const lineHeight = 80;
  const breakGap = 36;
  const fontSize = 60;
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
              {line.text}
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
          .join(' ');

        const allowedSizes: readonly string[] | null =
          'sizes' in image ? image.sizes : null;

        return BLOG_IMAGE_SIZES.filter(
          (size) =>
            !allowedSizes ||
            allowedSizes.includes(`${size.width}x${size.height}`),
        ).map((size) => {
          const sizeLabel = `${size.width}x${size.height}`;
          const TitleSvg = makeTitleSvg(image.titleLines, size.width);
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
