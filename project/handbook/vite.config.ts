import path from 'node:path'
import process from 'node:process'
import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'
import { configDefaults } from 'vitest/config'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'
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
    plugins: [
      vue(),
      AutoImport({
        resolvers: [VantResolver()],
      }),
      Components({
        resolvers: [VantResolver()],
      }),
    ],
    build: {
      outDir: 'www',
      rollupOptions: {
        input: {
          index: 'index.html',
        },
      },
      // 将assets/images/udr目录下的图片打包为base64
      assetsInlineLimit: (file) => {
        if (file.includes('/src/assets/images/udr'))
          return true // 对该目录下的所有文件都内联为base64
        return undefined
      },
    },
    resolve: {
      alias: {
        '@': resolve('./src'),
        'mocks': resolve('./mocks'),
      },
    },
    test: {
      environment: 'happy-dom',
      setupFiles: ['./mocks/setup.ts'],
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
