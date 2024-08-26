/// <reference types="vitest" />
import path from 'node:path'
import { defineConfig } from 'vite'
import UnoCSS from 'unocss/vite'
import Vue from '@vitejs/plugin-vue'
import VueRouter from 'unplugin-vue-router/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import { unheadVueComposablesImports } from '@unhead/vue'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    VueRouter({
      dts: 'src/typed-router.d.ts',
      exclude: ['**/components/**/*.vue'],
    }),
    Vue(),
    UnoCSS(),
    AutoImport({
      imports: [
        'vue',
        '@vueuse/core',
        'vue-router',
        VueRouterAutoImports,
        unheadVueComposablesImports,
      ],
      dts: 'src/auto-imports.d.ts',
    }),
    Components({
      dirs: ['components'],
      resolvers: [
        AntDesignVueResolver({
          importStyle: false,
        }),
      ],
      dts: 'src/components.d.ts',
    }),
  ],
  test: {
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://192.168.50.194:8080',
        changeOrigin: true,
      },
      '/test': {
        target: 'http://192.168.50.194:8080',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/test/, ''),
      },
    },
  },
})
