import { style } from '@vanilla-extract/css';
import { globalMediaQueryStyles } from './responsive/mediaQueries';
import { paddings } from './helpers/spacing';
import { layoutVars } from './layoutVars.css';
import { glossyBorder } from './helpers/glassy';
import borders from './helpers/borders';

export const content = style({
	position: 'relative',
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

export const panel = style({
	display: 'flex',
	flexDirection: 'column',
});
