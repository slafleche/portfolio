'use client';

import { useMemo } from 'react';
import type { ReactNode } from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import clsx from 'clsx';

import { createDomId } from '@/lib/dom';
import ChevronDown from '@/components/icons/ChevronDown';
import * as s from '@/styles/components/accordion.css';

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

export function Accordion({
  items,
  multiple = true,
  className,
}: AccordionProps) {
  const baseId = useMemo(() => createDomId('accordion'), []);

  const resolvedItems = useMemo(
    () =>
      items.map((item, index) => ({
        ...item,
        value: item.id ?? `${baseId}-item-${index}`,
      })),
    [
      items,
      baseId,
    ],
  );

  const defaultOpenValues = useMemo(
    () =>
      resolvedItems
        .filter((item) => item.defaultOpen)
        .map((item) => item.value),
    [
      resolvedItems,
    ],
  );

  const rootProps = multiple
    ? {
        type: 'multiple' as const,
        defaultValue: defaultOpenValues,
      }
    : {
        type: 'single' as const,
        defaultValue: defaultOpenValues[0],
        collapsible: true as const,
      };

  return (
    <AccordionPrimitive.Root
      {...rootProps}
      className={clsx(s.accordion, className)}
    >
      {resolvedItems.map((item) => (
        <AccordionPrimitive.Item
          key={item.value}
          value={item.value}
          className={s.item}
        >
          <AccordionPrimitive.Header className={s.header}>
            <AccordionPrimitive.Trigger className={s.trigger}>
              <span className={s.triggerText}>
                <span className={s.triggerLabel}>{item.heading}</span>
                {item.subHeading ? (
                  <span className={s.triggerSubtitle}>
                    {item.subHeading}
                  </span>
                ) : null}
              </span>
              <span className={s.icon} aria-hidden>
                <ChevronDown className={s.iconSvg} />
              </span>
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className={s.content}>
            <div className={s.contentInner}>{item.content}</div>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
}
