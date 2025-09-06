import { ComplexStyleRule, StyleRule } from '@vanilla-extract/css';

const nextTabbable = (
  startingElement: Element | null = document.activeElement,
  tabbables: HTMLElement[],
  forward: boolean = false,
  loop: boolean = true,
): HTMLElement | null => {
  if (!(startingElement instanceof HTMLElement)) {
    console.log('Bad starting element: ', startingElement);
    return null;
  }
  const currentTabIndex = tabbables.indexOf(startingElement);

  if (currentTabIndex < 0) {
    console.log('Current Element not in tabbable elements: ', tabbables);
    return null;
  }

  let nextIndex = !forward ? currentTabIndex - 1 : currentTabIndex + 1;

  if (loop) {
    // Loop over the beginning and ends
    if (nextIndex < 0) {
      nextIndex = tabbables.length - 1;
    } else if (nextIndex >= tabbables.length) {
      nextIndex = 0;
    }
  }
  return tabbables[nextIndex] || null;
};

const allTabbable = (
  startingElement: Element | null = document.activeElement,
  tabbableElements: HTMLElement[],
) => {
  if (!(startingElement instanceof HTMLElement)) {
    console.log('Bad starting element: ', startingElement);
    return null;
  }
  return tabbableElements;
};

const firstTabbable = (tabbableElements: HTMLElement[]): HTMLElement | null => {
  if (tabbableElements.length > 0) {
    return tabbableElements[0];
  } else {
    return null;
  }
};

const lastTabbable = (tabbableElements: HTMLElement[]): HTMLElement | null => {
  if (tabbableElements.length > 0) {
    return tabbableElements[tabbableElements.length - 1];
  } else {
    return null;
  }
};

const keyboardEvents = (tabbableElements: HTMLElement[] = []) => {
  return (e: React.KeyboardEvent) => {
    e.persist();
    const currentEl = e.currentTarget;

    switch (e.key) {
      case 'ArrowRight': {
        e.stopPropagation();
        const nextEl = nextTabbable(currentEl, tabbableElements, true, true);
        if (nextEl) {
          nextEl.focus();
        }
        break;
      }
      case 'ArrowLeft': {
        e.stopPropagation();
        const prevEl = nextTabbable(currentEl, tabbableElements, false, true);
        if (prevEl) {
          prevEl.focus();
        }
        break;
      }
      case 'Home': {
        e.stopPropagation();
        const firstEl = firstTabbable(tabbableElements);
        if (firstEl) {
          firstEl.focus();
        }
        break;
      }
      case 'End': {
        e.stopPropagation();
        const lastEl = lastTabbable(tabbableElements);
        if (lastEl) {
          lastEl.focus();
        }
        break;
      }
    }
  };
};

const tabHelper = {
  nextTabbable,
  allTabbable,
  firstTabbable,
  lastTabbable,
  keyboardEvents,
};

export default tabHelper;
