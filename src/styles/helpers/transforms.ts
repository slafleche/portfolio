import type * as CSS from 'csstype';
import { hasCss, toCssMeasurement } from './style';

type AngleInput =
	| number
	| string
	| { css(): string }
	| {
			negation?: (shouldNegate?: boolean) => unknown;
	  }
	| null
	| undefined;
type LengthInput =
	| Parameters<typeof toCssMeasurement>[0]
	| string
	| null
	| undefined;
type ScaleInput = number | string | null | undefined;

type TokenState = { negate: boolean };

export interface TransformToken {
	value(): string | undefined;
	when(condition: boolean): TransformToken;
	negate(condition?: boolean): TransformToken;
	map(mapper: (value: string) => string | undefined): TransformToken;
	toString(): string;
}

type TransformFragment =
	| string
	| number
	| TransformToken
	| undefined
	| null
	| false;
type TransformPiece = TransformFragment | TransformFragment[];

type TransformStyle = Pick<
	CSS.Properties<string | number>,
	'transform'
>;

const SIMPLE_NUMERIC_PATTERN = /^([+-]?)(\d*\.?\d+)([a-z%]*)$/i;

const isToken = (value: unknown): value is TransformToken =>
	typeof value === 'object' &&
	value !== null &&
	typeof (value as TransformToken).value === 'function';

const normalizeFragments = (pieces: TransformPiece[]): string[] => {
	const fragments: Array<string | undefined> = [];

	const push = (piece: TransformPiece) => {
		if (Array.isArray(piece)) {
			piece.forEach(push);
			return;
		}

		if (piece === null || piece === undefined || piece === false) {
			return;
		}

		if (isToken(piece)) {
			const value = piece.value();
			if (value) fragments.push(value);
			return;
		}

		const stringified =
			typeof piece === 'string' ? piece : String(piece);
		fragments.push(stringified);
	};

	pieces.forEach(push);

	return fragments
		.map((fragment) => fragment?.trim() ?? '')
		.filter((fragment) => fragment.length > 0);
};

const buildTransformValue = (
	...pieces: TransformPiece[]
): string | undefined => {
	const parts = normalizeFragments(pieces);
	return parts.length ? parts.join(' ') : undefined;
};

const toggleNumericString = (value: string): string => {
	const trimmed = value.trim();
	const match = trimmed.match(SIMPLE_NUMERIC_PATTERN);
	if (!match) {
		return trimmed.startsWith('-') ? trimmed.slice(1) : `-${trimmed}`;
	}
	const [
		,
		sign,
		magnitude,
		unit,
	] = match;
	if (sign === '-') return `${magnitude}${unit}`;
	if (sign === '+') return `-${magnitude}${unit}`;
	return `-${magnitude}${unit}`;
};

const negateString = (value: string, allowCalc = false): string => {
	const toggled = toggleNumericString(value);
	if (toggled !== value.trim()) return toggled;
	return allowCalc ? `calc(-1 * (${value}))` : toggled;
};

const isNegatableObject = (
	value: unknown,
): value is {
	negation: (shouldNegate?: boolean) => unknown;
} =>
	typeof value === 'object' &&
	value !== null &&
	'negation' in (value as Record<string, unknown>) &&
	typeof (value as Record<string, unknown>).negation === 'function';

const negateAngleInput = (
	value: AngleInput,
	shouldNegate: boolean,
): AngleInput => {
	if (!shouldNegate || value === null || value === undefined)
		return value;
	if (typeof value === 'number') return -value as AngleInput;
	if (typeof value === 'string')
		return negateString(value, true) as AngleInput;
	if (isNegatableObject(value)) return value.negation() as AngleInput;
	if (hasCss(value)) {
		const cssValue = value.css();
		return negateString(cssValue, true) as unknown as AngleInput;
	}
	return value;
};

const negateLengthInput = (
	value: LengthInput,
	shouldNegate: boolean,
): LengthInput => {
	if (!shouldNegate || value === null || value === undefined)
		return value;
	if (typeof value === 'number') return -value as LengthInput;
	if (typeof value === 'string')
		return negateString(value, true) as LengthInput;
	if (isNegatableObject(value))
		return value.negation() as LengthInput;
	if (hasCss(value)) {
		const cssValue = value.css();
		return negateString(cssValue, true) as unknown as LengthInput;
	}
	return value;
};

const negateScaleInput = (
	value: ScaleInput,
	shouldNegate: boolean,
): ScaleInput => {
	if (!shouldNegate || value === null || value === undefined)
		return value;
	if (typeof value === 'number') return -value as ScaleInput;
	if (typeof value === 'string')
		return negateString(value, false) as ScaleInput;
	return value;
};

const createToken = <Input>(
	input: Input,
	resolver: (input: Input, state: TokenState) => string | undefined,
): TransformToken => {
	let active = true;
	let negateFlag = false;
	let mapper: ((value: string) => string | undefined) | undefined;

	const compute = () => {
		if (!active) return undefined;
		const base = resolver(input, {
			negate: negateFlag,
		});
		if (!base) return undefined;
		return mapper ? (mapper(base) ?? undefined) : base;
	};

	const token: TransformToken = {
		value: compute,
		when(condition: boolean) {
			active = condition;
			return this;
		},
		negate(condition = true) {
			negateFlag = condition;
			return this;
		},
		map(fn) {
			mapper = fn;
			return this;
		},
		toString() {
			return compute() ?? '';
		},
	};

	return token;
};

const makeAngleToken =
	(fn: string) =>
	(value: AngleInput): TransformToken =>
		createToken(value, (input, state) => {
			const normalized = toCssAngle(
				negateAngleInput(input, state.negate),
			);
			return normalized ? `${fn}(${normalized})` : undefined;
		});

const makeLengthToken =
	(fn: string) =>
	(value: LengthInput): TransformToken =>
		createToken(value, (input, state) => {
			const length = toCssLength(
				negateLengthInput(input, state.negate),
			);
			return length ? `${fn}(${length})` : undefined;
		});

const makeScaleToken =
	(fn: string) =>
	(value: ScaleInput): TransformToken =>
		createToken(value, (input, state) => {
			const scale = toCssScale(negateScaleInput(input, state.negate));
			return scale ? `${fn}(${scale})` : undefined;
		});

const toCssAngle = (value: AngleInput): string | undefined => {
	if (value === null || value === undefined) return undefined;
	if (typeof value === 'number' && Number.isFinite(value))
		return `${value}deg`;
	if (typeof value === 'string') return value;
	if (hasCss(value)) return value.css();
	return undefined;
};

const toCssLength = (value: LengthInput): string | undefined => {
	if (value === null || value === undefined) return undefined;
	return toCssMeasurement(
		value as Parameters<typeof toCssMeasurement>[0],
	);
};

const toCssScale = (value: ScaleInput): string | undefined => {
	if (value === null || value === undefined) return undefined;
	if (typeof value === 'number' && Number.isFinite(value))
		return value.toString();
	if (typeof value === 'string') return value;
	return undefined;
};

interface TransformBuilder {
	(...pieces: TransformPiece[]): TransformStyle;
	value: (
		...pieces: TransformPiece[]
	) => CSS.Property.Transform | undefined;
	rotate: (value: AngleInput) => TransformToken;
	rotateX: (value: AngleInput) => TransformToken;
	rotateY: (value: AngleInput) => TransformToken;
	rotateZ: (value: AngleInput) => TransformToken;
	skewX: (value: AngleInput) => TransformToken;
	skewY: (value: AngleInput) => TransformToken;
	translateX: (value: LengthInput) => TransformToken;
	translateY: (value: LengthInput) => TransformToken;
	translateZ: (value: LengthInput) => TransformToken;
	translate: (x: LengthInput, y?: LengthInput) => TransformToken;
	translate3d: (
		x: LengthInput,
		y: LengthInput,
		z: LengthInput,
	) => TransformToken;
	scale: (value: ScaleInput) => TransformToken;
	scaleX: (value: ScaleInput) => TransformToken;
	scaleY: (value: ScaleInput) => TransformToken;
	scaleZ: (value: ScaleInput) => TransformToken;
	scale3d: (
		x: ScaleInput,
		y: ScaleInput,
		z: ScaleInput,
	) => TransformToken;
	perspective: (value: LengthInput) => TransformToken;
	style: (...pieces: TransformPiece[]) => TransformStyle;
}

const transforms = ((...pieces: TransformPiece[]) => {
	const transform = buildTransformValue(...pieces);
	return transform ? { transform } : {};
}) as TransformBuilder;

transforms.value = (...pieces) => buildTransformValue(...pieces);

transforms.rotate = makeAngleToken('rotate');
transforms.rotateX = makeAngleToken('rotateX');
transforms.rotateY = makeAngleToken('rotateY');
transforms.rotateZ = makeAngleToken('rotateZ');
transforms.skewX = makeAngleToken('skewX');
transforms.skewY = makeAngleToken('skewY');

transforms.translateX = makeLengthToken('translateX');
transforms.translateY = makeLengthToken('translateY');
transforms.translateZ = makeLengthToken('translateZ');

transforms.translate = (x, y) =>
	createToken({ x, y }, (input, state) => {
		const xVal = toCssLength(
			negateLengthInput(input.x, state.negate),
		);
		if (!xVal) return undefined;
		const yVal = toCssLength(
			negateLengthInput(input.y, state.negate),
		);
		return yVal
			? `translate(${xVal}, ${yVal})`
			: `translate(${xVal})`;
	});

transforms.translate3d = (x, y, z) =>
	createToken({ x, y, z }, (input, state) => {
		const xVal = toCssLength(
			negateLengthInput(input.x, state.negate),
		);
		const yVal = toCssLength(
			negateLengthInput(input.y, state.negate),
		);
		const zVal = toCssLength(
			negateLengthInput(input.z, state.negate),
		);
		if (!xVal || !yVal || !zVal) return undefined;
		return `translate3d(${xVal}, ${yVal}, ${zVal})`;
	});

transforms.scale = makeScaleToken('scale');
transforms.scaleX = makeScaleToken('scaleX');
transforms.scaleY = makeScaleToken('scaleY');
transforms.scaleZ = makeScaleToken('scaleZ');

transforms.scale3d = (x, y, z) =>
	createToken({ x, y, z }, (input, state) => {
		const xVal = toCssScale(negateScaleInput(input.x, state.negate));
		const yVal = toCssScale(negateScaleInput(input.y, state.negate));
		const zVal = toCssScale(negateScaleInput(input.z, state.negate));
		if (!xVal || !yVal || !zVal) return undefined;
		return `scale3d(${xVal}, ${yVal}, ${zVal})`;
	});

transforms.perspective = (value) =>
	createToken(value, (input, state) => {
		const length = toCssLength(
			negateLengthInput(input, state.negate),
		);
		return length ? `perspective(${length})` : undefined;
	});

transforms.style = (...pieces) => transforms(...pieces);

export type { TransformPiece };
export default transforms;
