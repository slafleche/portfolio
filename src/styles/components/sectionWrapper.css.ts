import { globalStyle, style } from '@vanilla-extract/css';

import * as layoutStyles from '@/styles/layout.css';

// Served from public/sectionPattern.svg. Kept out of the webpack asset
// pipeline because referencing a `?url` import from a vanilla-extract
// `.css.ts` file produces stale RealContentHashPlugin references across
// compilation passes.
const sectionPatternUrl = '/sectionPattern.svg';

import { layoutVars } from '../../tokens/layout.tokens';
import { backgrounds } from '../helpers/background.helper';
import { margins } from '../helpers/spacing.helper';

export const section = style({
  display: 'flow-root',
});

export const bg = style({
  ...backgrounds({
    url: sectionPatternUrl,
    size: '83px 87px',
    repeat: 'repeat',
  }),
});

export const endToEnd = style({});

export const designSystems = style({});

export const aboutMe = style({});

export const approach = style({});

export const caseStudies = style({});

export const projects = style({});

globalStyle(`.${section} > .${layoutStyles.content}`, {
  ...margins({
    top: layoutVars.content.gap,
  }),
});
