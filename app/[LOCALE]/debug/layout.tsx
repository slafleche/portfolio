import { notFound } from 'next/navigation';
import type { CSSProperties, ReactNode } from 'react';

import { notDev } from '@/lib/runtimeEnv';
import { backgrounds } from '@/styles/helpers/background.helper';

export default function DebugLayout({
  children,
}: {
  children: ReactNode;
}) {
  if (notDev()) {
    notFound();
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        ...(backgrounds({ color: '#0a0616' }) as CSSProperties),
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {children}
    </div>
  );
}
