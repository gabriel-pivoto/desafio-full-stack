import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from './vitest.config';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ['test/**/*.e2e-spec.ts'],
      environment: 'node',
      globals: true,
      setupFiles: ['./test/vitest-e2e.setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text'],
      },
    },
  }),
);
