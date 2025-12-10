import * as s from '@/styles/components/photo.css';
import ImageByName from '@/components/ImageByName';

export default function Photo() {
  return (
    <div className={s.photo}>
      <ImageByName
        name="portrait"
        alt="Stéphane L. Developer"
        size="md"
        className={s.photoImage}
      />
    </div>
  );
}
