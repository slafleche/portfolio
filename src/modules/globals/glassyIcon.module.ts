import { mPercent } from '../../styles/measurementKit';

export const glassyIcons = {
  borders: {
    radius: mPercent(42),
  },
} as const;

export type GlassyIcons = typeof glassyIcons;
