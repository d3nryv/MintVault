import { App } from './app';
import { envs } from './infrastructure/config/envs';

async function main(): Promise<void> {
  const app = new App();
  await app.start(envs.PORT);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
