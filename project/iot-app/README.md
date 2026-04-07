# 海特智慧试验室 - 智慧温湿度系统

## 项目介绍

前端直接用的社区框架 ———— 一个基于 Vue 3 生态系统的移动 web 应用模板，帮助你快速完成业务开发。

[文档](https://easy-temps.github.io/easy-docs/vue3-vant-mobile/)
[交流](https://github.com/easy-temps/vue3-vant-mobile/issues/56)
[反馈](https://github.com/easy-temps/vue3-vant-mobile/issues)

## 访问地址

[网页访问] http://192.168.2.65/-/iot-app/index.html

[其他系统嵌入访问] http://192.168.2.65/-/iot-app/index.html?inEmbed=1

[安卓环境访问] http://192.168.2.65/-/iot-app/index.html?inAndroid=1

## 开发教程

1. 装有node及npm

2. 装有cordova环境（cordova-android@12.0.0）

3. npm install

4. cd ./cordova && npm install

## 使用说明

### 一. 基础说明

- npm run dev

- npm run build 打包

### 二. 强调说明

- 该项目会作为普通网页访问、在安卓系统访问和被其他系统嵌入访问，默认作为普通网页访问，在开发时，需要留意下这几者之间的逻辑，通过[/src/utils/referrer.ts]中的变量来进行控制；

### 二. 其他说明

- 由于该框架package.json中设置了[type: module]，导致cordova直接在该目录下安装时，会加载不了相关资源或插件，故将cordova相关代码安装在子目录中

- cordova打包内容仅有一个授权中心的中转页面，通过该中转页面跳转对应系统的温湿度app页面地址，所以除了有新的设备能力添加，不再需要重新用cordova打包apk
