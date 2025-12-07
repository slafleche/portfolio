import type {
  BorderWidthInput,
  BorderRadiusInput,
  BorderMeasurementInput,
} from '@/tokens/global.tokens';
import type {
  CompassRegion,
  CornerPosition,
} from '@/styles/helpers/types.helper';
import { isMeasurement } from 'css-calipers';
import type {
  Corner,
  RadiusSpec,
  BorderIntent,
} from './borders.types';

export const toCssOrIgnore = (
  v: BorderMeasurementInput,
): string | undefined => {
  if (v == null) return undefined;
  return v.css();
};

export const compressSides = (
  t: string,
  r: string,
  b: string,
  l: string,
) => {
  const allEq = t === r && r === b && b === l;
  if (allEq) return t;
  const vr = t === b;
  const hr = r === l;
  if (vr && hr) return `${t} ${r}`;
  if (hr) return `${t} ${r} ${b}`;
  return `${t} ${r} ${b} ${l}`;
};

export const asWidth = (
  v: BorderWidthInput | undefined,
): string | undefined => {
  if (v == null) return undefined;
  if (isMeasurement(v)) return v.css();
  return undefined;
};

export const asRadius = (
  v: BorderRadiusInput | undefined,
): string | undefined => {
  if (v == null) return undefined;
  if (Array.isArray(v)) {
    const entries = v.filter(isMeasurement);
    if (entries.length === 0) return undefined;
    return entries.map((entry) => entry.css()).join(' ');
  }
  if (isMeasurement(v)) return v.css();
  return undefined;
};

export const isRadiusCompass = (
  value: BorderIntent['radius'],
): value is RadiusSpec =>
  typeof value === 'object' && value !== null;

export const cornersForZone: Record<CompassRegion, Corner[]> = {
  north: [
    'tl',
    'tr',
  ],
  south: [
    'bl',
    'br',
  ],
  east: [
    'tr',
    'br',
  ],
  west: [
    'tl',
    'bl',
  ],
};

export const cornerLookup: Record<CornerPosition, Corner> = {
  nw: 'tl',
  ne: 'tr',
  se: 'br',
  sw: 'bl',
};

export const zoneKeys: CompassRegion[] = [
  'north',
  'south',
  'east',
  'west',
];
