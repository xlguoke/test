import path from 'node:path'
import process from 'node:process'
import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'
import { configDefaults } from 'vitest/config'
import { version } from './package.json'

function resolve(url) {
  return path.resolve(__dirname, url)
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const __DEV__ = mode === 'development'
  const __PROD__ = mode === 'production'
  const env = loadEnv(__PROD__ ? mode : 'development', process.cwd(), '')
  return {
    define: {
      __DEV__,
      __PROD__,
      __AUTH_BASE__: JSON.stringify(env.AUTH_BASE),
      __VERSION__: JSON.stringify(version),
    },
    publicDir: __DEV__ ? 'platforms/browser/platform_www' : 'public',
    plugins: [vue()],
    build: {
      outDir: 'www',
    },
    resolve: {
      alias: {
        '@': resolve('./src'),
        'mocks': resolve('./mocks'),
      },
    },
    test: {
      environment: 'happy-dom',
      exclude: [...configDefaults.exclude, '**/spec/**', 'e2e/**'],
      coverage: {
        provider: 'v8',
        exclude: [
          ...configDefaults.coverage.exclude,
          'platforms/**',
          'plugins/**',
          'www/**',
        ],
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: { port: 3000 },
      proxy: {
        '/ilis2': {
          target: 'http://localhost:8080/', // 代理地址
          changeOrigin: true,
        },
      },
    },
  }
})
