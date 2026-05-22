import { style } from '@vanilla-extract/css';

const palette = {
  bg: '#1e2127',
  fg: '#abb2bf',
  keyword: '#c678dd',
  string: '#98c379',
  number: '#d19a66',
  operator: '#56b6c2',
  comment: '#5c6370',
  method: '#61afef',
  property: '#e06c75',
};

export const root = style({
  display: 'inline-block',
  background: palette.bg,
  padding: '120px',
  borderRadius: '14px',
  fontFamily:
    '"SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  fontSize: '22px',
  lineHeight: 1.6,
  color: palette.fg,
});

export const code = style({
  whiteSpace: 'pre',
});

export const line = style({
  display: 'block',
  minHeight: '1.6em',
});

export const keyword = style({ color: palette.keyword });
export const string = style({ color: palette.string });
export const number = style({ color: palette.number });
export const operator = style({ color: palette.operator });
export const comment = style({ color: palette.comment, fontStyle: 'italic' });
export const method = style({ color: palette.method });
export const property = style({ color: palette.property });
