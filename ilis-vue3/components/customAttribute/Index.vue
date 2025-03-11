<template>
  <span>
    <slot>
      <a-button :icon="h(SettingOutlined)" @click="listVisible = true">
        自定义属性配置
      </a-button>
    </slot>
    <a-modal
      v-model:open="listVisible"
      title="自定义字段配置"
      :mask-closable="false"
      :keyboard="false"
      centered
      destroy-on-close
      width="900px"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <List ref="listRef" :customize-type="customizeType" :columns-type="columnsType" />
    </a-modal>
  </span>
</template>

<script setup lang='ts'>
import { SettingOutlined } from '@ant-design/icons-vue'
import List from './components/List.vue'
import type { CustomAttributeEntity } from '.'

defineProps({
  /** 自定义属性类型 */
  customizeType: {
    type: String,
    required: true,
  },
  /** 自定义列属性 */
  columnsType: {
    type: String,
    default: '',
  },
})
const emits = defineEmits<{
  (e: 'save', data: CustomAttributeEntity[]): void
}>()

const listVisible = ref(false)
const listRef = ref()
function handleOk() {
  const list = JSON.parse(JSON.stringify(listRef.value.selectedRows))
  emits('save', list)
  handleCancel()
}
function handleCancel() {
  listVisible.value = false
}
</script>

<style>

</style>
