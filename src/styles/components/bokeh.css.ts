// styles/bokeh.css.ts
import { style, keyframes } from '@vanilla-extract/css';
import {
	ReducedMotion,
	reducedMotion,
} from '../helpers/accessibility';

export const overlay = style({
	position: 'fixed',
	inset: 0,
	pointerEvents: 'none',
	mixBlendMode: 'screen',
	opacity: 0,
	transition: 'opacity 0.8s ease-out',
	width: '100vw',
	height: '100vh',
});

export const svg = style({
	width: '100%',
	height: '100%',
	display: 'block',
});

const spin = keyframes({
	'0%': { transform: 'rotate(0turn)' },
	'100%': {
		transform: 'rotate(1turn)',
	},
});

export const rotating = style({
	transformOrigin: '50% 50%',
	animation: `${spin} 40s linear infinite`,
	willChange: 'transform',
	...reducedMotion(ReducedMotion.on, {
		animation: 'none',
	}),
});

export const rotatingSlow = style({
	transformOrigin: '50% 50%',
	animation: `${spin} 70s linear infinite`,
	willChange: 'transform',
	...reducedMotion(ReducedMotion.on, {
		animation: 'none',
	}),
});
