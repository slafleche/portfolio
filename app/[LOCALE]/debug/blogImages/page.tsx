import type { CSSProperties, SVGProps } from 'react';

import Hero from '@/components/Hero';
import ShareImageHeroBg from '@/components/ShareImageHeroBg';
import * as s from '@/styles/components/blogImages.css';
import * as heroStyles from '@/styles/components/hero.css';

const BLOG_IMAGE_WIDTH = 1000;
const BLOG_IMAGE_HEIGHT = 420;

const BLOG_IMAGES = [
  {
    id: 'no-css-frameworks',
    titleLines: [
      "We still don't have proper",
      'CSS frameworks',
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

function makeTitleSvg(lines: ReadonlyArray<string>) {
  const lineHeight = 80;
  const fontSize = 60;
  const width = 900;
  const height = lines.length * lineHeight;
  const centerX = width / 2;

  function BlogImageTitleSvg(props: SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        viewBox={`0 0 ${width} ${height}`}
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
  const sizeLabel = `${BLOG_IMAGE_WIDTH}x${BLOG_IMAGE_HEIGHT}`;
  const viewportStyle = {
    width: `${BLOG_IMAGE_WIDTH}px`,
    height: `${BLOG_IMAGE_HEIGHT}px`,
  } as CSSProperties;

  return (
    <div className={s.debugRoot}>
      {BLOG_IMAGES.map((image) => {
        const titleText = image.titleLines.join(' ');
        const TitleSvg = makeTitleSvg(image.titleLines);

        return (
          <div key={image.id}>
            <p className={s.debugLabel}>
              {image.id} - {sizeLabel}
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
      })}
    </div>
  );
}
