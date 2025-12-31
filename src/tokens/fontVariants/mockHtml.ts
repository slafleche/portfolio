import { fontFamilies } from '../fontFamilies.tokens';
import {
  defineFontVariant,
  type FontVariantMap,
} from '../../styles/helpers/fontVariant.helper';

const SOURCE_PATH = 'src/tokens/fontVariants/mockHtml.ts';

export const mockHtmlFontVariants = {
  code: defineFontVariant(fontFamilies.code, {
    label: 'mockHtml-code',
    sourcePath: SOURCE_PATH,
  }),
} as const satisfies FontVariantMap;
