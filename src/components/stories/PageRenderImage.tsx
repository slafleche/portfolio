import type { CSSProperties } from 'react';

type Props = {
  src: string;
  alt: string;
  /**
   * The "real" page width the PNG represents (no scaling).
   */
  width: number;
  /**
   * Extra pixels added to the wrapper width (used to avoid Chromatic/Linux
   * scrollbar gutter clipping without shrinking the image).
   */
  wrapperPadPx?: number;
};

export const pageRenderWrapperWidth = (
  width: number,
  wrapperPadPx = 30,
) => width + wrapperPadPx;

export default function PageRenderImage({
  src,
  alt,
  width,
  wrapperPadPx = 30,
}: Props) {
  const wrapperWidth = pageRenderWrapperWidth(width, wrapperPadPx);

  const wrapperStyle: CSSProperties = {
    width: `${wrapperWidth}px`,
    maxWidth: '100%',
    overflow: 'hidden',
    margin: 0,
    padding: 0,
    background: 'transparent',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  };

  const imgStyle: CSSProperties = {
    display: 'block',
    width: `${width}px`,
    maxWidth: 'unset',
    height: 'auto',
    margin: 0,
    background: 'transparent',
    borderRadius: 0,
    flex: '0 0 auto',
  };

  return (
    <div style={wrapperStyle}>
      <img alt={alt} src={src} style={imgStyle} />
    </div>
  );
}
