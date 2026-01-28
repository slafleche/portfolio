import type { Meta, StoryObj } from '@storybook/react';
import { useMemo, useRef, useState } from 'react';

import * as layoutStyles from '@/styles/layout.css';

import Heading from '../../Heading';
import Content from '../../responsive/Content';
import { TextareaInput } from './TextareaInput';

const meta: Meta<typeof TextareaInput> = {
  title: 'Forms/Form primitives/TextareaInput',
  component: TextareaInput,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof TextareaInput>;

function AutoResizingTextareaExample() {
  const [value, setValue] = useState('Type a longer message…\nSecond line.');
  const baseHeightRef = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const autoResizeHandlers = useMemo(
    () => ({
      onInit: (node: HTMLTextAreaElement) => {
        textareaRef.current = node;
        if (baseHeightRef.current === null) {
          baseHeightRef.current = node.scrollHeight;
        }
      },
      onSync: () => {
        const node = textareaRef.current;
        if (!node) return;
        node.style.height = 'auto';
        const minimum = baseHeightRef.current ?? node.scrollHeight;
        node.style.height = `${Math.max(node.scrollHeight, minimum)}px`;
      },
    }),
    [],
  );

  return (
    <TextareaInput
      id="textarea-auto"
      value={value}
      autoResizeHandlers={autoResizeHandlers}
      placeholder="Type here…"
      onChange={(event) => {
        autoResizeHandlers.onInit(event.currentTarget);
        autoResizeHandlers.onSync();
        setValue(event.currentTarget.value);
      }}
    />
  );
}

export const Default: Story = {
  name: 'Default',
  render: () => (
    <div className={layoutStyles.page}>
      <main
        className={layoutStyles.main}
        data-query-all="no-margin"
        data-query-compact="no-padding"
      >
        <section className={layoutStyles.sectionSpacing}>
          <Content tag="div" ignoreBottomMargin={true}>
            <Heading depth={1} ignoreDataUI={true}>
              TextareaInput
            </Heading>
            <div style={{ display: 'grid', gap: 12, maxWidth: 640 }}>
              <Heading depth={2} ignoreDataUI={true}>
                Auto-resize
              </Heading>
              <AutoResizingTextareaExample />
              <Heading depth={2} ignoreDataUI={true}>
                Disabled
              </Heading>
              <TextareaInput
                id="textarea-disabled"
                value="Disabled"
                disabled={true}
                onChange={() => {}}
              />
            </div>
          </Content>
        </section>
      </main>
    </div>
  ),
};
