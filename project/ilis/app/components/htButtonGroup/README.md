## 使用
### 组件式调用
```
<template>
  <HtButtonGroup>
    <a-button v-permission="'btn:auth1'">按钮1</a-button>
    <a-button v-permission="'btn:auth2'">按钮2</a-button>
  </HtButtonGroup>
</template>

<script setup lang="ts">
import HtButtonGroup from '~/components/htButtonGroup'

</script>
```

## API
| 属性 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| showCount | 收起时显示按钮数量 | number | 5 |
