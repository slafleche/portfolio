export default {
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 80,
  proseWrap: 'always',
  // Keep arrays and long constructs from collapsing too easily by using a tighter print width.
  // Enable JSDoc reflow and force multi-line style even for short comments.
  plugins: ['prettier-plugin-xml', 'prettier-plugin-jsdoc'],
  // Deprecated but still recognized by the plugin; keeps short JSDoc comments multi-line
  jsdocSingleLineComment: false,
  overrides: [
    {
      files: '*.svg',
      options: { parser: 'html', singleAttributePerLine: true },
    },
  ],
};
