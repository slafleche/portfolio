import {
  globalStyle,
  style,
  type ComplexStyleRule,
} from '@vanilla-extract/css';
import { formTokens } from '@/tokens/forms.tokens';
import { m } from '../measurementKit';
import { colorVars } from '../componentTokens/global.componentTokens';
import {
  glassVars,
  glassyButtonTokens,
} from '../../tokens/glassy.tokens';
import borders from '../helpers/borders.helper';
import { boxShadow } from '../helpers/shadow.helper';
import { paddings } from '../helpers/spacing.helper';
import type { ColorWrapper } from '../helpers/colorWrap.helper';

const controlBase: ComplexStyleRule = {
  width: '100%',
  ...paddings(formTokens.field.paddings),
  ...borders(formTokens.field.borders),
  ...backgrounds(formTokens.field.backgrounds),
  color: formTokens.field.text.color.css(),
  transition: 'border-color 160ms ease, box-shadow 160ms ease',
  outline: 'none',
  font: 'inherit',
  boxSizing: 'border-box',
  selectors: {
    '&::placeholder': {
      color: formTokens.field.placeholderColor.css(),
      opacity: 1,
    },
    '&:hover': {
      ...borders({
        ...formTokens.field.borders,
        ...formTokens.field.hover.borders,
      }),
    },
    '&:focus, &:focus-visible': {
      ...borders({
        ...formTokens.field.borders,
        ...formTokens.field.hover.borders,
      }),
      boxShadow: boxShadow(formTokens.field.focusVisible.shadow),
    },
    '&[data-error="true"]': {
      color: formTokens.field.error.text.color.css(),
      ...borders({
        ...formTokens.field.borders,
        ...formTokens.field.error.borders,
      }),
    },
  },
};

export const form = style({
  display: 'grid',
  gap: formTokens.layout.sectionGap.css(),
  maxWidth: formTokens.layout.maxWidth.css(),
  width: '100%',
  margin: '0 auto',
});

export const fieldset = style({
  border: 'none',
  margin: 0,
  padding: 0,
  display: 'grid',
  gap: formTokens.layout.fieldGap.css(),
});

export const legend = style({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
});

export const fieldGroup = style({
  display: 'grid',
  gap: formTokens.layout.fieldGap.css(),
});

export const labelRow = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  gap: formTokens.layout.fieldGap.css(),
  color: formTokens.label.textColor.css(),
  fontWeight: 600,
});

export const required = style({
  fontWeight: 400,
  opacity: 0.7,
  fontSize: '0.85em',
});

export const input = style(controlBase);

const textareaMinHeight = m(formTokens.message.minRows * 48).css();

export const textarea = style([
  controlBase,
  {
    minHeight: textareaMinHeight,
    resize: 'none',
    overflowY: 'hidden',
  },
]);

export const errorText = style({
  color: formTokens.field.error.text.color.css(),
  fontSize: '0.85rem',
});

const statusBase: ComplexStyleRule = {
  display: 'flex',
  alignItems: 'center',
  ...borders(formTokens.field.borders),
  ...paddings(formTokens.field.paddings),
  gap: formTokens.layout.fieldGap.css(),
};

export const status = style(statusBase);

export const statusSuccess = style([
  statusBase,
  {
    backgroundColor: formTokens.status.success.background.css(),
    borderColor: formTokens.status.success.borderColor.css(),
    color: formTokens.status.success.textColor.css(),
  },
]);

export const statusError = style([
  statusBase,
  {
    backgroundColor: formTokens.status.error.background.css(),
    borderColor: formTokens.status.error.borderColor.css(),
    color: formTokens.status.error.textColor.css(),
  },
]);

export const statusGeneric = style([
  statusBase,
  {
    backgroundColor: formTokens.status.generic.background.css(),
    borderColor: formTokens.status.generic.borderColor.css(),
    color: formTokens.status.generic.textColor.css(),
  },
]);

export const statusText = style({
  flex: 1,
});

export const counter = style({
  color: formTokens.counter.textColor.css(),
  fontSize: '0.85rem',
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
  padding: `0 ${formTokens.button.paddingInline.css()}`,
  borderRadius: formTokens.button.borderRadius.css(),
  border: 'none',
  background: formTokens.status.success.borderColor.css(),
  color: '#0b0b0f',
  fontWeight: 600,
  transition:
    'transform 160ms ease, opacity 160ms ease, background 160ms ease',
  selectors: {
    '&:hover': {
      transform: 'translateY(-1px)',
    },
    '&:focus, &:focus-visible': {
      outline: 'none',
      boxShadow: boxShadow(formTokens.field.focusVisible.shadow),
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
      transform: 'none',
    },
  },
});

export const privacy = style({
  fontSize: '0.9rem',
  color: formTokens.privacy.textColor.css(),
  textAlign: 'left',
});

export const privacyLink = style({
  background: 'none',
  border: 'none',
  padding: 0,
  font: 'inherit',
  color: formTokens.status.success.textColor.css(),
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
      boxShadow: boxShadow(formTokens.field.focusVisible.shadow),
    },
  },
});

export const privacyOverlay = style({
  position: 'fixed',
  inset: 0,
  backgroundColor: colorVars.black.alpha(0.85).css(),
  backdropFilter: `blur(${glassVars.backdropBlur.double().css()})`,
  WebkitBackdropFilter: `blur(${glassVars.backdropBlur.double().css()})`,
  zIndex: 1100,
});

export const privacyDialog = style({
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: `${m(8).css()} ${m(6).css()}`,
  zIndex: 1101,
});

export const privacyPanel = style({
  position: 'relative',
  width: 'min(70ch, 90vw)',
  maxHeight: '80vh',
  padding: `${m(12).css()} ${m(11).css()}`,
  ...borders(formTokens.field.borders),
  backgroundColor: colorVars.bodyBg.css(),
  color: colorVars.bodyFg.css(),
  boxShadow: `0 ${m(3).css()} ${m(12).css()} ${colorVars.black.alpha(0.35).css()}`,
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
  top: m(4).css(),
  right: m(4).css(),
  width: glassyButtonTokens.iconSize.css(),
  height: glassyButtonTokens.iconSize.css(),
  ...borders(glassyButtonTokens.borders),
  background: glassyButtonTokens.background.css(),
  color: glassyButtonTokens.text.color.css(),
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: glassyButtonTokens.iconSize.css(),
  fontWeight: 600,
  cursor: 'pointer',
  boxShadow: boxShadow(glassyButtonTokens.boxShadows),
  backdropFilter: `blur(${glassVars.backdropBlur.css()})`,
  WebkitBackdropFilter: `blur(${glassVars.backdropBlur.css()})`,
  transition: glassyButtonTokens.transition,
  selectors: {
    '&:hover': {
      background: glassyButtonTokens.hover.background.color.css(),
      boxShadow: boxShadow(glassyButtonTokens.hover.boxShadows),
      transform: 'translateY(-1px)',
    },
    '&:focus, &:focus-visible': {
      outline: 'none',
      ...backgrounds(glasssButtonTokens.focusVisible.backgrounds),
      background:
        glassyButtonTokens.focusVisible.background.color.css(),
      boxShadow: boxShadow(
        glassyButtonTokens.focusVisible.boxShadows,
      ),
    },
    '&:active': {
      transform: 'translateY(0)',
      boxShadow: boxShadow(glassyButtonTokens.boxShadows),
    },
  },
});

export const visuallyHidden = style({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
});

globalStyle(`${input}[data-error="true"]::placeholder`, {
  color: formTokens.field.error.text.color.css(),
});

globalStyle(`${textarea}[data-error="true"]::placeholder`, {
  color: formTokens.field.error.text.color.css(),
});
