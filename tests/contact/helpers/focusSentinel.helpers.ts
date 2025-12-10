export type FocusSentinelHandles = {
  beforeElement: HTMLInputElement;
  afterElement: HTMLInputElement;
  focusBefore: () => void;
  focusAfter: () => void;
  isFocusOnBefore: () => boolean;
  isFocusOnAfter: () => boolean;
};

type GetByTestId = (id: string) => HTMLElement;

export function createFocusSentinelHandles(
  getByTestId: GetByTestId,
): FocusSentinelHandles {
  const beforeElement = getByTestId(
    'focus-sentinel-before',
  ) as HTMLInputElement;
  const afterElement = getByTestId(
    'focus-sentinel-after',
  ) as HTMLInputElement;

  const focusBefore = () => {
    beforeElement.focus();
  };

  const focusAfter = () => {
    afterElement.focus();
  };

  const isFocusOnBefore = () =>
    document.activeElement === beforeElement;

  const isFocusOnAfter = () =>
    document.activeElement === afterElement;

  return {
    beforeElement,
    afterElement,
    focusBefore,
    focusAfter,
    isFocusOnBefore,
    isFocusOnAfter,
  };
}
