export default {
  singleQuote: true,
  trailingComma: 'all',
  plugins: ['prettier-plugin-xml'],
  overrides: [
    {
      files: '*.svg',
      options: { parser: 'xml' },
    },
  ],
};
