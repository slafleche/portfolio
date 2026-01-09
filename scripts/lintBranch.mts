import { execa } from 'execa';

const steps = [
  ['lint:base'],
  ['lint:cleanup'],
  ['lint:locales'],
  ['lint:secrets'],
  ['lint:rules'],
];

const main = async () => {
  for (const step of steps) {
    await execa('yarn', step, { stdio: 'inherit' });
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
