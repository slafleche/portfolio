const stdin = process.stdin;
const canToggleTTY =
  Boolean(stdin?.isTTY) && typeof stdin.setRawMode === 'function';

let installed = false;
const initialRaw = canToggleTTY ? stdin.isRaw === true : null;

export function restoreTTY() {
  if (!canToggleTTY) return;

  try {
    if (stdin.isRaw !== initialRaw) {
      stdin.setRawMode(initialRaw);
    }
  } catch {
    // Ignore teardown errors when stdin is no longer available.
  }
}

export function installTTYGuards() {
  if (!canToggleTTY || installed) {
    return;
  }

  installed = true;

  const cleanAndExit = (code) => {
    restoreTTY();
    if (code !== undefined) {
      process.exit(code);
    }
  };

  process.once('exit', restoreTTY);
  process.once('SIGINT', () => cleanAndExit(130));
  process.once('SIGTERM', () => cleanAndExit(143));
  process.once('uncaughtException', (error) => {
    restoreTTY();
    throw error;
  });
  process.once('unhandledRejection', (reason) => {
    restoreTTY();
    throw reason;
  });
}
