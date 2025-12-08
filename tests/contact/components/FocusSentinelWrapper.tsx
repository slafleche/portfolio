import type { InputHTMLAttributes, ReactNode } from 'react';

type FocusSentinelWrapperProps = {
  children: ReactNode;
  beforeInputProps?: InputHTMLAttributes<HTMLInputElement>;
  afterInputProps?: InputHTMLAttributes<HTMLInputElement>;
};

export function FocusSentinelWrapper({
  children,
  beforeInputProps,
  afterInputProps,
}: FocusSentinelWrapperProps) {
  return (
    <div>
      <input
        type="text"
        data-testid="focus-sentinel-before"
        {...beforeInputProps}
      />
      {children}
      <input
        type="text"
        data-testid="focus-sentinel-after"
        {...afterInputProps}
      />
    </div>
  );
}

