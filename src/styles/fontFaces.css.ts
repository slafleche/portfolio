import { getManifestTarget } from '@/lib/runtimeEnv';

const target = getManifestTarget();
if (target === 'release') {
  await import('./fontFaces.release.css');
} else {
  await import('./fontFaces._staging.css');
}
