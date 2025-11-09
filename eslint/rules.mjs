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
  const allowed = layerConfig.allowed_imports ?? [];
  if (!allowed.length) return null;
  return [
    'error',
    {
      patterns: allowed.map((pattern) => ({
        group: [pattern.startsWith('.') ? pattern : pattern],
        message: `${layerName} limited to allowed imports`,
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
