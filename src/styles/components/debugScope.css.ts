import { globalStyle } from '@vanilla-extract/css';
import { m } from 'css-calipers';

import { important } from '../helpers/important.helper';
import { margins } from '../helpers/spacing.helper';
import * as hero from './hero.css';

// The hero `main` block inherits a `layout.content` margin-bottom that
// makes sense in the real page flow but throws off any debug preview
// where the hero stands alone. Strip it on every debug page (scoped by
// the `[data-debug-scope]` attribute set on the debug layout wrapper).
globalStyle(`[data-debug-scope] .${hero.main}`, {
  ...important(margins({ bottom: m(0) })),
});

// Debug pages are never indexed, so the hero's screen-reader-only h1
// (which exists to give the production hero an accessible heading) adds
// no value here. Drop it from the rendered tree on every debug page.
globalStyle(`[data-debug-scope] h1[data-visible="sc-only"]`, {
  display: 'none !important',
});
