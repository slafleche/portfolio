import type * as CSS from 'csstype';

declare module 'csstype' {
  interface Properties {
    maskAttachment?: CSS.Property.MaskAttachment;
    WebkitMaskAttachment?: CSS.Property.WebkitMaskAttachment;
    WebkitBackdropFilter?: CSS.Property.WebkitBackdropFilter;
  }
}
