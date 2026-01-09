import { useEffect, useMemo, useState } from 'react';

type VisualViewportFrame = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const emptyFrame: VisualViewportFrame = {
  top: 0,
  left: 0,
  width: 0,
  height: 0,
};

const framesEqual = (
  a: VisualViewportFrame,
  b: VisualViewportFrame,
) =>
  a.top === b.top &&
  a.left === b.left &&
  a.width === b.width &&
  a.height === b.height;

const readVisualViewportFrame = (): VisualViewportFrame => {
  if (typeof window === 'undefined') return emptyFrame;

  const visualViewport = window.visualViewport;
  if (visualViewport) {
    return {
      top: Math.round(visualViewport.offsetTop),
      left: Math.round(visualViewport.offsetLeft),
      width: Math.round(visualViewport.width),
      height: Math.round(visualViewport.height),
    };
  }

  const doc = document.documentElement;
  return {
    top: 0,
    left: 0,
    width: doc.clientWidth,
    height: doc.clientHeight,
  };
};

export const useVisualViewportFrame = () => {
  const [frame, setFrame] = useState<VisualViewportFrame>(
    () => emptyFrame,
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let frameId = 0;

    const update = () => {
      const next = readVisualViewportFrame();
      setFrame((prev) => (framesEqual(prev, next) ? prev : next));
    };

    const schedule = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        update();
      });
    };

    schedule();

    const visualViewport = window.visualViewport;
    if (visualViewport) {
      visualViewport.addEventListener('resize', schedule, {
        passive: true,
      });
      visualViewport.addEventListener('scroll', schedule, {
        passive: true,
      });
    } else {
      window.addEventListener('resize', schedule, { passive: true });
    }

    window.addEventListener('orientationchange', schedule, {
      passive: true,
    });

    return () => {
      if (visualViewport) {
        visualViewport.removeEventListener('resize', schedule);
        visualViewport.removeEventListener('scroll', schedule);
      } else {
        window.removeEventListener('resize', schedule);
      }
      window.removeEventListener('orientationchange', schedule);
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  const frameStyle = useMemo(
    () => ({
      top: frame.top,
      left: frame.left,
      width: frame.width,
      height: frame.height,
    }),
    [frame],
  );

  return {
    frame,
    frameStyle,
  };
};
