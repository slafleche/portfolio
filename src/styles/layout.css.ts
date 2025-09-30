import { style } from '@vanilla-extract/css';
import { globalMediaQueryStyles } from './responsive/mediaQueries';
import { paddings } from './helpers/spacing';
import { layoutVars } from './layoutVars.css';

export const content = style({
	width: '100%',
	maxWidth: layoutVars.contentWidth,
	margin: 'auto',
	...paddings({
		horizontal: layoutVars.contentPadding,
	}),
	...globalMediaQueryStyles({
		compact: {
			...paddings({
				horizontal: layoutVars.compact.contentPadding,
			}),
		},
		compressed: {
			...paddings({
				horizontal: layoutVars.compressed.contentPadding,
			}),
		},
	}),
});
