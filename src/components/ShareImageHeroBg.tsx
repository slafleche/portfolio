import clsx from 'clsx';

import * as s from '@/styles/components/heroBg.css';
import * as nt from '@/styles/components/nubbyTriangle.css';
import * as rt from '@/styles/components/roundedTriangle.css';

import NubbyTriangle from './icons/NubbyTriangle';
import RoundedTriangle from './icons/RoundedTriangle';

type Props = {
  className?: string;
  roundedTransform?: ShapeTransform;
  nubbyTransform?: ShapeTransform;
};

type ShapeTransform = {
  translateXPercent?: number;
  translateYPercent?: number;
  rotationDeg?: number;
  scale?: number;
};

export default function ShareImageHeroBg({
  className,
  roundedTransform,
  nubbyTransform,
}: Props) {
  const rounded = {
    translateXPercent: 0,
    translateYPercent: 0,
    rotationDeg: 0,
    scale: 1,
    ...roundedTransform,
  };
  const nubby = {
    translateXPercent: 0,
    translateYPercent: 0,
    rotationDeg: 0,
    scale: 1,
    ...nubbyTransform,
  };

  return (
    <div className={clsx(s.root, className)}>
      <div
        className={clsx(s.transformOrigin, rt.wrapper)}
        style={{
          transform: `translate3d(${rounded.translateXPercent}%, ${rounded.translateYPercent}%, 0) rotate(${rounded.rotationDeg}deg) scale(${rounded.scale})`,
        }}
      >
        <RoundedTriangle className={s.transformOrigin} />
      </div>
      <div
        className={clsx(s.transformOrigin, nt.wrapper)}
        style={{
          transform: `translate3d(${nubby.translateXPercent}%, ${nubby.translateYPercent}%, 0) rotate(${nubby.rotationDeg}deg) scale(${nubby.scale})`,
        }}
      >
        <NubbyTriangle className={s.transformOrigin} />
      </div>
    </div>
  );
}
