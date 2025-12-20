import path from 'node:path';
import { readFile } from 'node:fs/promises';
import ProjectorPathDebug from '@/components/debug/ProjectorPathDebug';
import { projectorVars } from '@/styles/componentTokens/projector.componentTokens';
import { fontFamilies } from '@/tokens/fontFamilies.tokens';

type ProjectorPathDefaults = {
  centerOffset?: { x?: number; y?: number };
  channels?: Record<string, unknown>[];
};

const DEFAULTS_PATH = path.resolve(
  process.cwd(),
  'app',
  '[LOCALE]',
  'debug',
  'projectorPath',
  'projectorPath.defaults.json',
);

export default async function ProjectorPathDebugPage() {
  let initialDefaults: ProjectorPathDefaults | null = null;
  try {
    const raw = await readFile(DEFAULTS_PATH, 'utf8');
    initialDefaults = JSON.parse(raw) as ProjectorPathDefaults;
  } catch {
    initialDefaults = null;
  }

  const durationMs =
    projectorVars.timing.calibration.totalCalibrationTime.getValue();

  return (
    <ProjectorPathDebug
      durationMs={durationMs}
      fontFamily={fontFamilies.urbanist.family}
      fontWeight={fontFamilies.urbanist.weights.strong}
      initialDefaults={initialDefaults}
    />
  );
}
