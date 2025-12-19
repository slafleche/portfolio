import { style } from '@vanilla-extract/css';
import { assertUnit, m } from 'css-calipers';
import { chevronVars, colorVars } from '../../tokens/global.tokens';
import { boxShadow } from '../helpers/shadow.helper';
import borders from '../helpers/borders.helper';
import { notRelease } from '@/lib/runtimeEnv';

if (notRelease()) {
  assertUnit(chevronVars.width, 'px', 'skipToContent chevron width');
  assertUnit(
    chevronVars.padding,
    'px',
    'skipToContent chevron padding',
  );
  assertUnit(
    chevronVars.container.height,
    'px',
    'skipToContent container height',
  );
}

export const root = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: chevronVars.container.height.css(),
});

export const link = style({
  background: colorVars.bodyBg.alpha(0.5).css(),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  ...borders.radii({ radius: m(50, '%') }),
  width: chevronVars.width.add(chevronVars.padding.double()).css(),
  height: chevronVars.width.add(chevronVars.padding.double()).css(),
  transition: 'background 0.3s ease-in',
  ...boxShadow(),
  selectors: {
    '&:hover': {
      opacity: 1,
      // background: colorVars.bodyBg.css(),
    },
  },
});
