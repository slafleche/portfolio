import { type IMeasurement, type IRatio, m } from 'css-calipers';

import { wordMarkVars } from '../../tokens/wordmarks.tokens';

const spacingNorth = m(15);

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
    path: 'M174.68 453.72c.093.292-.022.546-.64.655C42 477.758 95.505 336.515 56.868 239.258a39.863 39.863 0 0 1-35.068-71.59c20.805-10.026 43.825-1.39 63.813 28.47 38.287 57.198 31.832 225.808 89.067 257.58zm510.273-259.336a37.72 37.72 0 0 1-50.638 35.528c-35.758 102.72 31.59 262.237-126.95 221.038-170.257-44.243-260.478-9.192-260.478-9.192 13.18-20.625 78.437-41.804 167.123-39.355 94.703 3.394 149.238 45.476 163.646-46.82q.953-5.01 1.71-10.282c-19.17 29.876-57.794 40.462-74.036 11.747-3.95-6.98-7.012-15.972-9.137-26.187-9.9 21.1-26.83 44.93-52.46 43.496-16.264-.902-21.586-12.258-20.993-36.64.414-17.005 1.242-49.356 1.88-65.73 1.798-45.945-25.298-33.087-29.452-.99-1.662 12.856-1.522 83.14-.73 104.05-43.026 6.806-50.274-5.272-51.217-35.096-24.292 64.836-65.355 64.62-76.964 21.46-6.934 28.92-25.55 57.258-43.918 57.258-29.656 0-58.924-48.793-107.233-172.242 122.997-26.542 243.247-94.56 246.678-155.385A48.81 48.81 0 1 1 330.47.38c26.132-3.53 51.19 17.797 59.23 52.832a110.52 110.52 0 0 1 2.23 22.04q.003 3.43-.205 6.86c-4.223 51.374-48.344 131.616-205.756 194.002 28.846 51.32 48.874 89.35 65.177 82.808 9.396-3.777 9.544-21.855 7.12-90.37a306.423 306.423 0 0 1 54.557-29.696c0 80.434 5.985 108.844 19.238 99.418 10.62-7.555 11.194-31.098 10.96-68.16-.577-29.746-1.866-46.52-1.866-46.52 31.076-30.647 52.25-30.143 52.448 8.486 23.79-81.16 83.296-60.286 79.71 13.483-3.58 73.727-1.793 87.875 4.532 87.875 8.58 0 15.832-15.45 14.953-31.602h.01c-1.574-40.992 8.786-88.553 33.31-109.452 34.296-29.218 62.898-2.05 73.58 14.11.443-1.172.93-2.317 1.4-3.47 23.285-52.43 53.197-51.128 70.86-37.12a37.698 37.698 0 0 1 12.993 28.48zm-92.83 38.21c-2.754-9.15-19.867-26.03-36.516-9.67-18.96 18.63-21.03 75.662-13.542 93.416 7.023 16.65 33.2 14.043 40.902-6.113 2.004-25.418 3.676-52.523 9.156-77.632z',
    spacing: {
      north: spacingNorth,
      south: kgHeight.add(spacingNorth.double()),
    },
  },
};

export default wordMarkMeta;
