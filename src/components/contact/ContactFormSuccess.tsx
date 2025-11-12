import * as s from '@/styles/components/contactForm.css';
import CircledCheckIcon from '../icons/CircledCheckIcon';

type ContactFormSuccessProps = {
	title: string;
	description: string;
};

export default function ContactFormSuccess({
	title,
	description,
}: ContactFormSuccessProps) {
	return (
		<div className={s.successPanel}>
			<div className={s.successIconWrapper} aria-hidden="true">
				<CircledCheckIcon className={s.successIcon} />
			</div>
			<div className={s.successCopy}>
				<h1 className={s.successHeading}>{title}</h1>
				<p className={s.successBody}>{description}</p>
			</div>
		</div>
	);
}
