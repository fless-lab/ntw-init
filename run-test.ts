import { execSync } from 'child_process';
import * as path from 'path';

function runTests(scope: string, name: string): void {
  if (!name) {
    console.error('Please provide a name to test, e.g., demo');
    process.exit(1);
  }

  const validScopes = ['apps', 'modules'];
  if (!validScopes.includes(scope)) {
    console.error(`Invalid scope provided. Please use one of the following: ${validScopes.join(', ')}`);
    process.exit(1);
  }

  const jestConfigPath = path.resolve(__dirname, `src/${scope}/${name}/__tests__/jest.config.ts`);

  try {
    execSync(`jest --projects ${jestConfigPath}`, { stdio: 'inherit' });
  } catch (error) {
    console.error('Error running tests:', error);
    process.exit(1);
  }
}

const args: string[] = process.argv.slice(2);
const scope: string | undefined = args[0];
const name: string | undefined = args[1];

if (scope && name) {
  runTests(scope, name);
} else {
  console.error('Usage: npm run test:dynamic <apps|modules> <name>');
  process.exit(1);
}
