import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
    clearMocks: true,
    coverage: {
      enabled: true,
      provider: 'v8',
      include: ['lib/**/*.ts'],
      exclude: ['lib/types.ts'],
      thresholds: {
        branches: 90,
        functions: 90,
        lines: 90,
        statements: 90,
      },
    },
  },
});
