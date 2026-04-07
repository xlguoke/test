import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import path from "path"

import Components from "unplugin-vue-components/vite"
import { VantResolver } from "unplugin-vue-components/resolvers"
import postcsspxtorem from "postcss-pxtorem"
import tailwindcss from "tailwindcss"
import tailwindcssConfig from "./tailwind.config"

// 打包分析
// import { visualizer } from "rollup-plugin-visualizer"

const isDev = process.env.NODE_ENV === "development"
const resolve = (url) => {
  return path.resolve(__dirname, url)
}

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    vue(),
    Components({
      resolvers: [VantResolver()]
    })

    // visualizer({
    //   emitFile: false,
    //   open: true
    // }),
  ],
  server: {
    host: "0.0.0.0",
    port: 8082,
    proxy: {
      "/ilis2": {
        target: "http://localhost:8080",
        // target: "http://192.168.50.194:8080",
        // target: "http://192.168.2.65",
        changeOrigin: true
      }
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          hack: 'true; @import "@/assets/style/theme.less"'
        },
        javascriptEnabled: true
      }
    },
    postcss: {
      plugins: [
        tailwindcss(tailwindcssConfig),
        postcsspxtorem({
          rootValue({ file }) {
            if (file.indexOf("vant") !== -1) {
              return 34.7
            } else {
              return 100
            }
          },
          propList: ["*"]
          // exclude: ["commandCenterScreen"]
        })
      ]
    }
  },
  resolve: {
    alias: {
      "@": resolve("./src")
    }
  }
})
