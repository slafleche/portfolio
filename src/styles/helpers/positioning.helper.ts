import type * as CSS from 'csstype';
import { margins } from './spacing';
export const absolutePosition = {
	topRight: (
		top: string | number = '0',
		right: CSS.Property.Right = '0px',
	) => {
		return {
			position: 'absolute' as CSS.Property.Position,
			top,
			right,
		};
	},
	topLeft: (
		top: string | number = '0px',
		left: CSS.Property.Left = '0px',
	) => {
		return {
			position: 'absolute' as CSS.Property.Position,
			top,
			left,
		};
	},
	bottomRight: (
		bottom: CSS.Property.Bottom = '0px',
		right: CSS.Property.Right = '0px',
	) => {
		return {
			position: 'absolute' as CSS.Property.Position,
			bottom,
			right,
		};
	},
	bottomLeft: (
		bottom: CSS.Property.Bottom = '0px',
		left: CSS.Property.Left = '0px',
	) => {
		return {
			position: 'absolute' as CSS.Property.Position,
			bottom,
			left,
		};
	},
	middle: (shrink: boolean = false) => {
		if (shrink) {
			return {
				position: 'absolute' as CSS.Property.Position,
				display: 'inline-block',
				top: '50%',
				left: '50%',
				right: 'initial',
				bottom: 'initial',
				transform: 'translate(-50%, -50%)',
			};
		} else {
			return {
				position: 'absolute' as CSS.Property.Position,
				display: 'block',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				maxHeight: '100%',
				maxWidth: '100%',
				...margins({ all: 'auto' }),
			};
		}
	},
	middleLeft: (left: CSS.Property.Left = '0px') => {
		return {
			position: 'absolute' as CSS.Property.Position,
			display: 'block',
			top: 0,
			left,
			bottom: 0,
			maxHeight: '100%',
			maxWidth: '100%',
			...margins({
				top: 'auto',
				bottom: 'auto',
			}),
		};
	},
	middleRight: (right: CSS.Property.Right = '0px') => {
		return {
			position: 'absolute' as CSS.Property.Position,
			display: 'block',
			top: 0,
			right,
			bottom: 0,
			maxHeight: '100%',
			maxWidth: '100%',
			...margins({
				top: 'auto',
				bottom: 'auto',
			}),
		};
	},
	middleBottom: (bottom: CSS.Property.Bottom = '0px') => {
		return {
			position: 'absolute' as CSS.Property.Position,
			display: 'block',
			bottom,
			left: 0,
			right: 0,
			maxHeight: '100%',
			maxWidth: '100%',
			...margins({
				horizontal: 'auto',
				vertical: 0,
			}),
		};
	},
	middleTop: (top: CSS.Property.Top = '0px') => {
		return {
			position: 'absolute' as CSS.Property.Position,
			display: 'block',
			top,
			left: 0,
			right: 0,
			maxHeight: '100%',
			maxWidth: '100%',
			...margins({
				horizontal: 'auto',
				vertical: 0,
			}),
		};
	},
	fullSize: () => {
		return {
			display: 'block',
			position: 'absolute' as CSS.Property.Position,
			top: '0px',
			left: '0px',
			width: '100%',
			height: '100%',
		};
	},
};

export const flexPosition = {
	center: (wrap = false) => {
		return {
			display: 'flex' as CSS.Property.Display,
			alignItems: 'center' as CSS.Property.AlignItems,
			justifyContent: 'center' as CSS.Property.JustifyContent,
			flexWrap: (wrap ? 'wrap' : 'nowrap') as CSS.Property.FlexWrap,
		};
	},

	middleLeft: (wrap = false) => {
		return {
			display: 'flex' as CSS.Property.Display,
			alignItems: 'center' as CSS.Property.AlignItems,
			justifyContent: 'flex-start' as CSS.Property.JustifyContent,
			flexWrap: wrap ? 'wrap' : ('nowrap' as CSS.Property.FlexWrap),
		};
	},

	middleRight: (wrap = false) => {
		return {
			display: 'flex' as CSS.Property.Display,
			alignItems: 'center' as CSS.Property.AlignItems,
			justifyContent: 'flex-end' as CSS.Property.JustifyContent,
			flexWrap: wrap ? 'wrap' : ('nowrap' as CSS.Property.FlexWrap),
		};
	},
};

export function flexMiddle() {
	return {
		display: 'flex' as CSS.Property.Flex,
		width: '100%' as CSS.Property.Width,
		height: '100%' as CSS.Property.Height,
		justifyContent: 'center' as CSS.Property.JustifyContent,
		alignItems: 'center' as CSS.Property.AlignItems,
	};
}

export function fullSizeOfParent() {
	return {
		position: 'absolute' as CSS.Property.Position,
		display: 'block' as CSS.Property.Display,
		top: '0px' as CSS.Property.Top,
		left: '0px' as CSS.Property.Left,
		width: '100%' as CSS.Property.Width,
		height: '100%' as CSS.Property.Height,
	};
}

export function inheritHeight() {
	return {
		display: 'flex' as CSS.Property.Display,
		flexDirection: 'column' as CSS.Property.FlexDirection,
		flexGrow: 1 as CSS.Property.FlexGrow,
		position: 'relative' as CSS.Property.Position,
	};
}
