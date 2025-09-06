export default {
  singleQuote: true,
  trailingComma: 'all',
  plugins: ['prettier-plugin-xml', 'prettier-plugin-jsdoc'],
  overrides: [
    {
      files: '*.svg',
      options: { parser: 'html', singleAttributePerLine: true },
    },
  ],
};
