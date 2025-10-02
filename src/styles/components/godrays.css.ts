import { style } from '@vanilla-extract/css';
import { absolutePosition, fullSizeOfParent } from '../helpers/positioning';

export const root = style({
	...fullSizeOfParent(),
	position: 'absolute',
	inset: 0,
	overflow: 'hidden',
	zIndex: 0, // sits below text content
});

export const image = style({
	position: 'absolute',
	inset: 0,
	width: '100%',
	height: '100%',
	objectFit: 'cover',
	zIndex: 0,
});

export const canvas = style({
	...absolutePosition.fullSize(),
	zIndex: 1,
	pointerEvents: 'none',
});
