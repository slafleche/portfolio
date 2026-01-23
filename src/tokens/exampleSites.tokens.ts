import { m, mPercent, r } from 'css-calipers';

const acerRatio = r(4151.1, 1000);
const acerWidth = m(150);

const kgRatio = r(684.9532, 463.6684);
const kgWidth = m(110);

const oracleRatio = r(231, 30);
const oracleWidth = m(200);

export const exampleSitesVars = {
  oracle: {
    width: oracleWidth,
    ratio: oracleRatio,
    offset: {},
  },
  kg: {
    width: kgWidth,
    ratio: kgRatio,
    offset: {
      bottom: mPercent(2),
    },
  },
  acer: {
    width: acerWidth,
    ratio: acerRatio,
    offset: {},
  },
};
