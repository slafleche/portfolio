import { keyframes, style } from '@vanilla-extract/css';
import { m, mEm, mPercent } from 'css-calipers';

import { fontFamilies } from '../../tokens/fontFamilies.tokens';
import { glassyButtonCupped } from '../../tokens/glassy.tokens';
import { colorVars, themeColours } from '../../tokens/global.tokens';
import borders from '../helpers/borders.helper';
import {
  buildLinear,
  gradientAsBgImg,
} from '../helpers/gradients.helper';
import { boxShadow } from '../helpers/shadow.helper';
import { margins, paddings } from '../helpers/spacing.helper';
import { relativeFontWeight } from '../helpers/typography.helper';
import { mediaQueryStyle } from '../responsive/mediaQueries';

const anticipationMs = 200;
const iconStrikeMs = 0;
const textMoveMs = 180;
const settleMs = 500;
const totalMs = anticipationMs + iconStrikeMs + textMoveMs + settleMs;

const iconBumpOffset = 10; // offset left on first phase
const iconStrikeOffshoot = -5; // offset left after second phase

const pct = (value: number) =>
  `${((value / totalMs) * 100).toFixed(2)}%`;
const iconTransform = (x: number) =>
  `translateX(${x}px) rotate(135deg)`;

const ANIM_EASEOUT = 'ease-out';

const iconBumpFrames = {
  '0%': { transform: iconTransform(0) },
  [pct(anticipationMs)]: { transform: iconTransform(-12) },
  [pct(anticipationMs + iconStrikeMs)]: {
    transform: iconTransform(iconBumpOffset),
  },
  [pct(anticipationMs + iconStrikeMs + textMoveMs + settleMs * 0.3)]:
    { transform: iconTransform(iconBumpOffset) },
  [pct(anticipationMs + iconStrikeMs + textMoveMs + settleMs * 0.45)]:
    { transform: iconTransform(iconStrikeOffshoot) },
  '100%': { transform: iconTransform(0) },
};
const iconBumpA = keyframes(iconBumpFrames);
const iconBumpB = keyframes(iconBumpFrames);

export const root = style({
  overflow: 'hidden',
  position: 'relative',
  ...margins({ top: m(80) }),
  ...gradientAsBgImg(buildLinear(themeColours.gradients.ctaConfig)),
  fontSize: '22px',
  lineHeight: 1,
  ...relativeFontWeight(fontFamilies.objectSans, mPercent(0)),
  ...paddings(m(8)),
  ...borders.radii([
    m(40),
    m(60),
  ]),
  userSelect: 'none',
  color: colorVars.black.lighten(0.1).css(),
  textDecoration: 'none',
  opacity: 0,
  pointerEvents: 'none',
  selectors: {
    // '&:hover, &:focus': {
    //   // transform: 'scale(1.015)',
    // },
    '&[data-ready="true"]': {
      opacity: 1,
      pointerEvents: 'auto',
    },
  },
});

export const ctaInner = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 3,
  ...paddings({
    vertical: m(8),
    horizontal: m(18),
  }),
  ...borders.radii([
    m(30),
    m(40),
  ]),
});

export const scoopedGradient = style({
  ...gradientAsBgImg(glassyButtonCupped.gradient),
});

export const ctaText = style({
  display: 'inline-block',
  fontSize: '25px',
  textWrap: 'nowrap',
  whiteSpace: 'nowrap',
  color: colorVars.white.css(),
  willChange: 'transform',
  selectors: {
    ...mediaQueryStyle({
      notCompact: {
        selectors: {
          '&:hover': {
            cursor: 'pointer',
            // transform: `scale(${glassVars.glassyLinks.hoverFocus.scale})`,
            ...boxShadow({
              x: m(0),
              y: m(24),
              blur: m(36),
              alpha: 0.25,
            }),
          },
        },
      },
    }),
  },
});

export const ctaIcon = style({
  color: colorVars.white.css(),
  width: '32px',
  height: '32px',
  transform: iconTransform(0),
  transformOrigin: '50% 50%',
  willChange: 'transform',
  ...margins({ right: mEm(0.5) }),
  selectors: {
    [`${root}[data-cta-anim="forward"][data-cta-seq="0"] &`]: {
      animation: `${iconBumpA} ${totalMs}ms ${ANIM_EASEOUT} 0s both`,
    },
    [`${root}[data-cta-anim="forward"][data-cta-seq="1"] &`]: {
      animation: `${iconBumpB} ${totalMs}ms ${ANIM_EASEOUT} 0s both`,
    },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      selectors: {
        [`${root}[data-cta-anim="forward"] &`]: {
          animation: 'none',
        },
      },
    },
  },
});
