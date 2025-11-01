import { fontFamilies } from './fontFamilies.tokens';
import type { FontStyles } from '@/styles/helpers/types';
import { fontWeight } from '@/styles/helpers/typography.helpers';
import { m } from '@/styles/helpers/measurement';

const defaultHeadingFont = fontFamilies.urbanist;
const defaultBodyFont = fontFamilies.ibm;

export const fontVars = {
	menu: {
		size: m(16),
		...fontFamilies.urbanist,
		waitForFonts: [
			'Urbanist',
		],
	},
 hero: {
		...defaultHeadingFont,
		...fontWeight(defaultHeadingFont, 20),
		lineHeight: 1.1,
		size: m(45),
		waitForFonts: [
			'Outfit',
		],
	},
	heading: {
		...defaultHeadingFont,
	},
	h1: {
		...defaultHeadingFont,
		size: m(45),
		...fontWeight(defaultHeadingFont, 100),
	},
	h2: {
		...defaultHeadingFont,
		size: m(25),
		...fontWeight(defaultHeadingFont, 100),
	},
	h3: {
		...defaultHeadingFont,
		size: m(20),
		...fontWeight(defaultHeadingFont, 100),
	},
	h4: {
		...defaultHeadingFont,
		size: m(18),
		...fontWeight(defaultHeadingFont, 100),
	},
	h5: {
		...defaultHeadingFont,
		size: m(16),
		...fontWeight(defaultHeadingFont, 100),
	},
	h6: {
		...defaultHeadingFont,
		size: m(14),
		...fontWeight(defaultHeadingFont, 100),
	},
	body: {
		size: m(16),
		lineHeight: 1,
		...defaultBodyFont,
		...fontWeight(defaultBodyFont, 0),
	},
} satisfies Record<string, FontStyles>;
