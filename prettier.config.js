import * as multilineArrays from 'prettier-plugin-multiline-arrays';
import prettierPluginXml from 'prettier-plugin-xml';
import * as prettierPluginJsdoc from 'prettier-plugin-jsdoc';

export default {
	singleQuote: true,
	trailingComma: 'all',
	printWidth: 70,
	proseWrap: 'always',
	// Indent with tabs so multiline arrays are clearly tabbed
	useTabs: true,
	// Keep arrays and long constructs from collapsing too easily by using a tighter print width.
	// Enable JSDoc reflow and force multi-line style even for short comments.
	plugins: [multilineArrays, prettierPluginXml, prettierPluginJsdoc],
	// Deprecated but still recognized by the plugin; keeps short JSDoc comments multi-line
	jsdocSingleLineComment: false,
	multilineArraysWrapThreshold: 0,
	multilineArraysLinePattern: '1',
	overrides: [
		{
			files: '*.svg',
			options: {
				parser: 'html',
				singleAttributePerLine: true,
			},
		},
		{
			files: ['*.md', '*.mdx'],
			options: {
				printWidth: 80,
			},
		},
	],
};
