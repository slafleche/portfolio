import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { type ComponentProps } from 'react';

import ProjectorPathDebug from '@/components/debug/ProjectorPathDebug';
import { projectorVars } from '@/styles/componentTokens/projector.component.tokens';
import { fontFamilies } from '@/tokens/fontFamilies.tokens';

type ProjectorPathDebugProps = ComponentProps<
  typeof ProjectorPathDebug
>;

const DEFAULTS_PATH = path.resolve(
  process.cwd(),
  'app',
  '[LOCALE]',
  'debug',
  'projectorPath',
  'projectorPath.defaults.json',
);

export default async function ProjectorPathDebugPage() {
  let initialDefaults: ProjectorPathDebugProps['initialDefaults'] =
    null;
  try {
    const raw = await readFile(DEFAULTS_PATH, 'utf8');
    initialDefaults = JSON.parse(
      raw,
    ) as ProjectorPathDebugProps['initialDefaults'];
  } catch {
    initialDefaults = null;
  }

  const durationMs =
    projectorVars.timing.calibration.totalCalibrationTime.getValue();

  return (
    <ProjectorPathDebug
      durationMs={durationMs}
      fontFamily={fontFamilies.objectSans.family}
      fontWeight={fontFamilies.objectSans.weights.strong}
      initialDefaults={initialDefaults}
    />
  );
}
