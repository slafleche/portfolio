import { style } from '@vanilla-extract/css';
import { assertUnit } from '../measurementKit';
import {
  chevronVars,
  colorVars,
} from '../componentTokens/componentTokens.global';
// import borders from '../helpers/borders';
import { boxShadow } from '../helpers/shadow';

if (process.env.NODE_ENV !== 'production') {
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
  borderRadius: '50%',
  width: chevronVars.width.add(chevronVars.padding.double()).css(),
  height: chevronVars.width.add(chevronVars.padding.double()).css(),
  transition: 'background 0.3s ease-in',
  boxShadow: boxShadow(),
  selectors: {
    '&:hover': {
      opacity: 1,
      // background: colorVars.bodyBg.css(),
    },
  },
});
