'use client';

// Debug-only component: keep isolated from production UI.

import {
  type ChangeEvent,
  type ReactNode,
  useCallback,
  useMemo,
  useState,
} from 'react';

const SOFT_PATH =
  'M37.432 0 A7.6 7.6 0 0 1 45.032 0 C63.172 11.14 81.888 43.56 82.464 64.84 A7.6 7.6 0 0 1 78.664 71.42 C59.948 81.56 22.516 81.56 3.8 71.42 A7.6 7.6 0 0 1 0 64.84 C0.576 43.56 19.292 11.14 37.432 0 Z';
// The path's rounded tip arc overshoots y=0 by ~1.02 path units (radius 7.6,
// chord 7.6 → arc apex at (chord_midpoint - 1.02)). The bottom bezier reaches
// y ≈ 79.025. Use the ACTUAL bbox so the tips don't clip when rendered.
const PATH_X_MIN = 0;
const PATH_X_MAX = 82.464;
const PATH_Y_MIN = -1.02;
const PATH_Y_MAX = 79.025;
const PATH_WIDTH = PATH_X_MAX - PATH_X_MIN;
const PATH_HEIGHT = PATH_Y_MAX - PATH_Y_MIN;
const PATH_X_CENTER = (PATH_X_MIN + PATH_X_MAX) / 2;
const PATH_Y_CENTER = (PATH_Y_MIN + PATH_Y_MAX) / 2;

export type SectionBgConfig = {
  spacing: number;
  flipOddRows: boolean;
  offsetOddRows: boolean;
  baseGap: number;
  tipGap: number;
  triangleSize: number;
  strokeWidth: number;
  strokeColor: string;
  strokeOpacity: number;
  demoBg: string;
};

const DEFAULT_CONFIG: SectionBgConfig = {
  spacing: 24,
  flipOddRows: false,
  offsetOddRows: false,
  baseGap: 24,
  tipGap: 24,
  triangleSize: 80,
  strokeWidth: 2,
  strokeColor: '#ffffff',
  strokeOpacity: 0.05,
  demoBg: 'transparent',
};

type Props = { initialDefaults: SectionBgConfig | null };

export default function SectionBgDebug({ initialDefaults }: Props) {
  const [config, setConfig] = useState<SectionBgConfig>(() => ({
    ...DEFAULT_CONFIG,
    ...(initialDefaults ?? {}),
  }));
  const [status, setStatus] = useState<string>('');

  const update = useCallback(
    <K extends keyof SectionBgConfig>(
      key: K,
      value: SectionBgConfig[K],
    ) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const onNumberInput = useCallback(
    (key: keyof SectionBgConfig) =>
      (e: ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        if (!Number.isNaN(value)) {
          setConfig((prev) => ({ ...prev, [key]: value }));
        }
      },
    [],
  );

  const strokePad = config.strokeWidth / 2;
  const scale = config.triangleSize / PATH_WIDTH;
  const compensatedStrokeWidth = config.strokeWidth / scale;
  // visibleH / visibleW = the actual visible y/x extent of one triangle's
  // stroke (path bleed + stroke half-widths on both sides).
  const visibleH = PATH_HEIGHT * scale + 2 * strokePad;
  const visibleW = PATH_WIDTH * scale + 2 * strokePad;
  const tileWidth = visibleW + config.spacing;

  const needsDoubleRow =
    config.flipOddRows || config.offsetOddRows;

  // When flipping, row 0 (upright) and row 1 (flipped) have ASYMMETRIC
  // neighbours: row 0's base meets row 1's base (baseGap), and row 1's tip
  // meets the next-tile row 0's tip (tipGap). These can be independently
  // tuned. tipGap can go negative — that's tip interlocking.
  // When NOT flipping, both gaps collapse to plain spacing.
  const baseGap = config.flipOddRows ? config.baseGap : config.spacing;
  const tipGap = config.flipOddRows ? config.tipGap : config.spacing;

  const row1AnchorY = visibleH + baseGap;
  const tileHeight = needsDoubleRow
    ? row1AnchorY + visibleH + tipGap
    : visibleH + config.spacing;

  const tileExportWidth = Math.max(1, Math.round(tileWidth));
  const tileExportHeight = Math.max(1, Math.round(tileHeight));

  // The path's actual top-left (with arc overshoot) is (PATH_X_MIN, PATH_Y_MIN).
  // Translate the path so its visible top-left lands at (strokePad, strokePad).
  const anchorXShift = strokePad - PATH_X_MIN * scale;
  const anchorYShift = strokePad - PATH_Y_MIN * scale;

  const tileTriangles = useMemo(() => {
    const items: Array<{ x: number; y: number; flipped: boolean }> = [];

    // Row 0 (always upright)
    items.push({ x: anchorXShift, y: anchorYShift, flipped: false });

    if (needsDoubleRow) {
      const xOff = config.offsetOddRows ? tileWidth / 2 : 0;
      // Horizontal wraparound positions (needed when offsetOddRows shifts row
      // 1 such that its right half lands in the next tile).
      const dxList = config.offsetOddRows ? [0, -tileWidth] : [0];
      // Vertical wraparound positions (needed when flipOddRows + negative
      // tipGap interlocks tips across the tile boundary). Always include the
      // -tileHeight copy when flipping; browser clips the invisible part.
      const dyList = config.flipOddRows ? [0, -tileHeight] : [0];

      for (const dx of dxList) {
        for (const dy of dyList) {
          items.push({
            x: xOff + dx + anchorXShift,
            y: row1AnchorY + dy + anchorYShift,
            flipped: config.flipOddRows,
          });
        }
      }
    }

    return items;
  }, [
    needsDoubleRow,
    config.flipOddRows,
    config.offsetOddRows,
    tileWidth,
    tileHeight,
    row1AnchorY,
    anchorXShift,
    anchorYShift,
  ]);

  const tileSvgMarkup = useMemo(() => {
    const inner = tileTriangles
      .map((t) => {
        const transform = t.flipped
          ? `translate(${t.x} ${t.y}) scale(${scale}) rotate(180 ${PATH_X_CENTER} ${PATH_Y_CENTER})`
          : `translate(${t.x} ${t.y}) scale(${scale})`;
        return `<path transform="${transform}" d="${SOFT_PATH}" fill="none" stroke="${config.strokeColor}" stroke-opacity="${config.strokeOpacity}" stroke-width="${compensatedStrokeWidth}" />`;
      })
      .join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${tileExportWidth}" height="${tileExportHeight}" viewBox="0 0 ${tileExportWidth} ${tileExportHeight}">${inner}</svg>`;
  }, [
    tileTriangles,
    tileExportWidth,
    tileExportHeight,
    scale,
    compensatedStrokeWidth,
    config.strokeColor,
    config.strokeOpacity,
  ]);

  const tileDataUri = useMemo(() => {
    const encoded = encodeURIComponent(tileSvgMarkup)
      .replace(/'/g, '%27')
      .replace(/"/g, '%22');
    return `data:image/svg+xml,${encoded}`;
  }, [tileSvgMarkup]);

  const cssSnippet = `background-image: url("${tileDataUri}");\nbackground-repeat: repeat;\nbackground-size: ${tileExportWidth}px ${tileExportHeight}px;`;


  const saveDefaults = useCallback(async () => {
    setStatus('Saving…');
    try {
      const res = await fetch('/api/debug/sectionBg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = (await res.json()) as { ok?: boolean };
      setStatus(
        data.ok
          ? 'Saved to /tmp/sectionBg.json'
          : 'Save failed',
      );
    } catch {
      setStatus('Save failed');
    }
  }, [config]);

  const copyText = useCallback((text: string, label: string) => {
    void navigator.clipboard.writeText(text);
    setStatus(`Copied ${label}`);
  }, []);

  return (
    <div
      style={{
        padding: 24,
        fontFamily: 'system-ui, sans-serif',
        color: '#eee',
        background: '#0a0a0a',
        minHeight: '100vh',
      }}
    >
      <h1 style={{ fontSize: 20, margin: '0 0 16px' }}>
        Section Background
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 320px) 1fr',
          gap: 24,
          alignItems: 'start',
        }}
      >
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <Row label={`Triangle size: ${config.triangleSize}px`}>
            <input
              type="range"
              min={10}
              max={400}
              value={config.triangleSize}
              onChange={onNumberInput('triangleSize')}
            />
          </Row>
          <Row label={`Spacing: ${config.spacing}px`}>
            <input
              type="range"
              min={0}
              max={200}
              value={config.spacing}
              onChange={onNumberInput('spacing')}
            />
          </Row>
          <Row
            label={`Stroke width: ${config.strokeWidth.toFixed(1)}px`}
          >
            <input
              type="range"
              min={0.1}
              max={100}
              step={0.1}
              value={config.strokeWidth}
              onChange={onNumberInput('strokeWidth')}
            />
          </Row>
          <Row
            label={`Stroke opacity: ${config.strokeOpacity.toFixed(2)}`}
          >
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={config.strokeOpacity}
              onChange={onNumberInput('strokeOpacity')}
            />
          </Row>
          <Row label="Stroke color">
            <input
              type="color"
              value={config.strokeColor}
              onChange={(e) => update('strokeColor', e.target.value)}
            />
          </Row>
          <Row label="Flip odd rows (alternate orientation)">
            <input
              type="checkbox"
              checked={config.flipOddRows}
              onChange={(e) =>
                update('flipOddRows', e.target.checked)
              }
            />
          </Row>
          <Row label="Offset odd rows (half-tile shift)">
            <input
              type="checkbox"
              checked={config.offsetOddRows}
              onChange={(e) =>
                update('offsetOddRows', e.target.checked)
              }
            />
          </Row>
          <Row
            label={`Base gap (base-to-base): ${config.baseGap.toFixed(0)}px`}
          >
            <input
              type="range"
              min={0}
              max={Math.max(50, Math.round(config.triangleSize))}
              step={1}
              value={config.baseGap}
              disabled={!config.flipOddRows}
              onChange={onNumberInput('baseGap')}
            />
          </Row>
          <Row
            label={`Tip gap (tip-to-tip): ${config.tipGap.toFixed(0)}px`}
          >
            <input
              type="range"
              min={-Math.max(50, Math.round(config.triangleSize))}
              max={Math.max(50, Math.round(config.triangleSize))}
              step={1}
              value={config.tipGap}
              disabled={!config.flipOddRows}
              onChange={onNumberInput('tipGap')}
            />
          </Row>
          <Row label="Demo background">
            <select
              value={config.demoBg}
              onChange={(e) => update('demoBg', e.target.value)}
              style={{ padding: 4 }}
            >
              <option value="transparent">transparent</option>
              <option value="#0a0a0a">dark (#0a0a0a)</option>
              <option value="#00b7ff">blue (#00b7ff)</option>
              <option value="rgba(255,255,255,0.02)">
                section wrap (rgba 0.02)
              </option>
              <option value="#1a1a1a">slate (#1a1a1a)</option>
            </select>
          </Row>

          <div
            style={{
              display: 'flex',
              gap: 8,
              marginTop: 8,
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={() => {
                void saveDefaults();
              }}
              style={buttonStyle}
            >
              Save defaults
            </button>
            <button
              onClick={() => setConfig(DEFAULT_CONFIG)}
              style={buttonStyle}
            >
              Reset
            </button>
          </div>
          {status ? (
            <div style={{ fontSize: 12, color: '#9c9' }}>{status}</div>
          ) : null}
        </div>

        <div
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          <div
            style={{
              background: config.demoBg,
              padding: 24,
              border: '1px solid #333',
              minHeight: 400,
              backgroundImage:
                config.demoBg === 'transparent'
                  ? 'linear-gradient(45deg, #222 25%, transparent 25%), linear-gradient(-45deg, #222 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #222 75%), linear-gradient(-45deg, transparent 75%, #222 75%)'
                  : undefined,
              backgroundSize:
                config.demoBg === 'transparent' ? '20px 20px' : undefined,
              backgroundPosition:
                config.demoBg === 'transparent'
                  ? '0 0, 0 10px, 10px -10px, -10px 0px'
                  : undefined,
            }}
          >
            <div
              style={{
                width: '100%',
                minHeight: 600,
                backgroundColor: config.demoBg,
                backgroundImage: `url("${tileDataUri}")`,
                backgroundRepeat: 'repeat',
                backgroundSize: `${tileExportWidth}px ${tileExportHeight}px`,
              }}
              aria-label="Triangle pattern preview (tile repeated)"
            />
          </div>

          <div
            style={{
              fontSize: 12,
              color: '#9c9',
              padding: '0 4px',
            }}
          >
            Exported tile: {tileExportWidth}×{tileExportHeight}px (
            {tileTriangles.length} path{tileTriangles.length === 1 ? '' : 's'}
            ). Preview fills available space and repeats.
          </div>

          <div
            style={{
              background: '#111',
              padding: 12,
              border: '1px solid #333',
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              CSS snippet
            </div>
            <pre
              style={{
                fontFamily: 'ui-monospace, monospace',
                fontSize: 11,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                margin: 0,
                maxHeight: 160,
                overflow: 'auto',
                background: '#0a0a0a',
                padding: 8,
              }}
            >
              {cssSnippet}
            </pre>
            <div
              style={{
                display: 'flex',
                gap: 8,
                marginTop: 8,
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={() => copyText(cssSnippet, 'CSS')}
                style={buttonStyle}
              >
                Copy CSS
              </button>
              <button
                onClick={() => copyText(tileSvgMarkup, 'raw SVG tile')}
                style={buttonStyle}
              >
                Copy raw SVG
              </button>
              <button
                onClick={() => copyText(tileDataUri, 'data URI')}
                style={buttonStyle}
              >
                Copy data URI
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  padding: '6px 12px',
  background: '#222',
  color: '#eee',
  border: '1px solid #444',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 12,
};

function Row({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        fontSize: 13,
      }}
    >
      <span>{label}</span>
      {children}
    </label>
  );
}
