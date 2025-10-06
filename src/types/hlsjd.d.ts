declare module 'hls.js' {
	export default class Hls {
		static isSupported(): boolean;
		constructor(config?: unknown);
		loadSource(url: string): void;
		attachMedia(media: HTMLMediaElement): void;
		destroy(): void;
	}
}
