import { NextResponse } from 'next/server';
import {
  computeMeasurementDebugGroups,
  getMeasurementDebugEntries,
  MeasurementDebugEntry,
} from '@/styles/helpers/measurement';

declare global {
  // eslint-disable-next-line no-var
  var __MEASUREMENT_DEBUG__: MeasurementDebugEntry[] | undefined;
  // eslint-disable-next-line no-var
  var __MEASUREMENT_DEBUG_INDEX__: Map<string, number> | undefined;
}

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clear = searchParams.get('clear') === '1';
  const dedupeParam = searchParams.get('dedupe');
  const groupParam = searchParams.get('group');
  const dedupe = dedupeParam === null ? true : dedupeParam === '1';
  const group = groupParam === null ? true : groupParam === '1';
  const rawEntries = getMeasurementDebugEntries();
  const entries = dedupe ? rawEntries : [...rawEntries];
  const payload: Record<string, unknown> = { entries };
  if (group) {
    payload.groups = computeMeasurementDebugGroups(entries);
  }
  if (clear) {
    (globalThis as any).__MEASUREMENT_DEBUG__ = [];
    (globalThis as any).__MEASUREMENT_DEBUG_INDEX__?.clear();
  }
  return NextResponse.json(payload);
}
