const { resolve } = require('node:path');

const project = resolve(process.cwd(), 'tsconfig.json');

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:oxlint/recommended',
    'plugin:@tanstack/eslint-plugin-router/recommended',
    'plugin:turbo/recommended'
  ],
  globals: {
    React: true,
    JSX: true
  },
  env: {
    node: true,
    es6: true
  },
  plugins: ['only-warn'],
  settings: {
    'import/resolver': {
      typescript: {
        project
      }
    }
  },
  ignorePatterns: [
    // Ignore dotfiles
    '.*.js',
    'node_modules/',
    'coverage/',
    'dist/',
    'build/',
    'out/'
  ],
  overrides: [
    {
      files: ['*.js?(x)', '*.ts?(x)'],
      rules: {
        'no-unused-vars': 'off'
      }
    }
  ]
};
