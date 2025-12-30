import {
  globalStyle,
  style,
  type ComplexStyleRule,
} from '@vanilla-extract/css';
import { formTokens } from '@/tokens/forms.tokens';
import { colorVars } from '../../tokens/global.tokens';
import {
  // glassVars,
  glassyButtonTokens,
} from '../../tokens/glassy.tokens';
import borders from '../helpers/borders.helper';
import { boxShadow } from '../helpers/shadow.helper';
import { margins, paddings } from '../helpers/spacing.helper';
import { backgrounds } from '../helpers/background.helper';
import { m, mPercent } from 'css-calipers';
import { formFontVariants } from '../../tokens/fontVariants/forms';
import { fontStylesFromFontVariant } from '../helpers/fontVariant.helper';
import { typographyFontVariants } from '../../tokens/fontVariants/typography';
import { relativeFontWeight } from '../helpers/typography.helper';

export const form = style({
  display: 'grid',
  gap: formTokens.layout.sectionGap.css(),
  maxWidth: formTokens.layout.maxWidth.css(),
  ...fontStylesFromFontVariant(formFontVariants.base),
  width: '100%',
  ...margins({
    horizontal: 'auto',
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
  ...fontStylesFromFontVariant(formFontVariants.input),
  ...relativeFontWeight(formFontVariants.input, mPercent(60)),
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
  ...fontStylesFromFontVariant(formFontVariants.input),
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
        ...borders(formTokens.field.focusVisible.borders, {
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
  ...fontStylesFromFontVariant(formFontVariants.hints),
  fontSize: '0.85rem',
});

export const counter = style({
  color: formTokens.counter.text.color.css(),
  ...fontStylesFromFontVariant(formFontVariants.hints),
  fontSize: '0.85rem',
});

export const helperText = style({
  color: formTokens.counter.text.color.css(),
  ...fontStylesFromFontVariant(formFontVariants.hints),
  fontSize: '0.85rem',
});

export const empty = style({});

const statusBase: ComplexStyleRule = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  // ...borders(formTokens.field.borders),
  ...paddings(formTokens.field.paddings),
  gap: formTokens.layout.fieldGap.css(),
};

export const status = style(statusBase);

export const statusSuccess = style([
  statusBase,
  {
    ...backgrounds(formTokens.status.success.backgrounds),
    ...borders(formTokens.status.success.borders),
  },
]);

export const statusError = style([
  statusBase,
  {
    ...backgrounds(formTokens.status.error.backgrounds),
    ...borders(formTokens.status.error.borders),
  },
]);

export const statusGeneric = style([
  statusBase,
  {
    ...backgrounds(formTokens.status.generic.backgrounds),
    ...borders(formTokens.status.generic.borders),
  },
]);

export const statusText = style({
  flex: 1,
});

export const loader = style({
  width: '100px',
  height: 'auto',
});

export const statusWrapper = style({
  minHeight: '6px',
  transition: 'opacity 220ms ease, transform 220ms ease',
  opacity: 1,
  transform: 'translateY(0)',
  pointerEvents: 'auto',
  selectors: {
    '&[data-visible="false"]': {
      opacity: 0,
      transform: 'translateY(-8px)',
      pointerEvents: 'none',
    },
  },
});

export const statusSuccessStandalone = style({
  width: '100%',
});

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
  minHeight: formTokens.button.minHeight.css(),
  ...paddings({
    vertical: m(0),
    horizontal: formTokens.button.paddings.horizontal,
  }),
  border: 'none',
  ...borders(glassyButtonTokens.borders),
  ...backgrounds(glassyButtonTokens.backgrounds),
  color: glassyButtonTokens.text.color.css(),
  fontWeight: 600,
  ...boxShadow(glassyButtonTokens.boxShadows),
  // ...backdropFilters.style({ blur: glassVars.blur }),
  transition:
    'transform 160ms ease, opacity 160ms ease, background 160ms ease, box-shadow 160ms ease',
  selectors: {
    '&:hover, &[data-debug="hover"]': {
      ...backgrounds(glassyButtonTokens.hover.backgrounds),
      ...boxShadow(glassyButtonTokens.hover.boxShadows),
      transform: 'translateY(-1px)',
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

export const privacy = style({
  fontSize: '0.9rem',
  color: formTokens.privacy.text.color.css(),
  ...fontStylesFromFontVariant(formFontVariants.hints),
  textAlign: 'left',
});

export const privacyLink = style({
  background: 'none',
  border: 'none',
  padding: 0,
  font: 'inherit',
  color: formTokens.privacy.text.color.css(),
  textDecoration: 'underline',
  textDecorationThickness: 'from-font',
  textUnderlineOffset: 4,
  cursor: 'pointer',
  selectors: {
    '&:hover': {
      opacity: 0.9,
    },
    '&:focus, &:focus-visible': {
      outline: 'none',
      ...boxShadow(formTokens.field.focusVisible.shadow),
    },
  },
});

export const turnstileSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  selectors: {
    '&[data-disabled="true"], &[data-debug="disabled"]': {
      opacity: 0.55,
      cursor: 'not-allowed',
    },
  },
});

export const turnstileWidget = style({
  minHeight: '70px',
  // borderRadius: 12,
  // ...borders({
  //   width: m(1),
  //   color: 'rgba(245,240,255,0.12)',
  // }),
  // ...backgrounds({ color: 'rgba(8,6,16,0.6)' }),
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

export const privacyOverlay = style({
  position: 'fixed',
  inset: 0,
  backgroundColor: colorVars.black.alpha(0.85).css(),
  // ...backdropFilters.style({ blur: glassVars.blur.double() }),
  zIndex: 1100,
});

export const privacyDialog = style({
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  ...paddings({
    vertical: m(8),
    horizontal: m(6),
  }),
  zIndex: 1101,
});

export const privacyPanel = style({
  position: 'relative',
  width: 'min(70ch, 90vw)',
  maxHeight: '80vh',
  ...paddings({
    vertical: m(12),
    horizontal: m(11),
  }),
  ...borders(formTokens.field.borders),
  backgroundColor: colorVars.bodyBg.css(),
  color: colorVars.bodyFg.css(),
  ...boxShadow({
    x: m(0),
    y: m(3),
    blur: m(12),
    color: colorVars.black,
    alpha: 0.35,
  }),
  overflowY: 'auto',
  display: 'grid',
  gap: formTokens.layout.fieldGap.css(),
});

export const privacyTitle = style({
  margin: 0,
  fontSize: '1.6rem',
  fontWeight: 700,
});

export const privacyUpdated = style({
  margin: 0,
  color: colorVars.bodyFg.alpha(0.7).css(),
  fontSize: '0.9rem',
});

export const privacyBody = style({
  fontSize: '0.95rem',
  lineHeight: 1.6,
});

export const privacyCloseIcon = style({
  position: 'absolute',
  top: '4px',
  right: '4px',
  width: glassyButtonTokens.iconSize.css(),
  height: glassyButtonTokens.iconSize.css(),
  ...borders(glassyButtonTokens.borders),
  ...backgrounds(glassyButtonTokens.backgrounds),
  color: glassyButtonTokens.text.color.css(),
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: glassyButtonTokens.iconSize.css(),
  fontWeight: 600,
  cursor: 'pointer',
  ...boxShadow(glassyButtonTokens.boxShadows),
  // ...backdropFilters.style({ blur: glassVars.blur.double() }),
  // transition: glassyButtonTokens.transition,
  selectors: {
    '&:hover': {
      // background: glassyButtonTokens.hover.background.color.css(),
      ...boxShadow(glassyButtonTokens.hover.boxShadows),
      transform: 'translateY(-1px)',
    },
    '&:focus, &:focus-visible': {
      outline: 'none',
      // ...backgrounds(glasssButtonTokens.focusVisible.backgrounds),
      // background:
      // glassyButtonTokens.focusVisible.background.color.css(),
      ...boxShadow(glassyButtonTokens.focusVisible.boxShadows),
    },
    '&:active': {
      transform: 'translateY(0)',
      ...boxShadow(glassyButtonTokens.boxShadows),
    },
  },
});

export const visuallyHidden = style({
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

export const toastRoot = style({
  width: '100%',
  maxWidth: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: formTokens.layout.fieldGap.css(),
  ...paddings(formTokens.field.paddings),
  ...borders(formTokens.field.borders),
  ...boxShadow({
    x: m(0),
    y: m(4),
    blur: m(14),
    color: colorVars.black,
    alpha: 0.35,
  }),
  pointerEvents: 'auto',
});

export const toastSuccess = style([
  {
    ...backgrounds(formTokens.status.success.backgrounds),
    ...borders(formTokens.status.success.borders),
  },
]);

export const toastError = style([
  {
    ...backgrounds(formTokens.status.error.backgrounds),
    ...borders(formTokens.status.error.borders),
  },
]);

export const toastInfo = style([
  {
    ...backgrounds(formTokens.status.generic.backgrounds),
    ...borders(formTokens.status.generic.borders),
  },
]);

export const toastTitle = style({
  flex: 1,
  margin: 0,
  fontWeight: 600,
});

export const toastClose = style({
  border: 'none',
  background: 'none',
  color: colorVars.bodyFg.css(),
  fontSize: '1.25rem',
  lineHeight: 1,
  cursor: 'pointer',
  padding: 0,
  minWidth: glassyButtonTokens.iconSize.css(),
  minHeight: glassyButtonTokens.iconSize.css(),
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const toastViewport = style({
  position: 'fixed',
  bottom: '6px',
  right: '6px',
  width: 'min(320px, calc(100vw - 32px))',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: formTokens.layout.fieldGap.css(),
  zIndex: 1300,
  pointerEvents: 'none',
  outline: 'none',
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
  // ...borders.radii({ radius: m(32) }),
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
  margin: 0,
  ...fontStylesFromFontVariant(typographyFontVariants.h2),
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
