const { defineConfig } = require('@vue/cli-service');

const isProd = process.env.NODE_ENV === "production";

module.exports = defineConfig({
  publicPath: isProd ? "./" : "/",
  devServer: {
    proxy: "http://192.168.2.65:8080"
  },
  chainWebpack: (config) => {
    config.plugin("html").tap(() => {
      return [{
        entry: "src/main.js",
        template: "public/index.html",
        isProd: isProd
      }];
    });
  },
})
