import type { CSS_TYPES } from '@/styles/helpers/types.helper';
import type { IMeasurement } from '../measurementKit';
import type { UnitDefinitionRecord } from '../measurementKit/unitDefinitions';
import type { PercentMeasurement } from '../measurementKit/units/percent';
import { createSupportsFallback } from './supportsFallback.helper';

/**
 * Composes backdrop-filter intents so styles always emit both
 * `backdropFilter` and `WebkitBackdropFilter` with identical values.
 * Accepts measurementKit inputs for blur + percent-driven filters
 * (`mPercent`) alongside simple numeric knobs (e.g. brightness multipliers)
 * so presets/helpers can stay declarative.
 */

type LengthUnit = {
  [Key in keyof UnitDefinitionRecord]: UnitDefinitionRecord[Key]['category'] extends `length-${string}`
    ? UnitDefinitionRecord[Key]['unit']
    : never;
}[keyof UnitDefinitionRecord];

type BlurInput = IMeasurement<LengthUnit> | null | undefined;
type PercentInput = PercentMeasurement | null | undefined;
type BrightnessInput = PercentMeasurement | number | null | undefined;

export type BackdropFilterIntent = {
  blur?: BlurInput;
  saturate?: PercentInput;
  contrast?: PercentInput;
  brightness?: BrightnessInput;
};

const blurPart = (value: BlurInput): string | undefined =>
  value ? `blur(${value.css()})` : undefined;

const percentPart = (
  value: PercentInput,
  fn: 'saturate' | 'contrast',
): string | undefined => (value ? `${fn}(${value.css()})` : undefined);

const brightnessPart = (value: BrightnessInput): string | undefined => {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return undefined;
    return `brightness(${value})`;
  }
  return `brightness(${value.css()})`;
};

const buildBackdropFilterParts = (
  intents: Array<BackdropFilterIntent | null | undefined>,
): string[] => {
  const parts: string[] = [];
  intents.forEach((intent) => {
    if (!intent) return;
    [
      blurPart(intent.blur),
      percentPart(intent.saturate, 'saturate'),
      percentPart(intent.contrast, 'contrast'),
      brightnessPart(intent.brightness),
    ].forEach((part) => {
      if (part) parts.push(part);
    });
  });
  return parts.filter(
    (part): part is string => !!part && part.trim().length > 0,
  );
};

export const backdropFilterValue = (
  ...intents: Array<BackdropFilterIntent | null | undefined>
): CSS_TYPES.Property.BackdropFilter | undefined => {
  const parts = buildBackdropFilterParts(intents);
  if (!parts.length) return undefined;
  return parts.join(' ') as CSS_TYPES.Property.BackdropFilter;
};

export const backdropFilterStyle = (
  ...intents: Array<BackdropFilterIntent | null | undefined>
) => {
  const value = backdropFilterValue(...intents);
  return value
    ? {
        backdropFilter: value,
        WebkitBackdropFilter: value,
      }
    : {};
};

type BackdropFilterComposer = {
  (...intents: Array<BackdropFilterIntent | null | undefined>): {
    backdropFilter?: CSS_TYPES.Property.BackdropFilter;
    WebkitBackdropFilter?: CSS_TYPES.Property.BackdropFilter;
  };
  value: typeof backdropFilterValue;
  style: typeof backdropFilterStyle;
};

/**
 * Default export mirrors the ergonomics of `transforms.helper.ts`, letting
 * callers compose intents while still reaching for `.value` / `.style` when
 * needed.
 */
const backdropFilters = ((...intents) =>
  backdropFilterStyle(...intents)) as BackdropFilterComposer;

backdropFilters.value = backdropFilterValue;
backdropFilters.style = backdropFilterStyle;

export default backdropFilters;

const supportsBackdropQuery =
  '((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))';

/**
 * Emits a global @supports guard (via the shared fallback helper) so we can
 * provide backdrop-filter powered styles while keeping deterministic
 * fallbacks for browsers that lack support.
 *
 * Example usage:
 *
 * ```
 * registerBackdropFallback({
 *   selector: '.frostedCard',
 *   supported: backdropFilters.style({ blur: glassVars.blur }),
 *   fallback: { backgroundColor: glassVars.backupFill.css() },
 * });
 * ```
 */
export const registerBackdropFallback =
  createSupportsFallback(supportsBackdropQuery);
