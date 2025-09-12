import { Color } from 'chroma-js';
import { colorVars } from '../vars.css';
export interface IBoxShadow {
	x?: string | 0;
	y?: string | 0;
	blur?: string | 0;
	spread?: string | 0;
	inset?: boolean;
	color?: Color;
}

// Will default to global set of default value
export const globalShadow = (props: IBoxShadow = {}) => {
	const {
		x = '2px',
		y = '4px',
		blur = '4px',
		spread = '2px',
		color = colorVars.shadow,
		inset = false,
	} = props || {};
	return `${x} ${y} ${blur} ${spread} ${color.css()}${inset ? ' inset' : ''}`;
};
