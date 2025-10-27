'use client';

import {
  useMemo,
  useState,
  useCallback,
  useLayoutEffect,
  useRef,
} from 'react';
import type { ReactNode } from 'react';
import clsx from 'clsx';

import { createDomId } from '@/lib/dom';
import * as s from '@/styles/components/accordion.css';
import ChevronDown from '@/components/icons/ChevronDown';

type AccordionItemData = {
  id?: string;
  heading: ReactNode;
  subHeading?: ReactNode;
  content: ReactNode;
  defaultOpen?: boolean;
};

export type AccordionProps = {
  items: ReadonlyArray<AccordionItemData>;
  multiple?: boolean;
  className?: string;
};

function usePanelHeight(isOpen: boolean) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [
    maxHeight,
    setMaxHeight,
  ] = useState<string>(isOpen ? 'none' : '0px');

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (!isOpen) {
      setMaxHeight('0px');
      return;
    }

    const setHeight = () => {
      const scrollHeight = node.scrollHeight;
      setMaxHeight(`${scrollHeight}px`);
    };

    setHeight();
    if (typeof ResizeObserver === 'undefined') {
      return;
    }
    const observer = new ResizeObserver(setHeight);
    observer.observe(node);
    return () => observer.disconnect();
  }, [
    isOpen,
  ]);

  useLayoutEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;
    const timeout = window.setTimeout(() => {
      setMaxHeight('none');
    }, 240);
    return () => window.clearTimeout(timeout);
  }, [
    isOpen,
  ]);

  return { ref, maxHeight } as const;
}

type AccordionSectionProps = {
  item: AccordionItemData;
  index: number;
  baseId: string;
  isOpen: boolean;
  onToggle: (key: string) => void;
};

function AccordionSection({
  item,
  index,
  baseId,
  isOpen,
  onToggle,
}: AccordionSectionProps) {
  const key = item.id ?? `${baseId}-item-${index}`;
  const buttonId = `${key}-trigger`;
  const panelId = `${key}-panel`;
  const { ref, maxHeight } = usePanelHeight(isOpen);

  return (
    <div className={s.item} key={key}>
      <button
        id={buttonId}
        className={s.trigger}
        type="button"
        onClick={() => onToggle(key)}
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        <span className={s.triggerLabel}>{item.heading}</span>
        <span className={s.triggerArrow}>→</span>
        {item.subHeading ? (
          <span className={s.triggerSubtitle}>{item.subHeading}</span>
        ) : null}
        <span
          className={clsx(s.icon, { [s.iconOpen]: isOpen })}
          aria-hidden
        >
          <ChevronDown className={s.iconSvg} />
        </span>
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={clsx(s.panel, isOpen && s.panelOpen)}
        style={{ maxHeight }}
      >
        <div ref={ref} className={s.panelInner}>
          {item.content}
        </div>
      </div>
    </div>
  );
}

export function Accordion({
  items,
  multiple = true,
  className,
}: AccordionProps) {
  const baseId = useMemo(() => createDomId('accordion'), []);
  const [
    openKeys,
    setOpenKeys,
  ] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    items.forEach((item, index) => {
      if (item.defaultOpen) {
        initial.add(item.id ?? `${baseId}-item-${index}`);
      }
    });
    return initial;
  });

  const toggle = useCallback(
    (key: string) => {
      setOpenKeys((prev) => {
        const next = new Set(prev);
        const isOpen = next.has(key);
        if (multiple) {
          if (isOpen) {
            next.delete(key);
          } else {
            next.add(key);
          }
        } else {
          next.clear();
          if (!isOpen) {
            next.add(key);
          }
        }
        return next;
      });
    },
    [
      multiple,
    ],
  );

  return (
    <div className={clsx(s.root, className)}>
      {items.map((item, index) => {
        const key = item.id ?? `${baseId}-item-${index}`;
        return (
          <AccordionSection
            key={key}
            item={item}
            index={index}
            baseId={baseId}
            isOpen={openKeys.has(key)}
            onToggle={toggle}
          />
        );
      })}
    </div>
  );
}
