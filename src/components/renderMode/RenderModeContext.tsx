'use client';

import type { ReactNode } from 'react';
import { createContext } from 'react';

import {
  DEFAULT_RENDER_MODE,
  type RenderMode,
} from '@/lib/renderMode';

export const RenderModeContext = createContext<RenderMode>(
  DEFAULT_RENDER_MODE,
);

type RenderModeProviderProps = {
  children: ReactNode;
  mode?: RenderMode;
};

export function RenderModeProvider({
  children,
  mode = DEFAULT_RENDER_MODE,
}: RenderModeProviderProps) {
  return (
    <RenderModeContext.Provider value={mode}>
      {children}
    </RenderModeContext.Provider>
  );
}
