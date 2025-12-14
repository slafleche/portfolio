'use client';

import Link from 'next/link';
import { SkipNavLink } from '@/components/SkipNavLink';
import { useContactDialog } from '@/components/contact/ContactDialogProvider';
import * as s from '@/styles/components/menu.css';
import type { Locale } from '@/data/locales';
import transforms, {
  type TransformIntent,
} from '@/styles/helpers/transforms.helper';
import clsx from 'clsx';
import Arch from './Arch';
import Logo from './Logo';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { usePathname } from 'next/navigation';
import ConsoleCuriosity from '@/components/ConsoleCuriosity';
import {
  canonicalToLocalizedSlugs,
  localizedToCanonicalSlugs,
} from '@/lib/routes/localeSlugs';
import type {
  CSSProperties,
  FocusEvent,
  MouseEvent,
  PointerEvent,
} from 'react';
import { getRotationStyle } from '../lib/arch/archHelper';
import { useMenuAnchors } from './menu/hooks/useMenuAnchors';
import {
  useMenuHighlight,
  type MiniBokehDebugOptions,
} from './menu/hooks/useMenuHighlight';
import {
  LOGO_ENTER_DELAY,
  LOGO_MOUSE_LEAVE_EXIT_DELAY,
  useLogoAnimation,
} from './menu/hooks/useLogoAnimation';
import type { AnchorEntry } from './menu/menuUtils';
import * as skipNavStyles from '@/styles/components/skipNav.css';
import { waitForFonts, collectWaitForFonts } from '@/lib/fontLoading';
import { fontVariants } from '../tokens/fontVariants.tokens';
import { menuVars } from '../styles/componentTokens/menu.componentTokens';
import { m } from 'css-calipers';
import { sharedStrings } from '@/lib/sharedStrings';

type FocusDebugOptions = {
  lockTo?: 'logo' | number;
};

type MenuProps = {
  root: string;
  skipNavLabel: string;
  leftLabel: string;
  rightLabel: string;
  localeChangeLabel: string;
  sections: ReadonlyArray<{ id: string; label: string }>;
  systemsSections?: ReadonlyArray<{ id: string; label: string }>;
  localeLinks: ReadonlyArray<{ locale: Locale; label: string }>;
  bokehDebug?: MiniBokehDebugOptions;
  debugGlow?: boolean;
  focusDebug?: FocusDebugOptions;
  curiosityMessages?: {
    title: string;
    test: string;
    result: string;
    hint: string;
    targetHref: string;
  };
  logoRedirectPaths?: ReadonlyArray<string>;
};

const LOGO_GLOW_TOP_THRESHOLD = 3;
const LOGO_GLOW_DURATION = 500;
const LOGO_GLOW_HOLD_DELAY = 100;
const CONTACT_HASH = sharedStrings.contactFormHash;
const POLICY_HASH = sharedStrings.contactFormPolicyHash;
const RESERVED_HASHES = new Set([
  CONTACT_HASH.replace(/^#/, ''),
  POLICY_HASH.replace(/^#/, ''),
]);

export default function Menu({
  root,
  skipNavLabel,
  leftLabel,
  rightLabel,
  localeChangeLabel,
  sections,
  systemsSections,
  localeLinks,
  bokehDebug,
  debugGlow = false,
  focusDebug,
  curiosityMessages,
  logoRedirectPaths,
}: MenuProps) {
  const { isOpen: isContactDialogOpen, isPrivacyOpen } =
    useContactDialog();
  const pathname = usePathname();
  const normalizedPath = pathname ?? '/';
  const parts = normalizedPath.split('/').filter(Boolean);
  const [
    currentLocale,
    ...restSegments
  ] = parts;
  const [
    firstSegment,
    ...tailSegments
  ] = restSegments;
  const currentLocaleSlugMap =
    (currentLocale
      ? localizedToCanonicalSlugs[currentLocale as Locale]
      : undefined) ?? {};
  const canonicalFirstSegment = firstSegment
    ? (currentLocaleSlugMap[firstSegment] ?? firstSegment)
    : firstSegment;
  const resolvedSections = useMemo(() => {
    if (
      canonicalFirstSegment === 'systems' &&
      systemsSections &&
      systemsSections.length > 0
    ) {
      return systemsSections;
    }
    return sections;
  }, [
    canonicalFirstSegment,
    sections,
    systemsSections,
  ]);
  const curiosityTarget = curiosityMessages?.targetHref ?? '';
  const shouldRenderCuriosity =
    Boolean(curiosityMessages) && normalizedPath !== curiosityTarget;
  const normalizedRoot = useMemo(() => {
    if (root === '/') return '/';
    return root.replace(/\/+$/, '');
  }, [
    root,
  ]);
  const normalizedLogoRedirects = useMemo(() => {
    if (!logoRedirectPaths || logoRedirectPaths.length === 0) {
      return [];
    }
    const normalizePath = (candidate: string) => {
      if (!candidate) return null;
      if (candidate === '/') return '/';
      return candidate.replace(/\/+$/, '') || '/';
    };
    const fromProp = logoRedirectPaths
      .map((path) => normalizePath(path))
      .filter((path): path is string => Boolean(path));
    if (!currentLocale) return fromProp;
    const override =
      canonicalToLocalizedSlugs[currentLocale as Locale];
    if (!override?.systems) return fromProp;
    const localized = normalizePath(
      normalizedRoot === '/'
        ? `/${override.systems}`
        : `${normalizedRoot}/${override.systems}`,
    );
    return localized
      ? [
          ...fromProp,
          localized,
        ]
      : fromProp;
  }, [
    logoRedirectPaths,
    currentLocale,
    normalizedRoot,
  ]);
  const reservedModalHash = useMemo(() => {
    if (isPrivacyOpen) return POLICY_HASH;
    if (isContactDialogOpen) return CONTACT_HASH;
    return null;
  }, [
    isContactDialogOpen,
    isPrivacyOpen,
  ]);
  const appendReservedModalHash = useCallback(
    (href: string) => {
      if (!reservedModalHash) return href;
      if (!href) return reservedModalHash;
      if (href.includes('#')) return href;
      return `${href}${reservedModalHash}`;
    },
    [
      reservedModalHash,
    ],
  );
  const logoId = 'menu-logo';
  const [
    mounted,
    setMounted,
  ] = useState(false);
  const [
    activeSection,
    setActiveSection,
  ] = useState<string | null>(null);
  const [
    logoGlowState,
    setLogoGlowState,
  ] = useState<'idle' | 'pulse' | 'hold'>('idle');
  const pointerInsideLogoRef = useRef(false);
  const logoGlowTimeoutRef = useRef<number | null>(null);
  const logoGlowRafRef = useRef<number | null>(null);
  const logoGlowHoldIntentRef = useRef(false);
  const logoGlowHoldActiveRef = useRef(false);
  const logoGlowHoldTimerRef = useRef<number | null>(null);
  const logoGlowClickSuppressRef = useRef(false);
  // no pending animation once we leave the top; we only fire when already there

  const sectionIds = resolvedSections.map((section) => section.id);
  const {
    anchors,
    anchorCount,
    sectionIds: derivedSectionIds,
  } = useMenuAnchors(sectionIds);
  const focusDebugIndex = (() => {
    if (!focusDebug) return null;
    const { lockTo } = focusDebug;
    if (lockTo === undefined) return null;
    if (lockTo === 'logo') return 0;
    if (typeof lockTo === 'number' && Number.isFinite(lockTo)) {
      const rounded = Math.round(lockTo);
      const maxIndex = Math.max(0, anchorCount - 1);
      return Math.min(Math.max(0, rounded), maxIndex);
    }
    return null;
  })();

  const [
    prefersReducedMotion,
    setPrefersReducedMotion,
  ] = useState<boolean | null>(null);
  const [
    decorReady,
    setDecorReady,
  ] = useState(false);
  const [
    fontsReady,
    setFontsReady,
  ] = useState(() => {
    const { fonts } = collectWaitForFonts(fontVariants.menu);
    return fonts.length === 0;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    );
    const updatePreference = () => {
      setPrefersReducedMotion(media.matches);
    };
    updatePreference();
    media.addEventListener('change', updatePreference);
    return () => {
      media.removeEventListener('change', updatePreference);
    };
  }, []);

  useEffect(() => {
    setDecorReady(prefersReducedMotion === false);
  }, [
    prefersReducedMotion,
  ]);

  useEffect(() => {
    const { fonts, timeoutMs } = collectWaitForFonts(
      fontVariants.menu,
    );
    if (fonts.length === 0) {
      setFontsReady(true);
      return;
    }
    let cancelled = false;
    const run = async () => {
      try {
        await waitForFonts(fonts, { timeoutMs });
      } catch {
        // swallow errors; we'll still proceed with fallback fonts
      }
      if (!cancelled) {
        setFontsReady(true);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  const debugActive = Boolean(bokehDebug);
  const highlightEnabled =
    debugActive ||
    (decorReady && prefersReducedMotion === false && fontsReady);
  const motionPreference =
    prefersReducedMotion === true ? 'reduced' : 'standard';
  const debugOptions: MiniBokehDebugOptions | undefined = bokehDebug;
  const lockTarget = debugOptions?.lockTo;
  const raiseLayer =
    debugOptions?.raiseLayer ?? lockTarget !== undefined;
  const showArchPath = debugOptions?.showArchPath ?? false;

  const {
    navRef,
    navMetrics,
    highlightStyles,
    highlightVisible,
    miniBokehActive,
    debugArch,
    activate,
    hideHighlight,
    activeHighlightIndex,
    isHighlightTraveling,
    registerLinkRef,
  } = useMenuHighlight({
    anchors,
    anchorCount,
    bokehDebug,
    fontsReady,
    animationEnabled: highlightEnabled,
  });

  const bokehInlineStyle: CSSProperties = {};
  if (highlightStyles.innerStyle.width !== undefined) {
    bokehInlineStyle.width = highlightStyles.innerStyle.width;
  }
  if (highlightStyles.innerStyle.height !== undefined) {
    bokehInlineStyle.height = highlightStyles.innerStyle.height;
  }
  if (highlightStyles.innerStyle.transform !== undefined) {
    bokehInlineStyle.transform = highlightStyles.innerStyle.transform;
  }
  if (highlightStyles.innerStyle.transition !== undefined) {
    bokehInlineStyle.transition =
      highlightStyles.innerStyle.transition;
  }
  if (highlightStyles.innerStyle.opacity !== undefined) {
    bokehInlineStyle.opacity = highlightStyles.innerStyle.opacity;
  }

  const highlightSlotIndex = (() => {
    if (activeHighlightIndex == null) return 0;
    const maxIndex = s.bokehSlotAlphaClasses.length - 1;
    return Math.min(
      Math.max(activeHighlightIndex, 0),
      Math.max(0, maxIndex),
    );
  })();
  const alphaSlotClass =
    s.bokehSlotAlphaClasses[highlightSlotIndex] ?? undefined;
  const betaSlotClass =
    s.bokehSlotBetaClasses[highlightSlotIndex] ?? undefined;
  const gammaSlotClass =
    s.bokehSlotGammaClasses[highlightSlotIndex] ?? undefined;
  const travelAlphaClass = isHighlightTraveling
    ? s.bokehTravelAlpha
    : undefined;
  const travelBetaClass = isHighlightTraveling
    ? s.bokehTravelBeta
    : undefined;
  const travelGammaClass = isHighlightTraveling
    ? s.bokehTravelGamma
    : undefined;
  const debugBlobClass = debugOptions ? s.bokehDebugBlob : undefined;

  const {
    state: logoAnimationState,
    scheduleEnter,
    scheduleExit,
    clearEnterDelay,
    clearExitDelay,
    resetToIdle,
  } = useLogoAnimation();

  const clearLogoGlowTimeout = useCallback(() => {
    if (logoGlowTimeoutRef.current) {
      clearTimeout(logoGlowTimeoutRef.current);
      logoGlowTimeoutRef.current = null;
    }
  }, []);

  const clearLogoGlowRaf = useCallback(() => {
    if (logoGlowRafRef.current !== null) {
      cancelAnimationFrame(logoGlowRafRef.current);
      logoGlowRafRef.current = null;
    }
  }, []);

  const clearLogoGlowHoldTimer = useCallback(() => {
    if (logoGlowHoldTimerRef.current !== null) {
      clearTimeout(logoGlowHoldTimerRef.current);
      logoGlowHoldTimerRef.current = null;
    }
  }, []);

  const startLogoGlowPulse = useCallback(() => {
    if (typeof window === 'undefined') return;
    logoGlowHoldActiveRef.current = false;
    clearLogoGlowHoldTimer();
    clearLogoGlowTimeout();
    clearLogoGlowRaf();
    setLogoGlowState((prev) => (prev === 'pulse' ? 'idle' : prev));
    logoGlowRafRef.current = window.requestAnimationFrame(() => {
      logoGlowRafRef.current = null;
      setLogoGlowState('pulse');
      logoGlowTimeoutRef.current = window.setTimeout(() => {
        logoGlowTimeoutRef.current = null;
        if (!logoGlowHoldActiveRef.current) {
          setLogoGlowState('idle');
        }
      }, LOGO_GLOW_DURATION);
    });
  }, [
    clearLogoGlowHoldTimer,
    clearLogoGlowRaf,
    clearLogoGlowTimeout,
  ]);

  const beginLogoGlowHold = useCallback(() => {
    if (typeof window === 'undefined') return;
    clearLogoGlowTimeout();
    clearLogoGlowRaf();
    logoGlowHoldActiveRef.current = true;
    setLogoGlowState((prev) => (prev === 'hold' ? prev : 'hold'));
  }, [
    clearLogoGlowRaf,
    clearLogoGlowTimeout,
  ]);

  const queueLogoGlow = useCallback(
    (mode: 'pulse' | 'hold') => {
      if (typeof window === 'undefined') return false;
      if (window.scrollY > LOGO_GLOW_TOP_THRESHOLD) return false;
      if (mode === 'hold') {
        beginLogoGlowHold();
      } else {
        startLogoGlowPulse();
      }
      return true;
    },
    [
      beginLogoGlowHold,
      startLogoGlowPulse,
    ],
  );

  const handleLogoPointerDown = useCallback(
    (event: PointerEvent<HTMLAnchorElement>) => {
      if (typeof window === 'undefined') return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      const { pathname } = window.location;
      const isRootPath =
        pathname === normalizedRoot ||
        (normalizedRoot !== '/' && pathname === `${normalizedRoot}/`);
      if (!isRootPath) return;
      logoGlowHoldIntentRef.current = true;
      logoGlowHoldActiveRef.current = false;
      if (event.currentTarget.setPointerCapture) {
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // ignore capture errors
        }
      }
      clearLogoGlowHoldTimer();
      logoGlowHoldTimerRef.current = window.setTimeout(() => {
        if (!logoGlowHoldIntentRef.current) return;
        logoGlowHoldTimerRef.current = null;
        queueLogoGlow('hold');
      }, LOGO_GLOW_HOLD_DELAY);
    },
    [
      clearLogoGlowHoldTimer,
      normalizedRoot,
      queueLogoGlow,
    ],
  );

  const handleLogoPointerUp = useCallback(
    (event: PointerEvent<HTMLAnchorElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      const wasHolding = logoGlowHoldActiveRef.current;
      logoGlowHoldIntentRef.current = false;
      logoGlowHoldActiveRef.current = false;
      clearLogoGlowHoldTimer();
      if (wasHolding) {
        logoGlowClickSuppressRef.current = true;
        window.setTimeout(() => {
          logoGlowClickSuppressRef.current = false;
        }, LOGO_GLOW_DURATION);
        startLogoGlowPulse();
      } else {
        queueLogoGlow('pulse');
      }
    },
    [
      clearLogoGlowHoldTimer,
      queueLogoGlow,
      startLogoGlowPulse,
    ],
  );

  const handleLogoPointerCancel = useCallback(
    (event: PointerEvent<HTMLAnchorElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      const wasHolding = logoGlowHoldActiveRef.current;
      logoGlowHoldIntentRef.current = false;
      logoGlowHoldActiveRef.current = false;
      clearLogoGlowHoldTimer();
      if (wasHolding && logoGlowState === 'hold') {
        setLogoGlowState('idle');
      }
      clearLogoGlowTimeout();
      clearLogoGlowRaf();
    },
    [
      clearLogoGlowHoldTimer,
      clearLogoGlowRaf,
      clearLogoGlowTimeout,
      logoGlowState,
    ],
  );

  const handleActivate = useCallback(
    (index: number) => {
      activate(index);
      if (index === 0) {
        clearExitDelay();
      } else {
        clearEnterDelay();
      }
    },
    [
      activate,
      clearEnterDelay,
      clearExitDelay,
    ],
  );

  const triggerLogoEnter = useCallback(() => {
    handleActivate(0);
    clearExitDelay();
    scheduleEnter(LOGO_ENTER_DELAY);
  }, [
    handleActivate,
    clearExitDelay,
    scheduleEnter,
  ]);

  const triggerLogoLeave = useCallback(() => {
    clearEnterDelay();
    scheduleExit(LOGO_MOUSE_LEAVE_EXIT_DELAY);
  }, [
    clearEnterDelay,
    scheduleExit,
  ]);

  const handleLogoMouseEnter = useCallback(() => {
    pointerInsideLogoRef.current = true;
    // previously blocked when "at top" — removed
    triggerLogoEnter();
  }, [
    triggerLogoEnter,
  ]);

  const handleLogoMouseLeave = useCallback(() => {
    pointerInsideLogoRef.current = false;
    hideHighlight();
    triggerLogoLeave();
  }, [
    hideHighlight,
    triggerLogoLeave,
  ]);

  const handleLogoFocus = useCallback(
    (event: FocusEvent<HTMLAnchorElement>) => {
      const focusVisible =
        event.currentTarget.matches(':focus-visible');
      pointerInsideLogoRef.current = true;
      if (focusVisible) {
        resetToIdle();
        // previously blocked when "at top" — removed
        triggerLogoEnter();
      }
    },
    [
      resetToIdle,
      triggerLogoEnter,
    ],
  );

  const handleLogoClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (typeof window === 'undefined') return;
      const { pathname: currentPath, search, hash } = window.location;
      const isRootPath =
        currentPath === normalizedRoot ||
        (normalizedRoot !== '/' &&
          currentPath === `${normalizedRoot}/`);
      const isRedirectPath = normalizedLogoRedirects.some(
        (path) => currentPath === path || currentPath === `${path}/`,
      );

      if (logoGlowClickSuppressRef.current) {
        logoGlowClickSuppressRef.current = false;
        if (!isRootPath && isRedirectPath) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      if (!isRootPath) {
        if (!isRedirectPath) return;
        return;
      }

      event.preventDefault();
      if (hash) {
        window.history.replaceState(
          window.history.state,
          '',
          `${currentPath}${search}`,
        );
      }
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      if (event.detail === 0) {
        queueLogoGlow('pulse');
      }
    },
    [
      normalizedRoot,
      normalizedLogoRedirects,
      queueLogoGlow,
    ],
  );

  const handleBlur = useCallback(
    (event: FocusEvent<HTMLAnchorElement>) => {
      pointerInsideLogoRef.current = false;
      const related = event.relatedTarget as HTMLElement | null;
      if (related && navRef.current?.contains(related)) return;
      hideHighlight();
      triggerLogoLeave();
    },
    [
      hideHighlight,
      navRef,
      triggerLogoLeave,
    ],
  );

  const handleNavMouseLeave = useCallback(() => {
    const activeElement =
      document.activeElement as HTMLElement | null;
    if (activeElement && navRef.current?.contains(activeElement))
      return;
    hideHighlight();
    clearEnterDelay();
    scheduleExit();
  }, [
    hideHighlight,
    navRef,
    clearEnterDelay,
    scheduleExit,
  ]);

  // Wait for fonts to load, then mark as mounted (for transitions)
  useEffect(() => {
    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setMounted(true));
    });
    return () => {
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, []);

  useEffect(
    () => () => {
      clearLogoGlowHoldTimer();
      clearLogoGlowTimeout();
      clearLogoGlowRaf();
      logoGlowHoldIntentRef.current = false;
      logoGlowHoldActiveRef.current = false;
    },
    [
      clearLogoGlowHoldTimer,
      clearLogoGlowTimeout,
      clearLogoGlowRaf,
    ],
  );

  // Track active section for hash updates & highlighting
  useEffect(() => {
    const sectionEls = derivedSectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!sectionEls.length) {
      setActiveSection(null);
      return;
    }

    const entryMap = new Map<Element, IntersectionObserverEntry>();

    const selectSection = (nextId: string | null) => {
      setActiveSection((prev) => (prev === nextId ? prev : nextId));
    };

    const updateFromEntries = () => {
      const entries = Array.from(entryMap.values());
      if (!entries.length) return;

      const viewportAnchor = window.innerHeight * 0.4;
      let candidate: string | null = sectionEls[0]?.id ?? null;

      for (const section of sectionEls) {
        const entry = entryMap.get(section);
        if (!entry) continue;
        const { boundingClientRect } = entry;
        if (boundingClientRect.bottom < 0) continue;
        if (boundingClientRect.top <= viewportAnchor) {
          candidate = section.id;
        } else {
          break;
        }
      }

      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.body.scrollHeight - 2;
      if (nearBottom) {
        candidate =
          sectionEls[sectionEls.length - 1]?.id ?? candidate;
      }

      selectSection(candidate);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        let changed = false;
        for (const entry of entries) {
          entryMap.set(entry.target, entry);
          changed = true;
        }
        if (!changed) return;
        updateFromEntries();
      },
      {
        root: null,
        rootMargin: '0px 0px -60% 0px',
        threshold: [
          0,
          0.4,
          1,
        ],
      },
    );

    sectionEls.forEach((el) => observer.observe(el));
    updateFromEntries();

    return () => {
      observer.disconnect();
      entryMap.clear();
    };
  }, [
    derivedSectionIds,
  ]);

  const firstSectionId = derivedSectionIds[0] ?? null;

  // Keep URL hash synced with active section
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const { pathname, search, hash } = window.location;
    const currentHash = hash.replace(/^#/, '');
    if (RESERVED_HASHES.has(currentHash)) {
      return;
    }

    if (
      !activeSection ||
      (firstSectionId && activeSection === firstSectionId)
    ) {
      if (hash) {
        window.history.replaceState(
          window.history.state,
          '',
          `${pathname}${search}`,
        );
      }
      return;
    }

    if (currentHash === activeSection) return;
    const url = `${pathname}${search}#${activeSection}`;
    window.history.replaceState(window.history.state, '', url);
  }, [
    activeSection,
    firstSectionId,
  ]);

  const renderNavLink = (
    entry: AnchorEntry,
    section: { id: string; label: string } | undefined,
    index: number,
    side: 'left' | 'right',
    isOuter: boolean,
    classes?: {
      item?: string;
      index?: string;
    },
  ) => {
    if (!section) return null;
    const { id, label } = section;
    const isActive = activeSection === id;
    const skew = isOuter ? menuVars.skew : menuVars.skew.half();
    const debugFocusAttr =
      focusDebugIndex === index ? 'true' : undefined;
    const transformIntents: TransformIntent[] = [
      {
        skew: {
          x: side === 'right' ? skew.negation() : skew,
        },
      },
    ];
    if (isOuter) {
      transformIntents.push({
        translate: { y: m(0) },
      });
      transformIntents.push({
        rotate: {
          value: m(0.5, 'deg').negation(side === 'left'),
        },
      });
    }
    return (
      <li
        className={clsx(classes?.item, classes?.index)}
        key={entry.hrefKey}
      >
        <Link
          href={`#${id}`}
          className={s.navLink}
          ref={(el) => {
            registerLinkRef(index, el);
          }}
          data-side={side}
          data-active={isActive}
          data-outer={isOuter}
          data-debug-focus={debugFocusAttr}
          aria-current={isActive ? 'true' : undefined}
          style={transforms(...transformIntents)}
          onMouseEnter={() => handleActivate(index)}
          onMouseLeave={hideHighlight}
          onFocus={(event) => {
            if (event.currentTarget.matches(':focus-visible')) {
              handleActivate(index);
            }
          }}
          onBlur={handleBlur}
        >
          <span className={s.fakeShadow} aria-hidden={true}>
            {label}
          </span>
          <span className={s.text}>{label}</span>
        </Link>
      </li>
    );
  };

  return (
    <>
      {shouldRenderCuriosity && curiosityMessages ? (
        <ConsoleCuriosity
          title={curiosityMessages.title}
          test={curiosityMessages.test}
          result={curiosityMessages.result}
          hint={curiosityMessages.hint}
          targetHref={curiosityMessages.targetHref}
        />
      ) : null}
      <div className={s.root} data-mounted={mounted}>
        <SkipNavLink contentId="body" className={skipNavStyles.link}>
          {skipNavLabel}
        </SkipNavLink>
        <Arch
          ready={mounted}
          width={navMetrics.width}
          glow={logoGlowState === 'idle' ? null : logoGlowState}
          debugGlow={debugGlow}
        >
          <nav
            className={clsx(s.nav)}
            ref={navRef}
            onMouseLeave={handleNavMouseLeave}
            data-mini-bokeh={
              highlightEnabled ? 'enabled' : 'disabled'
            }
            data-motion={motionPreference}
          >
            {highlightEnabled ? (
              <div
                className={s.highlightLayer}
                aria-hidden
                style={raiseLayer ? { zIndex: 5 } : undefined}
              >
                {showArchPath && debugArch ? (
                  <svg
                    className={s.debugArch}
                    viewBox={`0 0 ${debugArch.width} ${debugArch.height}`}
                    width={debugArch.width}
                    height={debugArch.height}
                    preserveAspectRatio="none"
                  >
                    <path
                      d={debugArch.path}
                      fill="none"
                      stroke="rgba(255,255,255,0.35)"
                      strokeWidth={1}
                      strokeDasharray="4 4"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                ) : null}
                <div
                  className={s.miniBokehContainer}
                  style={highlightStyles.containerStyle}
                  data-active={miniBokehActive ? 'true' : 'false'}
                >
                  <div
                    className={clsx(s.miniBokeh)}
                    style={bokehInlineStyle}
                    data-bokeh-index={highlightSlotIndex}
                    data-bokeh-state={
                      highlightVisible
                        ? isHighlightTraveling
                          ? 'travel'
                          : 'idle'
                        : 'hidden'
                    }
                  >
                    <span
                      className={clsx(
                        s.bokehBlobAlpha,
                        alphaSlotClass,
                        travelAlphaClass,
                        debugBlobClass,
                      )}
                      data-blob="alpha"
                    />
                    <span
                      className={clsx(
                        s.bokehBlobBeta,
                        betaSlotClass,
                        travelBetaClass,
                        debugBlobClass,
                      )}
                      data-blob="beta"
                    />
                    <span
                      className={clsx(
                        s.bokehBlobGamma,
                        gammaSlotClass,
                        travelGammaClass,
                        debugBlobClass,
                      )}
                      data-blob="gamma"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            <div className={clsx(s.contents)}>
              <div className={clsx(s.logoItem, s.item)}>
                <Link
                  href={root}
                  className={s.logoLink}
                  prefetch={false}
                  ref={(el) => {
                    registerLinkRef(0, el);
                  }}
                  onClick={handleLogoClick}
                  onPointerDown={handleLogoPointerDown}
                  onPointerUp={handleLogoPointerUp}
                  onPointerCancel={handleLogoPointerCancel}
                  onMouseEnter={handleLogoMouseEnter}
                  onMouseLeave={handleLogoMouseLeave}
                  onFocus={handleLogoFocus}
                  onBlur={handleBlur}
                  data-debug-focus={
                    focusDebugIndex === 0 ? 'true' : undefined
                  }
                  /* removed: data-at-top */
                  data-logo-anim={logoAnimationState}
                >
                  <div className={s.logoClip}>
                    <div className={s.logoWrap}>
                      <Logo
                        className={s.logo}
                        idBase={logoId}
                        colourState={
                          logoAnimationState === 'enter'
                            ? 'color'
                            : 'mono'
                        }
                      />
                    </div>
                  </div>
                </Link>
              </div>

              <ul
                className={clsx(s.list, s.transitionAfterFonts)}
                aria-label={leftLabel}
                data-side="left"
                style={getRotationStyle('left', navMetrics.width)}
              >
                {anchors.slice(0, 2).map((entry, idx) =>
                  renderNavLink(
                    entry,
                    resolvedSections[idx],
                    idx + 1,
                    'left',
                    idx === 0,
                    {
                      item: s.item,
                      index: idx === 0 ? s.item_1 : s.item_2,
                    },
                  ),
                )}
              </ul>

              <ul
                className={clsx(s.list, s.transitionAfterFonts)}
                aria-label={rightLabel}
                data-side="right"
                style={getRotationStyle('right', navMetrics.width)}
              >
                {anchors.slice(2).map((entry, idx) =>
                  renderNavLink(
                    entry,
                    resolvedSections[idx + 2],
                    idx + 3,
                    'right',
                    idx === 1,
                    {
                      item: s.item,
                      index: idx === 0 ? s.item_3 : s.item_4,
                    },
                  ),
                )}
              </ul>
            </div>
          </nav>

          <nav
            className={clsx(s.localeChanger, s.transitionAfterFonts)}
            aria-label={localeChangeLabel}
          >
            {localeLinks.map((link) => {
              const overrides =
                canonicalToLocalizedSlugs[link.locale] ?? {};
              const localizedFirst = canonicalFirstSegment
                ? (overrides[canonicalFirstSegment] ??
                  canonicalFirstSegment)
                : canonicalFirstSegment;
              const localizedSegments = [
                localizedFirst,
                ...tailSegments,
              ].filter(Boolean);
              const targetPath = localizedSegments.length
                ? `/${localizedSegments.join('/')}`
                : '';
              const target = `/${link.locale}${targetPath}`;
              const hashedTarget = appendReservedModalHash(target);
              return (
                <Link
                  key={link.locale}
                  href={hashedTarget}
                  className={clsx(s.link, s.localeLink)}
                  hrefLang={link.locale}
                >
                  <span className={s.fakeShadow} aria-hidden={true}>
                    {link.label}
                  </span>
                  <span className={s.text}>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </Arch>
      </div>
    </>
  );
}
