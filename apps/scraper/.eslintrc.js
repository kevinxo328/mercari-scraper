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
        allowList: ['NODE_ENV', 'CI', 'ANTHROPIC_API_KEY']
      }
    ]
  },
  ignorePatterns: ['node_modules', 'playwright-report', 'test-results'],
  overrides: [
    {
      // Scripts that use page.evaluate() contain browser-context code
      files: ['scripts/**/*.ts'],
      env: { browser: true, node: true, es2020: true }
    }
  ]
};
