import { style } from '@vanilla-extract/css';
import * as csstype from 'csstype';
import { flexPosition } from './helpers/positioning';

// Utility classes
// Note that in contrast to helper functions, they output a ready made class,
// not properties of a class.

const utilityStyles = {
	//   isVisibilityHidden: style({
	//     visibility: 'hidden !important' as csstype.Property.Visibility,
	//   }),
	//   isScOnly: style({
	//     position: 'absolute',
	//     width: '1px',
	//     height: '1px',
	//     padding: '0',
	//     margin: '-1px',
	//     overflow: 'hidden',
	//     clip: 'rect(0,0,0,0)',
	//     border: '0',
	//   }),
	//   isHidden: style({
	//     display: 'none !important' as csstype.Property.Display,
	//   }),
	//   isNoInteraction: style({
	//     userSelect: 'none',
	//     pointerEvents: 'none',
	//   }),
	//   toolTipWrap: style({
	//     width: '100%',
	//   }),
	//   center: style({
	//     ...flexPosition.center(),
	//   }),
	//   visibleOnFocus: style({
	//     position: 'absolute',
	//     clip: 'rect(0 0 0 0)',
	//     height: '1px',
	//     width: '1px',
	//     margin: '-1px',
	//     overflow: 'hidden',
	//     padding: 0,
	//     selectors: {
	//       ['&:focus, &.focus-visible']: {
	//         zIndex: 1,
	//         width: 'auto',
	//         height: 'auto',
	//         clip: 'auto',
	//       },
	//     },
	//   }),
	//   linkForUI: style({
	//     textDecoration: 'none',
	//     color: 'inherit',
	//     selectors: {
	//       ['&:visited']: {
	//         color: 'inherit',
	//       },
	//     },
	//   }),
};

export default utilityStyles;
