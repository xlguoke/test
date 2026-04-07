##  使用说明
```
<template>

  <AttachmentList :datas="attachments" />

</template>

<script lang="ts" setup>
import { AttachmentList, type Attachment } from '~/components/attachmentList'

const attachments = ref<Attachment[]>([
  {
    attachmentId: '402882c18fc8579d018fc87d02110012',
    name: 'lsjdfioresjldfjsl.png',
    format: 'png',
    size: '38K',
    url: 'http://192.168.2.65:8080/fileShare/gfzx/A03/images/2024/689e3818-b8e8-4982-b68e-c2f3211865f4.png',
  },
  {
    attachmentId: '402882c18fc8579d018fc87c95fa000f',
    name: 'test.rar',
    format: 'rar',
    size: '2K',
    url: 'http://192.168.2.65:8080/fileShare/gfzx/A03/images/2024/b0a604a8-afa0-4558-9d94-c11dcf18c332.rar',
  },
  {
    attachmentId: '4028b2438f99bc00018f99cc49f20003',
    name: '长文件名称长文件名称长文件名称长文件名称长文件名称长文件名称长文件名称长文件名称长文件名称长文件名称长文件名称长文件名称长文件名称长文件名称长文件名称长文件名称长文件名称.png',
    format: 'png',
    size: '460K',
    url: 'http://192.168.2.65:8080/fileShare/gfzx/A03/images/2023/380a0279-bf90-45f9-8340-fa8edbec83ef.png',
  },
])
</script>
```

## props
| 参数 | 必填 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- | --- |
| datas | 是 | 附件列表 | `Attachment[]` | `[]` |
| listType | 否 | 显示样式 | `text`、`picture-card` | `text` |
| col | 否 | 显示列数，最大支持3列 | number | 1 |
