const esc = require('@antfu/eslint-config').default

module.exports = esc(
  {
    ignores: [
      '**/lib/jasmine**',
      '**/lib/mockServiceWorker.js',
      'udr/**',
      'public/**',
      '.gitlab-ci.yml',
      'build.json',
    ],
  },
  {
    files: ['packages/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },
)
