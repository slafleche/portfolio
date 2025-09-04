import path from 'path';
import { fileURLToPath } from 'url';
import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  webpack(config) {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
};

const withVanillaExtract = createVanillaExtractPlugin();
export default withVanillaExtract(nextConfig);
