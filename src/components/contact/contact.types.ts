import type { FormServerResponseCode } from '@/modules/contactForm/mockSubmit';

export type ToastScenarioCode = Exclude<FormServerResponseCode, 'success'>;

export type ContactFormToastDebugScenario =
	| ToastScenarioCode
	| {
			code: ToastScenarioCode;
			message?: string;
	  };
