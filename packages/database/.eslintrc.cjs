/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['@mercari-scraper/eslint-config/library.js'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true
  },
  rules: {
    'turbo/no-undeclared-env-vars': [
      'error',
      {
        allowList: ['NODE_ENV']
      }
    ]
  },
  ignorePatterns: ['dist', 'generated', 'prisma']
};
