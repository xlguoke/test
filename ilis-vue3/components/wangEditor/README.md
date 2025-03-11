## 使用
### 在 vue 页面中使用

#### 引用 WEditor 组件
```
<template>
  <WEditor v-model:value="details" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import WEditor from '~/components/wangEditor'

const details = ref('')

</script>
```

#### 引用 WEditorModal 组件
```
<template>
  <a-button @click="openEditorModal">编辑</a-button>

  <WEditorModal ref="editorRef" @ok="getEditorData" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { WEditorModal } from '~/components/wangEditor'

const details = ref('')
const editorRef = ref()
function openEditorModal(){
  editorRef.value.openModal({
    content: details.value,
  })
}
function getEditorData(val: string){
  details.value = val
}

</script>
```
### 在 jsp 页面中使用

jsp中使用vue组件时，无法通过props传递动态参数，所以在windw上挂载方法实现数据交互，vue组件内部方法在 window.vm 对象中，jsp页面的方法放到window上，以 vm_ + 方法名 的形式

* js中调用vue组件中的方法时， 通过 window.vm[方法名] 调用
* vue组件中调用js中的方法时， 通过 window.vm_[方法名] 调用

#### 引用 WEditor 组件
```
<%@ page import="static com.hitek.web.ScriptHelper.includeBundles" %>
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<head>
  <%
    includeBundles(out, "components/wangEditor");
  %>
</head>

<body>
  <%--  挂载节点：id不能改   --%>
  <div id="ht_wangeditor"></div>

  <script>
    initWEditor('')

    var vm_editor_value = ''
    function initWEditor(val) {
      vm_editor_value = ''
      window.vm.initEditorValue(val)
    }

    // 富文本内容变化时触发
    function vm_changeWEditor(data){
      vm_editor_value = data
    }
  </script>
</body>
```

#### 引用 WEditorModal 组件
```
<%@ page import="static com.hitek.web.ScriptHelper.includeBundles" %>
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<head>
  <%
    includeBundles(out, "components/wangEditorModal");
  %>
</head>

<body>
  <button onclick="showWEditor()">编辑文本</button>

  <%--  挂载节点：id不能改   --%>
  <div id="ht_wangeditor_modal"></div>

  <script>
    <!-- 编辑文本 -->
    function showWEditor() {
      window.vm.openEditorModal({
        title: '',
        content: ''
      })
    }

    // 点击弹窗确定按钮回调
    function vm_weditorConfirm(data){

    }
  </script>
</body>
```

## WEditor 组件API
### props
| 属性 | 必填 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ | ---- |
| v-model:value | 是 | 绑定值 | string | - |
| placeholder | 否 | 提示信息 | string | '请输入内容...' |
| height | 否 | 高度 | number | 300 |

### window.vm 挂载的方法
| 方法名 | 说明 |  参数 | 返回值 |
| ---- | ---- | ---- | ---- |
| initEditorValue | 初始化富文本值 | String: 富文本默认值，默认为空 | undefined |

### 使用 WEditor 组件的jsp页面回调
| 方法名 | 说明 |  参数 | 返回值 |
| ---- | ---- | ---- | ---- |
| vm_changeWEditor | 富文本值改变时触发 | String: 富文本中输入的内容 | undefined |

## WEditorModal 组件API
### 事件
| 事件 | 说明 | 参数 | 默认值 |
| ---- | ---- | ---- | ------ |
| ok | 点击弹窗确定按钮触发 | String: 富文本中输入的内容 | '' |
| cancel | 点击弹窗关闭按钮或右上角关闭图标触发 | String: 富文本中输入的内容 | '' |

### 方法
| 方法名 | 说明 |  参数 | 返回值 |
| ---- | ---- | ---- | ---- |
| openModal | 打开弹窗 | 详见组件 | undefined |

### window.vm 挂载的方法
| 方法名 | 说明 |  参数 | 返回值 |
| ---- | ---- | ---- | ---- |
| openEditorModal | 打开弹窗 | 详见组件 | undefined |

### 使用 WEditorModal 组件的jsp页面回调
| 方法名 | 说明 |  参数 | 返回值 |
| ---- | ---- | ---- | ---- |
| vm_weditorConfirm | 点击弹窗确定按钮触发 | String: 富文本中输入的内容 | undefined |
| vm_weditorCancel | 关闭弹窗触发 | - | undefined |
