export type Variant = {
  w: number;
  url: string;
};
export type ImageEntry = {
  name: string;
  hash?: string;
  basePath?: string;
  dirName?: string;
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
