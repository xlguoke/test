<template>
  <span>
    <ht-modal
      v-model:open="visible"
      title="列筛选"
      width="800px"
      destroy-on-close
      :confirm-loading="confirmLoading"
      @cancel="cancel"
      @ok="handleConfirm"
    >
      <IlisCustomColumnsContent
        ref="ilisCustomColumnsContentRef"
        :type="type"
      />
    </ht-modal>
    <slot :open="open">
      <a-button :icon="h(SettingOutlined)" @click="open">
        列筛选
      </a-button>
    </slot>
  </span>
</template>

<script lang="ts" setup>
import { SettingOutlined } from '@ant-design/icons-vue'

defineProps({
  /**
   * # 列筛选传递类型
   */
  type: String,
})

const emits = defineEmits<{
  (e: 'update:open', data: boolean): void
  (e: 'confirm'): void
}>()

const confirmLoading = ref(false)
const ilisCustomColumnsContentRef = ref()
const visible = ref(false)

/**
 * 打开弹窗
 */
function open() {
  visible.value = true
}

/**
 * 关闭弹窗，重置变量
 */
function cancel() {
  visible.value = false
}

/**
 * 打开弹窗时加载数据
 */
watch(() => visible.value, () => {
  emits('update:open', false)
})

/**
 * # 确认
 */
async function handleConfirm() {
  try {
    confirmLoading.value = true
    await ilisCustomColumnsContentRef.value.handleConfirm()
    emits('confirm')
    cancel()
    confirmLoading.value = false
  }
  catch (err) {
    confirmLoading.value = false
    console.error(err)
  }
}
</script>

<style scoped>
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>
