declare module '*.md' {
	const content: import('../lib/locales/markdownTypes').MarkdownContent;
	export default content;
}
