import { defineConfig, loadEnv } from "vite"
import vue from "@vitejs/plugin-vue"
import path from "path"
import { createHtmlPlugin } from "vite-plugin-html"
import commonjs from "rollup-plugin-commonjs"
import externalGlobals from "rollup-plugin-external-globals"

// 打包分析
// import { visualizer } from "rollup-plugin-visualizer"

const isDev = process.env.NODE_ENV === "development"
const resolve = (url) => {
  return path.resolve(__dirname, url)
}
const CDN = {
  css: ["static/fonts/fonts.css"],
  js: isDev
    ? [`static/echarts-5.4.1/echarts.min.js`]
    : [
        `static/dayjs-1.11.7/dayjs.min.js`,
        `static/dayjs-1.11.7/customParseFormat.js`,
        `static/dayjs-1.11.7/weekday.js`,
        `static/dayjs-1.11.7/localeData.js`,
        `static/dayjs-1.11.7/weekOfYear.js`,
        `static/dayjs-1.11.7/weekYear.js`,
        `static/dayjs-1.11.7/advancedFormat.js`,
        "static/vue-3.2.45/vue.global.prod.js",
        "static/vue-router-4.0.15/vue-router.global.js",
        "static/axios-1.2.2/axios.min.js",
        "static/echarts-5.4.1/echarts.min.js",
        "static/antd-3.2.13/antd.min.js"
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
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  return {
    base: env.VITE_BASE_PATH,
    plugins: [
      vue(),
      // visualizer({
      //   emitFile: false,
      //   open: true
      // }),
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
      port: 9001,
      proxy: {
        "/portal": {
          target: "http://192.168.2.95:8099/api",
          // target: "http://113.207.109.7:8087/api",
          // target: "http://192.168.50.194:8099", //屈清 代理地址
          // target: "http://192.168.50.166:8099", //李丽峰 代理地址
          // target: "http://192.168.50.168:8099", //陪青 代理地址
          rewrite: (path) => path.replace(/^\/api/, ""),
          changeOrigin: true
        },
        "/s3": {
          target: "http://192.168.2.95:8099/api",
          changeOrigin: true
        },
        "/dash": {
          target: "https://yshjtest.ilis.cn/api",
          changeOrigin: true
        },
        "/PCweb": {
          target: "https://www.ttiis.cn",
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
      outDir: env.VITE_BUILD_OUTDIR,
      cssCodeSplit: true,
      rollupOptions: {
        external: ["vue", "vue-router", "axios", "echarts", "ant-design-vue", "dayjs"],
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
  }
})
