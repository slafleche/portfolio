import manifestJson from '@/data/generated/videos.manifest.gen.json';

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

const manifest = manifestJson as Record<string, VideoEntry>;

export function getVideo(name: string): VideoEntry | undefined {
  return manifest[name];
}
