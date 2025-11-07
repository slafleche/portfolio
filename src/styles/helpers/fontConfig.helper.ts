// One-stop helpers for font weights + family defs + loading/validating fonts.config.json.
import type { FontFamilyDef } from './types.helper';

// ---- Types expected from your JSON config ----
export type FontCfgInput = {
  texts?: string[];
  keys?: string[];
  weights: string | string[]; // e.g. "400..800", ["300..700"], ["400","700"]
  ital?: boolean;
  axes?: Record<string, string | string[]>;
  subsets?: string[];
};
export type FontsConfig = Record<string, FontCfgInput>;

// ---- Load raw JSON (Next.js/modern TS supports JSON imports) ----
// If your toolchain requires, keep the assert; otherwise you can drop it.
import rawJson from '../../data/fonts.config.json' assert { type: 'json' };
import type { IMeasurement } from '../measurementKit';

// ----------------- internals -----------------
function toArray<T>(x: T | T[]): T[] {
  return Array.isArray(x)
    ? x
    : [
        x,
      ];
}

function parseRangeToken(token: string): {
  low: number;
  high: number;
} {
  const t = String(token).trim();
  const range = t.split('..').map((s) => s.trim());
  if (range.length === 1) {
    const n = Number(range[0]);
    return { low: n, high: n };
  }
  const a = Number(range[0]);
  const b = Number(range[1]);
  return {
    low: Math.min(a, b),
    high: Math.max(a, b),
  };
}

// ----------------- public helpers -----------------

/**
 * Merge one or more weight tokens into a single {low, high} range.
 *
 * - "400..800" -> { low: 400, high: 800 }
 * - ["300..700"] -> { low: 300, high: 700 }
 * - ["400","700"] -> { low: 400, high: 700 }
 * - ["300..500","600..800"] -> { low: 300, high: 800 }
 */
export function weightRangeFromConfig(weights: string | string[]): {
  low: number;
  high: number;
} {
  const tokens = toArray(weights).filter(Boolean);
  if (tokens.length === 0) return { low: 400, high: 700 };

  let low = Number.POSITIVE_INFINITY;
  let high = Number.NEGATIVE_INFINITY;

  for (const t of tokens) {
    const r = parseRangeToken(t);
    if (!Number.isFinite(r.low) || !Number.isFinite(r.high)) continue;
    if (r.low < low) low = r.low;
    if (r.high > high) high = r.high;
  }

  if (!Number.isFinite(low) || !Number.isFinite(high)) {
    return { low: 400, high: 700 };
  }
  return { low, high };
}

const AXIS_WEIGHT_KEY = 'wght';
const AXIS_ITALIC_KEY = 'ital';
const AXIS_WIDTH_KEY = 'wdth';

const average = (a: number, b: number) => (a + b) / 2;

function extractAxisDefault(
  token: string,
): number | string | undefined {
  const trimmed = token.trim();
  if (!trimmed) return undefined;

  const rangeMatch = trimmed.match(
    /^(-?\d+(?:\.\d+)?)\.\.(-?\d+(?:\.\d+)?)$/,
  );
  if (rangeMatch) {
    const low = Number(rangeMatch[1]);
    const high = Number(rangeMatch[2]);
    if (Number.isFinite(low) && Number.isFinite(high)) {
      return average(low, high);
    }
  }

  const numeric = Number(trimmed);
  if (Number.isFinite(numeric)) {
    return numeric;
  }

  const looseMatch = trimmed.match(/-?\d+(?:\.\d+)?/);
  if (looseMatch) {
    const loose = Number(looseMatch[0]);
    if (Number.isFinite(loose)) {
      return loose;
    }
  }

  return trimmed;
}

function deriveAxisDefaults(
  familyName: string | undefined,
  cfgMap: FontsConfig | undefined,
): {
  css?: FontFamilyDef['css'];
  axisDefaults?: FontFamilyDef['axisDefaults'];
} {
  if (!familyName || !cfgMap) return {};
  const cfg = cfgMap[familyName];
  if (!cfg || !cfg.axes) return {};

  const axisDefaults: Record<string, number | string> = {};
  const css: NonNullable<FontFamilyDef['css']> = {};
  const variationEntries: string[] = [];

  for (const [
    axisName,
    rawValue,
  ] of Object.entries(cfg.axes)) {
    const tokens = toArray(rawValue).filter(Boolean);
    if (tokens.length === 0) continue;

    const defaultValue = extractAxisDefault(tokens[0]);
    if (defaultValue === undefined) continue;

    axisDefaults[axisName] = defaultValue;

    if (axisName === AXIS_WEIGHT_KEY) {
      continue;
    }

    if (axisName === AXIS_ITALIC_KEY) {
      const numeric =
        typeof defaultValue === 'number'
          ? defaultValue
          : Number(defaultValue);
      if (Number.isFinite(numeric)) {
        css.fontStyle = numeric >= 0.5 ? 'italic' : 'normal';
      }
      continue;
    }

    if (axisName === AXIS_WIDTH_KEY) {
      const numeric =
        typeof defaultValue === 'number'
          ? defaultValue
          : Number(defaultValue);
      if (Number.isFinite(numeric)) {
        css.fontStretch = `${numeric}%`;
      }
    }

    const formatted =
      typeof defaultValue === 'number'
        ? defaultValue.toString()
        : String(defaultValue);
    variationEntries.push(`"${axisName}" ${formatted}`);
  }

  if (variationEntries.length > 0) {
    const existing =
      typeof css.fontVariationSettings === 'string'
        ? `${css.fontVariationSettings}, ${variationEntries.join(', ')}`
        : variationEntries.join(', ');
    css.fontVariationSettings = existing;
  }

  return {
    css: Object.keys(css).length > 0 ? css : undefined,
    axisDefaults:
      Object.keys(axisDefaults).length > 0 ? axisDefaults : undefined,
  };
}

/**
 * Build a FontFamilyDef using fonts.config.json so you don’t
 * hand-copy weight ranges.
 *
 * @param familyName E.g. "Urbanist"
 * @param fallbacks E.g. ['Poppins','Helvetica','Arial','sans-serif']
 * @param cfgMap Parsed + validated FontsConfig (use the default
 *   export `fontsConfig`)
 * @param spacing IMeasurement only (e.g., m(0.3, 'rem'))
 */
type WeightConfig = {
  low?: number;
  default: number;
  strong: number;
  high?: number;
};

type MakeFamilyDefArgs = {
  familyName?: string;
  fallbacks: string[];
  cfgMap?: FontsConfig;
  spacing: IMeasurement;
  offsetToFlushTop: IMeasurement;
  weights: WeightConfig;
  lineHeight?: FontFamilyDef['lineHeight'];
  css?: FontFamilyDef['css'];
  axisDefaults?: FontFamilyDef['axisDefaults'];
};

const assertWeightOrder = (
  { low, default: normal, strong, high }: Required<WeightConfig>,
  familyName?: string,
) => {
  const label = familyName ? ` "${familyName}"` : '';
  if (!(low <= normal)) {
    throw new Error(
      `makeFamilyDef${label}: expected low (${low}) ≤ default (${normal}).`,
    );
  }
  if (!(normal < strong)) {
    throw new Error(
      `makeFamilyDef${label}: expected default (${normal}) < strong (${strong}).`,
    );
  }
  if (!(strong <= high)) {
    throw new Error(
      `makeFamilyDef${label}: expected strong (${strong}) ≤ high (${high}). Hint: "strong" weight should be bolder than "default" weight.`,
    );
  }
};

export function makeFamilyDef({
  familyName,
  fallbacks,
  cfgMap,
  spacing,
  offsetToFlushTop,
  weights,
  lineHeight,
  css,
  axisDefaults,
}: MakeFamilyDefArgs): FontFamilyDef {
  let resolvedLow = weights.low;
  let resolvedHigh = weights.high;

  const getConfigEntry = () => {
    if (!familyName || !cfgMap) return undefined;
    const direct = cfgMap[familyName];
    if (direct) return direct;
    const plusKey = familyName.replace(/\s+/g, '+');
    if (plusKey !== familyName) {
      const plusMatch = cfgMap[plusKey];
      if (plusMatch) return plusMatch;
    }
    return undefined;
  };

  const source = getConfigEntry();

  if (source?.weights) {
    const range = weightRangeFromConfig(source.weights);

    if (resolvedLow !== undefined && resolvedLow !== range.low) {
      throw new Error(
        `makeFamilyDef${familyName ? ` \"${familyName}\"` : ''}: weight low (${resolvedLow}) conflicts with fonts.config.json range (${range.low}).`,
      );
    }

    if (resolvedHigh !== undefined && resolvedHigh !== range.high) {
      throw new Error(
        `makeFamilyDef${familyName ? ` \"${familyName}\"` : ''}: weight high (${resolvedHigh}) conflicts with fonts.config.json range (${range.high}).`,
      );
    }

    if (resolvedLow === undefined) resolvedLow = range.low;
    if (resolvedHigh === undefined) resolvedHigh = range.high;
  }

  if (resolvedLow === undefined || resolvedHigh === undefined) {
    throw new Error(
      `makeFamilyDef${familyName ? ` "${familyName}"` : ''}: low/high weights must be provided directly or via fonts.config.json range.`,
    );
  }

  const finalWeights: Required<WeightConfig> = {
    low: resolvedLow,
    default: weights.default,
    strong: weights.strong,
    high: resolvedHigh,
  };

  assertWeightOrder(finalWeights, familyName);

  const familyParts = familyName
    ? [
        familyName.includes(' ') ? `"${familyName}"` : familyName,
        ...fallbacks,
      ]
    : fallbacks;

  if (familyParts.length === 0) {
    throw new Error(
      'makeFamilyDef requires at least one fallback font family',
    );
  }

  const derivedAxis = deriveAxisDefaults(familyName, cfgMap);

  const mergedCss = {
    ...(derivedAxis.css ?? {}),
    ...(css ?? {}),
  };

  const mergedAxisDefaults = {
    ...(derivedAxis.axisDefaults ?? {}),
    ...(axisDefaults ?? {}),
  };

  return {
    family: familyParts.join(', '),
    weights: finalWeights,
    spacing,
    offsetToFlushTop,
    lineHeight,
    css: Object.keys(mergedCss).length > 0 ? mergedCss : undefined,
    axisDefaults:
      Object.keys(mergedAxisDefaults).length > 0
        ? mergedAxisDefaults
        : undefined,
  };
}

// ----------------- loader/validator -----------------

/**
 * Convert an unknown JSON blob into a typed FontsConfig with basic
 * validation/coercion. Throws helpful errors if the structure is
 * off.
 */
export function asFontsConfig(input: unknown): FontsConfig {
  if (!input || typeof input !== 'object') {
    throw new Error('fonts.config.json: root must be an object');
  }
  const src = input as Record<string, unknown>;
  const out: FontsConfig = {};

  for (const [
    family,
    v,
  ] of Object.entries(src)) {
    if (!v || typeof v !== 'object') {
      throw new Error(
        `fonts.config.json: entry for "${family}" must be an object`,
      );
    }
    const cfg = v as Record<string, unknown>;

    // texts?: string[]
    const texts = Array.isArray(cfg.texts)
      ? cfg.texts.map(String)
      : undefined;

    // keys?: string[]
    const keys = Array.isArray(cfg.keys)
      ? cfg.keys.map(String)
      : undefined;

    // weights: string | string[]
    let weights: string | string[] | undefined = undefined;
    if (typeof cfg.weights === 'string') {
      weights = cfg.weights;
    } else if (Array.isArray(cfg.weights)) {
      weights = cfg.weights.map(String);
    }
    if (!weights) {
      throw new Error(
        `fonts.config.json: "${family}" is missing a valid "weights" (string or string[])`,
      );
    }

    // ital?: boolean
    const ital = typeof cfg.ital === 'boolean' ? cfg.ital : undefined;

    // subsets?: string[]
    const subsets = Array.isArray(cfg.subsets)
      ? cfg.subsets.map(String)
      : undefined;

    let axes: Record<string, string | string[]> | undefined;
    if (cfg.axes && typeof cfg.axes === 'object') {
      axes = {};
      for (const [
        axis,
        value,
      ] of Object.entries(cfg.axes as Record<string, unknown>)) {
        if (typeof value === 'string') {
          axes[axis] = value;
        } else if (Array.isArray(value)) {
          axes[axis] = value.map(String);
        }
      }
    }

    out[family] = {
      texts,
      keys,
      weights,
      ital,
      axes,
      subsets,
    };
  }

  return out;
}

// Create a single, validated config you can import anywhere.
const fontsConfig: FontsConfig = asFontsConfig(rawJson);
export default fontsConfig;
