import * as styles from '@/styles/components/contactForm.error.css';

import CircledPauseIcon from '../icons/CircledErrorIcon';
import ContactFormSubView from './ContactFormSubView';

type ContactFormErrorProps = {
  title: string;
  description: string;
};

export default function ContactFormError({
  title,
  description,
}: ContactFormErrorProps) {
  return (
    <ContactFormSubView
      title={title}
      description={description}
      type="error"
      Icon={CircledPauseIcon}
      classNames={styles}
    />
  );
}
