import clsx from 'clsx';

import * as s from '@/styles/components/forms.css';

type OutlineForInputProps = {
  className?: string;
};

export function OutlineForInput({ className }: OutlineForInputProps) {
  return (
    <div className={clsx(s.outlinePosition, className)}>
      <div className={s.outline} />
    </div>
  );
}
