export type RenderMode = 'full' | 'simple';

export const DEFAULT_RENDER_MODE: RenderMode = 'full';
export const RENDER_MODE_HEADER = 'x-render-mode';

export function resolveRenderMode(
  value: string | null | undefined,
): RenderMode {
  const raw = (value ?? '').trim().toLowerCase();
  if (raw === 'simple') return 'simple';
  return DEFAULT_RENDER_MODE;
}

