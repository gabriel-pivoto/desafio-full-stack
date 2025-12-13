import { config } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';

let alreadyLoaded = false;

function findEnvPath() {
  const searchRoots = [process.cwd(), __dirname];

  for (const root of searchRoots) {
    let current = root;

    for (let depth = 0; depth < 5; depth += 1) {
      const candidate = resolve(current, '.env');

      if (existsSync(candidate)) {
        return candidate;
      }

      const parent = resolve(current, '..');
      if (parent === current) break;
      current = parent;
    }
  }

  return undefined;
}

export function loadEnv() {
  if (alreadyLoaded) return;
  alreadyLoaded = true;

  const envPath = findEnvPath();

  if (envPath) {
    config({ path: envPath });
    return;
  }

  config();
}

loadEnv();
