import { m } from 'css-calipers';

const contentPadding = m(40);
// const compactContentPadding = m(26);
// const compressedContentPadding = m(16);

export const layoutVars = {
	contentWidth: m(1400),
	contentPadding,
	halfContentPadding: contentPadding.half(),
	// compact: {
	// 	contentWidth: m(1200),
	// 	contentPadding: m(26),
	// 	halfContentPadding: compactContentPadding.half(),
	// },
	// compressed: {
	// 	contentWidth: m(800),
	// 	contentPadding: m(16),
	// 	halfContentPadding: compressedContentPadding.half(),
	// },
} as const;
