import { execa } from 'execa';

const main = async () => {
  await execa('yarn', ['lint'], { stdio: 'inherit' });
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
