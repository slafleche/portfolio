import { m, mEm } from 'css-calipers';

import type { CSS_TYPES } from '@/styles/helpers/types.helper';

import { color } from '../styles/helpers/colorWrap.helper';
import type { SpacingIntentInternal } from '../styles/helpers/spacing.helper';
import { colors, colorVars, themeColours } from './global.tokens';
import { layoutVars } from './layout.tokens';

const blockSpacing = m(20);
const listIndent = m(24);
const codeBackground = colors.black.alpha(0.6);
const codeBorder = colorVars.bodyFg.alpha(0.12);

const codeFontStack =
  '"SFMono-Regular", "Roboto Mono", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", monospace';

export const textStyleVars = {
  paragraph: {
    margins: {
      bottom: blockSpacing,
    } as SpacingIntentInternal,
  },
  blockquote: {
    color: colorVars.bodyFg.alpha(0.85),
    margins: {
      bottom: blockSpacing,
    } as SpacingIntentInternal,
    paddings: {
      left: m(16),
    } as SpacingIntentInternal,
    borders: {
      all: {
        width: m(3),
        color: colorVars.border,
      },
    },
  },
  list: {
    unordered: {
      margins: {
        bottom: blockSpacing,
      },
      paddings: {
        left: listIndent,
      },
    },
    ordered: {
      margins: {
        bottom: blockSpacing,
      },
      paddings: {
        left: listIndent,
        right: mEm(1),
      },
    },
    item: {
      margins: {
        bottom: mEm(0.3),
      },
    },
  },
  code: {
    inline: {
      fontFamily: codeFontStack,
      backgrounds: {
        color: codeBackground,
      },
      borders: {
        all: {
          width: m(1),
          color: codeBorder,
        },
        radius: {
          all: m(4),
        },
      },
      paddings: {
        vertical: m(2),
        horizontal: m(4),
      },
    },
    block: {
      fontFamily: codeFontStack,
      backgrounds: {
        color: codeBackground,
      },
      paddings: {
        all: m(16),
      },
      borders: {
        bottom: {
          width: m(1),
          color: codeBorder,
          radius: m(6),
        },
      },
      margins: {
        bottom: blockSpacing,
      },
    },
  },
  link: {
    default: {
      color: themeColours.electricBlue,
      textDecoration:
        'underline' as CSS_TYPES.Property.TextDecoration,
      underlineOffset: m(3),
      textDecorationThickness: m(0.75),
    },
    hover: {
      color: color('#55fff0').darken(0.1),
    },
    focusVisible: {
      outlines: {
        color: colorVars.brand,
        offset: m(2),
        width: m(2),
        style: 'solid' as CSS_TYPES.Property.OutlineStyle,
      },
    },
    active: {
      color: colors.brand,
    },
    visited: {
      color: themeColours.electricBlue.darken(0.1).desaturate(0.2),
    },
  },
  em: {
    fontStyle: 'italic' as CSS_TYPES.Property.FontStyle,
  },
  strong: {
    fontWeight: 80, // percentage relative to min-max of font
  },
  del: {
    textDecoration:
      'line-through' as CSS_TYPES.Property.TextDecoration,
  },
  image: {
    display: 'block' as CSS_TYPES.Property.Display,
    margins: {
      bottom: blockSpacing,
    },
    borders: {
      radius: m(8),
    },
  },
  horizontalRule: {
    borders: {
      width: m(0.5),
      color: themeColours.electricBlue,
    },
    margins: {
      horizontal: 'auto',
      vertical: layoutVars.content.gap,
    },
  },
  break: {
    height: m(1, 'rem'),
  },
  table: {
    table: {
      width: '100%',
      borderCollapse: 'collapse' as CSS_TYPES.Property.BorderCollapse,
      marginBottom: blockSpacing,
    },
    head: {
      backgrounds: {
        color: colorVars.bodyFg.alpha(0.04),
      },
    },
    body: {},
    row: {
      borders: {
        bottom: m(1),
        color: colorVars.border.alpha(0.6),
      },
    },
    headerCell: {
      textAlign: 'left' as CSS_TYPES.Property.TextAlign,
      paddings: {
        vertical: m(8),
        horizontal: m(12),
      },
      fontWeight: 650,
    },
    cell: {
      paddings: {
        vertical: m(8),
        horizontal: m(12),
      },
      verticalAlign: 'top' as CSS_TYPES.Property.VerticalAlign,
    },
  },
} as const;
