import { style } from '@vanilla-extract/css';
import { m } from 'css-calipers';

export const caseStudyNoLogoText = style({
  selectors: {
    '&[data-position="before"]': {
      marginLeft: m(0.5, 'em').css(),
    },
    '&[data-position="after"]': {
      marginRight: m(0.5, 'em').css(),
    },
  },
});

const caseStudyLogoHeight = m(2.1, 'em');
const caseStudyLogoOffset = caseStudyLogoHeight.divide(9.3).round(3);

export const caseStudyLogo = style({
  display: 'inline-block',
  height: caseStudyLogoHeight.css(),
  transform: `translateY(${caseStudyLogoOffset.css()})`,
  width: 'auto',
  verticalAlign: 'baseline',
});
