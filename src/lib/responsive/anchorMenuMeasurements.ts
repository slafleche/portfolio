import { getViewportSize } from './viewport';

export const shouldHideAnchors = (
  rootEl: HTMLElement | null,
  listEl: HTMLElement | null,
): boolean => {
  if (typeof window === 'undefined' || !rootEl || !listEl) {
    return false;
  }

  const styles = window.getComputedStyle(rootEl);
  const paddingTop = Number.parseFloat(styles.paddingTop || '0');
  const paddingBottom = Number.parseFloat(styles.paddingBottom || '0');
  const reservedSpace = paddingTop + paddingBottom;
  const anchorsHeight = Math.max(
    listEl.getBoundingClientRect().height,
    listEl.scrollHeight,
  );
  const viewportHeight = getViewportSize().height ?? 0;
  const rootRectHeight = rootEl.getBoundingClientRect().height;
  const rootHeight = rootRectHeight > 0 ? rootRectHeight : viewportHeight;
  const availableHeight = Math.max(0, rootHeight - reservedSpace);

  return anchorsHeight > availableHeight;
};
