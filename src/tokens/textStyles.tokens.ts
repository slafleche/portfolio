import { m } from '@/styles/helpers/measurement';
import { colorVars } from '@/styles/vars';

const blockSpacing = m(16);
const compactSpacing = m(8);
const listIndent = m(24);
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
		padding: {
			left: m(16),
		},
		border: {
			width: m(3),
			color: colorVars.border,
		},
		color: colorVars.bodyFg.alpha(0.85),
	},
	list: {
		unordered: {
			marginBottom: blockSpacing,
			paddingLeft: listIndent,
		},
		ordered: {
			marginBottom: blockSpacing,
			paddingLeft: listIndent,
		},
		item: {
			marginBottom: compactSpacing,
		},
	},
	code: {
		inline: {
			fontFamily: codeFontStack,
			backgroundColor: codeBackground,
			borderRadius: m(4),
			padding: {
				vertical: m(2),
				horizontal: m(4),
			},
			border: {
				width: m(1),
				color: codeBorder,
			},
		},
		block: {
			backgroundColor: codeBackground,
			fontFamily: codeFontStack,
			padding: m(16),
			border: {
				width: m(1),
				color: codeBorder,
				radius: m(6),
			},
			marginBottom: blockSpacing,
		},
	},
	link: {
		default: {
			color: colorVars.brand,
			textDecoration: 'underline' as const,
			underlineOffset: m(3),
		},
		hover: {
			color: colorVars.brand.brighten(0.1),
			textDecorationThickness: m(0.75),
		},
		focusVisible: {
			outlineColor: colorVars.brand,
			outlineOffset: m(2),
			outlineWidth: m(2),
			outlineStyle: 'solid' as const,
		},
		active: {
			color: colorVars.brand.darken(0.1),
		},
		visited: {
			color: colorVars.brand.mix(colorVars.contrast, 0.25),
		},
	},
	emphasis: {
		em: {
			fontStyle: 'italic',
		},
		strong: {
			fontWeight: 650,
		},
		del: {
			textDecoration: 'line-through',
		},
	},
	image: {
		display: 'block' as const,
		marginBottom: blockSpacing,
		borderRadius: m(8),
	},
	horizontalRule: {
		border: {
			width: m(1),
			color: colorVars.border,
		},
		marginBottom: blockSpacing,
	},
	break: {
		height: compactSpacing,
	},
	table: {
		table: {
			width: '100%',
			borderCollapse: 'collapse' as const,
			marginBottom: blockSpacing,
		},
		head: {
			backgroundColor: colorVars.bodyFg.alpha(0.04),
		},
		body: {},
		row: {
			borderBottom: {
				width: m(1),
				color: colorVars.border.alpha(0.6),
			},
		},
		headerCell: {
			textAlign: 'left' as const,
			padding: {
				vertical: m(8),
				horizontal: m(12),
			},
			fontWeight: 650,
		},
		cell: {
			padding: {
				vertical: m(8),
				horizontal: m(12),
			},
			verticalAlign: 'top' as const,
		},
	},
} as const;
