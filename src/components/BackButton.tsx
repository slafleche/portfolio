import Link from 'next/link';
import LeftArrow from './icons/LeftArrow';
import * as s from '@/styles/components/backButton.css';

type BackButtonProps = {
  href: string;
  label: string;
};

export default function BackButton({ href, label }: BackButtonProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className={s.root}
    >
      <LeftArrow className={s.icon} />
    </Link>
  );
}
