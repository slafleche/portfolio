import { m } from './measurement';
import { colorVars } from '../vars';

const blockSpacing = m(16);
const compactSpacing = m(8);
const codeBackground = colorVars.bodyFg.alpha(0.08);
const codeBorder = colorVars.bodyFg.alpha(0.12);

const codeFontStack =
  '"SFMono-Regular", "Roboto Mono", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", monospace';

export const textStyleVars = {
  paragraph: {
    marginBottom: blockSpacing,
  },
  blockquote: {
    marginBottom: blockSpacing,
    paddingLeft: m(16),
    bordersColor: colorVars.border,
    borderLeft: m(3),
    color: colorVars.bodyFg.alpha(0.85),
  },
  list: {
    ul: {
      marginBottom: blockSpacing,
      paddingLeft: m(24),
    },
    ol: {
      marginBottom: blockSpacing,
      paddingLeft: m(24),
    },
    li: {
      marginBottom: compactSpacing,
    },
  },
  code: {
    inline: {
      fontFamily: codeFontStack,
      backgroundColor: codeBackground,
      borderRadius: m(4),
      paddings: {
        vertical: m(2),
        horizontal: m(4),
      },
      borders: {
        width: m(1),
        color: codeBorder,
      },
    },
    blockquote: {
      backgroundColor: codeBackground,
      fontFamily: codeFontStack,
      paddings: {
        all: m(16),
      },
      borders: {
        width: m(1),
        color: codeBorder,
        radius: m(6),
      },
      margins: {
        bottom: blockSpacing,
      },
    },
  },
  link: {
    color: colorVars.brand,
    textDecoration: 'underline',
    textUnderlineOffset: m(3),
  },
  emphasis: {
    em: {
      fontStyle: 'italic',
    },
    strong: {
      fontWeight: 65, // relative font weight by percentage
    },
    del: {},
  },
  image: {
    marginBottom: blockSpacing,
    borderRadius: m(8),
  },
  horizontalRule: {
    borders: {
      width: m(1),
      color: colorVars.border,
    },
    margins: {
      bottom: blockSpacing,
    },
  },
  // table: {
  //   table: {
  //     width: '100%',
  //     borderCollapse: 'collapse',
  //     marginBottom: blockSpacing,
  //   },
  //   thead: {
  //     backgroundColor: colorVars.bodyFg.alpha(0.04),
  //   },
  //   tbody: {},
  //   tr: {
  //     borderBottom: `${m(1)} solid ${colorVars.border.alpha(0.6)}`,
  //   },
  //   th: {
  //     textAlign: 'left',
  //     padding: `${m(8)} ${m(12)}`,
  //     fontWeight: 650,
  //   },
  //   td: {
  //     padding: `${m(8)} ${m(12)}`,
  //     verticalAlign: 'top',
  //   },
  // },
} as const;
