import manifest from '@/data/generated/images.manifest.gen.json';

export type Variant = {
	w: number;
	url: string;
};
export type ImageEntry = {
	name: string;
	width: number;
	height: number;
	aspect: number;
	blurDataURL: string;
	variants: {
		avif?: Variant[];
		webp?: Variant[];
		jpg?: Variant[];
	};
	original: {
		url: string;
		width: number;
		height: number;
	};
};

const db = manifest as Record<string, ImageEntry>;

export function getImage(name: string): ImageEntry | null {
	return db[name] ?? null;
}
