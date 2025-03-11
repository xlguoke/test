<template>
  <a-modal
    v-model:open="open"
    title="管理打包参数"
    width="80%"
    centered
    :mask-closable="false"
    destroy-on-close
    @cancel="handleCancel"
  >
    <iframe
      width="100%"
      height="540px"
      :src="iframeUrl"
      frameborder="0"
    ></iframe>
    <template #footer>
      <a-button @click="handleCancel">
        关闭
      </a-button>
    </template>
  </a-modal>
</template>

<script setup lang='ts'>
import type { UseBasicInfo } from '~/views/consign/component/selectSample/modules/UseBasicInfo.ts'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(['update:open'])

// 基础信息
const useBasicInfo = inject('useBasicInfo') as UseBasicInfo

const open = computed(() => props.open)

const iframeUrl = computed(() => {
  const url = new URL('/ilis2/param-pack.do?manage', window.location.origin)
  url.searchParams.append('categoryId', useBasicInfo.data.bigCategoryId)
  return url.href
})

// 取消
const handleCancel = function () {
  emits('update:open', false)
  // 刷新打包下拉
  useBasicInfo.initParamPackOptions()
}
</script>
