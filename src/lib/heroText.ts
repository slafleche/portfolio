"use client";

import type { IMeasurement } from '@/styles/helpers/measurement';
import { heroTextVars } from '@/styles/vars/heroText.vars';
import type { Channel } from '@/styles/vars/heroText.vars';
import { colorVars } from '@/styles/vars';

type Tier = keyof typeof heroTextVars.viewportTiers;

type PlayOptions = {
	tier?: Tier;
	prefersReducedMotion?: boolean;
};

type PlayHandle = Promise<void> & { cancel: () => void };

type ChannelState = {
	x: number;
	y: number;
	blur: number;
	scale: number;
};

const SESSION_KEY = 'hero:text:played';
const REDUCE_QUERY = '(prefers-reduced-motion: reduce)';
const DEBUG = false;

if (DEBUG && typeof window !== 'undefined') {
	console.log('[hero-text] module loaded');
}

const easing = {
	outExpo: (t: number) =>
		t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
	outQuad: (t: number) => 1 - (1 - t) * (1 - t),
	outCubic: (t: number) => 1 - Math.pow(1 - t, 3),
};

const CHANNELS: Channel[] = ['blue', 'green', 'red'];
const BACKDROP_TARGET_ALPHA = 0.85;

const activeAnimations = new WeakMap<HTMLElement, () => void>();

const measurementToNumber = (
	measurement: IMeasurement,
	expectedUnit: string,
	context: string,
): number => {
	if (!measurement.isUnit(expectedUnit)) {
		throw new Error(
			`${context}: Expected unit "${expectedUnit}", received "${measurement.getUnit()}"`,
		);
	}
	return measurement.value;
};

const clamp = (value: number, min: number, max: number): number =>
	Math.min(Math.max(value, min), max);

const lerp = (from: number, to: number, t: number): number =>
	from + (to - from) * t;

const formatPx = (value: number): string => {
	const fixed = value.toFixed(3);
	return `${Number.parseFloat(fixed)}px`;
};

const formatScale = (value: number): string =>
	value === 1 ? '1' : Number.parseFloat(value.toFixed(4)).toString();

const getPrefersReducedMotion = (): boolean => {
	if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
		return false;
	}
	return window.matchMedia(REDUCE_QUERY).matches;
};

const applyChannelState = (
	element: HTMLElement | null,
	state: ChannelState,
) => {
	if (!element) return;
	element.style.transform = `translate3d(${formatPx(state.x)}, ${formatPx(
		state.y,
	)}, 0) scale(${formatScale(state.scale)})`;
	element.style.filter = `blur(${formatPx(Math.max(state.blur, 0))})`;
};

const applyFinalState = ({
	master,
	ghost,
	channels,
	backdrop,
}: {
	master: HTMLElement;
	ghost: HTMLElement;
	channels: Record<Channel, HTMLElement | null>;
	backdrop: HTMLElement | null;
}) => {
	master.style.opacity = '1';
	master.style.transform = 'scale(1)';
	master.style.filter = 'none';

	ghost.style.opacity = '0';
	ghost.style.filter = 'blur(0px)';

	CHANNELS.forEach((channel) =>
		applyChannelState(channels[channel], {
			x: 0,
			y: 0,
			blur: 0,
			scale: 1,
		}),
	);

	if (backdrop) {
		backdrop.style.backgroundColor = colorVars.black
			.alpha(BACKDROP_TARGET_ALPHA)
			.css();
		backdrop.style.opacity = '1';
	}
};

/**
 * @deprecated Use playProjectorText from '@/lib/projectorText'.
 */
export function playHeroText(
	masterEl: HTMLElement,
	ghostEl: HTMLElement,
	tierOrOptions?: Tier | PlayOptions,
	opts?: PlayOptions,
): PlayHandle {
	if (DEBUG) {
		console.log('[hero-text] playHeroText called', { masterEl, ghostEl, tierOrOptions, opts });
	}
	let tier: Tier = 'desktop';
	let options: PlayOptions | undefined;
	if (typeof tierOrOptions === 'string') {
		tier = tierOrOptions;
		options = opts;
	} else {
		options = tierOrOptions;
		tier = tierOrOptions?.tier ?? 'desktop';
	}

	const prefersReducedMotion =
		options?.prefersReducedMotion ?? getPrefersReducedMotion();

	const sessionStorageAvailable =
		typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';

	const hasPlayed = false;

	const container = ghostEl.parentElement;
	const backdrop = container?.querySelector<HTMLElement>(
		'[data-hero-text-backdrop]',
	) ?? null;

	const channelElements: Record<Channel, HTMLElement | null> = {
		blue: ghostEl.querySelector<HTMLElement>('[data-channel="blue"]'),
		green: ghostEl.querySelector<HTMLElement>('[data-channel="green"]'),
		red: ghostEl.querySelector<HTMLElement>('[data-channel="red"]'),
	};

	const tierVars =
		heroTextVars.viewportTiers[tier] ??
		heroTextVars.viewportTiers.desktop;

	const blurStart = measurementToNumber(
		tierVars.blurStart,
		'px',
		'heroText.blurStart',
	);
	const offsetX = measurementToNumber(
		tierVars.offsetX,
		'px',
		'heroText.offsetX',
	);
	const offsetY = measurementToNumber(
		tierVars.offsetY,
		'px',
		'heroText.offsetY',
	);

	const totalDurationMs = measurementToNumber(
		heroTextVars.timings.totalDuration,
		'ms',
		'heroText.totalDuration',
	);

	const channelPaths: Record<Channel, Array<{ time: number; x: number; y: number }>> = {
		blue: [],
		green: [],
		red: [],
	};

	CHANNELS.forEach((channel) => {
		const raw = heroTextVars.paths?.[channel] ?? [];
		channelPaths[channel] = raw
			.map((step, index) => ({
				time: measurementToNumber(
					step.time,
					'ms',
					`heroText.paths.${channel}.${index}.time`,
				),
				x: offsetX * step.x,
				y: offsetY * step.y,
			}))
			.sort((a, b) => a.time - b.time);
	});

	const blurSeries = {
		blue: heroTextVars.blurSeries?.blue ?? [],
		green: heroTextVars.blurSeries?.green ?? [],
		red: heroTextVars.blurSeries?.red ?? [],
	};

	const convergeWindows = {
		blue: {
			start: measurementToNumber(
				heroTextVars.converge.windows.blue.start,
				'ms',
				'heroText.converge.windows.blue.start',
			),
			end: measurementToNumber(
				heroTextVars.converge.windows.blue.end,
				'ms',
				'heroText.converge.windows.blue.end',
			),
		},
		green: {
			start: measurementToNumber(
				heroTextVars.converge.windows.green.start,
				'ms',
				'heroText.converge.windows.green.start',
			),
			end: measurementToNumber(
				heroTextVars.converge.windows.green.end,
				'ms',
				'heroText.converge.windows.green.end',
			),
		},
		red: {
			start: measurementToNumber(
				heroTextVars.converge.windows.red.start,
				'ms',
				'heroText.converge.windows.red.start',
			),
			end: measurementToNumber(
				heroTextVars.converge.windows.red.end,
				'ms',
				'heroText.converge.windows.red.end',
			),
		},
	};

	const channelScale = {
		blue: {
			start: Number(heroTextVars.channelScale.blue.start),
			end: Number(heroTextVars.channelScale.blue.end),
			startMs: measurementToNumber(
				heroTextVars.channelScale.blue.startMs,
				'ms',
				'heroText.channelScale.blue.startMs',
			),
			endMs: measurementToNumber(
				heroTextVars.channelScale.blue.endMs,
				'ms',
				'heroText.channelScale.blue.endMs',
			),
			easing: heroTextVars.channelScale.blue.easing,
		},
		green: {
			start: Number(heroTextVars.channelScale.green.start),
			end: Number(heroTextVars.channelScale.green.end),
			startMs: measurementToNumber(
				heroTextVars.channelScale.green.startMs,
				'ms',
				'heroText.channelScale.green.startMs',
			),
			endMs: measurementToNumber(
				heroTextVars.channelScale.green.endMs,
				'ms',
				'heroText.channelScale.green.endMs',
			),
			easing: heroTextVars.channelScale.green.easing,
		},
		red: {
			start: Number(heroTextVars.channelScale.red.start),
			end: Number(heroTextVars.channelScale.red.end),
			startMs: measurementToNumber(
				heroTextVars.channelScale.red.startMs,
				'ms',
				'heroText.channelScale.red.startMs',
			),
			endMs: measurementToNumber(
				heroTextVars.channelScale.red.endMs,
				'ms',
				'heroText.channelScale.red.endMs',
			),
			easing: heroTextVars.channelScale.red.easing,
		},
	};

	const convergeBlurEnd = measurementToNumber(
		heroTextVars.converge.blurEnd,
		'px',
		'heroText.converge.blurEnd',
	);
	const opacityDipTime = measurementToNumber(
		heroTextVars.converge.opacityDip.time,
		'ms',
		'heroText.converge.opacityDip.time',
	);
	const opacityDipReturn = measurementToNumber(
		heroTextVars.converge.opacityDip.returnAt,
		'ms',
		'heroText.converge.opacityDip.returnAt',
	);
	const opacityDipTarget = heroTextVars.converge.opacityDip.to;

	const whiteFadeStart = measurementToNumber(
		heroTextVars.whiteReveal.fade.start,
		'ms',
		'heroText.whiteReveal.fade.start',
	);
	const whiteFadeEnd = measurementToNumber(
		heroTextVars.whiteReveal.fade.end,
		'ms',
		'heroText.whiteReveal.fade.end',
	);

	const pulseStart = measurementToNumber(
		heroTextVars.whiteReveal.pulse.start,
		'ms',
		'heroText.whiteReveal.pulse.start',
	);
	const pulseEnd = measurementToNumber(
		heroTextVars.whiteReveal.pulse.end,
		'ms',
		'heroText.whiteReveal.pulse.end',
	);
	const pulseBoost = heroTextVars.whiteReveal.pulse.brightnessBoost;

	const backdropFadeStart = measurementToNumber(
		heroTextVars.backgroundFade.start,
		'ms',
		'heroText.backgroundFade.start',
	);
	const backdropFadeEnd = measurementToNumber(
		heroTextVars.backgroundFade.end,
		'ms',
		'heroText.backgroundFade.end',
	);

	const settleMaster = {
		from: Number(heroTextVars.settle.masterScale.from),
		to: Number(heroTextVars.settle.masterScale.to),
		start: measurementToNumber(
			heroTextVars.settle.masterScale.start,
			'ms',
			'heroText.settle.masterScale.start',
		),
		end: measurementToNumber(
			heroTextVars.settle.masterScale.end,
			'ms',
			'heroText.settle.masterScale.end',
		),
		easing: heroTextVars.settle.masterScale.easing,
	};

	const settleGhostFade = {
		from: Number(heroTextVars.settle.ghostFade.from),
		to: Number(heroTextVars.settle.ghostFade.to),
		start: measurementToNumber(
			heroTextVars.settle.ghostFade.start,
			'ms',
			'heroText.settle.ghostFade.start',
		),
		end: measurementToNumber(
			heroTextVars.settle.ghostFade.end,
			'ms',
			'heroText.settle.ghostFade.end',
		),
	};

	const positionAt = (
		channel: Channel,
		time: number,
	): { x: number; y: number } => {
		const steps = channelPaths[channel];
		if (steps.length === 0) return { x: 0, y: 0 };
		let previous = steps[0];
		if (time <= previous.time) return { x: previous.x, y: previous.y };
		for (let i = 1; i < steps.length; i += 1) {
			const current = steps[i];
			if (time <= current.time) {
				const span = Math.max(current.time - previous.time, 1);
				const t = clamp((time - previous.time) / span, 0, 1);
				return {
					x: lerp(previous.x, current.x, t),
					y: lerp(previous.y, current.y, t),
				};
			}
			previous = current;
		}
		return { x: previous.x, y: previous.y };
	};

	const blurAt = (channel: Channel, time: number): number => {
		const series = blurSeries[channel] ?? [];
		if (series.length === 0) return blurStart;
		let previous = series[0];
		let next: (typeof series)[number] | null = null;
		for (const point of series) {
			if (time === point.time) {
				return measurementToNumber(
					point.value,
					'px',
					`heroText.blurSeries.${channel}.value`,
				);
			}
			if (time > point.time) {
				previous = point;
				continue;
			}
			next = point;
			break;
		}
		if (!next) {
			return measurementToNumber(
				previous.value,
				'px',
				`heroText.blurSeries.${channel}.value`,
			);
		}
		const prevValue = measurementToNumber(
			previous.value,
			'px',
			`heroText.blurSeries.${channel}.value`,
		);
		const nextValue = measurementToNumber(
			next.value,
			'px',
			`heroText.blurSeries.${channel}.value`,
		);
		const span = Math.max(next.time - previous.time, 1);
		const t = clamp((time - previous.time) / span, 0, 1);
		return lerp(prevValue, nextValue, t);
	};

	const channelInitialScale: Record<Channel, number> = {
		blue: channelScale.blue.start,
		green: channelScale.green.start,
		red: channelScale.red.start,
	};

	const willChangeTargets: Array<HTMLElement | null> = [
		masterEl,
		ghostEl,
		backdrop,
		channelElements.blue,
		channelElements.green,
		channelElements.red,
	];

	const addWillChange = () => {
		masterEl.style.willChange = 'opacity, transform, filter';
		ghostEl.style.willChange = 'transform, opacity, filter';
		if (backdrop) {
			backdrop.style.willChange = 'opacity, background-color';
		}
		CHANNELS.forEach((channel) => {
			const el = channelElements[channel];
			if (el) {
				el.style.willChange = 'transform, filter';
			}
		});
	};

	const removeWillChange = () => {
		willChangeTargets.forEach((el) => {
			if (!el) return;
			el.style.willChange = '';
		});
	};

	const cleanup = () => {
		removeWillChange();
		observer?.disconnect();
		if (rafId !== null) {
			cancelAnimationFrame(rafId);
		}
		activeAnimations.delete(masterEl);
	};

	if (prefersReducedMotion || hasPlayed) {
		addWillChange();
		applyFinalState({
			master: masterEl,
			ghost: ghostEl,
			channels: channelElements,
			backdrop,
		});
		removeWillChange();
		return Object.assign(Promise.resolve(), {
			cancel: () => undefined,
		});
	}

	activeAnimations.get(masterEl)?.();

	let rafId: number | null = null;
	let startTime: number | null = null;
	let resolved = false;

	const totalDuration = totalDurationMs;
	const ghostBaseOpacity = settleGhostFade.from;

	const updateFrame = (elapsed: number) => {
		if (DEBUG && elapsed === 0) {
			console.log('[hero-text] paths snapshot', channelPaths);
		}
		const frameSnapshot: Record<Channel, { x: number; y: number; blur: number; scale: number }> = {
			blue: { x: 0, y: 0, blur: 0, scale: 1 },
			green: { x: 0, y: 0, blur: 0, scale: 1 },
			red: { x: 0, y: 0, blur: 0, scale: 1 },
		};

	CHANNELS.forEach((channel) => {
		const channelEl = channelElements[channel];
		const window = convergeWindows[channel];
		const pathPosition = positionAt(channel, Math.min(elapsed, window.end));
		let x = pathPosition.x;
		let y = pathPosition.y;
		let blur = blurAt(channel, elapsed);

		if (elapsed >= window.end) {
			x = 0;
			y = 0;
			blur = convergeBlurEnd;
		}

		const scaleDef = channelScale[channel];
		const scaleEasing =
			easing[scaleDef.easing as keyof typeof easing] ?? easing.outExpo;
		let scale = scaleDef.start;
		if (elapsed >= scaleDef.startMs) {
			const span = Math.max(scaleDef.endMs - scaleDef.startMs, 1);
			const rawScaleT = clamp(
				(elapsed - scaleDef.startMs) / span,
				0,
				1,
			);
			const scaleHold = 0.5;
			let scaleProgress = 0;
			if (rawScaleT > scaleHold) {
				const easedScaleT = clamp(
					(rawScaleT - scaleHold) / (1 - scaleHold),
					0,
					1,
				);
				scaleProgress = scaleEasing(easedScaleT);
			}
			scale = lerp(scaleDef.start, scaleDef.end, scaleProgress);
		}
		if (elapsed >= scaleDef.endMs) {
			scale = scaleDef.end;
		}

		applyChannelState(channelEl, {
			x,
			y,
			blur,
			scale,
		});

		frameSnapshot[channel] = { x, y, blur, scale };
	});

		let ghostOpacity = ghostBaseOpacity;
		if (elapsed >= settleGhostFade.start) {
			const span = Math.max(settleGhostFade.end - settleGhostFade.start, 1);
			const t = clamp(
				(elapsed - settleGhostFade.start) / span,
				0,
				1,
			);
			ghostOpacity = lerp(settleGhostFade.from, settleGhostFade.to, t);
		}
		if (elapsed >= opacityDipTime && elapsed < opacityDipReturn) {
			ghostOpacity = Math.min(ghostOpacity, opacityDipTarget);
		}
	if (elapsed >= totalDuration) {
		ghostOpacity = settleGhostFade.to;
	}
	ghostEl.style.opacity = ghostOpacity.toFixed(3);

	let masterOpacity = 0;
	if (elapsed >= whiteFadeStart) {
		const span = Math.max(whiteFadeEnd - whiteFadeStart, 1);
		const raw = clamp((elapsed - whiteFadeStart) / span, 0, 1);
		const hold = 0.7;
		if (raw <= hold) {
			masterOpacity = lerp(0, 0.35, raw / hold);
		} else {
			const eased = easing.outQuad(clamp((raw - hold) / (1 - hold), 0, 1));
			masterOpacity = lerp(0.35, 1, eased);
		}
	}
	if (elapsed >= whiteFadeEnd) {
		masterOpacity = 1;
	}
		masterEl.style.opacity = masterOpacity.toFixed(3);

		let masterScale = settleMaster.from;
		if (elapsed >= settleMaster.start) {
			const span = Math.max(settleMaster.end - settleMaster.start, 1);
			const t = clamp(
				(elapsed - settleMaster.start) / span,
				0,
				1,
			);
			const eased =
				easing[settleMaster.easing as keyof typeof easing] ?? easing.outCubic;
			masterScale = lerp(settleMaster.from, settleMaster.to, eased(t));
		}
		if (elapsed >= settleMaster.end) {
			masterScale = settleMaster.to;
		}
		masterEl.style.transform = `scale(${formatScale(masterScale)})`;

		let masterFilter = '';
		if (elapsed >= pulseStart && elapsed <= pulseEnd) {
			const mid = (pulseStart + pulseEnd) / 2;
			let boost = 0;
			if (elapsed <= mid) {
				const t = clamp(
					(elapsed - pulseStart) / Math.max(mid - pulseStart, 1),
					0,
					1,
				);
				boost = lerp(0, pulseBoost, t);
			} else {
				const t = clamp(
					(pulseEnd - elapsed) / Math.max(pulseEnd - mid, 1),
					0,
					1,
				);
				boost = lerp(0, pulseBoost, t);
			}
			masterFilter = `brightness(${(1 + boost).toFixed(3)})`;
		}
	masterEl.style.filter = masterFilter;

	if (DEBUG) {
		console.log('[hero-text] frame', {
			elapsed,
			channels: frameSnapshot,
			masterOpacity: masterEl.style.opacity,
			ghostOpacity: ghostEl.style.opacity,
		});
	}

		if (backdrop) {
			let targetAlpha = 0;
			if (elapsed >= backdropFadeStart) {
				const span = Math.max(backdropFadeEnd - backdropFadeStart, 1);
				const t = clamp(
					(elapsed - backdropFadeStart) / span,
					0,
					1,
				);
				const eased = easing.outQuad(t);
				targetAlpha = eased * BACKDROP_TARGET_ALPHA;
			}
			if (elapsed >= backdropFadeEnd) {
				targetAlpha = BACKDROP_TARGET_ALPHA;
			}
			backdrop.style.backgroundColor = colorVars.black
				.alpha(targetAlpha)
				.css();
			const normalized =
				BACKDROP_TARGET_ALPHA === 0
					? 0
					: clamp(targetAlpha / BACKDROP_TARGET_ALPHA, 0, 1);
			backdrop.style.opacity = normalized.toFixed(3);
		}
	};

	const step = (timestamp: number) => {
		if (startTime === null) {
			startTime = timestamp;
		}
		const elapsed = timestamp - startTime;
		updateFrame(elapsed);

		if (elapsed < totalDuration) {
			rafId = requestAnimationFrame(step);
		} else {
			updateFrame(totalDuration);
			if (!resolved) {
				resolved = true;
				cleanup();
				if (sessionStorageAvailable) {
					window.sessionStorage.setItem(SESSION_KEY, '1');
				}
				fulfill();
			}
		}
	};

	let fulfill!: () => void;
	const promise = new Promise<void>((resolve) => {
		fulfill = resolve;
	});

	const startAnimation = () => {
		addWillChange();
		masterEl.style.opacity = '0';
		ghostEl.style.opacity = ghostBaseOpacity.toFixed(3);
		CHANNELS.forEach((channel) => {
			const el = channelElements[channel];
			const scaleStart = channelInitialScale[channel];
	const initialPosition = positionAt(channel, 0);
			const initialBlur = blurAt(channel, 0);
			applyChannelState(el, {
				x: initialPosition.x,
				y: initialPosition.y,
				blur: initialBlur,
				scale: scaleStart,
			});
		});
		if (backdrop) {
			backdrop.style.opacity = '0';
		}

		rafId = requestAnimationFrame(step);
	};

	const observer =
		typeof window !== 'undefined' && typeof IntersectionObserver !== 'undefined'
			? new IntersectionObserver((entries) => {
					for (const entry of entries) {
						if (entry.isIntersecting) {
							observer?.disconnect();
							startAnimation();
							break;
						}
					}
				}, { threshold: 0.6 })
			: null;

	if (observer) {
		observer.observe(masterEl);
	} else {
		startAnimation();
	}

	const handle = Object.assign(promise, {
		cancel: () => {
			if (resolved) return;
			resolved = true;
			cleanup();
			fulfill();
		},
	});

	activeAnimations.set(masterEl, handle.cancel);

	return handle;
}
