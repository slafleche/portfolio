import { globalStyle, style } from '@vanilla-extract/css';

/**
 * For user content, we wrap arbitrary HTML with this class and style
 * descendants via nested selectors.
 */
export const userContent = style({});

// child elements
globalStyle(`${userContent} h1`, {
  fontSize: '2rem',
  
});

globalStyle(`${userContent} h2`, {
  
  
});

globalStyle(`${userContent} p`, {
  
});
