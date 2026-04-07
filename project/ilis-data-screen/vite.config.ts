import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import path from "path"
import { createHtmlPlugin } from "vite-plugin-html"
import commonjs from "rollup-plugin-commonjs"
import legacy from "@vitejs/plugin-legacy"
import tailwindcss from "@tailwindcss/vite"
import Components from "unplugin-vue-components/vite"
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers"
// 打包分析
// import { visualizer } from "rollup-plugin-visualizer"

const resolve = (url) => {
  return path.resolve(__dirname, url)
}
const CDN = {
  css: ["font/iconfont.css"],
  js: [
    "/static/jessibuca/jessibuca.js",
    "/static/js/EasyWasmPlayer.js",
    "/static/js/ZLMRTCClient.js",
    "/static/HikvisionH5player/h5player.min.js",
    "https://api.map.baidu.com/api?v=2.0&ak=ipFT23DfcBIVVDBZoRjRClBLSX9g2aKz"
  ]
}

let _script = ``
for (let i = 0; i < CDN.css.length; i++) {
  _script += `<link rel="stylesheet" href="/${CDN.css[i]}"/>`
}
for (let i = 0; i < CDN.js.length; i++) {
  _script += `<script src="${CDN.js[i]}"></script>`
}

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    vue(),
    // visualizer({
    //   emitFile: false,
    //   open: true
    // }),
    tailwindcss(),
    Components({
      extensions: ["vue"],
      resolvers: [
        AntDesignVueResolver({
          importStyle: false // css in js
        })
      ]
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
    }),
    legacy({
      targets: ["defaults", "ie >= 11", "chrome 30"], //需要兼容的目标列表，可以设置多个
      additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
      renderLegacyChunks: true,
      polyfills: [
        "es.symbol",
        "es.array.filter",
        "es.promise",
        "es.promise.finally",
        "es/map",
        "es/set",
        "es.array.for-each",
        "es.object.define-properties",
        "es.object.define-property",
        "es.object.get-own-property-descriptor",
        "es.object.get-own-property-descriptors",
        "es.object.keys",
        "es.object.to-string",
        "web.dom-collections.for-each",
        "esnext.global-this",
        "esnext.string.match-all"
      ]
    })
  ],
  server: {
    host: "0.0.0.0",
    port: 8082,
    proxy: {
      "/ilis2": {
        // target: "http://localhost:8080",
        target: "http://192.168.2.65",
        // target: "http://192.168.50.194:8080",
        // target: "https://jc.scsgjc.com/",
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
      plugins: [commonjs()],
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
