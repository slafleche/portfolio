const path = require('node:path');

function logStyleModule(resourcePath, rootContext) {
  if (!process.env.DEBUG_VE) return;
  const base =
    typeof rootContext === 'string' && rootContext.length > 0
      ? rootContext
      : process.cwd();
  const label = path.relative(base, resourcePath);
  console.log(`[ve] loading ${label}`);
}

module.exports = function vanillaDebugLoader(source, map, meta) {
  logStyleModule(this.resourcePath, this.rootContext);
  this.callback(null, source, map, meta);
};
