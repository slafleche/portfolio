module.exports = {
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 70,
  proseWrap: 'always',
  // Use spaces so indentation stays consistent across tools
  useTabs: false,
  // Keep arrays and long constructs from collapsing too easily by using a tighter print width.
  // Enable JSDoc reflow and force multi-line style even for short comments.
  plugins: [
    'prettier-plugin-multiline-arrays',
    'prettier-plugin-xml',
    'prettier-plugin-jsdoc',
  ],
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
      files: [
        'simpleHtml/**/*.html',
      ],
      options: {
        // Snapshot HTML: readable, but never "broken tags".
        // Prefer breaking attributes onto new lines over splitting tag boundaries.
        printWidth: 120,
        htmlWhitespaceSensitivity: 'css',
        singleAttributePerLine: true,
      },
    },
    {
      files: [
        '*.md',
        '*.mdx',
      ],
      options: {
        printWidth: 80,
      },
    },
  ],
};
