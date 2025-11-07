import { color } from '../helpers/colorWrap.helper';
import { m } from '../measurementKit';
import { mPercent } from '../measurementKit/units/percent';
import type { Stop } from '../helpers/gradients.helper';

export const heroVars = {
	background: {
		linear: [
			{
				color: color('#160d36'),
				at: mPercent(0),
			},
			{
				color: color('#6f4ed1'),
				at: mPercent(100),
			},
		] as Stop[],
		videoOpacity: 0.35,
	},
	paddings: {
		top: m(40),
		bottom: m(40),
	},
	fontLoading: {
		waitForFontsTimeoutMs: 1500,
	},
} as const;

export type HeroVars = typeof heroVars;
