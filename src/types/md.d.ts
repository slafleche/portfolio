declare module '*.md' {
  const content: import('../lib/locales/markdownTypes').MarkdownContent;
  export default content;
}

declare module '*.md?raw' {
  const content: string;
  export default content;
}
