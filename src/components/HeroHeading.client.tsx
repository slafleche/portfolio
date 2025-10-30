'use client';

import {
	Children,
	useEffect,
	useMemo,
	useRef,
	type CSSProperties,
	type ReactElement,
	type ReactNode,
} from 'react';
import clsx from 'clsx';
import * as heroStyles from '@/styles/components/hero.css';
import * as revealStyles from '@/styles/components/heroText.css';
import { playProjectorText } from '@/lib/projectorText';
import { usePrefersReducedMotion } from '@/lib/accessibility/usePrefersReducedMotion';
import { projectorVars } from '@/styles/vars/projector.vars';
import type { ProjectorChannel } from '@/styles/vars/projector.vars';

type Props = {
	children: ReactNode;
	debugStage?: 'initial' | 'waypoint' | 'focus' | 'reveal';
};

const CHANNELS: ProjectorChannel[] = ['blue', 'green', 'red'];

export default function HeroHeading({ children, debugStage }: Props) {
	const masterRef = useRef<HTMLElement | null>(null);
	const ghostRef = useRef<HTMLSpanElement | null>(null);
	const prefersReducedMotion = usePrefersReducedMotion();
	console.log('[HeroHeading] render', {
		childrenCount: Children.count(children),
	});

	const initialChannelStyles = useMemo(() => {
		const formatPx = (value: number) => `${value.toFixed(3)}px`;

		return CHANNELS.reduce((acc, channel) => {
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
		}, {} as Record<ProjectorChannel, CSSProperties>);
	}, []);

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
					const element = child as ReactElement<
						{ ['data-text']?: string }
					>;
					if (typeof element.props?.['data-text'] === 'string') {
						return element.props['data-text'];
					}
				}
				return '';
			})
			.join('|');
	}, [children]);

	useEffect(() => {
		const master = masterRef.current;
		const ghost = ghostRef.current;
		if (!master || !ghost) return;

		console.log('[HeroHeading] useEffect', {
			master,
			ghost,
			prefersReducedMotion,
		});

		const playHandle = playProjectorText(master, ghost, 'desktop', {
			prefersReducedMotion,
			debugFreezeStage: debugStage,
		});

		if (typeof window !== 'undefined') {
			(window as typeof window & { __heroDebug?: true }).__heroDebug = true;
		}

		return () => playHandle.cancel();
	}, [contentSignature, prefersReducedMotion, debugStage]);

	const channelClassMap: Record<ProjectorChannel, string> = {
		blue: revealStyles.channelBlue,
		green: revealStyles.channelGreen,
		red: revealStyles.channelRed,
	};

	return (
		<div className={revealStyles.container} data-hero-text="heroText">
			<span
				ref={ghostRef}
				className={clsx(
					revealStyles.ghost,
					revealStyles.layer,
					heroStyles.heading,
				)}
				aria-hidden="true"
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

			<span
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
			</span>
		</div>
	);
}
