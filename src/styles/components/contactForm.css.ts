import {
  globalStyle,
  style,
  type ComplexStyleRule,
} from '@vanilla-extract/css';
import { formTokens } from '@/tokens/forms.tokens';
import { m } from '../measurementKit';

const controlBase: ComplexStyleRule = {
  width: '100%',
  padding: `${formTokens.field.paddingBlock.css()} ${formTokens.field.paddingInline.css()}`,
  borderRadius: formTokens.field.borderRadius.css(),
  borderWidth: formTokens.field.borderWidth.css(),
  borderStyle: 'solid',
  borderColor: formTokens.field.borderColor.css(),
  backgroundColor: formTokens.field.background.css(),
  color: formTokens.field.textColor.css(),
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
      borderColor: formTokens.field.hoverBorderColor.css(),
    },
    '&:focus-visible': {
      borderColor: formTokens.field.focusRingColor.css(),
      boxShadow: `0 0 0 ${formTokens.field.focusRingWidth.css()} ${formTokens.field.focusRingColor.css()}`,
    },
    '&[data-error="true"]': {
      borderColor: formTokens.field.errorBorderColor.css(),
      color: formTokens.field.errorTextColor.css(),
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
  color: formTokens.field.errorTextColor.css(),
  fontSize: '0.85rem',
});

const statusBase: ComplexStyleRule = {
  borderRadius: formTokens.field.borderRadius.css(),
  padding: `${formTokens.field.paddingBlock.css()} ${formTokens.field.paddingInline.css()}`,
  borderWidth: formTokens.field.borderWidth.css(),
  borderStyle: 'solid',
  display: 'flex',
  alignItems: 'center',
  gap: formTokens.layout.fieldGap.css(),
};

export const status = style(statusBase);

export const statusSuccess = style([
  statusBase,
  {
    backgroundColor:
      formTokens.status.success.background.css(),
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
  cursor: 'pointer',
  transition:
    'transform 160ms ease, opacity 160ms ease, background 160ms ease',
  selectors: {
    '&:hover': {
      transform: 'translateY(-1px)',
    },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: `0 0 0 ${formTokens.field.focusRingWidth.css()} ${formTokens.field.focusRingColor.css()}`,
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
  color: formTokens.status.success.textColor.css(),
  textDecoration: 'underline',
  textDecorationThickness: 'from-font',
  textUnderlineOffset: 4,
  selectors: {
    '&:hover': {
      opacity: 0.9,
    },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: `0 0 0 ${formTokens.field.focusRingWidth.css()} ${formTokens.field.focusRingColor.css()}`,
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
  color: formTokens.field.errorTextColor.css(),
});

globalStyle(`${textarea}[data-error="true"]::placeholder`, {
  color: formTokens.field.errorTextColor.css(),
});
