export default {
  multipass: true,
  floatPrecision: 5,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false,
          cleanupIds: false,
        },
      },
    },
    {
      name: 'cleanupIds',
      params: {
        remove: true,
        minify: true,
      },
    },
    { name: 'cleanupAttrs' },
    { name: 'collapseGroups' },
    { name: 'convertUseToGroup' },
    { name: 'mergePaths' },
    { name: 'convertShapeToPath' },
    { name: 'removeEmptyContainers' },
    { name: 'removeTitle' },
    { name: 'removeDesc' },
    { name: 'removeMetadata' },
    { name: 'removeEditorsNSData' },

    // Apply transforms into path data so group translates are baked in.
    {
      name: 'applyTransforms',
      params: { applyTransformsStroked: true },
    },
    { name: 'convertTransform' },

    // Let SVGO use shorter relative path commands where it helps (remove forceAbsolutePath).
    {
      name: 'convertPathData',
      params: {
        applyTransforms: true,
        applyTransformsStroked: true,
      },
    },
    { name: 'removeUselessDefs' },
    { name: 'removeHiddenElems' },
    {
      name: 'removeUnknownsAndDefaults',
    },
    {
      name: 'removeUselessStrokeAndFill',
    },
    { name: 'removeEmptyAttrs' },
    { name: 'removeEmptyText' },
    {
      name: 'cleanupNumericValues',
      params: { floatPrecision: 2 },
    },
  ],
};
