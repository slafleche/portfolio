import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'yaml';
import forbiddenPropertyRule from './forbiddenPropertyRule.mjs';
import preferMeasurementShorthandRule from './preferMeasurementShorthandRule.mjs';
import ariaIdRefHelperRule from './ariaIdRefHelperRule.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const yamlPath = path.join(rootDir, 'rules.yaml');

const raw = readFileSync(yamlPath, 'utf-8');
const config = yaml.parse(raw);

const layers = config.layers ?? {};

const buildImportRule = (layerName, layerConfig) => {
  const forbidden = layerConfig.forbidden_imports ?? [];
  if (!forbidden.length) return null;
  return [
    'error',
    {
      patterns: forbidden.map((pattern) => ({
        group: [
          pattern,
        ],
        message: `${layerName} restricted import`,
      })),
    },
  ];
};

const customPlugin = {
  custom: {
    rules: {
      'forbidden-property': forbiddenPropertyRule,
      ...preferMeasurementShorthandRule,
      ...ariaIdRefHelperRule,
    },
  },
};

const buildForbiddenPropertyConfigs = (layerName, layerConfig) => {
  const entries = layerConfig.rules?.forbidden_properties ?? [];
  if (!entries.length) return [];
  return entries
    .map((entry) => {
      const normalized =
        typeof entry === 'string' ? { name: entry } : entry;
      const { name, message, allow_in: allowIn = [] } = normalized;
      if (!name) return null;
      const ruleMessage =
        message ?? `${layerName} restricted property "${name}"`;
      const allowPatterns = Array.isArray(allowIn)
        ? allowIn.filter(Boolean)
        : [
            allowIn,
          ].filter(Boolean);
      return {
        files: [
          `${layerConfig.path}/**/*.{ts,tsx}`,
        ],
        plugins: customPlugin,
        rules: {
          'custom/forbidden-property': [
            'error',
            {
              property: name,
              message: ruleMessage,
              allowPatterns,
              rootDir,
            },
          ],
        },
      };
    })
    .filter(Boolean);
};

const layerConfigs = [];

Object.entries(layers).forEach(
  ([
    layerName,
    layerConfig,
  ]) => {
    const files = [
      `${layerConfig.path}/**/*.{ts,tsx}`,
    ];
    const importRule = buildImportRule(layerName, layerConfig);
    const rules = {};
    if (importRule) {
      rules['no-restricted-imports'] = importRule;
    }
    layerConfigs.push({ files, rules });
    const propertyConfigs = buildForbiddenPropertyConfigs(
      layerName,
      layerConfig,
    );
    if (propertyConfigs?.length) {
      layerConfigs.push(...propertyConfigs);
    }
  },
);

layerConfigs.push({
  files: [
    '**/*.{ts,tsx}',
  ],
  plugins: customPlugin,
  rules: {
    'custom/prefer-m-shorthand': 'error',
  },
});

layerConfigs.push({
  files: [
    'tests/**/*.{ts,tsx}',
  ],
  plugins: customPlugin,
  rules: {
    'custom/aria-idref-helper-required': 'error',
  },
});

export default layerConfigs;
