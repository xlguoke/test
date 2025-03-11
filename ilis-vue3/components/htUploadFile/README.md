## VUE 页面使用
```
<template>
  <HtUploadFile
    :business-type="BUSINES_TYPE.SAMPLE"
    :business-id="businessId"
    :qr-code-url="qrCodeUrl"
    :parent-key="parentKey"
    :is-reandonly="readonly"
    @init-complete="initComplete"
    @get-data="getFileData"
  />
</template>
<script lang="ts" setup>
import HtUploadFile, { BUSINES_TYPE, type UploadFileData } from '~/components/htUploadFile'

const businessId = ref('')
const qrCodeUrl = ref('')
const readonly = ref(false)
const parentKey = ref('')

// 每秒触发一次
function getFileData(data: UploadFileData){}

// 初始化完成执行
function initComplete(data: UploadFileData){}
</script>
```

## JSP 页面使用
```

```

## props
| 参数 | 必填 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- | --- |
| businessType | 是 | 业务类型，每个业务场景唯一 | `BUSINES_TYPE` | `''` |
| businessId | 是 | 业务ID，不传附件无法与业务绑定 | `string` | `''` |
| qrCodeUrl | 否 | 二维码地址 | `string` | `''` |
| parentKey | 否 | 父级key | `string` | `''` |
| isReandonly | 否 | 是否只读 | `boolean` | `false` |
| recursion | 否 | 递归查询当前二维码下所有的二维码的附件 | `boolean` | `false` |
| hideFileList | 否 | 隐藏文件列表 | `boolean` | `false` |
| forceInit | 否 | 是否强制初始化(传入此参数时，每次打开组件都是全新数据) | `boolean` | `false` |
| accept | 否 | 接受上传的文件类型 | `string[]` | - |

## 事件
| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| initComplete | 初始化完成 | `data: UploadFileData` |
| getData | 获取上传数据（每秒触发一次） | `data: UploadFileData` |
| getQrCodeKey | 附件二维码key | `data: string` |
