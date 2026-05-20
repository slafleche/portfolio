import { globalStyle, style } from '@vanilla-extract/css';

import * as layoutStyles from '@/styles/layout.css';

import { colors } from '../../tokens/global.tokens';
import { layoutVars } from '../../tokens/layout.tokens';
import { margins } from '../helpers/spacing.helper';

export const section = style({
  display: 'flow-root',
});

export const endToEnd = style({
  backgroundColor: colors.white.alpha(0.02).css(),
});

export const designSystems = style({});

export const aboutMe = style({
  backgroundColor: colors.white.alpha(0.02).css(),
});

export const approach = style({});

export const caseStudies = style({
  // backgroundColor: colors.white.alpha(0.02).css(),
});

export const projects = style({});

globalStyle(`.${section} > .${layoutStyles.content}`, {
  ...margins({
    top: layoutVars.content.gap,
  }),
});
