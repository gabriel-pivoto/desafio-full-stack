import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from './vitest.config';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ['src/**/*.spec.ts'],
      exclude: ['src/**/*e2e-spec.ts', 'test/**/*'],
      coverage: {
        enabled: true,
        provider: 'v8',
        reporter: ['text', 'html'],
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
        include: ['src/core/**', 'src/domain/**'],
      },
    },
  }),
);
