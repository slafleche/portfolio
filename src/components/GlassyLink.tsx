import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type GlassyLinkProps = {
  href: string;
  label: string;
  className?: string;
  overlayClassName?: string;
  title?: string;
  target?: ComponentPropsWithoutRef<'a'>['target'];
  rel?: ComponentPropsWithoutRef<'a'>['rel'];
  children: ReactNode;
};

export default function GlassyLink({
  href,
  label,
  className,
  overlayClassName,
  title,
  target,
  rel,
  children,
}: GlassyLinkProps) {
  const safeRel =
    target === '_blank' ? (rel ?? 'noopener noreferrer') : rel;

  return (
    <Link
      href={href}
      className={className}
      aria-label={label}
      title={title ?? label}
      target={target}
      rel={safeRel}
    >
      {overlayClassName && <div className={overlayClassName}/>}
      {children}
    </Link>
  );
}
