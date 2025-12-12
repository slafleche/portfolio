import readline from 'node:readline';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { execa } from 'execa';

import debugRoutes from '../src/data/debugRoutes.json';
import {
  contactFormScenarioMap,
  type ContactFormScenarioConfig,
} from '../src/dev/scenarios/contactForm.scenarios.ts';
import { installTTYGuards, restoreTTY } from './ttyGuard.mjs';

type ScenarioOption = {
  id: string;
  label: string;
  url: string;
};

const LOCAL_BASE_ORIGIN = 'http://localhost:3000';
const CONTACT_FORM_TARGET_ID = 'contact-form';

function resolveBaseUrl(): string {
  const baseLocale = debugRoutes.baseLocale || 'en';
  return `${LOCAL_BASE_ORIGIN}/${baseLocale}`;
}

export function buildContactFormScenarioOptions(): ScenarioOption[] {
  const baseUrl = resolveBaseUrl();
  const options: ScenarioOption[] = [];

  Object.entries(contactFormScenarioMap).forEach(
    ([
      scenarioId,
      config,
    ]) => {
      const label = config.label || scenarioId;
      const url = `${baseUrl}?scenario=${encodeURIComponent(
        scenarioId,
      )}#${CONTACT_FORM_TARGET_ID}`;
      options.push({ id: scenarioId, label, url });
    },
  );

  options.sort((a, b) =>
    a.label.toLowerCase().localeCompare(b.label.toLowerCase()),
  );

  return options;
}

async function selectScenarioOption(
  options: ScenarioOption[],
): Promise<ScenarioOption | null> {
  if (!options.length) {
    console.log(
      'No scenarios are currently defined for the contact form.',
    );
    return null;
  }

  const stdin = process.stdin;
  const stdout = process.stdout;
  const isInteractive =
    Boolean(stdin?.isTTY) && typeof stdin.setRawMode === 'function';

  if (!isInteractive) {
    console.log('Available scenarios:');
    options.forEach((option, index) => {
      console.log(`  ${index + 1}. ${option.label} (${option.id})`);
    });
    const rl = readline.createInterface({
      input: stdin,
      output: stdout,
    });
    return new Promise<ScenarioOption | null>((resolve) => {
      rl.question(
        'Enter the number of the scenario to open (or press Enter to cancel): ',
        (answer) => {
          rl.close();
          const trimmed = answer.trim();
          if (!trimmed) {
            resolve(null);
            return;
          }
          const index = Number.parseInt(trimmed, 10) - 1;
          if (
            !Number.isFinite(index) ||
            index < 0 ||
            index >= options.length
          ) {
            console.log('Invalid selection; no scenario opened.');
            resolve(null);
            return;
          }
          resolve(options[index]);
        },
      );
    });
  }

  installTTYGuards();

  return new Promise<ScenarioOption | null>((resolve) => {
    let currentIndex = 0;
    const total = options.length;
    const stdinRef = stdin;

    const render = () => {
      stdout.write('\u001b[2J\u001b[0f');
      console.log('Select a contact form scenario to open:\n');
      console.log(
        'Use ↑/↓ (or j/k) to move, Enter to open, Esc to cancel.\n',
      );
      options.forEach((option, index) => {
        const isActive = index === currentIndex;
        const cursor = isActive ? '❯' : ' ';
        const radio = isActive ? '◉' : '○';
        console.log(
          ` ${cursor} ${radio} ${option.label} (${option.id})`,
        );
      });
    };

    const finish = (result: ScenarioOption | null) => {
      try {
        if (
          stdinRef.isTTY &&
          typeof stdinRef.setRawMode === 'function'
        ) {
          stdinRef.setRawMode(false);
        }
      } catch {
        // Ignore teardown errors.
      }
      restoreTTY();
      stdinRef.removeListener('data', onData);
      stdout.write('\n');
      resolve(result);
    };

    const onData = (buffer: Buffer) => {
      const key = buffer.toString('utf8');

      if (key === '\u0003') {
        // Ctrl+C
        finish(null);
        return;
      }

      if (key === '\u001b' || key === '\u001b[Z') {
        // Esc or Shift+Tab
        finish(null);
        return;
      }

      if (key === '\r' || key === '\n') {
        finish(options[currentIndex] ?? null);
        return;
      }

      if (key === 'j' || key === '\u001b[B' || key === '\u001bOB') {
        // Down arrow or "j"
        currentIndex = (currentIndex + 1 + total) % total;
        render();
        return;
      }

      if (key === 'k' || key === '\u001b[A' || key === '\u001bOA') {
        // Up arrow or "k"
        currentIndex = (currentIndex - 1 + total) % total;
        render();
        return;
      }
    };

    try {
      if (
        stdinRef.isTTY &&
        typeof stdinRef.setRawMode === 'function'
      ) {
        stdinRef.setRawMode(true);
      }
    } catch {
      // If we cannot enter raw mode, fall back to basic selection.
      stdinRef.removeListener('data', onData);
      resolve(null);
      return;
    }

    stdinRef.on('data', onData);
    render();
  });
}

export async function runScenariosCli() {
  const options = buildContactFormScenarioOptions();
  const selected = await selectScenarioOption(options);

  if (!selected) {
    return;
  }

  console.log('');
  console.log(`Opening scenario: ${selected.label}`);
  console.log(` > ${selected.url}`);
  console.log('');

  try {
    await execa(
      'open-cli',
      [
        selected.url,
      ],
      {
        stdio: 'ignore',
      },
    );
  } catch (error) {
    console.warn(
      'Failed to open the browser via open-cli. You can open the URL manually:',
    );
    console.warn(`  ${selected.url}`);
    if (error instanceof Error && error.message) {
      console.warn(`Reason: ${error.message}`);
    }
  }
}

const invokedFromCli = (() => {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return pathToFileURL(entry).href === import.meta.url;
  } catch {
    return false;
  }
})();

if (invokedFromCli) {
  runScenariosCli()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
