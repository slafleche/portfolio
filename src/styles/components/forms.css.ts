import { globalStyle, keyframes, style } from '@vanilla-extract/css';
import { m, mPercent } from 'css-calipers';

import { formTokens } from '@/tokens/forms.tokens';

import { formFontVariants } from '../../tokens/fontVariants/forms';
import { typographyFontVariants } from '../../tokens/fontVariants/typography';
import {
  glassyButtonCupped,
  glassyButtonTokens,
} from '../../tokens/glassy.tokens';
import {
  colors,
  colorVars,
} from '../../tokens/global.tokens';
import {
  formLayoutVars,
  layoutVars,
} from '../../tokens/layout.tokens';
import { backgrounds } from '../helpers/background.helper';
import borders from '../helpers/borders.helper';
import { gradientAsBgImg } from '../helpers/gradients.helper';
import { absolutePosition } from '../helpers/positioning.helper';
import { boxShadow, textShadow } from '../helpers/shadow.helper';
import { margins, paddings } from '../helpers/spacing.helper';
import {
  fontStylesFromFontVariant,
  relativeFontWeight,
} from '../helpers/typography.helper';
import { globalComponentMediaQueryStyle } from '../responsive/mediaQueries';

export const form = style({
  display: 'grid',
  gap: formTokens.layout.sectionGap.css(),
  ...paddings({
    top: m(70),
    bottom: layoutVars.content.gap,
    horizontal: formLayoutVars.innerPadding,
  }),
  ...backgrounds({
    color: colors.white.alpha(0.02).css(),
  }),
  width: formLayoutVars.maxWidth.css(),
  maxWidth: '100%',
  ...fontStylesFromFontVariant({
    variant: formFontVariants.base,
  }),
  ...margins({
    horizontal: 'auto',
  }),
});

globalStyle(`.${form}`, {
  ...globalComponentMediaQueryStyle({
    contact_noEdge: {
      ...paddings({
        horizontal: formLayoutVars.innerPadding,
      }),
    },
    contact_compact: {
      ...paddings({
        horizontal: formLayoutVars.compact.innerPadding,
      }),
    },
  }),
});

export const fieldset = style({
  border: 'none',
  ...margins(m(0)),
  ...paddings(m(0)),
  display: 'grid',
  gap: formTokens.layout.fieldGap.css(),
});

export const legend = style({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  ...margins(m(-1)),
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
});

export const fieldGroup = style({
  // display: 'grid',
  // gap: formTokens.layout.fieldGap.css(),
});

export const labelRow = style({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',

  // color: formTokens.label.text.color.css(),
  // fontSize: fontFormTokens.label.text.size.css(),
  // fontWeight: 600,
});

export const label = style({
  ...relativeFontWeight(formFontVariants.input, mPercent(80)),
  ...paddings({
    right: m(0.5, 'em'),
  }),
  opacity: 0.8,
  ...textShadow({
    x: m(1),
    y: m(1),
    blur: m(2),
    color: colorVars.black,
  }),
});

export const required = style({
  fontWeight: 400,
  opacity: 0.7,
  fontSize: '0.85em',
});

export const input = style({
  width: '100%',
  ...paddings(formTokens.field.paddings),
  ...borders(formTokens.field.borders),
  ...backgrounds(formTokens.field.backgrounds),
  ...fontStylesFromFontVariant({
    variant: formFontVariants.input,
  }),
  ...relativeFontWeight(formFontVariants.input, mPercent(40)),
  color: formTokens.field.text.color.css(),
  transition: 'border-color 160ms ease, box-shadow 160ms ease',
  outline: 'none',
  boxSizing: 'border-box',
  selectors: {
    '&::placeholder': {
      color: formTokens.field.placeholder.color.css(),
      opacity: 1,
    },
    '&:hover, &[data-debug="hover"]': {
      // ...borders(formTokens.field.hover.borders, {
      //   skipDefaults: true,
      // }),
    },
    '&:focus, &:focus-visible, &[data-debug="focus"], &[data-debug="focus-visible"]':
      {
        ...borders(formTokens.field.hover.borders, {
          skipDefaults: true,
        }),
        //   ...borders(formTokens.field.focusVisible.borders, {
        //   skipDefaults: true,
        // }),
        //   ...boxShadow(formTokens.field.focusVisible.shadow),
      },
    '&[data-disabled="true"], &[data-debug="disabled"]': {
      opacity: 0.85,
      cursor: 'not-allowed',
    },
    '&[data-error="true"]': {
      ...borders(formTokens.field.error.borders, {
        skipDefaults: true,
      }),
    },
  },
});

export const textarea = style({
  width: '100%',
  ...paddings(formTokens.field.paddings),
  ...borders(formTokens.field.borders),
  ...backgrounds(formTokens.field.backgrounds),
  ...fontStylesFromFontVariant({
    variant: formFontVariants.input,
  }),
  color: formTokens.field.text.color.css(),
  transition: 'border-color 160ms ease, box-shadow 160ms ease',
  outline: 'none',
  font: 'inherit',
  boxSizing: 'border-box',
  minHeight: formTokens.textarea.minHeight.css(),
  resize: 'none',
  overflowY: 'hidden',

  selectors: {
    '&::placeholder': {
      color: formTokens.field.placeholder.color.css(),
      opacity: 1,
    },
    '&:hover, &[data-debug="hover"]': {
      // ...borders(formTokens.field.hover.borders, {
      //   skipDefaults: true,
      // }),
    },
    '&:focus, &:focus-visible, &[data-debug="focus"], &[data-debug="focus-visible"]':
      {
        ...borders(formTokens.field.hover.borders, {
          skipDefaults: true,
        }),
        // ...boxShadow(formTokens.field.focusVisible.shadow),
      },
    '&[data-disabled="true"], &[data-debug="disabled"]': {
      opacity: 0.85,
      cursor: 'not-allowed',
    },
    '&[data-error="true"]': {
      color: formTokens.field.error.text.color.css(),
      // ...borders(formTokens.field.error.borders, {
      //   skipDefaults: true,
      // }),
    },
  },
});

export const errorText = style({
  color: formTokens.field.error.text.color.css(),
  ...fontStylesFromFontVariant({
    variant: formFontVariants.hints,
  }),
  fontSize: '0.85rem',
});

export const counter = style({
  color: formTokens.counter.text.color.css(),
  ...fontStylesFromFontVariant({
    variant: formFontVariants.hints,
  }),
  fontSize: '0.85rem',
});

export const helperText = style({
  color: formTokens.counter.text.color.css(),
  ...fontStylesFromFontVariant({
    variant: formFontVariants.hints,
  }),
  fontSize: '0.85rem',
});

export const empty = style({});

export const helperRow = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: formTokens.layout.fieldGap.css(),
});

export const buttonRow = style({
  display: 'flex',
  justifyContent: 'flex-end',
});

export const submitButton = style({
  position: 'relative',
  overflow: 'hidden',
  minHeight: formTokens.button.minHeight.css(),
  ...paddings(formTokens.button.paddings.horizontal),
  border: 'none',
  ...borders(glassyButtonTokens.borders),
  ...backgrounds(glassyButtonTokens.backgrounds),
  color: glassyButtonTokens.text.color.css(),
  fontWeight: 600,
  ...boxShadow(glassyButtonTokens.boxShadows),
  transition:
    'transform 160ms ease, opacity 160ms ease, background 160ms ease, box-shadow 160ms ease',
  selectors: {
    '&:hover, &[data-debug="hover"]': {
      ...backgrounds(glassyButtonTokens.hover.backgrounds),
      ...boxShadow(glassyButtonTokens.hover.boxShadows),
    },
    '&:focus, &:focus-visible, &[data-debug="focus"], &[data-debug="focus-visible"]':
      {
        outline: 'none',
        ...backgrounds(glassyButtonTokens.focusVisible.backgrounds),
        ...boxShadow(glassyButtonTokens.focusVisible.boxShadows),
      },
    '&:disabled, &[data-debug="disabled"]': {
      opacity: 0.85,
      cursor: 'not-allowed',
      transform: 'none',
    },
    '&:active, &[data-debug="active"]': {
      ...boxShadow(glassyButtonTokens.active.boxShadows),
      transform: 'translateY(0)',
    },
  },
});

export const submitInner = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 3,
  ...paddings(m(12)),
  ...borders.radii([
    m(30),
    m(40),
  ]),
  ...gradientAsBgImg(glassyButtonCupped.gradient),
});

export const shineWrapper = style({
  ...absolutePosition.fullSize(),
  opacity: 0.2,
});

export const turnstileSection = style({
  display: 'flex',
  flexDirection: 'column',
  selectors: {
    '&[data-disabled="true"], &[data-debug="disabled"]': {
      opacity: 0.55,
      cursor: 'not-allowed',
    },
  },
});

export const turnstileWidget = style({
  minHeight: '70px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  ...paddings(m(8)),
});

export const turnstilePlaceholder = style({
  fontSize: '0.9rem',
  color: 'rgba(245,240,255,0.75)',
  textAlign: 'center',
});

export const turnstileStatus = style({
  fontSize: '0.85rem',
  color: 'rgba(245,240,255,0.75)',
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
  alignItems: 'center',
});

export const turnstileReset = style({
  background: 'none',
  border: 'none',
  padding: 0,
  font: 'inherit',
  color: colorVars.brand.alpha(0.85).css(),
  textDecoration: 'underline',
  cursor: 'pointer',
});

export const successPanel = style({
  display: 'grid',
  gap: formTokens.layout.fieldGap.css(),
  justifyItems: 'center',
  textAlign: 'center',
  ...paddings({
    vertical: m(24),
    horizontal: m(12),
  }),
  // borderRadius: formTokens.field.borders.radius.css(),
  ...backgrounds(formTokens.status.success.backgrounds),
  ...borders(formTokens.status.success.borders),
});

export const successIconWrapper = style({
  width: '64px',
  height: '64px',
  // ...borders.radii(m(32)),
  ...backgrounds({
    color: formTokens.successPanel.icon.background,
  }),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const successIcon = style({
  width: '36px',
  height: '36px',
  color: formTokens.successPanel.icon.color.css(),
});

export const failIcon = style({
  width: '36px',
  height: '36px',
  color: formTokens.successPanel.icon.color.css(),
});

export const successCopy = style({
  display: 'grid',
  gap: '8px',
  maxWidth: '32ch',
});

export const successHeading = style({
  ...fontStylesFromFontVariant({
    variant: typographyFontVariants.h2,
    baseVariant: typographyFontVariants.heading,
  }),
  fontSize: '1.35rem',
  fontWeight: 700,
  color: colorVars.white.alpha(0.95).css(),
});

export const successBody = style({
  margin: 0,
  fontSize: '1rem',
  lineHeight: 1.5,
  color: formTokens.successPanel.body.color.css(),
});

globalStyle(`${input}[data-error="true"]::placeholder`, {
  color: formTokens.field.error.text.color.css(),
});

globalStyle(`${textarea}[data-error="true"]::placeholder`, {
  color: formTokens.field.error.text.color.css(),
});

export const jumpToFirstIssue = style({
  border: 'none',
  background: 'none',
  padding: 0,
  margin: 0,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  ...paddings({
    vertical: m(12),
  }),
});

const toTopArrowFloat = keyframes({
  '0%': {
    transform: 'translateY(0)',
  },
  '50%': {
    transform: 'translateY(-6px)',
  },
  '100%': {
    transform: 'translateY(0)',
  },
});

export const toTopArrow = style({
  width: '40px',
  height: 'auto',
  ...margins({
    bottom: m(10),
  }),
  color: colors.status.warning.css(),
  animation: `${toTopArrowFloat} 1.8s ease-in-out infinite`,
});

export const jumpToFirstIssueText = style({
  color: colors.status.warning.mix(colors.white, 0.9).css(),
  ...textShadow({
    x: m(1),
    y: m(1),
    blur: m(2),
    color: colorVars.black,
  }),
});


