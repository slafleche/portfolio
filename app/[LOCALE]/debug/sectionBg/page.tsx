import { readFile } from 'node:fs/promises';

import SectionBgDebug, {
  type SectionBgConfig,
} from '@/components/debug/SectionBgDebug';

const DEFAULTS_PATH = '/tmp/sectionBg.json';

export default async function SectionBgDebugPage() {
  let initialDefaults: SectionBgConfig | null = null;
  try {
    const raw = await readFile(DEFAULTS_PATH, 'utf8');
    initialDefaults = JSON.parse(raw) as SectionBgConfig;
  } catch {
    initialDefaults = null;
  }

  return <SectionBgDebug initialDefaults={initialDefaults} />;
}
