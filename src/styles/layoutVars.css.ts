import { m } from './helpers/measurement';

const contentPadding = m(40);
const compactContentPadding = m(26);
const compressedContentPadding = m(16);

export const layoutVars = {
	contentWidth: '1400px',
	contentPadding: contentPadding.css(),
	halfContentPadding: contentPadding.divide(2).css(),
	// Tigher padding
	compact: {
		contentWidth: '1200px',
		contentPadding: '26px',
		halfContentPadding: compactContentPadding.divide(2).css(),
	},
	// Very tight padding
	compressed: {
		contentWidth: '800px',
		contentPadding: '16px',
		halfContentPadding: compressedContentPadding.divide(2).css(),
	},
};
