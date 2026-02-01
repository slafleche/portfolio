'use client';

import { useContext } from 'react';

import { RenderModeContext } from './RenderModeContext';

export function useRenderMode() {
  return useContext(RenderModeContext);
}

