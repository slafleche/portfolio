import * as s from '@/styles/components/messageCentre.css';

import PulseLoader from './PulseLoader';

type ContactFormLoadingProps = {
  message: string;
};

export default function ContactFormLoading({
  message,
}: ContactFormLoadingProps) {
  return (
    <div
      className={s.statusWrapper}
      role="status"
      aria-live="polite"
      data-form="loading"
    >
      <div className={s.status}>
        <PulseLoader 
          className={s.loader}
        />        
        <span className={s.statusText}>{message}</span>
      </div>
    </div>
  );
}
