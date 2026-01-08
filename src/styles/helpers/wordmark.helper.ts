import { type IMeasurement, type IRatio, m } from 'css-calipers';

import { wordMarkVars } from '../../tokens/wordmarks.tokens';

// const spacingNorthMultiplier = 0.8;
const spacingNorth = m(10);

const getViewBox = (ratio: IRatio) => {
  return `0 0 ${ratio.numerator()} ${ratio.denominator()}`;
};

const getHeightFromWidthAndRatio = (
  width: IMeasurement,
  ratio: IRatio,
) => {
  return width
    .multiply(ratio.denominator())
    .divide(ratio.numerator())
    .round();
};

const banqHeight = getHeightFromWidthAndRatio(
  wordMarkVars.banq.size,
  wordMarkVars.banq.ratio,
);

const ccHeight = wordMarkVars.cc.size; // exception

const eaHeight = getHeightFromWidthAndRatio(
  wordMarkVars.ea.size,
  wordMarkVars.ea.ratio,
);

const hsHeight = getHeightFromWidthAndRatio(
  wordMarkVars.hs.size,
  wordMarkVars.hs.ratio,
);

const kgHeight = getHeightFromWidthAndRatio(
  wordMarkVars.kg.size,
  wordMarkVars.kg.ratio,
);

const wordMarkMeta = {
  banq: {
    ratio: wordMarkVars.banq.ratio,
    width: wordMarkVars.banq.size,
    height: banqHeight,
    viewBox: getViewBox(wordMarkVars.banq.ratio),
    spacing: {
      north: spacingNorth,
      south: banqHeight.add(spacingNorth.double()),
    },
  },
  cc: {
    ratio: wordMarkVars.cc.ratio,
    width: wordMarkVars.cc.size,
    height: ccHeight,
    viewBox: getViewBox(wordMarkVars.cc.ratio),
    spacing: {
      north: spacingNorth,
      south: ccHeight.add(spacingNorth.double()),
    },
  },
  ea: {
    ratio: wordMarkVars.ea.ratio,
    width: wordMarkVars.ea.size,
    height: eaHeight,
    viewBox: getViewBox(wordMarkVars.ea.ratio),
    spacing: {
      north: spacingNorth,
      south: eaHeight.add(spacingNorth.double()),
    },
  },
  hs: {
    ratio: wordMarkVars.hs.ratio,
    width: wordMarkVars.hs.size,
    height: hsHeight,
    viewBox: getViewBox(wordMarkVars.hs.ratio),
    spacing: {
      north: spacingNorth,
      south: hsHeight.add(spacingNorth.double()),
    },
  },
  kg: {
    ratio: wordMarkVars.kg.ratio,
    width: wordMarkVars.kg.size,
    height: kgHeight,
    viewBox: getViewBox(wordMarkVars.kg.ratio),
    spacing: {
      north: spacingNorth,
      south: kgHeight.add(spacingNorth.double()),
    },
  },
};

export default wordMarkMeta;
