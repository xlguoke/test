import antfu from '@antfu/eslint-config'

export default antfu(
  {
    typescript: true,

    // enable UnoCSS support
    // https://unocss.dev/integrations/vscode
    unocss: false,

    formatters: {
      css: true,
    },
    vue: {
      overrides: {
        'vue/html-self-closing': 'off',
        'vue/max-attributes-per-line': ['error', { singleline: 5, multiline: 1 }],
        'vue/max-len': ['error', 120],
      },
    },
  },

  {
    rules: {
      'perfectionist/sort-imports': 'off',
      'perfectionist/sort-exports': 'off',
      'perfectionist/sort-named-exports': 'off',
      'vue/block-order': [
        'error',
        { order: ['template', 'script', 'style'] },
      ],
    },
  },
  {
    ignores: [
      '.github/**',
      '.gitlab-ci.yml',
      'scripts/**',
      'node_modules/**',
      'cordova/**',
      'public/**',
    ],
  },
)
