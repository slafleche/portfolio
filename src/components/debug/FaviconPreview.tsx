'use client';

import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';

type BasicIcon = {
  src: string;
  fileName: string;
  hash: string;
};

type SizedIcon = BasicIcon & {
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
  svg: BasicIcon;
  ico: BasicIcon;
  icoVariants: readonly SizedIcon[];
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
  msTile: BasicIcon & { color: string; size: number };
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
  devMaskSvgPath: string | null;
  devTileForegroundSvgPath: string | null;
};

type FaviconPreviewProps = {
  locale: string;
  availableLocales: readonly string[];
  fallbackLocale: string;
  data: FaviconPreviewData;
  assetsReady: boolean;
  missingAssets?: readonly string[];
};

const themeOptions = ['light', 'dark'] as const;

const toColor = (value: string | undefined, fallback: string) => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : fallback;
};

export default function FavIconPreview({
  data,
  locale,
  availableLocales,
  fallbackLocale,
  assetsReady,
  missingAssets = [],
}: FaviconPreviewProps) {
  const [theme, setTheme] = useState<(typeof themeOptions)[number]>('light');
  const defaultLight = toColor(data.themeColors.light, '#f7f4ff');
  const defaultDark = toColor(data.themeColors.dark, '#0a0616');
  const [lightInput, setLightInput] = useState(defaultLight);
  const [darkInput, setDarkInput] = useState(defaultDark);

  const lightColor = toColor(lightInput, defaultLight);
  const darkColor = toColor(darkInput, defaultDark);
  const alternativeLocale = useMemo(() => {
    const others = availableLocales.filter((code) => code !== locale);
    return others[0] ?? fallbackLocale;
  }, [availableLocales, fallbackLocale, locale]);
  const previewThemeColors = useMemo(
    () => ({
      ...data.themeColors,
      light: lightColor,
      dark: darkColor,
    }),
    [data.themeColors, lightColor, darkColor],
  );

  const previewColors = useMemo(() => {
    const selected = theme === 'dark' ? darkColor : lightColor;
    const fallback = theme === 'dark'
      ? data.themeColors.background || '#0a0616'
      : '#f7f4ff';
    const bg = selected || fallback;
    const fg = theme === 'dark' ? '#f5f0ff' : '#211235';
    const subtle = theme === 'dark' ? '#d5cdf5' : '#4f3d80';

    return {
      bg,
      fg,
      subtle,
      border: theme === 'dark'
        ? 'rgba(255,255,255,0.25)'
        : 'rgba(24,16,48,0.18)',
      controlBg: theme === 'dark'
        ? 'rgba(18,14,36,0.6)'
        : 'rgba(255,255,255,0.92)',
      inputBg: theme === 'dark'
        ? 'rgba(12,9,30,0.85)'
        : 'rgba(255,255,255,0.98)',
      maskChip: theme === 'dark'
        ? 'rgba(255,255,255,0.1)'
        : 'rgba(24,16,48,0.28)',
      cardBg: theme === 'dark'
        ? 'rgba(255,255,255,0.05)'
        : 'rgba(255,255,255,0.94)',
      cardBorder: theme === 'dark'
        ? '1px solid rgba(255,255,255,0.12)'
        : '1px solid rgba(24,16,48,0.12)',
    };
  }, [data.themeColors.background, darkColor, lightColor, theme]);

  const cardStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '1rem',
    borderRadius: '1rem',
    border: previewColors.cardBorder,
    background: previewColors.cardBg,
    boxShadow: '0 10px 30px rgba(15, 12, 45, 0.12)',
    textAlign: 'center',
  };

  const gridStyle: CSSProperties = {
    display: 'grid',
    gap: '1.25rem',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  };

  const swatchStyle: CSSProperties = {
    borderRadius: '0.75rem',
    border: `1px solid ${previewColors.border}`,
    background: theme === 'dark' ? '#0a071c' : '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  };

  const variantsFlowStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1.5rem',
    alignItems: 'flex-start',
  };

  const getSwatchPadding = (size: number) => {
    const clamped = Math.max(6, Math.min(24, Math.round(size * 0.08)));
    return `${clamped}px`;
  };

  const icoSizeSummary = useMemo(() => {
    if (!data.icoVariants.length) {
      return '';
    }

    return data.icoVariants
      .map((item) => item.size)
      .sort((a, b) => a - b)
      .map((size) => `${size}px`)
      .join(' / ');
  }, [data.icoVariants]);

  const maskSvgSource = data.devMaskSvgPath ?? data.maskIcon.src;
  const maskDisplayColor = toColor(data.themeColors.maskIcon, '#ffffff');
  const tileForegroundSource = data.devTileForegroundSvgPath;

  const MaskIconPreview = () => (
    <div
      style={{
        ...cardStyle,
        background: previewColors.maskChip,
        border: previewColors.cardBorder,
      }}
    >
      <div
        aria-hidden
          style={{
            width: '96px',
            height: '96px',
            borderRadius: '50%',
            backgroundColor: theme === 'dark' ? '#0d0a17' : '#dcd5ff',
            boxShadow: `0 0 0 1px ${previewColors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
        }}
      >
        <div
          aria-hidden
          style={{
            width: '70%',
            aspectRatio: '1 / 1',
            backgroundColor: maskDisplayColor,
            maskImage: `url(${maskSvgSource})`,
            WebkitMaskImage: `url(${maskSvgSource})`,
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskPosition: 'center',
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
          }}
        />
      </div>
      <div>
        <div style={{ fontWeight: 600 }}>Safari mask-icon</div>
        <div
          style={{
            fontSize: '0.75rem',
            color: previewColors.subtle,
            wordBreak: 'break-all',
          }}
        >
          {maskSvgSource}
        </div>
      </div>
    </div>
  );

  const CirclePreview = () => (
    <div style={cardStyle}>
      <div
        aria-hidden
        style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          overflow: 'hidden',
          border: `1px solid ${previewColors.border}`,
          background: theme === 'dark' ? '#0d0a17' : '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={data.appleTouch.src}
          alt="Circular favicon preview"
          style={{
            width: '110%',
            height: '110%',
            objectFit: 'cover',
          }}
        />
      </div>
      <div>
        <div style={{ fontWeight: 600 }}>Circular preview</div>
        <div
          style={{
            fontSize: '0.75rem',
            color: previewColors.subtle,
          }}
        >
          Simulates adaptive / round icons
        </div>
      </div>
    </div>
  );

  const IcoPreview = () => (
    <div style={cardStyle}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: '1.25rem',
          flexWrap: 'wrap',
          width: '100%',
        }}
      >
        {data.icoVariants.map((icon) => (
          <div
            key={icon.hash}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <img
              src={icon.src}
              width={icon.size}
              height={icon.size}
              alt={`${icon.size}×${icon.size} ICO layer`}
              style={{
                display: 'block',
                imageRendering:
                  icon.size <= 64 ? 'pixelated' : 'auto',
              }}
            />
            <span
              style={{
                fontSize: '0.75rem',
                color: previewColors.subtle,
              }}
            >
              {icon.size}px
            </span>
          </div>
        ))}
      </div>
      <div style={{ fontWeight: 600 }}>ICO container</div>
      <div
        style={{
          fontSize: '0.75rem',
          color: previewColors.subtle,
        }}
      >
        Layers: {icoSizeSummary || 'none'}
      </div>
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
  );

  const MsTilePreview = () => (
    <div style={cardStyle}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          alignItems: 'center',
        }}
      >
        <div
          aria-hidden
          style={{
            width: 120,
            height: 120,
            borderRadius: '18px',
            backgroundColor: data.msTile.color,
            border: `1px solid ${previewColors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {tileForegroundSource ? (
            <img
              src={tileForegroundSource}
              alt="Windows tile foreground"
              style={{
                width: '80%',
                height: '80%',
                objectFit: 'contain',
              }}
            />
          ) : (
            <img
              src={data.msTile.src}
              alt="Windows tile PNG fallback"
              style={{
                width: '80%',
                height: '80%',
                objectFit: 'contain',
                mixBlendMode: 'multiply',
              }}
            />
          )}
        </div>
        <span
          style={{ fontSize: '0.75rem', color: previewColors.subtle }}
        >
          {tileForegroundSource
            ? 'Composited (color + foreground)'
            : 'Composited preview (PNG fallback)'}
        </span>
        <div
          aria-hidden
          style={{
            width: 120,
            height: 120,
            borderRadius: '18px',
            overflow: 'hidden',
            border: `1px solid ${previewColors.border}`,
          }}
        >
          <img
            src={data.msTile.src}
            alt="Windows tile PNG"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
        <span
          style={{ fontSize: '0.75rem', color: previewColors.subtle }}
        >
          Generated PNG
        </span>
      </div>
      <div>
        <div style={{ fontWeight: 600 }}>Windows tile</div>
        <div
          style={{
            fontSize: '0.75rem',
            color: previewColors.subtle,
          }}
        >
          Tile color {data.msTile.color}
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
          ? `radial-gradient(circle at top, rgba(96,76,255,0.35), transparent 55%), ${previewColors.bg}`
          : `radial-gradient(circle at top, rgba(118,91,255,0.22), transparent 55%), ${previewColors.bg}`,
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
            Run <code>yarn favicons</code> to build hashed assets before using this preview.
          </span>
          {missingAssets.length ? (
            <span style={{ fontSize: '0.8rem' }}>
              Missing files: <code>{missingAssets.join(', ')}</code>
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
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
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
          {availableLocales.length > 1 ? (
            <a
              href={`/${alternativeLocale}/debug/favicons`}
              style={{
                color: previewColors.subtle,
                fontSize: '0.8rem',
                textDecoration: 'none',
              }}
            >
              View {alternativeLocale.toUpperCase()}
            </a>
          ) : null}
        </div>
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
          Quick smoke-test for every generated favicon asset. Toggle a simulated theme, tweak
          theme colors on the fly, and verify Safari mask / PWA manifest outputs before shipping.
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            padding: '1rem',
            borderRadius: '0.9rem',
            background: previewColors.controlBg,
            border: `1px solid ${previewColors.border}`,
            color: previewColors.fg,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '0.6rem',
              alignItems: 'center',
            }}
          >
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
                    color: active
                      ? previewColors.fg
                      : previewColors.subtle,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 160ms ease',
                  }}
                >
                  {option === 'light' ? 'Light' : 'Dark'}
                </button>
              );
            })}
          </div>
          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              fontSize: '0.85rem',
            }}
          >
            Light theme color
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.75rem',
                color: previewColors.subtle,
              }}
            >
              <span
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '6px',
                  border: `1px solid ${previewColors.border}`,
                  backgroundColor: lightColor,
                }}
              />
              {lightColor}
            </span>
            <input
              type="color"
              value={lightInput}
              onChange={(event) => setLightInput(event.target.value)}
              placeholder={defaultLight}
              disabled={theme === 'dark'}
              style={{
                padding: '0.55rem 0.75rem',
                borderRadius: '0.6rem',
                border: `1px solid ${previewColors.border}`,
                background: previewColors.inputBg,
                color: previewColors.fg,
                opacity: theme === 'dark' ? 0.5 : 1,
              }}
            />
          </label>
          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              fontSize: '0.85rem',
            }}
          >
            Dark theme color
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.75rem',
                color: previewColors.subtle,
              }}
            >
              <span
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '6px',
                  border: `1px solid ${previewColors.border}`,
                  backgroundColor: darkColor,
                }}
              />
              {darkColor}
            </span>
            <input
              type="color"
              value={darkInput}
              onChange={(event) => setDarkInput(event.target.value)}
              placeholder={defaultDark}
              disabled={theme === 'light'}
              style={{
                padding: '0.55rem 0.75rem',
                borderRadius: '0.6rem',
                border: `1px solid ${previewColors.border}`,
                background: previewColors.inputBg,
                color: previewColors.fg,
                opacity: theme === 'light' ? 0.5 : 1,
              }}
            />
          </label>
        </div>
      </header>

      <section
        style={{
          padding: '2rem',
          borderRadius: '2rem',
          backgroundColor: previewColors.bg,
          color: previewColors.fg,
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
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
            Background uses <code>theme-color[{theme}]</code>.
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
              <div style={{ fontWeight: 600 }}>
                SVG
              </div>
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

          <IcoPreview />

          <div style={cardStyle}>
            <img
              src={data.appleTouch.src}
              width={128}
              height={128}
              alt="Apple touch icon"
              style={{ borderRadius: '28px' }}
            />
            <div>
              <div style={{ fontWeight: 600 }}>
                Apple touch
              </div>
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
                <div style={{ fontWeight: 600 }}>
                  Maskable (PWA)
                </div>
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
          <CirclePreview />
          <MsTilePreview />
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

        <div style={variantsFlowStyle}>
          {data.pngVariants.map((icon) => {
            const padding = getSwatchPadding(icon.size);
            return (
              <div
                key={icon.hash}
                style={{
                  ...cardStyle,
                  alignItems: 'center',
                  width: 'fit-content',
                  maxWidth: '100%',
                  padding: '0.75rem',
                  gap: '0.75rem',
                }}
              >
                <div style={{ ...swatchStyle, padding }}>
                  <img
                    src={icon.src}
                    width={icon.size}
                    height={icon.size}
                    alt={`${icon.size}×${icon.size} PNG`}
                    style={{
                      display: 'block',
                      imageRendering:
                        icon.size <= 64 ? 'pixelated' : 'auto',
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {icon.size}×{icon.size}
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
            );
          })}
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            }}
          >
            {Object.entries(previewThemeColors).map(([key, value]) => (
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
                  <span style={{ fontWeight: 600 }}>{key}</span>
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
            ))}
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
              <a href={data.webManifest.src} style={{ color: previewColors.subtle }}>
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
                <a href={data.browserConfig.src} style={{ color: previewColors.subtle }}>
                  {data.browserConfig.fileName}
                </a>
              </li>
            ) : null}
            <li>
              <strong>name</strong> <code>{data.manifestMeta.name}</code>
            </li>
            <li>
              <strong>short_name</strong> <code>{data.manifestMeta.shortName}</code>
            </li>
            <li>
              <strong>categories</strong>{' '}
              <code>{data.manifestMeta.categories.join(', ') || '—'}</code>
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
                  {data.metaTags.msApplicationConfig.split('/').pop()}
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
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
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
                <span style={{ color: previewColors.subtle }}>{link.sizes}</span>
              ) : null}
              {link.color ? (
                <span style={{ color: previewColors.subtle }}>{link.color}</span>
              ) : null}
              <a href={link.href} style={{ color: previewColors.subtle }}>
                {link.href}
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
