import { color } from '../helpers/colorWrap';
import { m } from '../measurement';
import type { Stop } from '../helpers/gradients';

export const heroVars = {
	background: {
		linear: [
			{
				color: color('#160d36'),
				at: 0,
			},
			{
				color: color('#6f4ed1'),
				at: 100,
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
