
import { defineFontVariant, type FontVariantMap } from '../../styles/helpers/typography.helper';
import { fontFamilies } from '../fontFamilies.tokens';

const SOURCE_PATH = 'src/tokens/fontVariants/mockHtml.ts';

export const mockHtmlFontVariants = {
  code: defineFontVariant(fontFamilies.code, {
    label: 'mockHtml-code',
    sourcePath: SOURCE_PATH,
  }),
} as const satisfies FontVariantMap;
