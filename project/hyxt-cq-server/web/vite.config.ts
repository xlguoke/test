import { defineConfig, loadEnv } from "vite"
import vue from "@vitejs/plugin-vue"
import path from "path"
import VueSetupExtend from "vite-plugin-vue-setup-extend"
import { createHtmlPlugin } from "vite-plugin-html"
import Components from "unplugin-vue-components/vite"
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers"

// 打包分析
// import { visualizer } from "rollup-plugin-visualizer"

const isDev = process.env.NODE_ENV === "development"
const resolve = (url) => {
  return path.resolve(__dirname, url)
}

const CDN = {
  css: [
    `static/iconfont/iconfont.css`,
    `static/fonts/fonts.css`,
    `static/wangeditor-5.1.23/style.css`
  ],
  js: !isDev ? [`static/wangeditor-5.1.23/index.js`] : [`static/wangeditor-5.1.23/index.js`]
}

let _script = ``
for (let i = 0; i < CDN.css.length; i++) {
  _script += `<link rel="stylesheet" href="/${CDN.css[i]}"/>`
}
for (let i = 0; i < CDN.js.length; i++) {
  _script += `<script src="/${CDN.js[i]}"></script>`
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  return {
    base: env.VITE_BASE_PATH,
    plugins: [
      vue(),
      Components({
        resolvers: [AntDesignVueResolver()]
      }),
      VueSetupExtend(),
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
      port: 9000,
      host: "0.0.0.0",
      proxy: {
        "/api": {
          target: "http://192.168.2.95:8099/", // 测试
          // target: "http://113.207.109.7:8087", // 生产
          // target: "http://192.168.50.168:8099", //陪青 代理地址
          changeOrigin: true, //开启跨域
          // rewrite: (path) => path.replace(/^\/api/, "") // 连接本地服务时需要
        },
        "/PCWeb": {
          target: "https://www.ttiis.cn", //代理地址
          changeOrigin: true //开启跨域
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
      outDir: env.VITE_BUILD_OUTDIR,
      rollupOptions: {
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
