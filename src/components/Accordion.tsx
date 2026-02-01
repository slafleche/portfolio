'use client';

import * as AccordionPrimitive from '@radix-ui/react-accordion';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

import { useRenderMode } from '@/components/renderMode/useRenderMode.client';
import { usePrefersReducedMotion } from '@/lib/accessibility/usePrefersReducedMotion';
import { createDomId } from '@/lib/dom';
import { isLocaleRichText } from '@/lib/stringUtils';
import * as s from '@/styles/components/accordion.css';

import PlusIcon from './icons/Plus';
import RightArrow from './icons/RightArrow';
import { renderInlineMarkdown } from './Markdown';

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
  const prefersReducedMotion = usePrefersReducedMotion();
  const renderMode = useRenderMode();

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

  if (renderMode === 'simple') {
    return (
      <section data-simple-render="Accordion.tsx">
        {resolvedItems.map((item) => (
          <div key={item.value} id={item.id}>
            <h3>
              {typeof item.heading === 'string' &&
              isLocaleRichText(item.heading)
                ? renderInlineMarkdown(item.heading, {
                    openLinksInNewTab: true,
                    asUi: { links: true },
                  })
                : item.heading}
            </h3>
            {item.subHeading ? (
              <p>
                {typeof item.subHeading === 'string' &&
                isLocaleRichText(item.subHeading)
                  ? renderInlineMarkdown(item.subHeading, {
                      openLinksInNewTab: true,
                      asUi: { links: true },
                    })
                  : item.subHeading}
              </p>
            ) : null}
            {typeof item.content === 'string' ? (
              <p>
                {isLocaleRichText(item.content)
                  ? renderInlineMarkdown(item.content, {
                      openLinksInNewTab: true,
                      asUi: { links: true },
                    })
                  : item.content}
              </p>
            ) : (
              <div>{item.content}</div>
            )}
          </div>
        ))}
      </section>
    );
  }

  return (
    <AccordionPrimitive.Root
      {...rootProps}
      className={clsx(s.accordion, className)}
    >
      {resolvedItems.map((item, index) => (
        <AccordionPrimitive.Item
          key={item.value}
          value={item.value}
          className={clsx(s.item, {
            [s.separator]: index !== resolvedItems.length - 1,
          })}
        >
          <AccordionPrimitive.Header
            className={s.header}
            data-ui="heading"
          >
            <AccordionPrimitive.Trigger className={s.button}>
              <span className={s.triggerText}>
                <span className={s.triggerLabel}>
                  {typeof item.heading === 'string' &&
                  isLocaleRichText(item.heading)
                    ? renderInlineMarkdown(item.heading, {
                        openLinksInNewTab: true,
                        asUi: { links: true },
                      })
                    : item.heading}
                </span>
                {item.subHeading ? (
                  <>
                    <span className={s.triggerSubtitle}>
                      <span className={s.iconContainer}>
                        <RightArrow className={s.rightArrow} />
                      </span>
                      <span className={s.triggerSubtitleText}>
                        {typeof item.subHeading === 'string' &&
                        isLocaleRichText(item.subHeading)
                          ? renderInlineMarkdown(item.subHeading, {
                              openLinksInNewTab: true,
                              asUi: { links: true },
                            })
                          : item.subHeading}
                      </span>
                    </span>
                  </>
                ) : null}
              </span>
              <span className={s.icon} aria-hidden>
                <span className={s.iconGradient} />
                <PlusIcon className={s.iconSvg} />
              </span>
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content
            data-animated-slide={
              !prefersReducedMotion ? 'true' : 'false'
            }
            className={s.content}
          >
            {item.content}
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
}
