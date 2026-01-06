import path from 'node:path';

const normalizePath = (value) =>
  value ? value.replace(/\\/g, '/') : '';

const escapeRegex = (value) =>
  value.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');

const globToRegExp = (glob) => {
  let pattern = '^';
  for (let i = 0; i < glob.length; i += 1) {
    const char = glob[i];
    if (char === '*') {
      const next = glob[i + 1];
      if (next === '*') {
        pattern += '.*';
        i += 1;
      } else {
        pattern += '[^/]*';
      }
    } else if (char === '?') {
      pattern += '.';
    } else {
      pattern += escapeRegex(char);
    }
  }
  pattern += '$';
  return new RegExp(pattern);
};

const compileMatchers = (patterns = []) => {
  const cache = new Map();
  return (filepath, relativePath) => {
    return patterns.some((pattern) => {
      if (!pattern) return false;
      const normalized = normalizePath(pattern);
      if (!cache.has(normalized)) {
        cache.set(normalized, globToRegExp(normalized));
      }
      const regex = cache.get(normalized);
      return regex.test(relativePath) || regex.test(filepath);
    });
  };
};

const getPropertyName = (node) => {
  if (!node || node.type !== 'Property') return null;
  const { key, computed } = node;
  if (!key) return null;
  if (!computed) {
    if (key.type === 'Identifier') return key.name;
    if (key.type === 'Literal' && typeof key.value === 'string')
      return key.value;
  }
  if (key.type === 'Literal' && typeof key.value === 'string') {
    return key.value;
  }
  return null;
};

const forbiddenPropertyRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Prevents usage of restricted style properties (backed by rules.yaml).',
    },
    schema: [
      {
        type: 'object',
        properties: {
          property: { type: 'string' },
          message: { type: 'string' },
          allowPatterns: {
            type: 'array',
            items: { type: 'string' },
          },
          allowValues: {
            type: 'array',
            items: { type: 'string' },
          },
          rootDir: { type: 'string' },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const option = context.options?.[0] ?? {};
    const {
      property,
      message,
      allowPatterns = [],
      allowValues = [],
      rootDir,
    } = option;
    if (!property || !rootDir) {
      return {};
    }
    const matcher = compileMatchers(allowPatterns);
    const allowedValues = new Set(allowValues);
    const projectRoot = rootDir;
    return {
      Property(node) {
        const propName = getPropertyName(node);
        if (propName !== property) return;
        if (allowedValues.size > 0) {
          const value = node.value;
          if (
            value?.type === 'Literal' &&
            typeof value.value === 'string' &&
            allowedValues.has(value.value)
          ) {
            return;
          }
          if (
            value?.type === 'TemplateLiteral' &&
            value.expressions.length === 0 &&
            value.quasis.length === 1 &&
            allowedValues.has(value.quasis[0]?.value?.cooked ?? '')
          ) {
            return;
          }
        }
        const filename = context.getFilename();
        const normalizedFile = normalizePath(filename);
        const relative = normalizePath(
          path.relative(projectRoot, filename),
        );
        const isAllowed = matcher(normalizedFile, relative);
        if (isAllowed) return;
        context.report({
          node: node.key ?? node,
          message:
            message ||
            `Restricted property "${property}" (enforced via rules.yaml).`,
        });
      },
    };
  },
};

export default forbiddenPropertyRule;
