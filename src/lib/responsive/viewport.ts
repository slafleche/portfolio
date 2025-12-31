export type ViewportSize = {
  width: number | null;
  height: number | null;
};

export const getViewportSize = (): ViewportSize => {
  if (typeof window === 'undefined') {
    return {
      width: null,
      height: null,
    };
  }

  const visualViewport = window.visualViewport;
  if (visualViewport) {
    return {
      width: Math.round(visualViewport.width),
      height: Math.round(visualViewport.height),
    };
  }

  return {
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
  };
};
