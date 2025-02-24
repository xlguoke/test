## 使用
### 组件式调用
```
<template>
  <ht-modal
    v-model:open="visible"
    ref="htModalRef"
    title="标题"
    width="700px"
    :mask="false"
    :footer="false"
    tiled-level
    @cancel="cancel"
    @ok="ok"
  >

  </ht-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)

function cancel(){
  visible.value = false
}

function ok(){

}

const htModalRef = ref()
function refreshZindex(){
  htModalRef.value?.refreshZindex()
}

</script>
```
### 函数式调用
函数调用时，弹窗组件用法与组件式用法一致，唯一区别，需要加上`:after-close="onClose"`，确保关闭弹窗时销毁实例；打开弹窗的方式变化，详见示例（函数式调用需要将弹窗及内容单独提取成组件）
```
// demo.vue
<template>
  <ht-modal
    v-model:open="visible"
    title="标题"
    width="700px"
    :after-close="onClose"
    @cancel="cancel"
    @ok="onOk"
  >

  </ht-modal>
</template>

<script setup lang="ts">
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'

interface PropsParam {
  // 从父组件传入的参数，自行定义，通过 props.param 获取
}
const props = defineProps<IDialogPropsParam<null, PropsParam>>()

// 函数式调用默认值需要设为true
const visible = ref(true)

function cancel(){
  visible.value = false
}

function onOk(){
  <!-- 直接关闭弹窗 -->
  visible.value = false

  <!-- 关闭弹窗后执行回调 -->
  props.onConfirm(null)
}

```
```
// list.vue
<template>
  <a-button @click="openDialog">打开弹窗</a-button>
</template>
<script setup lang="ts">
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import Demo from './demo.vue'

async function openDialog(){
  const res = await AnyDialogHelper.showModal(Demo, {...})
  console.log('关闭弹窗时返回的参数', res)
  // 关闭弹窗后执行回调
  ...
}
</script>
```

## API
| 属性 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| v-model:open | 绑定值 | boolean | - |
| title | 表题 | string | '' |
| confirmLoading | 确定按钮loading | boolean | fase |
| draggable | 是否可拖动 | boolean | true |
| tiledLevel | 同层级显示（同时打开多个弹窗时使用，需要将mask设为false ） | boolean | false |
| loading | 加载动画 | boolean | false |
| hideConfirm | 隐藏确定按钮 | boolean | false |
| showCloseAll | 显示关闭全部按钮 | boolean | false |

说明：其它属性同a-modal，其中keyboard、maskClosable已设为false

## 插槽
| 名称 | 说明 |
| ---- | ---- |
| default | 弹窗内容 |
| footer | 底部按钮 |

## 事件
| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| cancel | 点击右上角叉或取消按钮的回调 | - |
| ok | 点击确定回调 | - |

## 通过ref调用的方法
| 方法名 | 说明 | 参数 |
| ---- | ---- | ---- |
| refreshZindex | 更新弹窗层级，使弹窗层级在最上层（弹窗处于显示状态时生效） | - |
| cancelAll | 关闭全部弹窗（showCloseAll为true时生效） | - |
