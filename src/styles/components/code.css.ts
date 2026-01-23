import { globalStyle, style } from '@vanilla-extract/css';
import { m } from 'css-calipers';

import { colors } from '../../tokens/global.tokens';
import { textStyleVars } from '../../tokens/textStyles.tokens';
import { backgrounds } from '../helpers/background.helper';
import borders from '../helpers/borders.helper';
import { margins, paddings } from '../helpers/spacing.helper';
import { userContent } from '../typography.css';

export const root = style({
  ...backgrounds({
    color: textStyleVars.code.block.backgrounds.color,
  }),
});

export const code = style({});

export const mock = style({
  ...borders({
    color: colors.white.mix(colors.black, 0.2),
    width: m(2),
    radius: m(4),
  }),
});

globalStyle(`code[data-code="inline"]`, {
  fontFamily: textStyleVars.code.inline.fontFamily,
  ...paddings(textStyleVars.code.inline.paddings),
  ...backgrounds(textStyleVars.code.inline.backgrounds),
  fontSize: textStyleVars.code.inline.fontSize.css(),
  ...borders(textStyleVars.code.inline.borders),
});

const codeBlock = textStyleVars.code.block;
globalStyle('pre, pre[data-ui="code-block"]', {
  overflowX: 'auto',
  whiteSpace: 'nowrap',
});

// unset in decorative mock code blocks
globalStyle('pre[data-ui="mock-code-block"] code', {
  background: 'none',
});

globalStyle('pre[data-ui="mock-code-block"]', {
  overflowX: undefined,
  whiteSpace: 'wrap',
});

globalStyle('pre[data-code="block"]', {
  fontFamily: codeBlock.fontFamily,
  // fontSize: codeBlock.fontSize.css(),
  // lineHeight: codeBlock.lineHeight.css(),
  ...margins(codeBlock.margins),
  ...paddings(codeBlock.paddings),
  // ...backgrounds(codeBlock.backgrounds),
});

globalStyle(`pre[data-code="block"] .${userContent} *`, {
  fontFamily: 'inherit',
  fontSize: 'inherit',
  lineHeight: 'inherit',
});
