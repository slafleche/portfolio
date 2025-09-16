import { measurement } from './measurement';

const noiseSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60">
  <filter id="n">
    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#n)" opacity="0.55"/>
</svg>`.trim();

export const glassVars = {
  bg: 'hsla(0 0% 100% / 0.06)',
  tint1: 'hsla(210 80% 70% / 0.10)',
  tint2: 'hsla(280 80% 70% / 0.14)',
  border: 'hsla(0 0% 100% / 0.25)',
  innerRim: 'hsla(0 0% 100% / 0.22)',
  // shadow: '0 12px 24px hsla(0 0% 100% / 0.06)',
  // radius: '18px',
  // padding: '24px',
  blur: '20px',
  noiseDataUri: `url("data:image/svg+xml;utf8,${encodeURIComponent(noiseSvg)}")`,
};

export const glossyBorderVars = {
  thickness: measurement(7),
  // Smooth sweep around the edge
  base: `conic-gradient(
    from 200deg at 50% 50%,
    hsla(0,0%,100%,0.55) 0deg,
    hsla(0,0%,100%,0.22) 120deg,
    hsla(0,0%,100%,0.06) 210deg,
    transparent 1turn
  )`,
  // Bottom-center hotspot to accent the “tip”
  hot: `radial-gradient(
    120% 80% at 50% 92%,
    hsla(0,0%,100%,0.26) 0%,
    hsla(0,0%,100%,0.08) 55%,
    transparent 70%
  )`,
};

// export const roundButton = (buttonSize: csstype.Property.Width) => {
// 	return {
// 		...flexPosition.center(),
// 		position: 'relative',
// 		textDecoration: 'none',
// 		borderRadius: '50%',
// 		fontWeight: fontVars.body.semiBold,
// 		transition: 'background, color 0.3s, 0.2s ease-in',
// 		width: buttonSize,
// 		height: buttonSize,
// 		minHeight: buttonSize,
// 		minWidth: buttonSize,
// 		border: `solid ${colors.brand.css()} 3px`,
// 		...reducedMotion(ReducedMotion.off, {
// 			border: `solid ${colors.white.css()} 1px`,
// 		}),
// 		selectors: {
// 			['&&']: {
// 				color: colors.brand.css(),
// 				outlineColor: colors.white.css(),
// 			},
// 			['&:after']: {
// 				...reducedMotion(ReducedMotion.off, {
// 					content: '',
// 					...absolutePosition.fullSize(),
// 					border: `solid ${colors.brand.css()} 3px`,
// 					borderRadius: '50%',
// 					transform: 'scale(1)',
// 					transition: 'opacity, transform, filter 0.3s, 0.2s ease-out',
// 				}),
// 			},
// 			['&:hover:after, &:focus:after']: {
// 				opacity: 0,
// 				transform: 'scale(2)',
// 			},

// 			['&:hover, &:focus']: {
// 				backgroundColor: colors.brand.css(),
// 				color: colors.white.css(),
// 			},
// 			['&:focus-visible, &.focus-visible']: {
// 				outline: `solid ${colors.white.css()} 1px`,
// 				outlineStyle: 'dotted',
// 				outlineOffset: '-5px',
// 			},
// 		},
// 	};
// };

// export const glassyBg = (idPrefix) => {
// 	return {

// 	}

//     <!-- Frosted glass: blur the background under the panel -->
//     <filter id="frostBlur" x="-20%" y="-20%" width="140%" height="140%">
//       <feGaussianBlur stdDeviation="8"/>
//     </filter>

//     <!-- Soft inner shadow -->
//     <filter id="innerSoft" x="-20%" y="-20%" width="140%" height="140%">
//       <feGaussianBlur in="SourceAlpha" stdDeviation="14" result="blur"/>
//       <feOffset dy="10" result="off"/>
//       <feComposite in="off" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="inner"/>
//       <feColorMatrix in="inner" type="matrix"
//         values="0 0 0 0 0
//                 0 0 0 0 0
//                 0 0 0 0 0
//                 0 0 0 .22 0"/>
//     </filter>

//     <!-- Frosty fill tint -->
//     <linearGradient id="frostFill" x1="0%" y1="0%" x2="100%" y2="100%">
//       <stop offset="0%"   stop-color="white" stop-opacity="0.28"/>
//       <stop offset="55%"  stop-color="white" stop-opacity="0.16"/>
//       <stop offset="100%" stop-color="white" stop-opacity="0.10"/>
//     </linearGradient>

//     <!-- Rim highlight gradient -->
//     <linearGradient id="rimBase" x1="0%" y1="0%" x2="100%" y2="40%">
//       <stop offset="0%"   stop-color="white" stop-opacity="0.65"/>
//       <stop offset="40%"  stop-color="white" stop-opacity="0.22"/>
//       <stop offset="100%" stop-color="white" stop-opacity="0"/>
//     </linearGradient>
//   </defs>

//   <!-- (Optional) a subtle vignette so glass reads better -->
//   <radialGradient id="vign" cx="50%" cy="50%" r="75%">
//     <stop offset="60%" stop-color="black" stop-opacity="0"/>
//     <stop offset="100%" stop-color="black" stop-opacity="0.25"/>
//   </radialGradient>
//   <rect width="100%" height="100%" fill="url(#vign)"/>

//   <!-- GLASS PANEL: blur the background only where the shape is -->
//   <g clip-path="url(#clipS)">
//     <!-- blurred copy of the background under the shape -->
//     <use href="#bgImg" filter="url(#frostBlur)"/>
//     <!-- frosty white tint -->
//     <use href="#S" fill="url(#frostFill)"/>
//   </g>

//   <!-- Inner shadow on the panel -->
//   <use href="#S" fill="transparent" filter="url(#innerSoft)"/>

//   <!-- Rim highlight (thin glowing edge) -->
//   <g mask="url(#rimMask)">
//     <use href="#S" fill="url(#rimBase)"/>
//   </g>

//   <!-- (Optional) hairline stroke to crispen the edge on dark BGs -->
//   <use href="#S" fill="none" stroke="white" stroke-opacity="0.06" stroke-width="1"/>
// </svg>

// };
