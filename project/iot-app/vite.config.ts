import path from 'node:path'
import process from 'node:process'
import { loadEnv } from 'vite'
import type { ConfigEnv, UserConfig } from 'vite'
import viewport from 'postcss-mobile-forever'
import autoprefixer from 'autoprefixer'
import { createVitePlugins } from './build/vite'
import { exclude, include } from './build/vite/optimize'

export default ({ mode }: ConfigEnv): UserConfig => {
  const root = process.cwd()
  // eslint-disable-next-line unused-imports/no-unused-vars
  const env = loadEnv(mode, root)

  return {
    base: './',
    plugins: createVitePlugins(mode),

    server: {
      host: true,
      port: 3000,
      proxy: {
        '/ilis2': {
          // target: 'http://localhost:8080/',
          target: 'http://192.168.50.194:8080/',
          // target: 'http://192.168.50.194:8089/',
          // target: 'http://192.168.50.169:8080/',
          // target: 'http://192.168.2.65/',
          // target: 'http://192.168.90.241/',
          ws: false,
          changeOrigin: true,
        },
      },
    },

    resolve: {
      alias: {
        '~@': path.join(__dirname, './src'),
        '@': path.join(__dirname, './src'),
        '~': path.join(__dirname, './src/assets'),
        '~root': path.join(__dirname, '.'),
      },
    },

    css: {
      postcss: {
        plugins: [
          autoprefixer(),
          // https://github.com/wswmsword/postcss-mobile-forever
          viewport({
            appSelector: '#app',
            viewportWidth: 375,
            // disableMobile: true,
            // disableDesktop: true,
            // enableMediaQuery: true,
            rootContainingBlockSelectorList: [
              'van-tabbar',
              'van-popup',
            ],
            border: true,
          }),
        ],
      },
    },

    build: {
      cssCodeSplit: false,
      chunkSizeWarningLimit: 2048,
    },

    optimizeDeps: { include, exclude },
  }
}
