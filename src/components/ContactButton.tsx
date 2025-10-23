'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';

import * as s from '@/styles/components/contactButton.css';
import SendIcon from '@/components/icons/SendIcon';

interface ContactButtonProps {
  watchId: string;
  href: string;
  label: string;
  className?: string;
}

export default function ContactButton({
  watchId,
  href,
  label,
  className,
}: ContactButtonProps) {
  const [
    visible,
    setVisible,
  ] = useState(false);
  const previousVisibleRef = useRef(false);

  // true for one render when we transition from visible -> not visible
  const leaving = previousVisibleRef.current && !visible;

  useEffect(() => {
    const target = document.getElementById(watchId);
    if (!target) return;

    const observer = new IntersectionObserver(
      ([
        entry,
      ]) => {
        // show button when target is NOT intersecting (off screen)
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0.1 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [
    watchId,
  ]);

  useEffect(() => {
    previousVisibleRef.current = visible;
  }, [
    visible,
  ]);

  return (
    <div className={s.root}>
      <div className={s.rail}>
        <div
          className={clsx(
            s.shuttle,
            visible && s.visible,
            leaving && s.leaving,
          )}
        >
          <div className={s.scaleShell}>   
            <div className={s.payload}>
              <Link
                href={href}
                className={clsx(s.button, className)}
                aria-label={label}
              >
                <span
                  className={clsx(s.gradient, s.gradientVisible)}
                  aria-hidden
                />
                <span className={s.iconWrap}>
                  <span className={s.iconShell}>
                    <SendIcon className={s.iconGlyph} />
                  </span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
