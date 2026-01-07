import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect,it } from 'vitest';

import {
  createScrollHarnessHandles,
  ScrollHarness,
} from './scrollHarness';

describe('ScrollHarness test helper', () => {
  it('renders spacers with configured heights and exposes scroll handles', () => {
    const { getByTestId } = render(
      <ScrollHarness
        height={300}
        beforeHeight={100}
        afterHeight={200}
      >
        <div
          data-testid="scroll-harness-inner"
          style={{ height: 50 }}
        />
      </ScrollHarness>,
    );

    const container = getByTestId('scroll-harness-container');
    const before = getByTestId('scroll-harness-before');
    const after = getByTestId('scroll-harness-after');

    expect(container).toBeInTheDocument();
    expect(before).toBeInTheDocument();
    expect(after).toBeInTheDocument();

    expect((container as HTMLElement).style.maxHeight).toBe('300px');
    expect((before as HTMLElement).style.height).toBe('100px');
    expect((after as HTMLElement).style.height).toBe('200px');

    const handles = createScrollHarnessHandles(getByTestId);
    handles.setScrollTop(120);
    expect(handles.getScrollTop()).toBe(120);
  });
});
