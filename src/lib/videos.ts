import releaseManifest from '@/data/generated/videos.manifest.release.gen.json';
import stagingManifest from '@/data/generated/videos.manifest._staging.gen.json';
import { getManifestTarget } from '@/lib/runtimeEnv';

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

const target = getManifestTarget();
const manifest = (target === 'release'
  ? releaseManifest
  : stagingManifest) as Record<string, VideoEntry>;

export function getVideo(name: string): VideoEntry | undefined {
  return manifest[name];
}
