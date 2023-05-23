import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import path from "path"
import VueSetupExtend from "vite-plugin-vue-setup-extend"
import { createHtmlPlugin } from "vite-plugin-html"
import commonjs from "rollup-plugin-commonjs"
import externalGlobals from "rollup-plugin-external-globals"

// 打包分析
import { visualizer } from "rollup-plugin-visualizer"

const isDev = process.env.NODE_ENV === "development"
const resolve = (url) => {
  return path.resolve(__dirname, url)
}
const CDN = {
  css: [`static/wangeditor-5.1.23/style.css`],
  js: isDev
    ? [`static/echarts-5.4.1/echarts.min.js`, `static/wangeditor-5.1.23/index.js`]
    : [
        "static/dayjs-1.11.7/dayjs.min.js",
        "static/dayjs-1.11.7/customParseFormat.js",
        "static/dayjs-1.11.7/weekday.js",
        "static/dayjs-1.11.7/localeData.js",
        "static/dayjs-1.11.7/weekOfYear.js",
        "static/dayjs-1.11.7/weekYear.js",
        "static/dayjs-1.11.7/advancedFormat.js",
        "static/vue-3.2.45/vue.global.prod.js",
        "static/vue-demi@0.13.7/index.iife.js",
        "static/vue-router-4.0.15/vue-router.global.js",
        "static/axios-1.2.2/axios.min.js",
        "static/echarts-5.4.1/echarts.min.js",
        "static/antd-3.2.13/antd.min.js",
        `static/wangeditor-5.1.23/index.js`
      ]
}

let _script = ``
for (let i = 0; i < CDN.css.length; i++) {
  _script += `<link rel="stylesheet" href="/${CDN.css[i]}"/>`
}
for (let i = 0; i < CDN.js.length; i++) {
  _script += `<script src="/${CDN.js[i]}"></script>`
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VueSetupExtend(),
    visualizer({
      emitFile: false,
      open: true
    }),
    createHtmlPlugin({
      minify: true,
      pages: [
        {
          entry: "/src/main.ts",
          filename: "index.html",
          template: "index.html",
          injectOptions: {
            data: {
              title: "index",
              injectScript: _script
            }
          }
        }
      ]
    })
  ],
  server: {
    host: "0.0.0.0",
    port: 5175,
    proxy: {
      "/api": {
        // target: "http://192.168.2.66", //代理地址
        target: "http://113.207.109.7:8087",
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
    }
  },
  resolve: {
    alias: {
      "@": resolve("./src")
    }
  },
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      external: ["vue", "vue-demi", "vue-router", "axios", "echarts", "ant-design-vue", "dayjs"],
      plugins: [
        commonjs(),
        externalGlobals({
          vue: "Vue",
          "vue-demi": "VueDemi",
          "vue-router": "VueRouter",
          echarts: "echarts",
          axios: "axios",
          dayjs: "dayjs",
          "ant-design-vue": "antd"
        })
      ],
      output: {
        // 静态资源分类打包
        chunkFileNames: "js/[name]-[hash].js",
        entryFileNames: "js/[name]-[hash].js",
        assetFileNames: "[ext]/[name]-[hash].[ext]",
        // 静态资源分拆打包
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return id.toString().split("node_modules/")[1].split("/")[0].toString()
          }
        }
      }
    }
  }
})
