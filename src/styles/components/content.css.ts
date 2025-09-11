import { globalStyle, style } from '@vanilla-extract/css';

/**
 * For user content, we wrap arbitrary HTML with this class and style
 * descendants via nested selectors.
 */
export const userContent = style({});

// child elements
globalStyle(`${userContent} h1`, {
  fontSize: '2rem',
  marginBottom: '0.5rem',
});

globalStyle(`${userContent} h2`, {
  fontSize: '1.5rem',
  marginBottom: '0.5rem',
});

globalStyle(`${userContent} p`, {
  lineHeight: 1.6,
  color: '#444',
});
