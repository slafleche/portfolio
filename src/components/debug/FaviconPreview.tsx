'use client';

import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';

type SizedIcon = {
  src: string;
  fileName: string;
  hash: string;
  size: number;
};

type SizedMaskableIcon = SizedIcon | null;

type IconDescriptor = {
  rel: string;
  href: string;
  type?: string;
  sizes?: string;
  color?: string;
};

type FaviconPreviewData = {
  svg: {
    src: string;
    fileName: string;
    hash: string;
  };
  ico: {
    src: string;
    fileName: string;
    hash: string;
  };
  pngVariants: readonly SizedIcon[];
  appleTouch: SizedIcon;
  androidIcons: readonly (SizedIcon & { sizes: string })[];
  maskIcon: {
    src: string;
    fileName: string;
    hash: string;
    color: string;
  };
  maskableIcon: SizedMaskableIcon;
  msTile: SizedIcon & { color: string };
  browserConfig: {
    src: string;
    fileName: string;
    hash: string;
  } | null;
  webManifest: {
    src: string;
    fileName: string;
    hash: string;
  };
  defaultManifest: {
    locale: string;
    src: string;
    fileName: string;
    hash: string;
  };
  manifestMeta: {
    name: string;
    shortName: string;
    description: string;
    categories: readonly string[];
    lang: string;
  };
  themeColors: {
    light: string;
    dark: string;
    background: string;
    maskIcon: string;
    msTile: string;
  };
  metaTags: {
    themeColorLight: string;
    themeColorDark: string;
    msTileColor: string;
    msApplicationConfig: string | null;
  };
  linkDescriptors: {
    main: readonly IconDescriptor[];
  };
};

type FaviconPreviewProps = {
  locale: string;
  data: FaviconPreviewData;
  assetsReady: boolean;
  missingAssets?: readonly string[];
};
const themeOptions = ['light', 'dark'] as const;

const cardStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  padding: '1rem',
  borderRadius: '1rem',
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.04)',
  boxShadow: '0 10px 30px rgba(15, 12, 45, 0.18)',
  textAlign: 'center',
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gap: '1.25rem',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
};

export default function FaviconPreview({
  data,
  locale,
  assetsReady,
  missingAssets = [],
}: FaviconPreviewProps) {
  const [theme, setTheme] =
    useState<(typeof themeOptions)[number]>('light');

  const previewColors = useMemo(() => {
    const bg =
      theme === 'dark'
        ? data.themeColors.dark
        : data.themeColors.light;
    const fg = theme === 'dark' ? '#f5f0ff' : '#211235';
    const subtle = theme === 'dark' ? '#d5cdf5' : '#4f3d80';
    return {
      bg,
      fg,
      subtle,
      border: theme === 'dark'
        ? 'rgba(255,255,255,0.2)'
        : 'rgba(24,16,48,0.12)',
    };
  }, [data.themeColors.dark, data.themeColors.light, theme]);

  const swatchStyle: CSSProperties = {
    borderRadius: '0.75rem',
    overflow: 'hidden',
    border: `1px solid ${previewColors.border}`,
  };

  const MaskIconPreview = () => (
    <div style={cardStyle}>
      <div
        style={{
          width: '96px',
          height: '96px',
          borderRadius: '24px',
          backgroundColor: data.themeColors.maskIcon,
          maskImage: `url(${data.maskIcon.src})`,
          WebkitMaskImage: `url(${data.maskIcon.src})`,
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
        }}
        aria-hidden
      />
      <div>
        <div style={{ fontWeight: 600 }}>Safari mask-icon</div>
        <div
          style={{
            fontSize: '0.75rem',
            color: previewColors.subtle,
            wordBreak: 'break-all',
          }}
        >
          {data.maskIcon.fileName}
        </div>
      </div>
    </div>
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        padding: '2.5rem 6vw 4rem',
        color: previewColors.fg,
        background: theme === 'dark'
          ? 'radial-gradient(circle at top, rgba(96,76,255,0.35), transparent 55%), #080515'
          : 'radial-gradient(circle at top, rgba(118,91,255,0.22), transparent 55%), #f3f1ff',
        minHeight: '100vh',
        transition: 'background 240ms ease, color 240ms ease',
      }}
    >
      {!assetsReady ? (
        <div
          style={{
            padding: '1.2rem 1.5rem',
            borderRadius: '1rem',
            border: '1px solid rgba(240,90,120,0.55)',
            background:
              theme === 'dark'
                ? 'rgba(255,90,90,0.12)'
                : 'rgba(255,90,120,0.18)',
            color: theme === 'dark' ? '#ffd4e0' : '#721929',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <strong>Favicons not generated.</strong>
          <span>
            Run <code>yarn favicons</code> to build hashed assets before
            using this preview.
          </span>
          {missingAssets.length ? (
            <span style={{ fontSize: '0.8rem' }}>
              Missing files:{' '}
              <code>{missingAssets.join(', ')}</code>
            </span>
          ) : null}
        </div>
      ) : null}
      <header
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          maxWidth: '960px',
        }}
      >
        <span
          style={{
            letterSpacing: '0.1em',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            color: previewColors.subtle,
          }}
        >
          {locale} · Asset Pipeline
        </span>
        <h1
          style={{
            fontSize: '2.25rem',
            lineHeight: 1.15,
            margin: 0,
          }}
        >
          Favicons sandbox
        </h1>
        <p
          style={{
            margin: 0,
            maxWidth: '640px',
            color: previewColors.subtle,
            fontSize: '1rem',
            lineHeight: 1.6,
          }}
        >
          Quick smoke-test for every generated favicon asset. Toggle a
          simulated theme, verify the hashed filenames, and confirm Safari
          mask / PWA manifest outputs before shipping.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {themeOptions.map((option) => {
            const active = option === theme;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setTheme(option)}
                style={{
                  padding: '0.6rem 1.4rem',
                  borderRadius: '999px',
                  border: active
                    ? `1px solid ${previewColors.border}`
                    : '1px solid transparent',
                  background: active
                    ? 'rgba(255,255,255,0.14)'
                    : 'rgba(0,0,0,0.08)',
                  backdropFilter: 'blur(8px)',
                  color: active ? previewColors.fg : previewColors.subtle,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 160ms ease',
                }}
              >
                {option === 'light' ? 'Light theme' : 'Dark theme'}
              </button>
            );
          })}
        </div>
      </header>

      <section
        style={{
          padding: '2rem',
          borderRadius: '2rem',
          backgroundColor: previewColors.bg,
          color: previewColors.fg,
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Primary preview</h2>
          <p
            style={{
              margin: '0.25rem 0 0',
              color: previewColors.subtle,
            }}
          >
            Background follows&nbsp;
            <code>
              theme-color[{theme}]
            </code>
            &nbsp;→ {previewColors.bg}
          </p>
        </div>
        <div style={gridStyle}>
          <div style={cardStyle}>
            <img
              src={data.svg.src}
              width={144}
              height={144}
              alt="Favicon SVG"
              style={{ borderRadius: '32px' }}
            />
            <div>
              <div style={{ fontWeight: 600 }}>SVG</div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: previewColors.subtle,
                  wordBreak: 'break-all',
                }}
              >
                {data.svg.fileName}
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <img
              src={data.ico.src}
              width={96}
              height={96}
              alt="Favicon ICO"
              style={{ borderRadius: '20px', imageRendering: 'pixelated' }}
            />
            <div>
              <div style={{ fontWeight: 600 }}>ICO (16/32/48)</div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: previewColors.subtle,
                  wordBreak: 'break-all',
                }}
              >
                {data.ico.fileName}
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <img
              src={data.appleTouch.src}
              width={128}
              height={128}
              alt="Apple touch icon"
              style={{ borderRadius: '28px' }}
            />
            <div>
              <div style={{ fontWeight: 600 }}>Apple touch</div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: previewColors.subtle,
                  wordBreak: 'break-all',
                }}
              >
                {data.appleTouch.fileName}
              </div>
            </div>
          </div>

          {data.maskableIcon ? (
            <div style={cardStyle}>
              <img
                src={data.maskableIcon.src}
                width={128}
                height={128}
                alt="Maskable icon"
                style={{ borderRadius: '38%' }}
              />
              <div>
                <div style={{ fontWeight: 600 }}>Maskable (PWA)</div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: previewColors.subtle,
                    wordBreak: 'break-all',
                  }}
                >
                  {data.maskableIcon.fileName}
                </div>
              </div>
            </div>
          ) : null}

          <MaskIconPreview />
        </div>
      </section>

      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>PNG variants</h2>
          <p
            style={{
              margin: '0.25rem 0 0',
              color: previewColors.subtle,
            }}
          >
            Responsive set used across Android / favicon fallbacks.
          </p>
        </div>

        <div style={gridStyle}>
          {data.pngVariants.map((icon) => (
            <div key={icon.hash} style={cardStyle}>
              <div style={swatchStyle}>
                <img
                  src={icon.src}
                  width={icon.size}
                  height={icon.size}
                  alt={`${icon.size}×${icon.size} PNG`}
                  style={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    padding: '1.5rem',
                    background:
                      theme === 'dark' ? '#0a071c' : '#fff',
                  }}
                />
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>
                  {icon.size}
                  ×
                  {icon.size}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: previewColors.subtle,
                    wordBreak: 'break-all',
                  }}
                >
                  {icon.fileName}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          display: 'grid',
          gap: '1.5rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        }}
      >
        <div
          style={{
            padding: '1.5rem',
            borderRadius: '1.5rem',
            background: theme === 'dark'
              ? 'rgba(12,9,30,0.8)'
              : 'rgba(255,255,255,0.6)',
            border: `1px solid ${previewColors.border}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <h3 style={{ margin: 0 }}>Theme colors</h3>
          <div
            style={{
              display: 'grid',
              gap: '0.75rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            }}
          >
            {Object.entries(data.themeColors).map(
              ([key, value]) => (
                <div key={key} style={{ display: 'flex', gap: '0.75rem' }}>
                  <span
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      backgroundColor: value,
                      border: `1px solid ${previewColors.border}`,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600 }}>
                      {key}
                    </span>
                    <code
                      style={{
                        fontSize: '0.8rem',
                        color: previewColors.subtle,
                      }}
                    >
                      {value}
                    </code>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>

        <div
          style={{
            padding: '1.5rem',
            borderRadius: '1.5rem',
            background: theme === 'dark'
              ? 'rgba(12,9,30,0.8)'
              : 'rgba(255,255,255,0.6)',
            border: `1px solid ${previewColors.border}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <h3 style={{ margin: 0 }}>Meta tags &amp; manifest</h3>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <li>
              <strong>manifest[{data.manifestMeta.lang}]</strong>{' '}
              <a
                href={data.webManifest.src}
                style={{ color: previewColors.subtle }}
              >
                {data.webManifest.fileName}
              </a>
            </li>
            <li>
              <strong>default manifest</strong>{' '}
              <a
                href={data.defaultManifest.src}
                style={{ color: previewColors.subtle }}
              >
                {data.defaultManifest.fileName}
              </a>
            </li>
            {data.browserConfig ? (
              <li>
                <strong>browserconfig</strong>{' '}
                <a
                  href={data.browserConfig.src}
                  style={{ color: previewColors.subtle }}
                >
                  {data.browserConfig.fileName}
                </a>
              </li>
            ) : null}
            <li>
              <strong>name</strong>{' '}
              <code>{data.manifestMeta.name}</code>
            </li>
            <li>
              <strong>short_name</strong>{' '}
              <code>{data.manifestMeta.shortName}</code>
            </li>
            <li>
              <strong>categories</strong>{' '}
              <code>
                {data.manifestMeta.categories.join(', ') || '—'}
              </code>
            </li>
            <li>
              <strong>theme-color (light)</strong>{' '}
              <code>{data.metaTags.themeColorLight}</code>
            </li>
            <li>
              <strong>theme-color (dark)</strong>{' '}
              <code>{data.metaTags.themeColorDark}</code>
            </li>
            <li>
              <strong>msapplication-TileColor</strong>{' '}
              <code>{data.metaTags.msTileColor}</code>
            </li>
            {data.metaTags.msApplicationConfig ? (
              <li>
                <strong>msapplication-config</strong>{' '}
                <a
                  href={data.metaTags.msApplicationConfig}
                  style={{ color: previewColors.subtle }}
                >
                  {data.metaTags.msApplicationConfig
                    .split('/')
                    .pop()}
                </a>
              </li>
            ) : null}
            <li>
              <strong>description</strong>
              <div
                style={{
                  marginTop: '0.25rem',
                  color: previewColors.subtle,
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                }}
              >
                {data.manifestMeta.description}
              </div>
            </li>
          </ul>
        </div>
      </section>

      <section
        style={{
          padding: '1.5rem',
          borderRadius: '1.5rem',
          background: theme === 'dark'
            ? 'rgba(12,9,30,0.8)'
            : 'rgba(255,255,255,0.6)',
          border: `1px solid ${previewColors.border}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <h3 style={{ margin: 0 }}>Link descriptors</h3>
        <div
          style={{
            display: 'grid',
            gap: '0.75rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          }}
        >
          {data.linkDescriptors.main.map((link) => (
            <div
              key={`${link.rel}-${link.href}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                padding: '0.75rem 1rem',
                borderRadius: '1rem',
                border: `1px dashed ${previewColors.border}`,
                background: theme === 'dark'
                  ? 'rgba(18,14,36,0.85)'
                  : 'rgba(255,255,255,0.7)',
              }}
            >
              <strong>
                {link.rel}
                {link.type ? ` · ${link.type}` : ''}
              </strong>
              {link.sizes ? (
                <span style={{ color: previewColors.subtle }}>
                  {link.sizes}
                </span>
              ) : null}
              {link.color ? (
                <span style={{ color: previewColors.subtle }}>
                  {link.color}
                </span>
              ) : null}
              <a
                href={link.href}
                style={{ color: previewColors.subtle }}
              >
                {link.href}
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
