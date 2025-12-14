import { sharedStrings } from '@/lib/sharedStrings';

type HeroWaypointProps = {
  id?: string;
  className?: string;
};

const DEFAULT_ID = sharedStrings.heroWaypointId ?? 'hero-waypoint';

export default function HeroWaypoint({
  id = DEFAULT_ID,
  className,
}: HeroWaypointProps) {
  return (
    <div
      id={id}
      className={className}
      aria-hidden="true"
      style={{
        position: 'relative',
        width: '100%',
        height: 0,
        margin: 0,
        padding: 0,
      }}
    />
  );
}

