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
    { name: 'collapseGroups' },
    { name: 'removeEmptyContainers' },

    // Keep transform cleanup
    { name: 'convertTransform' },

    // Let SVGO use shorter relative path commands where it helps (remove forceAbsolutePath)
    { name: 'convertPathData' },
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
