#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { chromium } from 'playwright';
import {
  setAdapter,
  removeAdapter,
} from '@vanilla-extract/css/adapter';
import {
  setFileScope,
  endFileScope,
} from '@vanilla-extract/css/fileScope';
import { transformCss } from '@vanilla-extract/css/transformCss';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(
  REPO_ROOT,
  'cdn',
  'media',
  'images',
  'localImageSrc',
);
const args = process.argv.slice(2);
const scaleFlagIndex = args.findIndex(
  (arg) => arg === '--scale' || arg === '--multiply',
);
const scaleValue =
  scaleFlagIndex === -1 ? '1' : args[scaleFlagIndex + 1];
const scale = Number(scaleValue);
const scaleLabel = Number.isInteger(scale)
  ? String(scale)
  : String(scale).replace('.', '_');
const scaleSuffix = scale === 1 ? '' : `@${scaleLabel}x`;
const OUTPUT_NAME = `mock-end-html${scaleSuffix}.png`;

if (!Number.isFinite(scale) || scale <= 0) {
  throw new Error(
    `Invalid scale: "${scaleValue}". Use --scale <number>.`,
  );
}

type TransformParams = Parameters<typeof transformCss>[0];

const cssObjs: TransformParams['cssObjs'] = [];
const composedClassLists: TransformParams['composedClassLists'] = [];
const localClassNames = new Set<string>();

setAdapter({
  appendCss: (css) => {
    cssObjs.push(css);
  },
  registerClassName: (className) => {
    localClassNames.add(className);
  },
  registerComposition: (composition) => {
    composedClassLists.push(composition);
  },
  markCompositionUsed: () => {},
  onEndFileScope: () => {},
  getIdentOption: () => 'debug',
});

const mockEndHtmlStylePath = path.join(
  REPO_ROOT,
  'src',
  'styles',
  'components',
  'mockEndHTML.css.ts',
);
setFileScope(mockEndHtmlStylePath);
const { default: MockEndHTML } = await import(
  '../src/components/MockEndHTML'
);
endFileScope();

const markup = renderToStaticMarkup(
  React.createElement(MockEndHTML, {
    ariaLabel: 'Mock end HTML',
  }),
);

const cssText = transformCss({
  localClassNames: Array.from(localClassNames),
  cssObjs,
  composedClassLists,
}).join('\n');

removeAdapter();

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        background: transparent;
      }
      #root {
        position: relative;
        display: inline-block;
        transform: scale(${scale});
        transform-origin: top left;
      }
      ${cssText}
    </style>
  </head>
  <body>
    <div id="root">${markup}</div>
  </body>
</html>`;

await fs.mkdir(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: {
    width: 1200,
    height: 1200,
    deviceScaleFactor: 1,
  },
});

await page.setContent(html, { waitUntil: 'load' });

const root = page.locator('#root > *').first();
await root.scrollIntoViewIfNeeded();

const box = await root.boundingBox();
if (!box) {
  await browser.close();
  throw new Error('Unable to measure MockEndHTML size.');
}

await page.setViewportSize({
  width: Math.ceil(box.width),
  height: Math.ceil(box.height),
  deviceScaleFactor: 1,
});

const squareSize = Math.min(box.width, box.height);
const clip = {
  x: Math.round(box.x),
  y: Math.round(box.y + box.height - squareSize),
  width: Math.round(squareSize),
  height: Math.round(squareSize),
};
const outputPath = path.join(OUT_DIR, OUTPUT_NAME);
await page.screenshot({
  path: outputPath,
  clip,
  omitBackground: true,
});

await browser.close();

console.log(`✅ Wrote ${outputPath}`);
