import type { Translator } from './helpers.locale';

export type MenuSection = {
	id: string;
	label: string;
};

export const buildHomeMenuSections = (t: Translator): MenuSection[] => [
	{
		id: t('approach-href'),
		label: t('approach'),
	},
	{
		id: t('about-href'),
		label: t('about'),
	},
	{
		id: t('case_study-href'),
		label: t('case_study'),
	},
	{
		id: t('projects-href'),
		label: t('projects'),
	},
];

export const buildSystemsMenuSections = (
	t: Translator,
): MenuSection[] => [
	{
		id: t('systems-process-href'),
		label: t('systems-process'),
	},
	{
		id: t('systems-describe-href'),
		label: t('systems-describe'),
	},
	{
		id: t('systems-express-href'),
		label: t('systems-express'),
	},
	{
		id: t('systems-integrate-href'),
		label: t('systems-integrate'),
	},
];
