import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import type { ContactFormFlowSnapshot } from './flowSnapshot.helpers';

export type OutcomeHook<TResult> = (
  snapshot: ContactFormFlowSnapshot,
) => TResult;

export type OutcomeHarnessResult<TResult> = RenderResult & {
  getLatestOutcome: () => TResult;
  rerenderWithSnapshot: (snapshot: ContactFormFlowSnapshot) => void;
};

export function renderOutcomeHook<TResult>(
  useOutcome: OutcomeHook<TResult>,
  initialSnapshot: ContactFormFlowSnapshot,
): OutcomeHarnessResult<TResult> {
  function Harness({
    snapshot,
  }: {
    snapshot: ContactFormFlowSnapshot;
  }) {
    const outcome = useOutcome(snapshot);
    return (
      <span data-testid="outcome-json">
        {JSON.stringify(outcome)}
      </span>
    );
  }

  const renderResult = render(<Harness snapshot={initialSnapshot} />);

  const getLatestOutcome = () => {
    const nodes = renderResult.queryAllByTestId('outcome-json');
    const node =
      nodes.length > 0
        ? (nodes[nodes.length - 1] as HTMLElement | null)
        : null;
    if (!node || !node.textContent) {
      throw new Error('Outcome has not been computed yet');
    }
    return JSON.parse(node.textContent) as TResult;
  };

  const rerenderWithSnapshot = (
    snapshot: ContactFormFlowSnapshot,
  ) => {
    renderResult.rerender(<Harness snapshot={snapshot} />);
  };

  return {
    ...renderResult,
    getLatestOutcome,
    rerenderWithSnapshot,
  };
}
