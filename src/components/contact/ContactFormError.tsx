import * as s from '@/styles/components/forms.css';
import { Markdown } from '../Markdown';
import CircledPauseIcon from '../icons/CircledPauseIcon';

type ContactFormErrorProps = {
  title: string;
  description: string;
};

export default function ContactFormError({
  title,
  description,
}: ContactFormErrorProps) {
  return (
    <div className={s.successPanel} data-form="error">
      <div className={s.successIconWrapper} aria-hidden="true">
        <CircledPauseIcon className={s.failIcon} />
      </div>
      <div className={s.successCopy}>
        <h1 className={s.successHeading}>{title}</h1>
        <Markdown
          className={s.successBody}
          source={description}
          openLinksInNewTab={false}
        />
      </div>
    </div>
  );
}
