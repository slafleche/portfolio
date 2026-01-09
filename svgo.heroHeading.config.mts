const inlineUsePathsPlugin = {
  name: 'inlineUsePaths',
  fn: (root) => {
    const idMap = new Map();

    const cloneNode = (node) => {
      if (node.type !== 'element') return node;
      return {
        ...node,
        attributes: { ...(node.attributes ?? {}) },
        children: (node.children ?? []).map(cloneNode),
      };
    };

    const collectIds = (node) => {
      if (node.type === 'root') {
        for (const child of node.children ?? []) {
          collectIds(child);
        }
        return;
      }
      if (node.type !== 'element') return;
      const id = node.attributes?.id;
      if (id) {
        idMap.set(id, node);
      }
      for (const child of node.children ?? []) {
        collectIds(child);
      }
    };

    collectIds(root);

    return {
      element: {
        enter: (node, parentNode) => {
          if (node.name !== 'use' || !parentNode) return;
          const href =
            node.attributes?.href ??
            node.attributes?.['xlink:href'];
          if (!href || !href.startsWith('#')) return;
          const refNode = idMap.get(href.slice(1));
          if (!refNode || refNode.type !== 'element') return;

          const cloned = cloneNode(refNode);
          const mergedAttributes = {
            ...(cloned.attributes ?? {}),
          };

          const excludedKeys = new Set([
            'href',
            'xlink:href',
            'x',
            'y',
            'id',
          ]);
          for (const [key, value] of Object.entries(
            node.attributes ?? {},
          )) {
            if (!excludedKeys.has(key)) {
              mergedAttributes[key] = value;
            }
          }

          const x = node.attributes?.x;
          const y = node.attributes?.y;
          const refTransform = refNode.attributes?.transform;
          const useTransform = node.attributes?.transform;
          const transforms = [];
          if (refTransform) transforms.push(refTransform);
          if (x || y) {
            transforms.push(
              `translate(${x ?? 0} ${y ?? 0})`,
            );
          }
          if (useTransform) transforms.push(useTransform);
          if (transforms.length) {
            mergedAttributes.transform = transforms.join(' ');
          }

          delete mergedAttributes.id;
          cloned.attributes = mergedAttributes;

          const parentChildren = parentNode.children ?? [];
          const index = parentChildren.indexOf(node);
          if (index !== -1) {
            parentChildren.splice(index, 1, cloned);
          }
        },
      },
    };
  },
};

const stripDefsPlugin = {
  name: 'stripDefs',
  fn: () => ({
    element: {
      enter: (node, parentNode) => {
        if (!parentNode || node.name !== 'defs') return;
        const parentChildren = parentNode.children ?? [];
        const index = parentChildren.indexOf(node);
        if (index !== -1) {
          parentChildren.splice(index, 1);
        }
      },
    },
  }),
};

const stripIdsPlugin = {
  name: 'stripIds',
  fn: () => ({
    element: {
      enter: (node) => {
        if (node.attributes?.id) {
          delete node.attributes.id;
        }
      },
    },
  }),
};

const stripPaintAttrsPlugin = {
  name: 'stripPaintAttrs',
  fn: () => ({
    element: {
      enter: (node) => {
        if (!node.attributes) return;
        if (node.name === 'svg') return;

        delete node.attributes.fill;
        delete node.attributes.stroke;
        delete node.attributes['fill-opacity'];
        delete node.attributes['stroke-opacity'];

        if (node.attributes.style) {
          let style = node.attributes.style;
          style = style.replace(
            /fill(?:-opacity)?:\s*[^;]+;?/g,
            '',
          );
          style = style.replace(
            /stroke(?:-opacity)?:\s*[^;]+;?/g,
            '',
          );
          node.attributes.style = style.trim();
          if (!node.attributes.style) {
            delete node.attributes.style;
          }
        }
      },
    },
  }),
};

const removeFullRectPathPlugin = {
  name: 'removeFullRectPath',
  fn: () => {
    let viewBox = null;
    const parseViewBox = (value) => {
      const parts = value
        .trim()
        .split(/[\s,]+/g)
        .map((entry) => Number(entry));
      if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) {
        return null;
      }
      return {
        x: parts[0],
        y: parts[1],
        width: parts[2],
        height: parts[3],
      };
    };
    const approxEqual = (a, b) => Math.abs(a - b) < 0.01;
    const fullRectPattern =
      /^M0 0h([0-9.+-]+)v([0-9.+-]+)H0Z(?:m0 0)?$/i;

    return {
      element: {
        enter: (node, parentNode) => {
          if (node.name === 'svg') {
            const value = node.attributes?.viewBox;
            viewBox = value ? parseViewBox(value) : null;
            return;
          }
          if (!parentNode || node.name !== 'path') return;
          const d = node.attributes?.d;
          if (!d || !viewBox) return;
          const match = d.replace(/\s+/g, ' ').match(fullRectPattern);
          if (!match) return;
          const width = Number(match[1]);
          const height = Number(match[2]);
          if (
            approxEqual(viewBox.x, 0) &&
            approxEqual(viewBox.y, 0) &&
            approxEqual(viewBox.width, width) &&
            approxEqual(viewBox.height, height)
          ) {
            const parentChildren = parentNode.children ?? [];
            const index = parentChildren.indexOf(node);
            if (index !== -1) {
              parentChildren.splice(index, 1);
            }
          }
        },
      },
    };
  },
};

const rootCurrentColorPlugin = {
  name: 'rootCurrentColor',
  fn: (root) => {
    const svg = root.children?.find(
      (child) => child.type === 'element' && child.name === 'svg',
    );
    if (!svg) return {};
    svg.attributes ??= {};
    svg.attributes.fill = 'currentColor';
    delete svg.attributes['fill-opacity'];
    return {};
  },
};

export default {
  multipass: true,
  floatPrecision: 5,
  plugins: [
    inlineUsePathsPlugin,
    stripDefsPlugin,
    stripIdsPlugin,
    stripPaintAttrsPlugin,
    removeFullRectPathPlugin,
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false,
          cleanupIds: false,
        },
      },
    },
    { name: 'cleanupAttrs' },
    { name: 'collapseGroups' },
    { name: 'mergePaths' },
    { name: 'convertShapeToPath' },
    { name: 'removeEmptyContainers' },
    { name: 'removeTitle' },
    { name: 'removeDesc' },
    { name: 'removeMetadata' },
    { name: 'removeEditorsNSData' },
    { name: 'removeXlink' },
    { name: 'removeXMLNS' },
    { name: 'removeDimensions' },
    { name: 'convertTransform' },
    { name: 'convertPathData' },
    { name: 'removeUselessDefs' },
    { name: 'removeHiddenElems' },
    { name: 'removeUnknownsAndDefaults' },
    { name: 'removeUselessStrokeAndFill' },
    { name: 'removeEmptyAttrs' },
    { name: 'removeEmptyText' },
    {
      name: 'cleanupNumericValues',
      params: { floatPrecision: 2 },
    },
    { name: 'convertStyleToAttrs' },
    rootCurrentColorPlugin,
  ],
};
