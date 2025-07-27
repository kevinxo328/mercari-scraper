/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['@mercari-scraper/eslint-config/next.js'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true
  },
  ignorePatterns: ['node_modules', '**.config.*', '**.spec.**', 'public']
};
