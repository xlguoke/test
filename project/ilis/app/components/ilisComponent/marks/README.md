## 使用
```
<template>
  <IlisMarks :marks="initMarks" />
</template>

<script setup lang="ts">
import { type IlisMark, IlisMarks } from '~/components/ilisComponent'

function initMarks(): IlisMark[] {
  const marks = []
  // 处理标记相关的业务逻辑

  return marks
}
</script>
```

## API
| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| marks | 标记数据 | `IlisMark[]` | `[]` |
