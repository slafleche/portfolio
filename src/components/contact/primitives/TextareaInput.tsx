import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import clsx from 'clsx';
import * as s from '@/styles/components/forms.css';

type AutoResizeHandlers = {
  onInit: (node: HTMLTextAreaElement) => void;
  onSync: (node: HTMLTextAreaElement) => void;
};

type TextareaInputProps = ComponentPropsWithoutRef<'textarea'> & {
  autoResizeHandlers?: AutoResizeHandlers;
};

export const TextareaInput = forwardRef<
  HTMLTextAreaElement,
  TextareaInputProps
>(({ className, autoResizeHandlers, value, style, ...props }, ref) => {
  const innerRef = useRef<HTMLTextAreaElement | null>(null);
  const didInitRef = useRef(false);
  const hasInit = typeof autoResizeHandlers?.onInit === 'function';
  const hasSync = typeof autoResizeHandlers?.onSync === 'function';
  const shouldAutoResize = hasInit && hasSync;

  useEffect(() => {
    if (!autoResizeHandlers) return;
    if (hasInit === hasSync) return;
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        'TextareaInput autoResizeHandlers requires both onInit and onSync callbacks.',
      );
    }
  }, [autoResizeHandlers, hasInit, hasSync]);

  useLayoutEffect(() => {
    if (!shouldAutoResize) return;
    const node = innerRef.current;
    if (!node) return;
    if (!didInitRef.current) {
      autoResizeHandlers?.onInit(node);
      didInitRef.current = true;
    }
    autoResizeHandlers?.onSync(node);
  }, [autoResizeHandlers, shouldAutoResize, value]);

  const handleRef = useCallback(
    (node: HTMLTextAreaElement | null) => {
      innerRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref],
  );

  const computedStyle: ComponentPropsWithoutRef<'textarea'>['style'] = {
    ...(shouldAutoResize ? { resize: 'none' } : { resize: 'vertical' }),
    ...style,
  };

  return (
    <textarea
      {...props}
      value={value}
      ref={handleRef}
      className={clsx(s.textarea, className)}
      style={computedStyle}
    />
  );
});
TextareaInput.displayName = 'TextareaInput';
