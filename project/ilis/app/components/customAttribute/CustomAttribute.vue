<template>
  <span>
    <span @click="listVisible = true">
      <slot>
        <a-button>自定义属性配置</a-button>
      </slot>
    </span>
    <ht-modal
      v-model:open="listVisible"
      title="自定义属性配置"
      destroy-on-close
      width="70%"
      fixed-height
      hide-confirm
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <List
        ref="listRef"
        :customize-type="customizeType"
        :columns-type="columnsType"
        :show-blind-col="showBlindCol"
        :show-pre-consign-col="showPreConsignCol"
      />
    </ht-modal>
  </span>
</template>

<script setup lang='ts'>
import type { CustomAttributeEntity } from '.'
import List from './components/List.vue'

defineProps({
  /** 自定义属性类型 */
  customizeType: {
    type: String,
    required: true,
  },
  /** 自定义列属性：获取全部列，用于新增自定义属性时判断重复数据，与列筛选属性一致 */
  columnsType: {
    type: String,
    default: '',
  },
  /** 显示是否盲样 */
  showBlindCol: {
    type: Boolean,
    default: false,
  },
  /** 显示应用到预委托 */
  showPreConsignCol: {
    type: Boolean,
    default: false,
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
