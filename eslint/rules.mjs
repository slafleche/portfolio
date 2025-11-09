import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const yamlPath = path.join(rootDir, 'ai.yaml');

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
        group: [pattern],
        message: `${layerName} restricted import`,
      })),
    },
  ];
};

const layerConfigs = Object.entries(layers).map(([layerName, layerConfig]) => {
  const files = [`${layerConfig.path}/**/*.{ts,tsx}`];
  const importRule = buildImportRule(layerName, layerConfig);
  const rules = {};
  if (importRule) {
    rules['no-restricted-imports'] = importRule;
  }
  return { files, rules };
});

export default layerConfigs;
