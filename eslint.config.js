import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import sonarjs from 'eslint-plugin-sonarjs';
import globals from 'globals';

export default [
  { ignores: ['dist/**', 'coverage/**', 'example/**'] },
  js.configs.recommended,
  sonarjs.configs.recommended,
  {
    files: ['lib/**/*.ts', 'test/**/*.ts'],
    plugins: {
      '@typescript-eslint': tseslint,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
      globals: globals.node,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      'sonarjs/different-types-comparison': 'off',
    },
  },
];
