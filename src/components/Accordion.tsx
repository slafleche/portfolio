'use client';

import * as AccordionPrimitive from '@radix-ui/react-accordion';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

import ChevronDown from '@/components/icons/ChevronDown';
import { createDomId } from '@/lib/dom';
import { isLocaleRichText } from '@/lib/stringUtils';
import * as s from '@/styles/components/accordion.css';

import RightArrow from './icons/RightArrow';

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
          <AccordionPrimitive.Header
            className={s.header}
            data-ui="heading"
          >
            <AccordionPrimitive.Trigger className={s.button}>
              <span className={s.triggerText}>
                <span className={s.triggerLabel}>
                  {typeof item.heading === 'string' &&
                  isLocaleRichText(item.heading) ? (
                    <span
                      dangerouslySetInnerHTML={{
                        __html: item.heading,
                      }}
                    />
                  ) : (
                    item.heading
                  )}
                </span>
                {item.subHeading ? (
                  <>
                    <RightArrow className={s.rightArrow} />
                    <span className={s.triggerSubtitle}>
                      {typeof item.subHeading === 'string' &&
                      isLocaleRichText(item.subHeading) ? (
                        <span
                          dangerouslySetInnerHTML={{
                            __html: item.subHeading,
                          }}
                        />
                      ) : (
                        item.subHeading
                      )}
                    </span>
                  </>
                ) : null}
              </span>
              <span className={s.icon} aria-hidden>
                <ChevronDown className={s.iconSvg} />
                <span className={s.iconGradient} />
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
