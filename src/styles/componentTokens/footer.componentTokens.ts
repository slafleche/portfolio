import { fontVariants } from '../../tokens/fontVariants.tokens';
import { textStyleVars } from '../../tokens/textStyles.tokens';
import { color } from '../helpers/colorWrap.helper';
import type { CardGradientPack } from '../helpers/cardGradient.helper';

const footerGradient: CardGradientPack = {
	linear: [
		{
			color: color('#51287a'),
			at: 0,
		},
		{
			color: color('#51287a'),
			at: 30,
			blend: 1,
		},
		{
			color: color('#5B66D6'),
			at: 80,
			blend: 0.3,
		},
		{
			color: color('#6E4DCC'),
			at: 100,
		},
	],
	spots: [
		{
			color: color('#9BE8FB').alpha(0.5),
			x: 20,
			y: 110,
			scale: 80,
			blendMode: 'normal',
		},
		{
			color: color('#51287a').alpha(0.4),
			x: 90,
			y: 53,
			scale: 100,
			softenL: 10,
			blendMode: 'normal',
		},
		{
			color: color('#287a52').alpha(0.7),
			x: 63,
			y: 100,
			scale: 80,
			blendMode: 'normal',
		},
		{
			color: color('#00ff6e').alpha(0.3),
			x: 80,
			y: 60,
			scale: 80,
			blendMode: 'normal',
		},
		{
			color: color('#ff00bf').alpha(0.6),
			x: 66,
			y: 70,
			scale: 70,
			blendMode: 'normal',
		},
	],
};

export const footerVars = {
	heading: fontVariants.h2,
	body: textStyleVars.paragraph,
	gradient: footerGradient,
} as const;

export type FooterVars = typeof footerVars;
