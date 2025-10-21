"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';

import * as s from '@/styles/components/scrollContactButton.css';
import SendIcon from '@/components/icons/SendIcon';

interface ScrollContactButtonProps {
    watchId: string;
    href: string;
    label: string;
    className?: string;
}

export default function ScrollContactButton({
    watchId,
    href,
    label,
    className,
}: ScrollContactButtonProps) {
    const [visible, setVisible] = useState(false);
    const previousVisibleRef = useRef(false);
    const leaving = previousVisibleRef.current && !visible;

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const hero = document.getElementById(watchId);
        if (!hero) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setVisible(!entry.isIntersecting);
            },
            { threshold: 0.1 },
        );

        observer.observe(hero);
        return () => observer.disconnect();
    }, [watchId]);

    useEffect(() => {
        previousVisibleRef.current = visible;
    }, [visible]);

    return (
        <div className={s.wrapper} data-visible={visible ? 'true' : 'false'}>
            <Link
                href={href}
                className={clsx(
                    s.root,
                    className,
                    visible && s.visible,
                    leaving && s.leaving,
                )}
                aria-label={label}
            >
                <span className={clsx(s.gradient, s.gradientVisible)} aria-hidden />
                <SendIcon className={clsx(s.icon, s.iconVisible)} />
            </Link>
        </div>
    );
}
