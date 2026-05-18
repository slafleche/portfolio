import type { ComponentProps } from 'react';

import Brick from './Brick';

type Props = Omit<ComponentProps<typeof Brick>, 'columns' | 'rows'>;

export default function HeroBrick(props: Props) {
  return <Brick columns={2} rows={2} {...props} />;
}
