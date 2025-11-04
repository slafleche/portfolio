'use client';

import {
  Children,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';
import clsx from 'clsx';
import * as heroStyles from '@/styles/components/hero.css';
import * as revealStyles from '@/styles/components/heroText.css';
import { playProjectorText } from '@/lib/projectorText';
import { usePrefersReducedMotion } from '@/lib/accessibility/usePrefersReducedMotion';
import { waitForFonts, collectWaitForFonts } from '@/lib/fontLoading';
import { fontVariants } from '../tokens/fontVariants.tokens';
import { heroVars } from '../styles/componentTokens/hero.componentTokens';
import {
  projectorVars,
  type ProjectorChannel,
} from '../styles/componentTokens/projector.componentTokens';

type Props = {
  label: string; // for accessibility
  children: ReactNode;
  debugStage?: 'initial' | 'waypoint' | 'focus' | 'reveal';
  animate?: boolean;
  onReveal?: () => void;
};

const CHANNELS: ProjectorChannel[] = [
  'blue',
  'green',
  'red',
];

export default function HeroHeading({
  label,
  children,
  debugStage,
  animate = true,
  onReveal,
}: Props) {
  const masterRef = useRef<HTMLHeadingElement | null>(null);
  const ghostRef = useRef<HTMLSpanElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const shouldAnimate = animate && !prefersReducedMotion;
  const [
    staticReady,
    setStaticReady,
  ] = useState<boolean>(shouldAnimate);

  if (shouldAnimate) {
    console.log('[HeroHeading] render', {
      childrenCount: Children.count(children),
    });
  }

  const onRevealRef = useRef(onReveal);
  useEffect(() => {
    onRevealRef.current = onReveal;
  }, [
    onReveal,
  ]);

  const notifyReveal = useCallback(() => {
    onRevealRef.current?.();
  }, []);

  const initialChannelStyles = useMemo(() => {
    if (!shouldAnimate) {
      return CHANNELS.reduce(
        (acc, channel) => {
          acc[channel] = {};
          return acc;
        },
        {} as Record<ProjectorChannel, CSSProperties>,
      );
    }

    const formatPx = (value: number) => `${value.toFixed(3)}px`;

    return CHANNELS.reduce(
      (acc, channel) => {
        const channelState = projectorVars.states[channel];
        const initial = channelState.initial;
        const blurMeasurement = channelState.blurCurve[0];
        const blurValue =
          typeof blurMeasurement === 'number'
            ? blurMeasurement
            : blurMeasurement.value;

        acc[channel] = {
          transform: `translate3d(${formatPx(
            initial.translateX.value,
          )}, ${formatPx(initial.translateY.value)}, 0) scale(${initial.scale})`,
          filter: `blur(${formatPx(blurValue)})`,
        };

        return acc;
      },
      {} as Record<ProjectorChannel, CSSProperties>,
    );
  }, [
    shouldAnimate,
  ]);

  const masterInitialStyle = useMemo(
    () => ({
      opacity: 0,
      transform: 'scale(1)',
    }),
    [],
  );

  const ghostInitialStyle = useMemo(
    () => ({
      opacity: projectorVars.states.blue.opacity,
    }),
    [],
  );

  const contentSignature = useMemo(() => {
    return Children.toArray(children)
      .map((child) => {
        if (typeof child === 'string' || typeof child === 'number') {
          return String(child);
        }
        if (
          typeof child === 'object' &&
          child !== null &&
          'type' in child
        ) {
          const element = child as ReactElement<{
            ['data-text']?: string;
          }>;
          if (typeof element.props?.['data-text'] === 'string') {
            return element.props['data-text'];
          }
        }
        return '';
      })
      .join('|');
  }, [
    children,
  ]);

  useEffect(() => {
    if (shouldAnimate) return;

    let cancelled = false;
    setStaticReady(false);

    const { fonts, timeoutMs } = collectWaitForFonts(
      fontVariants.hero,
      heroVars.fontLoading,
    );
    const finalize = () => {
      if (!cancelled) {
        setStaticReady(true);
        notifyReveal();
      }
    };

    if (fonts.length > 0) {
      waitForFonts(fonts, { timeoutMs })
        .then(finalize)
        .catch(finalize);
    } else {
      finalize();
    }

    return () => {
      cancelled = true;
    };
  }, [
    shouldAnimate,
    contentSignature,
    notifyReveal,
  ]);

  useEffect(() => {
    if (!shouldAnimate) return;

    const master = masterRef.current;
    const ghost = ghostRef.current;
    if (!master || !ghost) return;

    console.log('[HeroHeading] useEffect', {
      master,
      ghost,
      prefersReducedMotion,
    });

    let cancelled = false;
    let playHandle: ReturnType<typeof playProjectorText> | null =
      null;

    const attachRevealListener = (
      handle: ReturnType<typeof playProjectorText> | null,
    ) => {
      if (!handle) return;
      void handle
        .then(
          () => undefined,
          () => undefined,
        )
        .finally(() => {
          if (!cancelled) {
            notifyReveal();
          }
        });
    };

    const start = async () => {
      const { fonts, timeoutMs } = collectWaitForFonts(
        fontVariants.hero,
        heroVars.fontLoading,
      );
      if (fonts.length > 0) {
        await waitForFonts(fonts, { timeoutMs });
        if (cancelled) return;
      }

      playHandle = playProjectorText(master, ghost, 'desktop', {
        prefersReducedMotion,
        debugFreezeStage: debugStage,
      });

      if (typeof window !== 'undefined') {
        (
          window as typeof window & { __heroDebug?: true }
        ).__heroDebug = true;
      }

      attachRevealListener(playHandle);
    };

    start().catch(() => {
      if (cancelled) return;
      playHandle = playProjectorText(master, ghost, 'desktop', {
        prefersReducedMotion,
        debugFreezeStage: debugStage,
      });
      attachRevealListener(playHandle);
    });

    return () => {
      cancelled = true;
      playHandle?.cancel();
    };
  }, [
    contentSignature,
    prefersReducedMotion,
    debugStage,
    notifyReveal,
    shouldAnimate,
  ]);

  const channelClassMap: Record<ProjectorChannel, string> = {
    blue: revealStyles.channelBlue,
    green: revealStyles.channelGreen,
    red: revealStyles.channelRed,
  };

  if (!shouldAnimate) {
    return (
      <div
        className={revealStyles.container}
        data-hero-text="heroText"
      >
        <h1
          data-text={label}
          data-static-ready={staticReady ? 'true' : 'false'}
          className={clsx(
            heroStyles.heading,
            revealStyles.layer,
            revealStyles.master,
            revealStyles.staticHeading,
          )}
        >
          {children}
        </h1>
      </div>
    );
  }

  return (
    <div className={revealStyles.container} data-hero-text="heroText">
      <span
        aria-hidden="true"
        ref={ghostRef}
        className={clsx(
          revealStyles.ghost,
          revealStyles.layer,
          heroStyles.heading,
        )}
        data-hero-text-layer="ghost"
        style={ghostInitialStyle}
      >
        {CHANNELS.map((channel) => (
          <span
            key={channel}
            data-channel={channel}
            className={clsx(
              revealStyles.channel,
              channelClassMap[channel],
            )}
            style={initialChannelStyles[channel]}
          >
            {children}
          </span>
        ))}
      </span>

      <h1
        data-text={label}
        ref={masterRef}
        className={clsx(
          revealStyles.layer,
          revealStyles.master,
          heroStyles.heading,
        )}
        data-hero-text-layer="master"
        style={masterInitialStyle}
      >
        {children}
      </h1>
    </div>
  );
}
