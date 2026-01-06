import { m } from 'css-calipers';
import { footerGradientConfig } from './footer.component.tokens';
import { colorVars } from '../../tokens/global.tokens';

export const curlVars = {
  width: m(350),
  height: m(350),
  closed: {
    width: m(100),
    height: m(100),
  },
  open: {
    width: m(250),
    height: m(250),
  },
};

export const pageCurlGradientConfig = footerGradientConfig;
pageCurlGradientConfig.stops[
  pageCurlGradientConfig.stops.length - 1
].color = colorVars.transparent;
