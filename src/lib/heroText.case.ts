import { m } from '@/styles/helpers/measurement';
import { heroTextVars } from '@/styles/vars/heroText.vars';

export const heroTextCheckpoints = [
	{
		time: m(0, 'ms'),
		expectations: [
			'master.opacity === 0',
			'blue.translation === { x: 0, y: -offsetY }',
			'green.translation === { x: -offsetX, y: 0 }',
			'red.translation === { x: +offsetX, y: +offsetY }',
			'allChannels.blur === blurStart',
		],
	},
	{
		time: heroTextVars.whiteReveal.fade.end,
		expectations: [
			'master.opacity === 1',
			'blue.translation ≈ { x: 0, y: 0 }',
			'green.translation ≈ { x: 0, y: 0 }',
			'red.translation ≈ { x: 0, y: 0 }',
			'allChannels.blur === 0',
			'backdrop.alpha === target alpha',
		],
	},
	{
		time: heroTextVars.settle.ghostFade.end,
		expectations: [
			'ghost.opacity === 0',
			'master.scale === 1',
		],
	},
] as const;
