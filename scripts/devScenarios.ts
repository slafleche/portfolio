import fs from 'node:fs';
import readline from 'node:readline';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { execa } from 'execa';

import debugRoutes from '../src/data/debugRoutes.json';
import {
  contactFormScenarioMap,
} from '../src/dev/scenarios/contactForm.scenarios.ts';
import { installTTYGuards, restoreTTY } from './ttyGuard.mjs';

type ScenarioOption = {
  id: string;
  label: string;
  url: string;
};

type ScenarioState = {
  doneIds: string[];
};

const LOCAL_BASE_ORIGIN = 'http://localhost:3000';
const CONTACT_FORM_TARGET_ID = 'contact-form';
const SCENARIO_STATE_FILE = path.join(
  process.cwd(),
  'tmp',
  'contactForm.scenarios.state.json',
);

type CliFlags = {
  showAll: boolean;
  openAll: boolean;
  reset: boolean;
};

function parseCliFlags(argv: string[]): CliFlags {
  const flags: CliFlags = {
    showAll: false,
    openAll: false,
    reset: false,
  };
  for (const arg of argv) {
    if (arg === '--all') {
      flags.showAll = true;
    } else if (arg === '--open-all') {
      flags.openAll = true;
    } else if (arg === '--reset') {
      flags.reset = true;
    }
  }
  return flags;
}

function loadScenarioState(): ScenarioState {
  try {
    if (!fs.existsSync(SCENARIO_STATE_FILE)) {
      return { doneIds: [] };
    }
    const raw = fs.readFileSync(SCENARIO_STATE_FILE, 'utf8');
    const parsed = JSON.parse(raw) as unknown;
    const parsedState =
      parsed && typeof parsed === 'object'
        ? (parsed as Partial<ScenarioState>)
        : undefined;
    const doneIds = Array.isArray(parsedState?.doneIds)
      ? parsedState.doneIds.filter((id): id is string => typeof id === 'string')
      : [];
    return { doneIds };
  } catch {
    return { doneIds: [] };
  }
}

function saveScenarioState(state: ScenarioState): void {
  try {
    const dir = path.dirname(SCENARIO_STATE_FILE);
    fs.mkdirSync(dir, { recursive: true });
    const uniqueIds = Array.from(new Set(state.doneIds));
    const payload: ScenarioState = { doneIds: uniqueIds };
    fs.writeFileSync(
      SCENARIO_STATE_FILE,
      JSON.stringify(payload, null, 2),
      'utf8',
    );
  } catch {
    // Swallow persistence errors; this file is a local convenience only.
  }
}

function resetScenarioState(): void {
  try {
    if (fs.existsSync(SCENARIO_STATE_FILE)) {
      fs.unlinkSync(SCENARIO_STATE_FILE);
      console.log(
        'Contact form scenario progress reset (temporary state file removed).',
      );
    } else {
      console.log('No contact form scenario state file to reset.');
    }
  } catch (error) {
    console.warn('Failed to reset contact form scenario state file.', error);
  }
}

function markScenarioDone(id: string): void {
  const state = loadScenarioState();
  if (!state.doneIds.includes(id)) {
    state.doneIds.push(id);
    saveScenarioState(state);
  }
}

async function askMarkScenarioDone(
  selected: ScenarioOption,
): Promise<boolean> {
  const stdin = process.stdin;
  const stdout = process.stdout;

  const rl = readline.createInterface({
    input: stdin,
    output: stdout,
  });

  const question = `Mark scenario "${selected.id}" as done? (Y/n) `;

  return new Promise<boolean>((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      const trimmed = answer.trim().toLowerCase();
      if (!trimmed || trimmed === 'y' || trimmed === 'yes') {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

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

  return options;
}

async function openAllScenariosInSingleWindow(
  options: ScenarioOption[],
): Promise<boolean> {
  if (options.length === 0) return true;

  if (process.platform !== 'darwin') {
    return false;
  }

  try {
    const first = options[0];
    await execa(
      'open',
      [
        '-na',
        'Google Chrome',
        '--args',
        '--new-window',
        first.url,
      ],
      {
        stdio: 'ignore',
      },
    );

    for (const option of options.slice(1)) {
      await execa(
        'open',
        [
          '-a',
          'Google Chrome',
          option.url,
        ],
        {
          stdio: 'ignore',
        },
      );
    }

    return true;
  } catch (error) {
    console.warn(
      'Failed to open scenarios in a single Google Chrome window. Falling back to default behaviour.',
    );
    if (error instanceof Error && error.message) {
      console.warn(`Reason: ${error.message}`);
    }
    return false;
  }
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
  const flags = parseCliFlags(process.argv.slice(2));

  if (flags.reset) {
    resetScenarioState();
  }

  const allOptions = buildContactFormScenarioOptions();

  if (flags.openAll) {
    if (!allOptions.length) {
      console.log(
        'No scenarios are currently defined for the contact form.',
      );
      return;
    }

    console.log('Opening all contact form scenarios:');

    const openedInSingleWindow =
      await openAllScenariosInSingleWindow(allOptions);

    if (!openedInSingleWindow) {
      for (const option of allOptions) {
        console.log(` > ${option.label} (${option.id})`);
        console.log(`   ${option.url}`);
        try {
          await execa(
            'open-cli',
            [
              option.url,
            ],
            {
              stdio: 'ignore',
            },
          );
        } catch (error) {
          console.warn(
            'Failed to open the browser via open-cli for this scenario. You can open the URL manually:',
          );
          console.warn(`  ${option.url}`);
          if (error instanceof Error && error.message) {
            console.warn(`Reason: ${error.message}`);
          }
        }
      }
    } else {
      allOptions.forEach((option) => {
        console.log(` > ${option.label} (${option.id})`);
        console.log(`   ${option.url}`);
      });
    }

    return;
  }

  const state = loadScenarioState();

  const options =
    flags.showAll || state.doneIds.length === 0
      ? allOptions
      : allOptions.filter((option) => !state.doneIds.includes(option.id));

  if (!options.length) {
    if (allOptions.length > 0) {
      console.log(
        'All contact form scenarios are currently marked as done. Use `yarn scenarios --all` or `yarn scenarios --reset` to see them again.',
      );
    } else {
      console.log(
        'No scenarios are currently defined for the contact form.',
      );
    }
    return;
  }

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

  const markDone = await askMarkScenarioDone(selected);
  if (markDone) {
    markScenarioDone(selected.id);
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
