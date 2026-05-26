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

function makeTitleSvg(
  lines: ReadonlyArray<string>,
  imageWidth: number,
) {
  const lineHeight = 80;
  const fontSize = 60;
  const svgWidth = Math.round(imageWidth * 0.9);
  const height = lines.length * lineHeight;
  const centerX = svgWidth / 2;

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
          {lines.map((line, index) => (
            <tspan
              key={index}
              x={centerX}
              y={(index + 0.5) * lineHeight}
            >
              {line}
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
        const titleText = image.titleLines.join(' ');

        return BLOG_IMAGE_SIZES.map((size) => {
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
