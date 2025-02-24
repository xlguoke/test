<template>
  <div class="ht-upload-dragger">
    <a-upload-dragger
      name="file"
      :multiple="true"
      :file-list="[]"
      :before-upload="beforeUpload"
      :disabled="loading"
      style="display: block; height: 105px"
    >
      <p class="ht-upload-drag-icon">
        <CloudUploadOutlined />
      </p>
      <p class="ht-upload-text">
        可以尝试将文件拖动到此区域喔~
      </p>
      <a-button type="primary" :loading="loading">
        {{ loading ? "上传中..." : "点击上传" }}
      </a-button>
    </a-upload-dragger>
  </div>
</template>

<script lang="ts" setup>
import {
  CloudUploadOutlined,
} from '@ant-design/icons-vue'
import { useCommonUpload } from './commonUpload'

const props = defineProps<{
  qrCodeKey: string
  accept?: string[] // 接受上传的文件类型
}>()

const emits = defineEmits(['load'])

const qrCodeKeyRefValue = ref(props.qrCodeKey)

watch(() => props.qrCodeKey, (val) => {
  qrCodeKeyRefValue.value = val
})

const { loading, beforeUpload } = useCommonUpload({
  qrCodeKey: qrCodeKeyRefValue,
  uploadWay: 'WEBPAGE',
  accept: props.accept,
  uploadSuccessCallback() {
    emits('load')
  },
})
</script>

<style lang="less" scoped>
.ht-upload-drag-icon {
  :deep(.anticon) {
    color: #ccc;
    font-size: 32px;
  }
}
:deep(.ant-upload) {
  &.ant-upload-drag .ant-upload{
    padding: 8px 0;
  }
}
.ht-upload-text {
  margin-top: 4px;
  font-size: 12px;
}
.ant-btn {
  margin-top: 6px;
  width: 80%;
}
</style>
