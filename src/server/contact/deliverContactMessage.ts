import type { ContactFormDraft } from '@/modules/contactForm/validation';

type DeliveryResult = {
	ok: boolean;
};

export function deliverContactMessage(
	draft: ContactFormDraft,
): Promise<DeliveryResult> {
	if (process.env.NODE_ENV !== 'production') {
		console.info('[contact][deliver][stub]', {
			email: draft.email,
			name: draft.name,
			messageLength: draft.message.length,
		});
	}

	// TODO: Integrate Brevo/SMTP once ready.
	return Promise.resolve({ ok: true });
}
