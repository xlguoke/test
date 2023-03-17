## 项目运行
### 安装依赖
npm i
### 运行项目
npm run dev
### 打包
普通打包
npm run build
执行ts检查后打包
npm run build:ts 

## vscode配置
1、安装插件 ESlint、Prettier-Code formatter
2、格式化文档配置改为 Prettier-Code formatter
   可在vue页面右键，选择“使用...格式化文档”，使用Prettier为默认配置即可
3、settings.json配置
```
   {
      "editor.formatOnSave": true,
      "editor.defaultFormatter": "esbenp.prettier-vscode",
      "editor.codeActionsOnSave": {
         "source.fixAll.eslint": true,
      },
      "[vue]": {
         "editor.defaultFormatter": "esbenp.prettier-vscode"
      },
      "[javascript]": {
         "editor.defaultFormatter": "esbenp.prettier-vscode"
      },
      "[jsonc]": {
         "editor.defaultFormatter": "vscode.json-language-features"
      },
      "[typescript]": {
         "editor.defaultFormatter": "esbenp.prettier-vscode"
      },
      "editor.tabSize": 2
   }
```
