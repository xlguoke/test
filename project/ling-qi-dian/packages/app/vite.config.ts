import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [
    uni()
  ],
  resolve: {
    alias: {
      '@': '/src',
      '@lingqi/shared': '../shared/src'
    }
  },
  server: {
    port: 5175
  }
})
