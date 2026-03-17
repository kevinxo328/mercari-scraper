const { resolve } = require('node:path');

const project = resolve(process.cwd(), 'tsconfig.json');

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['eslint:recommended', 'turbo'],
  plugins: ['only-warn', '@typescript-eslint', 'simple-import-sort'],
  globals: {
    React: true,
    JSX: true
  },
  env: {
    node: true
  },
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
    'dist/'
  ],
  overrides: [
    {
      files: ['*.js?(x)', '*.ts?(x)'],
      rules: {
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'warn',
        'simple-import-sort/imports': 'warn',
        'simple-import-sort/exports': 'warn'
      }
    }
  ]
};
