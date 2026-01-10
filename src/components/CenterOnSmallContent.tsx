import clsx from 'clsx';

import * as s from '@/styles/components/CenterOnSmallContent.css';

type Props = React.ComponentPropsWithoutRef<'div'> & {
  children: React.ReactNode;
};

export default function CenterOnSmallContent({
  className,
  children,
  ...rest
}: Props) {
  return (
    <span
      className={clsx(s.root, className)}
      {...rest}
    >
      <span className={s.inner}>
        {children}
      </span>
    </span>
  );
}
