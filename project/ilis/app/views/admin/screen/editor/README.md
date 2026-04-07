## 画布组件扩展说明
1. 在widgets目录下新建文件夹，文件夹的名称或作为画布组件（widget）的注册名称
2. 文件夹内必须要有index.ts文件，默认导出一个符合[IWidget](/app/interface/IWidget.ts)接口的对象
3. 自行实现该widget的预览组件、渲染组件、表单组件

注*：建议组件使用异步组件
