// Immediate feedback so the terminal does not look frozen during the
// vanilla-extract + jsdom warm-up that happens before vitest prints anything.
// vitest calls this once before any tests run.
export default function setup() {
  process.stdout.write(
    `\n→ vitest: booting (compiling vanilla-extract + setting up jsdom)...\n`,
  );
}
