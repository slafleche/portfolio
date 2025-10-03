import { useCallback, useEffect, useRef, useState } from 'react';

export const LOGO_ENTER_DELAY = 0;
export const LOGO_MOUSE_LEAVE_EXIT_DELAY = 140;
export const LOGO_EXIT_DURATION = 560;

type LogoState = 'idle' | 'enter' | 'exit';

export function useLogoAnimation() {
	const [state, setState] = useState<LogoState>('idle');
	const stateRef = useRef<LogoState>('idle');
	const enterDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const exitDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const clearEnterDelay = useCallback(() => {
		if (enterDelayRef.current) {
			clearTimeout(enterDelayRef.current);
			enterDelayRef.current = null;
		}
	}, []);

	const clearExitDelay = useCallback(() => {
		if (exitDelayRef.current) {
			clearTimeout(exitDelayRef.current);
			exitDelayRef.current = null;
		}
	}, []);

	const clearExitTimeout = useCallback(() => {
		if (exitTimeoutRef.current) {
			clearTimeout(exitTimeoutRef.current);
			exitTimeoutRef.current = null;
		}
	}, []);

	const runEnter = useCallback(() => {
		clearEnterDelay();
		clearExitDelay();
		clearExitTimeout();
		if (stateRef.current === 'enter') return;
		stateRef.current = 'enter';
		setState('enter');
	}, [clearEnterDelay, clearExitDelay, clearExitTimeout]);

	const runExit = useCallback(() => {
		clearEnterDelay();
		clearExitDelay();
		if (stateRef.current === 'idle') return;
		stateRef.current = 'exit';
		setState('exit');
		clearExitTimeout();
		exitTimeoutRef.current = setTimeout(() => {
			stateRef.current = 'idle';
			setState('idle');
			exitTimeoutRef.current = null;
		}, LOGO_EXIT_DURATION);
	}, [clearEnterDelay, clearExitDelay, clearExitTimeout]);

	const scheduleEnter = useCallback(
		(delay = LOGO_ENTER_DELAY) => {
			clearEnterDelay();
			if (delay <= 0) {
				runEnter();
				return;
			}
			enterDelayRef.current = setTimeout(() => {
				enterDelayRef.current = null;
				runEnter();
			}, delay);
		},
		[runEnter, clearEnterDelay],
	);

	const scheduleExit = useCallback(
		(delay = 0) => {
			clearExitDelay();
			if (delay <= 0) {
				runExit();
				return;
			}
			exitDelayRef.current = setTimeout(() => {
				exitDelayRef.current = null;
				runExit();
			}, delay);
		},
		[runExit, clearExitDelay],
	);

	const resetToIdle = useCallback(() => {
		clearEnterDelay();
		clearExitDelay();
		clearExitTimeout();
		stateRef.current = 'idle';
		setState('idle');
	}, [clearEnterDelay, clearExitDelay, clearExitTimeout]);

	useEffect(
		() => () => {
			clearEnterDelay();
			clearExitDelay();
			clearExitTimeout();
		},
		[clearEnterDelay, clearExitDelay, clearExitTimeout],
	);

	return {
		state,
		scheduleEnter,
		scheduleExit,
		runEnter,
		runExit,
		clearEnterDelay,
		clearExitDelay,
		resetToIdle,
		clearExitTimeout,
	};
}
