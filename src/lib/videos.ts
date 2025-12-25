export type VideoVariant = {
  rung: number;
  height: number;
  bandwidthKbps: number;
  playlistUrl: string;
};

export type VideoEntry = {
  name: string;
  dirName?: string;
  basePath?: string;
  hash?: string;
  width: number;
  height: number;
  aspect: number;
  duration: number;
  hasAudio: boolean;
  masterUrl: string;
  posterUrl: string;
  variants: VideoVariant[];
  speed?: number;
  sourceHash?: string;
  sourceSize?: number;
};
