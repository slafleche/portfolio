import * as styles from '@/styles/components/contactForm.success.css';

import CircledCheckIcon from '../icons/CircledCheckIcon';
import ContactFormSubView from './ContactFormSubView';

type ContactFormSuccessProps = {
  title: string;
  description: string;
};

export default function ContactFormSuccess({
  title,
  description,
}: ContactFormSuccessProps) {
  return (
    <ContactFormSubView
      title={title}
      description={description}
      type="success"
      Icon={CircledCheckIcon}
      classNames={styles}
    />
  );
}
