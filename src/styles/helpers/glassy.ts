import { colorVars, IBorder } from '../vars';
import chroma from 'chroma-js';
import { m } from './measurement';
import type * as CSS from 'csstype';

const createNoiseSvg = (filterId: string) =>
	`
<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60">
  <filter id="${filterId}">
    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#${filterId})" opacity="0.8"/>
</svg>`.trim();

const noiseFilterId = `glassy-noise-${Math.random().toString(36).slice(2, 10)}`;
const noiseSvg = createNoiseSvg(noiseFilterId);

export const glassVars = {
	/** Base backdrop tint; call `.css()` when assigning to styles */
	bg: chroma('white').alpha(0.06),
	/** Highlight tint blended into the frosted gradient */
	tint1: chroma('hsl(210, 80%, 70%)').alpha(0.1),
	/** Shadow tint blended into the frosted gradient */
	tint2: chroma('hsl(280, 80%, 70%)').alpha(0.14),
	/** Default border color for glass frames */
	border: chroma('white').alpha(0.25),
	/** Base color for inner-rim and wedge highlights */
	innerRim: chroma('white').alpha(0.22),
	/** Backdrop blur radius applied to frosted surfaces */
	blur: m(15),
	/** Default corner radius for the glass frame */
	cornerRadius: m(32),
	cornerSheen: {
		/** Overall strength (0 → none, 1 → strong) */
		strength: 0.35,
		/** Radial hotspot radius; the wedge fades beyond this */
		size: m(120, '%'),
		/** Wedge angle in degrees (0–180) */
		angle: m(95, 'deg'),
		/** Ring thickness around the panel (px) */
		ring: m(4),
		/** Offset from corner so sheen respects outer radius */
		offset: m(0),
	},
	innerHighlight: {
		/** Alpha for the radial component of the inner wedge */
		radialAlpha: 0.45,
		/** Alpha for the angular wedge band */
		wedgeAlpha: 0.9,
		/** Overall opacity applied to the inner highlight layer */
		opacity: 0.55,
	},
	surfaceGlow: {
		/** Blur radius for the large soft glow overlay */
		blur: m(12),
		/** Overall opacity applied to the glow gradient */
		opacity: 0.5,
		/** Alpha applied to `tint1` within the glow gradient */
		tint1Alpha: 0.35,
		/** Alpha applied to `tint2` within the glow gradient */
		tint2Alpha: 0.25,
	},
	// Subtle white overlay settings used by glassy.bg
	overlay: {
		/** Overlay color used for the subtle top-to-bottom wash */
		color: chroma('white'),
		/** Alpha at the top stop of the overlay gradient */
		topAlpha: 0.05,
		/** Midpoint stop for the overlay gradient */
		midStop: '45%',
		/** Alpha at the bottom stop of the overlay gradient */
		bottomAlpha: 0.2,
		/** Direction (in degrees) for the overlay gradient */
		direction: m(45, 'deg'),
	},
	/** Shared noise texture for glass surfaces */
	noiseDataUri: `url("data:image/svg+xml;utf8,${encodeURIComponent(noiseSvg)}")`,
	/** Unique filter id embedded in the noise texture */
	noiseFilterId,
};

export const panelBorder = {
	/** Visible stroke thickness used for standalone glass panels */
	thickness: m(3),
	/** Base color used by the panel rim */
	rimColor: colorVars.white,
	/** Hotspot position for the inner rim gradient */
	rimHotPosX: 0.55,
	/** Hotspot coverage for panel rims */
	rimHotCoverage: 0.25,
	/** Baseline left alpha for panel rims */
	rimBaseLeft: 0.12,
	/** Baseline mid alpha for panel rims */
	rimBaseMid: 0.34,
	/** Peak alpha for panel rims */
	rimPeak: 0.42,
	/** Baseline right alpha for panel rims */
	rimBaseRight: 0.18,
};

export const glossyBorder = {
	// We're layering two effects, so this is the base vars for the parent
	base: {
		radius: m(34),
		color: colorVars.transparent,
	} satisfies IBorder,
};

export const createGlassBackground = (): {
	background: CSS.Property.Background<string>;
	backdropFilter: CSS.Property.BackdropFilter;
	WebkitBackdropFilter: CSS.Property.BackdropFilter;
} => ({
	background: [
		`linear-gradient(${glassVars.overlay.direction.css()}, ${glassVars.overlay.color
			.alpha(glassVars.overlay.topAlpha)
			.css()}, ${glassVars.overlay.color.alpha(0).css()} ${glassVars.overlay.midStop}, ${glassVars.overlay.color
			.alpha(glassVars.overlay.bottomAlpha)
			.css()} 100%)`,
		`linear-gradient(135deg, ${glassVars.tint1.css()}, ${glassVars.tint2.css()})`,
		glassVars.bg.css(),
	].join(', '),
	backdropFilter: `blur(${glassVars.blur.css()})`,
	WebkitBackdropFilter:
		`blur(${glassVars.blur.css()})` as CSS.Property.BackdropFilter,
});
