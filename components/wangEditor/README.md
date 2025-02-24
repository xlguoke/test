## 使用
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

## API
| 属性 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| v-model:value | 绑定值 | string | - |
| placeholder | 提示信息 | string | '请输入内容...' |
| height | 高度 | number | 300 |
