import { clsx } from 'clsx';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import * as s from '@/styles/components/code.css';

type MockCodeBlockProps = {
  children: ReactNode;
  language?: string | null;
} & Omit<ComponentPropsWithoutRef<'pre'>, 'children'>;

export default function MockCodeBlock({
  children,
  className,
  ...preProps
}: MockCodeBlockProps) {
  return (
    <div className={clsx(s.root, s.code, s.mock)}>
      <pre
        {...preProps}
        data-code="block"
        data-ui="mock-code-block"
        className={className}
      >
        <code data-code="block">{children}</code>
      </pre>
    </div>
  );
}
