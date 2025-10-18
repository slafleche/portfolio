import clsx from 'clsx';
import { getImage } from '@/lib/images';
import { useSafeId } from '../lib/dom';
import * as styles from '@/styles/components/keystone.css';
import { cardImageVars } from '@/styles/data/cardImageVars';
import type { CSSProperties } from 'react';

const VIEW_BOX = '0 0 105.29145 95.10087';
const IMAGE_WIDTH = 105.29145;
const IMAGE_HEIGHT = 95.10087;
const SILHOUETTE_PATH =
	'M31.2623.12844c-5.3064.0966-11.181.55761-18.707 2.0521-5.0052 3.9322-10.723 9.6006-11.882 11.659-.91468 1.5973-.96721 5.7352.26252 7.8652 1.2297 2.13 25.885 45.709 40.48 70.303 5.3174 9.0602 8.5494 16.949 18.663 28.489 5.908 2.3686 13.676 4.4866 16.038 4.4612 1.8407-.007 5.4505-2.0305 6.6802-4.1605s26.643-45.271 40.645-70.208c5.1876-9.1351 10.404-15.878 15.341-30.407-.90278-6.3008-2.9531-14.087-4.1563-16.12-.92598-1.5908-4.4833-3.7052-6.9427-3.7052-2.4595 0-52.527-.43757-81.124-.0951-5.2525.0375-9.9903-.22995-15.297-.13332z';
const OUTLINE_PATH =
	'M24.87883 2.14475c-3.86096.07028-8.13534.40572-13.6113 1.49311-3.6418 2.86109-7.8021 6.98544-8.64539 8.48314-.66552 1.1622-.70374 4.17296.19101 5.72275.89474 1.5498 18.83404 33.25806 29.45342 51.15276 3.86896 6.59224 6.22058 12.33216 13.57928 20.72871 4.29868 1.7234 9.95071 3.26447 11.66931 3.246 1.3393-.0051 3.96581-1.4774 4.86054-3.0272s19.38556-32.93937 29.57348-51.08364c3.77452-6.64674 7.57-11.5529 11.16217-22.12426-.65686-4.58449-2.14869-10.24976-3.02414-11.72898-.67375-1.15747-3.26207-2.69592-5.05154-2.69592-1.78954 0-38.21886-.31838-59.02616-.0692-3.82174.0273-7.26898-.1673-11.13016-.097z';

export type KeystoneProps = {
	name: string;
	alt: string;
	title?: string;
	className?: string;
	imageStyle?: CSSProperties;
};

export default function Keystone({
	name,
	alt,
	title,
	className,
	imageStyle,
}: KeystoneProps) {
	const baseId = useSafeId();
	const filterId = `${baseId}-filter`;
	const titleId = `${baseId}-title`;
	const clipId = `${baseId}-clip`;

	const label = title ?? alt;

	const image = getImage(name);

	if (!image) {
		if (process.env.NODE_ENV !== 'production') {
			console.warn(`Keystone: image "${name}" not found in manifest.`);
		}
		return null;
	}

	const { borders, shadows, image: imageVars } = cardImageVars;
	const outerShadowFilter = `drop-shadow(${shadows.outer.offsetX.css()} ${shadows.outer.offsetY.css()} ${shadows.outer.blur.css()} ${shadows.outer.color.css()})`;
	const innerColorCss = shadows.inner.color.css();
	const innerBlurValue = shadows.inner.blur.value;
	const innerOffsetXValue = shadows.inner.offsetX.value;
	const innerOffsetYValue = shadows.inner.offsetY.value;
	const strokeWidth = borders.width.value;
	const borderColorCss = borders.color.css();
	const scaledWidth = IMAGE_WIDTH * imageVars.scale;
	const scaledHeight = IMAGE_HEIGHT * imageVars.scale;

	imageVars.positionX.assertUnit('%', 'Keystone image positionX');
	imageVars.positionY.assertUnit('%', 'Keystone image positionY');
	const positionXFactor = imageVars.positionX.toPercentDecimal();
	const positionYFactor = imageVars.positionY.toPercentDecimal();
	const imageX = (IMAGE_WIDTH - scaledWidth) * positionXFactor;
	const imageY = (IMAGE_HEIGHT - scaledHeight) * positionYFactor;

	return (
		<div className={clsx(styles.root, className)}>
			<svg
				className={styles.svg}
				viewBox={VIEW_BOX}
				role="img"
				aria-labelledby={titleId}
				style={{
					filter: outerShadowFilter,
				}}
			>
				<title id={titleId}>{label}</title>
				<defs>
					<filter
						id={filterId}
						width={1.3845}
						height={1.42683}
						x={-0.11995}
						y={-0.13332}
						colorInterpolationFilters="sRGB"
					>
					<feFlood floodColor={innerColorCss} floodOpacity={1} result="flood" />
					<feGaussianBlur in="SourceGraphic" result="blur" stdDeviation={innerBlurValue} />
					<feOffset dx={innerOffsetXValue} dy={innerOffsetYValue} in="blur" result="offset" />
						<feComposite in="flood" in2="offset" operator="out" result="comp1" />
						<feComposite in="comp1" in2="SourceGraphic" operator="atop" result="fbSourceGraphic" />
						<feColorMatrix
							in="fbSourceGraphic"
							result="fbSourceGraphicAlpha"
							values="0 0 0 -1 0 0 0 0 -1 0 0 0 0 -1 0 0 0 0 1 0"
						/>
					<feFlood floodColor={innerColorCss} floodOpacity={1} result="flood" />
					<feGaussianBlur in="fbSourceGraphic" result="blur" stdDeviation={innerBlurValue} />
					<feOffset dx={innerOffsetXValue} dy={innerOffsetYValue} in="blur" result="offset" />
						<feComposite in="flood" in2="offset" operator="out" result="comp1" />
						<feComposite in="comp1" in2="fbSourceGraphic" operator="atop" result="comp2" />
					</filter>
				</defs>
				<clipPath id={clipId}>
					<path d={SILHOUETTE_PATH} transform="translate(2.13225 2.0513) scale(.7276)" />
				</clipPath>
				<image
					href={image.original.url}
					width={scaledWidth}
					height={scaledHeight}
					x={imageX}
					y={imageY}
					preserveAspectRatio="none"
					filter={`url(#${filterId})`}
					clipPath={`url(#${clipId})`}
					style={imageStyle}
				/>
				<path
					d={SILHOUETTE_PATH}
					fill="none"
					stroke={borderColorCss}
					strokeWidth={strokeWidth}
					strokeDasharray="none"
					strokeOpacity={1}
					transform="translate(2.13225 2.0513) scale(.7276)"
				/>
				<path
					d={OUTLINE_PATH}
					fill="none"
					stroke={borderColorCss}
					strokeWidth={strokeWidth}
					strokeDasharray="none"
					strokeOpacity={1}
				/>
			</svg>
		</div>
	);
}
