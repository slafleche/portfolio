'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';

export default function WithScript({
  children,
}: {
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.removeAttribute('data-visible');
  }, []);

  return (
    <div ref={ref} data-ui="with-js" data-visible="hidden">
      {children}
    </div>
  );
}
