import * as style from '@/styles/components/contactForm.loading.css';

import ContactFormSubView from './ContactFormSubView';
import PulseLoader from './PulseLoader';

type ContactFormLoadingProps = {
  title: string;
};

export default function ContactFormLoading({
  title,
}: ContactFormLoadingProps) {
  return (
    <ContactFormSubView
      title={title}
      type="loading"
      Icon={PulseLoader}
      classNames={style}
    />
  );
}
