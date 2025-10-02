'use client';
import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import * as s from '../styles/components/godrays.css';
import { godRaysVars } from '../styles/godrays';
import ImageByName from './ImageByName';

type Props = {
	className?: string;
	image: { name: string; title: string; alt: string };
	debug?: boolean; // keep true while we tune the gradient feel
};

export const GodRays: React.FC<Props> = ({
	className,
	image,
	debug = true,
}) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		if (!canvasRef.current || !debug) return;

		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d', { willReadFrequently: false });
		if (!ctx) return;

		const dpr = Math.max(1, window.devicePixelRatio || 1);

		const resize = () => {
			const parent = canvas.parentElement;
			if (!parent) return;
			const rect = parent.getBoundingClientRect();
			canvas.width = Math.max(1, Math.round(rect.width * dpr));
			canvas.height = Math.max(1, Math.round(rect.height * dpr));
			canvas.style.width = `${Math.max(1, Math.round(rect.width))}px`;
			canvas.style.height = `${Math.max(1, Math.round(rect.height))}px`;
		};

		resize();
		window.addEventListener('resize', resize);

		let frame = 0;
		let raf = 0;

		const render = () => {
			frame++;

			const W = canvas.width;
			const H = canvas.height;

			// clear
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.clearRect(0, 0, W, H);

			// ---- Directional “god ray” field (no visible convergence) ----
			const {
				dirDeg, // global direction of the shafts
				bandsPer1000, // base number of bright/dark bands per 1000px perpendicular to rays
				driftX, // sideways drift speed
				driftY, // along-ray drift speed (tiny)
				contrast, // 0..2
				layer2Scale, // secondary sine weight
				layer3Scale, // tertiary sine weight
				perspectiveK, // how much band spacing stretches along the ray
				jitterAmt, // small random variation in band spacing
			} = godRaysVars;

			const rad = (dirDeg * Math.PI) / 180;
			// rotation basis for ray-aligned coords
			const cosA = Math.cos(rad);
			const sinA = Math.sin(rad);

			// frequencies in radians per pixel (perpendicular axis)
			const baseFreq = (bandsPer1000 / 1000) * Math.PI * 2;

			// drift phases
			const phase = frame * 0.01 * driftX;
			const phaseAlong = frame * 0.01 * driftY;

			const img = ctx.createImageData(W, H);
			const data = img.data;

			// simple hash for stable jitter by x,y
			const hash = (x: number, y: number) => {
				const n = (x * 374761393 + y * 668265263) ^ (x << 13);
				return (
					((n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff) /
					0x7fffffff
				);
			};

			// loop
			for (let y = 0; y < H; y++) {
				for (let x = 0; x < W; x++) {
					// rotate into (s,t): s = along-ray, t = across-ray
					const s = x * cosA + y * sinA;
					const t = -x * sinA + y * cosA;

					// perspective: spacing slowly stretches with s (subtle)
					const stretch = 1 + perspectiveK * (s / Math.max(W, H));

					// tiny per-pixel jitter to avoid perfect combing
					const j = (hash(x, y) - 0.5) * 2 * jitterAmt;

					const u = t * baseFreq * stretch + phase + j; // core coordinate across rays
					const u2 = u * 0.53 + phaseAlong * 0.37;
					const u3 = u * 1.77 - phaseAlong * 0.21;

					// soft multi-sine — looks like layered caustics rather than bars
					let v = 0.0;
					v += Math.sin(u) * 0.65;
					v += Math.sin(u2) * layer2Scale;
					v += Math.sin(u3) * layer3Scale;

					// normalize v to [0,1]
					v = v * 0.5 + 0.5;

					// gentle contrast curve
					const c = Math.max(
						0,
						Math.min(1, Math.pow(v, 1 / Math.max(0.0001, contrast))),
					);

					const g = Math.floor(c * 255);

					const idx = (y * W + x) * 4;
					data[idx + 0] = g;
					data[idx + 1] = g;
					data[idx + 2] = g;
					data[idx + 3] = 255;
				}
			}

			ctx.putImageData(img, 0, 0);

			raf = requestAnimationFrame(render);
		};

		raf = requestAnimationFrame(render);

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener('resize', resize);
		};
	}, [debug]);

	return (
		<div className={clsx(s.root, className)}>
			{/* fallback image beneath the debug rays */}
			<ImageByName
				name={image.name}
				className={s.image}
				title={image.title}
				alt={image.alt}
			/>
			<canvas ref={canvasRef} className={s.canvas} />
		</div>
	);
};
